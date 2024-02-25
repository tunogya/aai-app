import Link from "next/link";
import { OpenAI } from "@lobehub/icons";
import React from "react";

const AbandonAI = () => {
  return (
    <Link href={"https://chat.abandon.ai"} target={"_blank"}>
      <div
        className={
          "flex flex-row items-center md:flex-col bg-[#181818] p-4 rounded-lg gap-4 md:gap-2 overflow-hidden ring-white hover:ring group"
        }
      >
        <div
          className={
            "w-28 h-28 md:w-52 md:h-52 bg-green-600 p-1 md:p-3 cursor-pointer rounded-lg relative overflow-hidden"
          }
        >
          <div className={"text-md md:text-2xl font-semibold text-white"}>
            AbandonAI
          </div>
          <div
            className={
              "absolute right-[-40px] bottom-[-40px] group-hover:animate-pulse"
            }
          >
            <OpenAI className={"w-28 h-28 md:w-40 md:h-40"} color={"white"} />
          </div>
        </div>
        <div className={"flex flex-col flex-1 md:w-52 gap-2"}>
          <div className={"text-white font-semibold"}>chat.abandon.ai</div>
          <div className={"text-[#a7a7a7] text-sm"}>
            Chat with OpenAI ChatGPT.
            <br />
            Pay as you go.
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AbandonAI;
