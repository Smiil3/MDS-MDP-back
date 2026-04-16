import express from "express";
import { authRouter } from "./routes/auth.route";
import { bookingRouter } from "./routes/booking.route";
import { garageRouter } from "./routes/garage.route";
import { mechanicRouter } from "./routes/mechanic.route";
import { userRouter } from "./routes/user.route";
const cors = require("cors");

export const app = express();

app.use(cors({ origin: "http://localhost:8081" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/users", userRouter);
app.use("/api/mechanics", mechanicRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/auth", authRouter);
app.use("/api/garages", garageRouter);
