import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

//routes
import user from "./routes/users";
import server from "./routes/servers";
import member from "./routes/members";
import channel from "./routes/channels";
import message from "./routes/messages";

const app = new Hono().basePath("/api");

//middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    // allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    // allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

//routes
app.route("/user", user);
app.route("/server", server);
app.route("/server", member);
app.route("/server", channel);
app.route("/server", message);

Bun.serve({
  port: process.env.PORT || 4000,
  fetch: (req, server) => {
    if (server.upgrade(req)) {
      console.log("help!");
      return new Response("Hello world");
    }
    return app.fetch(req, server);
  },
  websocket: {
    message(ws, message) {
      console.log(ws.readyState, message);
    }, // a message is received
    open(ws) {
      console.log("hell9!");
    }, // a socket is opened
    close(ws, code, message) {
      console.log("Closed!");
    }, // a socket is closed
    drain(ws) {
      console.log("drained!");
    }, // the socket is ready to receive more data
  },
});
