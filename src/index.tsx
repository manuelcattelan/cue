import { Conversation } from "./components/Conversation.js";
import { ServiceProvider } from "./contexts/ServiceContext.js";
import { SessionProvider } from "./contexts/SessionContext.js";
import { loadConfig } from "./lib/config.js";
import { loadServices } from "./services/index.js";
import { render } from "ink";

const config = loadConfig();
const services = loadServices(config);

const Main = () => {
  return (
    <ServiceProvider services={services}>
      <SessionProvider>
        <Conversation />
      </SessionProvider>
    </ServiceProvider>
  );
};

render(<Main />);
