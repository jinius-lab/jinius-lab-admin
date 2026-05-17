import { useState } from "react";

const PASSWORD = "1234";

const initialStudents = [
  { id: 1, name: "김민준", school: "홀로중", grade: "중2", paid: true, courses: ["코어그래머", "해석의 법칙"], curriculumStep: 3 },
  { id: 2, name: "이서연", school: "위드고", grade: "고1", paid: true, courses: ["코어그래머"], curriculumStep: 5 },
  { id: 3, name: "박지호", school: "홀로고", grade: "고2", paid: false, courses: ["해석의 법칙", "쎈"], curriculumStep: 2 },
  { id: 4, name: "최아린", school: "위드초", grade: "초6", paid: true, courses: ["코어그래머"], curriculumStep: 1 },
  { id: 5, name: "정우진", school: "홀로중", grade: "중3", paid: false, courses: ["쎈"], curriculumStep: 4 },
  { id: 6, name: "한소율", school: "위드고", grade: "고3", paid: true, courses: ["해석의 법칙"], curriculumStep: 6 },
];

const initialLessons = [
  { id: 1, day: "월", student: "김민준", course: "코어그래머", time: "15:00" },
  { id: 2, day: "월", student: "이서연", course: "코어그래머", time: "16:00" },
  { id: 3, day: "화", student: "박지호", course: "해석의 법칙", time: "15:00" },
  { id: 4, day: "수", student: "최아린", course: "코어그래머", time: "14:00" },
  { id: 5, day: "목", student: "정우진", course: "쎈", time: "17:00" },
  { id: 6, day: "금", student: "한소율", course: "해석의 법칙", time: "16:00" },
];

const initialHomework = [
  { id: 1, student: "김민준", task: "코어그래머 Unit 3", submitted: true, date: "2026-05-15" },
  { id: 2, student: "이서연", task: "코어그래머 Unit 3", submitted: true, date: "2026-05-15" },
  { id: 3, student: "박지호", task: "해석의 법칙 Ch.2", submitted: false, date: "2026-05-15" },
  { id: 4, student: "최아린", task: "코어그래머 Unit 2", submitted: true, date: "2026-05-14" },
  { id: 5, student: "정우진", task: "쎈 수학 연습문제", submitted: false, date: "2026-05-14" },
];

const initialExams = [
  { id: 1, student: "김민준", exam: "1학기 중간고사", subject: "영어", score: 88, date: "2026-05-01" },
  { id: 2, student: "이서연", exam: "3월 모의고사", subject: "사회", score: 92, date: "2026-03-20" },
  { id: 3, student: "박지호", exam: "1학기 중간고사", subject: "수학", score: 75, date: "2026-05-01" },
  { id: 4, student: "한소율", exam: "3월 모의고사", subject: "영어", score: 95, date: "2026-03-20" },
];

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

const DAYS = ["월", "화", "수", "목", "금", "토"];
const SCHOOL_COLORS = {
  "홀로중": "#f97316", "홀로고": "#f97316",
  "위드중": "#a78bfa", "위드고": "#a78bfa", "위드초": "#a78bfa",
};
const sc = (s) => SCHOOL_COLORS[s] || "#94a3b8";

async function generateMessage(student, templateKey, extra) {
  const prompts = {
    class: `학원 선생님이 학부모에게 보내는 이번 주 수업 안내 문자 메시지를 작성해줘. 학생: ${student.name}(${student.grade}), 수강과목: ${student.courses.join(", ")}. 따뜻하고 전문적인 톤, 3~4문장. 추가: ${extra || "없음"}`,
    homework: `학원 선생님이 학부모에게 보내는 과제 미제출 안내 문자를 작성해줘. 학생: ${student.name}(${student.grade}). 부드럽지만 명확하게, 3~4문장. 추가: ${extra || "없음"}`,
    exam: `학원 선생님이 학부모에게 보내는 시험 결과 안내 문자를 작성해줘. 학생: ${student.name}(${student.grade}). 격려와 향후 학습 방향 언급, 4~5문장. 추가: ${extra || "없음"}`,
    payment: `학원 선생님이 학부모에게 보내는 수강료 안내 문자를 작성해줘. 학생: ${student.name}(${student.grade}). 정중하고 간결하게, 2~3문장. 추가: ${extra || "없음"}`,
    progress: `학원 선생님이 학부모에게 보내는 진도 보고 문자를 작성해줘. 학생: ${student.name}(${student.grade}), 현재 단계: ${CURRICULUM_STEPS[student.curriculumStep - 1]?.label}. 신뢰감 있게, 4~5문장. 추가: ${extra || "없음"}`,
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompts[templateKey] }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "메시지 생성 실패";
}

