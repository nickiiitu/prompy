import Prompt from "@models/prompt";
import { connectSQL, connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

//return prompt of given id
//-----------------SQL--------------------
const timeoutPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("Connection timed out"));
  }, 10000); // 1 minute
});
export const GET = async (request, { params }) => {
  try {
    const findQuery = "SELECT * FROM promt where id=?";
    const promptPromise = new Promise((resolve, reject) => {
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
          if (res.length === 0) {
            resolve({ tags: [], data: res });
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
            let results = new Array();
            if (res2?.length > 0) {
              results = res2.map((e) => e.tag);
            }
            resolve({ tags: results, data: res });
          });
        });
      });
    });
    const prompt = await Promise.race([promptPromise, timeoutPromise]);
    let newPrompt = {};
    if (prompt?.data.length > 0) {
      newPrompt = { ...prompt?.data[0], tags: prompt?.tags };
    } else {
      throw new Error(`Prompt with id ${params.id} does not exist`);
    }
    return NextResponse.json({ data: newPrompt }, { status: 200 });
  } catch (error) {
    console.log(error, "getprompt");
    return NextResponse.json(
      { error: error?.message || error },
      { status: 500 }
    );
  }
};

export const PATCH = async (request, { params }) => {
  const { prompt, tag } = await request.json();
  try {
    const resultPromise = new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
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
          resolve(res);
        });
      });
    });
    const result = await Promise.race([resultPromise, timeoutPromise]);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.log(error, "update");
    return NextResponse.json({ error }, { status: 500 });
  }
};
// delete prompt with given promptid
//----------------------SQL---------------------------
export const DELETE = async (request, { params }) => {
  try {
    const resultPromise = await new Promise((resolve, reject) => {
      connectSQL.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        const PromptQuery = "SELECT * FROM promt where id=?";
        connection.query(PromptQuery, params.id, (err, res1) => {
          if (err || res1.length === 0) {
            reject(err ? err : "Prompt does not exist");
            return;
          }
          const tagQuery = "DELETE FROM tag where promptid=?";
          connection.query(tagQuery, params.id, (err, res) => {
            if (err) {
              reject(err);
              return;
            }
          });
          const deleteQuery = "DELETE FROM promt WHERE id=?";
          connection.query(deleteQuery, params.id, (err, res) => {
            if (err) {
              console.log(err);
              reject(err);
            }
          });
          resolve(res1);
        });
      });
    });
    const result = await Promise.race([resultPromise, timeoutPromise]);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log(error, "delete");
    return NextResponse.json(
      { error: error?.message || error || "Couldn't delete Please retry" },
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
