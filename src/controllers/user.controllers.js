import { User } from "../models/user.models.js";
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from "../services/userAuth.service.js";
import { ErrorResponse } from "../utils/customError.js";
import { Response } from "../utils/customResponse.js";
export const createUser = async (req, res) => {
  // 1- check user is already created
  // 2- create token access and refresh
  try {
    const { firstName, lastName, password, email } = req?.body;

    if (!email) {
      return res
        .status(400)
        .send(new ErrorResponse("Failed", "The Email is required"));
    }

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

    if (!email) {
      res
        .status(400)
        .send(new ErrorResponse("Failed", "The email and password required"));
      return;
    }

    const findUser = await User.findOne({ email: email }).select("+password");
    console.log("finduser", findUser);

    if (!findUser) {
      res
        .status(401)
        .send(new ErrorResponse("Failed", "The email is not Vaild"));
      return;
    }
    if (!password) {
      res
        .status(400)
        .send(new ErrorResponse("Failed", "The Password is required"));
      return;
    } else {
      const matchingPass = await comparePassword(password, findUser?.password);

      if (!matchingPass) {
        res
          .status(401)
          .send(new ErrorResponse("Failed", "The email and password is wrong"));
        return;
      }
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

// refresh token
export const refreshToken = async (req, res) => {
  try {
    const refresh = req?.body;
    console.log(refresh);

    const tokenVerification = await verifyToken(refresh?.token);
    console.log(tokenVerification);

    if (!tokenVerification) {
      return res
        .status(401)
        .send(new ErrorResponse("Failed", "the token is invaild"));
    }

    if (refresh?.token !== tokenVerification.toObject().refreshToken) {
      return res
        .status(401)
        .send(new ErrorResponse("Failed", "the token is invaild"));
    } else {
      const { _id, email } = tokenVerification;
      // console.log(_id, email);

      const newAccessToken = createAccessToken({ email, id: _id });

      res
        .status(200)
        .send(
          new Response(
            "Success",
            "The regenerate the access token ",
            { token: newAccessToken },
            200
          )
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(new ErrorResponse("Failed", "Server error"));
  }
};

// logout user

export const logout = async (req, res) => {
  try {
    const { token } = req.body;
    console.log(token);

    const verifyTheToken = await verifyToken(token);

    if (!verifyTheToken) {
      console.log("verifyTheToken");

      return res
        .status(401)
        .send(new ErrorResponse("Failed", "the token is invaild"));
    }

    if (verifyTheToken.toObject()?.refreshToken !== token) {
      console.log("verifyTheToken");
      return res
        .status(401)
        .send(new ErrorResponse("Failed", "the token is invaild"));
    } else {
      const findAndUpdateUser = await User.findByIdAndUpdate(
        verifyTheToken.toObject()?._id,
        { refreshToken: null },
        { new: true }
      );

      res.status(200).send(
        new Response(
          "Success",
          "The User is Successfully LogOut",

          200
        )
      );
    }
  } catch (error) {
    res.status(500).send(new ErrorResponse("Failed", "Server error"));
  }
};
