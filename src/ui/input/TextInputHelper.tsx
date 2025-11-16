import { Box, Text } from "ink";

export const TextInputHelper = () => {
  return (
    <Box marginLeft={2}>
      <Text>
        {"arrows: navigate • "}
        {"enter: new line • "}
        {"ctrl+d: submit • "}
        {"ctrl+c/esc: quit"}
      </Text>
    </Box>
  );
};
