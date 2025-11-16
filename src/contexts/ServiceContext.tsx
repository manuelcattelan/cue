import type { Services } from "../services/index.js";
import { createContext, useContext, type ReactNode } from "react";

const ServiceContext = createContext<Services | undefined>(undefined);

type ServiceProviderProps = {
  services: Services;
  children: ReactNode;
};

export const ServiceProvider = ({
  services,
  children,
}: ServiceProviderProps) => {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = (): Services => {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error("useServices must be used within ServiceProvider");
  }

  return context;
};
