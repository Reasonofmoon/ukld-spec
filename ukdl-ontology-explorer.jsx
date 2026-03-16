import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── UKDL Sample Data: Photosynthesis Adaptive Learning ───
const UKDL_DOCUMENT = {
  meta: {
    id: "doc:photosynthesis",
    title: "광합성의 원리",
    author: "teacher-kim",
    version: "1.0",
    domain: "biology.botany.photosynthesis",
    lang: "ko",
    tags: ["biology", "photosynthesis", "CSAT", "adaptive"],
  },
  nodes: [
    { id: "ent:photosynthesis", kind: "entity", label: "광합성", labelEn: "Photosynthesis", type: "Concept", layer: 2 },
    { id: "ent:chloroplast", kind: "entity", label: "엽록체", labelEn: "Chloroplast", type: "Concept", layer: 2 },
    { id: "ent:light-reaction", kind: "entity", label: "명반응", labelEn: "Light Reaction", type: "Process", layer: 2 },
    { id: "ent:calvin-cycle", kind: "entity", label: "칼빈회로", labelEn: "Calvin Cycle", type: "Process", layer: 2 },
    { id: "ent:atp", kind: "entity", label: "ATP", labelEn: "ATP", type: "Molecule", layer: 2 },
    { id: "ent:nadph", kind: "entity", label: "NADPH", labelEn: "NADPH", type: "Molecule", layer: 2 },
    { id: "ent:glucose", kind: "entity", label: "포도당", labelEn: "Glucose", type: "Molecule", layer: 2 },
    { id: "ctx:photo-overview", kind: "context", label: "개요 컨텍스트", priority: "high", depth: "overview", summary: "광합성 = 빛+CO₂+H₂O → 포도당+O₂", layer: 3 },
    { id: "ctx:photo-detail", kind: "context", label: "상세 컨텍스트", priority: "low", depth: "detailed", collapse: true, summary: "화학식 및 메커니즘", layer: 3 },
    { id: "blk:adaptive-explanation", kind: "block", label: "적응형 설명", type: "lesson", priority: "high", layer: 1 },
    { id: "blk:claim-1", kind: "block", label: "교육 주장", type: "claim", confidence: 0.95, layer: 1 },
    { id: "blk:evidence-1", kind: "block", label: "연구 근거", type: "evidence", confidence: 0.88, layer: 1 },
    { id: "qst:learner-level", kind: "quantum", label: "학습자 수준", states: { beginner: 0.3, intermediate: 0.5, advanced: 0.2 }, layer: 4 },
    { id: "qst:content-depth", kind: "quantum", label: "콘텐츠 깊이", states: { basic: 0.3, standard: 0.5, deep: 0.2 }, layer: 4 },
    { id: "act:diagnostic-quiz", kind: "action", label: "진단 퀴즈", agent: "ai-tutor", trigger: "lesson_start", tool: "adaptive_quiz_generator", layer: 3 },
    { id: "act:generate-review", kind: "action", label: "복습 생성", agent: "ai-tutor", trigger: "quiz_score<70", tool: "review_material_generator", layer: 3 },
    { id: "pipe:photo-learning", kind: "pipeline", label: "학습 파이프라인", goal: "maximize_comprehension", stages: ["diagnose", "collapse_state", "deliver", "assess"], layer: 5 },
  ],
  edges: [
    { from: "ent:photosynthesis", to: "ent:chloroplast", type: "occurs_in", label: "일어나는 곳" },
    { from: "ent:photosynthesis", to: "ent:light-reaction", type: "has_stage", label: "1단계" },
    { from: "ent:photosynthesis", to: "ent:calvin-cycle", type: "has_stage", label: "2단계" },
    { from: "ent:light-reaction", to: "ent:atp", type: "produces", label: "생성" },
    { from: "ent:light-reaction", to: "ent:nadph", type: "produces", label: "생성" },
    { from: "ent:calvin-cycle", to: "ent:glucose", type: "produces", label: "생성" },
    { from: "ent:atp", to: "ent:calvin-cycle", type: "used_by", label: "소비" },
    { from: "ent:nadph", to: "ent:calvin-cycle", type: "used_by", label: "소비" },
    { from: "blk:adaptive-explanation", to: "ent:photosynthesis", type: "about", label: "주제" },
    { from: "blk:claim-1", to: "blk:evidence-1", type: "supported_by", label: "근거" },
    { from: "ctx:photo-overview", to: "ent:photosynthesis", type: "describes", label: "기술" },
    { from: "ctx:photo-detail", to: "ent:photosynthesis", type: "describes", label: "상세기술" },
    { from: "qst:learner-level", to: "qst:content-depth", type: "entangle", label: "얽힘" },
    { from: "qst:learner-level", to: "blk:adaptive-explanation", type: "controls", label: "제어" },
    { from: "act:diagnostic-quiz", to: "qst:learner-level", type: "observes", label: "관측" },
    { from: "act:generate-review", to: "act:diagnostic-quiz", type: "depends_on", label: "의존" },
    { from: "pipe:photo-learning", to: "act:diagnostic-quiz", type: "orchestrates", label: "오케스트레이션" },
    { from: "pipe:photo-learning", to: "qst:learner-level", type: "orchestrates", label: "오케스트레이션" },
    { from: "pipe:photo-learning", to: "blk:adaptive-explanation", type: "orchestrates", label: "오케스트레이션" },
    { from: "pipe:photo-learning", to: "act:generate-review", type: "orchestrates", label: "오케스트레이션" },
  ],
};

