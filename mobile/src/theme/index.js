export const colors = {
    // Primary palette
    primary: '#6C63FF',
    primaryLight: '#8B85FF',
    primaryDark: '#4F46E5',

    // Background
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceLight: '#252540',
    surfaceElevated: '#2D2D4A',

    // Text
    text: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textMuted: '#6B6B80',

    // Accent
    accent: '#00D4AA',
    accentLight: '#33DDBB',

    // Status
    error: '#FF4757',
    errorLight: '#FF6B7A',
    success: '#2ED573',
    warning: '#FFA502',

    // Chat bubbles
    userBubble: '#6C63FF',
    assistantBubble: '#1E1E35',

    // Border
    border: '#2A2A45',
    borderLight: '#3A3A55',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
};

export const fonts = {
    regular: { fontSize: 14, color: colors.text },
    medium: { fontSize: 16, color: colors.text, fontWeight: '500' },
    large: { fontSize: 18, color: colors.text, fontWeight: '600' },
    title: { fontSize: 24, color: colors.text, fontWeight: '700' },
    hero: { fontSize: 32, color: colors.text, fontWeight: '800' },
    small: { fontSize: 12, color: colors.textSecondary },
    caption: { fontSize: 11, color: colors.textMuted },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 50,
};

export default { colors, fonts, spacing, borderRadius };
