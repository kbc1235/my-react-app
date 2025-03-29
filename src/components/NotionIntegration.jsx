import { useState, useEffect } from "react";
import {
  addContentToPage,
  addItemToDatabase,
  fetchNotionDatabase,
} from "../services/notionService";

function NotionIntegration() {
  const [input, setInput] = useState("");
  const [pageId, setPageId] = useState("");
  const [databaseId, setDatabaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [databaseProperties, setDatabaseProperties] = useState({});
  const [selectedTitleProperty, setSelectedTitleProperty] = useState("");
  const [selectedContentProperty, setSelectedContentProperty] = useState("");
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [useStructuredData, setUseStructuredData] = useState(true);

  // 테이블 형식 입력을 위한 상태
  const [tableMode, setTableMode] = useState(false);
  const [userName, setUserName] = useState("");
  const [exerciseValues, setExerciseValues] = useState({
    benchpress: "",
    deadlift: "",
    squat: "",
    clean: "",
    jerk: "",
    snatch: "",
  });
  // 메모를 위한 상태 추가
  const [memo, setMemo] = useState("");

  // 날짜 범위 관련 상태 추가
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState("start"); // "start" or "end"
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [_selectedDate, setSelectedDate] = useState(null);

  // 요일 표시
  const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

  // 날짜를 YYYY-MM-DD 형식의 문자열로 변환하는 함수
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 오늘 날짜 가져오기
  const today = new Date();

  // 날짜 범위 설정 함수들
  const setDateRange = (months) => {
    // 현재 날짜 가져오기
    const end = new Date();

    // 시작일이 이미 설정되어 있는지 확인
    let start;
    if (startDate) {
      // 시작일이 설정되어 있으면 그 날짜에서 계산
      start = new Date(startDate);
      // 종료일은 시작일 + 개월 수
      end.setTime(start.getTime());
      end.setMonth(start.getMonth() + months);
    } else {
      // 시작일이 설정되어 있지 않으면 오늘부터 계산
      start = new Date();
      // 종료일은 오늘 + 개월 수
      end.setMonth(today.getMonth() + months);
    }

    // 상태 업데이트
    setStartDate(formatDateString(start));
    setEndDate(formatDateString(end));
    setShowCalendar(false);
  };

  // 캘린더 표시 토글
  const toggleCalendar = (type) => {
    if (showCalendar && activeCalendar === type) {
      setShowCalendar(false);
    } else {
      setActiveCalendar(type);
      setShowCalendar(true);
      // 날짜가 설정된 경우 해당 월로 이동
      if (type === "start" && startDate) {
        setCurrentMonth(new Date(startDate));
      } else if (type === "end" && endDate) {
        setCurrentMonth(new Date(endDate));
      } else {
        setCurrentMonth(new Date());
      }
    }
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date) => {
    const dateStr = formatDateString(date);

    if (activeCalendar === "start") {
      // 시작일이 종료일보다 뒤에 있는 경우 종료일도 변경
      if (endDate && dateStr > endDate) {
        setEndDate(dateStr);
      }
      setStartDate(dateStr);
    } else {
      // 종료일이 시작일보다 앞에 있는 경우 처리
      if (startDate && dateStr < startDate) {
        setError("종료일은 시작일보다 앞에 있을 수 없습니다.");
        return;
      }
      setEndDate(dateStr);
    }

    setSelectedDate(date);
  };

  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // 캘린더의 일 생성
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 캘린더 일 생성
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 현재 달의 첫째 날
    const firstDayOfMonth = new Date(year, month, 1);
    // 현재 달의 마지막 날
    const _lastDayOfMonth = new Date(year, month + 1, 0);

    // 첫째 날의 요일 (0: 일요일, 1: 월요일, ...)
    let firstDayWeekday = firstDayOfMonth.getDay();
    // 한국식으로 월요일이 첫 요일
    firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

    // 이전 달의 마지막 날짜
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    // 현재 달의 총 일수
    const daysInMonth = getDaysInMonth(year, month);

    const days = [];

    // 이전 달의 날짜들
    for (let i = 0; i < firstDayWeekday; i++) {
      const prevMonthDay = daysInPrevMonth - firstDayWeekday + i + 1;
      days.push({
        day: prevMonthDay,
        currentMonth: false,
        date: new Date(year, month - 1, prevMonthDay),
      });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        currentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // 다음 달의 날짜들
    const remainingDays = 42 - days.length; // 6주(42일) 표시
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  // 한국어 월 이름
  const getMonthName = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // 날짜 비교 함수
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;

    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // 테이블 모드 활성화
  const enableTableMode = () => {
    setTableMode(true);
    setUseStructuredData(true);
  };

  // 운동 값 업데이트 핸들러
  const handleExerciseValueChange = (exercise, value) => {
    setExerciseValues((prev) => ({
      ...prev,
      [exercise]: value,
    }));
  };

  // 캘린더 닫기
  const handleDoneClick = () => {
    setShowCalendar(false);
  };

  useEffect(() => {
    // 기본 데이터베이스 ID가 있으면 해당 데이터베이스의 속성 정보를 가져옵니다
    const defaultDatabaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
    if (defaultDatabaseId) {
      setDatabaseId(defaultDatabaseId);
      loadDatabaseProperties();
    }

    // 기본 날짜 설정
    const today = new Date();
    setEndDate(formatDateString(today));
  }, []);

  // 데이터베이스 ID가 변경되면 데이터베이스 속성 정보를 가져옵니다
  useEffect(() => {
    if (databaseId) {
      loadDatabaseProperties();
    }
  }, [databaseId]);

  // 데이터베이스 속성 정보를 가져오는 함수
  const loadDatabaseProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // 데이터베이스에서 첫 번째 항목을 가져옵니다
      const results = await fetchNotionDatabase();

      if (results && results.length > 0) {
        // 첫 번째 항목의 속성 구조를 확인합니다
        const firstItem = results[0];
        const properties = firstItem.properties;

        // 사용 가능한 속성 목록을 생성합니다
        const options = [];
        const propertiesMap = {};

        // 각 속성의 유형을 확인합니다
        Object.entries(properties).forEach(([key, value]) => {
          propertiesMap[key] = value.type;
          options.push({
            name: key,
            type: value.type,
          });
        });

        setDatabaseProperties(propertiesMap);
        setPropertyOptions(options);

        // 타이틀 유형의 속성을 기본으로 선택합니다
        const titleProperty = options.find((prop) => prop.type === "title");
        if (titleProperty) {
          setSelectedTitleProperty(titleProperty.name);
        }

        // 리치 텍스트 유형의 속성을 기본으로 선택합니다
        const textProperty = options.find((prop) => prop.type === "rich_text");
        if (textProperty) {
          setSelectedContentProperty(textProperty.name);
        }
      }
    } catch (err) {
      setError(
        "데이터베이스 속성 정보를 가져오는 중 오류가 발생했습니다: " +
          err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // 운동 데이터 파싱 함수 (테이블 형식)
  const parseWorkoutData = (text) => {
    const workoutData = {};

    // 정규식을 사용하여 테이블 행 추출
    const regex = /\| # (\w+) \| (.*?) \|/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const exercise = match[1];
      const record = match[2].trim();
      workoutData[exercise] = record === "" ? "Empty" : record;
    }

    return workoutData;
  };

  // 페이지에 내용 추가
  const handleAddToPage = async (e) => {
    e.preventDefault();
    if (!pageId.trim() || !input.trim()) {
      setError("페이지 ID와 내용을 모두 입력해주세요");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await addContentToPage(pageId, input);
      setResult({
        success: true,
        message: "내용이 Notion 페이지에 성공적으로 추가되었습니다",
        data: response,
      });
    } catch (err) {
      setError(err.message || "내용 추가 중 오류가 발생했습니다");
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  // 데이터베이스에 항목 추가
  const handleAddToDatabase = async (e) => {
    e.preventDefault();
    if (!databaseId.trim() || !input.trim()) {
      setError("데이터베이스 ID와 내용을 모두 입력해주세요");
      return;
    }

    if (!selectedTitleProperty) {
      setError("제목으로 사용할 속성을 선택해주세요");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 선택된 속성에 맞게 properties 객체를 만듭니다
      const properties = {};

      // 제목 속성 설정
      if (selectedTitleProperty) {
        properties[selectedTitleProperty] = {
          title: [
            {
              text: {
                content: `운동 기록 ${new Date().toLocaleString()}`,
              },
            },
          ],
        };
      }

      // 날짜 속성이 있다면 날짜 추가
      if (startDate) {
        properties["start"] = {
          date: {
            start: startDate,
          },
        };
      }

      if (endDate) {
        properties["end"] = {
          date: {
            start: endDate,
          },
        };
      }

      // 구조화된 데이터 사용 설정이 켜져 있는 경우
      if (useStructuredData) {
        const workoutData = parseWorkoutData(input);

        // 파싱된 운동 데이터를 속성에 추가
        Object.entries(workoutData).forEach(([exercise, record]) => {
          // 해당 운동 이름의 속성이 있는지 확인
          if (databaseProperties[exercise]) {
            const type = databaseProperties[exercise];

            // 속성 유형에 따라 적절한 값 설정
            if (type === "rich_text") {
              properties[exercise] = {
                rich_text: [
                  {
                    text: {
                      content: record,
                    },
                  },
                ],
              };
            } else if (type === "text") {
              properties[exercise] = {
                text: {
                  content: record,
                },
              };
            } else if (type === "number" && record !== "Empty") {
              // 숫자 값으로 변환 시도
              const numericValue = parseFloat(record);
              if (!isNaN(numericValue)) {
                properties[exercise] = {
                  number: numericValue,
                };
              }
            }
          }
        });
      }

      // 내용 속성 설정 (구조화된 데이터를 사용하더라도 전체 내용도 저장)
      if (selectedContentProperty) {
        const type = databaseProperties[selectedContentProperty];
        if (type === "rich_text") {
          properties[selectedContentProperty] = {
            rich_text: [
              {
                text: {
                  content: input,
                },
              },
            ],
          };
        } else if (type === "text") {
          properties[selectedContentProperty] = {
            text: {
              content: input,
            },
          };
        }
      }

      const response = await addItemToDatabase(databaseId, properties);
      setResult({
        success: true,
        message: "항목이 Notion 데이터베이스에 성공적으로 추가되었습니다",
        data: response,
      });
    } catch (err) {
      setError(err.message || "항목 추가 중 오류가 발생했습니다");
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  // 테이블 모드에서 데이터베이스에 항목 추가
  const handleAddTableToDatabase = async (e) => {
    e.preventDefault();
    if (!databaseId.trim()) {
      setError("데이터베이스 ID를 입력해주세요");
      return;
    }

    if (!selectedTitleProperty) {
      setError("제목으로 사용할 속성을 선택해주세요");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 속성 객체 초기화
      const properties = {};

      // 이름(제목) 속성 설정
      if (selectedTitleProperty) {
        properties[selectedTitleProperty] = {
          title: [
            {
              text: {
                content: userName || `사용자 ${new Date().toLocaleString()}`,
              },
            },
          ],
        };
      }

      // 날짜 속성 추가 (start/end로 속성 이름 변경)
      if (startDate) {
        properties["start"] = {
          date: {
            start: startDate,
          },
        };
      }

      if (endDate) {
        properties["end"] = {
          date: {
            start: endDate,
          },
        };
      }

      // 각 운동별 수치 설정
      Object.entries(exerciseValues).forEach(([exercise, value]) => {
        if (databaseProperties[exercise]) {
          const type = databaseProperties[exercise];

          if (type === "number" && value !== "") {
            // 숫자 값으로 변환
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue)) {
              properties[exercise] = {
                number: numericValue,
              };
            }
          } else if (type === "rich_text" || type === "text") {
            properties[exercise] = {
              rich_text: [
                {
                  text: {
                    content: value === "" ? "Empty" : value,
                  },
                },
              ],
            };
          }
        }
      });

      // 메모 속성 추가 (만약 memo 속성이 데이터베이스에 있다면)
      if (databaseProperties["dec"]) {
        const type = databaseProperties["dec"];
        if (type === "rich_text" || type === "text") {
          properties["dec"] = {
            rich_text: [
              {
                text: {
                  content: memo,
                },
              },
            ],
          };
        }
      }

      const response = await addItemToDatabase(databaseId, properties);
      setResult({
        success: true,
        message: "운동 기록이 Notion 데이터베이스에 성공적으로 추가되었습니다",
        data: response,
      });

      // 입력 필드 초기화
      setUserName("");
      setExerciseValues({
        benchpress: "",
        deadlift: "",
        squat: "",
        clean: "",
        jerk: "",
        snatch: "",
      });
      setMemo(""); // 메모 초기화 추가
    } catch (err) {
      setError(err.message || "항목 추가 중 오류가 발생했습니다");
      setResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  // 포매팅된 날짜 표시
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "날짜 선택";
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  return (
    <div className="notion-integration">
      <h2>Notion에 저장하기</h2>

      <div className="template-buttons">
        <button
          onClick={enableTableMode}
          className="template-button table-mode-button"
        >
          테이블 모드 활성화
        </button>
      </div>

      {!tableMode ? (
        // 기존 텍스트 입력 모드
        <div className="input-container">
          <label htmlFor="gpt-input">GPT 응답 내용:</label>
          <textarea
            id="gpt-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Notion에 저장할 GPT 응답 내용을 입력하세요"
            rows={10}
          />
        </div>
      ) : (
        // 테이블 모드 입력 폼
        <div className="table-input-container">
          <h3>테이블 모드 - 운동 기록 입력</h3>

          {/* 날짜 범위 선택 부분 */}
          <div className="date-range-container">
            <h4>기간 설정</h4>
            <div className="date-selector">
              <div className="date-fields">
                <div
                  className="date-field"
                  onClick={() => toggleCalendar("start")}
                >
                  <span>시작일:</span> {formatDisplayDate(startDate)}
                </div>
                <div
                  className="date-field"
                  onClick={() => toggleCalendar("end")}
                >
                  <span>종료일:</span> {formatDisplayDate(endDate)}
                </div>
              </div>

              {showCalendar && (
                <div className="calendar-popup">
                  <div className="calendar-header">
                    <button className="month-nav" onClick={prevMonth}>
                      &lt;
                    </button>
                    <div className="current-month">
                      {getMonthName(currentMonth)}
                    </div>
                    <button className="month-nav" onClick={nextMonth}>
                      &gt;
                    </button>
                  </div>

                  <div className="calendar-grid">
                    {weekdays.map((day, index) => (
                      <div key={index} className="weekday">
                        {day}
                      </div>
                    ))}

                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-day ${
                          day.currentMonth ? "current-month" : "other-month"
                        } ${
                          isSameDay(day.date, new Date(startDate)) ||
                          isSameDay(day.date, new Date(endDate))
                            ? "selected"
                            : ""
                        } ${
                          startDate &&
                          endDate &&
                          day.date > new Date(startDate) &&
                          day.date < new Date(endDate)
                            ? "in-range"
                            : ""
                        }`}
                        onClick={() => handleDateSelect(day.date)}
                      >
                        {day.day}
                      </div>
                    ))}
                  </div>

                  <div className="date-range-actions">
                    <div className="date-range-buttons">
                      <button onClick={() => setDateRange(1)}>1달</button>
                      <button onClick={() => setDateRange(3)}>3달</button>
                      <button onClick={() => setDateRange(6)}>6달</button>
                      <button onClick={() => setDateRange(12)}>1년</button>
                    </div>
                    <button className="done-button" onClick={handleDoneClick}>
                      완료
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="input-row">
            <label htmlFor="user-name">이름:</label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="사용자 이름"
            />
          </div>

          <div className="exercise-grid">
            {Object.keys(exerciseValues).map((exercise) => (
              <div key={exercise} className="exercise-input">
                <label htmlFor={`exercise-${exercise}`}>{exercise}:</label>
                <input
                  id={`exercise-${exercise}`}
                  type="number"
                  value={exerciseValues[exercise]}
                  onChange={(e) =>
                    handleExerciseValueChange(exercise, e.target.value)
                  }
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* 메모 입력 영역 추가 */}
          <div className="memo-container">
            <label htmlFor="workout-memo">메모:</label>
            <textarea
              id="workout-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="운동에 대한 메모를 입력하세요"
              rows={4}
            />
          </div>
        </div>
      )}

      <div className="page-section">
        <h3>Notion 페이지에 추가</h3>
        <div className="input-row">
          <label htmlFor="page-id">Notion 페이지 ID:</label>
          <input
            id="page-id"
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <button onClick={handleAddToPage} disabled={loading}>
          {loading ? "처리 중..." : "페이지에 추가"}
        </button>
      </div>

      <div className="database-section">
        <h3>Notion 데이터베이스에 추가</h3>
        <div className="input-row">
          <label htmlFor="database-id">Notion 데이터베이스 ID:</label>
          <input
            id="database-id"
            type="text"
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        {propertyOptions.length > 0 && (
          <>
            <div className="input-row">
              <label htmlFor="title-property">제목(이름) 속성 선택:</label>
              <select
                id="title-property"
                value={selectedTitleProperty}
                onChange={(e) => setSelectedTitleProperty(e.target.value)}
              >
                <option value="">-- 선택하세요 --</option>
                {propertyOptions
                  .filter((prop) => prop.type === "title")
                  .map((prop) => (
                    <option key={prop.name} value={prop.name}>
                      {prop.name}
                    </option>
                  ))}
              </select>
            </div>

            {!tableMode && (
              <>
                <div className="input-row">
                  <label htmlFor="content-property">내용 속성 선택:</label>
                  <select
                    id="content-property"
                    value={selectedContentProperty}
                    onChange={(e) => setSelectedContentProperty(e.target.value)}
                  >
                    <option value="">-- 선택하세요 --</option>
                    {propertyOptions
                      .filter((prop) =>
                        ["rich_text", "text"].includes(prop.type)
                      )
                      .map((prop) => (
                        <option key={prop.name} value={prop.name}>
                          {prop.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="input-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={useStructuredData}
                      onChange={(e) => setUseStructuredData(e.target.checked)}
                    />
                    운동 데이터를 개별 속성으로 저장 (DB에 각 운동명 속성 필요)
                  </label>
                </div>
              </>
            )}
          </>
        )}

        <button
          onClick={tableMode ? handleAddTableToDatabase : handleAddToDatabase}
          disabled={loading}
        >
          {loading ? "처리 중..." : "데이터베이스에 추가"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>오류: {error}</p>
        </div>
      )}

      {result && result.success && (
        <div className="success-message">
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}

export default NotionIntegration;
