import type { Config } from "../lib/config.js";
import type { ProviderService } from "./provider.js";
import { loadProviderService } from "./provider.js";

export type Services = {
  providerService: ProviderService;
};

export const loadServices = (config: Config): Services => {
  return {
    providerService: loadProviderService(config),
  };
};
