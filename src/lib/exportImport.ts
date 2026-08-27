import { type AppState } from "./types";

/** Triggers a browser download of the current state as a dated JSON file. */
export function exportStateToFile(state: AppState): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lifesavingsstep-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export class ImportError extends Error {}

/** Parses and minimally validates an uploaded backup file. Throws ImportError
 * with a user-facing message on anything that doesn't look right. */
export async function importStateFromFile(file: File): Promise<AppState> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new ImportError("Could not read the file.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportError("That file isn't valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new ImportError("That file doesn't look like a LifeSavingsStep backup.");
  }
  const obj = parsed as Record<string, unknown>;
  if (
    typeof obj.schemaVersion !== "number" ||
    !Array.isArray(obj.categories) ||
    !Array.isArray(obj.events)
  ) {
    throw new ImportError("That file doesn't look like a LifeSavingsStep backup.");
  }

  return parsed as AppState;
}
