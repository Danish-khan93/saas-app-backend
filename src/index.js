import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./db/dbConnection.js";
import { userRoutes } from "./routes/user.routes.js";
// this is the config for module setup
dotenv.config();
const app = express();

// dbconnection
connectDb();
// middelware setup
//parse json middelware
app.use(express.json());

// users routes
app.use("/api/v1", userRoutes);

// this is the listen code where server is run
app.listen(process.env.PORT, () => {
  console.log(`THIS APP IS RUNNING ON PORT ${process.env.PORT}`);
});
