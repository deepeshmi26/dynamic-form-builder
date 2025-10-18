"use client";
import { JsonEditor } from "@/components/dynamic-form-builder/JSONEditor";
import { FormConfig } from "@/components/dynamic-form-builder/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FORM_EXAMPLES } from "@/lib/examples";
import { Menu } from "lucide-react";
import { useState } from "react";
import { FormView } from "./component/FormView";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [formConfig, setFormConfig] = useState<FormConfig>({});
  const handleValidJson = (json: FormConfig) => {
    setFormConfig(json);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button >
              Generate Form
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[90%] bg-black p-6 h-full max-h-screen"
          >
            <div className="h-full flex flex-col">
              <div className="h-10">
                <h1 className="text-3xl font-bold text-white mb-6">JSON Editor</h1>
              </div>
              <div className="flex-1">
              <JsonEditor
                onValidJson={(json) => {
                  handleValidJson(json as FormConfig);
                  setOpen(false);
                }}
                formSamples={FORM_EXAMPLES}
              />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* JSON Editor - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex flex-col lg:w-1/2 bg-black p-6 overflow-hidden h-full max-h-screen">
          <h1 className="text-3xl font-bold text-white">JSON Editor</h1>
          <JsonEditor
            onValidJson={handleValidJson}
            formSamples={FORM_EXAMPLES}
          />
      </div>

      {/* Form Preview - Always visible */}
      <div className="flex-1 bg-white p-6 overflow-y-auto lg:w-1/2">
        <h1 className="text-3xl font-bold lg:mb-6 mt-16 lg:mt-0">
          Form Preview
        </h1>
          <FormView config={formConfig} />
        
      </div>
    </div>
  );
}
