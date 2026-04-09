# Artifact Convention

subagent를 팀처럼 운영하려면 공통 산출물 규약이 필요합니다.

## 기본 원칙
- 모든 역할은 결과를 파일로 남긴다
- 산출물 이름은 역할과 목적이 드러나야 한다
- orchestrator가 merge 전에 읽을 수 있어야 한다

## 권장 경로

```text
artifacts/
  orchestrator-plan.md
  analysis.md
  frontend-report.md
  backend-report.md
  review.md
  qa.md
```

## 권장 형식
각 artifact는 최소 아래를 포함합니다.

- summary
- completed work
- assumptions
- unresolved issues
- next handoff target

## 목적
artifact가 있으면 subagent를 단순 병렬 작업이 아니라,
재조합 가능한 팀 운영 단위로 만들 수 있습니다.
