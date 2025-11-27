import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_KEY = 'livezen-theme';

export function initializeTheme() {
    // Get stored theme or default to light
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const theme = storedTheme || 'light';

    applyTheme(theme);
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;

    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function useAppearance() {
    const [theme, setTheme] = useState<Theme>(() => {
        // Get stored theme or default to light
        const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
        return storedTheme || 'light';
    });

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return {
        theme,
        setTheme,
        toggleTheme,
    };
}
