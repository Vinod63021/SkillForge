import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import {
  Target, ArrowRight, RefreshCw, TrendingUp, TrendingDown,
  CheckCircle, AlertCircle, ChevronRight, Zap, Map
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend
} from 'recharts';

function PriorityBadge({ p }) {
  const map = { high:['var(--red)','rgba(239,68,68,.1)','rgba(239,68,68,.2)','🔴'], medium:['var(--orange)','rgba(245,158,11,.1)','rgba(245,158,11,.2)','🟡'], low:['var(--cyan)','rgba(6,182,212,.1)','rgba(6,182,212,.2)','🔵'] };
  const [c,bg,border,emoji] = map[p] || map.medium;
  return <span style={{ padding:'2px 8px', background:bg, border:`1px solid ${border}`, borderRadius:20, fontSize:10, fontWeight:700, color:c }}>{emoji} {p}</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--navy-3)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <div style={{ fontWeight:700, marginBottom:6, color:'var(--white)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color:p.color, marginBottom:3 }}>{p.name}: <strong>{p.value}%</strong></div>
      ))}
    </div>
  );
};

export default function GapAnalysis() {
  const { apiKey, profile, provenScores, gapData, setGapData, studentId } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [view, setView]       = useState('overview'); // overview | radar | bar | table

  useEffect(() => { if (!gapData && profile) analyze(); }, [profile]);

  const analyze = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await api.gapAnalysis({
        profile, proven_scores: provenScores,
        target_role: profile.target_role, api_key: apiKey, student_id: studentId,
      });
      setGapData(data);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  if (!profile) return (
    <div style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
      <p style={{ marginBottom:14 }}>Complete your profile first.</p>
      <button className="btn btn-primary" onClick={() => navigate('/profile')}>Build Profile</button>
    </div>
  );

  const radarData = gapData ? Object.entries(gapData.role_requirements || {}).map(([skill, req]) => ({
    subject: skill.length > 12 ? skill.slice(0,11)+'…' : skill,
    fullSkill: skill,
    proven: Math.round(provenScores[skill] || 0),
    required: req,
  })) : [];

  const barData = gapData?.gaps?.map(g => ({
    name: g.skill.length>12 ? g.skill.slice(0,11)+'…' : g.skill,
    fullName: g.skill,
    gap: g.gap, proven: g.proven, required: g.required,
  })) || [];

  const rs = gapData?.readiness_score || 0;
  const rsColor = rs>=70?'var(--green)':rs>=50?'var(--orange)':'var(--red)';

  return (
    <div style={{ padding:'28px 32px', maxWidth:960, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'rgba(13,148,136,.15)', border:'1px solid rgba(13,148,136,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Target size={17} color="var(--teal)" />
          </div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>Gap Analysis</h1>
            <p style={{ color:'var(--gray-500)', fontSize:12 }}>You vs {profile.target_role} industry benchmarks</p>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ fontSize:12 }} onClick={analyze} disabled={loading}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="card" style={{ textAlign:'center', padding:'52px 24px' }}>
          <div className="spinner" style={{ width:32,height:32,margin:'0 auto 14px' }} />
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>Analyzing your skill gaps...</div>
          <div style={{ color:'var(--gray-500)', fontSize:13, marginTop:6 }}>Comparing your scores vs {profile.target_role} requirements</div>
        </div>
      )}

      {gapData && !loading && (
        <div style={{ animation:'fadeUp .4s ease' }}>
          {/* Readiness hero */}
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:16, marginBottom:18, background:'linear-gradient(135deg,rgba(13,148,136,.08),rgba(6,182,212,.04))', border:'1px solid rgba(13,148,136,.18)', borderRadius:16, padding:'20px 22px' }}>
            {/* Big ring */}
            <div style={{ position:'relative', width:90, height:90, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width={90} height={90} style={{ transform:'rotate(-90deg)', position:'absolute' }}>
                <circle cx={45} cy={45} r={37} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={8} />
                <circle cx={45} cy={45} r={37} fill="none" stroke={rsColor} strokeWidth={8}
                  strokeDasharray={`${2*Math.PI*37*rs/100} ${2*Math.PI*37}`} strokeLinecap="round"
                  style={{ transition:'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
              </svg>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:22, color:rsColor, lineHeight:1 }}>{rs}%</div>
                <div style={{ fontSize:9, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'.6px' }}>Ready</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, marginBottom:5 }}>
                {rs>=70?'🎉 Strong Candidate!':rs>=50?'📈 Getting There':'🚀 Room to Grow'}
              </div>
              <p style={{ fontSize:13, color:'var(--gray-400)', lineHeight:1.6, marginBottom:10 }}>
                You are <strong style={{ color:rsColor }}>{rs}%</strong> ready for <strong style={{ color:'var(--cyan)' }}>{profile.target_role}</strong>.
                {' '}{gapData.gaps?.length > 0 ? `Focus on ${gapData.gaps[0]?.skill} first — it's your biggest gap.` : "You've cleared all benchmarks! 🏆"}
              </p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <span className="badge badge-red">⚠️ {gapData.gaps?.length || 0} Gaps</span>
                <span className="badge badge-green">✓ {gapData.strengths?.length || 0} Strengths</span>
                {gapData.gaps?.length > 0 && <span className="badge badge-orange">Biggest: {gapData.gaps[0]?.skill} (-{gapData.gaps[0]?.gap}%)</span>}
              </div>
            </div>
          </div>

          {/* View tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:18, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:11, padding:4, width:'fit-content' }}>
            {[['overview','📊 Overview'],['radar','🕸 Radar'],['bar','📈 Bar Chart'],['table','📋 Table']].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', background:view===v?'var(--navy-4)':'transparent', fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:view===v?'var(--white)':'var(--gray-600)', transition:'all .18s' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Overview */}
          {view === 'overview' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {/* Gaps */}
              <div className="card">
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--red)', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                  <TrendingDown size={13} /> Skills to Improve ({gapData.gaps?.length})
                </h3>
                {gapData.gaps?.length === 0 && <p style={{ color:'var(--gray-500)', fontSize:13 }}>No gaps — you meet all benchmarks! 🏆</p>}
                {gapData.gaps?.map((g, i) => (
                  <div key={i} style={{ marginBottom:12, padding:'10px 12px', background:'rgba(239,68,68,.04)', border:'1px solid rgba(239,68,68,.1)', borderRadius:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13 }}>{g.skill}</span>
                      <PriorityBadge p={g.priority} />
                    </div>
                    <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:6 }}>
                      You: <strong style={{ color:'var(--orange)' }}>{g.proven}%</strong> · Need: <strong style={{ color:'var(--white)' }}>{g.required}%</strong> · Gap: <strong style={{ color:'var(--red)' }}>-{g.gap}%</strong>
                    </div>
                    <div style={{ position:'relative', height:6, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'visible' }}>
                      <div style={{ height:'100%', width:`${g.proven}%`, background:g.proven>=50?'var(--orange)':'var(--red)', borderRadius:3, transition:'width 1s' }} />
                      <div style={{ position:'absolute', top:-2, height:10, width:2, background:'rgba(255,255,255,.3)', borderRadius:1, left:`${g.required}%` }} title={`Target: ${g.required}%`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              <div className="card">
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--green)', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                  <TrendingUp size={13} /> Your Strengths ({gapData.strengths?.length})
                </h3>
                {gapData.strengths?.length === 0 && <p style={{ color:'var(--gray-500)', fontSize:13 }}>Complete challenges to reveal your strengths!</p>}
                {gapData.strengths?.map((s, i) => (
                  <div key={i} style={{ marginBottom:12, padding:'10px 12px', background:'rgba(16,185,129,.04)', border:'1px solid rgba(16,185,129,.12)', borderRadius:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13 }}>{s.skill}</span>
                      <span style={{ fontSize:11, color:'var(--green)', fontFamily:'var(--font-mono)', fontWeight:700 }}>+{s.surplus}% above</span>
                    </div>
                    <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:6 }}>
                      You: <strong style={{ color:'var(--green)' }}>{s.proven}%</strong> · Required: <strong style={{ color:'var(--white)' }}>{s.required}%</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width:`${Math.min(s.proven, 100)}%`, background:'var(--green)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Radar */}
          {view === 'radar' && radarData.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-400)', marginBottom:18, textTransform:'uppercase', letterSpacing:'.7px' }}>Skills Radar — You vs Required</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,.07)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill:'#64748b', fontSize:11 }} />
                  <Radar name="Required" dataKey="required" stroke="rgba(255,255,255,.2)" fill="rgba(255,255,255,.04)" strokeDasharray="5 3" />
                  <Radar name="Your Score" dataKey="proven" stroke="#06b6d4" fill="rgba(6,182,212,.18)" />
                  <Legend formatter={v => <span style={{ color:'var(--gray-400)', fontSize:12 }}>{v}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar chart */}
          {view === 'bar' && barData.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-400)', marginBottom:18, textTransform:'uppercase', letterSpacing:'.7px' }}>Gap by Skill</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="vertical" margin={{ left:20, right:20 }}>
                  <XAxis type="number" domain={[0,100]} tick={{ fill:'#64748b', fontSize:10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill:'#94a3b8', fontSize:11 }} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="proven" name="You" radius={[0,4,4,0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.proven >= d.required ? '#10b981' : d.proven >= d.required*0.7 ? '#f59e0b' : '#ef4444'} />)}
                  </Bar>
                  <Bar dataKey="required" name="Required" fill="rgba(255,255,255,.08)" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          {view === 'table' && (
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(255,255,255,.03)', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                    {['Skill','Your Score','Required','Gap / Surplus','Priority'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', fontSize:11, fontFamily:'var(--font-display)', fontWeight:700, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.7px', textAlign:'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(gapData.role_requirements || {}).map(([skill, req], i) => {
                    const proven = Math.round(provenScores[skill] || 0);
                    const diff = proven - req;
                    return (
                      <tr key={skill} style={{ borderBottom:'1px solid rgba(255,255,255,.04)', background:i%2===0?'transparent':'rgba(255,255,255,.01)' }}>
                        <td style={{ padding:'11px 16px', fontFamily:'var(--font-display)', fontWeight:700, fontSize:13 }}>{skill}</td>
                        <td style={{ padding:'11px 16px', fontFamily:'var(--font-mono)', fontSize:13, color:proven>=req?'var(--green)':proven>=req*.7?'var(--orange)':'var(--red)', fontWeight:600 }}>{proven}%</td>
                        <td style={{ padding:'11px 16px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--gray-400)' }}>{req}%</td>
                        <td style={{ padding:'11px 16px', fontFamily:'var(--font-mono)', fontSize:13, color:diff>=0?'var(--green)':'var(--red)', fontWeight:700 }}>{diff>=0?'+':''}{diff}%</td>
                        <td style={{ padding:'11px 16px' }}>
                          {diff < 0 ? <PriorityBadge p={Math.abs(diff)>30?'high':Math.abs(diff)>15?'medium':'low'} /> : <span className="badge badge-green">✓ Met</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:13 }} onClick={() => navigate('/challenges')}>
              <Zap size={13} /> Take More Challenges
            </button>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', fontSize:13 }} onClick={() => navigate('/roadmap')}>
              <Map size={13} /> Generate Roadmap <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}