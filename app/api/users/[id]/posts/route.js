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

//return all post of user with userid
//-----------------SQL----------------------------
export const GET = async (request, { params }) => {
  try {
    const userQuery = "SELECT * from user where id=?";
    await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err, "err");
          return;
        }
        connection.query(userQuery, params.id, (err, result) => {
          connection.release();
          if (err) reject(err);
          resolve(result);
        });
      });
    });
    const res = await new Promise((resolve, reject) => {
      const findQuery =
        "SELECT * FROM user INNER JOIN promt ON user.id=promt.userid WHERE user.id=?;";
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          return;
        }
        connection.query(findQuery, params.id, (err, result) => {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
    console.log(res, "res");
    const tagArr = await Promise.all(
      res.map(async (e) => {
        const tags = await new Promise((resolve, reject) => {
          const tagQuery = "SELECT * from tag where promptid=?";
          connectSQL.getConnection((err, connection) => {
            if (err) {
              reject(err);
            }
            connection.query(tagQuery, e.id, (err, result) => {
              if (err) reject(err);
              const getTag = result.map((itm) => itm.tag);
              resolve(getTag);
            });
          });
        });
        return tags;
      })
    );
    const resWithTags = res.map((e, i) => {
      return { ...e, tags: tagArr[i] };
    });
    // return new Response(JSON.stringify(res), { status: 200 });
    return NextResponse.json(resWithTags, { status: 200 });
  } catch (error) {
    console.log(error, "error");
    return NextResponse.json(error, { status: 500 });
  }
};