const S = {
  card: { background: "#18181f", borderRadius: 14, border: "1px solid #2a2a38", padding: 22 },
  tag: (color) => ({ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: color + "22", color }),
  pill: (ok) => ({ fontSize: 11, padding: "3px 12px", borderRadius: 99, display: "inline-block", width: "fit-content", background: ok ? "#052e1622" : "#450a0a22", color: ok ? "#34d399" : "#f87171", border: `1px solid ${ok ? "#34d39944" : "#f8717144"}` }),
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newS, setNewS] = useState({ name: "", school: "", grade: "", courses: "" });

  const [msgStudent, setMsgStudent] = useState("");
  const [msgTemplate, setMsgTemplate] = useState("class");
  const [msgExtra, setMsgExtra] = useState("");
  const [msgResult, setMsgResult] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const unpaid = students.filter(s => !s.paid);
  const paid = students.filter(s => s.paid);
  const todayLessons = initialLessons.filter(l => l.day === "월");
  const filtered = students.filter(s => s.name.includes(search) || s.school.includes(search) || s.grade.includes(search));

  const togglePaid = (id) => setStudents(students.map(s => s.id === id ? { ...s, paid: !s.paid } : s));
  const addStudent = () => {
    if (!newS.name) return;
    setStudents([...students, { id: Date.now(), ...newS, courses: newS.courses.split(",").map(c => c.trim()).filter(Boolean), paid: false, curriculumStep: 1 }]);
    setNewS({ name: "", school: "", grade: "", courses: "" }); setShowAdd(false);
  };
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
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#18181f}::-webkit-scrollbar-thumb{background:#2a2a38;border-radius:3px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  `;

  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ width: 360, animation: "fadein 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🎓</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#e8e4f0", letterSpacing: 1 }}>JINIUS-LAB</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#818cf8", letterSpacing: 3 }}>SYSTEM</div>
          <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>선생님 전용 대시보드</div>
        </div>
        <div style={{ ...S.card, padding: 32 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>비밀번호</div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="비밀번호 입력" autoFocus
            style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: `1px solid ${pwErr ? "#f87171" : "#2a2a38"}`, background: "#0f0f13", color: "#e8e4f0", fontSize: 15, fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 6 }} />
          {pwErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 6 }}>비밀번호가 틀렸어요</div>}
          <button onClick={handleLogin} style={{ width: "100%", background: "#c084fc", color: "#0f0f13", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", marginTop: 10 }}>로그인</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#374151", marginTop: 16 }}>기본 비밀번호: 1234 · 코드 상단에서 변경 가능</div>
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

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", color: "#e8e4f0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "#18181f", borderRight: "1px solid #2a2a38", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid #2a2a38" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#c084fc", letterSpacing: 0.5 }}>JINIUS-LAB</div>
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

      <div style={{ marginLeft: 220, padding: "32px 36px", minHeight: "100vh", animation: "fadein 0.3s ease" }}>

        {/* ── 대시보드 ── */}
        {tab === "dashboard" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>대시보드</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>2026년 5월 17일 일요일</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {[{ label: "전체 학생", value: students.length, icon: "👥", color: "#818cf8" }, { label: "납부 완료", value: paid.length, icon: "✅", color: "#34d399" }, { label: "미납", value: unpaid.length, icon: "⚠️", color: "#f87171" }, { label: "내일 수업", value: todayLessons.length, icon: "📚", color: "#fbbf24" }].map(({ label, value, icon, color }) => (
              <div key={label} style={{ ...S.card }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ ...S.card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f87171", marginBottom: 14 }}>⚠️ 미납자</div>
              {unpaid.length === 0 ? <div style={{ color: "#4b5563", fontSize: 13 }}>미납자 없음 🎉</div> : unpaid.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{s.name}</span><span style={{ ...S.tag(sc(s.school)), marginLeft: 8 }}>{s.school}</span></div>
                  <button onClick={() => togglePaid(s.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "#1e1e2e", border: "1px solid #374151", color: "#9ca3af", cursor: "pointer" }}>납부 처리</button>
                </div>
              ))}
            </div>
            <div style={{ ...S.card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fbbf24", marginBottom: 14 }}>📅 내일 수업 (월)</div>
              {todayLessons.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{l.student}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#818cf8" }}>{l.course}</span></div>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{l.time}</span>
                </div>
              ))}
            </div>
            <div style={{ ...S.card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 14 }}>📝 최근 과제</div>
              {initialHomework.slice(0, 4).map(h => (
                <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{h.student}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>{h.task}</span></div>
                  <span style={S.pill(h.submitted)}>{h.submitted ? "제출" : "미제출"}</span>
                </div>
              ))}
            </div>
            <div style={{ ...S.card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#34d399", marginBottom: 14 }}>📊 최근 시험</div>
              {initialExams.map(e => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #2a2a38" }}>
                  <div><span style={{ fontWeight: 500 }}>{e.student}</span><span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>{e.exam}</span></div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: e.score >= 90 ? "#34d399" : e.score >= 75 ? "#fbbf24" : "#f87171" }}>{e.score}점</span>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ── 학생 관리 ── */}
        {tab === "students" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div><h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>학생 관리</h1><p style={{ color: "#6b7280", fontSize: 14 }}>전체 {students.length}명</p></div>
            <button onClick={() => setShowAdd(true)} style={{ background: "#c084fc", color: "#0f0f13", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>+ 학생 추가</button>
          </div>
          <input placeholder="이름, 학교, 학년 검색..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid #2a2a38", background: "#18181f", color: "#e8e4f0", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 14 }} />
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 2fr 1fr", padding: "12px 20px", background: "#1e1e2e", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
              <span>이름</span><span>학교</span><span>학년</span><span>수강과목</span><span>납부</span>
            </div>
            {filtered.map(s => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 2fr 1fr", padding: "14px 20px", borderTop: "1px solid #2a2a38", alignItems: "center", fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>{s.name}</span>
                <span><span style={S.tag(sc(s.school))}>{s.school}</span></span>
                <span style={{ color: "#9ca3af" }}>{s.grade}</span>
                <span style={{ color: "#818cf8", fontSize: 12 }}>{s.courses.join(", ")}</span>
                <button onClick={() => togglePaid(s.id)} style={{ ...S.pill(s.paid), cursor: "pointer", border: `1px solid ${s.paid ? "#34d39944" : "#f8717144"}`, background: s.paid ? "#052e1622" : "#450a0a22", fontFamily: "'Noto Sans KR', sans-serif" }}>{s.paid ? "완납" : "미납"}</button>
              </div>
            ))}
          </div>
          {showAdd && (
            <div style={{ position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
              <div style={{ ...S.card, width: 400, padding: 32 }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 20 }}>학생 추가</h2>
                {[{ label: "이름", key: "name", ph: "홍길동" }, { label: "학교", key: "school", ph: "홀로중, 위드고..." }, { label: "학년", key: "grade", ph: "중2, 고1..." }, { label: "수강과목", key: "courses", ph: "코어그래머, 쎈 (쉼표 구분)" }].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 5 }}>{f.label}</div>
                    <input placeholder={f.ph} value={newS[f.key]} onChange={e => setNewS({ ...newS, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid #2a2a38", background: "#0f0f13", color: "#e8e4f0", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button onClick={addStudent} style={{ flex: 1, background: "#c084fc", color: "#0f0f13", border: "none", borderRadius: 9, padding: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>추가</button>
                  <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: "#1e1e2e", color: "#9ca3af", border: "1px solid #2a2a38", borderRadius: 9, padding: "11px", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
                </div>
              </div>
            </div>
          )}
        </>}

        {/* ── 수업 일정 ── */}
        {tab === "lessons" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 24 }}>수업 일정</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
            {DAYS.map(day => (
              <div key={day} style={{ ...S.card, padding: 0, overflow: "hidden" }}>
                <div style={{ background: "#1e1e2e", padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#c084fc", textAlign: "center" }}>{day}요일</div>
                {initialLessons.filter(l => l.day === day).map(l => (
                  <div key={l.id} style={{ padding: "12px 14px", borderTop: "1px solid #2a2a38" }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{l.student}</div>
                    <div style={{ fontSize: 12, color: "#818cf8", marginTop: 2 }}>{l.course}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{l.time}</div>
                  </div>
                ))}
                {initialLessons.filter(l => l.day === day).length === 0 && <div style={{ padding: "16px 14px", fontSize: 12, color: "#374151", textAlign: "center" }}>수업 없음</div>}
              </div>
            ))}
          </div>
        </>}

        {/* ── 커리큘럼 ── */}
        {tab === "curriculum" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>커리큘럼 & 현 위치</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>전체 목표 로드맵과 각 학생의 현재 진도</p>

          <div style={{ ...S.card, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 22 }}>📍 전체 커리큘럼 로드맵</div>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              {CURRICULUM_STEPS.map((s, i) => (
                <div key={s.step} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
                  <div style={{ textAlign: "center", flex: 1, padding: "0 4px" }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#c084fc,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontWeight: 700, fontSize: 16, color: "#0f0f13" }}>{s.step}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#e8e4f0", marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{s.desc}</div>
                  </div>
                  {i < CURRICULUM_STEPS.length - 1 && <div style={{ width: 28, height: 2, background: "#2a2a38", marginTop: 20, flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "13px 22px", background: "#1e1e2e", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>학생별 현재 위치</div>
            {students.map(s => {
              const pct = ((s.curriculumStep - 1) / (CURRICULUM_STEPS.length - 1)) * 100;
              const step = CURRICULUM_STEPS[s.curriculumStep - 1];
              return (
                <div key={s.id} style={{ padding: "18px 22px", borderTop: "1px solid #2a2a38" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      <span style={S.tag(sc(s.school))}>{s.school}</span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{s.grade}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#c084fc" }}>STEP {s.curriculumStep}</span>
                      <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 6 }}>{step?.label}</span>
                    </div>
                  </div>
                  <div style={{ background: "#2a2a38", borderRadius: 99, height: 7, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#818cf8,#c084fc)", borderRadius: 99 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, color: "#4b5563" }}>
                    <span>기초 문법</span><span>최종 마무리</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ── 수강료 ── */}
        {tab === "payment" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 24 }}>수강료 현황</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[{ list: paid, title: `✅ 완납 (${paid.length}명)`, color: "#34d399", action: "미납으로 변경", next: false }, { list: unpaid, title: `⚠️ 미납 (${unpaid.length}명)`, color: "#f87171", action: "납부 처리", next: true }].map(({ list, title, color, action, next }) => (
              <div key={title} style={{ ...S.card }}>
                <div style={{ fontSize: 14, fontWeight: 600, color, marginBottom: 16 }}>{title}</div>
                {list.length === 0 ? <div style={{ color: "#4b5563", fontSize: 13 }}>미납자 없음 🎉</div> : list.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2a2a38", alignItems: "center" }}>
                    <div><span style={{ fontWeight: 500 }}>{s.name}</span><span style={{ marginLeft: 8, fontSize: 11, color: "#6b7280" }}>{s.grade}</span></div>
                    <button onClick={() => togglePaid(s.id)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: next ? "#052e1622" : "#450a0a22", color: next ? "#34d399" : "#f87171", border: `1px solid ${next ? "#34d39944" : "#f8717144"}`, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>{action}</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>}

        {/* ── 과제 ── */}
        {tab === "homework" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 24 }}>과제 현황</h1>
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr", padding: "12px 20px", background: "#1e1e2e", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
              <span>학생</span><span>과제</span><span>날짜</span><span>제출여부</span>
            </div>
            {initialHomework.map(h => (
              <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr", padding: "14px 20px", borderTop: "1px solid #2a2a38", alignItems: "center", fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>{h.student}</span>
                <span style={{ color: "#9ca3af" }}>{h.task}</span>
                <span style={{ color: "#6b7280", fontSize: 12 }}>{h.date}</span>
                <span style={S.pill(h.submitted)}>{h.submitted ? "제출완료" : "미제출"}</span>
              </div>
            ))}
          </div>
        </>}

        {/* ── 시험 ── */}
        {tab === "exams" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 24 }}>시험 결과</h1>
          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr", padding: "12px 20px", background: "#1e1e2e", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
              <span>학생</span><span>시험명</span><span>과목</span><span>점수</span><span>날짜</span>
            </div>
            {initialExams.map(e => (
              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr", padding: "14px 20px", borderTop: "1px solid #2a2a38", alignItems: "center", fontSize: 14 }}>
                <span style={{ fontWeight: 500 }}>{e.student}</span>
                <span style={{ color: "#9ca3af" }}>{e.exam}</span>
                <span style={{ ...S.tag("#818cf8") }}>{e.subject}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: e.score >= 90 ? "#34d399" : e.score >= 75 ? "#fbbf24" : "#f87171" }}>{e.score}점</span>
                <span style={{ color: "#6b7280", fontSize: 12 }}>{e.date}</span>
              </div>
            ))}
          </div>
        </>}

        {/* ── 학부모 메시지 ── */}
        {tab === "message" && <>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 4 }}>학부모 메시지</h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>AI가 학부모께 보낼 문자를 자동으로 작성해드려요</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
            <div style={{ ...S.card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 18 }}>✏️ 메시지 설정</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>학생 선택</div>
                <select value={msgStudent} onChange={e => setMsgStudent(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid #2a2a38", background: "#0f0f13", color: msgStudent ? "#e8e4f0" : "#4b5563", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>
                  <option value="">-- 학생 선택 --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>메시지 유형</div>
                {MSG_TEMPLATES.map(t => (
                  <button key={t.key} onClick={() => setMsgTemplate(t.key)} style={{ display: "block", width: "100%", padding: "9px 14px", borderRadius: 9, border: `1px solid ${msgTemplate === t.key ? "#c084fc" : "#2a2a38"}`, background: msgTemplate === t.key ? "#c084fc18" : "transparent", color: msgTemplate === t.key ? "#c084fc" : "#9ca3af", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "'Noto Sans KR', sans-serif", marginBottom: 6 }}>{t.label}</button>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>추가 정보 (선택)</div>
                <textarea value={msgExtra} onChange={e => setMsgExtra(e.target.value)} placeholder="예: 이번 주 시험 88점, 수업 태도 좋음..." rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1px solid #2a2a38", background: "#0f0f13", color: "#e8e4f0", fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", resize: "vertical" }} />
              </div>
              <button onClick={handleGen} disabled={!msgStudent || msgLoading} style={{ width: "100%", background: msgStudent ? "#c084fc" : "#2a2a38", color: msgStudent ? "#0f0f13" : "#4b5563", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: msgStudent ? "pointer" : "not-allowed", fontFamily: "'Noto Sans KR', sans-serif" }}>
                {msgLoading ? "✨ 생성 중..." : "✨ 메시지 생성"}
              </button>
            </div>
            <div style={{ ...S.card }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc", marginBottom: 18 }}>💬 생성된 메시지</div>
              {msgLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #c084fc", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                  AI가 메시지를 작성하고 있어요...
                </div>
              )}
              {!msgLoading && !msgResult && (
                <div style={{ color: "#374151", fontSize: 14, lineHeight: 2 }}>
                  왼쪽에서 학생과 유형을 선택하고<br />
                  <span style={{ color: "#c084fc" }}>✨ 메시지 생성</span> 버튼을 누르면<br />
                  AI가 자동으로 문자를 작성해드려요.
                </div>
              )}
              {msgResult && !msgLoading && (
                <div style={{ animation: "fadein 0.3s ease" }}>
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
