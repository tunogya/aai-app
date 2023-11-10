import React from "react";
import TopUpButton from "@/components/TopUpButton";
import ManageBillingButton from "@/components/ManageBillingButton";
import SubscribeButton from "@/components/SubscribeButton";
import Balance from "@/app/billing/Balance";

export const runtime = "edge";

export default async function SSRPage() {
  return (
    <div
      className={
        "px-4 md:px-10 md:pt-2 absolute h-[calc(100vh-60px)] w-full overflow-y-auto space-y-20"
      }
    >
      <div className={"space-y-4"}>
        <div className={"text-3xl text-gray-800 font-semibold"}>
          Abandon credits
        </div>
        <div className={"text-xl text-gray-800 font-semibold"}>
          Available balance
        </div>
        <Balance />
        <div className={"text-gray-600 text-sm max-w-screen-md"}>
          Credits can be used to offset expenses within the Abandon platform,
          including the Abandon+ subscription.
        </div>
        <div className={"flex gap-4"}>
          <TopUpButton />
        </div>
      </div>
      <div className={"space-y-4"}>
        <div className={"text-3xl text-gray-800 font-semibold"}>AbandonAI+</div>
        <div className={"text-xl text-gray-800 font-semibold"}>
          You currently hold a valid subscription.
        </div>
        <div className={"text-gray-600 text-sm"}>
          Enjoy all our features for free.
        </div>
        <div className={"flex gap-4"}>
          <SubscribeButton />
          <ManageBillingButton />
        </div>
      </div>
    </div>
  );
}
