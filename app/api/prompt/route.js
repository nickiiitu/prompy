import Prompt from "@models/prompt";
import { connectToDB, connectSQL } from "@utils/database";
import { NextResponse } from "next/server";
// export const GET = async (request) => {
//   try {
//     await connectToDB();

//     const prompts = await Prompt.find({}).populate("creator");

//////// return new Response(JSON.stringify(prompts), { status: 200 });
// return NextResponse.json({ data: prompts }, { status: 201 });

//   } catch (error) {
//     return new Response("Failed to fetch all prompts", { status: 500 });
//   }
// };

export const GET = async (request, response) => {
  try {
    const joinQuery =
      "SELECT * FROM user INNER JOIN promt ON user.id=promt.userid;";
    const result = await new Promise((resolve, reject) => {
      connectSQL.query(joinQuery, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 201 });
  }
};
