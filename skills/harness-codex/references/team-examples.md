# Team Examples

메타 하네스 설계 시 참고할 수 있는 대표적인 팀 구성 예시입니다.

## 1. Simple feature team
작은 기능 추가나 단일 흐름 구현에 적합합니다.

구성:
- orchestrator
- builder
- reviewer

추천 상황:
- 범위가 작음
- 리스크 낮음
- 빠른 전달이 우선

## 2. Standard product team
일반적인 웹서비스/앱 기능 개발에 적합합니다.

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

## 3. Research-heavy team
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

## 4. Quality-first team
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

## 5. Large decomposition team
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

## 선택 팁
- 역할이 너무 많아지면 무거워집니다.
- 기본값은 가능한 한 작은 팀으로 시작합니다.
- 리스크가 올라갈수록 reviewer와 qa를 강화합니다.
- 병렬화 이점이 명확할 때만 frontend/backend처럼 분리합니다.
