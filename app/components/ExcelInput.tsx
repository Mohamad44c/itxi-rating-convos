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
import { useChat } from "ai/react";

export const ExcelInput = ({ className, ...props }: ComponentProps<"div">) => {
  const { messages, input, handleSubmit } = useChat({
    api: "/api/openai",
  });

  const [data, setData] = useState<String[]>([]);
  const [convo, setConvo] = useState<String[]>([]);

  const handleInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.warn("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);

    reader.onload = (e) => {
      const data = e.target?.result as string;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet) as String[];
      setData(parsedData);

      console.log(parsedData);
    };
  };

  return (
    <div
      className={twMerge("grid w-full items-center gap-1.5 p-7", className)}
      {...props}
    >
      <form
        className="flex justify-between items-center"
        onSubmit={handleSubmit}
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