// ─── Kind Config ───
const KIND_CONFIG = {
  entity:   { color: "#06B6D4", bg: "#083344", icon: "◆", labelColor: "#67E8F9" },
  block:    { color: "#8B5CF6", bg: "#2E1065", icon: "■", labelColor: "#C4B5FD" },
  context:  { color: "#F59E0B", bg: "#451A03", icon: "◎", labelColor: "#FCD34D" },
  action:   { color: "#EF4444", bg: "#450A0A", icon: "▶", labelColor: "#FCA5A5" },
  quantum:  { color: "#EC4899", bg: "#500724", icon: "⟨ψ⟩", labelColor: "#F9A8D4" },
  pipeline: { color: "#10B981", bg: "#022C22", icon: "⟳", labelColor: "#6EE7B7" },
  meta:     { color: "#6B7280", bg: "#1F2937", icon: "◇", labelColor: "#D1D5DB" },
};

const LEVEL_NAMES = ["L0 Pure", "L1 Semantic", "L2 Context", "L3 Executable", "L4 Dynamic", "L5 Orchestrated"];
const LEVEL_COLORS = ["#6B7280", "#06B6D4", "#F59E0B", "#EF4444", "#EC4899", "#10B981"];

// ─── Force-directed layout ───
function useForceLayout(nodes, edges, width, height, selectedKinds) {
  const posRef = useRef(null);
  const [positions, setPositions] = useState({});
  const frameRef = useRef(null);

  const filteredNodes = useMemo(() =>
    nodes.filter(n => selectedKinds.has(n.kind)),
    [nodes, selectedKinds]
  );
  const filteredEdges = useMemo(() =>
    edges.filter(e => {
      const fromNode = nodes.find(n => n.id === e.from);
      const toNode = nodes.find(n => n.id === e.to);
      return fromNode && toNode && selectedKinds.has(fromNode.kind) && selectedKinds.has(toNode.kind);
    }),
    [edges, nodes, selectedKinds]
  );

  useEffect(() => {
    if (!width || !height) return;
    const cx = width / 2, cy = height / 2;
    const pos = {};
    filteredNodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / filteredNodes.length;
      const r = Math.min(width, height) * 0.32;
      pos[n.id] = {
        x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0
      };
    });
    posRef.current = pos;

    let tick = 0;
    const maxTicks = 300;
    const simulate = () => {
      if (tick >= maxTicks) return;
      tick++;
      const p = posRef.current;
      const alpha = 1 - tick / maxTicks;
      const k = alpha * 0.4;

      // Repulsion
      const fnodes = filteredNodes;
      for (let i = 0; i < fnodes.length; i++) {
        for (let j = i + 1; j < fnodes.length; j++) {
          const a = p[fnodes[i].id], b = p[fnodes[j].id];
          if (!a || !b) continue;
          let dx = a.x - b.x, dy = a.y - b.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (8000 * k) / (dist * dist);
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }
      }

      // Attraction along edges
      filteredEdges.forEach(e => {
        const a = p[e.from], b = p[e.to];
        if (!a || !b) return;
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 140) * 0.008 * k;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      });

      // Center gravity
      fnodes.forEach(n => {
        const nd = p[n.id];
        if (!nd) return;
        nd.vx += (cx - nd.x) * 0.001 * k;
        nd.vy += (cy - nd.y) * 0.001 * k;
        nd.vx *= 0.85; nd.vy *= 0.85;
        nd.x += nd.vx; nd.y += nd.vy;
        nd.x = Math.max(60, Math.min(width - 60, nd.x));
        nd.y = Math.max(60, Math.min(height - 60, nd.y));
      });

      setPositions({ ...posRef.current });
      frameRef.current = requestAnimationFrame(simulate);
    };
    frameRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [filteredNodes, filteredEdges, width, height]);

  return { positions, filteredNodes, filteredEdges };
}

