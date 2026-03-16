# UKDL — Unified Knowledge & Dynamics Language

## v1.0 Specification

### 사람이 쓰고, AI가 이해하고, 지식이 실행되는 언어

**2026년 3월 | UPMD + KDL/AIML 완전 통합 명세**

---

## 0. 탄생 배경

UKDL은 세 가지 독립적 설계의 최선을 하나로 융합한다:

| 출처 | 핵심 기여 | 한계 |
|------|-----------|------|
| **UPMD** | 양자 상태 변수, 동적 문법, 멀티모달 I/O, 자기최적화 루프, 프로그래밍적 제어구조 | 파서 미정의, JSON 매핑 없음, 지식그래프 미고려 |
| **KDL 0.1** | EBNF 문법, 6개 Core Kind, rel 1급 reification, KDL-JSON 매핑, 참조 시스템 | 컨텍스트 제어 없음, 실행성 없음, 동적 상태 미고려 |
| **AIML 비전** | 컨텍스트 윈도우 최적화, action 실행 블록, Progressive Disclosure | 구현 명세 부재 |

**UKDL의 핵심 혁신**: 정적 지식 기술(KDL)과 동적 실행/적응(UPMD)을 하나의 문법 안에서 통합하여, 문서가 동시에 **지식 저장소이자 실행 가능한 프로그램**이 된다.

---

## 1. 설계 철학

### 1.1 세 가지 핵심 원칙

1. **WYSIWYM + Progressive Disclosure**: 보이는 것이 의미이며, 복잡성은 선택적
2. **Dual Citizenship**: 사람이 읽기 좋고, AI가 파싱하기 정확한 이중 시민권
3. **Living Document**: 문서는 정적 텍스트가 아니라, 상태를 가지고 조건에 반응하는 생명체

### 1.2 6단계 복잡성 레벨

| Level | 이름 | 사용 범위 | 사용자 |
|-------|------|-----------|--------|
| L0 | Pure | block + meta, Markdown 바디 | 일반 작성자 |
| L1 | Semantic | + entity, rel | 지식 관리자 |
| L2 | Context | + context, collapse | RAG 엔지니어 |
| L3 | Executable | + action, trigger | AI 에이전트 설계자 |
| L4 | Dynamic | + quantum, entangle | 적응형 시스템 설계자 |
| L5 | Orchestrated | + pipeline, optimize | 풀스택 AI 오케스트레이터 |

각 레벨은 이전의 상위집합이다. L0 문서는 L5 파서로 완벽히 처리된다.

---

## 2. 통합 문법

### 2.1 노드 기본 구조

모든 UKDL 요소는 **노드(Node)**이다. 노드는 `::` 구분자로 열고 닫는다:

```
:: kind id=<id> [attrs...] 
@field: value
@field: value

자유 형식 Markdown 바디

::
```

### 2.2 주석

```
%% 한 줄 주석 (KDL 스타일)
(( 블록 주석 — UPMD 호환 ))
```

### 2.3 참조 시스템

```
@ent:entity-id          → 엔티티 참조
@blk:block-id           → 블록 참조  
@ctx:context-id         → 컨텍스트 참조
@act:action-id          → 액션 참조
@qst:quantum-state-id   → 양자 상태 참조
@pipe:pipeline-id       → 파이프라인 참조
@{ent:id|표시텍스트}     → 인라인 엔티티 링크
```

---

## 3. 통합 Kind 체계 (10개)

### 3.1 Core Kinds (KDL 계승, L0–L1)

| Kind | 역할 | 접두사 |
|------|------|--------|
| `meta` | 문서 전역 메타데이터 | `doc:` |
| `block` | 지식 청크 (RAG 기본 단위) | `blk:` |
| `entity` | 엔티티 (KG 노드) | `ent:` |
| `rel` | 관계 (KG 엣지, 1급 reification) | `rel:` |
| `schema` | 검증 규칙 | `sch:` |
| `include` | 외부 문서 포함 | `inc:` |

### 3.2 Context Kind (AIML 계승, L2)

| Kind | 역할 | 접두사 |
|------|------|--------|
| `context` | LLM 컨텍스트 윈도우 최적화 | `ctx:` |

속성: `priority`, `summary`, `depth`, `collapse`, `max_tokens`

