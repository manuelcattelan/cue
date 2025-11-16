import { initConfig } from "./lib/config.js";
import { TextInput } from "./ui/input/TextInput.js";
import { TextInputHelper } from "./ui/input/TextInputHelper.js";
import { Box, render } from "ink";

initConfig();

const Main = () => {
  return (
    <Box flexDirection="column">
      <TextInput />
      <TextInputHelper />
    </Box>
  );
};

render(<Main />);
