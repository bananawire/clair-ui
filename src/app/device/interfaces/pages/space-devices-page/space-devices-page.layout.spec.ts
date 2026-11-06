import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Space & Devices layout CSS contracts', () => {
  const pageCss = readFileSync(resolve(__dirname, './space-devices-page.component.css'), 'utf8');
  const panelCss = readFileSync(
    resolve(__dirname, '../../components/organizations-panel/organizations-panel.component.css'),
    'utf8',
  );
  const barCss = readFileSync(
    resolve(__dirname, '../../components/organizations-bar/organizations-bar.component.css'),
    'utf8',
  );

  it('docks the organizations panel and scrolls only the detail pane on desktop', () => {
    expect(pageCss).toContain(':host {');
    expect(pageCss).toContain('overflow: hidden; /* contain children; do not grow shell scroll */');
    expect(pageCss).toContain('display: block; /* STOP using display:contents */');
    expect(pageCss).toContain('overflow-y: auto; /* THIS is the only page scrollport on desktop */');
    expect(pageCss).not.toContain('.page-layout');
    expect(pageCss).not.toContain('display: contents');
  });

  it('restores a real host box for organizations-panel', () => {
    expect(panelCss).toContain('display: block; /* was display:contents — restore a real box on desktop */');
    expect(panelCss).not.toContain('display: contents');
  });

  it('makes org-list the internal scroller and fills the 280px host width', () => {
    expect(barCss).toContain('width: 100%; /* fill the 280px host; avoid double-counting width */');
    expect(barCss).toContain('overflow: auto; /* internal scroll for long org/space lists */');
    expect(barCss).toContain('min-height: 0;');
  });
});
