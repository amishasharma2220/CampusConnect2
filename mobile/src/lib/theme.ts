// Brand tokens mirror the web app (frontend/src/index.css) so both feel like one product.
export const colors = {
  primary: "#F2800D", // hsl(28 90% 52%)
  primaryDark: "#C96605",
  primarySoft: "#FDEBD8",
  accent: "#EE6B3C",
  ink: "#151D29", // foreground / navy
  navy: "#222A38",
  muted: "#667085",
  faint: "#98A2B3",
  border: "#E9E4DC",
  bg: "#FAF8F5",
  card: "#FFFFFF",
  success: "#12805C",
  successSoft: "#DFF5EC",
  danger: "#C8372D",
  dangerSoft: "#FCE8E6",
  warning: "#B25E09",
  warningSoft: "#FEF0C7",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const space = (n: number) => n * 4;

export const type = {
  display: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.6, color: colors.ink },
  title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3, color: colors.ink },
  heading: { fontSize: 16, fontWeight: "700" as const, color: colors.ink },
  body: { fontSize: 15, lineHeight: 22, color: colors.ink },
  small: { fontSize: 13, color: colors.muted },
  label: { fontSize: 12, fontWeight: "700" as const, letterSpacing: 0.6, textTransform: "uppercase" as const, color: colors.muted },
};

/** Accent colour per event category, used for card stripes and chips. */
export const categoryColor: Record<string, { fg: string; bg: string }> = {
  Tech: { fg: "#2952CC", bg: "#E5ECFF" },
  Technical: { fg: "#2952CC", bg: "#E5ECFF" },
  Cultural: { fg: "#B4237A", bg: "#FCE4F1" },
  Sports: { fg: "#12805C", bg: "#DFF5EC" },
  Academic: { fg: "#7A4CC2", bg: "#EFE7FB" },
  Literary: { fg: "#8A5A00", bg: "#FBF0D9" },
  Social: { fg: "#0F7A8A", bg: "#DDF4F6" },
  Professional: { fg: "#344054", bg: "#EAECF0" },
  Media: { fg: "#C8372D", bg: "#FCE8E6" },
  Wellness: { fg: "#3D7A1F", bg: "#E6F4DD" },
};

export const catColor = (c?: string | null) =>
  (c && categoryColor[c]) || { fg: colors.primaryDark, bg: colors.primarySoft };
