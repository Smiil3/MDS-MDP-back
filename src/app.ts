import express from "express";
import { authRouter } from "./routes/auth.route";
import { mechanicRouter } from "./routes/mechanic.route";
import { userRouter } from "./routes/user.route";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/users", userRouter);
app.use("/api/mechanics", mechanicRouter);
app.use("/api/auth", authRouter);
