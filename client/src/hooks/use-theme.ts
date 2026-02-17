import { useEffect } from 'react';
import { useSettings } from './use-settings';

export function useTheme() {
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!settings || !Array.isArray(settings)) return;

    const getVal = (key: string) => {
      const s = settings.find((s: any) => s.key === key);
      return s ? String(s.value) : null;
    };

    const root = document.documentElement;

    const menuBg = getVal('menu_bg_color');
    const menuText = getVal('menu_text_color');
    const siteBg = getVal('site_bg_color');
    const siteText = getVal('site_text_color');
    const fontFamily = getVal('font_family');

    if (menuBg) root.style.setProperty('--menu-bg', menuBg);
    if (menuText) root.style.setProperty('--menu-text', menuText);
    if (siteBg) root.style.setProperty('--site-bg', siteBg);
    if (siteText) root.style.setProperty('--site-text', siteText);

    if (fontFamily) {
      root.style.setProperty('--font-sans', `'${fontFamily}', sans-serif`);
      root.style.setProperty('--font-display', `'${fontFamily}', sans-serif`);
    }
  }, [settings]);
}