### 3.3 Executable Kind (AIML 계승, L3)

| Kind | 역할 | 접두사 |
|------|------|--------|
| `action` | AI 에이전트 실행 지침 | `act:` |

속성: `agent`, `trigger`, `tool`, `input`, `output`, `depends_on`

### 3.4 Dynamic Kinds (UPMD 계승, L4–L5)

| Kind | 역할 | 접두사 |
|------|------|--------|
| `quantum` | 확률적 상태 변수 | `qst:` |
| `pipeline` | 자기최적화 실행 파이프라인 | `pipe:` |

---

## 4. Dynamic Kinds 상세 (UPMD 융합)

### 4.1 `quantum` — 확률적 상태 노드 (L4)

UPMD의 양자 상태 변수와 얽힘 개념을 KDL 노드 문법으로 통합.

```
:: quantum id=qst:learner-level
@states: {beginner: 0.2, intermediate: 0.5, advanced: 0.3}
@observe_on: "quiz_complete"
@entangle: @qst:content-difficulty

학습자의 수준은 퀴즈 완료 시점에 관측(collapse)되어
콘텐츠 난이도와 얽힘(entangle) 관계로 연동된다.
::
```

**필수 속성:**
- `states`: `{상태: 확률, ...}` — 확률 합 = 1.0
- `observe_on`: 관측(collapse) 트리거 조건

**선택 속성:**
- `entangle`: 얽힘 대상 quantum 노드 참조
- `decay`: 시간에 따른 확률 감쇠 함수
- `history`: 이전 관측 이력 보존 여부

**얽힘(Entanglement) 매트릭스:**

```
:: quantum id=qst:content-difficulty
@states: {basic: 0.2, standard: 0.5, advanced: 0.3}
@entangle: @qst:learner-level
@entangle_matrix: {
  beginner-basic: 0.7,
  beginner-standard: 0.2,
  beginner-advanced: 0.1,
  intermediate-basic: 0.1,
  intermediate-standard: 0.6,
  intermediate-advanced: 0.3,
  advanced-basic: 0.05,
  advanced-standard: 0.25,
  advanced-advanced: 0.7
}
::
```

### 4.2 `pipeline` — 자기최적화 파이프라인 (L5)

UPMD의 자기최적화(self-optimize)와 피드백 루프를 KDL 노드로 승격.

```
:: pipeline id=pipe:adaptive-learning
@goal: "maximize_learning_outcome"
@criteria: ["comprehension_score", "engagement_time", "retention_rate"]
@interval: "every_5_interactions"
@stages: [
  {name: "assess", action: @act:diagnostic-quiz},
  {name: "adapt", quantum: @qst:learner-level},
  {name: "deliver", context: @ctx:lesson-content},
  {name: "evaluate", action: @act:performance-check}
]
@feedback: {
  positive: "reinforce_current",
  negative: {adjust: {difficulty: "decrease", examples: "increase"}}
}

적응형 학습 루프: 진단 → 수준 판정 → 맞춤 콘텐츠 → 평가 → 피드백
::
```

---

## 5. 동적 문법 제어 (UPMD 계승)

### 5.1 조건부 렌더링

UPMD의 제어 구조를 UKDL 인라인 문법으로 흡수:

```
:: block id=blk:adaptive-explanation
@when: @qst:learner-level

|if: @qst:learner-level == beginner|
광합성은 식물이 햇빛으로 음식을 만드는 과정이에요.
|elif: @qst:learner-level == intermediate|
광합성은 빛에너지를 화학에너지로 전환하는 과정으로, 명반응과 칼빈회로로 구성됩니다.
|else|
광합성의 양자 역학적 측면에서 엑시톤 전달 효율은 99%에 달합니다.
|/if|
::
```

### 5.2 멀티모달 I/O

```
:: block id=blk:multimodal-lesson
@modality: ["text", "voice", "image"]

|multimodal_output|
  [text] 광합성의 과정을 살펴보겠습니다.
  [voice] tts("광합성의 과정을 살펴보겠습니다.", lang="ko")
  [image] render(@ent:photosynthesis-diagram)
|/multimodal_output|
::
```

### 5.3 함수 정의

