export const formatDate = (value) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export const titleCase = (value) => value?.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || "";

export const toHours = (start, end) => {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, diff / 3_600_000);
};
