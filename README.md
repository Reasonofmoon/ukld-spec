<div align="center">

# UKDL — Unified Knowledge & Dynamics Language

### *지식을 코드처럼 구조화하라*

**AI 에이전트를 위한 통합 지식 표현 언어 명세**

[![Spec](https://img.shields.io/badge/Spec-v2.0-6366f1?style=for-the-badge)](UKDL-v2.0-Standard.md)
[![Parser](https://img.shields.io/badge/Parser-TypeScript-22d3ee?style=for-the-badge&logo=typescript)](packages/parser)
[![License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)](LICENSE)

> **"지식에 문법을 부여하면, AI가 이해할 수 있다"**
> 교육·연구·에이전트 시스템을 위한 지식 구조화 언어 표준

</div>

---

## 🧠 Philosophy

| 기준 | 기존 방식 | UKDL |
|------|----------|------|
| 지식 표현 | 비정형 마크다운 | **타입 안전 구조화 문법** |
| 에이전트 호환 | 자연어 파싱 | **명세 기반 정확한 파싱** |
| 버전 관리 | 없음 | **v1.0 → v2.0 공식 스펙** |

```mermaid
graph LR
    A[비정형 지식] --> B[UKDL 문법]
    B --> C[Parser v2.0]
    C --> D[구조화 데이터]
    D --> E[AI Agent 활용]
```

## ⚙️ Components

- `UKDL-v1.0-Specification.md` — 초기 명세
- `UKDL-v2.0-Standard.md` — 현행 표준
- `packages/parser` — TypeScript 파서 구현

## 🎯 Getting Started

```bash
git clone https://github.com/Reasonofmoon/ukld-spec.git
cd ukld-spec && npm install
# 파서 사용: packages/parser 참조
```

## 📄 License

MIT License

<div align="center"><br>

**UKDL** · 지식을 코드처럼

Made by [Reason of Moon](https://github.com/Reasonofmoon)

</div>
