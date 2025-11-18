import { text } from "../../lib/colors.js";
import { Text, useStdout } from "ink";

export const Separator = () => {
  const { stdout } = useStdout();

  return <Text>{text("─".repeat(stdout.columns), "muted")}</Text>;
};
