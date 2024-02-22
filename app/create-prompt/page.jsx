"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Form from "@components/Form";

const CreatePrompt = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState({ prompt: "", tag: "" });
  const [error, setError] = useState({ status: false, message: "" });
  useEffect(() => {
    if (error.status) {
      console.log("Hi");
      throw new Error(error.message);
    }
  }, [error]);
  const createPrompt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/prompt/new", {
        method: "POST",
        body: JSON.stringify({
          prompt: post.prompt,
          userId: session?.user.id,
          tag: post.tag,
        }),
      });
      // console.log(response);
      if (response.ok) {
        router.push("/");
      } else {
        const errorMessage = await response.json();
        setError({
          status: true,
          message: JSON.stringify(errorMessage || "Unknown Error"),
        });
      }
    } catch (error) {
      console.log(error, "error create");
      setError({
        status: true,
        message: JSON.stringify(
          error?.response?.data?.error || "Unknown Error"
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      type="Create"
      post={post}
      setPost={setPost}
      submitting={submitting}
      handleSubmit={createPrompt}
    />
  );
};

export default CreatePrompt;
