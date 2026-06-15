# New Project Setup

> 이 파일은 플레이스홀더입니다.
> `https://raw.githubusercontent.com/hw5511/vibe-web/main/docs/new_project.md` 가 업로드되면 교체하세요.

## 새 프로젝트 시작 순서

1. `_template_settings` 폴더를 새 프로젝트명으로 복사
2. `package.json`의 name 필드 수정
3. `npm install`
4. `npm run dev`로 개발 서버 시작

## 기본 포함 패키지
- React 19 + Vite
- React Router DOM
- MUI (Material-UI) + icons
- Roboto 폰트
- MUI 테마 (theme.js)

## 폴더 구조
```
src/
├── components/   # 재사용 컴포넌트
├── pages/        # 페이지 컴포넌트
├── theme.js      # MUI 테마 설정
└── main.jsx      # 앱 진입점
```
