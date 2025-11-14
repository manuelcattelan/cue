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

  const inputPlaceholder = "Describe your task...";

  const [inputText, setInputText] = useState<string>("");
  const [inputCursorOffset, setInputCursorOffset] = useState<number>(
    inputText.length,
  );

  const renderedInputPlaceholder = useMemo(
    () =>
      inputPlaceholder
        ? chalk.inverse(inputPlaceholder[0]) +
          chalk.gray(inputPlaceholder.slice(1))
        : undefined,
    [inputPlaceholder],
  );

  const renderedInputText = useMemo(() => {
    if (inputText.length === 0) {
      return chalk.inverse(" ");
    }

    let renderedInputTextResult = "";
    for (let index = 0; index < inputText.length; index++) {
      const character = inputText[index];
      renderedInputTextResult +=
        index === inputCursorOffset ? chalk.inverse(character) : character;
    }

    if (inputCursorOffset === inputText.length) {
      renderedInputTextResult += chalk.inverse(" ");
    }

    return renderedInputTextResult;
  }, [inputText, inputCursorOffset]);

  useInput((input, key) => {
    if ((key.ctrl && input === "c") || key.escape) {
      exit();
    }

    let nextInputCursorOffset = inputCursorOffset;
    let nextInputText = inputText;

    if (key.leftArrow) {
      nextInputCursorOffset--;
    } else if (key.rightArrow) {
      nextInputCursorOffset++;
    } else if (key.backspace || key.delete) {
      if (inputCursorOffset > 0) {
        nextInputText =
          inputText.slice(0, inputCursorOffset - 1) +
          inputText.slice(inputCursorOffset, inputText.length);
        nextInputCursorOffset--;
      }
    } else if (key.return) {
      nextInputText =
        inputText.slice(0, inputCursorOffset) +
        "\n" +
        inputText.slice(inputCursorOffset, inputText.length);
      nextInputCursorOffset++;
    } else {
      nextInputText =
        inputText.slice(0, inputCursorOffset) +
        input +
        inputText.slice(inputCursorOffset, inputText.length);
      nextInputCursorOffset += input.length;
    }

    if (nextInputCursorOffset < 0) {
      nextInputCursorOffset = 0;
    }

    if (nextInputCursorOffset > nextInputText.length) {
      nextInputCursorOffset = nextInputText.length;
    }

    setInputCursorOffset(nextInputCursorOffset);
    setInputText(nextInputText);
  });

  return (
    <Box flexDirection="row">
      <Box width={2} flexShrink={0}>
        <Text>&gt; </Text>
      </Box>
      <Text>
        {renderedInputText.length > 0
          ? renderedInputText
          : renderedInputPlaceholder}
      </Text>
    </Box>
  );
};

render(<Main />);
