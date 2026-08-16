# 하루결 (Harugyeol)

교대 근무자의 근무표와 일상 루틴을 관리하고, 웨어러블 이상 신호나 돌발 근무에 맞춰 루틴을 재설계하는 Expo 앱입니다.

## 기술 스택

- Expo SDK 57 / React Native 0.86 / React 19
- TypeScript (strict)
- Expo Router
- Zustand
- react-native-svg + SVG transformer

## 실행

```bash
npm install
npm start
```

터미널에서 `a`를 누르면 Android, macOS에서는 `i`를 눌러 iOS 시뮬레이터를 실행할 수 있습니다. 웹 미리보기는 `npm run web`을 사용합니다.

## 구조

```text
src/
  app/          # Expo Router 화면과 탭
  components/   # 공통 UI 및 도메인 컴포넌트
  data/         # 화면 검증용 목데이터
  services/     # 백엔드 교체 가능한 API 계약과 목 구현
  store/        # Zustand 앱 상태
  theme/        # 색상, 타이포그래피, 간격 토큰
  types/        # 백엔드와 공유 가능한 도메인 타입
```

## FastAPI 연결

화면과 스토어는 [`src/services/api.ts`](./src/services/api.ts)의 `HarugyeolApi` 계약을 사용하며, [`src/services/http-api.ts`](./src/services/http-api.ts)가 FastAPI 요청과 응답을 앱 도메인으로 변환합니다.

```bash
cp .env.example .env
```

- Web / iOS Simulator: `EXPO_PUBLIC_API_URL=http://localhost:8000`
- Android Emulator: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000`
- Physical Device: 개발 PC의 LAN IP 사용

JWT는 iOS/Android에서 `expo-secure-store`, 웹에서 `localStorage`에 저장됩니다. 로그인·가입·근무유형·이미지 업로드·근무표 확정·루틴 API가 FastAPI와 연결되어 있습니다. 서버 `main`에 아직 없는 OCR 실행 및 돌발상황 재설계만 각각 기존 인식 검토 데이터와 결정론적 결과를 fallback으로 사용합니다.

## Docker

저장소 루트에서 `docker compose up --build`를 실행하면 FastAPI는 `8000`, Expo Web은 `8081` 포트로 실행됩니다. Expo 개발 서버 컨테이너는 Node 22를 사용합니다.
