import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt, { compare } from "bcrypt";
import User from "@models/user";
import { connectToDB, connectSQL } from "@utils/database";
import { NextResponse } from "next/server";
import GitHubProvider from "next-auth/providers/github";
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // store the user id from MongoDB to session
      let sessionUser = session;
      const userExisitQuery = "SELECT * from user where email=?";
      const result = await new Promise((resolve, reject) => {
        connectSQL.getConnection((err, connection) => {
          if (err) reject(err);
          connection.query(userExisitQuery, session.user.email, (err, res) => {
            connection.release();
            if (res?.length > 0) {
              resolve(res);
            }
            reject(err);
          });
        });
      });
      sessionUser.user.id = result[0].id;
      // const sessionUser = await User.findOne({ email: session.user.email });
      return sessionUser;
    },
    //--------------------mongodb--------------------------
    // async signIn({ account, profile, user, credentials }) {
    //   if (account.provider === "google" || account.provider === "github") {
    //     try {
    //       await connectToDB();
    //       // check if user already exists
    //       console.log(profile);
    //       const userExists = await User.findOne({ email: profile.email });
    //       // if not, create a new document and save user in MongoDB
    //       if (!userExists) {
    //         await User.create({
    //           email: profile.email,
    //           username: profile.name.replace(" ", "").toLowerCase(),
    //           image: profile.picture ? profile.picture : profile.avatar_url,
    //         });
    //       }

    //       return true;
    //     } catch (error) {
    //       console.log("Error checking if user exists: ", error.message);
    //       return false;
    //     }
    //   }

    //   return true;
    // },

    //---------------------SQL---------------------------
    async signIn({ account, profile, user, credentials }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          // check if user already exists
          const userExisitQuery = "SELECT * from user where email=?";
          connectSQL.query(userExisitQuery, profile.email, (err, res) => {
            if (res.length <= 0) {
              const insertQuery =
                "INSERT INTO user (username,email,image) VALUES (?,?,?)";

              connectSQL.query(
                insertQuery,
                [
                  profile.name.replace(" ", "").toLowerCase(),
                  profile.email,
                  profile.picture ? profile.picture : profile.avatar_url,
                ],
                (error, result) => {
                  if (error) {
                    console.log(error, "error");
                  } else {
                    // console.log(result, "result");
                  }
                }
              );
            } else {
              // console.log(res, "res");
            }
          });
          return true;
        } catch (error) {
          console.log("Error checking if user exists: ", error.message);
          return false;
        }
      }

      return true;
    },
  },
});

export { handler as GET, handler as POST };
