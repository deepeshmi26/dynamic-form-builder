"use client";
import { JsonEditor } from "@/components/dynamic-form-builder/JsonEditor";
import { FormFieldConfig } from "@/components/dynamic-form-builder/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ExampleForm } from "./ExampleForm";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<FormFieldConfig[]>([]);
  const handleValidJson = (json: FormFieldConfig[]) => {
    console.log(json);
    setConfig(json);
  };

  return (
    <div className="h-screen">
      {/* Mobile Drawer */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[90%] bg-black p-6 h-full max-h-screen"
          >
            <h1 className="text-3xl font-bold text-white">JSON Editor</h1>

            <JsonEditor
              onValidJson={(json) => {
                handleValidJson(json);
                setOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        <div className="w-1/2 bg-black p-6 overflow-hidden h-full max-h-screen">
          <h1 className="text-3xl font-bold text-white">JSON Editor</h1>
          <JsonEditor onValidJson={handleValidJson} />
        </div>

        <div className="w-1/2 bg-white p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold">Form Preview</h1>
          <div className="pt-6">
            <ExampleForm config={config} />
          </div>
        </div>
      </div>

      {/* Mobile Form Preview */}
      <div className="lg:hidden p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mt-16">Form Preview</h1>
        <div className="pt-6">
          <ExampleForm config={config} />
        </div>
      </div>
    </div>
  );
}
