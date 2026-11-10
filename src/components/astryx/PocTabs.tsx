/**
 * Proof of concept only: an Astryx TabList island that switches four server-rendered panels.
 * The panels are plain HTML from the Astro page. This island only renders the tab strip and
 * toggles the `hidden` attribute on the panels, so the content exists without JavaScript.
 */
import { useEffect, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '../../styles/astryx-celestial.css';

export interface PocTab {
  value: string;
  label: string;
}

export default function PocTabs({ tabs }: { tabs: PocTab[] }) {
  const [value, setValue] = useState(tabs[0]?.value ?? '');

  useEffect(() => {
    for (const t of tabs) {
      const panel = document.getElementById(`poc-panel-${t.value}`);
      if (panel) panel.hidden = t.value !== value;
    }
  }, [value, tabs]);

  useEffect(() => {
    // Hydration marker used by the measurement script.
    (window as unknown as { __pocHydratedAt?: number }).__pocHydratedAt = performance.now();
    document.documentElement.setAttribute('data-poc-hydrated', 'true');
  }, []);

  // The Theme wrapper uses display: contents, which an IntersectionObserver cannot observe, so
  // client:visible never fires without a real box around it. This div supplies one.
  return (
    <div className="poc-box">
      <Theme theme={neutralTheme}>
        <TabList value={value} onChange={setValue} role="tablist" hasDivider>
          {tabs.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} panelId={`poc-panel-${t.value}`} />
          ))}
        </TabList>
      </Theme>
    </div>
  );
}
