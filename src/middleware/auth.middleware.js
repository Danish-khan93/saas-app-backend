import { ErrorResponse } from "../utils/customError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.models.js";
dotenv.config();

export const authGaurd = async (req, res, next) => {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send(
          new ErrorResponse("Failed", "Authorization token missing or invalid")
        );
    }

    // 3. Extract the token (the part after "Bearer ")
    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      // 4. Verify the token
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .send(new ErrorResponse("Failed", "Token expired. Please refresh."));
      } else {
        return res
          .status(401)
          .send(new ErrorResponse("Failed", "Invalid token"));
      }
    }

    // 5. Find the user in DB
    const findUser = await User.findById(decoded.id);
    if (!findUser) {
      return res
        .status(401)
        .send(
          new ErrorResponse(
            "Failed",
            "User not found. Token may be invalid or user deleted."
          )
        );
    }

    // 6. Attach user to request
    req.user = findUser;

    // 7. Continue to next middleware/route
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res
      .status(500)
      .send(new ErrorResponse("Failed", "Server error in auth middleware"));
  }
};
