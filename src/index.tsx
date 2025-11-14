import { initConfig } from "./lib/config.js";
import { TextInput } from "./ui/input/TextInput.js";
import { TextInputHelper } from "./ui/input/TextInputHelper.js";
import { Separator } from "./ui/layout/Separator.js";
import { Box, render } from "ink";

initConfig();

const Main = () => {
  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        <Separator />
        <TextInput />
        <Separator />
      </Box>
      <TextInputHelper />
    </Box>
  );
};

render(<Main />);
