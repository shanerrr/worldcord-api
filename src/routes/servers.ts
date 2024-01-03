import { Hono } from "hono";

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

export default server;
