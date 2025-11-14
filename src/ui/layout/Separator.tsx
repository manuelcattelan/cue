import { Text, useStdout } from "ink";

export const Separator = () => {
  const { stdout } = useStdout();

  return <Text>{"─".repeat(stdout.columns)}</Text>;
};
