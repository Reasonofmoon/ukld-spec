# UKDL Spec - 재현 명세서

## 제품 개요

UKDL(Unified Knowledge & Dynamics Language) — 세계 최초의 문서-프로그래밍 하이브리드 언어 명세 및 구현. 하나의 `.ukdl` 파일이 동시에 인간이 읽을 수 있는 문서, 기계가 파싱 가능한 지식 그래프, 실행 가능한 적응형 프로그램이 되는 구조. Markdown(저작), YAML/JSON(설정), RDF/OWL(지식 표현), LangChain(AI 오케스트레이션), 상태 머신(적응형 행동)을 하나의 문법으로 대체한다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 명세 언어 | UKDL v1.0 / v2.0 |
| 파서 | TypeScript/JavaScript |
| 온톨로지 탐색기 | React (JSX) |
| CLI | (packages/cli) |
| VSCode 확장 | (packages/vscode) |
| 라이선스 | MIT |

## 디렉터리 구조

```
ukld-spec/
├── README.md                          # 프로젝트 설명
├── UKDL-v1.0-Specification.md         # v1.0 명세서
├── UKDL-v2.0-Standard.md             # v2.0 표준 문서
├── LICENSE                            # MIT
├── package.json
├── ukdl-ontology-explorer.jsx         # 온톨로지 탐색기 (React)
├── packages/
│   ├── parser/                        # UKDL 파서 (91개 테스트 통과)
│   ├── cli/                           # CLI 도구
│   └── vscode/                        # VSCode 확장
├── examples/                          # UKDL 예제 파일
│   ├── hello-world.ukdl
│   ├── knowledge-graph.ukdl
│   ├── api-documentation.ukdl
│   ├── adaptive-tutorial.ukdl
│   ├── baduk-vibe-coding.ukdl
│   ├── english-exam.ukdl
│   └── vibe-coding.ukdl
└── docs/                              # 문서
```

## 아키텍처 상세

### UKDL 6차원 특성

| 차원 | 설명 |
|------|------|
| Human Readable | 인간이 읽을 수 있는 Markdown 본문 |
| Machine Parseable | 기계 파싱 가능한 구조 |
| Knowledge Graph | 지식 그래프 표현 |
| Executable Program | 실행 가능한 프로그램 |
| Adaptive State | 적응형 상태 관리 |
| AI-Native Context | AI 네이티브 컨텍스트 최적화 |

### 핵심 혁신

- 양자 중첩 상태 변수(quantum nodes)
- 얽힘 행렬(entanglement matrices)
- 5단계 컨텍스트 윈도우 최적화 (Full → Summary → Priority → Skeleton → Quantum)
- 자기 최적화 파이프라인 (목표 기반 + 피드백 루프 + 회로 차단기)
- 점진적 공개 6레벨 (L0-L5)

### 3-소스 융합 기원

| 소스 | 핵심 기여 |
|------|-----------|
| UPMD | 양자 상태 변수, 동적 문법, 멀티모달 I/O |
| KDL 0.1 | EBNF 문법, 6 코어 종류, 관계 + JSON 매핑 |
| AIML | 컨텍스트 윈도우 최적화, 액션 블록 |

## 실행 방법

```bash
cd ukld-spec
npm install

# 파서 테스트
cd packages/parser
npm test

# CLI
cd packages/cli
# (사용법은 패키지 README 참조)

# VSCode 확장
cd packages/vscode
# (VSCode 확장 개발 모드로 실행)
```

## 재현 시 주의사항

- 언어 명세(Specification) 프로젝트 — 런타임 앱이 아닌 파서/도구 모음
- v1.0과 v2.0 두 버전의 명세가 공존
- 파서는 91개 테스트 통과 상태
- examples/ 디렉터리의 .ukdl 파일이 실제 사용 예제
- ukdl-ontology-explorer.jsx는 독립 React 컴포넌트 (JSX 파일)
