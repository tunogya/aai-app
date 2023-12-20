import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import ddbDocClient from "@/app/utils/ddbDocClient";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import OpenAI from "openai";

const GET = async (req: NextRequest) => {
  const session = await getSession();
  const sub = session?.user.sub;
  const limit = Number(req?.nextUrl?.searchParams?.get("limit") || 20);
  const cursor = req?.nextUrl?.searchParams?.get("cursor") || undefined;
  try {
    const { Items, Count, LastEvaluatedKey } = await ddbDocClient.send(
      new QueryCommand({
        TableName: "abandonai-prod",
        KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${sub}`,
          ":sk": "ASST#",
        },
        ExpressionAttributeNames: {
          "#pk": "PK",
          "#sk": "SK",
        },
        Limit: limit,
        ScanIndexForward: false,
        ExclusiveStartKey: cursor
          ? {
              PK: `USER#${sub}`,
              SK: `ASST#${cursor}`,
            }
          : undefined,
      }),
    );
    return NextResponse.json({
      items: Items,
      count: Count,
      nextCursor: LastEvaluatedKey?.SK.replace("ASST#", "") || undefined,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "ddbDocClient error",
      },
      {
        status: 500,
      },
    );
  }
};

const POST = async (req: NextRequest) => {
  const session = await getSession();
  const sub = session?.user.sub;
  const { name, description, instructions, metadata, model } = await req.json();
  try {
    const openai = new OpenAI();
    const newAssistant = await openai.beta.assistants.create({
      instructions,
      name,
      description,
      model,
      metadata,
    });
    const item = {
      ...newAssistant,
      PK: `USER#${sub}`,
      SK: `ASST#${newAssistant.id}`,
    };
    await ddbDocClient.send(
      new PutCommand({
        TableName: "abandonai-prod",
        Item: item,
        ConditionExpression:
          "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      }),
    );
    return NextResponse.json({
      success: true,
      item,
    });
  } catch (e) {
    return NextResponse.json({
      error: "ddbDocClient error",
    });
  }
};

export { GET, POST };
