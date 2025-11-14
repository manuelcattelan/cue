import chalk from "chalk";
import dotenv from "dotenv";
import { Box, render, Text, useApp, useInput } from "ink";
import { useMemo, useState } from "react";
import * as z from "zod";

dotenv.config();

const Config = z.object({
  apiKey: z.string(),
});

Config.parse({ apiKey: process.env.API_KEY });

const Main = () => {
  const { exit } = useApp();

  const inputPlaceholder = "placeholder";

  const [currentInput, setCurrentInput] = useState<string>("");
  const [currentCursorPosition, setCurrentCursorPosition] = useState<number>(
    currentInput.length,
  );

  const [desiredColumn, setDesiredColumn] = useState<number>(0);

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

  // Helper functions for multi-line cursor navigation
  const getLines = (text: string) => {
    const lines: Array<{ start: number; end: number; text: string }> = [];
    let start = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === "\n") {
        lines.push({ start, end: i, text: text.slice(start, i) });
        start = i + 1;
      }
    }
    lines.push({ start, end: text.length, text: text.slice(start) });
    return lines;
  };

  const getCurrentLineInfo = (text: string, cursorOffset: number) => {
    const lines = getLines(text);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line && cursorOffset >= line.start && cursorOffset <= line.end) {
        return {
          lineIndex: i,
          line,
          column: cursorOffset - line.start,
          lines,
        };
      }
    }
    return null;
  };

  useInput((input, key) => {
    if ((key.ctrl && input === "c") || key.escape) {
      exit();
    }

    let nextCursorPosition = currentCursorPosition;
    let nextInput = currentInput;
    let nextDesiredColumn = desiredColumn;

    if (key.leftArrow) {
      nextCursorPosition--;
      // Update desired column for horizontal movement
      const lineInfo = getCurrentLineInfo(nextInput, nextCursorPosition);
      if (lineInfo) {
        nextDesiredColumn = lineInfo.column;
      }
    } else if (key.upArrow) {
      const lineInfo = getCurrentLineInfo(currentInput, currentCursorPosition);
      if (lineInfo && lineInfo.lineIndex > 0) {
        const targetLine = lineInfo.lines[lineInfo.lineIndex - 1];
        if (targetLine) {
          const targetColumn = Math.min(desiredColumn, targetLine.text.length);
          nextCursorPosition = targetLine.start + targetColumn;
        }
      }
    } else if (key.rightArrow) {
      nextCursorPosition++;
      // Update desired column for horizontal movement
      const lineInfo = getCurrentLineInfo(nextInput, nextCursorPosition);
      if (lineInfo) {
        nextDesiredColumn = lineInfo.column;
      }
    } else if (key.downArrow) {
      const lineInfo = getCurrentLineInfo(currentInput, currentCursorPosition);
      if (lineInfo && lineInfo.lineIndex < lineInfo.lines.length - 1) {
        const targetLine = lineInfo.lines[lineInfo.lineIndex + 1];
        if (targetLine) {
          const targetColumn = Math.min(desiredColumn, targetLine.text.length);
          nextCursorPosition = targetLine.start + targetColumn;
        }
      }
    } else if (key.backspace || key.delete) {
      if (currentCursorPosition > 0) {
        nextInput =
          currentInput.slice(0, currentCursorPosition - 1) +
          currentInput.slice(currentCursorPosition, currentInput.length);
        nextCursorPosition--;
        // Update desired column after deletion
        const lineInfo = getCurrentLineInfo(nextInput, nextCursorPosition);
        if (lineInfo) {
          nextDesiredColumn = lineInfo.column;
        }
      }
    } else if (key.return) {
      nextInput =
        currentInput.slice(0, currentCursorPosition) +
        "\n" +
        currentInput.slice(currentCursorPosition, currentInput.length);
      nextCursorPosition++;
      // After pressing Enter, we're at column 0 of the new line
      nextDesiredColumn = 0;
    } else if (key.ctrl && input === "d") {
    } else {
      nextInput =
        currentInput.slice(0, currentCursorPosition) +
        input +
        currentInput.slice(currentCursorPosition, currentInput.length);
      nextCursorPosition += input.length;
      // Update desired column after text input
      const lineInfo = getCurrentLineInfo(nextInput, nextCursorPosition);
      if (lineInfo) {
        nextDesiredColumn = lineInfo.column;
      }
    }

    if (nextCursorPosition < 0) {
      nextCursorPosition = 0;
    }

    if (nextCursorPosition > nextInput.length) {
      nextCursorPosition = nextInput.length;
    }

    setCurrentCursorPosition(nextCursorPosition);
    setCurrentInput(nextInput);
    setDesiredColumn(nextDesiredColumn);
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

render(<Main />);
