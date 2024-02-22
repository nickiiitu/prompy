"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Error({ error, reset }) {
  const obj = error && error.message && JSON.parse(error?.message);
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(obj, "error");
  }, [error]);
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center h-full px-5 mt-5">
      <h1>Something went wrong!</h1>
      <p className="mt-5 text-center">{error.message}</p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => router.push("/")
        }
        className="mt-5 black_btn"
      >
        Go to Home
      </button>
      <p className="mt-5">If Error persists kindly try Signing Out</p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          signOut
        }
        className="mt-5 black_btn"
      >
        Sign Out
      </button>
    </div>
  );
}