```
:: block id=blk:func-greet type=function
@params: ["name", "level"]
@returns: "string"

|function: generate_greeting(@name, @level)|
  |if: @level == beginner|
    안녕하세요 @name님, 오늘의 학습을 시작해볼까요?
  |else|
    @name님, 고급 과정에 오신 것을 환영합니다.
  |/if|
|/function|
::
```

---

## 6. 표준 속성 체계

### 6.1 전역 표준 키 (모든 노드 사용 가능)

| 키 | 타입 | 설명 |
|----|------|------|
| `confidence` | 0–1 | 내용 신뢰도 |
| `generated_by` | string | AI 모델/사람 식별자 |
| `verified` | bool/string | 검증 여부 |
| `valid_from` / `valid_to` | date | 유효 기간 |
| `source` | URI/ref | 출처 |
| `domain` | dot-path | 도메인 분류 |
| `priority` | critical/high/normal/low/archive | 우선순위 |
| `summary` | string | 압축 요약 |
| `tags` | array | 태그 |
| `lang` | string | 언어 코드 |

### 6.2 컨텍스트 제어 속성

| 키 | 설명 |
|----|------|
| `depth` | overview / standard / detailed |
| `collapse` | true / false (기본 접기) |
| `max_tokens` | 권장 최대 토큰 |

---

## 7. UKDL-JSON 매핑

```json
{
  "ukdl_version": "1.0",
  "doc": {
    "id": "doc:photosynthesis-lesson",
    "title": "광합성의 원리",
    "created": "2026-03-04"
  },
  "nodes": {
    "ent:photosynthesis": {
      "kind": "entity",
      "attrs": {"type": "Concept", "labels.ko": "광합성"},
      "fields": {"aliases": ["탄소동화"]},
      "body": ""
    },
    "qst:learner-level": {
      "kind": "quantum",
      "attrs": {},
      "fields": {
        "states": {"beginner": 0.2, "intermediate": 0.5, "advanced": 0.3},
        "observe_on": "quiz_complete",
        "entangle": "@qst:content-difficulty"
      },
      "body": "학습자 수준 양자 상태"
    },
    "act:adaptive-quiz": {
      "kind": "action",
      "attrs": {"agent": "ai-tutor", "trigger": "lesson_complete"},
      "fields": {"tool": "quiz_generator"},
      "body": ""
    },
    "pipe:adaptive-learning": {
      "kind": "pipeline",
      "attrs": {},
      "fields": {
        "goal": "maximize_learning_outcome",
        "stages": ["assess", "adapt", "deliver", "evaluate"]
      },
      "body": ""
    }
  },
  "edges": [
    {"from": "ent:photosynthesis", "to": "ent:chloroplast", "type": "occurs_in"}
  ],
  "quantum_state": {
    "variables": ["qst:learner-level", "qst:content-difficulty"],
    "entanglements": [
      {"a": "qst:learner-level", "b": "qst:content-difficulty"}
    ]
  },
  "context_tree": {
    "phases": ["full", "summary", "priority", "skeleton"],
    "node_priorities": {}
  },
  "pipelines": ["pipe:adaptive-learning"]
}
```

---

## 8. 확장 EBNF

```ebnf
document     = { comment | node } ;
node         = "::" kind id "=" id_value { attr } NEWLINE
               { field | body_line }
               "::" ;

kind         = "meta" | "block" | "entity" | "rel" | "schema" | "include"
             | "context" | "action"
             | "quantum" | "pipeline"
             | ident ;

id_value     = prefix ":" name ;
prefix       = "doc" | "blk" | "ent" | "rel" | "sch" | "inc"
             | "ctx" | "act" | "qst" | "pipe" ;

attr         = key "=" value ;
field        = "@" key ":" value NEWLINE ;
body_line    = (* Markdown 텍스트, 인라인 참조, 조건문 포함 *) ;

reference    = "@" prefix ":" name
             | "@{" prefix ":" name "|" display_text "}" ;

conditional  = "|if:" expr "|" body
               { "|elif:" expr "|" body }
               [ "|else|" body ]
               "|/if|" ;

quantum_ref  = "@qst:" name ;
pipeline_ref = "@pipe:" name ;

comment      = "%%" (* to end of line *)
             | "((" (* block comment *) "))" ;
```

