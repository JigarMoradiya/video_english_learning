import { loadFont } from "@remotion/google-fonts/Fredoka";

// Fredoka — a rounded, friendly, kid-appropriate font. Loaded once here.
const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
});

export const KID_FONT = fontFamily;
