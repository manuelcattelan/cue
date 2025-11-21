import dotenv from "dotenv";
import * as z from "zod";

export type Config = {
  providerAPIKey: string;
};

const ConfigSchema: z.ZodType<Config> = z.object({
  providerAPIKey: z.string().min(1),
});

export const loadConfig = (): Config => {
  dotenv.config({ quiet: true });

  return ConfigSchema.parse({
    providerAPIKey: process.env.CUE_PROVIDER_API_KEY,
  });
};
