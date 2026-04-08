# Skill Testing Guide

`harness-codex`가 실제로 잘 작동하는지 확인하기 위한 최소 테스트 가이드입니다.

## 1. Trigger test
먼저 이 skill이 적절한 요청에서 잘 호출되는지 확인합니다.

테스트해야 할 요청 예시:
- Codex용 하네스 설계해줘
- 역할 분리 먼저 해줘
- 오케스트레이터 짜줘
- 구현 전에 실행 구조부터 잡아줘

호출되면 안 되는 예시:
- 단순 코드 수정 요청
- 에러 한 줄 수정
- 이미 설계가 끝난 뒤 구현만 요청한 경우

## 2. Output structure test
출력이 아래 구조를 유지하는지 확인합니다.

- Harness recommendation
- Chosen pattern and why
- Role set
- Execution flow
- Validation loop
- Risks
- Ready-to-use prompts

누락되면 skill 품질이 흔들립니다.

## 3. Over-engineering test
skill이 너무 무거운 하네스를 만들지 않는지 확인합니다.

점검 질문:
- 역할 수가 과도하지 않은가
- 간단한 작업인데 supervisor/hierarchical delegation을 남용하지 않는가
- 검증은 유지하되 불필요한 단계가 없는가

## 4. Under-specification test
반대로 너무 빈약한 설계를 내지 않는지도 확인합니다.

점검 질문:
- 검증 루프가 있는가
- 역할별 산출물이 정의됐는가
- 병렬/순차 구분이 있는가
- 리스크가 식별됐는가

## 5. Use case variation test
입력 조건이 달라질 때 하네스가 실제로 달라지는지 확인합니다.

예:
- MVP + speed + low risk
- production feature + stability + high risk
- AI product + quality + medium risk

같은 출력이 반복되면 prompt-driven 설계가 제대로 안 되는 것입니다.

## 6. With-skill vs without-skill 비교
가능하면 아래를 비교합니다.

- skill 없이 바로 계획 세운 경우
- skill을 통해 하네스를 먼저 설계한 경우

비교 포인트:
- 역할 분리 명확성
- 검증 루프 존재 여부
- 리스크 식별 품질
- 실행 가능성

## 7. 실패 신호
아래가 보이면 skill 수정이 필요합니다.

- 항상 같은 역할 집합만 제안함
- use case 차이를 반영하지 못함
- 구현으로 너무 빨리 점프함
- ready-to-use prompt가 모호함
- validation loop가 형식적임
