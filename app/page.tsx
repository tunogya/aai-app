"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import { redirect } from "next/navigation";
import { nanoid } from "ai";

export default function Index() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div></div>;

  if (error) return redirect(`/auth/error?message=${error.message}`);

  if (user) return redirect(`/chat/${nanoid()}`);

  return redirect("/auth/login");
}
