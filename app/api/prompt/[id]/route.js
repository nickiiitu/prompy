import Prompt from "@models/prompt";
import { connectSQL, connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

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

//-----------------SQL--------------------
export const GET = async (request, { params }) => {
  try {
    const findQuery = "SELECT * FROM promt where id=?";
    const prompt = await new Promise((resolve, reject) => {
      connectSQL.query(findQuery, params.id, (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(res);
      });
    });

    return NextResponse.json(prompt[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
};

export const PATCH = async (request, { params }) => {
  const { prompt, tag } = await request.json();

  try {
    await connectToDB();

    // Find the existing prompt by ID
    const existingPrompt = await Prompt.findById(params.id);

    if (!existingPrompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    // Update the prompt with new data
    existingPrompt.prompt = prompt;
    existingPrompt.tag = tag;

    await existingPrompt.save();

    return new Response("Successfully updated the Prompts", { status: 200 });
  } catch (error) {
    return new Response("Error Updating Prompt", { status: 500 });
  }
};

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

//----------------------SQL---------------------------
export const DELETE = async (request, { params }) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const deleteQuery = "DELETE FROM promt WHERE id=?";
      connectSQL.query(deleteQuery, params.id, (err, res) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
    // Find the prompt by ID and remove it
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Couldn't delete Please retry" },
      { status: 500 }
    );
  }
};
