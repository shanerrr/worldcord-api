import { Hono } from "hono";
import { logger } from "hono/logger";

//routes
import user from "./routes/users";
import server from "./routes/servers";

const app = new Hono().basePath("/api");

//middleware
app.use("*", logger());

//routes
app.route("/user", user);
app.route("/server", server);

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT || 4000,
});
