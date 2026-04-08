# Skill Writing Guide

`harness-codex` 같은 메타 skill을 설계할 때 지켜야 할 기본 원칙입니다.

## 1. Description이 가장 중요함
Codex skill은 `description`이 트리거 품질에 큰 영향을 줍니다.

그래서 description에는 아래가 분명해야 합니다.
- 언제 이 skill을 써야 하는지
- 언제 쓰면 안 되는지
- 어떤 종류의 요청에 강한지
- 구현보다 설계가 먼저라는 점

## 2. Skill은 한 가지 책임에 집중
이 skill의 1차 책임은 구현이 아니라 **하네스 설계**입니다.

그래서 아래를 잘해야 합니다.
- 패턴 선택
- 역할 정의
- 실행 흐름 정의
- 검증 루프 정의
- ready-to-use prompt 생성

반대로 아래는 직접 하지 않는 편이 좋습니다.
- 실제 코드 구현
- 긴 도메인별 예시 생성
- 특정 기술 스택의 상세 구현 강제

## 3. Prompt-driven 우선
가능하면 고정 profile보다, 현재 use case 입력을 받아 동적으로 설계하도록 유도합니다.

좋은 질문 예시:
- 목표가 무엇인가
- 기존 코드베이스가 있는가
- 우선순위가 speed인지 quality인지
- 리스크 수준이 어느 정도인가

## 4. 역할 수는 최소화
역할이 많으면 좋아 보이지만 실제 실행은 무거워집니다.

기본 원칙:
- 최소 유효 역할 집합 유지
- 필요할 때만 역할 세분화
- reviewer/validation은 웬만하면 유지

## 5. 출력 형식을 고정
메타 skill은 결과 품질보다도 **일관성**이 중요합니다.

권장 출력 구조:
1. Harness recommendation
2. Chosen pattern and why
3. Role set
4. Execution flow
5. Validation loop
6. Risks
7. Ready-to-use prompts

## 6. Reference는 짧고 목적 중심
reference 문서는 길게 백과사전처럼 쓰지 않습니다.

좋은 reference 문서의 조건:
- 의사결정에 직접 도움
- 한 문서당 한 목적
- 실행 시 바로 참고 가능

## 7. 하지 말아야 할 것
- 구현과 설계를 한 skill에 과도하게 섞지 말 것
- 모든 use case를 미리 고정 템플릿으로 만들지 말 것
- description을 모호하게 쓰지 말 것
- 출력 형식을 매번 바꾸지 말 것
