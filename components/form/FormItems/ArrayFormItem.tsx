import { useFieldArray, useFormContext } from "react-hook-form";
import { FormItemComponent } from "../FormComponent";
import { FormFieldConfig } from "../types";

type Props = {
  name: string;
  structure: FormFieldConfig[];
  path: string;
};

export function ArrayFormItem({ name, structure, path }: Props) {
  const { control } = useFormContext();
  name = `${path}.${name}`;
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
            <FormItemComponent
              key={`${name}.${index}.${item.name}`}
              control={control}
              config={{ ...item, name: `${name}.${index}.${item.name}` }}
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
