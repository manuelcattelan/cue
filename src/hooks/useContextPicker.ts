import { getDirectoryFiles } from "../lib/context.js";
import { useState } from "react";

type UseContextPickerReturn = {
  isContextPickerOpen: boolean;
  contextPickerQuery: string;
  contextPickerFiles: string[];

  toggleContextPickerOn: (
    contextPickerCursorStartPosition: number,
    contextPickerQuery?: string,
  ) => void;
  toggleContextPickerOff: () => void;

  selectContextPickerFile: (
    contextPickerFile: string,
    currentInput: string,
    currentCursorPosition: number,
  ) => { newInput: string; newCursorPosition: number };
  updateContextPickerQuery: (newContextPickerQuery: string) => void;
};

export const useContextPicker = (): UseContextPickerReturn => {
  const [isContextPickerOpen, setIsContextPickerOpen] = useState(false);

  const [
    contextPickerCursorStartPosition,
    setContextPickerCursorStartPosition,
  ] = useState(0);
  const [contextPickerQuery, setContextPickerQuery] = useState("");
  const [contextPickerFiles] = useState<string[]>(() =>
    getDirectoryFiles(process.cwd()),
  );

  const toggleContextPickerOn = (
    contextPickerCursorStartPosition: number,
    contextPickerQuery: string = "",
  ) => {
    setIsContextPickerOpen(true);
    setContextPickerCursorStartPosition(contextPickerCursorStartPosition);
    setContextPickerQuery(contextPickerQuery);
  };

  const toggleContextPickerOff = () => {
    setIsContextPickerOpen(false);
    setContextPickerCursorStartPosition(0);
    setContextPickerQuery("");
  };

  const updateContextPickerQuery = (newContextPickerQuery: string) => {
    if (!isContextPickerOpen) return;

    let contextPickerQueryEnd = contextPickerCursorStartPosition + 1;
    while (
      contextPickerQueryEnd < newContextPickerQuery.length &&
      newContextPickerQuery[contextPickerQueryEnd] !== " " &&
      newContextPickerQuery[contextPickerQueryEnd] !== "\n"
    ) {
      contextPickerQueryEnd++;
    }

    const contextPickerQuery = newContextPickerQuery.slice(
      contextPickerCursorStartPosition + 1,
      contextPickerQueryEnd,
    );

    setContextPickerQuery(contextPickerQuery);
  };

  const selectContextPickerFile = (
    contextPickerFile: string,
    currentInput: string,
    currentCursorPosition: number,
  ) => {
    const newInput =
      currentInput.slice(0, contextPickerCursorStartPosition) +
      "@" +
      contextPickerFile +
      currentInput.slice(currentCursorPosition);

    const newCursorPosition =
      contextPickerCursorStartPosition + 1 + contextPickerFile.length;

    setIsContextPickerOpen(false);
    setContextPickerCursorStartPosition(0);
    setContextPickerQuery("");

    return { newInput, newCursorPosition };
  };

  return {
    isContextPickerOpen,
    contextPickerQuery,
    contextPickerFiles,

    toggleContextPickerOn,
    toggleContextPickerOff,

    selectContextPickerFile,
    updateContextPickerQuery,
  };
};
