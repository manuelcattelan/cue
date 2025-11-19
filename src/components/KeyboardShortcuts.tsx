import { semanticColors } from "../lib/colors.js";
import chalk from "chalk";
import { Box, Text } from "ink";

const INPUT_SHORTCUTS = [
  { shortcut: "arrows", description: "navigate" },
  { shortcut: "enter", description: "new line" },
  { shortcut: "ctrl+d", description: "submit" },
  { shortcut: "ctrl+y", description: "copy prompt" },
  { shortcut: "esc", description: "quit" },
];

export const KeyboardShortcuts = () => {
  return (
    <Box marginLeft={2}>
      {INPUT_SHORTCUTS.map((shortcut, index) => (
        <Text key={shortcut.shortcut}>
          {chalk.hex(semanticColors.muted)(`${shortcut.shortcut}: `)}
          {chalk.hex(semanticColors.mutedAccent)(shortcut.description)}
          {index < INPUT_SHORTCUTS.length - 1 &&
            chalk.hex(semanticColors.mutedDimmed)(" • ")}
        </Text>
      ))}
    </Box>
  );
};
