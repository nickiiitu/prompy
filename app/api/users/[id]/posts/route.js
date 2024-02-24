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
const timeoutPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("Connection timed out"));
  }, 10000); // 1 minute
});
//return all post of user with userid
//-----------------SQL----------------------------
export const GET = async (request, { params }) => {
  try {
    //verify user
    const userQuery = "SELECT * from user where id=?";
    const userExistPromise = new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err, "err");
          reject(err);
          return;
        }
        connection.query(userQuery, params.id, (err, result) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          if (result?.length === 0) {
            reject("User not found");
            return;
          }
          resolve(result);
        });
      });
    });
    await Promise.race([userExistPromise, timeoutPromise]);
    //get prompts
    const resPromise = await new Promise((resolve, reject) => {
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
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
    const res = await Promise.race([resPromise, timeoutPromise]);
    if (res.length === 0) {
      return NextResponse.json({ data: res }, { status: 200 });
    }
    //get tags
    const connectionPromise = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(connection);
      });
    });
    const connection = await Promise.race([connectionPromise, timeoutPromise]);

    const tagArrPromise = Promise.all(
      res.map(async (e) => {
        return new Promise((resolve, reject) => {
          const tagQuery = "SELECT * from tag where promptid=?";
          connection.query(tagQuery, e.id, (err, result) => {
            if (err) {
              connection.release();
              reject(err);
              return;
            }
            let getTag = new Array();
            if (result?.length > 0) {
              getTag = result.map((itm) => itm.tag);
            }
            resolve(getTag);
          });
        });
      })
    );
    const tagArr = await Promise.race([tagArrPromise, timeoutPromise]);

    connection.release();

    const resWithTags = res.map((e, i) => {
      return { ...e, tags: tagArr[i] };
    });
    return NextResponse.json({ data: resWithTags }, { status: 200 });
  } catch (error) {
    console.log(error, "error");
    return NextResponse.json(
      { error: error?.message || error },
      { status: 500 }
    );
  }
};
