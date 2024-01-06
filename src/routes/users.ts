import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import { db } from "../database";

const users = new Hono();

// GET /user/:id
users.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  return c.json({ user });
});

// PUT /user
users.put(
  "/",
  zValidator(
    "json",
    z.object({
      id: z.string(),
      username: z.string(),
      email: z.string(),
    })
  ),
  async (c) => {
    const { id, username, email } = c.req.valid("json");
    const user = await db.user.upsert({
      where: {
        auth: id,
      },
      create: {
        auth: id,
        username: username,
        imageUrl: `https://api.dicebear.com/7.x/thumbs/png?backgroundColor=ffd5dc&seed=${id}`,
        email: email,
      },
      update: {},
    });

    return c.json({ user });
  }
);

export default users;
