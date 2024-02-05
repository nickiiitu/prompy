import Prompt from "@models/prompt";
import { connectSQL, connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

// export const GET = async (request, { params }) => {
//   try {
//     await connectToDB();
//     const prompts = await Prompt.find({ creator: params.id }).populate(
//       "creator"
//     );
//     return new Response(JSON.stringify(prompts), { status: 200 });
//   } catch (error) {
//     return new Response("Failed to fetch prompts created by user", {
//       status: 500,
//     });
//   }
// };

//-----------------SQL----------------------------
export const GET = async (request, { params }) => {
  try {
    const res = await new Promise((resolve, reject) => {
      const findQuery =
        "SELECT * FROM user INNER JOIN promt ON user.id=promt.userid WHERE user.id=?;";
      connectSQL.query(findQuery, params.id, (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(result, "result");
          resolve(result);
        }
      });
    });
    console.log(res, "res");
    // return new Response(JSON.stringify(res), { status: 200 });
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.log(error, "error");
    return NextResponse.json(error, { status: 500 });
  }
};
