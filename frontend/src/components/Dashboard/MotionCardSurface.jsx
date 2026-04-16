import { useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { Modal } from "../Common/Modal.jsx";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference.js";

const INTERACTIVE_TARGET_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[role='button']",
  "[role='link']",
  "[data-prevent-card-open='true']",
].join(",");

const REST_SHADOW = "var(--dash-shadow)";
const HOVER_SHADOW = "0 26px 46px -32px rgba(15, 23, 42, 0.5), 0 18px 34px -32px color-mix(in srgb, var(--role-accent) 42%, transparent)";
const CARD_TRANSITION = {
  duration: 0.26,
  ease: [0.22, 1, 0.36, 1],
};
const MODAL_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};

const MOTION_TAGS = {
  article: motion.article,
  section: motion.section,
  div: motion.div,
};

const shouldIgnoreCardOpen = (event) => {
  const currentTarget = event.currentTarget;
  if (!(event.target instanceof Element) || !(currentTarget instanceof Element)) return false;
  const interactiveTarget = event.target.closest(INTERACTIVE_TARGET_SELECTOR);
  return Boolean(interactiveTarget && interactiveTarget !== currentTarget);
};

const renderDetailContent = (detailContent, close) => {
  if (typeof detailContent === "function") return detailContent({ close });
  return detailContent;
};

export const MotionCardSurface = ({
  cardId,
  sectionId,
  as = "article",
  className = "",
  contentClassName = "",
  children,
  trackSection = false,
  morphOnClick = false,
  detailTitle,
  detailContent,
  modalWidth = "max-w-3xl",
  panelClassName = "",
}) => {
  const reduceMotion = useReducedMotionPreference();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const triggerRef = useRef(null);
  const wasOpenRef = useRef(false);
  const MotionTag = MOTION_TAGS[as] || MOTION_TAGS.article;
  const canMorph = morphOnClick && Boolean(detailContent);

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  const cardAnimation = reduceMotion
    ? {}
    : {
      whileHover: { y: -5, scale: 1.012, boxShadow: HOVER_SHADOW, borderColor: "color-mix(in srgb, var(--role-accent) 32%, var(--dash-border))" },
      whileTap: { y: -1, scale: 0.985 },
      transition: CARD_TRANSITION,
    };

  const contentAnimation = reduceMotion
    ? {}
    : {
      variants: {
        rest: { y: 0 },
        hover: { y: -2 },
      },
      initial: "rest",
      animate: focused ? "hover" : "rest",
      transition: CARD_TRANSITION,
    };

  const handleOpen = (event) => {
    if (!canMorph || shouldIgnoreCardOpen(event)) return;
    setOpen(true);
  };

  const handleKeyDown = (event) => {
    if (!canMorph) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <LayoutGroup id={cardId}>
      <MotionTag
        ref={triggerRef}
        id={sectionId}
        layoutId={canMorph && !reduceMotion ? cardId : undefined}
        className={`saas-card dashboard-motion-card ${className}`.trim()}
        data-motion-card="true"
        data-has-affordance={canMorph ? "true" : undefined}
        data-dashboard-section={trackSection ? "true" : undefined}
        role={canMorph ? "button" : undefined}
        tabIndex={canMorph ? 0 : undefined}
        aria-haspopup={canMorph ? "dialog" : undefined}
        aria-expanded={canMorph ? open : undefined}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ boxShadow: REST_SHADOW }}
        {...cardAnimation}
      >
        <motion.div
          className={`dashboard-motion-card-content ${canMorph ? "dashboard-motion-card-content-has-affordance" : ""} ${contentClassName}`.trim()}
          onHoverStart={canMorph ? () => setFocused(true) : undefined}
          onHoverEnd={canMorph ? () => setFocused(false) : undefined}
          {...contentAnimation}
        >
          {children}
        </motion.div>

        {canMorph && (
          <motion.span
            className="dashboard-motion-card-affordance"
            aria-hidden="true"
            animate={focused && !reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.72, y: 0, scale: 1 }}
            transition={CARD_TRANSITION}
          >
            <Expand size={14} />
            Detail
          </motion.span>
        )}
      </MotionTag>

      {canMorph && (
        <Modal
          open={open}
          title={detailTitle}
          onClose={() => setOpen(false)}
          width={modalWidth}
          motionId={!reduceMotion ? cardId : undefined}
          panelClassName={`dashboard-motion-detail-panel ${panelClassName}`.trim()}
          headerAction={(
            <div className="dashboard-motion-modal-chip">
              <Expand size={14} />
              Inspect
            </div>
          )}
          transition={reduceMotion ? undefined : MODAL_TRANSITION}
        >
          {renderDetailContent(detailContent, () => setOpen(false))}
        </Modal>
      )}
    </LayoutGroup>
  );
};
