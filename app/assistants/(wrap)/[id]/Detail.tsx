"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";

const CSRPage = () => {
  const params = useParams();
  const { data, isLoading } = useSWR(
    params?.id ? `/api/assistants/${params.id}` : undefined,
    (url) => fetch(url).then((res) => res.json()),
  );

  return (
    <div className={""}>
      <div className={"space-y-1"}>
        <div className={"text-3xl font-medium text-gray-800"}>
          {data?.item.name || <Skeleton />}
        </div>
        <div className={"text-gray-500"}>
          {data?.item.model || <Skeleton />}
        </div>
      </div>
      <div className={"space-y-3"}>
        <div className={"flex justify-between mt-16 pb-3 border-b"}>
          <div className={"text-gray-800 font-semibold"}>Detail</div>
          <button
            disabled
            className={
              "text-sm text-[#0066FF] font-medium disabled:cursor-auto disabled:opacity-50"
            }
          >
            Edit
          </button>
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Assistant ID</div>
          <div className={"text-sm text-gray-600"}>
            {data?.item?.SK.replace("ASST#", "") || <Skeleton />}
          </div>
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Instructions</div>
          <div className={"text-sm text-gray-600 break-words"}>
            {data?.item?.instructions || <Skeleton count={3} />}
          </div>
        </div>
        <div>
          <div className={"text-sm text-gray-500"}>Voice</div>
          <div className={"text-sm text-gray-600"}>
            {data?.item?.voice || <Skeleton />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSRPage;
