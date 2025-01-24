type ThemeColor = 'light' | 'dark';
type ThemePreference = 'system' | ThemeColor;

const localStorageKey = 'theme';

// State to track both system preference and actual color
let preference = $state<ThemePreference>('system');
let activeColor = $state<ThemeColor>('light');

// Validator function
const isValidPreference = (theme: string): theme is ThemePreference => {
  return ['system', 'light', 'dark'].includes(theme);
};

// Update active color based on system preference
const updateSystemColor = () => {
  if (preference === 'system') {
    activeColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = activeColor;
  }
};

// Set theme with validation
const setTheme = (newPreference: ThemePreference) => {
  if (!isValidPreference(newPreference)) {
    console.error('Invalid theme: ', newPreference);
    return;
  }

  preference = newPreference;

  if (newPreference === 'system') {
    updateSystemColor();
    localStorage.removeItem(localStorageKey);
  } else {
    activeColor = newPreference;
    localStorage.setItem(localStorageKey, newPreference);
  }

  document.documentElement.dataset.theme = activeColor;
};

export const setupTheme = () => {
  // Set up system theme change listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSystemColor);

  // Check localStorage first
  const stored = localStorage.getItem(localStorageKey) as ThemePreference | null;

  if (stored && isValidPreference(stored)) {
    setTheme(stored);
  } else {
    // No localStorage value, use system preference
    setTheme('system');
  }
};

export const toggleTheme = () => {
  if (preference === 'system') {
    // If currently using system, switch to opposite of active color
    setTheme(activeColor === 'dark' ? 'light' : 'dark');
  } else if (preference === 'dark') {
    setTheme('light');
  } else {
    // If light, go back to system
    setTheme('system');
  }
};

export const getNextTheme = (): ThemePreference | undefined => {
  if (preference === 'system') {
    // If currently using system, next will be opposite of active color
    return activeColor === 'dark' ? 'light' : 'dark';
  } else if (preference === 'dark') {
    return 'light';
  } else {
    // If light, next will be system
    return 'system';
  }
};
