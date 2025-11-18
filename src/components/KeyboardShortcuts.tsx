import { semanticColors } from "../lib/colors.js";
import chalk from "chalk";
import { Box, Text } from "ink";

export const KeyboardShortcuts = () => {
  return (
    <Box marginLeft={2}>
      <Text>
        {chalk.hex(semanticColors.muted)("arrows: ")}
        {chalk.hex(semanticColors.mutedAccent)("navigate")}
        {chalk.hex(semanticColors.mutedDimmed)(" • ")}
      </Text>
      <Text>
        {chalk.hex(semanticColors.muted)("enter: ")}
        {chalk.hex(semanticColors.mutedAccent)("new line")}
        {chalk.hex(semanticColors.mutedDimmed)(" • ")}
      </Text>
      <Text>
        {chalk.hex(semanticColors.muted)("ctrl+d: ")}
        {chalk.hex(semanticColors.mutedAccent)("submit")}
        {chalk.hex(semanticColors.mutedDimmed)(" • ")}
      </Text>
      <Text>
        {chalk.hex(semanticColors.muted)("ctrl+y: ")}
        {chalk.hex(semanticColors.mutedAccent)("copy prompt")}
        {chalk.hex(semanticColors.mutedDimmed)(" • ")}
      </Text>
      <Text>
        {chalk.hex(semanticColors.muted)("esc: ")}
        {chalk.hex(semanticColors.mutedAccent)("quit")}
      </Text>
    </Box>
  );
};
