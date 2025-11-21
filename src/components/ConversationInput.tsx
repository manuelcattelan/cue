import { useNotification } from "../contexts/NotificationContext.js";
import { useContextPicker } from "../hooks/useContextPicker.js";
import { Notification } from "../ui/feedback/Notification.js";
import { TextInput } from "../ui/input/TextInput.js";
import { Separator } from "../ui/layout/Separator.js";
import { ContextPicker } from "./ContextPicker.js";
import { Box } from "ink";

type ConversationInputProps = {
  currentInput: string;
  currentCursorPosition: number;
  onInputChange: (newInput: string, newCursorPosition: number) => void;
  onInputSubmit: (content: string) => void;
};

export const ConversationInput = ({
  currentInput,
  currentCursorPosition,
  onInputChange,
  onInputSubmit,
}: ConversationInputProps) => {
  const { notification } = useNotification();

  const {
    isContextPickerOpen,
    contextPickerFiles,
    contextPickerQuery,

    toggleContextPickerOn,
    toggleContextPickerOff,

    selectContextPickerFile,
    updateContextPickerQuery,
  } = useContextPicker();

  const onInputChangeInternal = (
    newInput: string,
    newCursorPosition: number,
  ) => {
    onInputChange(newInput, newCursorPosition);

    const lastInputCharacter =
      newCursorPosition > 0 ? newInput[newCursorPosition - 1] : undefined;
    const secondLastInputCharacter =
      newCursorPosition > 1 ? newInput[newCursorPosition - 2] : undefined;

    const inputBeforeNewCursorPosition = newInput.slice(0, newCursorPosition);

    const contextPickerMatch =
      inputBeforeNewCursorPosition.match(/(^|[\s\n])@[^\s\n]*$/);
    const contextPickerCursorStartPosition =
      contextPickerMatch !== null
        ? inputBeforeNewCursorPosition.length -
          contextPickerMatch[0].length +
          (contextPickerMatch[1]?.length ?? 0)
        : -1;

    const mentionIsLastInputCharacter =
      lastInputCharacter === "@" &&
      (newCursorPosition === 1 ||
        secondLastInputCharacter === " " ||
        secondLastInputCharacter === "\n");

    const whitespaceIsLastInputCharacter =
      lastInputCharacter === " " || lastInputCharacter === "\n";

    if (mentionIsLastInputCharacter) {
      toggleContextPickerOn(newCursorPosition - 1);

      return;
    }

    if (contextPickerCursorStartPosition !== -1 && !isContextPickerOpen) {
      const contextPickerQuery = newInput
        .slice(contextPickerCursorStartPosition + 1)
        .split(/[\s\n]/)[0];

      toggleContextPickerOn(
        contextPickerCursorStartPosition,
        contextPickerQuery,
      );

      return;
    }

    if (isContextPickerOpen) {
      if (
        whitespaceIsLastInputCharacter ||
        contextPickerCursorStartPosition === -1
      ) {
        toggleContextPickerOff();

        return;
      }

      updateContextPickerQuery(newInput);
    }
  };

  const handleSelectContextPickerFile = (contextPickerFile: string) => {
    const { newInput, newCursorPosition } = selectContextPickerFile(
      contextPickerFile,
      currentInput,
      currentCursorPosition,
    );

    const newInputWithWhitespace = `${newInput} `;
    const newCursorPositionWithWhitespace = newCursorPosition + 1;

    onInputChange(newInputWithWhitespace, newCursorPositionWithWhitespace);
  };

  return (
    <Box flexDirection="column">
      <Separator />
      <TextInput
        controlledInput={currentInput}
        controlledCursorPosition={currentCursorPosition}
        placeholder="Take your cue…"
        onInputChange={onInputChangeInternal}
        onInputSubmit={onInputSubmit}
        disableConflictingKeys={isContextPickerOpen}
      />
      <Separator />
      {isContextPickerOpen ? (
        <ContextPicker
          contextPickerFiles={contextPickerFiles}
          contextPickerQuery={contextPickerQuery}
          onSelectContextPickerFile={handleSelectContextPickerFile}
          onCancelContextPicker={toggleContextPickerOff}
        />
      ) : notification ? (
        <Notification notification={notification} />
      ) : null}
    </Box>
  );
};
