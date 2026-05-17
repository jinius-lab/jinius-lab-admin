import { useState, useCallback, memo } from "react";

const PASSWORD = "1234";

const GRADES = ["초1","초2","초3","초4","초5","초6","중1","중2","중3","고1","고2","고3","N수"];
const DAYS = ["월","화","수","목","금","토"];
const CURRICULUM_STEPS = [
  { step: 1, label: "기초 문법", desc: "품사·문장구조 기초" },
  { step: 2, label: "독해 입문", desc: "짧은 지문 독해" },
  { step: 3, label: "문법 심화", desc: "준동사·관계사 완성" },
  { step: 4, label: "독해 심화", desc: "수능형 지문 적용" },
  { step: 5, label: "실전 모의고사", desc: "시험 전략·시간 배분" },
  { step: 6, label: "최종 마무리", desc: "오답 분석·약점 보완" },
];
const MSG_TEMPLATES = [
  { label: "📅 수업 안내", key: "class" },
  { label: "📝 과제 미제출", key: "homework" },
  { label: "📊 시험 결과", key: "exam" },
  { label: "💰 수강료 안내", key: "payment" },
  { label: "🗺️ 진도 보고", key: "progress" },
];

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
let saveTimers = {};
const save = (key, val) => {
  clearTimeout(saveTimers[key]);
  saveTimers[key] = setTimeout(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, 500);
};

async function generateMessage(student, templateKey, extra) {
  const prompts = {
    class: `학원 선생님이 학부모에게 보내는 이번 주 수업 안내 문자를 작성해줘. 학생: ${student.name}(${student.grade}). 따뜻하고 전문적인 톤, 3~4문장. 추가: ${extra || "없음"}`,
    homework: `학원 선생님이 학부모에게 보내는 과제 미제출 안내 문자를 작성해줘. 학생: ${student.name}(${student.grade}). 부드럽지만 명확하게, 3~4문장. 추가: ${extra || "없음"}`,
    exam: `학원 선생님이 학부모에게 보내는 시험 결과 안내 문자를 작성해줘. 학생: ${student.name}(${student.grade}). 격려와 향후 학습 방향 언급, 4~5문장. 추가: ${extra || "없음"}`,
    payment: `학원 선생님이 학부모에게 보내는 수강료 안내 문자를 작성해줘. 학생: ${student.name}(${student.grade}). 정중하고 간결하게, 2~3문장. 추가: ${extra || "없음"}`,
    progress: `학원 선생님이 학부모에게 보내는 진도 보고 문자를 작성해줘. 학생: ${student.name}(${student.grade}), 현재 단계: ${CURRICULUM_STEPS[(student.curriculumStep||1) - 1]?.label}. 신뢰감 있게, 4~5문장. 추가: ${extra || "없음"}`,
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompts[templateKey] }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "메시지 생성 실패";
}

