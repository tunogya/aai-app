import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";
import { SendMessageBatchCommand, SQSClient } from "@aws-sdk/client-sqs";
import redisClient from "@/utils/redisClient";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@auth0/nextjs-auth0/edge";

const sqsClient = new SQSClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const runtime = "edge";

// @ts-ignore
export async function POST(req: Request): Promise<Response> {
  // @ts-ignore
  const { user } = await getSession();
  const sub = user.sub;

  let { messages, model, id } = await req.json();

  messages.slice(-16);

  if (model === "GPT-3.5") {
    model = "gpt-3.5-turbo";
  } else if (model === "GPT-4") {
    model = "gpt-4-1106-preview";
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const res = await openai.createChatCompletion({
      model,
      messages,
      temperature: 0.7,
      stream: true,
      max_tokens: 1024,
    });

    const stream = OpenAIStream(res, {
      async onCompletion(completion) {
        const SK = `USAGE#${new Date().toISOString()}`;
        await redisClient.set(
          `USER#${sub}:${SK}`,
          JSON.stringify({
            prompt: messages,
            completion: completion,
          }),
          {
            ex: 60 * 60 * 24,
          },
        );
        // record usage log and reduce the balance of user
        await sqsClient.send(
          new SendMessageBatchCommand({
            QueueUrl: process.env.AI_DB_UPDATE_SQS_FIFO_URL,
            Entries: [
              {
                Id: `update-usage-${id}-${new Date().getTime()}`,
                MessageBody: JSON.stringify({
                  TableName: "abandonai-prod",
                  Item: {
                    PK: `USER#${sub}`,
                    SK,
                    model,
                    created: Math.floor(Date.now() / 1000),
                    TTL: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 31, // 31 days
                  },
                  ConditionExpression: "attribute_not_exists(#PK)",
                  ExpressionAttributeNames: {
                    "#PK": "PK",
                  },
                }),
                MessageAttributes: {
                  Command: {
                    DataType: "String",
                    StringValue: "PutCommand",
                  },
                },
                MessageGroupId: "update-usage",
              },
              {
                Id: `update-chat-${id}-${new Date().getTime()}`,
                MessageBody: JSON.stringify({
                  TableName: "abandonai-prod",
                  Key: {
                    PK: `USER#${sub}`,
                    SK: `CHAT2#${id}`,
                  },
                  ExpressionAttributeNames: {
                    "#messages": "messages",
                    "#updated": "updated",
                    "#title": "title",
                  },
                  ExpressionAttributeValues: {
                    ":empty_list": [],
                    ":messages": [
                      {
                        ...messages[messages.length - 1],
                        id: uuidv4(),
                        createdAt: new Date(),
                      },
                      {
                        id: uuidv4(),
                        createdAt: new Date(),
                        role: "assistant",
                        content: completion,
                      },
                    ],
                    ":updated": Math.floor(Date.now() / 1000),
                    ":title": messages[0]?.content?.slice(0, 20) || "Title",
                  },
                  UpdateExpression:
                    "SET #messages = list_append(if_not_exists(#messages, :empty_list), :messages), #updated = :updated, #title = :title",
                }),
                MessageAttributes: {
                  Command: {
                    DataType: "String",
                    StringValue: "UpdateCommand",
                  },
                },
                MessageGroupId: "update-chat",
              },
            ],
          }),
        );
      },
    });

    return new StreamingTextResponse(stream);
  } catch (e) {
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
