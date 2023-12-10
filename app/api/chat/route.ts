import {
  experimental_StreamData,
  OpenAIStream,
  StreamingTextResponse,
  Message,
} from "ai";
import OpenAI from "openai";
import { SendMessageBatchCommand, SQSClient } from "@aws-sdk/client-sqs";
import { getSession } from "@auth0/nextjs-auth0/edge";
import { NextRequest, NextResponse } from "next/server";
import dysortid from "@/app/utils/dysortid";
import redisClient from "@/app/utils/redisClient";
import { Ratelimit } from "@upstash/ratelimit";

const sqsClient = new SQSClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const runtime = "edge";

const cache = new Map();

// @ts-ignore
export async function POST(req: NextRequest): Promise<Response> {
  // @ts-ignore
  const { user } = await getSession();
  const sub = user.sub;

  let { messages, model, id, functions, imageUrl } = await req.json();
  // handler for image
  if (imageUrl) {
    // only gpt-4-vision-preview is supported
    model = "gpt-4-vision-preview";
    const initialMessages = messages.slice(0, -1);
    const currentMessage = messages[messages.length - 1];
    messages = [
      ...initialMessages,
      {
        ...currentMessage,
        content: [
          { type: "text", text: currentMessage.content },
          {
            type: "image_url",
            image_url: imageUrl,
          },
        ],
      },
    ];
  }

  let max_tokens = 1024;

  const isPremium = await redisClient.get(`premium:${sub}`);

  if (model?.startsWith("gpt-4")) {
    if (!isPremium) {
      return new Response(
        JSON.stringify({
          error: "premium required",
          message: "Sorry, you need a Premium subscription to use this.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const ratelimit = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(50, "3 h"),
      analytics: true,
      prefix: "ratelimit:/api/chat:gpt-4",
      ephemeralCache: cache,
    });
    const { success, limit, reset, remaining } = await ratelimit.limit(sub);
    if (!success) {
      return new Response(
        JSON.stringify({
          error: "limit reached",
          message: "Sorry, you have reached the limit. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "x-ratelimit-limit-requests": `${limit}`,
            "x-ratelimit-remaining-requests": `${remaining}`,
            "x-ratelimit-reset-requests": `${reset}`,
          },
        },
      );
    }

    max_tokens = 4096;
    messages?.slice(-8);
  } else {
    if (!isPremium) {
      const ratelimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(50, "1 h"),
        analytics: true,
        prefix: "ratelimit:/api/chat:gpt-3.5",
        ephemeralCache: cache,
      });
      const { success, limit, reset, remaining } = await ratelimit.limit(sub);
      if (!success) {
        return new Response(
          JSON.stringify({
            error: "limit reached",
            message:
              "Sorry, you have reached the limit. Please try again later.",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "x-ratelimit-limit-requests": `${limit}`,
              "x-ratelimit-remaining-requests": `${remaining}`,
              "x-ratelimit-reset-requests": `${reset}`,
            },
          },
        );
      }
    }

    messages?.slice(-8);
  }

  const openai = new OpenAI();

  const list_append: Array<Message> = [];
  list_append.push({
    ...messages[messages.length - 1],
    id: dysortid(),
    createdAt: new Date(),
  });

  try {
    const res = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      stream: true,
      max_tokens,
      functions: functions,
    });
    const data = new experimental_StreamData();
    const stream = OpenAIStream(res, {
      experimental_onFunctionCall: async () => {},
      async onCompletion(completion) {
        try {
          const { function_call } = JSON.parse(completion);
          const _name = function_call.name;
          list_append.push({
            id: dysortid(),
            createdAt: new Date(),
            role: "assistant",
            name: _name,
            content: "",
            function_call,
          });
        } catch (e) {
          list_append.push({
            id: dysortid(),
            createdAt: new Date(),
            role: "assistant",
            content: completion,
          });
        }
      },
      async onFinal(completion) {
        await sqsClient.send(
          new SendMessageBatchCommand({
            QueueUrl: process.env.AI_DB_UPDATE_SQS_FIFO_URL,
            Entries: [
              {
                Id: `chat_${id}_${new Date().getTime()}`,
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
                    ":messages": list_append,
                    ":updated": Math.floor(Date.now() / 1000),
                    ":title": messages[0]?.content?.slice(0, 40) || "Title",
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
                MessageGroupId: `chat_${id}`,
              },
            ],
          }),
        );
        await data.close();
      },
      experimental_streamData: true,
    });
    return new StreamingTextResponse(stream, {}, data);
  } catch (e) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
