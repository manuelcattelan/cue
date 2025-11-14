import { Box, Text } from "ink";

export const TextInputHelper = () => {
  return (
    <Box marginLeft={2}>
      <Text>
        {"arrows: navigate • "}
        {"enter: newline • "}
        {"ctrl+d: submit • "}
        {"ctrl+c/esc: quit"}
      </Text>
    </Box>
  );
};
