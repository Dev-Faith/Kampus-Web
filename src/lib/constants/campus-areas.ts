export const CAMPUS_AREA_CODES = [
  "all",
  "gidankwano",
  "gidanpainti",
  "gidanmangoro",
  "dama",
  "bosso_front",
  "bosso_back",
] as const;

export const CAMPUS_AREA_OPTIONS = [
  { id: "all", label: "All areas", campus: "all" },
  { id: "gidankwano", label: "Gidankwano", campus: "Gidankwano Campus" },
  { id: "gidanpainti", label: "Gidanpainti", campus: "Gidankwano Campus" },
  { id: "gidanmangoro", label: "Gidanmangoro", campus: "Gidankwano Campus" },
  { id: "dama", label: "Dama", campus: "Gidankwano Campus" },
  { id: "bosso_front", label: "Front of school", campus: "Bosso Campus" },
  { id: "bosso_back", label: "Back of school", campus: "Bosso Campus" },
] as const;

export function getCampusAreaLabel(area?: string | null): string | null {
  return CAMPUS_AREA_OPTIONS.find((option) => option.id === area)?.label ?? null;
}
