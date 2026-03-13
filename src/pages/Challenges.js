import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import {
  Zap, CheckCircle, XCircle, ArrowRight, RotateCcw, TrendingUp,
  Trophy, ChevronRight, Star, Timer, Target, Database, Flame,
  AlertCircle, Info, BookOpen, BarChart2, Clock, Brain,
  Award, ShieldCheck, TrendingDown, Lock, Unlock
} from 'lucide-react';

/* ─── Role requirements map (full 8 skills each) ─────────────────────────── */
const ROLE_REQUIREMENTS = {
  'Data Scientist':      { 'Python':85,'Machine Learning':80,'Statistics':75,'SQL':70,'Data Visualization':65,'Deep Learning':60,'Feature Engineering':70,'Model Evaluation':75 },
  'AI Engineer':         { 'Python':90,'Deep Learning':85,'Machine Learning':80,'LLM/NLP':75,'MLOps':70,'Cloud Platforms':65,'Docker/Kubernetes':60,'API Development':70 },
  'Software Developer':  { 'Python':80,'JavaScript':80,'Data Structures':85,'Algorithms':80,'System Design':70,'Databases':75,'REST APIs':75,'Version Control':80 },
  'IoT Engineer':        { 'Embedded C':80,'Python':70,'Electronics':75,'MQTT/Protocols':70,'Linux':65,'Sensors/Hardware':75,'Cloud IoT':65,'Data Processing':60 },
  'Full Stack Developer':{ 'JavaScript':85,'React':80,'Node.js':75,'Databases':75,'REST APIs':80,'CSS/HTML':75,'System Design':65,'DevOps Basics':60 },
  'ML Engineer':         { 'Python':85,'Machine Learning':85,'MLOps':80,'Docker/Kubernetes':75,'Cloud Platforms':70,'Model Optimization':75,'Data Engineering':70,'API Development':65 },
};

const DIFF = {
  'Very Easy':{ color:'#10b981', bg:'rgba(16,185,129,.1)',  border:'rgba(16,185,129,.28)', stars:1, pts:2,  label:'Warm-Up'    },
  'Easy':     { color:'#06b6d4', bg:'rgba(6,182,212,.1)',   border:'rgba(6,182,212,.28)',  stars:2, pts:4,  label:'Basic'      },
  'Medium':   { color:'#f59e0b', bg:'rgba(245,158,11,.1)',  border:'rgba(245,158,11,.28)', stars:3, pts:6,  label:'Intermediate'},
  'Hard':     { color:'#ef4444', bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.28)',  stars:4, pts:8,  label:'Advanced'   },
  'Very Hard':{ color:'#8b5cf6', bg:'rgba(139,92,246,.1)',  border:'rgba(139,92,246,.28)', stars:5, pts:10, label:'Expert'     },
};

const Stars = ({ d }) => {
  const c = DIFF[d] || DIFF['Medium'];
  return <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(i =>
    <Star key={i} size={11} fill={i<=c.stars?c.color:'transparent'} color={i<=c.stars?c.color:'rgba(255,255,255,.1)'} />
  )}</div>;
};

