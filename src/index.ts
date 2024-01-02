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
