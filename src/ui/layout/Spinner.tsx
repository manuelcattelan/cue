import spinners, { type SpinnerName } from "cli-spinners";
import { Text } from "ink";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type SpinnerProps = {
  type: SpinnerName;
  children?: ReactNode;
};

export const Spinner = ({ type, children }: SpinnerProps) => {
  const [frame, setFrame] = useState(0);
  const spinner = spinners[type];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((previousFrame) => {
        const isLastFrame = previousFrame === spinner.frames.length - 1;
        return isLastFrame ? 0 : previousFrame + 1;
      });
    }, spinner.interval);

    return () => {
      clearInterval(timer);
    };
  }, [spinner]);

  return (
    <Text>
      {spinner.frames[frame]} {children}
    </Text>
  );
};
