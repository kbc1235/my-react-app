/**
 * 크로스핏 성향 MBTI 유형 데이터
 * 16가지 조합의 유형 정의 (E/I, H/L, P/R, G/B)
 */

const crossfitTypes = [
  // 기존 유형들
  {
    id: 1,
    code: "EHPB",
    name: "강철 리프터",
    gender: "male",
    description:
      "고중량 바벨 운동을 선호하며 경쟁적인 환경에서 최고의 기량을 발휘하는 유형",
    strengths: ["올림픽 리프팅", "바벨 운동", "고중량 리프팅", "파워 출력"],
    weaknesses: ["지구력", "체조 동작", "유연성"],
    recommendedWods: ["Grace", "Isabel", "DT", "바벨 중심 WOD"],
    trainingTips: [
      "주 3회 올림픽 리프팅 세션 추천",
      "1RM 최대 중량 도전을 주기적으로 진행",
      "지구력 향상을 위한 보조 훈련 추가",
    ],
    avatar: "/images/crossfit-types/male-heavy.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "중량 중심 (H)",
      environment: "성과 지향 (P)",
      skill: "바벨 기술 (B)",
    },
  },
  {
    id: 2,
    code: "ILRG",
    name: "체조 마스터",
    gender: "male",
    description:
      "체조 동작에 탁월한 기술을 보유하고 있으며, 정확한 자세와 기술 향상에 집중하는 유형",
    strengths: ["체조 기술", "바디웨이트 운동", "유연성", "기술적 정확도"],
    weaknesses: ["최대 중량", "장시간 메타콘"],
    recommendedWods: ["Cindy", "Mary", "Murph", "체조 중심 WOD"],
    trainingTips: [
      "머슬업, 핸드스탠드워크 등 고급 체조 기술 연습",
      "점진적 기술 향상을 위한 단계별 훈련",
      "중량 운동과의 균형 유지",
    ],
    avatar: "/images/crossfit-types/male-gymnastic.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "메타콘 (L)",
      environment: "건강 중심 (R)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 3,
    code: "EHPG",
    name: "체조 퀸",
    gender: "female",
    description:
      "높은 강도의 체조 동작에 탁월하며 경쟁적인 환경에서 탁월한 성과를 내는 유형",
    strengths: ["풀업", "머슬업", "핸드스탠드 워크", "짧은 고강도 운동"],
    weaknesses: ["장시간 지구력 운동", "최대 중량 리프팅"],
    recommendedWods: ["Diane", "Amanda", "Fran", "체조+바벨 복합 WOD"],
    trainingTips: [
      "고강도 체조 기술 세션 주 2-3회",
      "단체 수업에서 동기부여 받기",
      "스트렝스와 파워 향상을 위한 보조 운동",
    ],
    avatar: "/images/crossfit-types/female-gymnastic.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "고강도 (H)",
      environment: "성과 지향 (P)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 4,
    code: "ILRB",
    name: "올림픽 리프터",
    gender: "female",
    description:
      "바벨 기술에 정확도를 추구하며 건강과 기술 향상에 집중하는 유형",
    strengths: ["스내치", "클린 & 저크", "기술적 정확도", "폼"],
    weaknesses: ["고강도 메타콘", "체조 기술"],
    recommendedWods: ["Bear Complex", "Grace", "Linda", "기술 중심 WOD"],
    trainingTips: [
      "정확한 폼에 집중하는 개인 훈련",
      "점진적인 기술 향상을 위한 단계별 접근",
      "저강도 장시간 훈련으로 기초 체력 구축",
    ],
    avatar: "/images/crossfit-types/female-olympic.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "메타콘 (L)",
      environment: "건강 중심 (R)",
      skill: "바벨 중심 (B)",
    },
  },

  // 새로 추가하는 유형들
  {
    id: 5,
    code: "EHPG",
    name: "투혼의 체조 마스터",
    gender: "male",
    description:
      "고강도 체조 운동을 선호하며 경쟁적인 환경에서 기술적 완성도를 추구하는 유형",
    strengths: ["체조 동작", "빠른 학습 능력", "고강도 운동", "팀 환경 적응력"],
    weaknesses: ["장시간 운동", "정밀한 웨이트리프팅 기술"],
    recommendedWods: ["Murph", "Chelsea", "Angie", "Hero WODs"],
    trainingTips: [
      "주 3회 체조 기술 특화 훈련",
      "팀 WOD에 적극 참여하기",
      "고강도 인터벌 트레이닝으로 스태미나 향상",
    ],
    avatar: "/images/crossfit-types/male-gymnastic-intense.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "고강도 (H)",
      environment: "성과 지향 (P)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 6,
    code: "EHRB",
    name: "파워 리프터",
    gender: "female",
    description:
      "고강도 바벨 운동을 선호하고 건강 유지와 체력 향상에 집중하는 유형",
    strengths: ["최대 중량 리프팅", "파워 출력", "빠른 회복력", "강한 멘탈"],
    weaknesses: ["유연성", "장시간 지구력 운동", "세부적 기술 연마"],
    recommendedWods: [
      "Linda",
      "1RM 테스트",
      "바벨 콤플렉스",
      "파워 리프팅 WOD",
    ],
    trainingTips: [
      "주 3-4회 웨이트 훈련과 파워 개발",
      "정확한 리프팅 폼에 집중",
      "유연성과 모빌리티 보완 훈련 추가",
    ],
    avatar: "/images/crossfit-types/female-powerlifter.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "고강도 (H)",
      environment: "건강 중심 (R)",
      skill: "바벨 기술 (B)",
    },
  },
  {
    id: 7,
    code: "EHRG",
    name: "팀 체조 스페셜리스트",
    gender: "male",
    description:
      "그룹 환경에서 고강도 체조 동작에 뛰어난 실력을 발휘하며 건강한 생활을 추구하는 유형",
    strengths: ["머슬업", "HSPU", "팀워크", "에너지 관리"],
    weaknesses: ["단독 훈련", "장시간 지구력", "반복적 훈련"],
    recommendedWods: ["Filthy Fifty", "Gym Class Heroes", "체조 중심 팀 WOD"],
    trainingTips: [
      "그룹 클래스에서 체조 기술 연습",
      "고강도/짧은 시간 WOD 선호",
      "지속적인 건강관리와 회복에 집중",
    ],
    avatar: "/images/crossfit-types/male-team-gymnast.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "고강도 (H)",
      environment: "건강 중심 (R)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 8,
    code: "ELPB",
    name: "지구력 바벨 애슬릿",
    gender: "female",
    description:
      "팀 환경에서 저강도 장시간 바벨 운동을 선호하며 경쟁적인 성과를 추구하는 유형",
    strengths: ["지구력", "일관된 페이싱", "바벨 컨트롤", "경쟁 심리"],
    weaknesses: ["최대 중량 리프팅", "폭발적인 동작", "체조 기술"],
    recommendedWods: ["Barbara", "5K Row", "Kalsu", "EMOM 바벨 워크아웃"],
    trainingTips: [
      "지구력 중심의 바벨 훈련",
      "꾸준한 훈련 일지 작성",
      "장시간 WOD에서 페이싱 전략 개발",
    ],
    avatar: "/images/crossfit-types/female-endurance.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "메타콘 (L)",
      environment: "성과 지향 (P)",
      skill: "바벨 중심 (B)",
    },
  },
  {
    id: 9,
    code: "ELPG",
    name: "메타콘 체조 전문가",
    gender: "male",
    description:
      "긴 시간 메타콘에서 체조 동작을 꾸준히 수행하며 경쟁 환경을 즐기는 유형",
    strengths: ["지구력", "체조 기술의 효율성", "페이싱", "멘탈 강인함"],
    weaknesses: ["최대 중량", "폭발적 파워", "단기 고강도 운동"],
    recommendedWods: ["Cindy", "AMRAP 20분", "Murph", "팀 컴페티션"],
    trainingTips: [
      "효율적인 체조 동작 기술 연마",
      "지구력 강화를 위한 긴 WOD 훈련",
      "팀 환경에서 꾸준한 페이스 유지 연습",
    ],
    avatar: "/images/crossfit-types/male-metcon.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "메타콘 (L)",
      environment: "성과 지향 (P)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 10,
    code: "ELRG",
    name: "지속 가능한 체조 애호가",
    gender: "female",
    description:
      "장시간 낮은 강도의 체조 운동을 즐기며 건강한 라이프스타일을 추구하는 유형",
    strengths: ["지구력", "체조 기술 정확도", "일관성", "장기적 발전"],
    weaknesses: ["고강도 운동", "1RM 리프팅", "단기 경쟁"],
    recommendedWods: ["Cindy 변형", "오래 지속되는 체조 EMOM", "Annie"],
    trainingTips: [
      "꾸준한 체조 기술 연습",
      "지속 가능한 훈련 일정 계획",
      "회복과 부상 방지에 집중",
    ],
    avatar: "/images/crossfit-types/female-sustainable.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "메타콘 (L)",
      environment: "건강 중심 (R)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 11,
    code: "ELRB",
    name: "지속 가능한 바벨 실천가",
    gender: "male",
    description:
      "낮은 강도로 꾸준히 바벨 기술을 연마하며 건강한 훈련 방식을 추구하는 유형",
    strengths: ["기술적 정확도", "일관성", "지구력", "부상 방지"],
    weaknesses: ["최대 중량", "고강도 운동", "경쟁적 환경"],
    recommendedWods: ["바벨 중심 EMOM", "Light Grace", "복합 동작 기술 개발"],
    trainingTips: [
      "정확한 기술에 집중한 바벨 훈련",
      "적절한 회복 시간 보장",
      "단계적인 중량 증가",
    ],
    avatar: "/images/crossfit-types/male-sustainable-barbell.jpg",
    characteristics: {
      training: "팀/그룹 환경 (E)",
      technique: "메타콘 (L)",
      environment: "건강 중심 (R)",
      skill: "바벨 중심 (B)",
    },
  },
  {
    id: 12,
    code: "IHPB",
    name: "독립적 파워 리프터",
    gender: "female",
    description:
      "혼자 훈련하는 고강도 바벨 운동 전문가로 경쟁과 기록 향상에 집중하는 유형",
    strengths: ["자기 주도적 훈련", "최대 중량 리프팅", "집중력", "기술 개발"],
    weaknesses: ["팀 환경 적응", "장시간 지구력", "체조 동작"],
    recommendedWods: ["벤치마크 바벨 WOD", "1RM 테스트", "The Total"],
    trainingTips: [
      "개인 프로그래밍으로 약점 집중 개선",
      "고강도 바벨 기술 세션 주 3-4회",
      "영상 분석을 통한 기술 향상",
    ],
    avatar: "/images/crossfit-types/female-independent-lifter.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "고강도 (H)",
      environment: "성과 지향 (P)",
      skill: "바벨 중심 (B)",
    },
  },
  {
    id: 13,
    code: "IHPG",
    name: "독립적 체조 챔피언",
    gender: "male",
    description:
      "개인 훈련을 통해 고난도 체조 기술을 정복하고 경쟁에서 성과를 추구하는 유형",
    strengths: ["고급 체조 기술", "자기 훈련", "목표 달성력", "인내심"],
    weaknesses: ["팀 환경", "바벨 복합 동작", "긴 메타콘"],
    recommendedWods: ["개인 체조 훈련", "맞춤형 스킬 개발", "Strict 체조 WOD"],
    trainingTips: [
      "개인적인 체조 기술 마스터 플랜 수립",
      "약점 분석 및 맞춤형 훈련",
      "경쟁 준비를 위한 계획적 훈련",
    ],
    avatar: "/images/crossfit-types/male-independent-gymnast.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "고강도 (H)",
      environment: "성과 지향 (P)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 14,
    code: "IHRB",
    name: "건강 중심 독립 리프터",
    gender: "female",
    description:
      "개인적으로 고강도 바벨 운동을 수행하며 건강과 균형적인 발전을 추구하는 유형",
    strengths: ["자기 관리", "바벨 기술", "신체 인식", "회복 능력"],
    weaknesses: ["경쟁 환경", "팀 워크아웃", "긴 메타콘"],
    recommendedWods: ["개인 바벨 콤플렉스", "5x5 프로그램", "건강 중심 훈련"],
    trainingTips: [
      "자신의 몸 상태에 맞는 중량 설정",
      "완벽한 폼에 집중",
      "회복과 영양에 투자",
    ],
    avatar: "/images/crossfit-types/female-health-lifter.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "고강도 (H)",
      environment: "건강 중심 (R)",
      skill: "바벨 중심 (B)",
    },
  },
  {
    id: 15,
    code: "IHRG",
    name: "체조 건강 추구자",
    gender: "male",
    description:
      "개인적으로 강도 높은 체조 훈련을 통해 건강과 신체 능력 향상을 추구하는 유형",
    strengths: ["체조 기술 정확도", "자기 인식", "회복 능력", "장기적 발전"],
    weaknesses: ["팀 환경", "경쟁 상황", "바벨 리프팅"],
    recommendedWods: [
      "개인 체조 루틴",
      "신체 조절 기술 워크아웃",
      "요가 혼합 WOD",
    ],
    trainingTips: [
      "체계적인 체조 기술 진행",
      "신체 피드백 경청",
      "운동과 명상의 조화",
    ],
    avatar: "/images/crossfit-types/male-health-gymnast.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "고강도 (H)",
      environment: "건강 중심 (R)",
      skill: "체조 중심 (G)",
    },
  },
  {
    id: 16,
    code: "ILPB",
    name: "지구력 바벨 전략가",
    gender: "female",
    description:
      "장시간 저강도 바벨 운동을 개인적으로 수행하며 경쟁에서 전략적 우위를 추구하는 유형",
    strengths: ["페이싱", "바벨 효율성", "전략적 사고", "자기 관리"],
    weaknesses: ["팀 환경", "최대 중량 리프팅", "짧은 고강도 WOD"],
    recommendedWods: ["장시간 AMRAP", "바벨 지구력 테스트", "개인 페이싱 WOD"],
    trainingTips: [
      "자신만의 페이싱 전략 개발",
      "효율적인 바벨 동작 연마",
      "장시간 훈련을 위한 영양 계획",
    ],
    avatar: "/images/crossfit-types/female-endurance-strategist.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "메타콘 (L)",
      environment: "성과 지향 (P)",
      skill: "바벨 중심 (B)",
    },
  },
  {
    id: 17,
    code: "ILPG",
    name: "체조 지구력 경쟁자",
    gender: "male",
    description:
      "개인적으로 장시간 체조 중심 운동을 통해 경쟁에서의 성과를 추구하는 유형",
    strengths: ["체조 지구력", "멘탈 강인함", "꾸준한 페이스", "자기 인식"],
    weaknesses: ["팀 워크아웃", "최대 강도 운동", "바벨 기술"],
    recommendedWods: ["Murph 개인 변형", "긴 AMRAP 체조", "체조 EMOM"],
    trainingTips: [
      "체조 동작의 효율성 극대화",
      "경쟁을 위한 페이싱 전략 수립",
      "홀로 긴 시간 훈련하는 정신력 강화",
    ],
    avatar: "/images/crossfit-types/male-endurance-competitor.jpg",
    characteristics: {
      training: "개인 훈련 (I)",
      technique: "메타콘 (L)",
      environment: "성과 지향 (P)",
      skill: "체조 중심 (G)",
    },
  },
];

export default crossfitTypes;
