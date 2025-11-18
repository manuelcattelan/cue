import { semanticColors } from "../../lib/colors.js";
import { Separator } from "../layout/Separator.js";
import chalk from "chalk";
import { Box, Text, useInput } from "ink";
import { useMemo, useState } from "react";

type LineWithBoundaries = {
  positionFrom: number;
  positionTo: number;
  content: string;
};

const getLinesWithBoundaries = (input: string): LineWithBoundaries[] => {
  const lines = input.split("\n");

  let position = 0;
  return lines.map((line) => {
    const positionFrom = position;
    const positionTo = position + line.length;

    // Inside the input there's a newline character in between each line and
    // we need to account for its position.
    position = positionTo + 1;

    return { positionFrom, positionTo, content: line };
  });
};

const getLineCoordinatesAtPosition = (
  linesWithBoundaries: LineWithBoundaries[],
  cursorPosition: number,
) => {
  const lineRow = linesWithBoundaries.findIndex(
    (line) =>
      cursorPosition >= line.positionFrom && cursorPosition <= line.positionTo,
  );

  if (lineRow === -1 || !linesWithBoundaries[lineRow]) {
    return null;
  }

  return {
    lineRow,
    lineColumn: cursorPosition - linesWithBoundaries[lineRow].positionFrom,
  };
};

type TextInputProps = {
  onSubmit?: (content: string) => void;
};

export const TextInput = ({ onSubmit }: TextInputProps) => {
  const inputPlaceholder = "Take your cue…";

  const [currentInput, setCurrentInput] = useState<string>("");
  const [currentCursorPosition, setCurrentCursorPosition] = useState<number>(
    currentInput.length,
  );

  const [lineColumnGoal, setLineColumnGoal] = useState<number>(0);

  const renderedInputPlaceholder = useMemo(
    () =>
      inputPlaceholder && inputPlaceholder.length > 0
        ? chalk.inverse(inputPlaceholder[0]) +
          chalk.hex(semanticColors.muted)(inputPlaceholder.slice(1))
        : undefined,
    [inputPlaceholder],
  );

  const renderedCurrentInput = useMemo(() => {
    if (currentInput.length === 0) {
      return "";
    }

    const characters = [...currentInput].map((character, characterPosition) => {
      if (characterPosition === currentCursorPosition) {
        return character === "\n"
          ? `${chalk.inverse(" ")}\n`
          : chalk.inverse(character);
      }
      return character;
    });

    if (currentCursorPosition === currentInput.length) {
      characters.push(chalk.inverse(" "));
    }

    return characters.join("");
  }, [currentInput, currentCursorPosition]);

  const currentInputLinesWithBoundaries = useMemo(
    () => getLinesWithBoundaries(currentInput),
    [currentInput],
  );

  useInput((input, key) => {
    let newInput = currentInput;
    let newCursorPosition = currentCursorPosition;
    let newLineColumnGoal = lineColumnGoal;

    switch (true) {
      case key.leftArrow: {
        newCursorPosition--;

        newLineColumnGoal =
          getLineCoordinatesAtPosition(
            currentInputLinesWithBoundaries,
            newCursorPosition,
          )?.lineColumn ?? newLineColumnGoal;

        break;
      }

      case key.rightArrow: {
        newCursorPosition++;

        newLineColumnGoal =
          getLineCoordinatesAtPosition(
            currentInputLinesWithBoundaries,
            newCursorPosition,
          )?.lineColumn ?? newLineColumnGoal;

        break;
      }

      case key.upArrow: {
        const lineCoordinates = getLineCoordinatesAtPosition(
          currentInputLinesWithBoundaries,
          currentCursorPosition,
        );

        if (lineCoordinates && lineCoordinates.lineRow > 0) {
          const targetLine =
            currentInputLinesWithBoundaries[lineCoordinates.lineRow - 1];

          if (targetLine) {
            const targetLineColumn = Math.min(
              lineColumnGoal,
              targetLine.content.length,
            );
            newCursorPosition = targetLine.positionFrom + targetLineColumn;
          }
        }

        break;
      }

      case key.downArrow: {
        const lineCoordinates = getLineCoordinatesAtPosition(
          currentInputLinesWithBoundaries,
          currentCursorPosition,
        );

        if (
          lineCoordinates &&
          lineCoordinates.lineRow < currentInputLinesWithBoundaries.length - 1
        ) {
          const targetLine =
            currentInputLinesWithBoundaries[lineCoordinates.lineRow + 1];

          if (targetLine) {
            const targetLineColumn = Math.min(
              lineColumnGoal,
              targetLine.content.length,
            );
            newCursorPosition = targetLine.positionFrom + targetLineColumn;
          }
        }

        break;
      }

      case key.backspace || key.delete: {
        if (currentCursorPosition > 0) {
          newInput =
            currentInput.slice(0, currentCursorPosition - 1) +
            currentInput.slice(currentCursorPosition);

          newCursorPosition--;

          const newInputLines = getLinesWithBoundaries(newInput);
          newLineColumnGoal =
            getLineCoordinatesAtPosition(newInputLines, newCursorPosition)
              ?.lineColumn ?? newLineColumnGoal;
        }

        break;
      }

      case key.return: {
        newInput =
          currentInput.slice(0, currentCursorPosition) +
          "\n" +
          currentInput.slice(currentCursorPosition);

        newCursorPosition++;
        newLineColumnGoal = 0;

        break;
      }

      case key.ctrl && input === "u": {
        newInput = "";
        newCursorPosition = 0;
        newLineColumnGoal = 0;

        break;
      }

      case key.ctrl && input === "d": {
        const trimmedInput = currentInput.trim();

        if (trimmedInput.length === 0) {
          break;
        }

        if (onSubmit) {
          onSubmit(trimmedInput);
        }

        newInput = "";
        newCursorPosition = 0;
        newLineColumnGoal = 0;

        break;
      }

      case key.ctrl && input === "y": {
        // Clipboard copy is handled in useConversation hook: this is needed in
        // order to prevent the character "y" from being inserted into the input.
        break;
      }

      case key.ctrl && input === "c":
      case key.escape: {
        // Exit is handled in useConversation hook: this is needed in order to
        // prevent the character "c" from being inserted into the input.
        break;
      }

      default: {
        newInput =
          currentInput.slice(0, currentCursorPosition) +
          input +
          currentInput.slice(currentCursorPosition);

        newCursorPosition += input.length;

        const newInputLines = getLinesWithBoundaries(newInput);
        newLineColumnGoal =
          getLineCoordinatesAtPosition(newInputLines, newCursorPosition)
            ?.lineColumn ?? newLineColumnGoal;

        break;
      }
    }

    newCursorPosition = Math.max(
      0,
      Math.min(newCursorPosition, newInput.length),
    );

    setCurrentInput(newInput);
    setCurrentCursorPosition(newCursorPosition);
    setLineColumnGoal(newLineColumnGoal);
  });

  return (
    <Box flexDirection="column">
      <Separator />
      <Box flexDirection="row">
        <Box width={2} flexShrink={0}>
          <Text>{chalk.hex(semanticColors.mutedAccent)("> ")}</Text>
        </Box>
        <Text>
          {renderedCurrentInput.length > 0
            ? renderedCurrentInput
            : renderedInputPlaceholder}
        </Text>
      </Box>
      <Separator />
    </Box>
  );
};
