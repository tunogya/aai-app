import { Dialog, Transition } from "@headlessui/react";
import React, { FC, Fragment, useState } from "react";
import Link from "next/link";

const Modal: FC<{
  assistantId: string;
  callback: () => void;
}> = ({ assistantId, callback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [token, setToken] = useState("");

  const updateTelegramToken = async (token: string) => {
    setStatus("loading");
    try {
      await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: `https://api.abandon.ai/webhook/telegram/${token}`,
          max_connections: 100,
          drop_pending_updates: true,
        }),
      });
      await fetch(`/api/assistants/${assistantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            telegram: token,
          },
        }),
      }).then((res) => res.json());
      setStatus("success");
      setIsOpen(false);
      callback();
    } catch (e) {
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          "text-sm text-[#0066FF] font-medium disabled:cursor-auto disabled:opacity-50"
        }
      >
        Edit
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                  >
                    <div>Add Telegram Bot</div>
                  </Dialog.Title>
                  <div className={"space-y-4 h-fit mt-4"}>
                    <div className={"space-y-2 text-gray-800"}>
                      <div className={"font-semibold text-sm"}>Token</div>
                      <input
                        maxLength={50}
                        type={"password"}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder={"Enter telegram bot token"}
                        className={
                          "border text-sm overflow-x-scroll  w-full h-7 px-2 py-1 rounded focus:outline-[#0066FF]"
                        }
                      />
                    </div>
                  </div>
                  <div className={"text-xs text-gray-500 pt-2"}>
                    To get started, message{" "}
                    <Link
                      className={"text-blue-400 underline"}
                      href={"https://t.me/BotFather"}
                    >
                      @BotFather
                    </Link>{" "}
                    on Telegram to register your bot and receive its
                    authentication token.
                  </div>
                  <div className={"mt-10 flex justify-end gap-2"}>
                    <button
                      onClick={() => updateTelegramToken(token)}
                      disabled={!token}
                      className={
                        "bg-[#0066FF] text-white rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
                      }
                    >
                      {status === "loading" && "Adding..."}
                      {status === "idle" && "Add"}
                      {status === "error" && "Error"}
                      {status === "success" && "Added!"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
