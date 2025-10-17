"use client";
import { JsonEditor } from "@/components/form/JSONEditor";
import { ExampleForm } from "./ExampleForm";

export default function Home() {
  const handleValidJson = (json: any) => {
    console.log(json);
  };
  return (
    <>
      <ExampleForm />
      <JsonEditor onValidJson={handleValidJson} />
    </>
  );
}
