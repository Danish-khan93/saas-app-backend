// in this file we define the user routes login signup and auth

import express from "express";
import { createUser, userLogin } from "../controllers/user.controllers.js";

const userRoutes = express.Router();

// user signup
userRoutes.post("/createuser", createUser);
userRoutes.post("/login", userLogin);

export { userRoutes };