// ─── Quantum State Visualizer ───
function QuantumPanel({ node, entangledNode }) {
  const [observed, setObserved] = useState(null);
  const [animating, setAnimating] = useState(false);

  const observe = () => {
    setAnimating(true);
    setTimeout(() => {
      const r = Math.random();
      let cum = 0;
      let result = null;
      for (const [state, prob] of Object.entries(node.states)) {
        cum += prob;
        if (r <= cum) { result = state; break; }
      }
      setObserved(result);
      setAnimating(false);
    }, 1200);
  };

  return (
    <div style={{ background: "#0F0B1E", borderRadius: 12, padding: 16, border: "1px solid #EC489944" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>⟨ψ⟩</span>
        <span style={{ color: "#F9A8D4", fontWeight: 700, fontSize: 14 }}>{node.label}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {Object.entries(node.states).map(([state, prob]) => (
          <div key={state} style={{
            background: observed === state ? "#EC4899" : "#1E1033",
            border: `1px solid ${observed === state ? "#EC4899" : "#EC489944"}`,
            borderRadius: 8, padding: "6px 12px", fontSize: 12,
            transition: "all 0.3s",
            transform: observed === state ? "scale(1.1)" : "scale(1)"
          }}>
            <span style={{ color: "#F9A8D4" }}>{state}</span>
            <span style={{ color: "#9CA3AF", marginLeft: 6 }}>{(prob * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      {/* Probability bars */}
      <div style={{ marginBottom: 12 }}>
        {Object.entries(node.states).map(([state, prob]) => (
          <div key={state} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "#9CA3AF", fontSize: 11, width: 80, textAlign: "right" }}>{state}</span>
            <div style={{ flex: 1, height: 6, background: "#1E1033", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${prob * 100}%`, height: "100%",
                background: observed === state
                  ? "linear-gradient(90deg, #EC4899, #F472B6)"
                  : "linear-gradient(90deg, #EC489966, #EC489933)",
                borderRadius: 3,
                transition: "all 0.5s"
              }} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={observe} disabled={animating} style={{
        width: "100%", padding: "8px 0", borderRadius: 8, border: "none",
        background: animating
          ? "linear-gradient(135deg, #581C87, #831843)"
          : "linear-gradient(135deg, #7C3AED, #EC4899)",
        color: "white", fontWeight: 600, fontSize: 12, cursor: animating ? "wait" : "pointer",
        transition: "all 0.3s"
      }}>
        {animating ? "⟨ψ| 관측 중..." : observed ? `🔬 재관측 (현재: ${observed})` : "🔬 상태 관측 (Collapse)"}
      </button>
      {entangledNode && (
        <div style={{ marginTop: 8, padding: 8, background: "#1E1033", borderRadius: 8, fontSize: 11, color: "#9CA3AF" }}>
          ⚛ 얽힘: <span style={{ color: "#F9A8D4" }}>{entangledNode.label}</span>
          {observed && <span style={{ color: "#FCD34D" }}> → 연동 collapse</span>}
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Visualizer ───
function PipelinePanel({ node }) {
  const [activeStage, setActiveStage] = useState(-1);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setActiveStage(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i >= node.stages.length) {
        clearInterval(iv);
        setTimeout(() => { setRunning(false); setActiveStage(-1); }, 1000);
      } else {
        setActiveStage(i);
      }
    }, 800);
  };

  const stageIcons = ["🔍", "⟨ψ⟩", "📦", "✅"];

  return (
    <div style={{ background: "#021A13", borderRadius: 12, padding: 16, border: "1px solid #10B98144" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>⟳</span>
        <span style={{ color: "#6EE7B7", fontWeight: 700, fontSize: 14 }}>{node.label}</span>
      </div>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>
        목표: <span style={{ color: "#6EE7B7" }}>{node.goal}</span>
      </div>
      {/* Stage flow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        {node.stages.map((stage, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: activeStage === i ? "#10B981" : activeStage > i ? "#065F46" : "#0D3D30",
              border: `2px solid ${activeStage >= i ? "#10B981" : "#10B98144"}`,
              transition: "all 0.3s",
              transform: activeStage === i ? "scale(1.2)" : "scale(1)",
              boxShadow: activeStage === i ? "0 0 20px #10B98166" : "none"
            }}>
              <span style={{ fontSize: 14 }}>{stageIcons[i] || "●"}</span>
            </div>
            {i < node.stages.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 4px",
                background: activeStage > i ? "#10B981" : "#10B98133",
                transition: "all 0.3s"
              }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        {node.stages.map((stage, i) => (
          <span key={i} style={{
            fontSize: 10, color: activeStage === i ? "#6EE7B7" : "#6B7280",
            width: 44, textAlign: "center", fontWeight: activeStage === i ? 700 : 400
          }}>{stage}</span>
        ))}
      </div>
      <button onClick={run} disabled={running} style={{
        width: "100%", padding: "8px 0", borderRadius: 8, border: "none",
        background: running ? "#065F46" : "linear-gradient(135deg, #059669, #10B981)",
        color: "white", fontWeight: 600, fontSize: 12,
        cursor: running ? "wait" : "pointer"
      }}>
        {running ? `실행 중: ${node.stages[activeStage]}...` : "▶ 파이프라인 실행"}
      </button>
    </div>
  );
}

// ─── UKDL Source Preview ───
function SourcePreview({ node }) {
  const cfg = KIND_CONFIG[node.kind] || KIND_CONFIG.entity;
  const lines = [];
  lines.push(`:: ${node.kind} id=${node.id}${node.type ? ` type=${node.type}` : ""}`);
  if (node.priority) lines.push(`  priority=${node.priority}`);
  if (node.agent) lines.push(`  agent=${node.agent} trigger="${node.trigger}"`);
  if (node.states) lines.push(`@states: ${JSON.stringify(node.states)}`);
  if (node.tool) lines.push(`@tool: "${node.tool}"`);
  if (node.goal) lines.push(`@goal: "${node.goal}"`);
  if (node.summary) lines.push(`@summary: "${node.summary}"`);
  if (node.stages) lines.push(`@stages: ${JSON.stringify(node.stages)}`);
  lines.push("::");

  return (
    <div style={{
      background: "#0A0A0F", borderRadius: 8, padding: 12,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11,
      lineHeight: 1.6, border: `1px solid ${cfg.color}33`, overflow: "auto"
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.startsWith("::") ? cfg.color : l.startsWith("@") ? "#FCD34D" : "#D1D5DB" }}>
          {l}
        </div>
      ))}
    </div>
  );
}

// ─── Node Detail Panel ───
function NodeDetail({ node, allNodes }) {
  const cfg = KIND_CONFIG[node.kind] || KIND_CONFIG.entity;
  const entangled = node.kind === "quantum"
    ? allNodes.find(n => n.id !== node.id && n.kind === "quantum")
    : null;

  return (
    <div style={{
      background: "#0D0D14", borderRadius: 16, padding: 20, border: `1px solid ${cfg.color}44`,
      boxShadow: `0 0 40px ${cfg.color}11`
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: cfg.bg, border: `1px solid ${cfg.color}66`,
          fontSize: 16, color: cfg.color
        }}>{cfg.icon}</div>
        <div>
          <div style={{ color: cfg.labelColor, fontWeight: 700, fontSize: 16 }}>{node.label}</div>
          <div style={{ color: "#6B7280", fontSize: 11 }}>{node.id}</div>
        </div>
      </div>

      {/* Kind badge + level */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`
        }}>{node.kind}</span>
        {node.type && <span style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 11,
          background: "#1F2937", color: "#D1D5DB", border: "1px solid #374151"
        }}>{node.type}</span>}
        {node.priority && <span style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 11,
          background: node.priority === "high" ? "#451A03" : "#1F2937",
          color: node.priority === "high" ? "#FCD34D" : "#9CA3AF",
          border: `1px solid ${node.priority === "high" ? "#F59E0B44" : "#37415166"}`
        }}>{node.priority}</span>}
        {node.confidence != null && <span style={{
          padding: "3px 10px", borderRadius: 20, fontSize: 11,
          background: "#1E1033", color: "#C4B5FD", border: "1px solid #8B5CF644"
        }}>신뢰도: {(node.confidence * 100).toFixed(0)}%</span>}
      </div>

      {/* Quantum panel */}
      {node.kind === "quantum" && <QuantumPanel node={node} entangledNode={entangled} />}

      {/* Pipeline panel */}
      {node.kind === "pipeline" && <PipelinePanel node={node} />}

      {/* Action detail */}
      {node.kind === "action" && (
        <div style={{ background: "#1A0A0A", borderRadius: 8, padding: 12, border: "1px solid #EF444433", fontSize: 12 }}>
          <div style={{ color: "#FCA5A5", marginBottom: 4 }}>▶ Agent: <span style={{ color: "#F87171" }}>{node.agent}</span></div>
          <div style={{ color: "#FCA5A5", marginBottom: 4 }}>⚡ Trigger: <span style={{ color: "#FDE68A" }}>{node.trigger}</span></div>
          <div style={{ color: "#FCA5A5" }}>🔧 Tool: <span style={{ color: "#D1D5DB" }}>{node.tool}</span></div>
        </div>
      )}

      {/* Context detail */}
      {node.kind === "context" && (
        <div style={{ background: "#1A1200", borderRadius: 8, padding: 12, border: "1px solid #F59E0B33", fontSize: 12 }}>
          <div style={{ color: "#FCD34D", marginBottom: 4 }}>◎ Depth: <span style={{ color: "#FDE68A" }}>{node.depth}</span></div>
          {node.summary && <div style={{ color: "#D1D5DB", marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>"{node.summary}"</div>}
          {node.collapse && <div style={{ color: "#F59E0B", marginTop: 4, fontSize: 11 }}>📁 기본 접힘</div>}
        </div>
      )}

      {/* Source preview */}
      <div style={{ marginTop: 16 }}>
        <div style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: 600 }}>UKDL SOURCE</div>
        <SourcePreview node={node} />
      </div>
    </div>
  );
}

// ─── Main App ───
export default function UKDLExplorer() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedKinds, setSelectedKinds] = useState(new Set(["entity", "block", "context", "action", "quantum", "pipeline"]));
  const [viewMode, setViewMode] = useState("graph"); // graph | layers | source
  const [contextPhase, setContextPhase] = useState(0); // 0=full, 1=summary, 2=priority, 3=skeleton

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: Math.max(500, r.height) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const graphW = selectedNode ? dims.w * 0.6 : dims.w;
  const { positions, filteredNodes, filteredEdges } = useForceLayout(
    UKDL_DOCUMENT.nodes, UKDL_DOCUMENT.edges, graphW - 20, dims.h - 200, selectedKinds
  );

  const toggleKind = (kind) => {
    setSelectedKinds(prev => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind); else next.add(kind);
      return next;
    });
  };

  const contextPhases = ["Full", "Summary", "Priority", "Skeleton"];

  // Which nodes visible in current context phase
  const contextVisible = useMemo(() => {
    const s = new Set();
    UKDL_DOCUMENT.nodes.forEach(n => {
      if (contextPhase === 0) { s.add(n.id); return; }
      if (contextPhase === 1 && (n.priority !== "low" || n.kind !== "context")) { s.add(n.id); return; }
      if (contextPhase === 2 && (n.priority === "critical" || n.priority === "high" || n.kind === "quantum" || n.kind === "pipeline")) { s.add(n.id); return; }
      if (contextPhase === 3 && (n.kind === "entity" || n.kind === "rel" || n.kind === "meta")) { s.add(n.id); }
    });
    return s;
  }, [contextPhase]);

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#06060C",
      color: "#E5E7EB", fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px", borderBottom: "1px solid #1F2937",
        background: "linear-gradient(180deg, #0D0D18 0%, #06060C 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "white"
          }}>U</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "#F3F4F6" }}>
              UKDL Ontology Explorer
            </div>
            <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: "0.05em" }}>
              Unified Knowledge & Dynamics Language v1.0
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["graph", "layers", "source"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: "5px 14px", borderRadius: 6, border: "none",
              background: viewMode === m ? "#7C3AED" : "#1F2937",
              color: viewMode === m ? "white" : "#9CA3AF",
              fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
            }}>{m === "graph" ? "그래프" : m === "layers" ? "레이어" : "소스"}</button>
          ))}
        </div>
      </div>

      {/* Kind Filter Bar */}
      <div style={{
        padding: "8px 20px", borderBottom: "1px solid #111827",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap"
      }}>
        <span style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, marginRight: 4 }}>KINDS:</span>
        {Object.entries(KIND_CONFIG).filter(([k]) => k !== "meta").map(([kind, cfg]) => (
          <button key={kind} onClick={() => toggleKind(kind)} style={{
            padding: "3px 10px", borderRadius: 20, border: `1px solid ${cfg.color}${selectedKinds.has(kind) ? "88" : "33"}`,
            background: selectedKinds.has(kind) ? cfg.bg : "transparent",
            color: selectedKinds.has(kind) ? cfg.color : "#4B5563",
            fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 4
          }}>
            <span>{cfg.icon}</span> {kind}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>컨텍스트 Phase:</span>
        {contextPhases.map((p, i) => (
          <button key={i} onClick={() => setContextPhase(i)} style={{
            padding: "3px 10px", borderRadius: 20, border: "1px solid #37415166",
            background: contextPhase === i ? "#374151" : "transparent",
            color: contextPhase === i ? "#F3F4F6" : "#6B7280",
            fontSize: 10, fontWeight: 600, cursor: "pointer"
          }}>{p}</button>
        ))}
      </div>

      {/* Main Content */}
      <div ref={containerRef} style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Graph / Layer / Source View */}
        <div style={{ flex: selectedNode ? 0.6 : 1, transition: "flex 0.3s", position: "relative", overflow: "hidden" }}>
          {viewMode === "graph" && (
            <svg ref={svgRef} width="100%" height="100%" style={{ display: "block" }}>
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#4B5563" />
                </marker>
                {Object.entries(KIND_CONFIG).map(([kind, cfg]) => (
                  <radialGradient key={kind} id={`glow-${kind}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              {/* Edges */}
              {filteredEdges.map((e, i) => {
                const from = positions[e.from];
                const to = positions[e.to];
                if (!from || !to) return null;
                const visible = contextVisible.has(e.from) && contextVisible.has(e.to);
                const isEntangle = e.type === "entangle";
                const isOrch = e.type === "orchestrates";
                return (
                  <g key={i} style={{ opacity: visible ? 1 : 0.1, transition: "opacity 0.5s" }}>
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isEntangle ? "#EC4899" : isOrch ? "#10B981" : "#374151"}
                      strokeWidth={isEntangle ? 2 : isOrch ? 1.5 : 1}
                      strokeDasharray={isEntangle ? "6,4" : isOrch ? "3,3" : "none"}
                      markerEnd="url(#arrowhead)"
                      style={{ opacity: 0.6 }}
                    />
                    <text
                      x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                      fill="#6B7280" fontSize={8} textAnchor="middle"
                      style={{ pointerEvents: "none" }}
                    >{e.label}</text>
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map(node => {
                const pos = positions[node.id];
                if (!pos) return null;
                const cfg = KIND_CONFIG[node.kind] || KIND_CONFIG.entity;
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode === node.id;
                const visible = contextVisible.has(node.id);
                const r = isSelected ? 28 : isHovered ? 24 : 20;

                return (
                  <g key={node.id}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{
                      cursor: "pointer",
                      opacity: visible ? 1 : 0.15,
                      transition: "opacity 0.5s"
                    }}>
                    {/* Glow */}
                    {(isSelected || isHovered) && (
                      <circle cx={pos.x} cy={pos.y} r={r + 16} fill={`url(#glow-${node.kind})`} />
                    )}
                    {/* Circle */}
                    <circle cx={pos.x} cy={pos.y} r={r}
                      fill={cfg.bg} stroke={cfg.color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      style={{ transition: "all 0.2s" }}
                    />
                    {/* Icon */}
                    <text x={pos.x} y={pos.y + 1} fill={cfg.color} fontSize={node.kind === "quantum" ? 9 : 12}
                      textAnchor="middle" dominantBaseline="middle" fontWeight="bold"
                      style={{ pointerEvents: "none" }}>
                      {cfg.icon}
                    </text>
                    {/* Label */}
                    <text x={pos.x} y={pos.y + r + 14} fill={cfg.labelColor} fontSize={10}
                      textAnchor="middle" fontWeight="600"
                      style={{ pointerEvents: "none" }}>
                      {node.label}
                    </text>
                    {/* Confidence / Priority badge */}
                    {node.confidence != null && (
                      <text x={pos.x + r - 4} y={pos.y - r + 6} fill="#FCD34D" fontSize={8}
                        textAnchor="middle" style={{ pointerEvents: "none" }}>
                        {(node.confidence * 100).toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {viewMode === "layers" && (
            <div style={{ padding: 20, overflowY: "auto", height: "100%" }}>
              {LEVEL_NAMES.map((name, lvl) => {
                const nodesInLevel = UKDL_DOCUMENT.nodes.filter(n => n.layer === lvl);
                if (nodesInLevel.length === 0 && lvl === 0) return null;
                return (
                  <div key={lvl} style={{
                    marginBottom: 16, padding: 16, borderRadius: 12,
                    background: "#0D0D14", border: `1px solid ${LEVEL_COLORS[lvl]}33`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: LEVEL_COLORS[lvl], display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: "#000"
                      }}>L{lvl}</div>
                      <span style={{ color: LEVEL_COLORS[lvl], fontWeight: 700, fontSize: 14 }}>{name}</span>
                      <span style={{ color: "#6B7280", fontSize: 11 }}>({nodesInLevel.length} nodes)</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {nodesInLevel.map(n => {
                        const c = KIND_CONFIG[n.kind] || KIND_CONFIG.entity;
                        return (
                          <div key={n.id} onClick={() => { setSelectedNode(n); setViewMode("graph"); }}
                            style={{
                              padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                              background: c.bg, border: `1px solid ${c.color}44`,
                              transition: "all 0.2s"
                            }}>
                            <span style={{ color: c.color, marginRight: 6, fontSize: 12 }}>{c.icon}</span>
                            <span style={{ color: c.labelColor, fontSize: 12, fontWeight: 600 }}>{n.label}</span>
                            <span style={{ color: "#6B7280", fontSize: 10, marginLeft: 6 }}>{n.kind}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === "source" && (
            <div style={{
              padding: 20, overflowY: "auto", height: "100%",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.8
            }}>
              <div style={{ color: "#6B7280" }}>%% UKDL v1.0 — {UKDL_DOCUMENT.meta.title}</div>
              <div style={{ height: 8 }} />
              <div style={{ color: "#6B7280" }}>:: meta id={UKDL_DOCUMENT.meta.id} title="{UKDL_DOCUMENT.meta.title}"</div>
              <div style={{ color: "#FCD34D" }}>@author: "{UKDL_DOCUMENT.meta.author}"</div>
              <div style={{ color: "#FCD34D" }}>@domain: "{UKDL_DOCUMENT.meta.domain}"</div>
              <div style={{ color: "#FCD34D" }}>@tags: {JSON.stringify(UKDL_DOCUMENT.meta.tags)}</div>
              <div style={{ color: "#6B7280" }}>::</div>
              <div style={{ height: 12 }} />
              {UKDL_DOCUMENT.nodes.map(n => {
                const c = KIND_CONFIG[n.kind] || KIND_CONFIG.entity;
                return (
                  <div key={n.id} style={{ marginBottom: 12, cursor: "pointer" }}
                    onClick={() => { setSelectedNode(n); setViewMode("graph"); }}>
                    <div style={{ color: c.color }}>
                      :: {n.kind} id={n.id}{n.type ? ` type=${n.type}` : ""}
                      {n.priority ? ` priority=${n.priority}` : ""}
                    </div>
                    {n.states && <div style={{ color: "#FCD34D" }}>@states: {JSON.stringify(n.states)}</div>}
                    {n.agent && <div style={{ color: "#FCD34D" }}>@agent: "{n.agent}" @trigger: "{n.trigger}"</div>}
                    {n.tool && <div style={{ color: "#FCD34D" }}>@tool: "{n.tool}"</div>}
                    {n.goal && <div style={{ color: "#FCD34D" }}>@goal: "{n.goal}"</div>}
                    {n.summary && <div style={{ color: "#D1D5DB", fontStyle: "italic" }}>  "{n.summary}"</div>}
                    <div style={{ color: c.color }}>::</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <div style={{
            flex: 0.4, borderLeft: "1px solid #1F2937", padding: 20,
            overflowY: "auto", background: "#08080F"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#6B7280", fontSize: 11, fontWeight: 600 }}>NODE DETAIL</span>
              <button onClick={() => setSelectedNode(null)} style={{
                background: "#1F2937", border: "none", color: "#9CA3AF",
                borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11
              }}>✕ 닫기</button>
            </div>
            <NodeDetail node={selectedNode} allNodes={UKDL_DOCUMENT.nodes} />
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div style={{
        padding: "8px 20px", borderTop: "1px solid #1F2937",
        display: "flex", alignItems: "center", gap: 16, fontSize: 10, color: "#6B7280", flexShrink: 0
      }}>
        <span>Nodes: <span style={{ color: "#D1D5DB" }}>{UKDL_DOCUMENT.nodes.length}</span></span>
        <span>Edges: <span style={{ color: "#D1D5DB" }}>{UKDL_DOCUMENT.edges.length}</span></span>
        <span>Kinds: <span style={{ color: "#D1D5DB" }}>{new Set(UKDL_DOCUMENT.nodes.map(n => n.kind)).size}</span></span>
        <span>Domain: <span style={{ color: "#06B6D4" }}>{UKDL_DOCUMENT.meta.domain}</span></span>
        <div style={{ flex: 1 }} />
        <span>Context Phase: <span style={{ color: "#F59E0B" }}>{contextPhases[contextPhase]}</span></span>
        <span style={{ color: "#374151" }}>|</span>
        <span>UKDL v1.0</span>
      </div>
    </div>
  );
}
