"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import dynamic from "next/dynamic";
const UpdateDetailModal = dynamic(
  () => import("@/app/assistants/([id])/[id]/Detail/UpdateDetailModal"),
);

const CSRPage = () => {
  const params = useParams();
  const { data, isLoading, mutate } = useSWR(
    params?.id ? `/api/assistants/${params.id}` : undefined,
    (url) => fetch(url).then((res) => res.json()),
  );

  return (
    <div className={""}>
      <div className={"space-y-1"}>
        <div className={"text-3xl font-medium text-gray-800"}>
          {isLoading ? <Skeleton /> : data?.item?.name || "N/A"}
        </div>
        <div className={"text-gray-500"}>
          {isLoading ? <Skeleton /> : data?.item?.model || "N/A"}
        </div>
      </div>
      <div className={"space-y-3"}>
        <div className={"flex justify-between mt-16 pb-3 border-b"}>
          <div className={"text-gray-800 font-semibold"}>Detail</div>
          {params.id && (
            <UpdateDetailModal
              assistantId={params.id as string}
              callback={mutate}
              item={{
                name: data?.item?.name || "",
                description: data?.item?.description || "",
                instructions: data?.item?.instructions || "",
                model: data?.item?.model || "",
                metadata: {
                  voice: data?.item?.metadata.voice || "",
                },
              }}
            />
          )}
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Assistant ID</div>
          <div className={"text-sm text-gray-600"}>
            {isLoading ? (
              <Skeleton />
            ) : (
              data?.item?.SK.replace("ASST#", "") || "N/A"
            )}
          </div>
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Description</div>
          <div className={"text-sm text-gray-600 break-words"}>
            {isLoading ? (
              <Skeleton count={3} />
            ) : (
              data?.item?.description || "N/A"
            )}
          </div>
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Instructions</div>
          <div className={"text-sm text-gray-600 break-words"}>
            {isLoading ? (
              <Skeleton count={3} />
            ) : (
              data?.item?.instructions || "N/A"
            )}
          </div>
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Voice</div>
          <div className={"text-sm text-gray-600"}>
            {isLoading ? <Skeleton /> : data?.item?.metadata?.voice || "N/A"}
          </div>
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Create at</div>
          <div className={"text-sm text-gray-600"}>
            {isLoading ? (
              <Skeleton />
            ) : data?.item?.created_at ? (
              new Date(data?.item?.created_at * 1000).toLocaleString()
            ) : (
              "N/A"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSRPage;