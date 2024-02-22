import Prompt from "@models/prompt";
import { connectSQL, connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

//return prompt of given id
//-----------------SQL--------------------
export const GET = async (request, { params }) => {
  try {
    const findQuery = "SELECT * FROM promt where id=?";
    // const userQuery="SELECT * FROM user where id=?"
    const prompt = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        connection.query(findQuery, params.id, (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          const tagQuery = "SELECT * FROM tag where promptid=?";
          connection.query(tagQuery, params.id, (err, res2) => {
            connection.release();
            if (err) {
              console.log(err);
              reject(err);
              return;
            }
            const results = res2.map((e) => e.tag);
            resolve({ tags: results, data: res });
          });
        });
      });
    });
    console.log(prompt);
    const newPrompt = { ...prompt.data[0], tags: prompt.tags };
    return NextResponse.json(newPrompt, { status: 200 });
  } catch (error) {
    console.log(error, "getprompt");
    return NextResponse.json(error, { status: 500 });
  }
};

export const PATCH = async (request, { params }) => {
  const { prompt, tag } = await request.json();
  try {
    const result = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err, "update");
          reject(err);
          return;
        }
        //delte exisiting tags
        const deleteTagQuery = "DELETE FROM tag where promptid=?";
        connection.query(deleteTagQuery, params.id, (err, res) => {
          if (err) {
            console.log(err, "update");
            reject(err);
            return;
          }
          // resolve(res);
        });

        //update new prompt
        const updatePromptQuery = "UPDATE promt SET prompt = ? WHERE id = ?";
        connection.query(updatePromptQuery, [prompt, params.id], (err, res) => {
          if (err) {
            console.log(err, "update");
            reject(err);
            return;
          }
          //add new tags
          let tagArr = tag?.split(",");
          tagArr = tagArr.map((t) => t.trim().toLowerCase());
          const tagInsertPromises = tagArr.map(async (tag) => {
            const tagres = await new Promise((resolve, reject) => {
              connection.query(
                "INSERT INTO tag (tag, promptid) VALUES (?, ?)",
                [tag, params.id],
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
          connection.release();
          console.log(res, "update");
          resolve(res);
        });
      });
    });
    console.log(result, "update");
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log(error, "update");
    return NextResponse.json({ error }, { status: 500 });
  }
};
// delete prompt with given promptid
//----------------------SQL---------------------------
export const DELETE = async (request, { params }) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const deleteQuery = "DELETE FROM promt WHERE id=?";
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        const tagQuery = "DELETE FROM tag where promptid=?";
        connection.query(tagQuery, params.id, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res);
        });
        connection.query(deleteQuery, params.id, (err, res) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log(error, "delete");
    return NextResponse.json(
      { message: "Couldn't delete Please retry" },
      { status: 500 }
    );
  }
};
// export const PATCH = async (request, { params }) => {
//   const { prompt, tag } = await request.json();

//   try {
//     await connectToDB();

//     // Find the existing prompt by ID
//     const existingPrompt = await Prompt.findById(params.id);

//     if (!existingPrompt) {
//       return new Response("Prompt not found", { status: 404 });
//     }

//     // Update the prompt with new data
//     existingPrompt.prompt = prompt;
//     existingPrompt.tag = tag;

//     await existingPrompt.save();

//     return new Response("Successfully updated the Prompts", { status: 200 });
//   } catch (error) {
//     return new Response("Error Updating Prompt", { status: 500 });
//   }
// };

// export const DELETE = async (request, { params }) => {
//   try {
//     await connectToDB();

//     // Find the prompt by ID and remove it
//     await Prompt.findByIdAndRemove(params.id);

//     return new Response("Prompt deleted successfully", { status: 200 });
//   } catch (error) {
//     return new Response("Error deleting prompt", { status: 500 });
//   }
// };

// export const GET = async (request, { params }) => {
//     try {
//         await connectToDB()

//         const prompt = await Prompt.findById(params.id).populate("creator")
//         if (!prompt) return new Response("Prompt Not Found", { status: 404 });

//         return new Response(JSON.stringify(prompt), { status: 200 })

//     } catch (error) {
//         return new Response("Internal Server Error", { status: 500 });
//     }
// }
