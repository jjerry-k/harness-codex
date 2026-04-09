# Run Workflow

이 문서는 `team-runner run` 이후 생성되는 prompt / artifact 파일을 실제로 어떻게 사용하는지 설명합니다.

`run`은 팀을 자동 실행하지 않습니다.
대신, **실행에 필요한 입력물들을 준비**합니다.

---

## 1. `run`이 만드는 것

`TEAM.yaml` 기준으로 아래 두 종류의 파일이 생성됩니다.

### prompts/
역할별 실행 프롬프트가 생성됩니다.

예:
- `prompts/orchestrator.prompt.md`
- `prompts/backend-builder.prompt.md`
- `prompts/frontend-builder.prompt.md`
- `prompts/reviewer.prompt.md`
- `prompts/orchestrator-summary.md`

### artifacts/
역할별 산출물 파일이 생성됩니다.

예:
- `artifacts/orchestrator-plan.md`
- `artifacts/backend-report.md`
- `artifacts/frontend-report.md`
- `artifacts/review.md`

초기 상태에서는 stub일 수 있습니다.

---

## 2. 가장 권장하는 사용 방식

현재 MVP에서 가장 안정적인 운영 방식은 아래입니다.

### Step 1. `run` 실행
```bash
node ../harness-codex/team-runner/bin/team-runner.js run TEAM.yaml
```

### Step 2. orchestrator prompt 먼저 사용
먼저 `prompts/orchestrator.prompt.md`를 사용해 contract와 scope를 고정합니다.

이 단계에서 정해야 할 것:
- 목표
- 범위 / 비범위
- 데이터 shape
- API / route 계약
- 검증 기준

### Step 3. builder 역할 진행
contract가 고정되면 아래를 진행합니다.

- `prompts/backend-builder.prompt.md`
- `prompts/frontend-builder.prompt.md`

작업 후 결과를 각 artifact에 남깁니다.

예:
- backend 작업 결과 → `artifacts/backend-report.md`
- frontend 작업 결과 → `artifacts/frontend-report.md`

### Step 4. reviewer 실행
`prompts/reviewer.prompt.md`를 사용해 reviewer 역할을 돌립니다.

결과는:
- `artifacts/review.md`

### Step 5. merge / finalization
merge owner가 artifacts를 읽고 최종 정리합니다.

---

## 3. 사람이 개입하는 지점

현재 MVP는 완전 자동 팀 실행기가 아닙니다.
따라서 아래는 사람이 또는 상위 오케스트레이터가 해줘야 합니다.

- 어떤 prompt를 언제 실행할지 결정
- 결과를 artifact에 반영
- 리뷰 결과를 보고 수정 루프 실행
- 최종 완료 판단

즉, `run`은 **execution prep layer**입니다.

---

## 4. 권장 실제 순서

### 안정적인 순서
1. `run`
2. `orchestrator.prompt.md`
3. `backend-builder.prompt.md`
4. `frontend-builder.prompt.md`
5. `reviewer.prompt.md`
6. merge/fix/finalize

### 더 가벼운 순서
1. `run`
2. `orchestrator.prompt.md`
3. 단일 builder 세션에서 구현
4. `reviewer.prompt.md`

작은 작업은 이 쪽이 더 실용적입니다.

---

## 5. `execute-lite` / `execute`와의 관계

- `run`
  - 가장 안정적
  - prompt / artifact 준비용
  - dependency-aware spawn plan도 함께 준비
- `execute-lite`
  - orchestrator / reviewer 계열만 실험 실행
- `execute`
  - 역할 의존성을 보고 wave를 만들고
  - spawn 가능한 worker role은 병렬 Codex subprocess로 실행
  - inline role은 부모 흐름에서 유지

현재 실무 추천은 아래입니다.

- 기본 운영: `run`
- 빠른 실험: `execute-lite`
- dependency-aware pseudo-subagent 실험: `execute`

---

## 6. 한 줄 요약

`run`은 자동 실행기가 아니라,
**Teams처럼 작업하기 위한 prompt/artifact 작업 환경을 준비해주는 명령**입니다.
