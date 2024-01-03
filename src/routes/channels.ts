import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";

const channel = new Hono();

// GET /server/:id/channels
channel.get("/:id/channels", async (c) => {
  const channels = await db.channel.findMany({
    where: {
      serverId: c.req.param("id"),
    },
  });
  return c.json({ channels });
});

export default channel;
