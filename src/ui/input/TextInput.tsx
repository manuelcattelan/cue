import { semanticColors } from "../../lib/colors.js";
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
  controlledInput?: string;
  controlledCursorPosition?: number;
  disableConflictingKeys?: boolean;
  onInputSubmit?: (content: string) => void;
  onInputChange?: (input: string, cursorPosition: number) => void;
};

export const TextInput = ({
  controlledInput,
  controlledCursorPosition,
  disableConflictingKeys = false,
  onInputSubmit,
  onInputChange,
}: TextInputProps) => {
  const inputPlaceholder = "Take your cue…";

  const [internalInput, setInternalInput] = useState<string>("");
  const [internalCursorPosition, setInternalCursorPosition] =
    useState<number>(0);

  const [lineColumnGoal, setLineColumnGoal] = useState<number>(0);

  const isControlledComponent = controlledInput !== undefined;
  const currentInput = isControlledComponent ? controlledInput : internalInput;
  const currentCursorPosition = isControlledComponent
    ? (controlledCursorPosition ?? currentInput.length)
    : internalCursorPosition;

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
        if (disableConflictingKeys) {
          break;
        }

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
        if (disableConflictingKeys) {
          break;
        }

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

      case key.ctrl && (input === "n" || input === "p"): {
        if (disableConflictingKeys) {
          break;
        }
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
        if (disableConflictingKeys) {
          break;
        }

        newInput =
          currentInput.slice(0, currentCursorPosition) +
          "\n" +
          currentInput.slice(currentCursorPosition);

        newCursorPosition++;
        newLineColumnGoal = 0;

        break;
      }

      case key.ctrl && input === "u": {
        const lineCoordinates = getLineCoordinatesAtPosition(
          currentInputLinesWithBoundaries,
          currentCursorPosition,
        );

        if (lineCoordinates) {
          const currentLine =
            currentInputLinesWithBoundaries[lineCoordinates.lineRow];

          if (currentLine) {
            newInput =
              currentInput.slice(0, currentLine.positionFrom) +
              currentInput.slice(currentCursorPosition);

            newCursorPosition = currentLine.positionFrom;
            newLineColumnGoal = 0;
          }
        }

        break;
      }

      case key.ctrl && input === "d": {
        const trimmedInput = currentInput.trim();

        if (trimmedInput.length === 0) {
          break;
        }

        if (onInputSubmit) {
          onInputSubmit(trimmedInput);
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

    if (isControlledComponent) {
      onInputChange?.(newInput, newCursorPosition);
    } else {
      setInternalInput(newInput);
      setInternalCursorPosition(newCursorPosition);
    }
    setLineColumnGoal(newLineColumnGoal);
  });

  return (
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
  );
};
