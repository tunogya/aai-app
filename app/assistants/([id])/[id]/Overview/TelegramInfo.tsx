"use client";

import { FC, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";
import Skeleton from "react-loading-skeleton";

const TelegramInfo: FC<{
  token: string;
}> = ({ token }) => {
  const { data: me, isLoading: isMeLoading } = useSWR(
    token ? `https://api.telegram.org/bot${token}/getMe` : undefined,
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) => res?.result),
  );
  const {
    data: webhookInfo,
    mutate: mutateWebhook,
    isLoading: isWebhookInfoLoading,
  } = useSWR(
    token ? `https://api.telegram.org/bot${token}/getWebhookInfo` : undefined,
    (url) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) => res?.result),
  );
  const [status, setStatus] = useState("idle");

  const setWebhook = async (url: string) => {
    setStatus("loading");
    try {
      await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          max_connections: 100,
          drop_pending_updates: true,
        }),
      });
      await mutateWebhook();
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  const isWebhookOk =
    webhookInfo &&
    token &&
    webhookInfo?.url === `https://app.abandon.ai/api/bot/${token}`;

  return (
    <div className={"space-y-2"}>
      <div className={"pt-3 flex items-center"}>
        {isWebhookInfoLoading ? (
          <div className={"h-6 w-6"}>
            <Skeleton className={"w-full h-full"} circle={true} />
          </div>
        ) : isWebhookOk ? (
          <ShieldCheckIcon className={"w-5 h-5 text-[#0066FF]"} />
        ) : (
          <ShieldExclamationIcon className={"w-5 h-5 text-red-500"} />
        )}
        <div className={"font-semibold text-gray-800 h-6 mx-1"}>
          {me?.first_name || (
            <div className={"h-full w-32"}>
              <Skeleton className={"w-full h-full"} />
            </div>
          )}
        </div>
        <Link
          href={`https://t.me/${me?.username}`}
          target={"_blank"}
          className={"text-gray-500 text-sm hover:underline w-32 h-5 mx-1"}
        >
          {me?.username ? (
            `@${me?.username}`
          ) : (
            <div className={"h-full w-20"}>
              <Skeleton className={"w-full h-full"} />
            </div>
          )}
        </Link>
      </div>
      {isWebhookInfoLoading ? (
        <div className={"h-full w-20"}>
          <Skeleton className={"w-full h-full"} />
        </div>
      ) : (
        <div className={"flex items-center gap-2"}>
          {isWebhookOk ? (
            <>
              <button
                className={
                  "border border-gray-300 rounded-md px-2 py-1 text-xs hover:shadow"
                }
                onClick={async () => {
                  await setWebhook(``);
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  await setWebhook(`https://app.abandon.ai/api/bot/${token}`);
                }}
                disabled={status === "loading"}
              >
                {status === "idle" && "Restart"}
                {status === "loading" && "Sleep..."}
                {status === "error" && "Shutdown error!"}
              </button>
              {status !== "loading" && (
                <button
                  className={
                    "border border-gray-300 rounded-md px-2 py-1 text-xs hover:shadow"
                  }
                  onClick={() => setWebhook(``)}
                  disabled={status === "loading"}
                >
                  {status === "idle" && "Shutdown"}
                  {status === "loading" && "Sleep..."}
                  {status === "error" && "Shutdown error!"}
                </button>
              )}
            </>
          ) : (
            <button
              className={
                "border border-gray-300 rounded-md px-2 py-1 text-xs hover:shadow"
              }
              onClick={() =>
                setWebhook(`https://app.abandon.ai/api/bot/${token}`)
              }
              disabled={status === "loading"}
            >
              {status === "idle" && "Wake up"}
              {status === "loading" && "Connect..."}
              {status === "error" && "Wake up error!"}
            </button>
          )}
        </div>
      )}
      <div className={"text-gray-500 text-xs"}>
        When your bot is not working properly, you can try restarting it.
      </div>
    </div>
  );
};

export default TelegramInfo;