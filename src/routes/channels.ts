import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";

const channel = new Hono();

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

// GET /server/:id/channels
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

    if (filter === "ALL") {
      const channels = await db.channel.findMany({
        where: {
          serverId: c.req.param("serverId"),
        },
      });

      return c.json({ channels });
    }
    const channel = await db.channel.findFirst({
      where: {
        serverId: c.req.param("serverId"),
      },
    });

    return c.json({ channel });
  }
);

export default channel;
