---
name: harness-codex
description: Design a Codex-ready execution harness for a project or use case. Use this skill when the request is about setting up a harness, designing roles, defining an orchestrator, choosing a coordination pattern, or tailoring a Codex workflow to a specific use case before implementation. Especially relevant for prompts like "하네스 구성해줘", "Codex용 하네스 설계", "역할 분리해줘", "오케스트레이터 짜줘", "use case에 맞는 harness 세팅". This skill should design the harness first and only then suggest implementation flow.
---

# Harness Codex

프로젝트나 use case에 맞는 **Codex용 실행 하네스**를 설계하는 메타 스킬입니다.

이 스킬의 목적은 바로 구현하는 것이 아니라, 먼저 아래를 정하는 것입니다.

- 어떤 아키텍처 패턴을 쓸지
- 어떤 역할이 필요한지
- 무엇을 병렬화할지
- 무엇을 순차 처리할지
- 어떤 검증 루프를 둘지
- 각 역할에 어떤 프롬프트를 줄지

## 언제 사용하나

다음 요청이 들어오면 이 스킬을 우선 사용합니다.

- Codex용 하네스 만들어줘
- 이 프로젝트용 역할 분리 설계해줘
- 오케스트레이터 짜줘
- use case에 맞게 Codex 작업 구조 잡아줘
- 구현 전에 팀/역할/검증 구조부터 설계해줘
- 기존 하네스를 더 가볍게 또는 더 강하게 재설계해줘

구현 자체보다 **실행 구조 설계**가 먼저 필요한 경우에 적합합니다.

## 핵심 원칙

1. 먼저 하네스를 설계하고, 구현은 그 다음으로 미룹니다.
2. 역할 수는 최소 유효 집합으로 유지합니다.
3. 검증 단계를 생략하지 않습니다.
4. use case에 맞춰 무게를 조절합니다.
5. profile을 억지로 고정하지 말고, prompt-driven 설계를 우선합니다.

## 기본 워크플로우

### 1. 입력 수집
먼저 아래를 파악합니다.

- 도메인
- 목표
- 사용자
- 핵심 플로우
- 기술 스택
- 기존 코드베이스 상태
- 우선순위 (speed / quality / stability / extensibility)
- 리스크 수준
- 제약사항

입력이 부족하면 필요한 항목만 짧게 보완 질문합니다.

### 2. 패턴 선택
기본 패턴은 아래 중에서 고릅니다.

- Pipeline
- Fan-out / Fan-in
- Expert Pool
- Producer-Reviewer
- Supervisor
- Hierarchical Delegation

패턴 기준이 필요하면 `references/architecture-patterns.md`를 읽습니다.

### 3. 역할 집합 설계
작업에 필요한 최소 역할을 고릅니다.

기본 예시:
- orchestrator
- analyst
- builder
- reviewer

도메인에 따라 아래처럼 쪼갤 수 있습니다.
- frontend-builder
- backend-builder
- qa
- researcher
- prompt-designer

역할은 많을수록 좋아 보이지만 실제 실행은 무거워집니다. 꼭 필요한 것만 둡니다.

### 4. 실행 흐름 설계
각 역할에 대해 다음을 정합니다.

- mission
- key responsibilities
- expected outputs
- parallel 여부
- 선행 조건
- 완료 조건

오케스트레이터 흐름 템플릿이 필요하면 `references/orchestrator-template.md`를 읽습니다.

### 5. 검증 루프 설계
항상 아래를 포함합니다.

- 요구사항 충족 여부
- 역할 간 계약 불일치 여부
- 예외 처리 누락 여부
- 테스트 또는 리뷰 기준
- 남은 리스크

기본 검증 루프는 `references/validation-loop.md`를 읽습니다.

### 6. Ready-to-use prompt 생성
최종 출력에는 아래가 포함되어야 합니다.

- 오케스트레이터용 프롬프트 1개
- 각 역할용 프롬프트
- 실행 순서
- 검증 체크리스트

## 출력 형식

가능하면 아래 구조를 따릅니다.

1. Harness recommendation
2. Chosen pattern and why
3. Role set
4. Execution flow
5. Validation loop
6. Risks
7. Ready-to-use prompts

## 하지 말아야 할 것

- 분석 없이 바로 구현으로 점프하지 말 것
- 모든 작업에 무거운 다역할 하네스를 강제하지 말 것
- use case 차이를 무시하고 동일 구조를 반복 적용하지 말 것
- 검증 단계를 생략하지 말 것
