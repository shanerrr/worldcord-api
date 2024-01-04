import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";

const member = new Hono();

// GET /server/:serverId/members/:id
member.get("/:serverId/members/:userId", async (c) => {
  const { serverId, userId } = c.req.param();
  const member = await db.member.findUnique({
    where: {
      userId,
      serverId,
    },
  });
  return c.json({ member });
});

// GET /server/:serverId/members
member.get("/:serverId/members", async (c) => {
  const members = await db.member.findMany({
    where: {
      serverId: c.req.param("serverId"),
    },
    include: {
      user: true,
    },
  });
  return c.json({ members });
});

// PUT /server/:serverId/member
member.put(
  "/:serverId/members",
  zValidator(
    "json",
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("json");
    const serverId = c.req.param("serverId");

    await db.member.upsert({
      where: { userId: id, serverId },
      create: {
        serverId: serverId,
        userId: id,
      },
      update: {},
    });

    return c.json({ msg: "Valid member!" });
  }
);

export default member;
