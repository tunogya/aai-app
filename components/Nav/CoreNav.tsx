"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const menu = [
  {
    path: "/dashboard",
    name: "Dashboard",
  },
  {
    path: "/chat",
    name: "Chat",
  },
  // {
  //   path: "/note",
  //   name: "Note",
  // },
  {
    path: "/usage",
    name: "Usage",
  },
];

const CoreNav = () => {
  const searchParams = useSearchParams();
  const path = usePathname();

  return (
    <div className={""}>
      {menu.map((item, index) => (
        <div className={"flex items-center select-none"} key={index}>
          <div
            className={`bg-white w-4 h-5 ${
              path.includes(item.path) ? `border-l-2 border-[#0066FF]` : ""
            }`}
          ></div>
          <Link
            href={`${item.path}?model=${
              searchParams.get("model") || "gpt-3.5-turbo"
            }`}
            prefetch
            scroll={false}
            className={`text-sm font-semibold hover:bg-gray-50 w-full p-2 rounded ${
              path.includes(item.path) ? `text-[#0066FF]` : "text-black"
            }`}
          >
            {item.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CoreNav;
