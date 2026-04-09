# Team Runner MVP TODO

이 문서는 `team-runner`를 실제 최소 동작 수준으로 만들기 위한 구현 우선순위를 정리합니다.

목표는 Claude Code Teams를 완전히 재현하는 것이 아니라,
**Codex에서 pseudo-team execution이 가능할 정도의 최소 러너**를 만드는 것입니다.

---

## MVP 목표

MVP에서 가능한 상태:
- `TEAM.md` 또는 `team.yaml`을 읽는다
- role set을 해석한다
- spawn decision을 해석한다
- 역할별 prompt를 준비한다
- 각 역할의 결과를 artifact로 수집한다
- merge owner와 validation owner 기준으로 마무리 흐름을 만든다

MVP에서 하지 않아도 되는 것:
- 복잡한 UI
- 동적 재계획 자동화
- 장기 세션 상태 저장
- sophisticated retry orchestration
- 고급 스케줄러

---

## 1. Parser 만들기

### 목적
team spec을 읽어서 내부 구조로 변환

### 해야 할 일
- [x] `team.yaml` 우선 지원
- [ ] 최소 필드 검증
  - [ ] `name`
  - [ ] `goal`
  - [ ] `pattern`
  - [ ] `roles`
  - [ ] `spawnDecision`
  - [ ] `merge`
  - [ ] `validation`
- [ ] 잘못된 spec 에러 메시지 정의

### 산출물
- `parseTeamSpec()`
- `validateTeamSpec()`

---

## 2. Internal model 만들기

### 목적
spec을 런타임이 다룰 수 있는 구조체/객체로 표현

### 해야 할 일
- [ ] TeamSpec 모델
- [ ] RoleSpec 모델
- [ ] MergeSpec 모델
- [ ] ValidationSpec 모델
- [ ] SpawnDecision enum
  - [ ] single-session
  - [ ] spawn-optional
  - [ ] spawn-recommended

### 산출물
- 내부 도메인 모델 정의

---

## 3. Prompt compiler 만들기

### 목적
role 정의를 실제 subagent 실행용 prompt로 변환

### 해야 할 일
- [ ] orchestrator prompt 컴파일
- [ ] role별 prompt 컴파일
- [ ] 공통 context 주입
- [ ] artifact output 위치 주입
- [ ] merge/validation 규칙 주입

### 산출물
- `compileRolePrompt(role, teamSpec, context)`

---

## 4. Artifact manager 만들기

### 목적
모든 역할이 결과를 정해진 경로에 남기게 만들기

### 해야 할 일
- [ ] artifact 루트 경로 생성
- [ ] role별 기본 artifact 경로 계산
- [ ] artifact 존재 여부 확인 함수
- [ ] artifact 읽기/요약 함수

### 산출물
- `ensureArtifactDirs()`
- `artifactPathForRole()`
- `collectArtifacts()`

---

## 5. Spawn adapter 만들기

### 목적
role별 작업을 실제 subagent/session 실행으로 연결

### MVP 선택지
추천은 **추상 어댑터 레이어**부터 만드는 것

예:
- `spawnRole(roleSpec, prompt)`
- 내부에서는 나중에 OpenClaw `sessions_spawn`나 Codex ACP 연결

### 해야 할 일
- [ ] single-session 처리 규칙
- [ ] spawn-optional 처리 규칙
- [ ] spawn-recommended 처리 규칙
- [ ] 역할별 실행 결과 상태 모델

### 산출물
- `spawnRole()` 인터페이스
- `runTeam()` 초안

---

## 6. Merge engine 만들기

### 목적
필수 artifact가 모이면 merge owner 기준으로 통합 진행

### 해야 할 일
- [ ] required artifacts 체크
- [ ] merge start condition 판단
- [ ] merge owner 프롬프트 생성
- [ ] merged summary 산출
- [ ] unresolved issues 표시

### 산출물
- `canMerge()`
- `runMerge()`

---

## 7. Validation engine 만들기

### 목적
validation owner 기준으로 완료 여부 판단

### 해야 할 일
- [ ] validation owner prompt 생성
- [ ] blocker / non-blocker 구분
- [ ] done condition 체크
- [ ] validation report artifact 저장

### 산출물
- `runValidation()`
- `isDone()`

---

## 8. CLI 또는 command surface 만들기

### 목적
MVP를 사람이 실제 실행해볼 수 있게 만들기

### 가장 단순한 인터페이스 예시
- `team-runner validate team.yaml`
- `team-runner plan team.yaml`
- `team-runner run team.yaml`

### 해야 할 일
- [ ] `validate` 명령
- [ ] `plan` 명령
- [ ] `run` 명령

---

## 9. MVP 테스트

### 최소 테스트 시나리오
- [ ] simple feature role set
- [ ] standard product role set
- [ ] quality-first role set

### 확인 포인트
- [ ] spec 파싱 성공
- [ ] prompt 컴파일 성공
- [ ] artifact 경로 생성 성공
- [ ] merge 조건 판단 성공
- [ ] validation 흐름 성공

---

## 권장 구현 순서

1. parser
2. internal model
3. prompt compiler
4. artifact manager
5. merge engine
6. validation engine
7. spawn adapter
8. CLI

이 순서가 좋은 이유:
- 먼저 spec과 규약을 고정
- 그 다음 실행기 연결
- 제일 마지막에 UX/CLI 추가

---

## 가장 먼저 코딩할 파일 추천

- `team-runner/src/types.ts` 또는 `types.py`
- `team-runner/src/parser.ts` 또는 `parser.py`
- `team-runner/src/prompts.ts` 또는 `prompts.py`
- `team-runner/src/artifacts.ts` 또는 `artifacts.py`
- `team-runner/src/merge.ts` 또는 `merge.py`
- `team-runner/src/validate.ts` 또는 `validate.py`

---

## 한 줄 요약

MVP에서 가장 먼저 필요한 것은
**subagent 실행기보다 spec/parser/artifact/merge 규약을 코드로 고정하는 것**입니다.
