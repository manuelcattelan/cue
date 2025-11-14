import chalk from "chalk";
import { Box, Text, useApp, useInput } from "ink";
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

export const TextInput = () => {
  const { exit } = useApp();

  const inputPlaceholder = "Describe your task...";

  const [currentInput, setCurrentInput] = useState<string>("");
  const [currentCursorPosition, setCurrentCursorPosition] = useState<number>(
    currentInput.length,
  );

  const [lineColumnGoal, setLineColumnGoal] = useState<number>(0);

  const renderedInputPlaceholder = useMemo(
    () =>
      inputPlaceholder && inputPlaceholder.length > 0
        ? chalk.inverse(inputPlaceholder[0]) +
          chalk.gray(inputPlaceholder.slice(1))
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
    // exit() terminates the program, no early return needed
    if ((key.ctrl && input === "c") || key.escape) {
      exit();
    }

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

      // TODO: implement submit functionality
      case key.ctrl && input === "d": {
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
    <Box flexDirection="row">
      <Box width={2} flexShrink={0}>
        <Text>&gt; </Text>
      </Box>
      <Text>
        {renderedCurrentInput.length > 0
          ? renderedCurrentInput
          : renderedInputPlaceholder}
      </Text>
    </Box>
  );
};
