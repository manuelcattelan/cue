import chalk from "chalk";

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

export function text(
  text: string,
  textColor: keyof typeof semanticColors,
): string;

export function text(
  text: string,
  textColor: keyof typeof colorPalette,
  textShade: keyof (typeof colorPalette)[keyof typeof colorPalette],
): string;

export function text(
  text: string,
  textColor: keyof typeof colorPalette | keyof typeof semanticColors,
  textShade?: keyof (typeof colorPalette)[keyof typeof colorPalette],
): string {
  if (textColor in semanticColors) {
    return chalk.hex(semanticColors[textColor as keyof typeof semanticColors])(
      text,
    );
  }

  const color = textColor as keyof typeof colorPalette;
  const colorShade = textShade as keyof (typeof colorPalette)[typeof color];

  return chalk.hex(colorPalette[color][colorShade])(text);
}
