import { Metadata } from "next";
import { ReactNode } from "react";
import Dock from "@/components/Dock";
import Toolbar from "@/components/Toolbar";
import PrimaryNav from "@/components/Nav/PrimaryNav";

export const runtime = "edge";

const title = "Note";
const description = "Powered by OpenAI";

export const metadata: Metadata = {
  title,
  description,
};

export default function Layout(props: {
  children: ReactNode;
  secondaryNav: ReactNode;
}) {
  return (
    <div className={"h-full w-full flex relative justify-center"}>
      <div className={"max-w-[1920px] w-full h-full flex overflow-hidden"}>
        <PrimaryNav active={"/note"} />
        {props.secondaryNav}
        <div className={"w-full mr-10 relative"}>
          <Toolbar border={false} />
          {props.children}
        </div>
      </div>
      <Dock />
    </div>
  );
}