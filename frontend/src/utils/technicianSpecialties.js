export const TECHNICIAN_SPECIALTIES = [
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "HVAC", label: "HVAC" },
  { value: "NETWORK", label: "Network" },
  { value: "CARPENTRY", label: "Carpentry" },
  { value: "SANITATION", label: "Sanitation" },
  { value: "GENERAL_MAINTENANCE", label: "General maintenance" },
];

export const formatSpecialtyLabel = (value) => {
  const match = TECHNICIAN_SPECIALTIES.find((item) => item.value === value);
  return match?.label || value?.replaceAll("_", " ") || "Unspecified";
};
