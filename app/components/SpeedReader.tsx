import { useState, useEffect, SetStateAction } from "react";
import styled from "styled-components";
import kuromoji, { IpadicFeatures, Tokenizer } from "kuromoji";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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
  width: 200px;
  margin: 1rem 0;
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

  if (words.length > 0 && !isPaused) {
    setTimeout(() => {
      setCurrentIndex((currentIndex) => currentIndex + 1);
    }, speed);
  }

  return (
    <Container>
      <Textarea
        onChange={handleChange}
        value={text}
        placeholder="速読したいテキストを入力してください..."
      />
      <Slider onChange={handleSpeedChange} value={speed} />
      <div>速度: {speed}ミリ秒</div>
      <button onClick={startReading}>読み始める</button>
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? "再開" : "一時停止"}
      </button>
      <HighlightedText>
        <Faint>{context.prev}</Faint> {context.current}{" "}
        <Faint>{context.next}</Faint>
      </HighlightedText>
    </Container>
  );
};

export default SpeedReader;