---

## 9. 처리 모델

### 9.1 파싱 파이프라인

1. **라인 스캔**: `:: kind ... ~ ::` 노드 경계 인식
2. **Kind 분류**: 10개 kind 인식 (미지원 → block 폴백)
3. **속성/필드 파싱**: 헤더 `key=value` + 바디 `@key: value`
4. **참조 해결**: `@prefix:name` → 노드 링크
5. **양자 상태 초기화**: quantum 노드의 states/entangle 세팅
6. **컨텍스트 트리 구성**: priority/summary/collapse 추출
7. **그래프 구축**: entity/rel → 지식그래프 트리플
8. **조건부 평가**: `|if:|` 블록을 quantum 상태에 따라 분기
9. **파이프라인 등록**: pipeline 노드 → 실행 스케줄러
10. **실행 문맥 생성**: action → MCP/Tool 호출 스키마

### 9.2 컨텍스트 윈도우 최적화

| Phase | 전략 | 토큰 여유 |
|-------|------|-----------|
| Full | 모든 노드 전체 바디 | 충분 |
| Summary | collapse=true → summary만 | 부족 시작 |
| Priority | critical/high만 포함 | 제한적 |
| Skeleton | 그래프 구조 + meta만 | 최소 |
| Quantum | 활성 상태의 분기만 포함 | 극소 |

---

## 10. 완전 예시: 적응형 교육 콘텐츠

```ukdl
%% UKDL v1.0 Sample — 광합성 적응형 교육

:: meta id=doc:photosynthesis title="광합성의 원리" created="2026-03-04"
@author: "teacher-kim"
@lang: "ko"
@version: "1.0"
@domain: "biology.botany.photosynthesis"
@tags: ["biology", "photosynthesis", "CSAT", "adaptive"]
::

%% === L1: 엔티티 & 관계 ===

:: entity id=ent:photosynthesis type=Concept labels.ko="광합성" labels.en="Photosynthesis"
@aliases: ["탄소동화", "carbon fixation"]
@same_as: ["https://en.wikipedia.org/wiki/Photosynthesis"]
::

:: entity id=ent:chloroplast type=Concept labels.ko="엽록체" labels.en="Chloroplast"
::

:: entity id=ent:light-reaction type=Process labels.ko="명반응"
::

:: entity id=ent:calvin-cycle type=Process labels.ko="칼빈회로"
::

:: rel id=rel:photo-in-chloro type=occurs_in from=@ent:photosynthesis to=@ent:chloroplast confidence=0.99
광합성은 엽록체 내부에서 진행된다.
::

:: rel id=rel:photo-has-light type=has_stage from=@ent:photosynthesis to=@ent:light-reaction
::

:: rel id=rel:photo-has-calvin type=has_stage from=@ent:photosynthesis to=@ent:calvin-cycle
::

%% === L2: 컨텍스트 제어 ===

:: context id=ctx:photo-overview priority=high depth=overview
@summary: "광합성 = 빛+CO2+H2O → 포도당+O2. 명반응과 칼빈회로 2단계."

광합성은 식물이 빛 에너지를 이용해 이산화탄소와 물을
포도당과 산소로 전환하는 과정이다.
::

:: context id=ctx:photo-detail priority=low depth=detailed collapse=true
@summary: "광합성 화학 반응식 및 상세 메커니즘"
@max_tokens: 2000

6CO₂ + 6H₂O + 빛에너지 → C₆H₁₂O₆ + 6O₂
명반응: 틸라코이드 막 → ATP, NADPH 생성
칼빈회로: 스트로마 → CO₂ 고정 → G3P → 포도당
::

%% === L4: 양자 상태 ===

:: quantum id=qst:learner-level
@states: {beginner: 0.3, intermediate: 0.5, advanced: 0.2}
@observe_on: "diagnostic_quiz_complete"
@entangle: @qst:content-depth

학습자의 수준은 진단 퀴즈 완료 시 결정된다.
::

:: quantum id=qst:content-depth
@states: {basic: 0.3, standard: 0.5, deep: 0.2}
@entangle: @qst:learner-level
@entangle_matrix: {
  beginner-basic: 0.8, beginner-standard: 0.15, beginner-deep: 0.05,
  intermediate-basic: 0.1, intermediate-standard: 0.7, intermediate-deep: 0.2,
  advanced-basic: 0.0, advanced-standard: 0.3, advanced-deep: 0.7
}
::

%% === L3: 적응형 콘텐츠 블록 ===

:: block id=blk:adaptive-explanation type=lesson about=@ent:photosynthesis priority=high
@when: @qst:learner-level

|if: @qst:learner-level == beginner|
🌱 광합성이란? 식물이 햇빛을 받아서 음식(포도당)을 만드는 과정이에요!
물과 이산화탄소가 필요하고, 산소가 나와요.
|elif: @qst:learner-level == intermediate|
광합성은 빛에너지 → 화학에너지 전환 과정입니다.
@{ent:light-reaction|명반응}에서 ATP/NADPH를 생성하고,
@{ent:calvin-cycle|칼빈회로}에서 CO₂를 고정합니다.
|else|
광합성의 양자 생물학적 관점에서, 엑시톤 전달 과정은
FMO 복합체 내에서 양자 결맞음(quantum coherence)을 통해
99% 이상의 에너지 전달 효율을 달성합니다.
|/if|
::

%% === L3: 실행 블록 ===

:: action id=act:diagnostic-quiz agent=ai-tutor trigger="lesson_start"
@tool: "adaptive_quiz_generator"
@input: {topic: @ent:photosynthesis, count: 5, adaptive: true}
@output: "diagnostic_result.json"

학습 시작 시 진단 퀴즈를 생성하여 학습자 수준을 파악한다.
::

:: action id=act:generate-review agent=ai-tutor trigger="quiz_score<70"
@tool: "review_material_generator"
@input: {topic: @ent:photosynthesis, level: @qst:learner-level}
@output: "review_materials.ukdl"
@depends_on: @act:diagnostic-quiz

퀴즈 점수 70점 미만 시 복습 자료 자동 생성.
::

%% === L5: 학습 파이프라인 ===

:: pipeline id=pipe:photo-learning
@goal: "maximize_comprehension"
@criteria: ["quiz_accuracy", "concept_retention", "engagement"]
@interval: "every_lesson"
@stages: [
  {name: "diagnose", action: @act:diagnostic-quiz},
  {name: "collapse_state", quantum: @qst:learner-level},
  {name: "deliver", block: @blk:adaptive-explanation},
  {name: "assess", action: @act:generate-review}
]
@feedback: {
  positive: "advance_difficulty",
  negative: {adjust: {depth: "decrease", examples: "increase", pace: "slower"}}
}

광합성 적응형 학습의 전체 오케스트레이션 파이프라인.
::
```

