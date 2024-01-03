import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";

const member = new Hono();

// GET /server/:id/members
member.get("/:id/members", async (c) => {
  const members = await db.member.findMany({
    where: {
      serverId: c.req.param("id"),
    },
    include: {
      user: true,
    },
  });
  return c.json({ members });
});

// PUT /server/:id/member
member.put(
  "/:id/members",
  zValidator(
    "json",
    z.object({
      id: z.string(),
      serverId: z.string(),
    })
  ),
  async (c) => {
    const { id, serverId } = c.req.valid("json");

    await db.member.upsert({
      where: { userId: id, serverId: serverId },
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
