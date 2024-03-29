import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";
import { bunServer } from "..";

const message = new Hono();
//TODO: FIX THE ZOD VALIDATOR FOR CURSOR
// GET /server/:serverId/channels/:id/messages
message.get(
  "/:serverId/channels/:id/messages",
  zValidator(
    "query",
    z.object({
      cursor: z.string().transform((e) => (e === "undefined" ? undefined : e)),
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

    return c.json({
      messages,
      cursor: nextCursor,
    });
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
    const { serverId, id } = c.req.param();

    const { content, memberId } = c.req.valid("json");

    const message = await db.message.create({
      data: {
        memberId,
        content,
        channelId: id,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    bunServer.publish(
      serverId,
      JSON.stringify({
        type: "newMessage",
        queryKey: `channel:${id}`,
        message,
      })
    );

    return c.json({ msg: "Success!" });
  }
);

// DELETE /server/:serverId/channels/:channelId/messages/:id
message.delete("/:serverId/channels/:channelId/messages/:id", async (c) => {
  const { serverId, channelId, id } = c.req.param();

  const message = await db.message.delete({
    where: {
      id,
    },
  });

  bunServer.publish(
    serverId,
    JSON.stringify({
      type: "deleteMessage",
      queryKey: `channel:${channelId}`,
      message,
    })
  );

  return c.json({ msg: "Success!" });
});

// PATCH /server/:serverId/channels/:channelId/messages/:id
message.patch(
  "/:serverId/channels/:channelId/messages/:id",
  zValidator(
    "json",
    z.object({
      content: z.string(),
    })
  ),
  async (c) => {
    const { serverId, channelId, id } = c.req.param();

    const message = await db.message.update({
      select: {
        id: true,
        content: true,
        updatedAt: true,
      },
      where: {
        id,
      },
      data: {
        content: c.req.valid("json").content,
      },
    });

    bunServer.publish(
      serverId,
      JSON.stringify({
        type: "updateMessage",
        queryKey: `channel:${channelId}`,
        message,
      })
    );

    return c.json({ msg: "Success!" });
  }
);

export default message;