// ── 스타일 상수 ──
const card = { background: "#18181f", borderRadius: 14, border: "1px solid #2a2a38", padding: 22 };
const tag = (color) => ({ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: color + "22", color });
const pill = (ok) => ({ fontSize: 11, padding: "3px 12px", borderRadius: 99, display: "inline-block", background: ok ? "#052e1622" : "#450a0a22", color: ok ? "#34d399" : "#f87171", border: `1px solid ${ok ? "#34d39944" : "#f8717144"}` });
const inp = { width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid #2a2a38", background: "#0f0f13", color: "#e8e4f0", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", boxSizing: "border-box", outline: "none" };

const gradeColor = (g) => {
  if (!g) return "#94a3b8";
  if (g.startsWith("초")) return "#34d399";
  if (g.startsWith("중")) return "#f97316";
  if (g.startsWith("고")) return "#818cf8";
  return "#c084fc";
};

// ── 모달 (App 밖에 정의 → 리렌더 없음) ──
const Modal = memo(({ title, onClose, onSave, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
    <div style={{ ...card, width: 400, padding: 32 }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 20, color: "#e8e4f0" }}>{title}</h2>
      {children}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button onClick={onSave} style={{ flex: 1, background: "#c084fc", color: "#0f0f13", border: "none", borderRadius: 9, padding: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>추가</button>
        <button onClick={onClose} style={{ flex: 1, background: "#1e1e2e", color: "#9ca3af", border: "1px solid #2a2a38", borderRadius: 9, padding: "11px", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
      </div>
    </div>
  </div>
));

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 5 }}>{label}</div>
    {children}
  </div>
);

// ── 학생 추가 폼 (분리된 컴포넌트) ──
const AddStudentModal = memo(({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("중1");
  const [paid, setPaid] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), grade, paid, curriculumStep: 1 });
  };

  return (
    <Modal title="학생 추가" onClose={onClose} onSave={handleSave}>
      <Field label="이름">
        <input
          placeholder="홍길동"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          autoFocus
          style={inp}
        />
      </Field>
      <Field label="학년">
        <select value={grade} onChange={e => setGrade(e.target.value)} style={inp}>
          <optgroup label="초등">
            {["초1","초2","초3","초4","초5","초6"].map(g => <option key={g} value={g}>{g}</option>)}
          </optgroup>
          <optgroup label="중학교">
            {["중1","중2","중3"].map(g => <option key={g} value={g}>{g}</option>)}
          </optgroup>
          <optgroup label="고등학교">
            {["고1","고2","고3"].map(g => <option key={g} value={g}>{g}</option>)}
          </optgroup>
          <optgroup label="기타">
            <option value="N수">N수</option>
          </optgroup>
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

// ── 수업 추가 폼 ──
const AddLessonModal = memo(({ students, onClose, onSave }) => {
  const [day, setDay] = useState("월");
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [time, setTime] = useState("");

  const handleSave = () => {
    if (!studentName || !course) return;
    onSave({ day, student: studentName, course, time });
  };

  return (
    <Modal title="수업 추가" onClose={onClose} onSave={handleSave}>
      <Field label="요일">
        <select value={day} onChange={e => setDay(e.target.value)} style={inp}>
          {DAYS.map(d => <option key={d} value={d}>{d}요일</option>)}
        </select>
      </Field>
      <Field label="학생">
        <select value={studentName} onChange={e => setStudentName(e.target.value)} style={inp}>
          <option value="">-- 선택 --</option>
          {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.grade})</option>)}
        </select>
      </Field>
      <Field label="과목"><input placeholder="코어그래머" value={course} onChange={e => setCourse(e.target.value)} style={inp} /></Field>
      <Field label="시간"><input placeholder="15:00" value={time} onChange={e => setTime(e.target.value)} style={inp} /></Field>
    </Modal>
  );
});

// ── 과제 추가 폼 ──
const AddHWModal = memo(({ students, onClose, onSave }) => {
  const [studentName, setStudentName] = useState("");
  const [task, setTask] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSave = () => {
    if (!studentName || !task) return;
    onSave({ student: studentName, task, submitted: false, date });
  };

  return (
    <Modal title="과제 추가" onClose={onClose} onSave={handleSave}>
      <Field label="학생">
        <select value={studentName} onChange={e => setStudentName(e.target.value)} style={inp}>
          <option value="">-- 선택 --</option>
          {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.grade})</option>)}
        </select>
      </Field>
      <Field label="과제명"><input placeholder="코어그래머 Unit 3" value={task} onChange={e => setTask(e.target.value)} style={inp} /></Field>
      <Field label="날짜"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></Field>
    </Modal>
  );
});

// ── 시험 추가 폼 ──
const AddExamModal = memo(({ students, onClose, onSave }) => {
  const [studentName, setStudentName] = useState("");
  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSave = () => {
    if (!studentName || !exam) return;
    onSave({ student: studentName, exam, subject, score: parseInt(score) || 0, date });
  };

  return (
    <Modal title="시험 결과 추가" onClose={onClose} onSave={handleSave}>
      <Field label="학생">
        <select value={studentName} onChange={e => setStudentName(e.target.value)} style={inp}>
          <option value="">-- 선택 --</option>
          {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.grade})</option>)}
        </select>
      </Field>
      <Field label="시험명"><input placeholder="1학기 중간고사" value={exam} onChange={e => setExam(e.target.value)} style={inp} /></Field>
      <Field label="과목"><input placeholder="영어, 수학..." value={subject} onChange={e => setSubject(e.target.value)} style={inp} /></Field>
      <Field label="점수"><input type="number" placeholder="88" value={score} onChange={e => setScore(e.target.value)} style={inp} /></Field>
      <Field label="날짜"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} /></Field>
    </Modal>
  );
});

