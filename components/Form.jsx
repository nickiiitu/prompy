"use client";
import Link from "next/link";
import { useState } from "react";

const Form = ({ type, post, setPost, submitting, handleSubmit }) => {
  const [error, setError] = useState({
    tag: "",
    prompt: "",
  });
  return (
    <section className="w-full max-w-full flex flex-col justify-center items-center">
      <h1 className="head_text text-left mt-0">
        <span className="blue_gradient">{type} Post</span>
      </h1>
      <p className="desc text-left max-w-md">
        {type} and share amazing prompts with the world, and let your
        imagination run wild with any AI-powered platform
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (post.tag && post.prompt) {
            handleSubmit(e);
          } else {
            setError({
              tag: post.tag ? "" : "Enter a valid Tag",
              prompt: post.prompt ? "" : "Enter a Prompt",
            });
          }
        }}
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
      >
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Your AI Prompt
          </span>
          <br />
          {error.prompt && (
            <span className="font-satoshi text-base text-red-300">
              {error.prompt}
            </span>
          )}
          <textarea
            value={post.prompt}
            onChange={(e) => {
              setPost({ ...post, prompt: e.target.value });
              error.prompt && setError({ ...error, prompt: "" });
            }}
            placeholder="Write your post here"
            // required
            className="form_textarea "
          />
        </label>

        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">
            Field of Prompt{" "}
            <span className="font-normal">
              (product, webdevelopment, idea, etc.)
            </span>
          </span>
          <br />
          {error.tag && (
            <span className="font-satoshi text-base text-red-300">
              {error.tag}
            </span>
          )}
          <input
            value={post.tag}
            onChange={(e) => {
              setPost({ ...post, tag: e.target.value });
              error.tag && setError({ ...error, tag: "" });
            }}
            type="text"
            placeholder="Enter space seperated key words for tags eg Webdev product Idea Software"
            // required
            className="form_input"
          />
        </label>

        <div className="flex-end mx-3 mb-5 gap-4">
          <Link href="/" className="text-gray-500 text-sm">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white"
          >
            {submitting ? `${type}ing...` : type}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Form;
