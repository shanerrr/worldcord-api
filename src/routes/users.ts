import { Hono } from "hono";
import { db } from "../database";

const user = new Hono();

// GET /user/:id
user.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  return c.json({ user });
});

// POST /user
user.post("/", async (c) => {
  const { id, username, email } = await c.req.json();
  const user = await db.user.upsert({
    select: {
      id: true,
      username: true,
      email: true,
      imageUrl: true,
    },
    where: {
      auth: id,
    },
    create: {
      auth: id,
      username: username,
      imageUrl: `https://api.dicebear.com/7.x/thumbs/svg?backgroundColor=ffd5dc&seed=${id}`,
      email: email,
    },
    update: {},
  });

  return c.json({ user });
});

export default user;
