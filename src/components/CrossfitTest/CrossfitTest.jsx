import React, { useState, useEffect } from "react";
import Question from "./Question";
import Results from "./Results";
import crossfitQuestions from "../../data/crossfitQuestions";
import { saveTestResult, getLatestTestResult } from "../../utils/storageUtils";
import "./CrossfitTest.css";

const CrossfitTest = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testComplete, setTestComplete] = useState(false);
  const [result, setResult] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  const [gender, setGender] = useState("");
  const [showGenderSelect, setShowGenderSelect] = useState(false);

  // 페이지 로드 시 이전 결과 확인
  useEffect(() => {
    const savedResult = getLatestTestResult();
    if (savedResult) {
      setPreviousResult(savedResult);
    }
  }, []);

  // 테스트 시작
  const startTest = () => {
    setShowGenderSelect(true);
  };

  // 성별 선택 후 테스트 시작
  const startTestWithGender = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderSelect(false);
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestComplete(false);
    setResult(null);
  };

  // 질문 응답 처리
  const handleAnswer = (questionId, value, dimension) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { value, dimension },
    }));

    // 다음 질문으로 이동
    if (currentQuestionIndex < crossfitQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 모든 질문 완료
      calculateResult();
    }
  };

  // 결과 계산
  const calculateResult = () => {
    // 차원별 점수 계산
    const dimensionScores = {
      EI: 0, // 0: I, 100: E
      HL: 0, // 0: L, 100: H
      PR: 0, // 0: R, 100: P
      GB: 0, // 0: B, 100: G
    };

    const dimensionCounts = {
      EI: 0,
      HL: 0,
      PR: 0,
      GB: 0,
    };

    // 각 답변에 대해 차원별 점수 계산
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = crossfitQuestions.find(
        (q) => q.id === parseInt(questionId)
      );
      if (!question) return;

      const { dimension, direction } = question;
      const score = answer.value; // 1-5 사이의 값

      // 방향에 따라 점수 적용
      if (dimension === "EI") {
        if (direction === "E") {
          dimensionScores.EI += score;
        } else {
          dimensionScores.EI += 6 - score; // 반대 방향 점수 반전
        }
        dimensionCounts.EI++;
      } else if (dimension === "HL") {
        if (direction === "H") {
          dimensionScores.HL += score;
        } else {
          dimensionScores.HL += 6 - score;
        }
        dimensionCounts.HL++;
      } else if (dimension === "PR") {
        if (direction === "P") {
          dimensionScores.PR += score;
        } else {
          dimensionScores.PR += 6 - score;
        }
        dimensionCounts.PR++;
      } else if (dimension === "GB") {
        if (direction === "G") {
          dimensionScores.GB += score;
        } else {
          dimensionScores.GB += 6 - score;
        }
        dimensionCounts.GB++;
      }
    });

    // 차원별 백분율 계산 (0-100%)
    const normalizedScores = {
      EI:
        dimensionCounts.EI > 0
          ? Math.round((dimensionScores.EI / (5 * dimensionCounts.EI)) * 100)
          : 50,
      HL:
        dimensionCounts.HL > 0
          ? Math.round((dimensionScores.HL / (5 * dimensionCounts.HL)) * 100)
          : 50,
      PR:
        dimensionCounts.PR > 0
          ? Math.round((dimensionScores.PR / (5 * dimensionCounts.PR)) * 100)
          : 50,
      GB:
        dimensionCounts.GB > 0
          ? Math.round((dimensionScores.GB / (5 * dimensionCounts.GB)) * 100)
          : 50,
    };

    // 유형 코드 결정
    const typeCode =
      (normalizedScores.EI >= 50 ? "E" : "I") +
      (normalizedScores.HL >= 50 ? "H" : "L") +
      (normalizedScores.PR >= 50 ? "P" : "R") +
      (normalizedScores.GB >= 50 ? "G" : "B");

    // 결과 객체 생성 (성별 정보 추가)
    const testResult = {
      type: typeCode,
      scores: normalizedScores,
      date: new Date().toISOString(),
      gender: gender,
    };

    // 결과 저장 및 상태 업데이트
    saveTestResult(testResult);
    setResult(testResult);
    setTestComplete(true);

    // 디버깅용 콘솔 로그 추가
    console.log("테스트 결과:", testResult);
    console.log("찾는 유형 코드:", typeCode);
    console.log("사용자 성별:", gender);
  };

  // 테스트 다시하기
  const handleRestart = () => {
    setIsStarted(false);
    setShowGenderSelect(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestComplete(false);
    setResult(null);
    setGender("");
  };

  // 성별 선택 화면 렌더링
  if (showGenderSelect) {
    return (
      <div className="crossfit-test-container">
        <div className="gender-select">
          <h2>성별을 선택해주세요</h2>
          <p>더 정확한 결과를 위해 성별을 선택해주세요.</p>
          <div className="gender-buttons">
            <button
              className="gender-btn male"
              onClick={() => startTestWithGender("male")}
            >
              남성
            </button>
            <button
              className="gender-btn female"
              onClick={() => startTestWithGender("female")}
            >
              여성
            </button>
          </div>
          <button
            className="back-btn"
            onClick={() => setShowGenderSelect(false)}
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  // 시작 화면 렌더링
  if (!isStarted) {
    return (
      <div className="crossfit-test-container">
        <div className="test-intro">
          <h1>나의 크로스핏 성향 테스트</h1>
          <p>16개의 질문을 통해 당신의 크로스핏 성향 유형을 알아보세요.</p>
          <p>당신에게 맞는 훈련 방식과 강점, 약점을 파악할 수 있습니다.</p>

          {previousResult && (
            <div className="previous-result">
              <h3>이전 테스트 결과</h3>
              <p>
                당신의 유형: <strong>{previousResult.type}</strong>
              </p>
              <p>
                테스트 날짜:{" "}
                {new Date(previousResult.date).toLocaleDateString()}
              </p>
              <button
                className="view-previous-btn"
                onClick={() => {
                  setResult(previousResult);
                  setGender(previousResult.gender || "male");
                  setTestComplete(true);
                  setIsStarted(true);
                }}
              >
                이전 결과 보기
              </button>
            </div>
          )}

          <button className="start-test-btn" onClick={startTest}>
            테스트 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 테스트 완료 후 결과 화면
  if (testComplete && result) {
    return (
      <div className="crossfit-test-container">
        <Results result={result} gender={gender} onRestart={handleRestart} />
      </div>
    );
  }

  // 테스트 진행 중 - 질문 표시
  return (
    <div className="crossfit-test-container">
      <Question
        question={crossfitQuestions[currentQuestionIndex]}
        currentIndex={currentQuestionIndex}
        totalQuestions={crossfitQuestions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default CrossfitTest;
