import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import ddbDocClient from "@/utils/ddbDocClient";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { roundUp } from "@/utils/roundUp";

const GET = async (req: NextRequest) => {
  const session = await getSession();
  const sub = session?.user.sub;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const numDays = new Date(year, month + 1, 0).getDate();

  const dates = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(year, month, i + 1, 8, 0, 0);
    if (date <= today) {
      dates.push(date.toISOString().slice(0, 10));
    }
  }

  const { Items: UsageItems } = await ddbDocClient.send(
    new QueryCommand({
      TableName: "abandonai-prod",
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
      FilterExpression: `#created >= :firstDay`,
      ExpressionAttributeNames: {
        "#pk": "PK",
        "#sk": "SK",
        "#created": "created",
      },
      ExpressionAttributeValues: {
        ":pk": `USER#${sub}`,
        ":sk": "USAGE#",
        ":firstDay": Math.floor(firstDay.getTime() / 1000),
      },
      ProjectionExpression: "total_cost, created, model",
    }),
  );

  const daily = dates.map((item) => ({
    date: item,
    gpt4: UsageItems?.filter((usageItem) => usageItem.model.startsWith("gpt-4"))
      ?.filter(
        (usageItem) =>
          new Date(usageItem.created * 1000).toISOString().slice(0, 10) ===
          item,
      )
      .reduce((acc, usageItem) => acc + usageItem.total_cost, 0),
    gpt3_5: UsageItems?.filter((usageItem) =>
      usageItem.model.startsWith("gpt-3.5"),
    )
      ?.filter(
        (usageItem) =>
          new Date(usageItem.created * 1000).toISOString().slice(0, 10) ===
          item,
      )
      .reduce((acc, usageItem) => acc + usageItem.total_cost, 0),
    total: UsageItems?.filter(
      (usageItem) =>
        new Date(usageItem.created * 1000).toISOString().slice(0, 10) === item,
    ).reduce((acc, usageItem) => acc + usageItem.total_cost, 0),
  }));

  return NextResponse.json({
    daily: daily.map((item) => ({
      ...item,
      total: roundUp(item?.total || 0, 6),
      gpt4: roundUp(item?.gpt4 || 0, 6),
      gpt3_5: roundUp(item?.gpt3_5 || 0, 6),
    })),
    cost: {
      today: daily[daily.length - 1].total,
      yesterday: daily[daily.length - 2].total,
      month: daily.reduce((acc, item) => acc + item.total!, 0),
    },
  });
};

export { GET };
