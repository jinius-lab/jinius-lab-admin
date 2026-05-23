import { useState, useCallback, memo } from "react";

const PASSWORD = "1234";
const TEACHER = "한효진";
const ACADEMY = "JINIUS-LAB";

const DAYS = ["월","화","수","목","금","토"];
const GRADES = ["초1","초2","초3","초4","초5","초6","중1","중2","중3","고1","고2","고3","N수"];

const load = (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } };
let saveTimers = {};
const save = (key, val) => { clearTimeout(saveTimers[key]); saveTimers[key] = setTimeout(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, 500); };

const gradeColor = (g) => { if (!g) return "#94a3b8"; if (g.startsWith("초")) return "#34d399"; if (g.startsWith("중")) return "#f97316"; if (g.startsWith("고")) return "#818cf8"; return "#c084fc"; };
const card = { background: "#18181f", borderRadius: 14, border: "1px solid #2a2a38", padding: 22 };
const tag = (color) => ({ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: color + "22", color });
const pill = (ok) => ({ fontSize: 11, padding: "3px 12px", borderRadius: 99, display: "inline-block", background: ok ? "#052e1622" : "#450a0a22", color: ok ? "#34d399" : "#f87171", border: `1px solid ${ok ? "#34d39944" : "#f8717144"}` });
const inp = { width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid #2a2a38", background: "#0f0f13", color: "#e8e4f0", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box", outline: "none" };
const btnPurple = { background: "#c084fc", color: "#0f0f13", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" };

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

const Modal = memo(({ title, onClose, children, onSave, saveLabel = "추가" }) => (
  <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
    <div style={{ ...card, width: 440, padding: 32, maxHeight: "90vh", overflowY: "auto" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 20, color: "#e8e4f0" }}>{title}</h2>
      {children}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button onClick={onSave} style={{ ...btnPurple, flex: 1, padding: "11px" }}>{saveLabel}</button>
        <button onClick={onClose} style={{ flex: 1, background: "#1e1e2e", color: "#9ca3af", border: "1px solid #2a2a38", borderRadius: 9, padding: "11px", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
      </div>
    </div>
  </div>
));

// ── 학생 추가 ──
const AddStudentModal = memo(({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("중1");
  const [paid, setPaid] = useState(false);
  const handleSave = () => { if (!name.trim()) return; onSave({ name: name.trim(), grade, paid }); };
  return (
    <Modal title="학생 추가" onClose={onClose} onSave={handleSave}>
      <Field label="이름"><input placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} autoFocus style={inp} /></Field>
      <Field label="학년">
        <select value={grade} onChange={e => setGrade(e.target.value)} style={inp}>
          <optgroup label="초등">{["초1","초2","초3","초4","초5","초6"].map(g => <option key={g}>{g}</option>)}</optgroup>
          <optgroup label="중학교">{["중1","중2","중3"].map(g => <option key={g}>{g}</option>)}</optgroup>
          <optgroup label="고등학교">{["고1","고2","고3"].map(g => <option key={g}>{g}</option>)}</optgroup>
          <optgroup label="기타"><option>N수</option></optgroup>
        </select>
      </Field>
      <Field label="납부 여부">
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: false, label: "미납", color: "#f87171" }, { v: true, label: "완납", color: "#34d399" }].map(({ v, label, color }) => (
            <button key={label} onClick={() => setPaid(v)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1px solid ${paid === v ? color : "#2a2a38"}`, background: paid === v ? color + "22" : "transparent", color: paid === v ? color : "#6b7280", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13 }}>{label}</button>
          ))}
        </div>
      </Field>
    </Modal>
  );
});

// ── 내신 교재 순서 ──
const NAESIN_BOOKS = ["교과서", "교과서변형", "Tee-Ball", "FUNGO&ENTRY", "부교재", "변형문제", "기출문제"];
const NAESIN_MIDDLE_BOOKS = ["교과서", "교과서변형", "최다빈출", "기본", "발전", "심화", "기출변형", "기출", "기출예상"];
const SUNEUNG_BOOKS = ["교과서", "Tee-Ball", "FUNGO&ENTRY", "최신기출문제", "수능특강선별문제", "수능완성선별문제", "HITS", "HOMERUN", "TRIPLECROWN"];
const SUNHAENG_MIDDLE_BOOKS = ["개념원리", "변형문제", "일품", "변형및취약문제(일품)", "블랙라벨", "변형및취약문제(블랙라벨)", "고쟁이", "변형및취약문제(고쟁이)", "에이급", "변형및취약문제(에이급)"];
const SUNHAENG_HIGH_BOOKS = ["교과서", "Tee-Ball", "FUNGO&ENTRY", "일품", "블랙라벨", "고쟁이", "TOT", "수학의신", "자체교재"];

// ── 커리큘럼 단계 추가 행 ──
const CurriculumAddRow = memo(({ onAdd, onAddUnit }) => {
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [unitName, setUnitName] = useState("");
  const [mode, setMode] = useState("unit");
  const [currType, setCurrType] = useState("naesin"); // "naesin" | "suneung"

  const handleAdd = () => { if (!label.trim()) return; onAdd(label.trim(), desc.trim()); setLabel(""); setDesc(""); };
  const handleAddUnit = () => { if (!unitName.trim()) return; onAddUnit(unitName.trim(), currType); setUnitName(""); };

  const books = currType === "suneung" ? SUNEUNG_BOOKS : currType === "naesin_middle" ? NAESIN_MIDDLE_BOOKS : currType === "sunhaeng_middle" ? SUNHAENG_MIDDLE_BOOKS : currType === "sunhaeng_high" ? SUNHAENG_HIGH_BOOKS : NAESIN_BOOKS;

  return (
    <div style={{ marginTop: 14, borderTop: "1px solid #2a2a38", paddingTop: 14 }}>
      {/* 모드 선택 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setMode("unit")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${mode === "unit" ? "#c084fc" : "#2a2a38"}`, background: mode === "unit" ? "#c084fc18" : "transparent", color: mode === "unit" ? "#c084fc" : "#6b7280", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13 }}>
          🎯 단원 자동생성
        </button>
        <button onClick={() => setMode("single")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${mode === "single" ? "#c084fc" : "#2a2a38"}`, background: mode === "single" ? "#c084fc18" : "transparent", color: mode === "single" ? "#c084fc" : "#6b7280", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13 }}>
          ✏️ 직접 입력
        </button>
      </div>

      {mode === "unit" && (
        <div>
          {/* 내신 / 수능 선택 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[
            { v: "naesin", label: "📚 고등내신", count: NAESIN_BOOKS.length },
            { v: "naesin_middle", label: "📗 중등내신", count: NAESIN_MIDDLE_BOOKS.length },
            { v: "suneung", label: "🎯 수능", count: SUNEUNG_BOOKS.length },
            { v: "sunhaeng_middle", label: "📘 중등선행", count: SUNHAENG_MIDDLE_BOOKS.length },
            { v: "sunhaeng_high", label: "📙 고등선행", count: SUNHAENG_HIGH_BOOKS.length },
          ].map(({ v, label, count }) => (
              <button key={v} onClick={() => setCurrType(v)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${currType === v ? "#fbbf24" : "#2a2a38"}`, background: currType === v ? "#fbbf2418" : "transparent", color: currType === v ? "#fbbf24" : "#6b7280", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12 }}>
                {label} ({count}단계)
              </button>
            ))}
          </div>
          {/* 교재 미리보기 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {books.map((b, i) => (
              <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#1e1e2e", color: "#9ca3af", border: "1px solid #2a2a38" }}>{b}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="단원 이름 입력 (예: 대수(삼각함수활용))"
              value={unitName}
              onChange={e => setUnitName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddUnit()}
              style={{ flex: 1, ...inp, padding: "9px 12px", fontSize: 13 }}
            />
            <button onClick={handleAddUnit} style={{ ...btnPurple, padding: "9px 16px", fontSize: 13, borderRadius: 8, whiteSpace: "nowrap" }}>
              자동 생성 ✨
            </button>
          </div>
        </div>
      )}

      {mode === "single" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="단계 이름" value={label} onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} style={{ flex: 2, ...inp, padding: "9px 12px", fontSize: 13 }} />
          <input placeholder="설명 (선택)" value={desc} onChange={e => setDesc(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} style={{ flex: 1, ...inp, padding: "9px 12px", fontSize: 13 }} />
          <button onClick={handleAdd} style={{ ...btnPurple, padding: "9px 14px", fontSize: 13, borderRadius: 8 }}>+ 추가</button>
        </div>
      )}
    </div>
  );
});

// ── 2주 계획 입력 행 ──
const PlanAddRow = memo(({ onAdd }) => {
  const [label, setLabel] = useState("");
  const handleAdd = () => { if (!label.trim()) return; onAdd(label.trim()); setLabel(""); };
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <input placeholder="목표 입력 (예: 소인수분해 완성)" value={label} onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} style={{ flex: 1, ...inp, padding: "8px 12px", fontSize: 13 }} />
      <button onClick={handleAdd} style={{ ...btnPurple, padding: "8px 14px", fontSize: 13, borderRadius: 8 }}>+ 추가</button>
    </div>
  );
});

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "생성 실패";
}

// ══════════════════════════════════════
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState("dashboard");

  const [students, setStudentsRaw] = useState(() => load("jl_students", []));
  const [exams, setExamsRaw] = useState(() => load("jl_exams", []));
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const setStudents = useCallback((v) => { setStudentsRaw(p => { const d = typeof v === "function" ? v(p) : v; save("jl_students", d); return d; }); }, []);
  const setExams = useCallback((v) => { setExamsRaw(p => { const d = typeof v === "function" ? v(p) : v; save("jl_exams", d); return d; }); }, []);

  // 선택된 학생
  const [selId, setSelId] = useState(null);
  const selStudent = students.find(s => s.id === selId) || null;

  // 수업 일지
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0,10));
  const [logCourse, setLogCourse] = useState("");
  const [logBook, setLogBook] = useState("");
  const [logContent, setLogContent] = useState("");
  const [logHW, setLogHW] = useState("");
  const [logComment, setLogComment] = useState("");
  const [logResult, setLogResult] = useState("");
  const [logCopied, setLogCopied] = useState(false);

  // 2주 공지
  const [biweekStart, setBiweekStart] = useState(new Date().toISOString().slice(0,10));
  const [biweekResult, setBiweekResult] = useState("");
  const [biweekLoading, setBiweekLoading] = useState(false);
  const [biweekCopied, setBiweekCopied] = useState(false);

  // 시험
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExam, setNewExam] = useState({ student: "", exam: "", subject: "", score: "", date: new Date().toISOString().slice(0,10) });

  const unpaid = students.filter(s => !s.paid);
  const paid = students.filter(s => s.paid);
  const filtered = students.filter(s => s.name.includes(search) || s.grade.includes(search));
  const todayDay = ["일","월","화","수","목","금","토"][new Date().getDay()];

  const togglePaid = useCallback((id) => setStudents(p => p.map(s => s.id === id ? { ...s, paid: !s.paid } : s)), [setStudents]);
  const deleteStudent = useCallback((id) => { if (window.confirm("삭제할까요?")) setStudents(p => p.filter(s => s.id !== id)); }, [setStudents]);
  const addStudent = useCallback((data) => { setStudents(p => [...p, { id: Date.now(), curriculum: [], biweekPlan: [], ...data }]); setShowAdd(false); }, [setStudents]);

  // 커리큘럼
  const addCurrStep = useCallback((sid, label, desc) => {
    setStudents(p => p.map(s => s.id === sid ? { ...s, curriculum: [...(s.curriculum||[]), { id: Date.now(), label, desc, done: false }] } : s));
  }, [setStudents]);

  const addCurrUnit = useCallback((sid, unitName, type) => {
    const books = type === "suneung" ? SUNEUNG_BOOKS
      : type === "naesin_middle" ? NAESIN_MIDDLE_BOOKS
      : type === "sunhaeng_middle" ? SUNHAENG_MIDDLE_BOOKS
      : type === "sunhaeng_high" ? SUNHAENG_HIGH_BOOKS
      : NAESIN_BOOKS;
    const newSteps = books.map((book, i) => ({ id: Date.now() + i, label: unitName, desc: book, done: false }));
    setStudents(p => p.map(s => s.id === sid ? { ...s, curriculum: [...(s.curriculum||[]), ...newSteps] } : s));
  }, [setStudents]);
  const toggleCurrStep = useCallback((sid, cid) => {
    setStudents(p => p.map(s => s.id === sid ? { ...s, curriculum: s.curriculum.map(c => c.id === cid ? { ...c, done: !c.done } : c) } : s));
  }, [setStudents]);
  const deleteCurrStep = useCallback((sid, cid) => {
    setStudents(p => p.map(s => s.id === sid ? { ...s, curriculum: s.curriculum.filter(c => c.id !== cid) } : s));
  }, [setStudents]);

  // 2주 계획
  const addPlanItem = useCallback((sid, label) => {
    setStudents(p => p.map(s => s.id === sid ? { ...s, biweekPlan: [...(s.biweekPlan||[]), { id: Date.now(), label, done: false }] } : s));
  }, [setStudents]);
  const togglePlanItem = useCallback((sid, pid) => {
    setStudents(p => p.map(s => s.id === sid ? { ...s, biweekPlan: s.biweekPlan.map(pl => pl.id === pid ? { ...pl, done: !pl.done } : pl) } : s));
  }, [setStudents]);
  const deletePlanItem = useCallback((sid, pid) => {
    setStudents(p => p.map(s => s.id === sid ? { ...s, biweekPlan: s.biweekPlan.filter(pl => pl.id !== pid) } : s));
  }, [setStudents]);

  // 수업 일지 생성
  const handleGenLog = () => {
    if (!selStudent) return;
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const dayEn = dayNames[new Date(logDate).getDay()];
    const text = `${selStudent.name}의 수업 진행 현황\n\n1. 수업날짜 :  ${logDate}-${dayEn}\n\n2. 과정 : ${logCourse}\n\n3. 교재 : ${logBook}\n\n4. 수업내용 : ${logContent}\n\n5. 과제 : ${logHW}\n\n🎈 ${logComment || "(전달 내용을 입력하세요)"}\n\n— ${ACADEMY} ${TEACHER} 선생님`;
    setLogResult(text);
  };
  const handleCopyLog = () => { navigator.clipboard.writeText(logResult); setLogCopied(true); setTimeout(() => setLogCopied(false), 2000); };

  // 2주 공지 생성 (AI)
  const handleGenBiweek = async () => {
    if (!selStudent) return;
    setBiweekLoading(true); setBiweekResult(""); setBiweekCopied(false);
    const plan = (selStudent.biweekPlan || []).map((p, i) => `${i+1}. ${p.label}`).join("\n");
    const curr = (selStudent.curriculum || []);
    const done = curr.filter(c => c.done).length;
    const pct = curr.length === 0 ? 0 : Math.round((done / curr.length) * 100);
    const prompt = `학원 선생님이 학부모에게 보내는 2주 학습 계획 공지 메시지를 작성해줘.

학원: ${ACADEMY}
선생님: ${TEACHER}
학생: ${selStudent.name} (${selStudent.grade})
기간: ${biweekStart} 부터 2주간
전체 커리큘럼 진도율: ${pct}% (${done}/${curr.length} 단계 완료)
이번 2주 목표:
${plan || "목표 미설정"}

형식:
- 인사말로 시작
- 전체 진도 현황 언급
- 이번 2주 구체적 목표 안내
- 격려 마무리
- 신뢰감 있고 전문적인 톤
- 4~6문장`;
    const result = await callClaude(prompt);
    setBiweekResult(result);
    setBiweekLoading(false);
  };
  const handleCopyBiweek = () => { navigator.clipboard.writeText(biweekResult); setBiweekCopied(true); setTimeout(() => setBiweekCopied(false), 2000); };

  const handleLogin = () => { if (pw === PASSWORD) { setLoggedIn(true); setPwErr(false); } else { setPwErr(true); setPw(""); } };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=DM+Serif+Display&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    input,textarea,select{outline:none}
    input::placeholder,textarea::placeholder{color:#4b5563}
    select option{background:#1e1e2e;color:#e8e4f0}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#18181f}::-webkit-scrollbar-thumb{background:#2a2a38;border-radius:3px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  `;

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🎓</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#e8e4f0", letterSpacing: 1 }}>JINIUS-LAB</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#818cf8", letterSpacing: 3 }}>SYSTEM</div>
          <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>{TEACHER} 선생님 전용</div>
        </div>
        <div style={{ ...card, padding: 32 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>비밀번호</div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="비밀번호 입력" autoFocus style={{ ...inp, border: `1px solid ${pwErr ? "#f87171" : "#2a2a38"}`, marginBottom: 6, fontSize: 15 }} />
          {pwErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 4 }}>비밀번호가 틀렸어요</div>}
          <button onClick={handleLogin} style={{ ...btnPurple, width: "100%", padding: "13px", fontSize: 15, borderRadius: 10, marginTop: 10 }}>로그인</button>
        </div>
      </div>
    </div>
  );

  const NAV = [
    { key: "dashboard", icon: "⊞", label: "대시보드" },
    { key: "students", icon: "👥", label: "학생 관리" },
    { key: "curriculum", icon: "🗺️", label: "커리큘럼" },
    { key: "biweek", icon: "📌", label: "2주 계획 공지" },
    { key: "dailylog", icon: "📋", label: "매일 수업 일지" },
    { key: "payment", icon: "💰", label: "수강료" },
    { key: "exams", icon: "📊", label: "시험 결과" },
  ];

  const emptyBox = (icon, text) => (
    <div style={{ ...card, textAlign: "center", padding: 48, color: "#4b5563" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );

  const ResultBox = ({ result, copied, onCopy, loading, placeholder }) => (
    <div style={{ ...card }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 18 }}>💬 완성된 메시지</div>
      {loading && <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #c084fc", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />생성 중...</div>}
      {!loading && !result && <div style={{ color: "#374151", fontSize: 14, lineHeight: 2 }}>{placeholder}</div>}
      {result && !loading && (
        <div>
          <div style={{ background: "#0f0f13", borderRadius: 10, padding: 18, border: "1px solid #2a2a38", fontSize: 14, lineHeight: 2, color: "#e8e4f0", whiteSpace: "pre-wrap", marginBottom: 14 }}>{result}</div>
          <button onClick={onCopy} style={{ width: "100%", background: copied ? "#34d39918" : "#1e1e2e", color: copied ? "#34d399" : "#9ca3af", border: `1px solid ${copied ? "#34d39944" : "#2a2a38"}`, borderRadius: 9, padding: "10px", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.2s" }}>
            {copied ? "✅ 복사됨! 카톡에 붙여넣으세요" : "📋 복사하기"}
          </button>
        </div>
      )}
    </div>
  );

  // 학생 선택 드롭다운 (공통)
  const StudentSelect = ({ value, onChange }) => (
    <select value={value || ""} onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)} style={{ ...inp, marginBottom: 20, fontSize: 15, fontWeight: 500 }}>
      <option value="">-- 학생 선택 --</option>
      {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
    </select>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", color: "#e8e4f0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "#18181f", borderRight: "1px solid #2a2a38", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid #2a2a38" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#c084fc" }}>JINIUS-LAB</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: "#818cf8", letterSpacing: 1 }}>SYSTEM</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>{TEACHER} 선생님</div>
        </div>
        <div style={{ flex: 1, paddingTop: 8 }}>
          {NAV.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 24px", border: "none", cursor: "pointer", background: tab === key ? "#1e1e2e" : "transparent", color: tab === key ? "#c084fc" : "#6b7280", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", borderLeft: tab === key ? "3px solid #c084fc" : "3px solid transparent", textAlign: "left", width: "100%", transition: "all 0.15s" }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #2a2a38" }}>
          <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 8 }}>총 학생 {students.length}명</div>
          <button onClick={() => setLoggedIn(false)} style={{ fontSize: 12, color: "#6b7280", background: "none", border: "1px solid #2a2a38", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>🔓 로그아웃</button>
        </div>
      </div>

      <div style={{ marginLeft: 220, padding: "32px 36px", minHeight: "100vh" }}>

        {/* ── 대시보드 ── */}
        {tab === "dashboard" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>대시보드</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {[{ label: "전체 학생", value: students.length, icon: "👥", color: "#818cf8" }, { label: "납부 완료", value: paid.length, icon: "✅", color: "#34d399" }, { label: "미납", value: unpaid.length, icon: "⚠️", color: "#f87171" }, { label: "오늘", value: todayDay + "요일", icon: "📅", color: "#fbbf24" }].map(({ label, value, icon, color }) => (
              <div key={label} style={{ ...card }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* 학생 카드들 */}
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#9ca3af", marginBottom: 16 }}>학생별 현황</h2>
          {students.length === 0 ? emptyBox("👥", "아직 등록된 학생이 없어요") : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {students.map(s => {
                const curr = s.curriculum || [];
                const done = curr.filter(c => c.done).length;
                const pct = curr.length === 0 ? 0 : Math.round((done / curr.length) * 100);
                const plan = s.biweekPlan || [];
                const planDone = plan.filter(p => p.done).length;
                return (
                  <div key={s.id} style={{ ...card, cursor: "pointer" }} onClick={() => { setSelId(s.id); setTab("curriculum"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{s.name}</div>
                        <span style={tag(gradeColor(s.grade))}>{s.grade}</span>
                      </div>
                      <span style={{ ...pill(s.paid), fontSize: 11 }}>{s.paid ? "완납" : "미납"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>커리큘럼 {pct}% · 2주 목표 {planDone}/{plan.length}</div>
                    <div style={{ background: "#2a2a38", borderRadius: 99, height: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#818cf8,#c084fc)", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 미납자 */}
          {unpaid.length > 0 && (
            <div style={{ ...card, marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f87171", marginBottom: 14 }}>⚠️ 미납자</div>
              {unpaid.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{s.name}</span><span style={{ ...tag(gradeColor(s.grade)), marginLeft: 8 }}>{s.grade}</span></div>
                  <button onClick={() => togglePaid(s.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "#1e1e2e", border: "1px solid #374151", color: "#9ca3af", cursor: "pointer" }}>납부 처리</button>
                </div>
              ))}
            </div>
          )}
        </>}

        {/* ── 학생 관리 ── */}
        {tab === "students" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div><h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>학생 관리</h1><p style={{ color: "#6b7280", fontSize: 14 }}>전체 {students.length}명</p></div>
            <button onClick={() => setShowAdd(true)} style={btnPurple}>+ 학생 추가</button>
          </div>
          <input placeholder="이름, 학년 검색..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, marginBottom: 14 }} />
          {students.length === 0 ? emptyBox("👥", "아직 등록된 학생이 없어요") : (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.5fr", padding: "12px 20px", background: "#1e1e2e", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                <span>이름</span><span>학년</span><span>납부</span><span></span>
              </div>
              {filtered.map(s => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.5fr", padding: "14px 20px", borderTop: "1px solid #2a2a38", alignItems: "center", fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span><span style={tag(gradeColor(s.grade))}>{s.grade}</span></span>
                  <button onClick={() => togglePaid(s.id)} style={{ ...pill(s.paid), cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", border: `1px solid ${s.paid ? "#34d39944" : "#f8717144"}` }}>{s.paid ? "완납" : "미납"}</button>
                  <button onClick={() => deleteStudent(s.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
          {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onSave={addStudent} />}
        </>}

        {/* ── 커리큘럼 ── */}
        {tab === "curriculum" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>커리큘럼 설계</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>학생별 전체 목표 단계를 설계하세요</p>
          <StudentSelect value={selId} onChange={setSelId} />
          {!selStudent ? emptyBox("🗺️", "학생을 선택해주세요") : (() => {
            const curr = selStudent.curriculum || [];
            const done = curr.filter(c => c.done).length;
            const pct = curr.length === 0 ? 0 : Math.round((done / curr.length) * 100);
            return (
              <div style={{ ...card }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>{selStudent.name}</span>
                    <span style={tag(gradeColor(selStudent.grade))}>{selStudent.grade}</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{done}/{curr.length} 완료</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: pct === 100 ? "#34d399" : "#c084fc" }}>{pct}%</span>
                </div>
                {curr.length > 0 && (
                  <div style={{ background: "#2a2a38", borderRadius: 99, height: 7, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#818cf8,#c084fc)", borderRadius: 99, transition: "width 0.4s" }} />
                  </div>
                )}
                {curr.length === 0 && <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 12 }}>아직 커리큘럼이 없어요. 아래에서 단계를 추가하세요!</div>}
                {curr.map((c, i) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #2a2a38" }}>
                    <div style={{ fontSize: 12, color: "#4b5563", width: 20, textAlign: "right", flexShrink: 0 }}>{i + 1}</div>
                    <button onClick={() => toggleCurrStep(selStudent.id, c.id)} style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${c.done ? "#34d399" : "#374151"}`, background: c.done ? "#34d399" : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#0f0f13" }}>{c.done ? "✓" : ""}</button>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, color: c.done ? "#4b5563" : "#e8e4f0", textDecoration: c.done ? "line-through" : "none" }}>{c.label}</span>
                      {c.desc && <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{c.desc}</span>}
                    </div>
                    <button onClick={() => deleteCurrStep(selStudent.id, c.id)} style={{ background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 14 }}>✕</button>
                  </div>
                ))}
                <CurriculumAddRow onAdd={(label, desc) => addCurrStep(selStudent.id, label, desc)} onAddUnit={(unitName, type) => addCurrUnit(selStudent.id, unitName, type)} />
              </div>
            );
          })()}
        </>}

        {/* ── 2주 계획 공지 ── */}
        {tab === "biweek" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>2주 계획 공지</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>2주마다 학부모께 보내는 학습 계획 안내</p>
          <StudentSelect value={selId} onChange={setSelId} />
          {!selStudent ? emptyBox("📌", "학생을 선택해주세요") : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 16 }}>📌 이번 2주 목표 설정</div>
                <Field label="시작 날짜">
                  <input type="date" value={biweekStart} onChange={e => setBiweekStart(e.target.value)} style={inp} />
                </Field>

                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, marginTop: 4 }}>이번 2주 목표</div>
                {(selStudent.biweekPlan || []).length === 0
                  ? <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 8 }}>아래에서 목표를 추가하세요</div>
                  : (selStudent.biweekPlan || []).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #2a2a38" }}>
                      <button onClick={() => togglePlanItem(selStudent.id, p.id)} style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${p.done ? "#34d399" : "#374151"}`, background: p.done ? "#34d399" : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#0f0f13" }}>{p.done ? "✓" : ""}</button>
                      <span style={{ flex: 1, fontSize: 14, color: p.done ? "#4b5563" : "#e8e4f0", textDecoration: p.done ? "line-through" : "none" }}>{p.label}</span>
                      <button onClick={() => deletePlanItem(selStudent.id, p.id)} style={{ background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 13 }}>✕</button>
                    </div>
                  ))
                }
                <PlanAddRow onAdd={(label) => addPlanItem(selStudent.id, label)} />

                <button onClick={handleGenBiweek} disabled={biweekLoading} style={{ ...btnPurple, width: "100%", padding: "12px", borderRadius: 10, marginTop: 18, fontSize: 14, opacity: biweekLoading ? 0.7 : 1 }}>
                  {biweekLoading ? "✨ 생성 중..." : "✨ AI 공지 메시지 생성"}
                </button>
              </div>
              <ResultBox result={biweekResult} copied={biweekCopied} onCopy={handleCopyBiweek} loading={biweekLoading} placeholder={"왼쪽에서 목표를 입력하고\n✨ AI 공지 메시지 생성을 눌러주세요"} />
            </div>
          )}
        </>}

        {/* ── 매일 수업 일지 ── */}
        {tab === "dailylog" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>매일 수업 일지</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>수업 후 작성 → 복사 → 카톡 전송</p>
          <StudentSelect value={selId} onChange={setSelId} />
          {!selStudent ? emptyBox("📋", "학생을 선택해주세요") : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
              <div style={{ ...card }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 16 }}>✏️ 오늘 수업 기록</div>
                <Field label="수업 날짜"><input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} style={inp} /></Field>
                <Field label="과정 (예: 중3-1)"><input placeholder="중3-1" value={logCourse} onChange={e => setLogCourse(e.target.value)} style={inp} /></Field>
                <Field label="교재"><input placeholder="개념원리" value={logBook} onChange={e => setLogBook(e.target.value)} style={inp} /></Field>
                <Field label="수업 내용">
                  <textarea placeholder="(1) 소인수분해&#10;(2) 이차방정식의 활용" value={logContent} onChange={e => setLogContent(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} />
                </Field>
                <Field label="과제">
                  <textarea placeholder="[RPM] p123~125&#10;[쎈] p111~115" value={logHW} onChange={e => setLogHW(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
                </Field>
                <Field label="🎈 전달 사항">
                  <textarea placeholder="(1) 오늘 집중도 있게 잘 수업하였습니다.&#10;(2) 내일은 시험 대비 보강입니다." value={logComment} onChange={e => setLogComment(e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} />
                </Field>
                <button onClick={handleGenLog} style={{ ...btnPurple, width: "100%", padding: "12px", borderRadius: 10, marginTop: 4, fontSize: 14 }}>
                  📋 수업 일지 생성
                </button>
              </div>
              <ResultBox result={logResult} copied={logCopied} onCopy={handleCopyLog} loading={false} placeholder={"왼쪽에서 수업 정보를 입력하고\n📋 수업 일지 생성을 눌러주세요\n\n카톡에 바로 붙여넣을 수 있어요 😊"} />
            </div>
          )}
        </>}

        {/* ── 수강료 ── */}
        {tab === "payment" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 24 }}>수강료 현황</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[{ list: paid, title: `✅ 완납 (${paid.length}명)`, color: "#34d399", action: "미납으로 변경", next: false }, { list: unpaid, title: `⚠️ 미납 (${unpaid.length}명)`, color: "#f87171", action: "납부 처리", next: true }].map(({ list, title, color, action, next }) => (
              <div key={title} style={{ ...card }}>
                <div style={{ fontSize: 14, fontWeight: 600, color, marginBottom: 16 }}>{title}</div>
                {list.length === 0 ? <div style={{ color: "#4b5563", fontSize: 13 }}>{next ? "미납자 없음 🎉" : "완납자 없음"}</div> : list.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2a2a38", alignItems: "center" }}>
                    <div><span style={{ fontWeight: 500 }}>{s.name}</span><span style={{ ...tag(gradeColor(s.grade)), marginLeft: 8 }}>{s.grade}</span></div>
                    <button onClick={() => togglePaid(s.id)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: next ? "#052e1622" : "#450a0a22", color: next ? "#34d399" : "#f87171", border: `1px solid ${next ? "#34d39944" : "#f8717144"}`, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>{action}</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>}

        {/* ── 시험 결과 ── */}
        {tab === "exams" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28 }}>시험 결과</h1>
            <button onClick={() => setShowAddExam(true)} style={btnPurple}>+ 시험 추가</button>
          </div>
          {exams.length === 0 ? emptyBox("📊", "등록된 시험 결과가 없어요") : (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 0.5fr", padding: "12px 20px", background: "#1e1e2e", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                <span>학생</span><span>시험명</span><span>과목</span><span>점수</span><span>날짜</span><span></span>
              </div>
              {exams.map(e => (
                <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr 0.5fr", padding: "14px 20px", borderTop: "1px solid #2a2a38", alignItems: "center", fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>{e.student}</span>
                  <span style={{ color: "#9ca3af" }}>{e.exam}</span>
                  <span style={tag("#818cf8")}>{e.subject}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: e.score >= 90 ? "#34d399" : e.score >= 75 ? "#fbbf24" : "#f87171" }}>{e.score}점</span>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>{e.date}</span>
                  <button onClick={() => { if (window.confirm("삭제할까요?")) setExams(p => p.filter(ex => ex.id !== e.id)); }} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
          {showAddExam && (
            <Modal title="시험 결과 추가" onClose={() => setShowAddExam(false)} onSave={() => {
              if (!newExam.student || !newExam.exam) return;
              setExams(p => [...p, { id: Date.now(), ...newExam, score: parseInt(newExam.score) || 0 }]);
              setNewExam({ student: "", exam: "", subject: "", score: "", date: new Date().toISOString().slice(0,10) });
              setShowAddExam(false);
            }}>
              <Field label="학생">
                <select value={newExam.student} onChange={e => setNewExam({ ...newExam, student: e.target.value })} style={inp}>
                  <option value="">-- 선택 --</option>
                  {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.grade})</option>)}
                </select>
              </Field>
              <Field label="시험명"><input placeholder="1학기 중간고사" value={newExam.exam} onChange={e => setNewExam({ ...newExam, exam: e.target.value })} style={inp} /></Field>
              <Field label="과목"><input placeholder="영어, 수학..." value={newExam.subject} onChange={e => setNewExam({ ...newExam, subject: e.target.value })} style={inp} /></Field>
              <Field label="점수"><input type="number" placeholder="88" value={newExam.score} onChange={e => setNewExam({ ...newExam, score: e.target.value })} style={inp} /></Field>
              <Field label="날짜"><input type="date" value={newExam.date} onChange={e => setNewExam({ ...newExam, date: e.target.value })} style={inp} /></Field>
            </Modal>
          )}
        </>}

      </div>
    </div>
  );
}
