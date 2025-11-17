import { Box, Text } from "ink";

export const HelpText = () => {
  return (
    <Box marginLeft={2}>
      <Text color="gray">
        arrows: <Text color="white">navigate</Text>
        <Text dimColor> • </Text>
      </Text>
      <Text color="gray">
        enter: <Text color="white">new line</Text>
        <Text dimColor> • </Text>
      </Text>
      <Text color="gray">
        ctrl+d: <Text color="white">submit</Text>
        <Text dimColor> • </Text>
      </Text>
      <Text color="gray">
        ctrl+y: <Text color="white">copy prompt</Text>
        <Text dimColor> • </Text>
      </Text>
      <Text color="gray">
        ctrl+c/esc: <Text color="white">quit</Text>
      </Text>
    </Box>
  );
};
