import type { Issue } from "@evalieu/common";

const MONTH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatIssueVolLine(issue: Issue): string {
  const m = MONTH[Math.max(0, Math.min(11, issue.month - 1))] ?? "";
  return `${m} ${issue.year} · Vol. ${issue.month}`;
}
