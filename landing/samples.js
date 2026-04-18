// UKDL code samples for the L0→L5 progressive disclosure demo.
// Each sample is colorized inline with span tags matching styles-sections.css tokens.

const UKDL_SAMPLES = {
  0: {
    label: "L0 · Pure",
    sublabel: "replaces Markdown",
    filename: "notes.ukdl",
    summary: "구조화된 텍스트. Markdown처럼 쉬우면서도 기계가 정확히 파싱할 수 있습니다.",
    tokensSaved: "0%",
    features: ["meta", "block"],
    code: `<span class="tok-comment">%% My first UKDL document — as simple as writing a note</span>

<span class="tok-op">::</span> <span class="tok-kw">meta</span> <span class="tok-op">id=</span><span class="tok-id">doc:hello</span> <span class="tok-op">title=</span><span class="tok-str">"Hello, UKDL!"</span>
<span class="tok-at">@author</span>: <span class="tok-str">"world"</span>
<span class="tok-at">@lang</span>: <span class="tok-str">"ko"</span>
<span class="tok-at">@version</span>: <span class="tok-str">"1.0"</span>
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">block</span> <span class="tok-op">id=</span><span class="tok-id">blk:welcome</span> <span class="tok-op">type=</span><span class="tok-id">note</span>
UKDL에 오신 것을 환영합니다! 이 블록은 지식의 기본 단위입니다.

- 블록은 자기완결적인 지식 덩어리입니다
- RAG 검색에 최적화되어 있습니다
- 그리고 쓰기는 메모만큼 간단합니다
<span class="tok-op">::</span>`
  },

  1: {
    label: "L1 · Semantic",
    sublabel: "replaces Wiki / RDF",
    filename: "solar-system.ukdl",
    summary: "엔티티와 관계를 선언하면, 문서가 곧 질의 가능한 지식 그래프가 됩니다.",
    tokensSaved: "28%",
    features: ["meta", "entity", "rel", "block"],
    code: `<span class="tok-comment">%% ═══ Entities ═══</span>

<span class="tok-op">::</span> <span class="tok-kw">entity</span> <span class="tok-op">id=</span><span class="tok-id">ent:sun</span> <span class="tok-op">type=</span><span class="tok-id">System</span> <span class="tok-op">labels.en=</span><span class="tok-str">"The Sun"</span>
<span class="tok-at">@aliases</span>: [<span class="tok-str">"Sol"</span>, <span class="tok-str">"태양"</span>]
태양계 중심의 항성.
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">entity</span> <span class="tok-op">id=</span><span class="tok-id">ent:earth</span> <span class="tok-op">type=</span><span class="tok-id">Place</span> <span class="tok-op">labels.en=</span><span class="tok-str">"Earth"</span>
세 번째 행성. 알려진 유일한 생명체의 서식지.
<span class="tok-op">::</span>

<span class="tok-comment">%% ═══ Relations ═══</span>

<span class="tok-op">::</span> <span class="tok-kw">rel</span> <span class="tok-op">id=</span><span class="tok-id">rel:earth-orbits</span> <span class="tok-op">type=</span><span class="tok-id">orbits</span> <span class="tok-op">from=</span><span class="tok-ref">@ent:earth</span> <span class="tok-op">to=</span><span class="tok-ref">@ent:sun</span>
<span class="tok-at">@confidence</span>: <span class="tok-num">1.0</span>
지구는 365.25일마다 태양을 공전합니다.
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">block</span> <span class="tok-op">id=</span><span class="tok-id">blk:overview</span> <span class="tok-op">type=</span><span class="tok-id">explanation</span>
우리 <span class="tok-ref">@{ent:sun|태양계}</span>는 <span class="tok-ref">@{ent:earth|지구}</span>를 포함한
여덟 개의 행성으로 이루어져 있습니다.
<span class="tok-op">::</span>`
  },

  2: {
    label: "L2 · Context",
    sublabel: "replaces Prompt Templates",
    filename: "rag-context.ukdl",
    summary: "LLM 컨텍스트 윈도우를 직접 관리합니다. 토큰 예산이 줄면 자동으로 축약됩니다.",
    tokensSaved: "54%",
    features: ["meta", "entity", "context", "include"],
    code: `<span class="tok-op">::</span> <span class="tok-kw">context</span> <span class="tok-op">id=</span><span class="tok-id">ctx:overview</span> <span class="tok-op">priority=</span><span class="tok-id">critical</span> <span class="tok-op">depth=</span><span class="tok-id">overview</span>
<span class="tok-at">@summary</span>: <span class="tok-str">"뉴턴의 세 법칙이 고전역학을 지배한다."</span>
<span class="tok-at">@collapse</span>: <span class="tok-num">false</span>
<span class="tok-at">@max_tokens</span>: <span class="tok-num">500</span>

뉴턴의 운동 법칙은 물체의 운동과 그에 작용하는 힘 사이의
관계를 설명하는 세 개의 물리 법칙입니다.
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">context</span> <span class="tok-op">id=</span><span class="tok-id">ctx:derivation</span> <span class="tok-op">priority=</span><span class="tok-id">low</span> <span class="tok-op">depth=</span><span class="tok-id">detailed</span> <span class="tok-op">collapse=</span><span class="tok-num">true</span>
<span class="tok-at">@summary</span>: <span class="tok-str">"수학적 유도 — 토큰 부족 시 접힘"</span>
<span class="tok-at">@max_tokens</span>: <span class="tok-num">2000</span>

F = ma 유도: 속도의 시간 미분은 가속도이며,
운동량 p = mv의 시간 변화율이 곧 힘이다...
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">include</span> <span class="tok-op">id=</span><span class="tok-id">inc:chapter2</span> <span class="tok-op">src=</span><span class="tok-str">"./chapter-2.ukdl"</span>
<span class="tok-at">@filter</span>: {<span class="tok-id">kind</span>: <span class="tok-str">"block"</span>, <span class="tok-id">priority</span>: [<span class="tok-str">"high"</span>, <span class="tok-str">"critical"</span>]}
<span class="tok-at">@namespace</span>: <span class="tok-str">"ch2"</span>
<span class="tok-op">::</span>`
  },

  3: {
    label: "L3 · Executable",
    sublabel: "replaces LangChain YAML",
    filename: "agent-actions.ukdl",
    summary: "문서가 실행됩니다. 조건 분기, 도구 호출, 에이전트 오케스트레이션 — 전부 한 파일에.",
    tokensSaved: "72%",
    features: ["meta", "entity", "context", "action", "|if:|"],
    code: `<span class="tok-op">::</span> <span class="tok-kw">action</span> <span class="tok-op">id=</span><span class="tok-id">act:diagnostic</span> <span class="tok-op">agent=</span><span class="tok-id">python-tutor</span> <span class="tok-op">trigger=</span><span class="tok-str">"tutorial_start"</span>
<span class="tok-at">@tool</span>: <span class="tok-str">"code_skill_assessor"</span>
<span class="tok-at">@input</span>: {<span class="tok-id">language</span>: <span class="tok-str">"python"</span>, <span class="tok-id">count</span>: <span class="tok-num">10</span>}
<span class="tok-at">@output</span>: <span class="tok-str">"diagnostic_result.json"</span>
<span class="tok-at">@timeout</span>: <span class="tok-num">60000</span>
<span class="tok-at">@retry</span>: {<span class="tok-id">max</span>: <span class="tok-num">2</span>, <span class="tok-id">backoff</span>: <span class="tok-str">"exponential"</span>}

학습자의 파이썬 실력을 평가하는 진단 퀴즈를 실행합니다.
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">block</span> <span class="tok-op">id=</span><span class="tok-id">blk:lesson</span> <span class="tok-op">type=</span><span class="tok-id">lesson</span> <span class="tok-op">about=</span><span class="tok-ref">@ent:variables</span>
<span class="tok-at">@when</span>: <span class="tok-ref">@qst:skill-level</span>

<span class="tok-directive">|if:</span> <span class="tok-ref">@qst:skill-level</span> == newcomer<span class="tok-directive">|</span>
변수는 이름이 붙은 **상자**와 같습니다. 나중에 찾기 쉽도록
이름을 붙여 값을 담아둡니다.

<span class="tok-directive">|elif:</span> <span class="tok-ref">@qst:skill-level</span> == familiar<span class="tok-directive">|</span>
Python의 변수는 동적 타입이며 객체 참조입니다.
할당은 복사가 아닌 바인딩입니다.

<span class="tok-directive">|else|</span>
namespace dict에 바인딩된 이름. LEGB 스코프 규칙을 따릅니다.
<span class="tok-directive">|/if|</span>
<span class="tok-op">::</span>`
  },

  4: {
    label: "L4 · Dynamic",
    sublabel: "replaces Custom State Machines",
    filename: "adaptive.ukdl",
    summary: "양자 상태 — 관측되기 전까지 문서는 가능성의 중첩으로 존재합니다.",
    tokensSaved: "83%",
    features: ["quantum", "entangle", "observe_on", "decay"],
    code: `<span class="tok-op">::</span> <span class="tok-kw">quantum</span> <span class="tok-op">id=</span><span class="tok-id">qst:skill-level</span>
<span class="tok-at">@states</span>: {<span class="tok-id">newcomer</span>: <span class="tok-num">0.3</span>, <span class="tok-id">familiar</span>: <span class="tok-num">0.5</span>, <span class="tok-id">experienced</span>: <span class="tok-num">0.2</span>}
<span class="tok-at">@observe_on</span>: <span class="tok-str">"diagnostic_complete"</span>
<span class="tok-at">@entangle</span>: <span class="tok-ref">@qst:content-style</span>
<span class="tok-at">@decay</span>: {<span class="tok-id">function</span>: <span class="tok-str">"exponential"</span>, <span class="tok-id">half_life</span>: <span class="tok-str">"30d"</span>}
<span class="tok-at">@default</span>: <span class="tok-str">"familiar"</span>
<span class="tok-at">@history</span>: <span class="tok-num">true</span>

학습자의 숙련도. 중첩 상태로 시작하여
진단 퀴즈 이후 하나의 상태로 붕괴합니다.
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">quantum</span> <span class="tok-op">id=</span><span class="tok-id">qst:content-style</span>
<span class="tok-at">@states</span>: {<span class="tok-id">visual</span>: <span class="tok-num">0.3</span>, <span class="tok-id">textual</span>: <span class="tok-num">0.4</span>, <span class="tok-id">hands_on</span>: <span class="tok-num">0.3</span>}
<span class="tok-at">@entangle</span>: <span class="tok-ref">@qst:skill-level</span>
<span class="tok-at">@entangle_matrix</span>: {
  <span class="tok-id">newcomer-visual</span>: <span class="tok-num">0.6</span>, <span class="tok-id">newcomer-hands_on</span>: <span class="tok-num">0.3</span>,
  <span class="tok-id">familiar-hands_on</span>: <span class="tok-num">0.5</span>,
  <span class="tok-id">experienced-textual</span>: <span class="tok-num">0.5</span>
}
<span class="tok-op">::</span>`
  },

  5: {
    label: "L5 · Orchestrated",
    sublabel: "replaces Airflow / Temporal",
    filename: "pipeline.ukdl",
    summary: "여러 에이전트가 협력하는 완전한 적응형 파이프라인. 자기 최적화, 회로 차단기 포함.",
    tokensSaved: "91%",
    features: ["pipeline", "stages", "feedback", "circuit_breaker"],
    code: `<span class="tok-op">::</span> <span class="tok-kw">pipeline</span> <span class="tok-op">id=</span><span class="tok-id">pipe:python-mastery</span>
<span class="tok-at">@goal</span>: <span class="tok-str">"achieve_python_proficiency"</span>
<span class="tok-at">@criteria</span>: [<span class="tok-str">"quiz_accuracy"</span>, <span class="tok-str">"code_quality"</span>, <span class="tok-str">"retention"</span>]
<span class="tok-at">@interval</span>: <span class="tok-str">"every_lesson"</span>
<span class="tok-at">@max_iterations</span>: <span class="tok-num">100</span>

<span class="tok-at">@stages</span>: [
  {<span class="tok-id">name</span>: <span class="tok-str">"diagnose"</span>,  <span class="tok-id">action</span>: <span class="tok-ref">@act:diagnostic</span>},
  {<span class="tok-id">name</span>: <span class="tok-str">"calibrate"</span>, <span class="tok-id">quantum</span>: <span class="tok-ref">@qst:skill-level</span>},
  {<span class="tok-id">name</span>: <span class="tok-str">"teach"</span>,     <span class="tok-id">block</span>: <span class="tok-ref">@blk:lesson</span>},
  {<span class="tok-id">name</span>: <span class="tok-str">"practice"</span>,  <span class="tok-id">action</span>: <span class="tok-ref">@act:generate-exercises</span>},
  {<span class="tok-id">name</span>: <span class="tok-str">"review"</span>,    <span class="tok-id">action</span>: <span class="tok-ref">@act:code-review</span>}
]

<span class="tok-at">@feedback</span>: {
  <span class="tok-id">positive</span>: <span class="tok-str">"advance_to_next_topic"</span>,
  <span class="tok-id">negative</span>: {<span class="tok-id">adjust</span>: {<span class="tok-id">difficulty</span>: <span class="tok-str">"decrease"</span>, <span class="tok-id">hints</span>: <span class="tok-str">"more"</span>}},
  <span class="tok-id">stagnant</span>: {<span class="tok-id">escalate</span>: <span class="tok-str">"human_mentor"</span>}
}

<span class="tok-at">@circuit_breaker</span>: {
  <span class="tok-id">condition</span>: <span class="tok-str">"consecutive_failures > 5"</span>,
  <span class="tok-id">action</span>: <span class="tok-str">"pause_and_notify"</span>
}

완전한 적응형 Python 학습 파이프라인.
<span class="tok-op">::</span>`
  }
};

