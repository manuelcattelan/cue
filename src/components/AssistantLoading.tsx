import { semanticColors } from "../lib/colors.js";
import spinners, { type SpinnerName } from "cli-spinners";
import { Text } from "ink";
import { useEffect, useState } from "react";
import tinygradient from "tinygradient";

const SHIMMER_COLOR_BASE = semanticColors.muted;
const SHIMMER_COLOR_HIGHLIGHT = semanticColors.mutedAccent;

const SHIMMER_UPDATE_MS = 20;
const SHIMMER_WAVE_WIDTH = 10;

type MessageLoadingProps = {
  type: SpinnerName;
};

export const AssistantLoading = ({ type }: MessageLoadingProps) => {
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [shimmerPosition, setShimmerPosition] = useState(0);

  const spinner = spinners[type];

  const gradient = tinygradient([
    { color: SHIMMER_COLOR_BASE, pos: 0 },
    { color: SHIMMER_COLOR_HIGHLIGHT, pos: 0.5 },
    { color: SHIMMER_COLOR_BASE, pos: 1 },
  ]);

  useEffect(() => {
    const spinnerTimer = setInterval(() => {
      setSpinnerFrame((prev) => (prev + 1) % spinner.frames.length);
    }, spinner.interval);

    return () => clearInterval(spinnerTimer);
  }, [spinner]);

  useEffect(() => {
    const shimmerTimer = setInterval(() => {
      setShimmerPosition((prev) => (prev + 1) % 100);
    }, SHIMMER_UPDATE_MS);

    return () => clearInterval(shimmerTimer);
  }, []);

  const loadingText = `${spinner.frames[spinnerFrame]} Cueing up…`;
  const loadingTextCharacters = loadingText.split("");

  const shimmerWaveColors = gradient.rgb(SHIMMER_WAVE_WIDTH);

  const renderedLoadingText = loadingTextCharacters
    .map((char, index) => {
      const shimmerWavePosition =
        -SHIMMER_WAVE_WIDTH +
        (shimmerPosition / 100) *
          (loadingTextCharacters.length + SHIMMER_WAVE_WIDTH * 2);

      const offsetFromWave = index - shimmerWavePosition;

      const gradientCenter = Math.floor(shimmerWaveColors.length / 2);
      const gradientColorIndex = Math.max(
        0,
        Math.min(
          shimmerWaveColors.length - 1,
          Math.floor(gradientCenter + offsetFromWave),
        ),
      );

      const hex = shimmerWaveColors[gradientColorIndex].toHexString();
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      return `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
    })
    .join("");

  return <Text>{renderedLoadingText}</Text>;
};
