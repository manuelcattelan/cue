import { semanticColors } from "../lib/colors.js";
import type { Question } from "../types/conversation.js";
import { TextInput } from "../ui/input/TextInput.js";
import { Separator } from "../ui/layout/Separator.js";
import { Box, Text, useInput } from "ink";
import { useState, type FC } from "react";

type QuestionBoxProps = {
  question: Question;
  questionPromptCharacter: string;
  answer: string | undefined;
};

const QuestionBox: FC<QuestionBoxProps> = ({
  question,
  questionPromptCharacter,
  answer,
}) => (
  <Box paddingX={2}>
    <Text dimColor color={semanticColors.muted} wrap="truncate-end">
      {questionPromptCharacter} {question.content}
      {answer && ` → ${answer}`}
    </Text>
  </Box>
);

type CurrentQuestionBoxProps = {
  question: Question;
  answer: string;
  onInputChange: (value: string) => void;
};

const CurrentQuestionBox: FC<CurrentQuestionBoxProps> = ({
  question,
  answer,
  onInputChange,
}) => (
  <Box
    flexDirection="column"
    borderStyle="single"
    borderColor={semanticColors.mutedAccent}
    paddingX={1}
    paddingY={0}
  >
    <Box flexDirection="row">
      <Box width={2} flexShrink={0} />
      <Text color={semanticColors.mutedAccent} bold wrap="wrap">
        {question.content}
      </Text>
    </Box>
    <Box marginTop={1}>
      <TextInput
        controlledInput={answer}
        controlledCursorPosition={answer.length}
        placeholder="Type your answer here."
        onInputChange={onInputChange}
      />
    </Box>
  </Box>
);

type ConversationQuestionsProps = {
  questions: Question[];
  onQuestionsSubmit: (formattedAnswers: string) => void;
  onQuestionsQuit: () => void;
};

export const ConversationQuestions: FC<ConversationQuestionsProps> = ({
  questions,
  onQuestionsSubmit,
  onQuestionsQuit,
}) => {
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionIsLast = currentQuestionIndex === questions.length - 1;

  const handleSubmit = () => {
    const submittedAnswers = new Map(answers);
    if (currentQuestion && currentAnswer.trim()) {
      submittedAnswers.set(currentQuestion.id, currentAnswer);
    }

    const submittedAnswerItems = questions.map((question) => {
      const questionAnswer =
        submittedAnswers.get(question.id) || "[Not answered]";

      return `<item question-id="${question.id}">
  <question>${question.content}</question>
  <answer>${questionAnswer}</answer>
</item>`;
    });

    onQuestionsSubmit(
      `<follow-up-answers>\n${submittedAnswerItems.join("\n")}\n</follow-up-answers>\n`,
    );
    onQuestionsQuit();
  };

  const handleInputChange = (newInput: string) => {
    setCurrentAnswer(newInput);
  };

  useInput((input, key) => {
    switch (true) {
      case key.escape: {
        onQuestionsQuit();

        break;
      }

      case key.tab && key.shift: {
        if (currentQuestionIndex > 0) {
          const updatedAnswers =
            currentQuestion && currentAnswer.trim()
              ? new Map(answers).set(currentQuestion.id, currentAnswer)
              : answers;
          setAnswers(updatedAnswers);

          const previousQuestion = questions[currentQuestionIndex - 1];
          if (previousQuestion) {
            setCurrentAnswer(updatedAnswers.get(previousQuestion.id) || "");
            setCurrentQuestionIndex(currentQuestionIndex - 1);
          }
        }
        break;
      }

      case key.tab: {
        if (currentQuestionIndex < questions.length - 1) {
          const updatedAnswers =
            currentQuestion && currentAnswer.trim()
              ? new Map(answers).set(currentQuestion.id, currentAnswer)
              : answers;
          setAnswers(updatedAnswers);

          const nextQuestion = questions[currentQuestionIndex + 1];
          if (nextQuestion) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentAnswer(updatedAnswers.get(nextQuestion.id) || "");
          }
        }
        break;
      }

      case key.ctrl && input === "d": {
        if (currentQuestion && currentAnswer.trim()) {
          setAnswers(new Map(answers).set(currentQuestion.id, currentAnswer));
        }

        if (currentQuestionIsLast) {
          handleSubmit();
        } else {
          const nextQuestion = questions[currentQuestionIndex + 1];
          if (nextQuestion) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentAnswer(answers.get(nextQuestion.id) || "");
          }
        }
        break;
      }
    }
  });

  const getQuestionPromptCharacter = (
    questionId: string,
    questionIndex: number,
  ): string => {
    if (questionIndex === currentQuestionIndex) {
      return " ";
    } else if (answers.has(questionId)) {
      return "✓";
    } else {
      return "•";
    }
  };

  return (
    <Box flexDirection="column">
      <Separator />
      <Box flexDirection="column" paddingY={1}>
        <Box flexDirection="column" gap={1} paddingX={1}>
          <Box flexDirection="row" justifyContent="space-between">
            <Text color={semanticColors.mutedAccent} bold>
              Follow-up Questions
            </Text>
            <Text color={semanticColors.muted} dimColor>
              {answers.size}/{questions.length} answered •{" "}
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </Box>
        </Box>
        <Box flexDirection="column" paddingTop={1} gap={1}>
          {questions.map((question, questionIndex) => {
            if (questionIndex === currentQuestionIndex) {
              return (
                <CurrentQuestionBox
                  key={question.id}
                  question={question}
                  answer={currentAnswer}
                  onInputChange={handleInputChange}
                />
              );
            }
            return (
              <QuestionBox
                key={question.id}
                question={question}
                questionPromptCharacter={getQuestionPromptCharacter(
                  question.id,
                  questionIndex,
                )}
                answer={answers.get(question.id)}
              />
            );
          })}
        </Box>
      </Box>
      <Separator />
    </Box>
  );
};
