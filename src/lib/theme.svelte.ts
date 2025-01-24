type Themes = 'system' | 'light' | 'dark';

const localStorageKey = 'theme';

const themes: Record<Themes, Themes> = {
  system: 'system',
  light: 'light',
  dark: 'dark'
};

// Create validator function
const isValidTheme = (theme: string): theme is Themes => {
  return Object.values(themes).includes(theme as Themes);
};

// Create state, getter, setter functions
let theme = $state();

export const getTheme = () => theme;

const setTheme = (newTheme: string) => {
  console.log('setting theme', newTheme);
  if (!isValidTheme(newTheme)) {
    console.error('Invalid theme: ', newTheme);
    return;
  }

  theme = newTheme as Themes;
};

export const setThemeFromPreference = () => {
  // Set initial theme
  // document.documentElement.dataset.theme =
  //   localStorage.getItem(localStorageKey) === themes.dark ||
  //   (!(localStorageKey in localStorage) &&
  //     window.matchMedia(`(prefers-color-scheme: ${themes.dark})`).matches)
  //     ? themes.dark
  //     : themes.light;

  // Listen for system theme changes
  window
    .matchMedia(`(prefers-color-scheme: ${themes.dark})`)
    .addEventListener('change', setThemeFromPreference);
};

export const watchTheme = () => {
  const initialTheme =
    localStorage.getItem('theme') ||
    (!('theme' in localStorage) && window.matchMedia(`(prefers-color-scheme: dark)`).matches)
      ? 'dark'
      : 'light';

  setTheme(initialTheme);
};

export const toggleTheme = () => {
  theme = theme.system;
};
