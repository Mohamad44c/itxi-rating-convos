"use client";

import { ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ExcelData = {
  ConversationID: number;
  Conversation: string;
  Industry: string;
  Rating?: string;
  Cost?: string;
};

export const ExcelInput = ({ className, ...props }: ComponentProps<"div">) => {
  const [data, setData] = useState<ExcelData[]>([]);
  const [conversations, setConversations] = useState<string[]>([]);
  const [ratings, setRatings] = useState<string[]>([]);

  const handleInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.warn("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);

    reader.onload = (e) => {
      const data = e.target?.result as string;

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet) as ExcelData[];

        setData(parsedData);
        const uploadedConversations = parsedData.map(
          (item) => item.Conversation
        );
        setConversations((prevConversations) => [
          ...prevConversations,
          ...uploadedConversations,
        ]);

        console.log("sheet data", parsedData);
        console.log("conversations ", uploadedConversations);
      } catch (error) {
        console.log("Error parsing Excel file:", error);
      }
    };
  };

  const callOpenAIAPI = async (conversation: string) => {
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

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + process.env.NEXT_PUBLIC_OPENAI_API_KEY,
          },
          body: JSON.stringify(APIBody),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      setRatings((prevRatings) => [
        ...prevRatings,
        data.choices[0].message.content,
      ]);
      console.log(data);
    } catch (error) {
      console.error("Error calling OpenAI API: ", error);
    }
  };

  const handleOpenAI = async () => {
    for (const conversation of conversations) {
      await callOpenAIAPI(conversation);
    }
  };

  return (
    <div
      className={twMerge("grid w-full items-center gap-1.5 p-7", className)}
      {...props}
    >
      <form
        className="flex justify-between items-center"
        onSubmit={handleOpenAI}
      >
        <div className="max-w-sm">
          <Label htmlFor="Excel">Upload Excel</Label>
          <Input id="sheet" type="file" onChange={handleInputFile} />
        </div>
        {data.length > 0 && <Button type="submit">Complete Table</Button>}
      </form>
      {data.length > 0 && (
        <Table>
          <TableCaption>A list of User - AI Chats.</TableCaption>
          <TableHeader>
            <TableRow>
              {Object.keys(data[0]).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((value, index) => (
                  <TableCell key={index}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
