// Knowledge Graph viz, Use cases, Install, Roadmap, Footer, Tweaks
const { useState: useState3, useEffect: useEffect3 } = React;

// =============== KNOWLEDGE GRAPH VISUALIZATION ===============
function KnowledgeGraph() {
  const [hovered, setHovered] = useState3(null);

  const nodes = [
    {id: 'sun',    x: 400, y: 160, r: 38, label: '태양',  type: 'System', color: '#F5B800'},
    {id: 'earth',  x: 220, y: 280, r: 26, label: '지구',  type: 'Place',  color: '#5B9EE1'},
    {id: 'mars',   x: 580, y: 290, r: 22, label: '화성',  type: 'Place',  color: '#FF6B4A'},
    {id: 'moon',   x: 110, y: 180, r: 18, label: '달',    type: 'Place',  color: '#9A7FD1'},
    {id: 'gravity',x: 400, y: 380, r: 30, label: '중력',  type: 'Concept',color: '#00A870'},
    {id: 'newton', x: 640, y: 100, r: 24, label: '뉴턴',  type: 'Person', color: '#0B3D2E'},
  ];

  const edges = [
    {from: 'earth',   to: 'sun',     label: 'orbits', conf: 1.0},
    {from: 'mars',    to: 'sun',     label: 'orbits', conf: 1.0},
    {from: 'moon',    to: 'earth',   label: 'orbits', conf: 1.0},
    {from: 'gravity', to: 'sun',     label: 'governs', conf: 0.98},
    {from: 'gravity', to: 'earth',   label: 'governs', conf: 0.98},
    {from: 'gravity', to: 'mars',    label: 'governs', conf: 0.98},
    {from: 'newton',  to: 'gravity', label: 'discovered', conf: 0.95},
  ];

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const h = hovered;

  return (
    <section className="section" style={{background: 'var(--surface-sunken)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)'}}>
      <div className="container">
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'center'}}>
          <div>
            <span className="eyebrow"><Icon.Graph width="14" height="14"/> Knowledge Graph</span>
            <h2 className="section-title" style={{fontSize: 'clamp(30px, 3.4vw, 44px)'}}>
              모든 문서가<br/>질의 가능한 그래프
            </h2>
            <p className="section-sub">
              <code style={{fontSize: 13, background: 'var(--surface)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)'}}>entity</code>와 {" "}
              <code style={{fontSize: 13, background: 'var(--surface)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)'}}>rel</code> 노드를 선언하는 것만으로도,
              문서가 SPARQL-ready 지식 그래프로 변환됩니다.
              관계는 1급 시민으로서 신뢰도·출처·유효기간을 직접 가집니다.
            </p>
            <div style={{marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10}}>
              {[
                {color: '#F5B800', label: 'System · 시스템'},
                {color: '#5B9EE1', label: 'Place · 장소'},
                {color: '#00A870', label: 'Concept · 개념'},
                {color: '#0B3D2E', label: 'Person · 사람'},
              ].map((l, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5}}>
                  <span style={{width: 12, height: 12, borderRadius: '50%', background: l.color}}/>
                  <span style={{color: 'var(--text-muted)'}}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow)'}}>
            <svg viewBox="0 0 760 460" style={{width: '100%', height: 'auto', display: 'block'}}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-400)"/>
                </marker>
              </defs>

              {edges.map((e, i) => {
                const f = nodeMap[e.from], t = nodeMap[e.to];
                const dx = t.x - f.x, dy = t.y - f.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                const ux = dx/d, uy = dy/d;
                const sx = f.x + ux * f.r, sy = f.y + uy * f.r;
                const tx = t.x - ux * t.r, ty = t.y - uy * t.r;
                const mx = (sx + tx) / 2, my = (sy + ty) / 2;
                const isActive = h === e.from || h === e.to;
                return (
                  <g key={i} style={{opacity: h && !isActive ? 0.25 : 1, transition: 'opacity 200ms ease'}}>
                    <line x1={sx} y1={sy} x2={tx} y2={ty}
                      stroke={isActive ? 'var(--mint-500)' : 'var(--ink-300)'}
                      strokeWidth={isActive ? 2 : 1.3}
                      markerEnd="url(#arrow)"
                      strokeDasharray={e.conf < 1 ? '4 3' : '0'}/>
                    <rect x={mx - 32} y={my - 10} width="64" height="18" rx="4"
                      fill="var(--surface)" stroke={isActive ? 'var(--mint-500)' : 'var(--border)'}/>
                    <text x={mx} y={my + 3} textAnchor="middle" fontSize="10"
                      fill={isActive ? 'var(--mint-700)' : 'var(--text-muted)'}
                      style={{fontFamily: 'var(--font-mono)', fontWeight: 600}}>
                      {e.label}
                    </text>
                  </g>
                );
              })}

              {nodes.map(n => {
                const isActive = h === n.id;
                const dimmed = h && !isActive && !edges.some(e =>
                  (e.from === h && e.to === n.id) || (e.to === h && e.from === n.id));
                return (
                  <g key={n.id}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{cursor: 'pointer', opacity: dimmed ? 0.3 : 1, transition: 'opacity 200ms ease'}}>
                    <circle cx={n.x} cy={n.y} r={n.r + 6} fill={n.color} opacity={isActive ? 0.2 : 0}
                      style={{transition: 'opacity 200ms ease'}}/>
                    <circle cx={n.x} cy={n.y} r={n.r} fill={n.color}
                      stroke="var(--surface)" strokeWidth="3"
                      style={{filter: isActive ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' : 'none',
                        transition: 'filter 200ms ease'}}/>
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="13"
                      fill="white" fontWeight="700" style={{fontFamily: 'var(--font-sans)', pointerEvents: 'none'}}>
                      {n.label}
                    </text>
                    <text x={n.x} y={n.y + n.r + 18} textAnchor="middle" fontSize="10"
                      fill="var(--text-muted)" style={{fontFamily: 'var(--font-mono)', pointerEvents: 'none'}}>
                      @ent:{n.id}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div style={{marginTop: 16, padding: '14px 18px', background: 'var(--surface-sunken)',
              borderRadius: 10, fontSize: 13, display: 'flex', gap: 12, alignItems: 'flex-start'}}>
              <Icon.Sparkle width="16" height="16" style={{color: 'var(--mint-600)', flexShrink: 0, marginTop: 2}}/>
              <div>
                <strong style={{color: 'var(--text)'}}>노드 위에 마우스를 올려보세요.</strong>
                <span style={{color: 'var(--text-muted)'}}> 실선은 확실한 관계, 점선은 신뢰도 &lt; 1.0 관계입니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============== USE CASES ===============
function UseCases() {
  const cases = [
    {
      kicker: "EDUCATION",
      title: "적응형 튜토리얼",
      desc: "학습자의 수준에 따라 같은 문서가 다르게 펼쳐집니다. 초보자는 비유, 중급자는 개념, 고급자는 내부 구조 — 한 파일로.",
      tags: ["quantum", "|if:|", "action"],
      bg: "#FFF4E0",
      fg: "#B87A00",
      Icon: Icon.Book,
    },
    {
      kicker: "RAG / LLM",
      title: "토큰 예산 인식 RAG",
      desc: "context 노드가 우선순위와 최대 토큰을 선언합니다. 예산이 줄면 저우선순위 블록이 자동 축약되어 LLM에 전달됩니다.",
      tags: ["context", "priority", "collapse"],
      bg: "#E0F2E8",
      fg: "#008D5E",
      Icon: Icon.Layers,
    },
    {
      kicker: "AI AGENTS",
      title: "자기 최적화 파이프라인",
      desc: "문서가 곧 실행 계획서. pipeline 노드는 목표·단계·피드백·회로 차단기를 선언하며, 자기 최적화가 기본 내장됩니다.",
      tags: ["pipeline", "feedback", "circuit_breaker"],
      bg: "#F0E6FF",
      fg: "#6A4AB0",
      Icon: Icon.Robot,
    },
  ];

  return (
    <section className="section" id="usecases">
      <div className="container">
        <div style={{textAlign: 'center'}}>
          <span className="eyebrow"><Icon.Sparkle width="14" height="14"/> Use Cases</span>
          <h2 className="section-title">하나의 언어, 세 가지 세계</h2>
          <p className="section-sub" style={{margin: '14px auto 0'}}>
            교실의 교사, RAG 엔지니어, AI 에이전트 설계자 — 모두 같은 UKDL을 씁니다.
            배우는 것은 한 번, 쓰이는 곳은 무한.
          </p>
        </div>

        <div className="usecase-grid">
          {cases.map((c, i) => (
            <div key={i} className="usecase-card" style={{"--uc-bg": c.bg, "--uc-fg": c.fg}}>
              <div className="usecase-emblem"><c.Icon width="32" height="32"/></div>
              <div>
                <div className="usecase-kicker">{c.kicker}</div>
                <h3 className="usecase-title" style={{marginTop: 4}}>{c.title}</h3>
              </div>
              <p className="usecase-desc">{c.desc}</p>
              <div className="usecase-tags">
                {c.tags.map(t => <span key={t} className="usecase-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============== INSTALL ===============
function Install() {
  const [copied, setCopied] = useState3(null);
  const copy = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const steps = [
    {
      title: "Node.js 준비",
      desc: "Node 18 이상, npm 9 이상이 필요합니다.",
      code: "node --version   # >= 18\nnpm --version    # >= 9",
    },
    {
      title: "CLI 설치",
      desc: "UKDL 공식 CLI를 전역으로 설치합니다.",
      code: "npm install -g @ukdl/cli",
    },
    {
      title: "저장소 클론",
      desc: "명세와 파서를 로컬에 받아옵니다.",
      code: "git clone https://github.com/Reasonofmoon/ukld-spec.git\ncd ukld-spec && npm install",
    },
    {
      title: "첫 문서 작성",
      desc: "notes.ukdl을 만들고 검증해보세요.",
      code: "ukdl validate notes.ukdl\nukdl parse notes.ukdl --level 1",
    },
  ];

  return (
    <section className="section" id="install">
      <div className="container">
        <div style={{textAlign: 'center'}}>
          <span className="eyebrow"><Icon.Lightning width="14" height="14"/> Quick Start</span>
          <h2 className="section-title">4분이면 충분합니다</h2>
          <p className="section-sub" style={{margin: '14px auto 0'}}>
            설치부터 첫 파싱까지. 더 깊이 들어가려면 Getting Started 가이드를 참고하세요.
          </p>
        </div>

        <div className="install-layout">
          <div className="install-steps">
            {steps.map((s, i) => (
              <div key={i} className="install-step">
                <div className="install-step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="install-step-body" style={{flex: 1, minWidth: 0}}>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <code>
                    <button className="copy-btn" onClick={() => copy(s.code, i)}>
                      {copied === i ? 'copied ✓' : 'copy'}
                    </button>
                    {s.code}
                  </code>
                </div>
              </div>
            ))}
            <div style={{display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap'}}>
              <a className="btn btn-primary" href="https://github.com/Reasonofmoon/ukld-spec" target="_blank" rel="noopener">
                <Icon.Github width="16" height="16"/> GitHub에서 시작
              </a>
              <a className="btn btn-ghost" href="#levels">
                예제 둘러보기
              </a>
            </div>
          </div>

          <div style={{position: 'sticky', top: 100}}>
            <div className="code-panel">
              <div className="code-panel-head">
                <div className="code-dots"><div className="code-dot"/><div className="code-dot"/><div className="code-dot"/></div>
                <div className="code-filename">
                  <Icon.Doc width="12" height="12"/> terminal
                </div>
              </div>
              <pre className="code-body" style={{maxHeight: 'none'}} dangerouslySetInnerHTML={{__html: `<span class="tok-comment">$</span> ukdl parse notes.ukdl --level 1

<span class="tok-comment">Parsing notes.ukdl...</span>
<span class="tok-id">✓</span> 3 nodes found
<span class="tok-id">✓</span> 1 meta, 2 blocks
<span class="tok-id">✓</span> ukdl_level: 1 (declared), 1 (required)
<span class="tok-id">✓</span> No schema violations

<span class="tok-comment">{</span>
  <span class="tok-str">"document"</span>: <span class="tok-str">"doc:hello"</span>,
  <span class="tok-str">"title"</span>: <span class="tok-str">"Hello, UKDL!"</span>,
  <span class="tok-str">"level"</span>: <span class="tok-num">1</span>,
  <span class="tok-str">"nodes"</span>: [
    { <span class="tok-str">"kind"</span>: <span class="tok-str">"meta"</span>, <span class="tok-str">"id"</span>: <span class="tok-str">"doc:hello"</span> },
    { <span class="tok-str">"kind"</span>: <span class="tok-str">"block"</span>, <span class="tok-str">"id"</span>: <span class="tok-str">"blk:welcome"</span> },
    { <span class="tok-str">"kind"</span>: <span class="tok-str">"block"</span>, <span class="tok-str">"id"</span>: <span class="tok-str">"blk:why-ukdl"</span> }
  ],
  <span class="tok-str">"parse_time_ms"</span>: <span class="tok-num">2.1</span>
<span class="tok-comment">}</span>

<span class="tok-kw">Parsed in 2.1ms.</span> <span class="tok-comment">Ready for your agent.</span>
<span class="tok-comment">$</span> <span style="background: var(--mint-500); color: var(--mint-900); padding: 0 2px;">_</span>`}}/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============== ROADMAP ===============
function Roadmap() {
  const nodes = [
    {label: "v0.1 Draft",     date: "2025-08", desc: "최초 제안",                  state: "done"},
    {label: "v1.0 Spec",      date: "2025-12", desc: "L0-L2 확정",               state: "done"},
    {label: "v2.0 Standard",  date: "2026-03", desc: "L3-L5 + 정식화",            state: "current"},
    {label: "v2.1",           date: "2026-06", desc: "LSP · VSCode",              state: "planned"},
    {label: "v3.0",           date: "2026-12", desc: "Runtime · Agent SDK",       state: "planned"},
  ];

  return (
    <section className="section" id="roadmap">
      <div className="container">
        <div style={{textAlign: 'center'}}>
          <span className="eyebrow"><Icon.Arrow width="14" height="14"/> Roadmap</span>
          <h2 className="section-title">어디서 와서, 어디로 가는가</h2>
          <p className="section-sub" style={{margin: '14px auto 0'}}>
            UKDL은 공개 표준입니다. 모든 제안은 GitHub Discussions에서 다뤄집니다.
          </p>
        </div>

        <div className="roadmap-track">
          <div className="roadmap-line"/>
          <div className="roadmap-nodes">
            {nodes.map((n, i) => (
              <div key={i} className="roadmap-node" data-state={n.state}>
                <div className="roadmap-node-dot">
                  {n.state === "done" ? <Icon.Check width="20" height="20"/> :
                   n.state === "current" ? <Icon.Pulse width="20" height="20"/> :
                   `0${i}`}
                </div>
                <div>
                  <div className="roadmap-node-title">{n.label}</div>
                  <div className="roadmap-node-date">{n.date}</div>
                </div>
                <div className="roadmap-node-desc">{n.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============== FOOTER ===============
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">UKDL<span style={{color: 'var(--mint-300)', fontSize: 14, marginLeft: 6, letterSpacing: '0.05em', fontWeight: 600}}>v2.0</span></div>
          <p className="footer-tagline">
            Unified Knowledge &amp; Dynamics Language — 지식에 문법을 부여하면, AI가 이해할 수 있다.
          </p>
          <div style={{display: 'flex', gap: 10, marginTop: 24}}>
            <a className="btn btn-sm" style={{background: 'rgba(255,255,255,0.08)', color: 'white'}} href="https://github.com/Reasonofmoon/ukld-spec" target="_blank" rel="noopener">
              <Icon.Github width="14" height="14"/> GitHub
            </a>
          </div>
        </div>

        <div>
          <h5>문서</h5>
          <ul>
            <li><a href="#">Getting Started</a></li>
            <li><a href="#">Syntax Reference</a></li>
            <li><a href="#">Advanced Guide</a></li>
            <li><a href="#">Cookbook</a></li>
          </ul>
        </div>

        <div>
          <h5>명세</h5>
          <ul>
            <li><a href="#">v2.0 Standard</a></li>
            <li><a href="#">v1.0 (Legacy)</a></li>
            <li><a href="#">Kifu Kind Spec</a></li>
            <li><a href="#">Migration Guide</a></li>
          </ul>
        </div>

        <div>
          <h5>커뮤니티</h5>
          <ul>
            <li><a href="#">GitHub Discussions</a></li>
            <li><a href="#">Issues &amp; RFCs</a></li>
            <li><a href="#">Contributing</a></li>
            <li><a href="#">License (MIT)</a></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 UKDL Working Group · MIT License</span>
        <span>Made by Reason of Moon · Seoul</span>
      </div>
    </footer>
  );
}

// =============== TWEAKS PANEL ===============
function TweaksPanel({ open, onClose, theme, setTheme, defaultLevel, setDefaultLevel }) {
  return (
    <div className="tweaks-panel" data-open={open}>
      <div className="tweaks-head">
        <div className="tweaks-title">Tweaks</div>
        <button onClick={onClose} style={{padding: 4, borderRadius: 6, color: 'var(--text-muted)'}}>
          <Icon.Close width="16" height="16"/>
        </button>
      </div>

      <div className="tweak-row">
        <div className="tweak-label">Appearance</div>
        <div className="tweak-switch" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <div className="tweak-switch-track"/>
          <span style={{fontSize: 13.5, fontWeight: 500}}>
            {theme === 'dark' ? '다크 모드' : '라이트 모드'}
          </span>
        </div>
      </div>

      <div className="tweak-row">
        <div className="tweak-label">코드 예제 기본 난이도</div>
        <div style={{display: 'flex', gap: 4}}>
          {[0,1,2,3,4,5].map(n => (
            <button key={n}
              onClick={() => setDefaultLevel(n)}
              style={{flex: 1, padding: '8px 0', fontSize: 12, fontFamily: 'var(--font-mono)',
                fontWeight: 700, borderRadius: 6,
                background: defaultLevel === n ? 'var(--primary)' : 'var(--surface-sunken)',
                color: defaultLevel === n ? 'white' : 'var(--text-muted)',
                border: '1px solid ' + (defaultLevel === n ? 'var(--primary)' : 'var(--border)')}}>
              L{n}
            </button>
          ))}
        </div>
        <p style={{fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4}}>
          페이지 로드 시 Progressive Disclosure 섹션의 초기 레벨
        </p>
      </div>

      <div className="tweak-row" style={{paddingTop: 12, borderTop: '1px solid var(--border)'}}>
        <p style={{fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0}}>
          Tweaks는 상단 툴바의 Tweaks 토글과 연동됩니다.
        </p>
      </div>
    </div>
  );
}

window.KnowledgeGraph = KnowledgeGraph;
window.UseCases = UseCases;
window.Install = Install;
window.Roadmap = Roadmap;
window.Footer = Footer;
window.TweaksPanel = TweaksPanel;
