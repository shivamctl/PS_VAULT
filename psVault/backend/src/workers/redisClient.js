import Redis from "ioredis";
import { REDIS_URL } from "../config/secrets.js";

export const redis = new Redis(REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: null,
});
