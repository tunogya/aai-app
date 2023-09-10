import Link from "next/link";
import { FC } from "react";

const menu = [
  {
    path: "/dashboard",
    name: "Dashboard",
  },
  {
    path: "/chat",
    name: "ChatGPT",
  },
  {
    path: "/notebook",
    name: "Whisperer",
  },
  {
    path: "/billing",
    name: "Billing",
  },
];

const CoreNav: FC<{
  active: string;
}> = (props) => {
  return (
    <div className={""}>
      {menu.map((item, index) => (
        <div className={"flex items-center"} key={index}>
          <div
            className={`bg-white w-4 h-5 ${
              props.active === item.path ? "border-l-2 border-stone-800" : ""
            }`}
          ></div>
          <Link
            href={item.path}
            prefetch={true}
            scroll={false}
            className={`text-sm font-semibold hover:bg-stone-100 w-full p-2 rounded ${
              props.active === item.path ? "text-stone-800" : "text-stone-800"
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