// Markdown vs UKDL comparison
const COMPARISONS = {
  metadata: {
    title: "문서 메타데이터",
    problem: "Markdown은 프런트매터가 비표준 YAML. UKDL은 정식 노드 문법.",
    markdown: `---
title: "뉴턴의 법칙"
author: "물리학자"
tags: [물리, 고전역학]
---

# 뉴턴의 운동 법칙

세 가지 법칙으로 고전 역학을 지배한다...

<span class="tok-comment"># 문제점:</span>
<span class="tok-comment"># - 스타일링 제각각 (+++, ---, {})</span>
<span class="tok-comment"># - 파서마다 처리가 다름</span>
<span class="tok-comment"># - 타입 강제 없음</span>`,
    ukdl: `<span class="tok-op">::</span> <span class="tok-kw">meta</span> <span class="tok-op">id=</span><span class="tok-id">doc:newton</span> <span class="tok-op">title=</span><span class="tok-str">"뉴턴의 법칙"</span>
<span class="tok-at">@author</span>: <span class="tok-str">"물리학자"</span>
<span class="tok-at">@lang</span>: <span class="tok-str">"ko"</span>
<span class="tok-at">@version</span>: <span class="tok-str">"2.0"</span>
<span class="tok-at">@tags</span>: [<span class="tok-str">"물리"</span>, <span class="tok-str">"고전역학"</span>]
<span class="tok-at">@ukdl_level</span>: <span class="tok-num">1</span>
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">block</span> <span class="tok-op">id=</span><span class="tok-id">blk:intro</span> <span class="tok-op">type=</span><span class="tok-id">explanation</span>
세 가지 법칙으로 고전 역학을 지배한다...
<span class="tok-op">::</span>

<span class="tok-comment">%% ✓ O(n) 단일 패스 파싱</span>
<span class="tok-comment">%% ✓ 타입 안전 · 모호성 없음</span>`,
  },

  knowledge: {
    title: "지식 연결",
    problem: "Markdown은 위키링크만 제공. UKDL은 신뢰도·출처·유효기간까지.",
    markdown: `# 뉴턴

[[아이작 뉴턴]]은 [[만유인력]]을 발견했다.

<span class="tok-comment"># 문제점:</span>
<span class="tok-comment"># - 관계 타입 없음 ("발견했다"는 어디?)</span>
<span class="tok-comment"># - 신뢰도·출처 불명</span>
<span class="tok-comment"># - 엔티티 타입 없음 (사람? 장소?)</span>
<span class="tok-comment"># - 쿼리 불가능</span>

뉴턴은 1687년 *프린키피아*에서
만유인력 법칙을 제시했다.`,
    ukdl: `<span class="tok-op">::</span> <span class="tok-kw">entity</span> <span class="tok-op">id=</span><span class="tok-id">ent:newton</span> <span class="tok-op">type=</span><span class="tok-id">Person</span>
<span class="tok-at">@born</span>: <span class="tok-str">"1643-01-04"</span>
<span class="tok-at">@same_as</span>: [<span class="tok-str">"https://wikidata.org/Q935"</span>]
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">rel</span> <span class="tok-op">id=</span><span class="tok-id">rel:discovered</span> <span class="tok-op">type=</span><span class="tok-id">discovered</span>
  <span class="tok-op">from=</span><span class="tok-ref">@ent:newton</span> <span class="tok-op">to=</span><span class="tok-ref">@ent:gravity</span>
<span class="tok-at">@confidence</span>: <span class="tok-num">0.95</span>
<span class="tok-at">@source</span>: <span class="tok-str">"Principia, 1687"</span>
<span class="tok-at">@valid_from</span>: <span class="tok-str">"1687-07-05"</span>
<span class="tok-op">::</span>

<span class="tok-comment">%% ✓ SPARQL-ready 지식 그래프</span>
<span class="tok-comment">%% ✓ 모든 관계가 메타데이터 보유</span>`,
  },

  agent: {
    title: "에이전트 실행",
    problem: "Markdown은 실행 불가. YAML 프롬프트는 문서와 분리. UKDL은 한 파일.",
    markdown: `# 튜터 봇

## Prompt

사용자의 수준을 평가한 후,
그에 맞는 설명을 제공하세요.

<span class="tok-comment"># 문제점:</span>
<span class="tok-comment"># - 실행 불가 — 그냥 글</span>
<span class="tok-comment"># - 별도의 langchain.yaml 필요</span>
<span class="tok-comment"># - 문서와 로직이 분리됨</span>
<span class="tok-comment"># - 조건 분기 불가능</span>

---
(별도 파일에 config.yaml, prompts.yaml,
 agents.yaml 존재...)`,
    ukdl: `<span class="tok-op">::</span> <span class="tok-kw">action</span> <span class="tok-op">id=</span><span class="tok-id">act:assess</span>
  <span class="tok-op">agent=</span><span class="tok-id">tutor</span> <span class="tok-op">trigger=</span><span class="tok-str">"start"</span>
<span class="tok-at">@tool</span>: <span class="tok-str">"skill_assessor"</span>
<span class="tok-at">@output</span>: <span class="tok-ref">@qst:level</span>
<span class="tok-at">@retry</span>: {<span class="tok-id">max</span>: <span class="tok-num">2</span>}
<span class="tok-op">::</span>

<span class="tok-op">::</span> <span class="tok-kw">block</span> <span class="tok-op">id=</span><span class="tok-id">blk:explain</span> <span class="tok-op">type=</span><span class="tok-id">lesson</span>
<span class="tok-directive">|if:</span> <span class="tok-ref">@qst:level</span> == newcomer<span class="tok-directive">|</span>
쉬운 비유로 설명합니다...
<span class="tok-directive">|else|</span>
고급 개념으로 설명합니다...
<span class="tok-directive">|/if|</span>
<span class="tok-op">::</span>

<span class="tok-comment">%% ✓ 한 파일에 문서·로직·프롬프트</span>
<span class="tok-comment">%% ✓ 실행 가능한 living document</span>`,
  }
};

window.UKDL_SAMPLES = UKDL_SAMPLES;
window.COMPARISONS = COMPARISONS;
