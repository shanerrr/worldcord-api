import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";

const message = new Hono();

// GET /server/:serverId/channels/:id/messages
message.get(
  "/:serverId/channels/:id/messages",
  zValidator(
    "query",
    z.object({
      cursor: z.string().optional(),
      batch: z.string().pipe(z.coerce.number().min(5).max(50)),
    })
  ),
  async (c) => {
    const { cursor, batch } = c.req.valid("query");

    const messages = await db.message.findMany({
      take: batch,
      ...(cursor
        ? {
            skip: 1,
            cursor: {
              id: cursor,
            },
          }
        : {}),
      where: {
        channelId: c.req.param("id"),
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    //get the last id for cursor, if no more items, return null as cursor
    let nextCursor = null;
    if (messages.length === batch) nextCursor = messages[batch - 1].id;

    return c.json({ messages, cursor: nextCursor });
  }
);

// POST /server/:serverId/channels/:id/messages
message.post(
  "/:serverId/channels/:id/messages",
  zValidator(
    "json",
    z.object({
      content: z.string(),
      memberId: z.string(),
    })
  ),
  async (c) => {
    const { content, memberId } = c.req.valid("json");
    const { id } = c.req.param();

    await db.message.create({
      data: {
        memberId,
        content,
        channelId: id,
      },
    });

    return c.json({ msg: "Success!" });
  }
);

export default message;
