import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { compare } from "bcryptjs";
import { User } from "../models/user.models.js";
dotenv.config();

// create token jwt

export const createRefreshToken = (payload) => {
  const secretRefreshToken = process.env.REFRESH_TOKEN;
  const refreshToken = jwt.sign(payload, secretRefreshToken, {
    expiresIn: "7d",
  });

  return refreshToken;
};

// access token short live
export const createAccessToken = (payload) => {
  const secretAccessToken = process.env.ACCESS_TOKEN;
  const accessToken = jwt.sign(payload, secretAccessToken, {
    expiresIn: "30m",
  });

  return accessToken;
};

// comapare old pass

export const comparePassword = async (password, hashPass) => {
  try {
    const comapreing = await compare(password, hashPass);
    return comapreing;
  } catch (error) {
    console.log(error);
  }
};

// verify the token for

export const verifyToken = async (token) => {
  // token decoded
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN);
  // console.log(decoded, "decoded token ");
  // find user with decoded value
  const { email, id } = decoded;
  // console.log(email, id);

  const findUser = await User.findById(id);

  return findUser;
};
