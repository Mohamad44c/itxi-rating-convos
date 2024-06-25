"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const RateChat = () => {
  const [conversation, setConversation] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [input, setInput] = useState<number>(0);
  const [output, setOutput] = useState<number>(0);

  async function callOpenAIAPI() {
    if (conversation === "") {
      return;
    }

    const APIBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You will be provided with a converation between an AI agent and a user, your task is to classify each conversation with either Excellent, Good, Average, Poor, Terrible." +
            conversation,
        },
      ],
      temperature: 0.7,
      max_tokens: 64,
      top_p: 1,
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      },
      body: JSON.stringify(APIBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setRating(data.choices[0].message.content);
        setInput(data.usage.prompt_tokens);
        setOutput(data.usage.completion_tokens);
      });
  }

  return (
    <>
      <div className="my-10">
        <Textarea
          className="border"
          onChange={(e) => setConversation(e.target.value)}
          placeholder="Paste your conversation"
          cols={50}
          rows={10}
        />
      </div>
      <div className="">
        <Button onClick={callOpenAIAPI}>Get Details</Button>
        {rating !== "" ? <h3>{`Rating: ${rating}`}</h3> : null}

        {input !== 0 && output !== 0 ? (
          <h3>{`Cost: input: ${input} tokens / output: ${output} token(s)`}</h3>
        ) : null}
      </div>
    </>
  );
};