---

## 11. 온톨로지 체계

UKDL의 지식관리 온톨로지는 4개 계층으로 구성된다:

### Layer 1: Structural Ontology (구조)
- `Document` → `Node` → `Kind`
- Node 간 계층: `meta > block > entity/rel`

### Layer 2: Semantic Ontology (의미)
- `Concept`, `Process`, `Person`, `System`, `Event`
- 관계: `is_a`, `part_of`, `causes`, `occurs_in`, `has_stage`

### Layer 3: Context Ontology (맥락)
- `Priority Layer`: critical → high → normal → low → archive
- `Depth Layer`: overview → standard → detailed
- `Collapse State`: expanded / collapsed

### Layer 4: Dynamic Ontology (동적)
- `Quantum State`: states + probabilities + entanglements
- `Pipeline Stage`: assess → adapt → deliver → evaluate
- `Feedback Loop`: positive / negative → parameter adjustment

---

## 12. 로드맵

| Phase | 기간 | 목표 |
|-------|------|------|
| 1. Foundation | 0–3개월 | EBNF 파서, CLI, VS Code 확장 |
| 2. Ecosystem | 3–6개월 | Obsidian 플러그인, Neo4j 변환, LangChain 커넥터 |
| 3. Dynamic | 6–9개월 | Quantum state engine, Pipeline executor |
| 4. Scale | 9–12개월 | EduForge 통합, 기업 KMS, W3C 제안 |

---

*UKDL — 보이는 것이 의미이고, 의미가 살아 움직이고, 지식이 스스로 진화하는 문서.*
