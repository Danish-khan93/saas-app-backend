// in this file we define the user routes login signup and auth

import express from "express";
import { createUser, refreshToken, userLogin,logout } from "../controllers/user.controllers.js";

const userRoutes = express.Router();

// user signup
userRoutes.post("/createuser", createUser);
userRoutes.post("/login", userLogin);
userRoutes.post("/refresh-token", refreshToken); // refresh aceess token
userRoutes.post("/logout", logout); // logout
 
export { userRoutes };
