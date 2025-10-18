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
    <div className="px-4">
      {fields.map((field, index) => (
        <div key={field.id}>
          <div>Item {index + 1}</div>
          {structure.map((item) => (
            <FormField
              key={`${index}.${item.name}`}
              settings={{}}
              control={control}
              field={{ ...item, name: `${index}.${item.name}` }}
              path={fullFieldNameWithPath}
            />
          ))}
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append(
            structure.reduce((acc, item) => ({ ...acc, [item.name]: "" }), {})
          )
        }
      >
        Add
      </button>
    </div>
  );
}
