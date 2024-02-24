import Prompt from "@models/prompt";
import { connectSQL, connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

const timeoutPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("Connection timed out"));
  }, 10000); // 1 minute
});
//create new prompt
export const POST = async (request) => {
  try {
    // console.log(request, "req");
    const { userId, prompt, tag } = await request.json();
    if (!userId || !prompt || !tag) {
      throw new Error("Fields in the request body are not correct");
    }
    const userQuery = "Select * from user where id=?";
    const userExistPromise = new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err, "err");
          reject(err);
          return;
        }
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
    await Promise.race([userExistPromise, timeoutPromise]);

    let tagArr = tag?.split(",");
    if (tagArr.length === 0) {
      throw new Error("Tags can't be empty");
    }
    tagArr = tagArr.map((t) => t.trim().toLowerCase());

    const finalResPromise = new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting SQL connection:", err);
          reject(err);
          return;
        }

        connection.beginTransaction((err) => {
          if (err) {
            console.error("Error beginning transaction:", err);
            reject(err);
            return;
          }

          connection.query(
            "INSERT INTO promt (prompt, userid) VALUES (?, ?)",
            [prompt, userId],
            (err, results) => {
              if (err) {
                console.error("Error inserting into promt table:", err);
                reject(err);
                return;
              }
              const promptId = results.insertId;
              const tagInsertPromises = tagArr.map(async (tag) => {
                const tagresPromise = new Promise((resolve, reject) => {
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
                return await Promise.race([tagresPromise, timeoutPromise]);
              });
              connection.commit((err) => {
                if (err) {
                  connection.rollback((e) => {
                    reject(err);
                  });
                } else {
                  resolve(tagInsertPromises);
                }
              });
            }
          );
        });
        connection.release();
      });
    });
    await Promise.race([finalResPromise, timeoutPromise]);
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
