import React from "react";
import { Img, staticFile } from "remotion";
import { illustrationFor, wordEmojiScale } from "../data/wordImages";

// The picture for a word, whichever form it exists in — a drawn/app image or an emoji.
// Beats that used to take a raw emoji string take a node instead, so a word whose art is a
// real image (cage) can appear on the tiles and picture cards, not only on the see-it board.
export const WordArt: React.FC<{ word: string; size: number }> = ({ word, size }) => {
  const illo = illustrationFor(word);
  if (!illo) return null;
  if (illo.kind === "image") {
    return <Img src={staticFile(illo.src)} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  return <span style={{ fontSize: size * (wordEmojiScale[word] ?? 1) }}>{illo.char}</span>;
};
