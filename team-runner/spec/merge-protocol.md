# Merge Protocol

`team-runner`는 여러 subagent 결과를 병합할 때 명시적인 merge 규약을 따라야 합니다.

## 필수 항목
- merge owner
- required artifacts
- merge start condition
- validation owner
- done condition

## 기본 흐름
1. required artifacts가 모두 모였는지 확인
2. merge owner가 통합 초안 작성
3. reviewer 또는 validation owner가 검토
4. blocker가 없으면 완료

## conflict 처리 원칙
- 역할 간 충돌이 있으면 merge owner가 우선 정리
- 정리가 어려우면 orchestrator가 최종 판단
- unresolved issue는 숨기지 말고 명시

## MVP 범위
MVP에서는 아래만 지원해도 충분합니다.
- all-required-artifacts-present
- merge-owner-summary
- single validation owner
- explicit blockers list
