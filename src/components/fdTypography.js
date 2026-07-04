import { FD_STEP1_COLORS } from "./fdLayout";

/** Form Department typography tokens from the brand guide. */

/** Same fill as the left-column note card (FD_STEP1_COLORS.note). */
export const FD_STEP_FIELD_SURFACE = FD_STEP1_COLORS.note;

/** Borderless field surface — use on inputs/textareas in steps 1–3. */
export const fdStepFieldSurfaceClass =
  "border-0 bg-[#E9E7E1] focus:outline-none focus:ring-0 rounded-md";

/** Line Strategy–style text inputs / textareas on cream steps. */
export const fdStepInputClass = `mt-3 w-full px-4 py-2.5 text-[14px] font-sans text-[#2B2A25] placeholder-black/40 ${fdStepFieldSurfaceClass}`;
/** White wordmark — step flows, market analysis, and dark UI heroes. */
export const FD_LOGO_WHITE_SRC = "/assets/update.png";

/** Capsule Builder lockup — homepage hero only. */
export const FD_HOME_LOGO_SRC = "/assets/update.png";

export const fdSubheaderClass =
  "font-sans font-light uppercase text-[18px] sm:text-[22px] md:text-[25px] tracking-[0.23em] leading-[1.2]";

export const fdHeaderClass =
  "font-heading font-normal uppercase text-[34px] sm:text-[44px] md:text-[56px] tracking-[0.01em] leading-[1.05] md:leading-[50px]";

export const fdBodyClass =
  "font-sans font-light text-[16px] sm:text-[22px] md:text-[32px] tracking-[0.01em] leading-[1.2] md:leading-[32px]";

export const fdBodyTitleClass =
  "font-sans font-medium text-[16px] sm:text-[22px] md:text-[32px] tracking-[0.01em] leading-[1.2] md:leading-[32px]";

export const fdStepLabelClass =
  "font-sans font-light uppercase text-[11px] sm:text-[12px] tracking-[0.23em] text-[#8C7152]";

export const fdFieldLabelClass =
  "font-sans font-medium uppercase text-[11px] sm:text-[12px] tracking-[0.22em] text-[#8C7152]";

/** Line Strategy–style field labels (desktop steps 1–5). */
export const fdStepFieldLabelClass =
  "block text-[12px] tracking-[0.22em] uppercase font-sans text-[#8C7152] font-medium";

export const fdFormShellClass =
  "mx-auto w-full max-w-[560px] rounded-[34px] bg-[#F2EFEA] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-6 py-10 sm:px-10 sm:py-12";

export const fdBackingBoxClass =
  "rounded-[18px] bg-[#E9E7E1] border border-[#DFDDD6] px-5 py-4 sm:px-6 sm:py-5";
