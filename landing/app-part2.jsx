// Laws, Levels (pyramid), Compare sections
const { useState: useState2, useEffect: useEffect2, useRef: useRef2, useMemo: useMemo2 } = React;

// =============== 3 LAWS ===============
function Laws() {
  const laws = [
    {
      num: "LAW 01",
      title: "Readability First",
      ko: "가독성 우선",
      desc: "어떤 복잡도의 UKDL 문서든, 명세를 처음 보는 사람도 즉시 이해할 수 있어야 합니다. 읽는 이가 구문의 의도를 추측할 수 없다면, 그 구문은 잘못된 것입니다.",
      color: "var(--mint-600)",
      Icon: window.Icon.Eye,
    },
    {
      num: "LAW 02",
      title: "Parse Precision",
      ko: "정확한 파싱",
      desc: "모든 의미 단위는 휴리스틱 없이 기계가 명확히 추출 가능합니다. \"이게 헤딩일까, 굵은글씨일까?\"(마크다운의 저주)도, 들여쓰기 민감성(YAML의 저주)도 없습니다.",
      color: "var(--accent-sky)",
      Icon: window.Icon.Shield,
    },
    {
      num: "LAW 03",
      title: "Living Documents",
      ko: "살아있는 문서",
      desc: "문서는 죽은 텍스트가 아닙니다. 상태를 가지고, 조건에 반응하고, 맥락에 적응하며, 행동을 지휘합니다. UKDL 파일은 곧 읽을 수 있는 프로그램입니다.",
      color: "var(--accent-coral)",
      Icon: window.Icon.Pulse,
    },
  ];

  return (
    <section className="section" id="laws">
      <div className="container">
        <div style={{textAlign: 'center'}}>
          <span className="eyebrow"><Icon.Book width="14" height="14"/> The Three Laws of UKDL</span>
          <h2 className="section-title">UKDL의 세 가지 법칙</h2>
          <p className="section-sub" style={{margin: '14px auto 0'}}>
            좋은 지식 표현은 타협이 아니라 원칙에서 시작합니다.
            UKDL의 모든 설계 결정은 이 세 법칙 중 하나를 지키기 위함입니다.
          </p>
        </div>

        <div className="laws-grid">
          {laws.map((l, i) => (
            <div key={i} className="law-card" style={{"--law-color": l.color}}>
              <div className="law-num">{l.num}</div>
              <div className="law-icon"><l.Icon width="24" height="24"/></div>
              <h3 className="law-title">{l.title}</h3>
              <div style={{fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '-0.01em'}}>{l.ko}</div>
              <p className="law-desc">{l.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============== LEVELS (Progressive Disclosure Pyramid) ===============
function Levels({ initialLevel = 1 }) {
  const [level, setLevel] = useState2(initialLevel);
  const samples = window.UKDL_SAMPLES;
  const levels = [5, 4, 3, 2, 1, 0]; // top of pyramid first
  const labels = {
    0: {name: "L0 · Pure", replaces: "replaces Markdown, plain text"},
    1: {name: "L1 · Semantic", replaces: "replaces Wiki markup, RDF/OWL"},
    2: {name: "L2 · Context", replaces: "replaces Prompt templates"},
    3: {name: "L3 · Executable", replaces: "replaces LangChain YAML, DSPy"},
    4: {name: "L4 · Dynamic", replaces: "replaces Custom state machines"},
    5: {name: "L5 · Orchestrated", replaces: "replaces Airflow, Temporal"},
  };

  const current = samples[level];

  return (
    <section className="section pyramid-section" id="levels">
      <div className="container">
        <div style={{maxWidth: 720}}>
          <span className="eyebrow"><Icon.Layers width="14" height="14"/> Progressive Disclosure</span>
          <h2 className="section-title">복잡도에 대한 요금만 지불하세요</h2>
          <p className="section-sub">
            L0는 그냥 구조화된 Markdown입니다. 준비되었을 때 레벨을 올리세요 —
            엔티티로 지식 그래프(L1), 컨텍스트로 AI 최적화(L2), 액션으로 실행(L3),
            양자 상태로 적응(L4), 파이프라인으로 오케스트레이션(L5).
          </p>
        </div>

        <div className="pyramid-layout">
          <div className="pyramid-viz">
            {levels.map(n => (
              <div key={n}
                className={`pyramid-level pyramid-level-${n}`}
                data-active={level === n}
                onClick={() => setLevel(n)}>
                <div className="pyramid-level-label">
                  <span className="pyramid-level-badge">L{n}</span>
                  <span>{labels[n].name.split('·')[1].trim()}</span>
                </div>
                <span className="pyramid-level-replaces">{labels[n].replaces}</span>
              </div>
            ))}
            <p style={{marginTop: 18, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center'}}>
              ↑ 레벨을 선택하여 코드 예제를 확인하세요
            </p>

            <div style={{marginTop: 28, padding: '18px 20px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10}}>
                <Icon.Lightning width="16" height="16" style={{color: 'var(--mint-600)'}}/>
                <strong style={{fontSize: 13, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-muted)'}}>Backward Compatibility</strong>
              </div>
              <p style={{fontSize: 14, lineHeight: 1.6, color: 'var(--text)'}}>
                <strong>L0 문서는 곧 유효한 L5 문서입니다.</strong> 레벨 N의 파서는 ≤N의 모든 문서를 정확히 처리합니다.
              </p>
            </div>
          </div>

          <div>
            <div className="code-panel">
              <div className="code-panel-head">
                <div className="code-dots">
                  <div className="code-dot"/><div className="code-dot"/><div className="code-dot"/>
                </div>
                <div className="code-filename">
                  <Icon.Doc width="12" height="12"/>
                  {current.filename}
                  <span className="code-level-pill">L{level}</span>
                </div>
              </div>
              <pre className="code-body" dangerouslySetInnerHTML={{__html: current.code}}/>
            </div>

            <div style={{marginTop: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center'}}>
              <div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10}}>
                  {current.features.map(f => (
                    <span key={f} style={{fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 10px',
                      background: 'var(--mint-50)', color: 'var(--mint-700)', borderRadius: 6,
                      border: '1px solid var(--mint-100)', fontWeight: 600}}>{f}</span>
                  ))}
                </div>
                <p style={{fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55}}>{current.summary}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em',
                  textTransform: 'uppercase', marginBottom: 4}}>Context Saved</div>
                <div style={{fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
                  color: 'var(--mint-600)', letterSpacing: '-0.03em'}}>{current.tokensSaved}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============== COMPARE (Markdown vs UKDL) ===============
function Compare() {
  const [mode, setMode] = useState2('metadata');
  const data = window.COMPARISONS[mode];

  const modes = [
    {id: 'metadata', label: '문서 메타데이터'},
    {id: 'knowledge', label: '지식 연결'},
    {id: 'agent', label: '에이전트 실행'},
  ];

  const insights = [
    {title: "O(n) 단일 패스", desc: "모든 semantic unit이 단일 스캔으로 추출 가능. 재귀도 역추적도 없음."},
    {title: "타입 안전", desc: "필드 타입이 명시됨. @ukdl_level 선언으로 파서가 지원 범위를 안전하게 결정."},
    {title: "하위 호환 보장", desc: "v1.0 문서는 v2.0 파서에서 그대로 동작. 레벨 N 파서는 ≤N 모두 처리."},
  ];

  return (
    <section className="section" id="compare">
      <div className="container">
        <div style={{textAlign: 'center'}}>
          <span className="eyebrow"><Icon.Code width="14" height="14"/> The Markdown Problem</span>
          <h2 className="section-title">Markdown으로는 한계가 있습니다</h2>
          <p className="section-sub" style={{margin: '14px auto 0'}}>
            UKDL은 Markdown을 대체하는 것이 아니라, Markdown이 하지 못하는 일을 합니다.
            왼쪽과 오른쪽을 비교해보세요.
          </p>
          <div className="compare-toggle">
            {modes.map(m => (
              <button key={m.id} className="compare-toggle-btn" data-active={mode === m.id}
                onClick={() => setMode(m.id)}>{m.label}</button>
            ))}
          </div>
        </div>

        <div className="compare-grid">
          <div className="compare-card">
            <div className="compare-head">
              <div className="compare-label">
                <span className="compare-flag old">BEFORE</span>
                <span>Markdown + Frontmatter</span>
              </div>
              <span className="compare-problem">{data.problem.split('.')[0]}</span>
            </div>
            <pre className="compare-body" dangerouslySetInnerHTML={{__html: data.markdown}}/>
          </div>

          <div className="compare-arrow">
            <Icon.Arrow width="22" height="22"/>
          </div>

          <div className="compare-card">
            <div className="compare-head">
              <div className="compare-label">
                <span className="compare-flag new">AFTER</span>
                <span>UKDL v2.0</span>
              </div>
              <span className="compare-problem">같은 내용, 기계가 읽을 수 있음</span>
            </div>
            <pre className="compare-body" dangerouslySetInnerHTML={{__html: data.ukdl}}/>
          </div>
        </div>

        <div className="compare-insights">
          {insights.map((ins, i) => (
            <div key={i} className="compare-insight">
              <div className="compare-insight-check"><Icon.Check width="16" height="16"/></div>
              <div className="compare-insight-text">
                <strong>{ins.title}</strong>
                <span style={{color: 'var(--text-muted)'}}>{ins.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Laws = Laws;
window.Levels = Levels;
window.Compare = Compare;