/* ─── Score ring ────────────────────────────────────────────────────────── */
function ScoreRing({ pct, size=110, label='' }) {
  const r = (size-10)/2;
  const circ = 2*Math.PI*r;
  const color = pct>=80?'#10b981':pct>=60?'#06b6d4':pct>=40?'#f59e0b':'#ef4444';
  return (
    <div style={{ position:'relative', width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width={size} height={size} style={{ position:'absolute', transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={9} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${circ*pct/100} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 8px ${color}80)` }} />
      </svg>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:size>=110?28:20, color, lineHeight:1 }}>{pct}%</div>
        {label && <div style={{ fontSize:9, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'.7px', marginTop:2 }}>{label}</div>}
      </div>
    </div>
  );
}

/* ─── Mini metric card ───────────────────────────────────────────────────── */
function Metric({ icon: Icon, label, value, color='var(--cyan)', sub }) {
  return (
    <div style={{ flex:1, minWidth:90, padding:'12px 14px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, textAlign:'center' }}>
      <Icon size={16} color={color} style={{ marginBottom:5 }} />
      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color }}>{value}</div>
      <div style={{ fontSize:10, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'.6px', marginTop:2 }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:'var(--gray-500)', marginTop:2 }}>{sub}</div>}
    </div>
  );
}

/* ─── Thin animated progress bar ─────────────────────────────────────────── */
function MiniBar({ value, max=100, color='var(--cyan)', height=6 }) {
  const pct = Math.min((value/max)*100, 100);
  return (
    <div style={{ height, background:'rgba(255,255,255,.06)', borderRadius:4, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width 1s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  );
}

/* ─── Score breakdown panel used in results ──────────────────────────────── */
function ScoreBreakdown({ answers, elapsed, maxScore, quiz }) {
  const correctCount  = answers.filter(a => a.correct).length;
  const totalScore    = answers.reduce((s,a) => s+a.points, 0);
  const pct           = Math.round((totalScore/maxScore)*100);

  /* time scoring: ideal is ≤30s/q, cap penalty at 120s */
  const avgTime = elapsed / (answers.length || 1);
  const timePct = Math.max(0, Math.round(100 - ((avgTime - 30) / 90) * 40));

  /* speed rating */
  const speedLabel = avgTime<=20?'Lightning ⚡':avgTime<=40?'Fast 🚀':avgTime<=70?'Steady 🎯':'Slow 🐢';

  /* consistency: no wrong answers in a row */
  let maxStreak=0, cur=0;
  answers.forEach(a => { if(a.correct){cur++;maxStreak=Math.max(maxStreak,cur);}else cur=0; });

  /* difficulty score: weight by difficulty */
  const hardCorrect = answers.filter((a,i) => a.correct && ['Hard','Very Hard'].includes(quiz.questions[i]?.difficulty)).length;

  /* skill confidence composite: accuracy 50% + time 25% + hard bonus 25% */
  const confidence = Math.round(pct*0.50 + timePct*0.25 + (hardCorrect/(answers.filter((_,i)=>['Hard','Very Hard'].includes(quiz.questions[i]?.difficulty)).length||1))*100*0.25);

  /* per-question time breakdown */
  const qTimes = answers.map((a,i) => ({
    label: `Q${i+1}`, time: a.time||0, correct: a.correct,
    diff: quiz.questions[i]?.difficulty,
  }));

  const resultColor = pct>=80?'var(--green)':pct>=60?'var(--cyan)':pct>=40?'var(--orange)':'var(--red)';
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* ── Hero score ── */}
      <div className="card" style={{ background:'linear-gradient(135deg,rgba(26,86,219,.08),rgba(6,182,212,.04))', padding:'28px 22px', textAlign:'center' }}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:28, flexWrap:'wrap', marginBottom:20 }}>
          <ScoreRing pct={pct} size={120} label="Score" />
          <ScoreRing pct={confidence} size={90} label="Confidence" />
          <ScoreRing pct={timePct} size={90} label="Speed" />
        </div>

        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, marginBottom:5 }}>
          {pct>=80?'🏆 Expert Level!':pct>=60?'🎯 Strong Performance!':pct>=40?'📈 Good Progress!':'💪 Keep Practicing!'}
        </div>
        <div style={{ color:'var(--gray-400)', fontSize:14, marginBottom:16 }}>
          <strong style={{ color:resultColor }}>{totalScore}</strong> / <strong style={{ color:'var(--white)' }}>{maxScore}</strong> pts
          {' '}on <strong style={{ color:'var(--cyan)' }}>{quiz.skill}</strong>
          {' '}· Total time: <strong style={{ color:'var(--gray-300)' }}>{fmt(elapsed)}</strong>
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 13px', background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.18)', borderRadius:20, fontSize:11, color:'var(--green)' }}>
          <Database size={11} /> Saved to Supabase ✓
        </div>
      </div>

      {/* ── 6 Key Metrics ── */}
      <div className="card">
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:14 }}>
          📊 Performance Metrics
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Metric icon={CheckCircle} label="Accuracy"   value={`${correctCount}/${answers.length}`} color={correctCount>=4?'var(--green)':correctCount>=3?'var(--cyan)':'var(--orange)'} sub={`${Math.round(correctCount/answers.length*100)}%`} />
          <Metric icon={Clock}       label="Total Time" value={fmt(elapsed)}      color="var(--cyan)"   sub="Full quiz" />
          <Metric icon={Timer}       label="Avg / Q"    value={fmt(Math.round(avgTime))} color={avgTime<=30?'var(--green)':avgTime<=60?'var(--orange)':'var(--red)'} sub={speedLabel} />
          <Metric icon={Flame}       label="Best Streak" value={maxStreak}        color="var(--orange)" sub={`in a row`} />
          <Metric icon={Brain}       label="Hard Qs"    value={`${hardCorrect}✓`} color="var(--purple)" sub="H+VH correct" />
          <Metric icon={ShieldCheck} label="Confidence" value={`${confidence}%`}  color={confidence>=70?'var(--green)':confidence>=45?'var(--cyan)':'var(--orange)'} sub="Composite" />
        </div>
      </div>

      {/* ── How confidence was calculated ── */}
      <div className="card" style={{ background:'rgba(139,92,246,.04)', borderColor:'rgba(139,92,246,.15)' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'var(--purple)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
          <Brain size={13}/> How Your Skill Confidence Was Calculated
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { label:'Accuracy Score',        value:pct,        weight:'50%', desc:`${correctCount} correct out of ${answers.length} questions`, color:'var(--cyan)' },
            { label:'Speed Score',           value:timePct,    weight:'25%', desc:`Avg ${fmt(Math.round(avgTime))} per question (ideal ≤30s)`,  color:'var(--orange)' },
            { label:'Hard Question Bonus',   value:Math.round((hardCorrect/(answers.filter((_,i)=>['Hard','Very Hard'].includes(quiz.questions[i]?.difficulty)).length||1))*100), weight:'25%', desc:`${hardCorrect} hard/very-hard answered correctly`, color:'var(--purple)' },
          ].map(row => (
            <div key={row.label} style={{ padding:'10px 13px', background:'rgba(255,255,255,.03)', borderRadius:10, border:'1px solid rgba(255,255,255,.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--gray-200)' }}>{row.label}</span>
                  <span style={{ fontSize:11, color:'var(--gray-600)', marginLeft:8 }}>Weight: {row.weight}</span>
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:14, color:row.color }}>{row.value}%</span>
              </div>
              <MiniBar value={row.value} color={row.color} />
              <div style={{ fontSize:11, color:'var(--gray-600)', marginTop:5 }}>{row.desc}</div>
            </div>
          ))}
          <div style={{ padding:'10px 13px', background:`${confidence>=70?'rgba(16,185,129,.06)':confidence>=45?'rgba(6,182,212,.06)':'rgba(245,158,11,.06)'}`, borderRadius:10, border:`1px solid ${confidence>=70?'rgba(16,185,129,.2)':confidence>=45?'rgba(6,182,212,.2)':'rgba(245,158,11,.2)'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--white)' }}>Final Confidence Score</span>
              <span style={{ fontFamily:'var(--font-mono)', fontWeight:900, fontSize:16, color:confidence>=70?'var(--green)':confidence>=45?'var(--cyan)':'var(--orange)' }}>{confidence}%</span>
            </div>
            <MiniBar value={confidence} color={confidence>=70?'var(--green)':confidence>=45?'var(--cyan)':'var(--orange)'} height={8} />
          </div>
        </div>
      </div>

      {/* ── Time breakdown per question ── */}
      <div className="card">
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:14 }}>
          ⏱ Time Breakdown Per Question
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {qTimes.map((qt,i) => {
            const timeColor = qt.time<=20?'var(--green)':qt.time<=45?'var(--cyan)':qt.time<=75?'var(--orange)':'var(--red)';
            const dc = DIFF[qt.diff] || DIFF['Medium'];
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:26, textAlign:'right', fontSize:12, color:'var(--gray-500)', fontFamily:'var(--font-mono)', flexShrink:0 }}>{qt.label}</div>
                <span style={{ fontSize:10, padding:'1px 6px', background:dc.bg, borderRadius:5, color:dc.color, fontWeight:700, flexShrink:0, width:72, textAlign:'center' }}>{qt.diff}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3, fontSize:11 }}>
                    <span style={{ color:qt.correct?'var(--green)':'var(--red)' }}>{qt.correct?'✓ Correct':'✗ Wrong'}</span>
                    <span style={{ fontFamily:'var(--font-mono)', color:timeColor }}>{fmt(qt.time)}</span>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,.05)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.min((qt.time/120)*100, 100)}%`, background:timeColor, borderRadius:3, transition:'width 1s' }} />
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop:4, padding:'8px 12px', background:'rgba(255,255,255,.02)', borderRadius:9, border:'1px solid rgba(255,255,255,.05)', fontSize:11, color:'var(--gray-500)', display:'flex', gap:14 }}>
            <span style={{ color:'var(--green)' }}>🟢 ≤20s Fast</span>
            <span style={{ color:'var(--cyan)' }}>🔵 ≤45s Good</span>
            <span style={{ color:'var(--orange)' }}>🟡 ≤75s Slow</span>
            <span style={{ color:'var(--red)' }}>🔴 &gt;75s Very Slow</span>
          </div>
        </div>
      </div>

      {/* ── Answer Review ── */}
      <div className="card">
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:14 }}>
          📋 Answer Review
        </div>
        {quiz.questions.map((q, i) => {
          const ans = answers[i];
          const c = DIFF[q.difficulty] || DIFF['Medium'];
          return (
            <div key={i} style={{ marginBottom:12, padding:'13px', background:'rgba(255,255,255,.02)', borderRadius:11, border:`1px solid ${ans?.correct?'rgba(16,185,129,.15)':'rgba(239,68,68,.15)'}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, gap:8, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  {ans?.correct ? <CheckCircle size={15} color="var(--green)"/> : <XCircle size={15} color="var(--red)"/>}
                  <span style={{ fontSize:10, fontWeight:700, color:c.color, padding:'2px 7px', background:c.bg, border:`1px solid ${c.border}`, borderRadius:5 }}>{q.difficulty}</span>
                  <Stars d={q.difficulty} />
                </div>
                <div style={{ display:'flex', gap:10, fontSize:11 }}>
                  <span style={{ fontFamily:'var(--font-mono)', color:ans?.time<=30?'var(--green)':ans?.time<=60?'var(--orange)':'var(--red)' }}>⏱ {fmt(ans?.time||0)}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:ans?.correct?'var(--green)':'var(--red)' }}>+{ans?.correct?q.points:0} pts</span>
                </div>
              </div>
              <div style={{ fontSize:13, color:'var(--gray-200)', marginBottom:8, lineHeight:1.6, fontWeight:500 }}>{q.question}</div>
              {!ans?.correct && <div style={{ fontSize:12, color:'var(--red)', marginBottom:4, padding:'5px 9px', background:'rgba(239,68,68,.06)', borderRadius:7 }}>✗ Your answer: {ans?.selected}</div>}
              <div style={{ fontSize:12, color:'var(--green)', marginBottom:6, padding:'5px 9px', background:'rgba(16,185,129,.06)', borderRadius:7 }}>✓ Correct: {q.correct_answer}</div>
              <div style={{ fontSize:12, color:'var(--gray-500)', padding:'8px 11px', background:'rgba(255,255,255,.02)', borderRadius:8, lineHeight:1.65 }}>💡 {q.explanation}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Skills required panel (shown in selector view) ─────────────────────── */
