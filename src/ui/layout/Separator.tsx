import { semanticColors } from "../../lib/colors.js";
import chalk from "chalk";
import { Text, useStdout } from "ink";

export const Separator = () => {
  const { stdout } = useStdout();

  return (
    <Text>{chalk.hex(semanticColors.muted)("─".repeat(stdout.columns))}</Text>
  );
};
