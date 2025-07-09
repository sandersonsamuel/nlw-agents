import postgres from "postgres";
import { env } from "../env.ts";

const client = postgres(env.DATABASE_URL);