function RequiredSkillsPanel({ role, provenScores }) {
  const reqs = ROLE_REQUIREMENTS[role] || {};
  const skills = Object.entries(reqs);
  const missingSkills = skills.filter(([s]) => !provenScores[s]);
  const testedSkills  = skills.filter(([s]) => provenScores[s] !== undefined);
  const metSkills     = testedSkills.filter(([s,r]) => (provenScores[s]||0) >= r);

  return (
    <div className="card" style={{ marginTop:16 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'.8px', display:'flex', alignItems:'center', gap:7 }}>
          <Target size={13} /> {role} — Required Skills
        </div>
        <div style={{ display:'flex', gap:7 }}>
          <span className="badge badge-green">{metSkills.length} Met</span>
          <span className="badge badge-orange">{testedSkills.length - metSkills.length} Below</span>
          <span className="badge badge-gray">{missingSkills.length} Untested</span>
        </div>
      </div>

      {/* Visual table */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {skills.sort((a,b) => {
          // Sort: below threshold first, then untested, then met
          const ga = (provenScores[a[0]]||0) - a[1];
          const gb = (provenScores[b[0]]||0) - b[1];
          if (!provenScores[a[0]] && !provenScores[b[0]]) return 0;
          if (!provenScores[a[0]]) return 1;
          if (!provenScores[b[0]]) return -1;
          return ga - gb;
        }).map(([skill, required]) => {
          const proven  = provenScores[skill];
          const tested  = proven !== undefined;
          const met     = tested && proven >= required;
          const gap     = tested ? required - proven : null;
          const barColor = !tested ? 'rgba(255,255,255,.08)' : met ? 'var(--green)' : proven>=required*0.7 ? 'var(--orange)' : 'var(--red)';
          const borderColor = !tested ? 'rgba(255,255,255,.06)' : met ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.15)';

          return (
            <div key={skill} style={{ padding:'10px 13px', background:'rgba(255,255,255,.025)', borderRadius:11, border:`1px solid ${borderColor}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7, gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {!tested ? <Lock size={13} color="var(--gray-600)"/> : met ? <Unlock size={13} color="var(--green)"/> : <AlertCircle size={13} color="var(--orange)"/>}
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color: met?'var(--green)':!tested?'var(--gray-400)':'var(--white)' }}>{skill}</span>
                  {!tested && <span style={{ fontSize:10, padding:'1px 7px', background:'rgba(255,255,255,.06)', borderRadius:20, color:'var(--gray-600)', border:'1px solid rgba(255,255,255,.06)' }}>Not tested yet</span>}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:11 }}>
                  {tested && <span style={{ fontFamily:'var(--font-mono)', color:barColor, fontWeight:700 }}>{proven}%</span>}
                  <span style={{ color:'var(--gray-600)', fontFamily:'var(--font-mono)' }}>/ {required}%</span>
                  {tested && gap>0 && <span style={{ color:'var(--red)', fontSize:10, fontWeight:700 }}>-{gap}%</span>}
                  {met && <span style={{ color:'var(--green)', fontSize:10 }}>+{proven-required}%</span>}
                </div>
              </div>

              <div style={{ position:'relative', height:7, background:'rgba(255,255,255,.05)', borderRadius:4, overflow:'visible' }}>
                {/* Proven bar */}
                {tested && <div style={{ height:'100%', width:`${Math.min(proven,100)}%`, background:barColor, borderRadius:4, overflow:'hidden', transition:'width 1s', position:'absolute' }} />}
                {/* Required marker */}
                <div style={{ position:'absolute', top:-2, left:`${required}%`, height:11, width:2, background:'rgba(255,255,255,.3)', borderRadius:1 }} title={`Required: ${required}%`} />
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, fontSize:10, color:'var(--gray-600)' }}>
                <span>{!tested ? '👉 Take this challenge to prove your skill' : met ? '✅ You meet the requirement' : `⚠️ Need ${gap}% more to qualify`}</span>
                <span>Required: {required}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Missing skills callout */}
      {missingSkills.length > 0 && (
        <div style={{ marginTop:14, padding:'11px 14px', background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.18)', borderRadius:11 }}>
          <div style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
            <Info size={14} color="var(--orange)" style={{ flexShrink:0, marginTop:1 }} />
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--orange)', marginBottom:4 }}>
                {missingSkills.length} skills still untested
              </div>
              <div style={{ fontSize:12, color:'var(--gray-400)', lineHeight:1.6 }}>
                You haven't tested: <strong style={{ color:'var(--white)' }}>{missingSkills.map(([s])=>s).join(', ')}</strong>.
                {' '}Challenge each one to unlock your full readiness score.
              </div>
            </div>
          </div>
        </div>
      )}

      {testedSkills.length > 0 && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:11, color:'var(--gray-600)' }}>
            <span>Overall Readiness for {role}</span>
            <span style={{ color:metSkills.length/skills.length>=.7?'var(--green)':'var(--orange)', fontFamily:'var(--font-mono)', fontWeight:700 }}>
              {Math.round(metSkills.length/skills.length*100)}%
            </span>
          </div>
          <MiniBar value={metSkills.length} max={skills.length} color={metSkills.length/skills.length>=.7?'var(--green)':'var(--orange)'} height={7} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Challenges() {
  const { apiKey, profile, studentId, addChallengeResult, provenScores } = useApp();
  const navigate = useNavigate();
  const allReqSkills  = Object.keys(ROLE_REQUIREMENTS[profile?.target_role] || {});
  const quickSkills   = allReqSkills.slice(0, 5); // top 5 for selector
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const [sel,      setSel]      = useState(quickSkills[0] || '');
  const [quiz,     setQuiz]     = useState(null);
  const [qi,       setQi]       = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers,  setAnswers]  = useState([]);
  const [done,     setDone]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [qTime,    setQTime]    = useState(0);
  const [streak,   setStreak]   = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const timerRef  = useRef(null);
  const qTimerRef = useRef(null);

  useEffect(() => {
    if (quiz && !done) { timerRef.current = setInterval(() => setElapsed(e => e+1), 1000); }
    return () => clearInterval(timerRef.current);
  }, [quiz, done]);

  useEffect(() => {
    if (quiz && !revealed && !done) {
      setQTime(0);
      qTimerRef.current = setInterval(() => setQTime(t => t+1), 1000);
    }
    return () => clearInterval(qTimerRef.current);
  }, [qi, quiz, revealed]);

  const maxScore = quiz ? quiz.questions.reduce((a,q)=>a+q.points,0) : 30;
  const q   = quiz?.questions?.[qi];
  const cfg = q ? (DIFF[q.difficulty]||DIFF['Medium']) : null;

  const loadQuiz = async () => {
    setLoading(true); setQuiz(null); setQi(0); setChosen(null);
    setRevealed(false); setAnswers([]); setDone(false);
    setElapsed(0); setQTime(0); setStreak(0); setMaxStreak(0);
    try {
      const data = await api.generateChallenge({ skill:sel, level:'progressive', role:profile.target_role, api_key:apiKey });
      setQuiz(data);
    } catch(e) { alert('Error: '+e.message); }
    setLoading(false);
  };

  const confirm = () => {
    if (!chosen || revealed) return;
    clearInterval(qTimerRef.current);
    const ok = chosen.trim()[0].toUpperCase() === q.correct_answer.trim()[0].toUpperCase();
    setRevealed(true);
    setAnswers(prev => {
      const newAns = [...prev, { selected:chosen, correct:ok, points:ok?q.points:0, time:qTime }];
      return newAns;
    });
    const newStreak = ok ? streak+1 : 0;
    setStreak(newStreak);
    if (newStreak > maxStreak) setMaxStreak(newStreak);
  };

  const next = async () => {
    const isLast = qi+1 >= quiz.questions.length;
    if (isLast) {
      clearInterval(timerRef.current);
      // Use setState callback to get final answers
      setAnswers(prev => {
        const total = prev.reduce((s,a)=>s+a.points,0);
        const pct   = Math.round((total/maxScore)*100);
        const correctCount = prev.filter(a=>a.correct).length;
        // Compute confidence
        const avgTime = elapsed / (prev.length||1);
        const timePct = Math.max(0, Math.round(100 - ((avgTime-30)/90)*40));
        const hardDone = prev.filter((_,i)=>['Hard','Very Hard'].includes(quiz.questions[i]?.difficulty));
        const hardCorrect = hardDone.filter(a=>a.correct).length;
        const confidence = Math.round(pct*.5 + timePct*.25 + (hardCorrect/(hardDone.length||1))*100*.25);

        if (studentId) {
          setSaving(true);
          api.saveQuiz({ student_id:studentId, skill:sel, target_role:profile.target_role, score:total, max_score:maxScore, percentage:pct, correct_count:correctCount, total_questions:quiz.questions.length, questions:quiz.questions, answers:prev })
            .catch(e => console.error(e)).finally(() => setSaving(false));
        }
        addChallengeResult({ skill:sel, skill_confidence:confidence, percentage:pct });
        return prev;
      });
      setDone(true);
    } else {
      setQi(i => i+1); setChosen(null); setRevealed(false);
    }
  };

  if (!profile) return (
    <div style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
      <p style={{ marginBottom:14 }}>Complete your profile first.</p>
      <button className="btn btn-primary" onClick={() => navigate('/profile')}>Build Profile <ArrowRight size={13}/></button>
    </div>
  );

  return (
    <div style={{ padding:'28px 32px', maxWidth:860, margin:'0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:22, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'rgba(6,182,212,.15)', border:'1px solid rgba(6,182,212,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={17} color="var(--cyan)"/>
          </div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>Skill Challenges</h1>
            <p style={{ color:'var(--gray-500)', fontSize:12 }}>Prove your skills · Score saved · Confidence calculated</p>
          </div>
        </div>
        {quiz && !done && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {streak >= 2 && (
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.25)', borderRadius:20 }}>
                <Flame size={13} color="var(--orange)"/>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--orange)', fontWeight:700 }}>{streak} 🔥</span>
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', background:'rgba(6,182,212,.08)', border:'1px solid rgba(6,182,212,.2)', borderRadius:20 }}>
              <Timer size={13} color="var(--cyan)"/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--cyan)', fontWeight:700 }}>{fmt(elapsed)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Selector ── */}
      {!quiz && !loading && !done && (
        <div style={{ animation:'fadeUp .35s ease' }}>
          <div className="card" style={{ marginBottom:14 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:14 }}>
              Pick a Skill to Test
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:8, marginBottom:18 }}>
              {allReqSkills.map(sk => {
                const sc  = provenScores[sk];
                const req = ROLE_REQUIREMENTS[profile.target_role]?.[sk] || 0;
                const met = sc !== undefined && sc >= req;
                const active = sel === sk;
                return (
                  <button key={sk} onClick={() => setSel(sk)}
                    style={{ padding:'11px 13px', borderRadius:11, cursor:'pointer', textAlign:'left', border:`1.5px solid ${active?'var(--cyan)':met?'rgba(16,185,129,.2)':'rgba(255,255,255,.07)'}`, background:active?'rgba(6,182,212,.08)':met?'rgba(16,185,129,.04)':'rgba(255,255,255,.02)', transition:'all .18s', position:'relative' }}>
                    {met && <div style={{ position:'absolute', top:6, right:7, width:7, height:7, borderRadius:'50%', background:'var(--green)' }} />}
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:active?'var(--cyan-bright)':met?'var(--green)':'var(--gray-300)', marginBottom:4, paddingRight:12 }}>{sk}</div>
                    {sc !== undefined ? (
                      <div style={{ fontSize:10, padding:'1px 6px', borderRadius:5, display:'inline-block', background:met?'rgba(16,185,129,.12)':sc>=req*.7?'rgba(245,158,11,.12)':'rgba(239,68,68,.1)', color:met?'var(--green)':sc>=req*.7?'var(--orange)':'var(--red)', fontFamily:'var(--font-mono)', fontWeight:700 }}>{sc}%</div>
                    ) : (
                      <div style={{ fontSize:10, color:'var(--gray-700)', fontStyle:'italic' }}>Untested</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Difficulty legend */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', paddingTop:12, borderTop:'1px solid rgba(255,255,255,.05)' }}>
              {Object.entries(DIFF).map(([lv,c]) => (
                <div key={lv} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', background:c.bg, border:`1px solid ${c.border}`, borderRadius:7 }}>
                  <Stars d={lv}/><span style={{ fontSize:10, color:c.color, fontWeight:600 }}>{lv} · {c.pts}pt</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:14, marginBottom:4 }}
            onClick={loadQuiz} disabled={!sel}>
            <Zap size={15}/> Start Quiz — {sel||'Select a skill'} <ArrowRight size={14}/>
          </button>

          {/* Required skills panel */}
          <RequiredSkillsPanel role={profile.target_role} provenScores={provenScores} />
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="card" style={{ textAlign:'center', padding:'52px 24px' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:16 }}>
            {[0,1,2,3,4].map(i => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'var(--cyan)', animation:`pulse 1.2s ${i*.18}s infinite` }}/>)}
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:6 }}>Generating your quiz...</div>
          <div style={{ color:'var(--gray-500)', fontSize:13 }}>Gemini AI · 5 questions · Very Easy → Very Hard · <strong style={{color:'var(--cyan)'}}>{sel}</strong></div>
        </div>
      )}

      {/* ── Active Question ── */}
      {quiz && !done && q && (
        <div style={{ animation:'fadeUp .3s ease' }}>
          {/* Progress */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
              <span style={{ color:'var(--gray-500)' }}>Question <strong style={{color:'var(--white)'}}>{qi+1}</strong> / {quiz.questions.length}</span>
              <span style={{ fontFamily:'var(--font-mono)', color:'var(--cyan)', fontWeight:700 }}>
                {answers.reduce((s,a)=>s+a.points,0)} / {maxScore} pts
              </span>
            </div>
            <div style={{ display:'flex', gap:3 }}>
              {quiz.questions.map((_,i) => {
                const ans = answers[i];
                return <div key={i} style={{ flex:1, height:5, borderRadius:3, background:ans?ans.correct?'var(--green)':'var(--red)':i===qi?'var(--cyan)':'rgba(255,255,255,.07)', transition:'background .3s' }}/>;
              })}
            </div>
          </div>

          {/* Question card */}
          <div className="card" style={{ marginBottom:12, borderColor:revealed?(answers[answers.length-1]?.correct?'rgba(16,185,129,.3)':'rgba(239,68,68,.22)'):cfg.border, transition:'border-color .3s' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ padding:'4px 10px', background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:20, fontSize:11, fontWeight:700, color:cfg.color }}>{q.difficulty}</span>
                <span style={{ fontSize:11, color:'var(--gray-600)' }}>{cfg.label}</span>
                <Stars d={q.difficulty}/>
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:qTime>60?'var(--red)':qTime>30?'var(--orange)':'var(--gray-600)' }}>⏱ {fmt(qTime)}</span>
                <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 9px', background:'rgba(6,182,212,.08)', borderRadius:20 }}>
                  <Trophy size={11} color="var(--cyan)"/>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--cyan)', fontWeight:700 }}>{q.points} pts</span>
                </div>
              </div>
            </div>

            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, lineHeight:1.65, marginBottom:20, color:'var(--white)' }}>
              {q.question}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {q.options.map((opt,i) => {
                const letter = opt.trim()[0].toUpperCase();
                const correctL = q.correct_answer.trim()[0].toUpperCase();
                const isChosen  = chosen?.trim()[0].toUpperCase() === letter;
                const isCorrect = letter === correctL;
                let s = { padding:'12px 15px', borderRadius:11, cursor:revealed?'default':'pointer', textAlign:'left', fontFamily:'var(--font-body)', fontSize:14, display:'flex', alignItems:'center', gap:10, transition:'all .15s', border:'1.5px solid rgba(255,255,255,.07)', background:'rgba(255,255,255,.02)', color:'var(--gray-200)' };
                if (revealed) {
                  if (isCorrect)      { s.background='rgba(16,185,129,.1)'; s.border='1.5px solid rgba(16,185,129,.38)'; s.color='var(--green)'; }
                  else if (isChosen)  { s.background='rgba(239,68,68,.08)'; s.border='1.5px solid rgba(239,68,68,.35)'; s.color='var(--red)'; }
                } else if (isChosen)  { s.background='rgba(6,182,212,.08)'; s.border='1.5px solid var(--cyan)'; s.color='var(--cyan-bright)'; }
                return (
                  <button key={i} onClick={() => !revealed && setChosen(opt)} style={s}>
                    <span style={{ width:27, height:27, borderRadius:8, background:'rgba(255,255,255,.05)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, flexShrink:0, color:'inherit' }}>{letter}</span>
                    <span style={{ flex:1 }}>{opt.substring(2).trim()}</span>
                    {revealed && isCorrect   && <CheckCircle size={15} color="var(--green)"/>}
                    {revealed && isChosen && !isCorrect && <XCircle size={15} color="var(--red)"/>}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div style={{ marginTop:12, padding:'11px 13px', background:'rgba(6,182,212,.05)', borderRadius:9, border:'1px solid rgba(6,182,212,.12)', fontSize:13, color:'var(--gray-300)', lineHeight:1.65, animation:'fadeUp .3s ease' }}>
                <strong style={{ color:'var(--cyan)' }}>💡 </strong>{q.explanation}
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:10 }}>
            {!revealed ? (
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', padding:'12px', fontSize:14 }} onClick={confirm} disabled={!chosen}>
                Confirm Answer
              </button>
            ) : (
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', padding:'12px', fontSize:14 }} onClick={next}>
                {saving ? <><div className="spinner" style={{width:13,height:13}}/> Saving...</> : qi+1>=quiz.questions.length ? '🏁 See Full Analysis' : 'Next Question'}
                {!saving && <ChevronRight size={13}/>}
              </button>
            )}
            <button className="btn btn-ghost" style={{ padding:'12px 15px' }} onClick={() => { setQuiz(null); setDone(false); }} title="Quit">
              <RotateCcw size={13}/>
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {done && quiz && (
        <div style={{ animation:'fadeUp .4s ease' }}>
          <ScoreBreakdown answers={answers} elapsed={elapsed} maxScore={maxScore} quiz={quiz} />

          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:13 }} onClick={loadQuiz}>
              <RotateCcw size={13}/> Try Again
            </button>
            <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center', fontSize:13 }} onClick={() => { setQuiz(null); setDone(false); }}>
              <Zap size={13}/> New Skill
            </button>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', fontSize:13 }} onClick={() => navigate('/gap-analysis')}>
              Gap Analysis <ArrowRight size={13}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}