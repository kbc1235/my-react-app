/**
 * 크로스핏 MBTI 질문 데이터
 * 각 차원별로 질문이 구성되어 있습니다.
 */

const crossfitQuestions = [
  // E/I 차원 (Extroverted/Introverted - 단체형/개인형)
  {
    id: 1,
    text: "다른 사람들과 함께 WOD를 하면 더 열심히 하게 된다",
    dimension: "EI",
    direction: "E", // E 성향에 높은 점수
  },
  {
    id: 2,
    text: "내 훈련은 코치나 다른 참가자의 지시보다 스스로 계획하는 것이 효과적이다",
    dimension: "EI",
    direction: "I", // I 성향에 높은 점수
  },
  {
    id: 3,
    text: "클래스의 에너지와 응원이 내 퍼포먼스에 큰 영향을 미친다",
    dimension: "EI",
    direction: "E",
  },
  {
    id: 4,
    text: "진지한 훈련을 위해서는 독립적인 시간과 공간이 필요하다",
    dimension: "EI",
    direction: "I",
  },

  // H/L 차원 (Heavy/Light - 중량형/메타콘형)
  {
    id: 5,
    text: "1RM 기록을 깨는 것이 AMRAP 기록을 향상시키는 것보다 더 만족스럽다",
    dimension: "HL",
    direction: "H",
  },
  {
    id: 6,
    text: "장시간 메타콘에서 나의 진정한 능력이 발휘된다",
    dimension: "HL",
    direction: "L",
  },
  {
    id: 7,
    text: '"무거운 날"의 WOD가 "가벼운 날"의 WOD보다 기대된다',
    dimension: "HL",
    direction: "H",
  },
  {
    id: 8,
    text: "달리기, 로잉, 자전거와 같은 지구력 운동이 내 강점이다",
    dimension: "HL",
    direction: "L",
  },

  // P/R 차원 (Performance/Recreational - 성과형/건강형)
  {
    id: 9,
    text: "크로스핏 오픈이나 대회 참가를 위해 훈련하는 것이 중요하다",
    dimension: "PR",
    direction: "P",
  },
  {
    id: 10,
    text: "크로스핏은 주로 건강과 체력 유지를 위한 수단이다",
    dimension: "PR",
    direction: "R",
  },
  {
    id: 11,
    text: "내 WOD 기록을 꼼꼼히 추적하고 이전 기록을 깨는 것에 집중한다",
    dimension: "PR",
    direction: "P",
  },
  {
    id: 12,
    text: "부상 없이 오래 즐길 수 있는 지속 가능한 운동 방식을 지향한다",
    dimension: "PR",
    direction: "R",
  },

  // G/B 차원 (Gymnastic/Barbell - 체조형/바벨형)
  {
    id: 13,
    text: "머슬업, 핸드스탠드워크, 링 운동과 같은 체조 동작을 익히는 것이 가장 보람 있다",
    dimension: "GB",
    direction: "G",
  },
  {
    id: 14,
    text: "스내치, 클린&저크와 같은 올림픽 리프팅 기술을 연마하는 것에 더 관심이 있다",
    dimension: "GB",
    direction: "B",
  },
  {
    id: 15,
    text: "완벽한 풀업 10개가 무거운 데드리프트 1개보다 가치 있다고 생각한다",
    dimension: "GB",
    direction: "G",
  },
  {
    id: 16,
    text: "바벨을 다루는 기술이 크로스핏에서 가장 중요한 기초라고 생각한다",
    dimension: "GB",
    direction: "B",
  },
];

export default crossfitQuestions;
