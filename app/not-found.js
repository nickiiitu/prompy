import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-5">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <button type="button" className="black_btn mt-2">
        <Link href="/">Return Home</Link>
      </button>
    </div>
  );
}
