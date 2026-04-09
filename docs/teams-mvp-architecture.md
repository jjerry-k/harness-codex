# Codex Teams MVP Architecture

이 문서는 Claude Code Teams와 비슷한 운영 경험을 Codex 환경에서 만들기 위한 **추천 A 아키텍처**를 설명합니다.

추천 A는 두 계층으로 나눕니다.

1. `harness-codex`
   - 팀/하네스를 설계하는 메타 skill
2. `team-runner`
   - 설계된 팀 스펙을 실제 subagent/session 실행으로 옮기는 러너

이 분리는 유지보수와 확장성 측면에서 가장 현실적입니다.

---

## 1. 왜 분리하나

설계와 실행을 하나의 큰 meta skill에 모두 넣으면 아래 문제가 생깁니다.

- 책임이 과도하게 커짐
- 프롬프트가 비대해짐
- 디버깅 포인트가 섞임
- 실행기 변경이 설계 로직까지 흔듦

반대로 둘을 분리하면:

- `harness-codex`는 판단과 설계에 집중
- `team-runner`는 spawn, merge, validation orchestration에 집중

즉,
- planner
- executor
를 분리하는 구조입니다.

---

## 2. 역할 분리

## `harness-codex`
책임:
- 요청 해석
- coordination pattern 선택
- role set 정의
- spawn decision 정의
- artifact convention 정의
- merge/validation owner 정의
- ready-to-use prompts 생성
- 최종적으로 team spec 산출

출력:
- `TEAM.md` 또는 `team.yaml`
- 역할 프롬프트 묶음
- artifact/merge/validation 규약

하지 않는 일:
- 실제 subagent spawn
- 실행 상태 추적
- 결과 병합 수행

## `team-runner`
책임:
- team spec 읽기
- 역할별 subagent/session 실행
- artifact 수집
- merge point 도달 여부 판단
- reviewer/qa validation 실행
- 최종 결과 취합

출력:
- runtime status
- collected artifacts
- merge result
- validation result
- final summary

---

## 3. 최소 파일 구조

```text
harness-codex/
├── skills/
│   └── harness-codex/
│       ├── SKILL.md
│       └── references/
├── docs/
│   └── teams-mvp-architecture.md
└── team-runner/
    └── spec/
        ├── team-spec-format.md
        ├── artifact-convention.md
        └── merge-protocol.md
```

이 단계에서는 runner 코드를 먼저 만들 필요는 없습니다.
먼저 spec을 고정하는 것이 우선입니다.

---

## 4. 실행 흐름

### Step 1. harness design
사용자가 요청을 주면 `harness-codex`가 먼저 아래를 설계합니다.

- pattern
- roles
- spawn decision
- artifact outputs
- merge point
- validation owner

### Step 2. team spec generation
`harness-codex`는 설계 결과를 `TEAM.md` 또는 `team.yaml`로 출력합니다.

### Step 3. runner execution
`team-runner`가 team spec을 읽고 아래를 수행합니다.

- subagent spawn
- artifact path 배정
- 역할별 프롬프트 주입
- 완료 감지
- merge 수행
- validation 수행

### Step 4. finalization
최종 산출물을 orchestrator 또는 merge owner가 정리합니다.

---

## 5. MVP 범위

MVP에서는 아래만 지원해도 충분합니다.

- pattern 3개
  - Pipeline
  - Fan-out / Fan-in
  - Producer-Reviewer
- role types 6개
  - orchestrator
  - analyst
  - builder
  - frontend-builder
  - backend-builder
  - reviewer
- spawn decision 3단계
  - single-session
  - spawn-optional
  - spawn-recommended
- artifact output 규약
- merge/validation 규약

MVP에서 굳이 넣지 않아도 되는 것:
- 동적 역할 생성
- 복잡한 재시도 정책
- 장기 상태 저장
- UI/dashboard

---

## 6. 가장 중요한 규약

### 1) spec first
먼저 팀 스펙을 고정합니다.

### 2) artifacts are mandatory
subagent는 반드시 공통 규약의 산출물을 남깁니다.

### 3) merge owner is explicit
누가 최종 통합을 하는지 반드시 적습니다.

### 4) validation owner is explicit
누가 최종 품질 승인권자인지 반드시 적습니다.

---

## 7. 추천 다음 단계

1. `team-runner/spec/team-spec-format.md` 작성
2. `artifact-convention.md` 작성
3. `merge-protocol.md` 작성
4. 이후에야 runner 구현 여부를 결정

현재 단계에서는 코드보다 **규약 문서**를 먼저 고정하는 것이 맞습니다.
