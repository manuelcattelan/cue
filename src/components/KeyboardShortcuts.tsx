import { text } from "../lib/colors.js";
import { Box, Text } from "ink";

export const KeyboardShortcuts = () => {
  return (
    <Box marginLeft={2}>
      <Text>
        {text("arrows: ", "muted")}
        {text("navigate", "mutedAccent")}
        {text(" • ", "mutedDimmed")}
      </Text>
      <Text>
        {text("enter: ", "muted")}
        {text("new line", "mutedAccent")}
        {text(" • ", "mutedDimmed")}
      </Text>
      <Text>
        {text("ctrl+d: ", "muted")}
        {text("submit", "mutedAccent")}
        {text(" • ", "mutedDimmed")}
      </Text>
      <Text>
        {text("ctrl+y: ", "muted")}
        {text("copy prompt", "mutedAccent")}
        {text(" • ", "mutedDimmed")}
      </Text>
      <Text>
        {text("ctrl+c/esc: ", "muted")}
        {text("quit", "mutedAccent")}
      </Text>
    </Box>
  );
};
