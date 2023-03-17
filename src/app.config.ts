import { config } from "dotenv";

config({ path: '.env' });
export const PORT = process.env.PORT ? +process.env.PORT : 3000;