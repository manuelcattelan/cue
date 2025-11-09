import { program } from "commander";
import dotenv from "dotenv";
import * as z from "zod";

dotenv.config();

const Config = z.object({
  apiKey: z.string(),
});

program.option("--api-key <key>").parse();
const options = program.opts();

Config.parse({
  apiKey: options.apiKey ?? process.env.API_KEY,
});
