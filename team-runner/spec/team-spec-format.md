# Team Spec Format

`team-runner`가 읽을 최소 team spec 형식입니다.

MVP에서는 `TEAM.md` 또는 `team.yaml` 중 하나로 시작할 수 있지만, 기계 처리 관점에서는 `yaml`이 더 유리합니다.

## 권장 필드

- `name`
- `goal`
- `pattern`
- `roles`
- `spawnDecision`
- `artifacts`
- `merge`
- `validation`

## 역할별 확장 필드

각 role은 아래 선택 필드를 가질 수 있습니다.

- `executionMode`: `auto | inline | subagent`
- `dependsOn`: 선행 완료가 필요한 role 이름 배열
- `parallelSafe`: `spawn-optional`일 때 병렬 spawn을 더 강하게 허용하는 힌트

## 예시

```yaml
name: web-feature-team
goal: implement invitation and role management
pattern: fan-out-fan-in
spawnDecision: spawn-recommended
roles:
  - name: orchestrator
    mission: design and coordinate execution
    executionMode: inline
    outputs:
      - artifacts/orchestrator-plan.md
  - name: frontend-builder
    mission: implement UI and client-side flows
    executionMode: subagent
    dependsOn:
      - orchestrator
    outputs:
      - artifacts/frontend-report.md
  - name: backend-builder
    mission: implement API and business logic
    executionMode: subagent
    dependsOn:
      - orchestrator
    outputs:
      - artifacts/backend-report.md
  - name: reviewer
    mission: review integrated results
    executionMode: inline
    dependsOn:
      - frontend-builder
      - backend-builder
    outputs:
      - artifacts/review.md
artifacts:
  root: artifacts/
merge:
  owner: orchestrator
  requires:
    - artifacts/frontend-report.md
    - artifacts/backend-report.md
validation:
  owner: reviewer
  requires:
    - artifacts/review.md
```

## 설계 원칙
- spec은 사람이 읽기 쉬워야 함
- role마다 output이 있어야 함
- merge owner와 validation owner는 반드시 명시
- spawnDecision은 설명이 아니라 enum처럼 간단히 유지
- `executionMode: auto`일 때 runner는 현재 상황과 역할 성격을 보고 inline/subagent를 판단
- `dependsOn`이 없으면 runner가 orchestrator-first, reviewer-last 패턴을 기본 추론할 수 있음
