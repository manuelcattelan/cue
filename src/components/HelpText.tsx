import { Box, Text } from "ink";

export const HelpText = () => {
  return (
    <Box marginLeft={2}>
      <Text>
        {"arrows: navigate • "}
        {"enter: new line • "}
        {"ctrl+d: submit • "}
        {"ctrl+y: copy prompt • "}
        {"ctrl+c/esc: quit"}
      </Text>
    </Box>
  );
};
