# 병합 순서 안내

아래 작업 브랜치는 모두 `main`에서 분기됐다. 각 PR을 병합하기 직전에 최신
`origin/main`을 기준으로 rebase하고, 충돌 여부를 확인한다.

## 권장 병합 순서

1. `fix/shift-flow-integration` — `feat: 수동 근무 일정 관리 API 추가`
2. `fix/remove-schedule-demo-fallback` — `fix: 근무표 OCR 데모 폴백 제거`
3. `feature/user-profile-api` — `feat: 사용자 직군 설정 API 추가`
4. `feature/alert-management-api` — `feat: 알림 관리 API 추가`
5. `feature/routine-redesign-api` — `feat: AI 루틴 재설계 API 추가`
6. `feature/routine-item-management-api` — `feat: 루틴 항목 관리 API 추가`
7. `feature/docker-api-verification` — `chore: Docker 기반 API 검증 환경 추가`

## 선행 조건

- 5번은 알림 정보를 선택적으로 참조하므로 4번 이후 병합을 권장한다.
- 6번은 5번이 반환한 루틴 변경 제안을 사용자가 적용할 때 사용한다.
- 7번은 기능 PR 병합 후 실행해 전체 API 등록 상태를 확인한다.

## PR 작성 및 병합 전 확인

PR 설명 첫 줄에 아래 정보를 적는다.

```text
병합 순서: N번
선행 PR: #번호 또는 없음
병합 전: origin/main 기준 rebase 필요
```

특히 알림 API와 AI 루틴 재설계 API는 모두 `backend/app/main.py`의 라우터
등록부를 수정한다. 4번 병합 후 5번 브랜치를 rebase해야 한다.

```powershell
git fetch origin
git switch <브랜치명>
git rebase origin/main
```

충돌을 해결한 뒤 테스트하고 `git push --force-with-lease`로 브랜치를 갱신한다.
