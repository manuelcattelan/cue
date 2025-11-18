export const colorPalette = {
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#cbd5e1",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
} as const;

export const semanticColors = {
  muted: colorPalette.gray[500],
  mutedDimmed: colorPalette.gray[700],
  mutedAccent: colorPalette.gray[300],
};
