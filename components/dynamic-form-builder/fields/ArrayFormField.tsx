import { useFieldArray, useFormContext } from "react-hook-form";
import { FormField } from "../FormField";
import { FormFieldConfig } from "../types";

type Props = {
  name: string;
  structure: FormFieldConfig[];
  path: string;
};

export function ArrayFormField({ name, structure, path }: Props) {
  const { control } = useFormContext();
  name = path.length > 0 ? `${path}.${name}` : name;
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  return (
    <div className="px-4">
      {fields.map((field, index) => (
        <div key={field.id}>
          <div>Item {index + 1}</div>
          {structure.map((item) => (
            <FormField
              key={`${name}.${index}.${item.name}`}
              settings={{}}
              control={control}
              field={{ ...item, name: `${name}.${index}.${item.name}` }}
              path={`${name}.${index}`}
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
