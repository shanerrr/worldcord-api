import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";
import { ChannelType } from "@prisma/client";

const channel = new Hono();

// POST /server/:serverId/channels
channel.post(
  "/:serverId/channels",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      type: z.custom<ChannelType>(),
    })
  ),
  async (c) => {
    const { serverId } = c.req.param();
    const { name, type } = c.req.valid("json");
    // TODO: FIX HARDCODED USER ID
    const channel = await db.channel.create({
      data: {
        serverId,
        name,
        type,
        userId: "7fc61ef5-d7d6-4997-99a4-d42fc4f5a1e2",
      },
    });

    return c.json({ channel });
  }
);

// GET /server/:serverId/channels/:id
channel.get("/:serverId/channels/:id", async (c) => {
  const { id, serverId } = c.req.param();

  const channel = await db.channel.findFirst({
    where: {
      id,
      serverId,
    },
  });

  return c.json({ channel });
});

// GET /server/:serverId/channels
channel.get(
  "/:serverId/channels",
  zValidator(
    "query",
    z.object({
      filter: z.string(),
    })
  ),
  async (c) => {
    const { filter } = c.req.valid("query");
    const serverId = c.req.param("serverId");

    if (filter === "ALL") {
      const channels = await db.channel.findMany({
        where: {
          serverId,
        },
      });

      return c.json({ channels });
    }
    const channel = await db.channel.findFirst({
      where: {
        serverId,
      },
    });

    return c.json({ channel });
  }
);

export default channel;
