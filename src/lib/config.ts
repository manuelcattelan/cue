import dotenv from "dotenv";
import * as z from "zod";

export type Config = {
  apiKey: string;
};

const ConfigSchema: z.ZodType<Config> = z.object({
  apiKey: z.string().min(1),
});

export const loadConfig = (): Config => {
  dotenv.config();

  return ConfigSchema.parse({ apiKey: process.env.API_KEY });
};
