"use client";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormField } from "../FormField";
import { FormFieldConfig } from "../types";

type Props = {
  structure: FormFieldConfig[];
  fullFieldNameWithPath: string;
};

export function ArrayFormField({ structure, fullFieldNameWithPath }: Props) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: fullFieldNameWithPath,
  });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-4">
            {structure.map((item) => (
                <FormField
                  key={`${index}.${item.name}`}
                  settings={{}}
                  control={control}
                  field={{ ...item, name: `${index}.${item.name}` }}
                  path={fullFieldNameWithPath}
                />
            ))}
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            className="shrink-0 p-2 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className="flex">
        <button
          type="button"
          onClick={() =>
            append(
              structure.reduce((acc, item) => ({ ...acc, [item.name]: "" }), {})
            )
          }
          className="p-2 hover:text-green-500"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
