import Redis from "ioredis";
import { REDIS_URL } from "../config/secrets.js";
import { getIo } from "../socketInstance.js";
import { REDIS_COMMUNICATION_EVENTS } from "../workers/constants.js";

export function setupListingStatusSubscriber() {
  if (!REDIS_URL) {
    console.warn("REDIS_URL not set, listing status updates disabled");
    return;
  }

  const redisSub = new Redis(REDIS_URL, {
    tls: {},
    maxRetriesPerRequest: null,
  });

  redisSub.on("connect", () => {
    console.log("BACKEND subscribed Redis connected");
  });

  redisSub.on("ready", () => {
    console.log("BACKEND Redis is ready");
  });

  redisSub.on("error", (err) => {
    console.error("REDIS SUBSCRIBER ERROR:", err);
  });

  redisSub.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message); // { listingId, status, reason }

      console.log("REDIS MESSAGE:", channel, data);

      const { listingId, status, reason } = data;
      if (!listingId) {
        console.error("Redis message missing listingId");
        return;
      }

      const roomName = `pending-${listingId}`;
      const payload = {
        listingId,
        status,
        reason: reason || null,
      };

      console.log("EMIT →", roomName, payload);
      const io = getIo();
      io.to(roomName).emit("listingStatus", payload);
    } catch (err) {
      console.error("Error parsing Redis message:", err);
    }
  });

  redisSub.subscribe(
    REDIS_COMMUNICATION_EVENTS.LISTING_UPDATES,
    (err, count) => {
      console.log("SUBSCRIBED to listing_updates", err, count);
    },
  );
}
