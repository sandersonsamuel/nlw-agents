import { app } from "./server.ts";

app.get("/user", () => {
  return {
    name: "Samuel",
    surname: "Sanderson",
  };
});
