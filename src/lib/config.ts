import dotenv from "dotenv";
import * as z from "zod";

type Config = {
  apiKey: string;
};

const ConfigSchema: z.ZodType<Config> = z.object({
  apiKey: z.string(),
});

export const initConfig = (): Config => {
  dotenv.config();

  return ConfigSchema.parse({ apiKey: process.env.API_KEY });
};
