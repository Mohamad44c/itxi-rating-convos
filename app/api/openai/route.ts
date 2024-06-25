import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request, res: Response) {
  const { messages } = await req.json();
  console.log("messages: ", messages);
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You will be provided with a converation between an AI agent and a user, your task is to classify each conversation with either Excellent, Good, Average, Poor, Terrible.",
      },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 64,
    top_p: 1,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
