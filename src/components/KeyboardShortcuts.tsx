import { semanticColors } from "../lib/colors.js";
import chalk from "chalk";
import { Box, Text } from "ink";
import type { FC } from "react";

type KeyboardShortcut = {
  shortcut: string;
  description: string;
};

const INPUT_SHORTCUTS: KeyboardShortcut[] = [
  { shortcut: "arrows", description: "navigate" },
  { shortcut: "enter", description: "new line" },
  { shortcut: "ctrl+d", description: "submit" },
  { shortcut: "ctrl+y", description: "copy prompt" },
  { shortcut: "esc", description: "quit" },
];

const QUESTIONS_SHORTCUTS: KeyboardShortcut[] = [
  { shortcut: "tab", description: "next" },
  { shortcut: "shift+tab", description: "previous" },
  { shortcut: "ctrl+d", description: "submit" },
  { shortcut: "esc", description: "quit" },
];

export enum KeyboardShortcutsView {
  Input = "input",
  Questions = "questions",
}

type KeyboardShortcutsProps = {
  view: KeyboardShortcutsView;
};

export const KeyboardShortcuts: FC<KeyboardShortcutsProps> = ({ view }) => {
  const shortcuts =
    view === KeyboardShortcutsView.Input
      ? INPUT_SHORTCUTS
      : QUESTIONS_SHORTCUTS;

  return (
    <Box marginLeft={2}>
      {shortcuts.map((shortcut, index) => (
        <Text key={shortcut.shortcut}>
          {chalk.hex(semanticColors.muted)(`${shortcut.shortcut}: `)}
          {chalk.hex(semanticColors.mutedAccent)(shortcut.description)}
          {index < shortcuts.length - 1 &&
            chalk.hex(semanticColors.mutedDimmed)(" • ")}
        </Text>
      ))}
    </Box>
  );
};
