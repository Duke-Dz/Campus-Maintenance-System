const MOBILE_SECTION_GUTTER = 14;
const DESKTOP_SECTION_GUTTER = 20;

const getDashboardTopOffset = () => {
  const topBarRect = document.querySelector(".command-topbar")?.getBoundingClientRect();
  const topBarHeight = topBarRect ? Math.max(0, topBarRect.bottom) : 0;
  const gutter = window.matchMedia("(min-width: 640px)").matches ? DESKTOP_SECTION_GUTTER : MOBILE_SECTION_GUTTER;
  return topBarHeight + gutter;
};

export const scrollToDashboardSection = (sectionId, behavior = "smooth") => {
  if (typeof window === "undefined" || typeof document === "undefined" || !sectionId) return false;

  const target = document.getElementById(sectionId);
  if (!target) return false;

  const top = Math.max(
    0,
    window.scrollY + target.getBoundingClientRect().top - getDashboardTopOffset()
  );

  window.scrollTo({ top, behavior });
  return true;
};
