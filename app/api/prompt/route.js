import Prompt from "@models/prompt";
import { connectToDB, connectSQL } from "@utils/database";
import { NextResponse } from "next/server";
// export const GET = async (request) => {
//   try {
//     await connectToDB();

//     const prompts = await Prompt.find({}).populate("creator");

//     return new Response(JSON.stringify(prompts), { status: 200 });
//   } catch (error) {
//     return new Response("Failed to fetch all prompts", { status: 500 });
//   }
// };
export const GET = async (request) => {
  try {
    let result;
    const joinQuery =
      "SELECT * FROM user INNER JOIN promt ON user.id=promt.userid";
    connectSQL.query(joinQuery, (err, res) => {
      if (err) {
        console.log(err, "err");
        return new Response("Failed to fetch all prompts", {
          status: 500,
          err,
        });
      } else {
        result = Object.values(JSON.parse(JSON.stringify(res)));
      }
    });
    return result;
  } catch (error) {
    console.log(error, "error");
  }
};
