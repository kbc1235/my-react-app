# Notion API React App

이 프로젝트는 Notion API를 사용하여 데이터베이스의 내용을 표시하고 관리하는 React 애플리케이션입니다. 백엔드 없이 클라이언트 측에서 직접 Notion API와 통신합니다.

## 기능

- Notion 데이터베이스 조회 및 표시
- 데이터베이스 항목 추가, 수정, 삭제(아카이브)
- 반응형 디자인
- **GPT 응답을 Notion에 저장**: GPT로부터 받은 응답을 Notion 페이지나 데이터베이스에 저장
- **운동 기록 관리**: 운동 기록을 테이블 형식으로 Notion에 저장

## 설치 및 실행

### 필수 조건

- Node.js v18 이상
- Notion API 키
- Notion 데이터베이스 ID

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
VITE_NOTION_API_KEY=your_notion_api_key
VITE_NOTION_DATABASE_ID=your_notion_database_id
```

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

## 사용 방법

### GPT-Notion 통합 기능

1. "GPT-Notion 통합" 탭을 선택합니다.
2. 다음 두 가지 방식 중 하나로 사용할 수 있습니다:
   - **텍스트 모드**: GPT 응답 내용을 직접 입력하거나 템플릿 버튼을 사용하여 마크다운 형식의 내용을 입력합니다.
   - **테이블 모드**: 운동 기록을 구조화된 형식으로 입력하여 Notion 데이터베이스의 해당 컬럼에 직접 저장합니다.
3. Notion 페이지 ID나 데이터베이스 ID를 입력합니다.
4. "페이지에 추가" 또는 "데이터베이스에 추가" 버튼을 클릭하여 내용을 Notion에 저장합니다.

### 운동 기록 테이블 모드

1. "테이블 모드 활성화" 버튼을 클릭합니다.
2. 사용자 이름을 입력합니다.
3. 각 운동(benchpress, deadlift, squat, clean, jerk, snatch)의 수치를 입력합니다.
4. "데이터베이스에 추가" 버튼을 클릭하면 입력한 데이터가 Notion 데이터베이스의 새 행으로 추가됩니다.

## 주의사항

- 이 애플리케이션은 클라이언트 측에서 직접 Notion API를 호출합니다. API 키가 노출될 수 있으므로 프로덕션 환경에서는 서버리스 함수나 백엔드 서버를 통해 API를 호출하는 것이 좋습니다.
- Notion API의 CORS 정책으로 인해 개발 중에는 프록시 서버를 사용합니다. 프로덕션 환경에서는 적절한 CORS 설정이 필요합니다.

## 프로젝트 구조

- `src/components`: React 컴포넌트
- `src/services`: API 호출 및 데이터 처리 서비스
- `src/styles`: CSS 스타일 파일
- `src/api`: 서버리스 함수 예제 (참고용)

## 기술 스택

- React 19
- Vite 6
- Notion API
- CSS3

## 라이센스

MIT
