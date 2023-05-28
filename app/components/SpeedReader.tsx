import { useState, useEffect, SetStateAction, useRef } from "react";
import styled from "styled-components";
import kuromoji, { IpadicFeatures, Tokenizer } from "kuromoji";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Textarea = styled.textarea`
  margin: 1rem 0;
  width: 80%;
  height: 100px;
`;

const HighlightedText = styled.h1`
  margin-top: 2rem;
  font-size: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Faint = styled.span`
  color: #aaa;
`;

const Slider = styled.input.attrs({
  type: "range",
  min: 10,
  max: 1000,
  step: 10,
})`
  width: 30%;
  margin: 1rem 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
  width: 100%;
`;

const SpeedReader = () => {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(300);
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [context, setContext] = useState({ prev: "", current: "", next: "" });
  const [tokenizer, setTokenizer] = useState<Tokenizer<IpadicFeatures> | null>(
    null
  );
  const [isPaused, setIsPaused] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    kuromoji.builder({ dicPath: "dict/" }).build((err, tokenizer) => {
      if (err) throw err;
      setTokenizer(tokenizer);
    });
  }, []);

  const startReading = () => {
    if (tokenizer) {
      const path = tokenizer.tokenize(text);
      const tokens = path.map(
        (token: { surface_form: any }) => token.surface_form
      );
      setWords(tokens);
      setCurrentIndex(0);
      setIsPaused(false);
    }
  };

  const step = () => {
    if (currentIndex < words.length) {
      setCurrentIndex((currentIndex) => currentIndex + 1);
      if (!isPaused) {
        timeoutId.current = setTimeout(step, speed);
      }
    } else {
      setIsPaused(true);
    }
  };

  useEffect(() => {
    if (words.length > 0 && !isPaused) {
      timeoutId.current = setTimeout(step, speed);
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [words, currentIndex, speed, isPaused]);

  useEffect(() => {
    if (words.length > 0) {
      setContext({
        prev: words[currentIndex - 1] || "",
        current: words[currentIndex],
        next: words[currentIndex + 1] || "",
      });
    }

    // Check if reading is finished
    if (currentIndex >= words.length) {
      setIsPaused(true);
    }
  }, [words, currentIndex]);

  const handleChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setText(event.target.value);
  };

  const handleSpeedChange = (event: { target: { value: any } }) => {
    setSpeed(Number(event.target.value));
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      if (currentIndex < words.length) {
        timeoutId.current = setTimeout(step, speed);
      }
    } else {
      setIsPaused(true);
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    }
  };

  return (
    <Container>
      <Textarea
        onChange={handleChange}
        value={text}
        placeholder="速読したいテキストを入力してください..."
      />
      <ControlsContainer>
        <Slider onChange={handleSpeedChange} value={speed} />
        <div>速度: {speed}ms</div>
        <button onClick={startReading}>▶再生</button>
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? "再開" : "一時停止"}
        </button>
      </ControlsContainer>
      <HighlightedText>
        <Faint>{context.prev}</Faint> {context.current}{" "}
        <Faint>{context.next}</Faint>
      </HighlightedText>
    </Container>
  );
};

export default SpeedReader;
