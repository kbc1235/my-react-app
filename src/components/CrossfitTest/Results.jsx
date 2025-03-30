import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import crossfitTypes from "../../data/crossfitTypes";

// 임시 이미지 URL
const FALLBACK_IMAGES = {
  avatar: "/images/default-avatar.svg",
  userAvatar: "/images/user-avatar.svg",
  maleAvatar: "/images/default-avatar.svg",
  femaleAvatar: "/images/default-avatar.svg",
};

// 임시 이미지 데이터 (Base64)
const FALLBACK_IMAGE_DATA = {
  placeholder:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiNBMEEwQTAiLz48cGF0aCBkPSJNNDAgMTgwQzQwIDE1MCA2MyAxMzAgMTAwIDEzMFMxNjAgMTUwIDE2MCAxODBWMjAwSDQwVjE4MFoiIGZpbGw9IiNBMEEwQTAiLz48L3N2Zz4=",
};

// 기본 유형 생성 함수 추가
const createDefaultType = (typeCode, gender) => {
  // 코드의 각 글자 해석
  const eOrI = typeCode[0] === "E" ? "단체형" : "개인형";
  const hOrL = typeCode[1] === "H" ? "고강도" : "메타콘";
  const pOrR = typeCode[2] === "P" ? "성과 지향" : "건강 지향";
  const gOrB = typeCode[3] === "G" ? "체조 중심" : "바벨 중심";

  // 기본 유형 객체 생성 (성별 적용)
  return {
    code: typeCode,
    name: `${eOrI} ${gOrB} (${typeCode})`,
    gender: gender,
    description: `당신은 ${eOrI}, ${hOrL}, ${pOrR}, ${gOrB} 성향을 가진 크로스핏 애호가입니다. 이 유형은 특별한 강점과 특성을 가지고 있습니다.`,
    strengths: [
      typeCode[0] === "E" ? "팀 환경에서의 동기부여" : "자기 주도적 훈련",
      typeCode[1] === "H" ? "고강도 훈련" : "지구력 운동",
      typeCode[2] === "P" ? "경쟁적 환경" : "지속 가능한 훈련",
      typeCode[3] === "G" ? "체조 동작" : "바벨 기술",
    ],
    weaknesses: [
      typeCode[0] === "E" ? "독립적 훈련" : "단체 운동",
      typeCode[1] === "H" ? "장시간 메타콘" : "최대 중량 리프팅",
      typeCode[2] === "P" ? "부상 방지" : "경쟁력",
      typeCode[3] === "G" ? "바벨 운동" : "체조 동작",
    ],
    recommendedWods: [
      typeCode[3] === "G" ? "Cindy" : "Grace",
      typeCode[1] === "H" ? "Fran" : "Murph",
      typeCode[0] === "E" ? "Team WODs" : "Individual WODs",
      "맞춤형 프로그래밍",
    ],
    trainingTips: [
      typeCode[0] === "E"
        ? "소셜 환경에서 트레이닝 하세요"
        : "개인 프로그래밍을 시도해보세요",
      typeCode[1] === "H"
        ? "주 2-3회 고강도 세션을 계획하세요"
        : "지구력 향상에 집중하세요",
      typeCode[2] === "P"
        ? "목표 설정과 측정을 활용하세요"
        : "지속 가능한 훈련 계획을 세우세요",
      typeCode[3] === "G"
        ? "주 2회 체조 기술 세션을 추가하세요"
        : "올림픽 리프팅 기술에 시간을 투자하세요",
    ],
    avatar:
      gender === "male"
        ? FALLBACK_IMAGES.maleAvatar
        : FALLBACK_IMAGES.femaleAvatar,
    characteristics: {
      training: typeCode[0] === "E" ? "팀/그룹 환경 (E)" : "개인 훈련 (I)",
      technique: typeCode[1] === "H" ? "고강도 (H)" : "메타콘 (L)",
      environment: typeCode[2] === "P" ? "성과 지향 (P)" : "건강 중심 (R)",
      skill: typeCode[3] === "G" ? "체조 중심 (G)" : "바벨 중심 (B)",
    },
    // 추가: 운동 능력치 (Lift, Cardio, Gymnastics)
    scores: {
      lift: typeCode[3] === "B" ? 70 : typeCode[1] === "H" ? 60 : 40,
      cardio: typeCode[1] === "L" ? 70 : 50,
      gymnastics: typeCode[3] === "G" ? 70 : typeCode[1] === "H" ? 60 : 40,
    },
  };
};

