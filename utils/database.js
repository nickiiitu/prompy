import mongoose from "mongoose";
import mysql from "mysql";
let isConnected = false; // track the connection

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "share_prompt",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;

    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.log(error);
  }
};

export const connectSQL = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "prompy",
});
