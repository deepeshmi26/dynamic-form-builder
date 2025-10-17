"use client";

import { createContext, useContext } from "react";
import { FieldValues } from "react-hook-form";
import { FormRegistryContext as FormRegistryContextType } from "../types";

export const FormRegistryContext = createContext<
  FormRegistryContextType<FieldValues>
>({});

export function useFormRegistryContext<T extends FieldValues>() {
  return useContext(
    FormRegistryContext as unknown as React.Context<FormRegistryContextType<T>>
  );
}
