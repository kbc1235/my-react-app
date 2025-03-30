/**
 * 로컬 스토리지 관련 유틸리티 함수
 */

// 로컬 스토리지 키 상수
const STORAGE_KEYS = {
  TEST_RESULT: "crossfit_mbti_result",
  TEST_HISTORY: "crossfit_mbti_history",
};

/**
 * 크로스핏 MBTI 테스트 결과를 로컬 스토리지에 저장
 * @param {Object} result 테스트 결과 객체
 */
export const saveTestResult = (result) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_RESULT, JSON.stringify(result));

    // 히스토리에도 추가
    const history = getTestHistory() || [];
    history.push({
      ...result,
      timestamp: new Date().toISOString(),
    });

    // 최근 10개 결과만 보관
    if (history.length > 10) {
      history.shift();
    }

    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error("테스트 결과 저장 실패:", error);
    return false;
  }
};

/**
 * 로컬 스토리지에서 가장 최근 테스트 결과 불러오기
 * @returns {Object|null} 저장된 테스트 결과 객체, 없으면 null
 */
export const getLatestTestResult = () => {
  try {
    const resultStr = localStorage.getItem(STORAGE_KEYS.TEST_RESULT);
    return resultStr ? JSON.parse(resultStr) : null;
  } catch (error) {
    console.error("테스트 결과 불러오기 실패:", error);
    return null;
  }
};

/**
 * 로컬 스토리지에서 테스트 히스토리 불러오기
 * @returns {Array|null} 저장된 테스트 히스토리 배열, 없으면 null
 */
export const getTestHistory = () => {
  try {
    const historyStr = localStorage.getItem(STORAGE_KEYS.TEST_HISTORY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error("테스트 히스토리 불러오기 실패:", error);
    return [];
  }
};

/**
 * 로컬 스토리지에서 테스트 결과와 히스토리 모두 삭제
 */
export const clearTestData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TEST_RESULT);
    localStorage.removeItem(STORAGE_KEYS.TEST_HISTORY);
    return true;
  } catch (error) {
    console.error("테스트 데이터 삭제 실패:", error);
    return false;
  }
};
