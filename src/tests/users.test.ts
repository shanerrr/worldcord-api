import { describe, test, expect } from "bun:test";
import { app } from "..";

import { User } from "@prisma/client";

describe("Getting a single user.", () => {
  test("GET /users/", async () => {
    const res = await app.request(
      "/api/users/3334224c-ed45-432a-b551-a4ef1296452e"
    );
    console.log(await res.json());
    expect(res.status).toBe(200);
  });
});
