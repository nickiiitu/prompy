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
// get all prompts
export const GET = async (request, response) => {
  try {
    const joinQuery =
      "SELECT * FROM user INNER JOIN promt ON user.id=promt.userid;";
    const result = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err, "error");
          reject(err);
          return;
        }
        connection.query(joinQuery, (err, result) => {
          connection.release();
          if (err) {
            console.log(err, "err");
            reject(err);
          } else {
            console.log(result, "result");
            resolve(result);
          }
        });
      });
    });

    // Open a single connection for tag queries
    const connection = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(connection);
      });
    });

    const tagArr = await Promise.all(
      result.map(async (e, i) => {
        const tags = await new Promise((resolve, reject) => {
          const tagQuery = "SELECT * FROM tag WHERE promptid=?";
          connection.query(tagQuery, [e.id], (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            const tag = result.map((itm) => itm.tag);
            resolve(tag);
          });
        });
        return tags;
      })
    );

    connection.release();
    let newArr = result.map((e, i) => {
      return { ...e, tags: tagArr[i] };
    });
    return NextResponse.json({ data: newArr }, { status: 201 });
  } catch (error) {
    // console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};