const Results = ({ result, gender, onRestart }) => {
  // 이미지 로드 상태 관리
  const [characterImageError, setCharacterImageError] = useState(false);
  const [userAvatarError, setUserAvatarError] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const resultContentRef = useRef(null);

  // 성별에 맞는 유형 찾기
  let typeMatches = crossfitTypes.filter((type) => type.code === result.type);

  // 성별에 맞는 유형 선택
  let typeResult;
  if (typeMatches.length > 0) {
    // 같은 코드로 여러 유형이 있으면 성별이 일치하는 것을 우선 선택
    const genderMatch = typeMatches.find((type) => type.gender === gender);
    typeResult = genderMatch || typeMatches[0];
  }

  // 정의된 유형이 없으면 기본 유형 생성
  if (!typeResult) {
    console.log(
      `유형 ${result.type} (성별: ${gender})에 대한 정의가 없습니다. 기본 유형을 생성합니다.`
    );
    typeResult = createDefaultType(result.type, gender);
  }

  // 총 점수 계산 (Lift + Cardio + Gymnastics)
  const totalScore =
    (typeResult.scores?.lift || 60) +
    (typeResult.scores?.cardio || 60) +
    (typeResult.scores?.gymnastics || 60);

  // 이미지 캡처 및 팝업 표시 함수
  const captureAndShowImage = async () => {
    if (!resultContentRef.current) return;

    try {
      // 캡처 전에 result-footer 영역과 branding-footer 영역을 임시로 숨김
      const footerElement =
        resultContentRef.current.querySelector(".result-footer");
      const brandingElement =
        resultContentRef.current.querySelector(".branding-footer");

      if (footerElement) footerElement.style.display = "none";
      if (brandingElement) brandingElement.style.display = "none";

      // html2canvas를 사용하여 지정된 영역을 캡처
      const canvas = await html2canvas(resultContentRef.current, {
        scale: 2, // 고해상도 캡처
        useCORS: true, // 외부 이미지 로드 허용
        backgroundColor: "#ffffff",
      });

      // 원래대로 footer 영역 표시 복원
      if (footerElement) footerElement.style.display = "";
      if (brandingElement) brandingElement.style.display = "";

      // 캡처된 이미지 URL 생성 및 상태 업데이트
      const imageUrl = canvas.toDataURL("image/png");
      setCapturedImage(imageUrl);
      setShowImagePopup(true);
    } catch (error) {
      console.error("이미지 캡처 중 오류 발생:", error);
      alert("이미지 캡처에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 이미지 다운로드 함수
  const downloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = `crossfit-mbti-${result.type}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 팝업 닫기 함수
  const closePopup = () => {
    setShowImagePopup(false);
  };

  return (
    <div
      className="crossfit-result-page"
      style={{ color: "#1e1e1e" }}
      ref={resultContentRef}
    >
      {/* 헤더 영역 */}
      <div className="result-header">
        <h2 style={{ color: "#1e1e1e" }}>당신의 크로스핏 MBTI 유형</h2>

        <div className="result-character">
          <div className="character-image">
            {characterImageError ? (
              <div className="placeholder-image character-placeholder">
                {/* 캐릭터 이미지가 로드되지 않을 때 표시할 대체 콘텐츠 */}
                <div className="placeholder-icon">
                  <img
                    src={FALLBACK_IMAGE_DATA.placeholder}
                    alt="캐릭터 이미지"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>
            ) : (
              <img
                src={typeResult.avatar || FALLBACK_IMAGES.avatar}
                alt={typeResult.name}
                onError={() => {
                  console.log("Character image failed to load");
                  setCharacterImageError(true);
                }}
              />
            )}
            <div className="character-tag">
              <span>IT'S MY</span>
              <span>TURN NEXT!</span>
            </div>
          </div>
          <div className="character-title">DEV</div>
        </div>
      </div>

      {/* 점수 영역 */}
      <div className="result-score-section">
        <div className="user-avatar">
          {userAvatarError ? (
            <div className="placeholder-image user-placeholder">
              {/* 사용자 아바타 이미지가 로드되지 않을 때 표시할 아이콘 */}
              <img
                src={FALLBACK_IMAGE_DATA.placeholder}
                alt="사용자 아바타"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            </div>
          ) : (
            <img
              src={FALLBACK_IMAGES.userAvatar}
              alt="User Avatar"
              onError={() => {
                console.log("User avatar failed to load");
                setUserAvatarError(true);
              }}
            />
          )}
        </div>
        <div className="ability-scores">
          <div className="ability-item">
            <span className="ability-name" style={{ color: "#1e1e1e" }}>
              Lift
            </span>
            <div className="ability-bar-container">
              <div
                className="ability-bar"
                style={{ width: `${typeResult.scores?.lift || 60}%` }}
              ></div>
            </div>
          </div>
          <div className="ability-item">
            <span className="ability-name" style={{ color: "#1e1e1e" }}>
              Cardio
            </span>
            <div className="ability-bar-container">
              <div
                className="ability-bar"
                style={{ width: `${typeResult.scores?.cardio || 60}%` }}
              ></div>
            </div>
          </div>
          <div className="ability-item">
            <span className="ability-name" style={{ color: "#1e1e1e" }}>
              Gymnastics
            </span>
            <div className="ability-bar-container">
              <div
                className="ability-bar"
                style={{ width: `${typeResult.scores?.gymnastics || 60}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="total-score" style={{ color: "#1e1e1e" }}>
          <span>{totalScore}</span>
          <span>Total Score</span>
        </div>
      </div>

      {/* 설명 영역 */}
      <div className="result-description">
        <p className="quote">"{typeResult.name}이 등장!!!"</p>
        <p>{typeResult.description}</p>
        <p>{typeResult.trainingTips}</p>
      </div>

      {/* 푸터 버튼 영역 */}
      <div className="result-footer">
        <button
          className="action-btn"
          onClick={onRestart}
          style={{ color: "#1e1e1e" }}
        >
          다시 하기
        </button>
        <button className="action-btn" style={{ color: "#1e1e1e" }}>
          친구에게 공유하기
        </button>
        <button
          className="action-btn"
          style={{ color: "#1e1e1e" }}
          onClick={captureAndShowImage}
        >
          인스타그램용 이미지 저장
        </button>
      </div>

      {/* 브랜딩 푸터 */}
      <div className="branding-footer" style={{ color: "#1e1e1e" }}>
        <span>@OMMV.KR / WWW.OMMV.KR</span>
      </div>

      {/* 이미지 팝업 */}
      {showImagePopup && (
        <div className="image-popup-backdrop">
          <div className="image-popup-container">
            <div className="image-popup-header">
              <h3>인스타그램용 이미지</h3>
              <button className="popup-close-btn" onClick={closePopup}>
                ×
              </button>
            </div>
            <div className="image-popup-content">
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="캡처된 이미지"
                  className="captured-image"
                />
              )}
            </div>
            <div className="image-popup-footer">
              <button className="download-btn" onClick={downloadImage}>
                이미지 다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Results.propTypes = {
  result: PropTypes.shape({
    type: PropTypes.string.isRequired,
    scores: PropTypes.shape({
      EI: PropTypes.number.isRequired,
      HL: PropTypes.number.isRequired,
      PR: PropTypes.number.isRequired,
      GB: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  gender: PropTypes.string.isRequired,
  onRestart: PropTypes.func.isRequired,
};

export default Results;
