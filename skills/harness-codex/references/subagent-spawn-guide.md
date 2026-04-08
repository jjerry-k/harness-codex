# Subagent Spawn Guide

메타 하네스를 설계할 때, 실제 실행을 단일 세션으로 끝낼지 아니면 subagent로 분리할지 판단하는 기준입니다.

## 기본 원칙
- subagent는 항상 기본값이 아닙니다.
- 역할 분리가 실제 품질이나 속도를 올릴 때만 spawn합니다.
- 단일 세션으로 충분한 작업은 억지로 분리하지 않습니다.

## spawn을 권장하는 상황

### 1. 독립 작업이 2개 이상 병렬 가능
예:
- frontend / backend 구현
- research / implementation
- implementation / review

### 2. 역할별 컨텍스트가 명확히 분리됨
예:
- researcher는 조사만
- builder는 구현만
- reviewer는 검토만

### 3. 작업 규모가 커서 한 세션에 다 넣으면 산만해짐
예:
- 대규모 기능 추가
- 멀티도메인 리팩토링
- 대형 코드리뷰

### 4. 검증을 독립 관점으로 분리해야 함
예:
- 구현자와 reviewer를 분리해야 할 때
- QA를 별도 단계로 강하게 유지해야 할 때

## spawn을 피하는 상황

### 1. 작업이 작고 선형적임
예:
- 작은 버그 수정
- 단일 파일 수정
- 명확한 one-shot 작업

### 2. 역할 분리 비용이 더 큼
예:
- 프롬프트 전환 비용이 큰데 실제 작업은 짧음
- 하위 역할 간 의존성이 너무 강함

### 3. 출력 통합보다 실제 구현이 더 중요함
예:
- 간단한 프로토타입
- 급한 핫픽스

## 권장 판단 규칙

### single-session
다음이면 기본적으로 단일 세션으로 둡니다.
- 작은 범위
- 낮은 리스크
- 순차 흐름
- 역할 분리 이점이 적음

### spawn-optional
다음이면 분리 가능성을 열어둡니다.
- 중간 규모
- 일부 병렬화 가능
- reviewer/qa를 독립시킬 가치가 있음

### spawn-recommended
다음이면 분리를 적극 권장합니다.
- 고위험
- 다중 도메인
- 병렬 구현 가능
- reviewer/qa를 강하게 유지해야 함

## 출력에 포함할 항목
하네스를 설계할 때는 아래를 명시합니다.
- spawn decision: single-session | spawn-optional | spawn-recommended
- why: 왜 그렇게 판단했는지
- spawn units: 어떤 역할을 분리할지
- merge point: 어디서 다시 통합할지
- validation owner: 최종 검증을 누가 맡는지

## 최소 권장 패턴
- 단순 작업: single-session
- 일반 웹서비스 기능: frontend/backend 병렬 + reviewer 또는 qa 분리 검토
- 대규모 작업: orchestrator + specialist builders + reviewer/qa
