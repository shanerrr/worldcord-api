import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";

const server = new Hono();

// GET /server/:id
server.get("/:id", async (c) => {
  const server = await db.server.findUnique({
    where: {
      id: c.req.param("id"),
    },
    include: {
      channels: true,
    },
  });
  return c.json({ server });
});

// GET /server/:id/channels
server.get("/:id/channels", async (c) => {
  const channels = await db.channel.findMany({
    where: {
      serverId: c.req.param("id"),
    },
  });
  return c.json({ channels });
});

export default server;
