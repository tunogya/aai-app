import React from "react";
import { getSession } from "@auth0/nextjs-auth0/edge";
import Link from "next/link";

export const runtime = "edge";

export default async function SSRPage() {
  const session = await getSession();
  return (
    <div
      className={
        "h-full w-full items-center justify-center space-y-4 select-none relative flex flex-col"
      }
    >
      <div className={"text-[120px]"}>🎉</div>
      <div className="text-center text-2xl md:text-3xl font-serif">
        &quot;All Done!&quot;
      </div>
      <Link
        href={"/"}
        prefetch
        className={
          "w-64 py-4 border rounded-full text-center bg-green-500 text-white font-bold mt-4"
        }
      >
        Got it
      </Link>
    </div>
  );
}
