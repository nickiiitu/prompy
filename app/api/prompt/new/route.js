import Prompt from "@models/prompt";
import { connectSQL, connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

export const POST = async (request) => {
  try {
    const { userId, prompt, tag } = await request.json();
    if (!userId || !prompt || !tag) {
      return NextResponse.json(
        { error: "Fields in the request body are not correct" },
        { status: 500 }
      );
    }

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
                  reject(err);
                }
                resolve(tagInsertPromises);
              });
            }
          );
        });
      });
    });
    return NextResponse.json(finalRes, { status: 200 });
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
    const errorPromise = await new Promise((resolve, reject) => {
      connection.rollback((e) => {
        resolve(e);
      });
    });
    console.log(errorPromise);
    return NextResponse.json(errorPromise, { status: 500 });
  }
};
