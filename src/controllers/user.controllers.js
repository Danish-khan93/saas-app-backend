import { User } from "../models/user.models.js";
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
} from "../services/userAuth.service.js";
import { ErrorResponse } from "../utils/customError.js";
import { Response } from "../utils/customResponse.js";
export const createUser = async (req, res) => {
  // 1- check user is already created
  // 2- create token access and refresh
  try {
    const { firstName, lastName, password, email } = req?.body;

    //   check user already exist in db
    const checkUser = await User.findOne({
      email,
    });
    if (checkUser) {
      return res
        .status(409)
        .send(new ErrorResponse("Failed", "The Email is already exist"));
    } else {
      // create user first
      const newUser = await User.create({
        firstName,
        lastName,
        password,
        email,
      });

      // create both token access and refresh
      const refreshToken = createRefreshToken({
        email,
        id: newUser?._id,
      });
      const accessToken = createAccessToken({
        email,
        id: newUser?._id,
      });

      const findAndUpdate = await User.findByIdAndUpdate(
        { _id: newUser?._id },
        {
          refreshToken,
        },
        { new: true }
      ).select("firstName lastName email refreshToken _id");
      console.log(findAndUpdate, "check the refresh token");

      //   response send in api
      res
        .status(201)
        .json(
          new Response(
            "Success",
            "The User is Creates Successfully",
            { ...findAndUpdate.toObject(), accessToken },
            201
          )
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(new ErrorResponse("Failed", "Server error"));
  }
};

// login api
//1- check user in db or not
//2- check password is correct or not
//3- if pass is correct send access token
//1-
//1-
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req?.body;

    const findUser = await User.findOne({ email: email }).select("+password");
    console.log("finduser", findUser);

    if (!findUser) {
      res
        .status(401)
        .send(new ErrorResponse("Failed", "The email and password is wrong"));
      return;
    }

    const matchingPass = await comparePassword(password, findUser?.password);
    console.log(matchingPass);

    if (!matchingPass) {
      res
        .status(401)
        .send(new ErrorResponse("Failed", "The email and password is wrong"));
      return;
    }

    // create tokens
    const refreshToken = createRefreshToken({
      email,
      id: findUser?._id,
    });
    const accessToken = createAccessToken({
      email,
      id: findUser?._id,
    });

    const user = findUser;
    user.refreshToken = refreshToken;
    await user.save();

    const finalUser = {
      _id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      refreshToken: user?.refreshToken,
      accessToken: accessToken,
    };

    console.log("final user", finalUser);

    res
      .status(200)
      .send(
        new Response(
          "Success",
          "The User is Login Successfully",
          finalUser,
          200
        )
      );
  } catch (error) {
    console.log(error);
    res.status(500).send(new ErrorResponse("Failed", "Server error"));
  }
};


