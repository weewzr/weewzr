/**
 * Case-study tabs, as progressive enhancement of the unmodified page.
 *
 * The page ships every section in authored order with the tab bar hidden. This classic (not module)
 * script is inlined right after the content by src/pages/projects/[slug].astro, so it runs before the
 * first paint. It moves the sections named in the tab configuration into one panel per tab, keeps the
 * pinned and unlisted sections below the tabs, and turns the bar into a WAI-ARIA tablist (automatic
 * activation, roving tabindex, arrow keys, Home and End). A link or address that names a heading in
 * another panel opens that panel. If anything is missing it changes nothing and the bar stays hidden.
 */
(function () {
  var wrap = document.querySelector('[data-case-tabs]');
  if (!wrap) return;
  var prose = wrap.querySelector('.case-prose');
  var bar = wrap.querySelector('[data-case-tabs-bar]');
  var cfg;
  try {
    cfg = JSON.parse(wrap.getAttribute('data-config') || '{}');
  } catch (e) {
    return;
  }
  if (!prose || !bar || !cfg.tabs) return;

  var tabOf = {};
  cfg.tabs.forEach(function (t) {
    t.headings.forEach(function (h) {
      tabOf[h] = t.id;
    });
  });
  var pinned = {};
  (cfg.pinned || []).forEach(function (h) {
    pinned[h] = true;
  });

  // Split the top-level elements into an intro and one block per h2.
  var intro = [];
  var blocks = [];
  Array.prototype.slice.call(prose.children).forEach(function (node) {
    if (node.tagName === 'H2') blocks.push({ heading: node.textContent.trim(), nodes: [node] });
    else if (blocks.length) blocks[blocks.length - 1].nodes.push(node);
    else intro.push(node);
  });

  var buttons = Array.prototype.slice.call(bar.querySelectorAll('button[data-tab]'));
  var groups = buttons.map(function (btn) {
    var id = btn.getAttribute('data-tab');
    var nodes = [];
    blocks.forEach(function (b) {
      if (tabOf[b.heading] === id && !pinned[b.heading]) nodes = nodes.concat(b.nodes);
    });
    return nodes;
  });
  if (buttons.length < 2 || groups.some(function (g) { return !g.length; })) return;

  var group = document.createElement('div');
  group.className = 'case-tabs';
  var panels = buttons.map(function (btn, i) {
    var panel = document.createElement('section');
    panel.className = 'case-tab-panel';
    panel.id = 'tab-' + btn.getAttribute('data-tab');
    panel.setAttribute('data-tab-panel', btn.getAttribute('data-tab'));
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', btn.id);
    // The first element of a panel is a heading, which is not focusable, so the panel is the tab stop.
    panel.tabIndex = 0;
    groups[i].forEach(function (n) {
      panel.appendChild(n);
    });
    group.appendChild(panel);
    return panel;
  });
  var restNodes = [];
  blocks.forEach(function (b) {
    if (pinned[b.heading] || !tabOf[b.heading]) restNodes = restNodes.concat(b.nodes);
  });
  prose.appendChild(group);
  if (restNodes.length) {
    var rest = document.createElement('div');
    rest.className = 'case-pinned';
    restNodes.forEach(function (n) {
      rest.appendChild(n);
    });
    prose.appendChild(rest);
  }

  bar.setAttribute('role', 'tablist');
  bar.setAttribute('aria-label', 'Case study sections');
  buttons.forEach(function (btn) {
    btn.setAttribute('role', 'tab');
  });

  var current = -1;
  function select(index, focus, updateHash) {
    buttons.forEach(function (btn, i) {
      var on = i === index;
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    current = index;
    if (focus) buttons[index].focus();
    if (updateHash) {
      try {
        history.replaceState(null, '', '#' + panels[index].id);
      } catch (e) {
        /* The address bar update is a convenience only. */
      }
    }
  }

  function openFromHash() {
    var id = '';
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch (e) {
      return;
    }
    var target = id ? document.getElementById(id) : null;
    if (!target || !prose.contains(target)) return;
    var panel = target.closest('[data-tab-panel]');
    var index = panel ? panels.indexOf(panel) : -1;
    if (index < 0) return;
    if (index !== current) select(index, false, false);
    target.scrollIntoView();
  }

  buttons.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      select(i, false, true);
    });
    btn.addEventListener('keydown', function (event) {
      var last = buttons.length - 1;
      var next = -1;
      if (event.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (event.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = last;
      if (next < 0) return;
      event.preventDefault();
      select(next, true, true);
    });
  });

  select(0, false, false);
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  wrap.setAttribute('data-ready', '');
})();
