import dotenv from "dotenv";
import { dbName } from "../constant.js";
// this is the config for module setup
dotenv.config();

import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}${dbName}`
    );
    // console.log(connectionInstance, "connectionInstance");
    console.log(
      `DB CONNECTED SUCCESSFULY  ${connectionInstance?.connection?.host}`
    );
  } catch (error) {
    console.log(error, "THIS ERROR OCCUR IN DB CONNECTION ");
    process.exit(1);
  }
};