// ══════════════════════════════════════
// 메인 앱
// ══════════════════════════════════════
// ── 커리큘럼 단계 추가 행 (분리 컴포넌트 → 버벅임 없음) ──
const CurriculumAddRow = memo(({ studentId, onAdd }) => {
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd(label.trim(), desc.trim());
    setLabel(""); setDesc("");
  };
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input placeholder="단계 이름 (예: 준동사 완성)" value={label} onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
        style={{ flex: 2, padding: "8px 12px", borderRadius: 8, border: "1px solid #2a2a38", background: "#0f0f13", color: "#e8e4f0", fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", outline: "none" }} />
      <input placeholder="설명 (선택)" value={desc} onChange={e => setDesc(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()}
        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #2a2a38", background: "#0f0f13", color: "#e8e4f0", fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", outline: "none" }} />
      <button onClick={handleAdd} style={{ padding: "8px 16px", borderRadius: 8, background: "#c084fc", border: "none", color: "#0f0f13", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ 추가</button>
    </div>
  );
});

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState("dashboard");

  const [students, setStudentsRaw] = useState(() => load("jl_students", []));
  const [lessons, setLessonsRaw] = useState(() => load("jl_lessons", []));
  const [homework, setHomeworkRaw] = useState(() => load("jl_homework", []));
  const [exams, setExamsRaw] = useState(() => load("jl_exams", []));

  const setStudents = useCallback((v) => { setStudentsRaw(p => { const d = typeof v === "function" ? v(p) : v; save("jl_students", d); return d; }); }, []);
  const setLessons = useCallback((v) => { setLessonsRaw(p => { const d = typeof v === "function" ? v(p) : v; save("jl_lessons", d); return d; }); }, []);
  const setHomework = useCallback((v) => { setHomeworkRaw(p => { const d = typeof v === "function" ? v(p) : v; save("jl_homework", d); return d; }); }, []);
  const setExams = useCallback((v) => { setExamsRaw(p => { const d = typeof v === "function" ? v(p) : v; save("jl_exams", d); return d; }); }, []);

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddHW, setShowAddHW] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);

  const [msgStudent, setMsgStudent] = useState("");
  const [msgTemplate, setMsgTemplate] = useState("class");
  const [msgExtra, setMsgExtra] = useState("");
  const [msgResult, setMsgResult] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const unpaid = students.filter(s => !s.paid);
  const paid = students.filter(s => s.paid);
  const todayDay = ["일","월","화","수","목","금","토"][new Date().getDay()];
  const todayLessons = lessons.filter(l => l.day === todayDay);
  const filtered = students.filter(s => s.name.includes(search) || s.grade.includes(search));

  const togglePaid = useCallback((id) => setStudents(p => p.map(s => s.id === id ? { ...s, paid: !s.paid } : s)), [setStudents]);
  const deleteStudent = useCallback((id) => { if (window.confirm("삭제할까요?")) setStudents(p => p.filter(s => s.id !== id)); }, [setStudents]);
  const deleteLesson = useCallback((id) => { if (window.confirm("삭제할까요?")) setLessons(p => p.filter(l => l.id !== id)); }, [setLessons]);
  const deleteHW = useCallback((id) => { if (window.confirm("삭제할까요?")) setHomework(p => p.filter(h => h.id !== id)); }, [setHomework]);
  const deleteExam = useCallback((id) => { if (window.confirm("삭제할까요?")) setExams(p => p.filter(e => e.id !== id)); }, [setExams]);
  const toggleHW = useCallback((id) => setHomework(p => p.map(h => h.id === id ? { ...h, submitted: !h.submitted } : h)), [setHomework]);
  const updateCurriculum = useCallback((id, step) => setStudents(p => p.map(s => s.id === id ? { ...s, curriculumStep: step } : s)), [setStudents]);

  const addStudent = useCallback((data) => { setStudents(p => [...p, { id: Date.now(), ...data }]); setShowAdd(false); }, [setStudents]);
  const addLesson = useCallback((data) => { setLessons(p => [...p, { id: Date.now(), ...data }]); setShowAddLesson(false); }, [setLessons]);
  const addHW = useCallback((data) => { setHomework(p => [...p, { id: Date.now(), ...data }]); setShowAddHW(false); }, [setHomework]);
  const addExam = useCallback((data) => { setExams(p => [...p, { id: Date.now(), ...data }]); setShowAddExam(false); }, [setExams]);

  const handleLogin = () => { if (pw === PASSWORD) { setLoggedIn(true); setPwErr(false); } else { setPwErr(true); setPw(""); } };
  const handleGen = async () => {
    if (!msgStudent) return;
    setMsgLoading(true); setMsgResult(""); setCopied(false);
    const student = students.find(s => s.id === parseInt(msgStudent));
    setMsgResult(await generateMessage(student, msgTemplate, msgExtra));
    setMsgLoading(false);
  };
  const handleCopy = () => { navigator.clipboard.writeText(msgResult); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=DM+Serif+Display&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    input,textarea,select{outline:none}
    input::placeholder,textarea::placeholder{color:#4b5563}
    select option{background:#1e1e2e;color:#e8e4f0}
    select optgroup{color:#6b7280}
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
          <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>선생님 전용 대시보드</div>
        </div>
        <div style={{ ...card, padding: 32 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>비밀번호</div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="비밀번호 입력" autoFocus
            style={{ ...inp, border: `1px solid ${pwErr ? "#f87171" : "#2a2a38"}`, marginBottom: 6, fontSize: 15 }} />
          {pwErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 4 }}>비밀번호가 틀렸어요</div>}
          <button onClick={handleLogin} style={{ width: "100%", background: "#c084fc", color: "#0f0f13", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", marginTop: 10 }}>로그인</button>
        </div>
      </div>
    </div>
  );

  const NAV = [
    { key: "dashboard", icon: "⊞", label: "대시보드" },
    { key: "students", icon: "👥", label: "학생 관리" },
    { key: "lessons", icon: "📅", label: "수업 일정" },
    { key: "curriculum", icon: "🗺️", label: "커리큘럼" },
    { key: "payment", icon: "💰", label: "수강료" },
    { key: "homework", icon: "📝", label: "과제 현황" },
    { key: "exams", icon: "📊", label: "시험 결과" },
    { key: "message", icon: "💬", label: "학부모 메시지" },
  ];

  const btnAdd = { background: "#c084fc", color: "#0f0f13", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" };
  const emptyBox = (icon, text) => (
    <div style={{ ...card, textAlign: "center", padding: 48, color: "#4b5563" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div>{text}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", color: "#e8e4f0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "#18181f", borderRight: "1px solid #2a2a38", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid #2a2a38" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#c084fc" }}>JINIUS-LAB</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: "#818cf8", letterSpacing: 1 }}>SYSTEM</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>선생님 전용</div>
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

        {/* 대시보드 */}
        {tab === "dashboard" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>대시보드</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {[{ label: "전체 학생", value: students.length, icon: "👥", color: "#818cf8" }, { label: "납부 완료", value: paid.length, icon: "✅", color: "#34d399" }, { label: "미납", value: unpaid.length, icon: "⚠️", color: "#f87171" }, { label: "오늘 수업", value: todayLessons.length, icon: "📚", color: "#fbbf24" }].map(({ label, value, icon, color }) => (
              <div key={label} style={{ ...card }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f87171", marginBottom: 14 }}>⚠️ 미납자</div>
              {unpaid.length === 0 ? <div style={{ color: "#4b5563", fontSize: 13 }}>미납자 없음 🎉</div> : unpaid.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{s.name}</span><span style={{ ...tag(gradeColor(s.grade)), marginLeft: 8 }}>{s.grade}</span></div>
                  <button onClick={() => togglePaid(s.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "#1e1e2e", border: "1px solid #374151", color: "#9ca3af", cursor: "pointer" }}>납부 처리</button>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fbbf24", marginBottom: 14 }}>📅 오늘 수업 ({todayDay})</div>
              {todayLessons.length === 0 ? <div style={{ color: "#4b5563", fontSize: 13 }}>오늘 수업 없음</div> : todayLessons.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{l.student}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#818cf8" }}>{l.course}</span></div>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{l.time}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 14 }}>📝 최근 과제</div>
              {homework.length === 0 ? <div style={{ color: "#4b5563", fontSize: 13 }}>등록된 과제 없음</div> : [...homework].reverse().slice(0, 4).map(h => (
                <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{h.student}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>{h.task}</span></div>
                  <span style={pill(h.submitted)}>{h.submitted ? "제출" : "미제출"}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#34d399", marginBottom: 14 }}>📊 최근 시험</div>
              {exams.length === 0 ? <div style={{ color: "#4b5563", fontSize: 13 }}>등록된 시험 없음</div> : [...exams].reverse().slice(0, 4).map(e => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{e.student}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>{e.exam}</span></div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: e.score >= 90 ? "#34d399" : e.score >= 75 ? "#fbbf24" : "#f87171" }}>{e.score}점</span>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* 학생 관리 */}
        {tab === "students" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div><h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>학생 관리</h1><p style={{ color: "#6b7280", fontSize: 14 }}>전체 {students.length}명</p></div>
            <button onClick={() => setShowAdd(true)} style={btnAdd}>+ 학생 추가</button>
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

        {/* 수업 일정 */}
        {tab === "lessons" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28 }}>수업 일정</h1>
            <button onClick={() => setShowAddLesson(true)} style={btnAdd}>+ 수업 추가</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
            {DAYS.map(day => (
              <div key={day} style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div style={{ background: "#1e1e2e", padding: "10px 14px", fontSize: 13, fontWeight: 700, color: day === todayDay ? "#fbbf24" : "#c084fc", textAlign: "center" }}>{day}요일</div>
                {lessons.filter(l => l.day === day).map(l => (
                  <div key={l.id} style={{ padding: "12px 14px", borderTop: "1px solid #2a2a38", position: "relative" }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{l.student}</div>
                    <div style={{ fontSize: 12, color: "#818cf8", marginTop: 2 }}>{l.course}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{l.time}</div>
                    <button onClick={() => deleteLesson(l.id)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 13 }}>✕</button>
                  </div>
                ))}
                {lessons.filter(l => l.day === day).length === 0 && <div style={{ padding: "16px 14px", fontSize: 12, color: "#374151", textAlign: "center" }}>수업 없음</div>}
              </div>
            ))}
          </div>
          {showAddLesson && <AddLessonModal students={students} onClose={() => setShowAddLesson(false)} onSave={addLesson} />}
        </>}

        {/* 커리큘럼 */}
        {tab === "curriculum" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>커리큘럼</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>학생별로 커리큘럼 단계를 직접 추가하고 관리해요</p>
          {students.length === 0 ? emptyBox("🗺️", "학생을 먼저 등록해주세요") : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {students.map(s => {
                const steps = s.curriculum || [];
                const done = steps.filter(c => c.done).length;
                const pct = steps.length === 0 ? 0 : Math.round((done / steps.length) * 100);
                return (
                  <div key={s.id} style={{ ...card }}>
                    {/* 헤더 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</span>
                        <span style={tag(gradeColor(s.grade))}>{s.grade}</span>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{done}/{steps.length} 완료</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "#34d399" : "#c084fc" }}>{pct}%</span>
                    </div>

                    {/* 프로그레스 바 */}
                    {steps.length > 0 && (
                      <div style={{ background: "#2a2a38", borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 14 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#818cf8,#c084fc)", borderRadius: 99, transition: "width 0.4s" }} />
                      </div>
                    )}

                    {/* 단계 목록 */}
                    {steps.length === 0
                      ? <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 14 }}>아직 커리큘럼이 없어요. 아래에서 추가해보세요!</div>
                      : steps.map((c, i) => (
                        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #2a2a38" }}>
                          <button onClick={() => {
                            const updated = steps.map((x, xi) => xi === i ? { ...x, done: !x.done } : x);
                            setStudents(p => p.map(st => st.id === s.id ? { ...st, curriculum: updated } : st));
                          }} style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${c.done ? "#34d399" : "#374151"}`, background: c.done ? "#34d399" : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#0f0f13" }}>
                            {c.done ? "✓" : ""}
                          </button>
                          <span style={{ flex: 1, fontSize: 14, color: c.done ? "#4b5563" : "#e8e4f0", textDecoration: c.done ? "line-through" : "none" }}>{c.label}</span>
                          {c.desc && <span style={{ fontSize: 11, color: "#6b7280" }}>{c.desc}</span>}
                          <button onClick={() => {
                            if (!window.confirm("삭제할까요?")) return;
                            const updated = steps.filter((_, xi) => xi !== i);
                            setStudents(p => p.map(st => st.id === s.id ? { ...st, curriculum: updated } : st));
                          }} style={{ background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 13 }}>✕</button>
                        </div>
                      ))
                    }

                    {/* 단계 추가 인라인 */}
                    <CurriculumAddRow studentId={s.id} onAdd={(label, desc) => {
                      const updated = [...steps, { id: Date.now(), label, desc, done: false }];
                      setStudents(p => p.map(st => st.id === s.id ? { ...st, curriculum: updated } : st));
                    }} />
                  </div>
                );
              })}
            </div>
          )}
        </>}

        {/* 수강료 */}
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

        {/* 과제 */}
        {tab === "homework" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28 }}>과제 현황</h1>
            <button onClick={() => setShowAddHW(true)} style={btnAdd}>+ 과제 추가</button>
          </div>
          {homework.length === 0 ? emptyBox("📝", "등록된 과제가 없어요") : (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 0.5fr", padding: "12px 20px", background: "#1e1e2e", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                <span>학생</span><span>과제</span><span>날짜</span><span>제출여부</span><span></span>
              </div>
              {homework.map(h => (
                <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 0.5fr", padding: "14px 20px", borderTop: "1px solid #2a2a38", alignItems: "center", fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>{h.student}</span>
                  <span style={{ color: "#9ca3af" }}>{h.task}</span>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>{h.date}</span>
                  <button onClick={() => toggleHW(h.id)} style={{ ...pill(h.submitted), cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", border: `1px solid ${h.submitted ? "#34d39944" : "#f8717144"}` }}>{h.submitted ? "제출완료" : "미제출"}</button>
                  <button onClick={() => deleteHW(h.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
          {showAddHW && <AddHWModal students={students} onClose={() => setShowAddHW(false)} onSave={addHW} />}
        </>}

        {/* 시험 */}
        {tab === "exams" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28 }}>시험 결과</h1>
            <button onClick={() => setShowAddExam(true)} style={btnAdd}>+ 시험 추가</button>
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
                  <span style={{ ...tag("#818cf8") }}>{e.subject}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: e.score >= 90 ? "#34d399" : e.score >= 75 ? "#fbbf24" : "#f87171" }}>{e.score}점</span>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>{e.date}</span>
                  <button onClick={() => deleteExam(e.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
          {showAddExam && <AddExamModal students={students} onClose={() => setShowAddExam(false)} onSave={addExam} />}
        </>}

        {/* 학부모 메시지 */}
        {tab === "message" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>학부모 메시지</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>AI가 학부모께 보낼 문자를 자동으로 작성해드려요</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
            <div style={{ ...card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 18 }}>✏️ 메시지 설정</div>
              <Field label="학생 선택">
                <select value={msgStudent} onChange={e => setMsgStudent(e.target.value)} style={inp}>
                  <option value="">-- 학생 선택 --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                </select>
              </Field>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>메시지 유형</div>
                {MSG_TEMPLATES.map(t => (
                  <button key={t.key} onClick={() => setMsgTemplate(t.key)} style={{ display: "block", width: "100%", padding: "9px 14px", borderRadius: 9, border: `1px solid ${msgTemplate === t.key ? "#c084fc" : "#2a2a38"}`, background: msgTemplate === t.key ? "#c084fc18" : "transparent", color: msgTemplate === t.key ? "#c084fc" : "#9ca3af", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 6 }}>{t.label}</button>
                ))}
              </div>
              <Field label="추가 정보 (선택)">
                <textarea value={msgExtra} onChange={e => setMsgExtra(e.target.value)} placeholder="예: 이번 주 시험 88점, 수업 태도 좋음..." rows={3} style={{ ...inp, resize: "vertical" }} />
              </Field>
              <button onClick={handleGen} disabled={!msgStudent || msgLoading} style={{ width: "100%", background: msgStudent ? "#c084fc" : "#2a2a38", color: msgStudent ? "#0f0f13" : "#4b5563", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: msgStudent ? "pointer" : "not-allowed", fontFamily: "'Noto Sans KR', sans-serif", marginTop: 4 }}>
                {msgLoading ? "✨ 생성 중..." : "✨ 메시지 생성"}
              </button>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 18 }}>💬 생성된 메시지</div>
              {msgLoading && <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #c084fc", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />AI가 메시지를 작성하고 있어요...</div>}
              {!msgLoading && !msgResult && <div style={{ color: "#374151", fontSize: 14, lineHeight: 2 }}>왼쪽에서 학생과 유형을 선택하고<br /><span style={{ color: "#c084fc" }}>✨ 메시지 생성</span> 버튼을 누르면<br />AI가 자동으로 문자를 작성해드려요.</div>}
              {msgResult && !msgLoading && (
                <div>
                  <div style={{ background: "#0f0f13", borderRadius: 10, padding: 18, border: "1px solid #2a2a38", fontSize: 14, lineHeight: 1.9, color: "#e8e4f0", whiteSpace: "pre-wrap", marginBottom: 14, minHeight: 100 }}>{msgResult}</div>
                  <button onClick={handleCopy} style={{ width: "100%", background: copied ? "#34d39918" : "#1e1e2e", color: copied ? "#34d399" : "#9ca3af", border: `1px solid ${copied ? "#34d39944" : "#2a2a38"}`, borderRadius: 9, padding: "10px", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", transition: "all 0.2s" }}>
                    {copied ? "✅ 복사됨!" : "📋 복사하기"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>}

      </div>
    </div>
  );
}
