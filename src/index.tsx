import { Conversation } from "./components/Conversation.js";
import { SessionProvider } from "./contexts/SessionContext.js";
import { initConfig } from "./lib/config.js";
import { render } from "ink";

initConfig();

const Main = () => {
  return (
    <SessionProvider>
      <Conversation />
    </SessionProvider>
  );
};

render(<Main />);
