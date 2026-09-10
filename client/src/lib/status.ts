export type Tone = "neutral" | "green" | "amber" | "red";

export const statusTone = (status: string): Tone => {
  if (status === "delivered" || status === "paid" || status === "active") return "green";
  if (status === "cancelled" || status === "failed" || status === "suspended") return "red";
  return "amber";
};
