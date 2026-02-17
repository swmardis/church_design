import { useEffect } from 'react';
import { useSettings } from './use-settings';

export function useTheme() {
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    // Helper to set CSS variable if value exists
    const setVar = (key: string, cssVar: string) => {
      const setting = settings.find(s => s.key === key);
      if (setting?.value) {
        root.style.setProperty(cssVar, String(setting.value));
      }
    };

    setVar('primary_color', '--primary');
    setVar('secondary_color', '--secondary');
    
    // New Theme Variables
    setVar('menu_bg_color', '--menu-bg');
    setVar('menu_text_color', '--menu-text');
    setVar('site_bg_color', '--site-bg');
    setVar('site_text_color', '--site-text');
    
    // Fonts
    const fontSetting = settings.find(s => s.key === 'site_font');
    if (fontSetting?.value) {
      root.style.setProperty('--font-sans', String(fontSetting.value));
      root.style.setProperty('--font-display', String(fontSetting.value)); // Simplified for now
    }

  }, [settings]);
}
