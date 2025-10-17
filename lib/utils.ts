import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJson(jsonString: string): string {
  const cleanedJson = jsonString.replace(/,(\s*[}\]])/g, "$1");

  try {
    const parsed = JSON.parse(cleanedJson);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw error;
  }
}

export function mergeDeep<TTarget extends Record<string, unknown>>(
  target: TTarget,
  ...sources: Record<string, unknown>[]
): TTarget {
  const output: Record<string, unknown> = { ...target };
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = output[key];
      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        output[key] = mergeDeep(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else {
        output[key] = sourceValue;
      }
    }
  }
  return output as TTarget;
}
