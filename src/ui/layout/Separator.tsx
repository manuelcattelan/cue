import { Text, useStdout } from "ink";

export const Separator = () => {
  const { stdout } = useStdout();

  return <Text color="gray">{"─".repeat(stdout.columns)}</Text>;
};
