import { initConfig } from "./lib/config.js";
import { TextInput } from "./ui/TextInput.js";
import { render } from "ink";

initConfig();

const Main = () => {
  return <TextInput />;
};

render(<Main />);
