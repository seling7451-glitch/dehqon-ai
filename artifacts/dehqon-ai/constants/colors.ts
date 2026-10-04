/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#16352a',
    tint: '#2f7d4b',

    // Core surfaces
    background: '#f6f8f1',
    foreground: '#16352a',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#16352a',

    // Primary action color (buttons, links, active states)
    primary: '#2f7d4b',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#e6efe2',
    secondaryForeground: '#275839',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#edf2e9',
    mutedForeground: '#66766a',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#f6d36b',
    accentForeground: '#614b08',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    success: '#2f7d4b',
    successSoft: '#dff0df',
    warning: '#c9851b',
    warningSoft: '#fff0c8',
    primarySoft: '#e5f1e5',
    inkSoft: '#5c6f61',
    earth: '#8a5b38',

    // Borders and input outlines
    border: '#dce7da',
    input: '#dce7da',
  },

  dark: {
    text: '#eef6e9',
    tint: '#8fd19f',
    background: '#102117',
    foreground: '#eef6e9',
    card: '#183021',
    cardForeground: '#eef6e9',
    primary: '#8fd19f',
    primaryForeground: '#102117',
    secondary: '#243d2c',
    secondaryForeground: '#dcebdc',
    muted: '#203628',
    mutedForeground: '#a4b7a7',
    accent: '#f6d36b',
    accentForeground: '#3f3108',
    destructive: '#ff857d',
    destructiveForeground: '#3f1513',
    success: '#8fd19f',
    successSoft: '#24452d',
    warning: '#f0b95c',
    warningSoft: '#4b3b16',
    primarySoft: '#24452d',
    inkSoft: '#b5c5b7',
    earth: '#c08b5e',
    border: '#2a4933',
    input: '#2a4933',
  },

  radius: 16,
};

export default colors;
