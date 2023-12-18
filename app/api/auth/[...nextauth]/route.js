import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt, { compare } from "bcrypt";
import User from "@models/user";
import { connectToDB } from "@utils/database";
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
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. "Sign in with...")
    //   name: "Credentials",
    //   // `credentials` is used to generate a form on the sign in page.
    //   // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     username: {
    //       label: "Email",
    //       type: "email",
    //       placeholder: "nik@gmail.com",
    //     },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials) {
    //     // Add logic here to look up the user from the credentials supplied
    //     const isConnected = await connectToDB();
    //     console.log(isConnected);
    //     console.log(credentials.email, "cred");
    //     const user = await User.findOne({ email: credentials.email });
    //     console.log(user, "user");
    //     if (!user) {
    //       let userToSave = {
    //         password: credentials.password,
    //         email: credentials.email,
    //       };
    //       const salt = await bcrypt.genSalt(10);
    //       const hash = await bcrypt.hash(credentials.password, salt);
    //       userToSave.password = hash;
    //       const savedUser = await User.create(userToSave);
    //       return new NextResponse(savedUser, { status: 200 });
    //       // Any object returned will be saved in `user` property of the JWT
    //     }
    //     // If you return null then an error will be displayed advising the user to check their details.
    //     try {
    //       const check = await bcrypt.compare(
    //         credentials?.password,
    //         user?.password
    //       );
    //       console.log(check);
    //       delete user?.password;
    //       return new NextResponse(user, { status: 200 });
    //     } catch (error) {
    //       return new NextResponse({ error }, { status: 401 });
    //     }
    //     // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
    //     // return null;
    //   },
    // }),
  ],
  callbacks: {
    async session({ session, token }) {
      // store the user id from MongoDB to session
      console.log(token, "session");
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          await connectToDB();
          // check if user already exists
          console.log(profile);
          const userExists = await User.findOne({ email: profile.email });
          // if not, create a new document and save user in MongoDB
          if (!userExists) {
            await User.create({
              email: profile.email,
              username: profile.name.replace(" ", "").toLowerCase(),
              image: profile.picture ? profile.picture : profile.avatar_url,
            });
          }

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
