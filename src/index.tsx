import { Conversation } from "./components/Conversation.js";
import { NotificationProvider } from "./contexts/NotificationContext.js";
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
      <NotificationProvider>
        <SessionProvider>
          <Conversation />
        </SessionProvider>
      </NotificationProvider>
    </ServiceProvider>
  );
};

render(<Main />);
