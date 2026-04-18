// Main landing page — React component
const { useState, useEffect, useRef, useMemo } = React;

// =============== ICONS ===============
const Icon = {
  Search: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>),
  Arrow: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>),
  Check: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>),
  Doc: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>),
  Graph: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="m7 16 4-9M13 7l5 9M7.5 18h9"/></svg>),
  Robot: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M12 7V3M8 3h8M9 13h.01M15 13h.01M9 17h6"/></svg>),
  Sparkle: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>),
  Book: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>),
  Code: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>),
  Layers: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 6-10 6L2 8l10-6z"/><path d="m2 14 10 6 10-6M2 11l10 6 10-6"/></svg>),
  Moon: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>),
  Sliders: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>),
  Github: (p) => (<svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>),
  Chevron: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>),
  Close: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>),
  Lightning: (p) => (<svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>),
  Eye: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>),
  Shield: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Pulse: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>),
};

// =============== NAV ===============
function Nav({ onOpenTweaks, theme, setTheme }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', on);
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <a className="brand" href="#top">
          <div className="brand-mark">::</div>
          <span>UKDL</span>
          <span className="pill pill-mint" style={{marginLeft: 4}}>v2.0</span>
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#laws">철학</a>
          <a className="nav-link" href="#levels">레벨</a>
          <a className="nav-link" href="#compare">비교</a>
          <a className="nav-link" href="#usecases">사용 사례</a>
          <a className="nav-link" href="#install">시작하기</a>
          <a className="nav-link" href="#roadmap">로드맵</a>
        </div>
        <div className="nav-cta">
          <button className="btn btn-ghost btn-sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            <Icon.Moon width="16" height="16"/>
          </button>
          <a className="btn btn-ghost btn-sm" href="https://github.com/Reasonofmoon/ukld-spec" target="_blank" rel="noopener">
            <Icon.Github width="15" height="15"/> GitHub
          </a>
          <a className="btn btn-primary btn-sm" href="#install">
            시작하기 <Icon.Arrow width="14" height="14"/>
          </a>
        </div>
      </div>
    </nav>
  );
}

// =============== HERO ===============
function Hero() {
  const [tab, setTab] = useState('parse');
  const placeholders = {
    parse: ':: block id=blk:newton type=explanation about=@ent:newton-laws',
    query: 'rel[type=discovered] from=@ent:newton',
    generate: '주제: 광합성 — L3 executable tutorial 생성',
  };
  const [query, setQuery] = useState(placeholders.parse);

  useEffect(() => { setQuery(placeholders[tab]); }, [tab]);

  const suggestions = [
    ':: entity id=ent:photosynthesis',
    '@ukdl_level: 3',
    'quantum id=qst:skill-level',
    '|if: @score > 0.8|',
    'pipeline @goal',
  ];

  return (
    <section className="hero" id="top">
      <div className="hero-grid-bg"/>
      <div className="container hero-inner">
        <span className="eyebrow">
          <Icon.Sparkle width="14" height="14"/> UKDL v2.0 Standard · March 2026
        </span>
        <h1>
          지식을 <span className="accent">코드처럼</span><br/>
          구조화하라
        </h1>
        <p className="hero-lede">
          AI 에이전트를 위한 통합 지식 표현 언어.
          Markdown만큼 쉽게 쓰고, 그래프만큼 정확하게 질의하고,
          프로그램처럼 실행하세요.
        </p>

        <div className="searchbar-wrap">
          <div className="searchbar">
            <div className="searchbar-tabs">
              {[
                {id: 'parse', label: '파싱해보기', icon: Icon.Code},
                {id: 'query', label: '그래프 질의', icon: Icon.Graph},
                {id: 'generate', label: '에이전트 생성', icon: Icon.Robot},
              ].map(t => (
                <button key={t.id} className="searchbar-tab" data-active={tab === t.id}
                  onClick={() => setTab(t.id)}>
                  <t.icon width="14" height="14"/> {t.label}
                </button>
              ))}
            </div>
            <div className="searchbar-field">
              <Icon.Search className="searchbar-icon"/>
              <input className="searchbar-input" value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholders[tab]}/>
            </div>
            <button className="searchbar-go">
              실행 <Icon.Arrow width="16" height="16"/>
            </button>
          </div>
          <div className="searchbar-suggestions">
            <span style={{marginRight: 4}}>추천 구문:</span>
            {suggestions.map((s, i) => (
              <span key={i} className="suggestion-chip" onClick={() => setQuery(s)}>{s}</span>
            ))}
          </div>
        </div>

        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">6</div>
            <div className="hero-stat-lbl">Progressive Levels · L0→L5</div>
          </div>
          <div>
            <div className="hero-stat-num">10</div>
            <div className="hero-stat-lbl">Standard Kinds</div>
          </div>
          <div>
            <div className="hero-stat-num">O(n)</div>
            <div className="hero-stat-lbl">Single-Pass Parsing</div>
          </div>
          <div>
            <div className="hero-stat-num">∞</div>
            <div className="hero-stat-lbl">Domain Extensions</div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.Icon = Icon;
window.Nav = Nav;
window.Hero = Hero;
