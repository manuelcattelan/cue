import { semanticColors } from "../lib/colors.js";
import type { Question } from "../types/conversation.js";
import { TextInput } from "../ui/input/TextInput.js";
import { Box, Text, useInput } from "ink";
import { useState, type FC } from "react";

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

  const getQuestionCharacter = (
    questionId: string,
    questionIndex: number,
  ): string => {
    if (questionIndex === currentQuestionIndex) {
      return "›";
    } else if (answers.has(questionId)) {
      return "✓";
    } else {
      return "•";
    }
  };

  return (
    <Box flexDirection="column" gap={1}>
      <Text color={semanticColors.mutedAccent}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>
      <Box flexDirection="column">
        {questions.map((question, questionIndex) => (
          <Box key={question.id}>
            <Text
              color={
                questionIndex === currentQuestionIndex
                  ? semanticColors.mutedAccent
                  : semanticColors.muted
              }
            >
              {getQuestionCharacter(question.id, questionIndex)}{" "}
              {question.content}
            </Text>
          </Box>
        ))}
      </Box>
      <Box flexDirection="column" marginBottom={1}>
        <TextInput
          controlledInput={currentAnswer}
          controlledCursorPosition={currentAnswer.length}
          onInputChange={handleInputChange}
        />
      </Box>
    </Box>
  );
};
