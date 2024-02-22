import Prompt from "@models/prompt";
import { connectSQL, connectToDB } from "@utils/database";
import { NextResponse } from "next/server";
//create new prompt
export const POST = async (request) => {
  try {
    // console.log(request, "req");
    const { userId, prompt, tag } = await request.json();
    if (!userId || !prompt || !tag) {
      throw new Error("Fields in the request body are not correct");
    }
    const userQuery = "Select * from user where id=?";
    const userExist = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        connection.query(userQuery, [userId], (err, res) => {
          connection.release();
          if (err || res.length === 0) {
            err ? reject(err) : reject("User doesn't Exist");
            return;
          }
          resolve(res);
        });
      });
    });
    // return;
    let tagArr = tag?.split(",");
    tagArr = tagArr.map((t) => t.trim().toLowerCase());
    const finalRes = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting SQL connection:", err);
          reject(err);
        }

        connection.beginTransaction((err) => {
          if (err) {
            console.error("Error beginning transaction:", err);
            reject(err);
          }

          connection.query(
            "INSERT INTO promt (prompt, userid) VALUES (?, ?)",
            [prompt, userId],
            (err, results) => {
              if (err) {
                console.error("Error inserting into promt table:", err);
                reject(err);
              }
              const promptId = results.insertId;
              const tagInsertPromises = tagArr.map(async (tag) => {
                const tagres = await new Promise((resolve, reject) => {
                  connection.query(
                    "INSERT INTO tag (tag, promptid) VALUES (?, ?)",
                    [tag, promptId],
                    (err, tagRes) => {
                      if (err) {
                        console.error("Error inserting into tag table:", err);
                        reject(err);
                      } else {
                        resolve(tagRes);
                      }
                    }
                  );
                });
              });
              connection.commit((err) => {
                if (err) {
                  connection.rollback((e) => {
                    reject(err);
                  });
                }

                resolve(tagInsertPromises);
              });
            }
          );
        });
        connection.release();
      });
    });
    await Promise.all(finalRes);
    return NextResponse.json(
      { data: "Prompt created successfully" },
      { status: 200 }
    );
    //   // console.log(userId, tag);
    //   //   try {
    //   //     // await connectToDB();
    //   //     // const newPrompt = new Prompt({ creator: userId, prompt, tag });
    //   //     // await newPrompt.save();
    //   //   } catch (error) {
    //   //     return new Response("Failed to create a new prompt", { status: 500 });
    //   //   }
    // };
  } catch (error) {
    console.error("Caught error:", error);
    return NextResponse.json(
      { error: error.message || error },
      { status: 500 }
    );
  }
};
