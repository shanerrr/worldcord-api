import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";

//routes
import users from "./routes/users";
import server from "./routes/servers";
import member from "./routes/members";
import channel from "./routes/channels";
import message from "./routes/messages";

export const app = new Hono().basePath("/api");

//middleware
app.use("*", logger());
app.use("*", poweredBy());

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
app.route("/users", users);
app.route("/servers", server);
app.route("/servers", member);
app.route("/servers", channel);
app.route("/servers", message);

export const bunServer = Bun.serve<{ serverId: string }>({
  port: process.env.PORT || 4000,
  fetch: (req, server) => {
    //conect to websocket if in a valid server
    if (req.url.includes("/api/websocket")) {
      const url = new URL(req.url);
      server.upgrade(req, {
        data: {
          serverId: url.searchParams.get("server"),
        },
      });
    }
    return app.fetch(req, server);
  },
  websocket: {
    message(ws, message) {
      console.log(ws.readyState, message);
    }, // a message is received
    open(ws) {
      ws.subscribe(ws.data.serverId);
    }, // a socket is opened
    close(ws, code, message) {
      ws.unsubscribe("worldcord");
    }, // a socket is closed
    drain(ws) {
      console.log("drained!");
    }, // the socket is ready to receive more data
  },
});
