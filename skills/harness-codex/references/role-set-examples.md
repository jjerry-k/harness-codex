# Role Set Examples

메타 하네스 설계 시 참고할 수 있는 대표적인 **역할 구성 예시**입니다.

이 문서는 Codex에 "agent team" 기능이 있다고 가정하지 않습니다.
대신, 작업을 어떤 **role set**과 **coordination model**로 운영할지 예시를 제공합니다.

## 1. Simple feature role set
작은 기능 추가나 단일 흐름 구현에 적합합니다.

구성:
- orchestrator
- builder
- reviewer

추천 상황:
- 범위가 작음
- 리스크 낮음
- 빠른 전달이 우선

권장 실행:
- 기본은 single-session
- reviewer만 분리할지 선택 가능

## 2. Standard product role set
일반적인 웹서비스/제품 기능 개발에 적합합니다.

구성:
- orchestrator
- analyst
- frontend-builder
- backend-builder
- reviewer
- qa

추천 상황:
- 프론트/백엔드 모두 변경
- 계약 정의가 중요함
- 운영 서비스 또는 중간 이상 리스크

권장 실행:
- spawn-optional 또는 spawn-recommended
- frontend/backend는 병렬 후보
- reviewer/qa는 후반 독립 검증 후보

## 3. Research-heavy role set
리서치와 문제 구조화가 중요한 작업에 적합합니다.

구성:
- orchestrator
- researcher
- analyst
- builder
- reviewer

추천 상황:
- 요구사항이 모호함
- 기술 선택이 핵심임
- 먼저 조사와 비교가 필요함

권장 실행:
- researcher를 별도 spawn하면 효과가 큼
- 결과를 analyst가 구조화한 뒤 builder로 넘김

## 4. Quality-first role set
품질과 안정성이 속도보다 중요한 경우에 적합합니다.

구성:
- orchestrator
- analyst
- builder
- reviewer
- qa

추천 상황:
- stability/quality 우선
- 회귀 리스크 큼
- 릴리즈 부담이 큼

권장 실행:
- reviewer와 qa를 분리 유지
- spawn-recommended에 가까움

## 5. Large decomposition role set
큰 작업을 계층적으로 나눠야 할 때 적합합니다.

구성:
- supervisor/orchestrator
- sub-orchestrator(s)
- specialist builders
- reviewer(s)
- qa

추천 상황:
- 대규모 리팩토링
- 멀티도메인 작업
- 단계적 위임이 필요함

권장 실행:
- spawn-recommended
- merge point와 validation owner를 반드시 명시

## 선택 팁
- 역할이 너무 많아지면 무거워집니다.
- 기본값은 가능한 한 작은 role set으로 시작합니다.
- 리스크가 올라갈수록 reviewer와 qa를 강화합니다.
- 병렬화 이점이 명확할 때만 frontend/backend처럼 분리합니다.
