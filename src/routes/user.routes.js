// in this file we define the user routes login signup and auth

import express from "express";
import {
  createUser,
  refreshToken,
  userLogin,
  logout,
} from "../controllers/user.controllers.js";
import { authGaurd } from "../middleware/auth.middleware.js";

const userRoutes = express.Router();

// user signup
userRoutes.post("/createuser", createUser);
userRoutes.post("/login", userLogin);
userRoutes.post("/refresh-token", refreshToken); // refresh aceess token
userRoutes.post("/logout", logout); // logout
userRoutes.get("/dummy", authGaurd, (req, res) => {
  try {
    res.send({ message: "hello auth gaurd" });
  } catch (error) {
    res.status(500).send(new ErrorResponse("Failed", "Server error in routes file "));
  }
});

export { userRoutes };
