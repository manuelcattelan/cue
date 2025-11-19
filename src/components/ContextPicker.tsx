import { semanticColors } from "../lib/colors.js";
import Fuse from "fuse.js";
import { Box, Text, useInput } from "ink";
import { useEffect, useMemo, useState, type FC } from "react";

type ContextPickerProps = {
  contextPickerFiles: string[];
  contextPickerQuery: string;

  onSelectContextPickerFile: (contextPickerFile: string) => void;
  onCancelContextPicker: () => void;
};

const DEFAULT_MAX_CONTEXT_PICKER_FILES = 10;
const DEFAULT_FUZZY_THRESHOLD = 0.4;

export const ContextPicker: FC<ContextPickerProps> = ({
  contextPickerFiles,
  contextPickerQuery,

  onSelectContextPickerFile,
  onCancelContextPicker,
}) => {
  const [currentContextPickerFileIndex, setCurrentContextPickerFileIndex] =
    useState(0);

  const contextPickerFuzzyFinder = useMemo(
    () => new Fuse(contextPickerFiles, { threshold: DEFAULT_FUZZY_THRESHOLD }),
    [contextPickerFiles],
  );

  const filteredContextPickerFiles = useMemo(() => {
    if (!contextPickerQuery || contextPickerQuery.trim() === "") {
      return contextPickerFiles.slice(0, DEFAULT_MAX_CONTEXT_PICKER_FILES);
    }

    return contextPickerFuzzyFinder
      .search(contextPickerQuery)
      .slice(0, DEFAULT_MAX_CONTEXT_PICKER_FILES)
      .map((result) => result.item);
  }, [contextPickerFiles, contextPickerQuery]);

  useInput((input, key) => {
    switch (true) {
      case key.upArrow:
      case key.ctrl && input === "p": {
        setCurrentContextPickerFileIndex(
          (prev) =>
            (prev - 1 + filteredContextPickerFiles.length) %
            filteredContextPickerFiles.length,
        );

        break;
      }

      case key.downArrow:
      case key.ctrl && input === "n": {
        setCurrentContextPickerFileIndex(
          (prev) => (prev + 1) % filteredContextPickerFiles.length,
        );

        break;
      }

      case key.escape: {
        onCancelContextPicker();

        break;
      }

      case key.return: {
        if (
          filteredContextPickerFiles.length > 0 &&
          filteredContextPickerFiles[currentContextPickerFileIndex]
        ) {
          onSelectContextPickerFile(
            filteredContextPickerFiles[currentContextPickerFileIndex],
          );
        }

        break;
      }
    }
  });

  useEffect(() => {
    setCurrentContextPickerFileIndex(0);
  }, [filteredContextPickerFiles]);

  if (filteredContextPickerFiles.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      {filteredContextPickerFiles.map(
        (contextPickerFile, contextPickerFileIndex) => (
          <Text
            key={contextPickerFile}
            color={
              contextPickerFileIndex === currentContextPickerFileIndex
                ? semanticColors.mutedAccent
                : semanticColors.muted
            }
            bold={contextPickerFileIndex === currentContextPickerFileIndex}
          >
            {contextPickerFileIndex === currentContextPickerFileIndex
              ? "> "
              : "  "}
            {contextPickerFile}
          </Text>
        ),
      )}
    </Box>
  );
};
