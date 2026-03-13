import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Zap, Target, Map, User, TrendingUp, Award,
  ArrowRight, CheckCircle, Circle, Flame, BookOpen, Trophy, Star
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <div className="card card-hover" style={{ padding:'18px 20px', display:'flex', alignItems:'flex-start', gap:12, cursor:onClick?'pointer':'default' }} onClick={onClick}>
      <div style={{ width:42, height:42, borderRadius:11, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:11, color:'var(--gray-600)', marginBottom:3 }}>{label}</div>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'var(--white)', lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:11, color, marginTop:3 }}>{sub}</div>}
      </div>
    </div>
  );
}

function JourneyStep({ num, label, done, active }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:done?'var(--green)':active?'var(--blue)':'rgba(255,255,255,.06)', border:`1.5px solid ${done?'var(--green)':active?'var(--blue)':'rgba(255,255,255,.1)'}` }}>
        {done ? <CheckCircle size={14} color="#fff" /> : <span style={{ fontSize:11, fontWeight:700, color:active?'#fff':'var(--gray-600)' }}>{num}</span>}
      </div>
      <span style={{ fontSize:13, color:done?'var(--green)':active?'var(--white)':'var(--gray-600)', fontWeight:done||active?600:400 }}>{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { profile, provenScores, gapData, roadmap, challengeHistory, clearSession } = useApp();
  const navigate = useNavigate();
  const [certHover, setCertHover] = useState(false);

  if (!profile) return (
    <div style={{ padding:40, textAlign:'center', color:'var(--gray-400)' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>👤</div>
      <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, marginBottom:8 }}>No profile yet</h2>
      <p style={{ marginBottom:18, color:'var(--gray-500)' }}>Build your profile to see your personalized dashboard.</p>
      <button className="btn btn-primary" onClick={() => navigate('/profile')}>Build Profile <ArrowRight size={13} /></button>
    </div>
  );

  const avgScore = challengeHistory.length > 0
    ? Math.round(challengeHistory.reduce((a,c)=>a+(c.skill_confidence||c.percentage||0),0) / challengeHistory.length)
    : 0;

  const radarData = gapData ? Object.entries(gapData.role_requirements||{}).map(([skill,req]) => ({
    subject: skill.length>11 ? skill.slice(0,10)+'…' : skill,
    proven: Math.round(provenScores[skill]||0),
    required: req,
  })) : [];

  const histData = challengeHistory.slice().reverse().map((c,i) => ({
    attempt:`#${i+1}`, score:c.skill_confidence||c.percentage||0, skill:c.skill,
  }));

  const topSkills = Object.entries(provenScores).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const rs = gapData?.readiness_score || 0;
  const journeySteps = [!!profile, Object.keys(provenScores).length>0, !!gapData, !!roadmap];

  return (
    <div style={{ padding:'28px 32px', maxWidth:1120, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'rgba(139,92,246,.15)', border:'1px solid rgba(139,92,246,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <LayoutDashboard size={17} color="var(--purple)" />
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>Dashboard</h1>
          </div>
          <p style={{ color:'var(--gray-500)', fontSize:13, marginLeft:48 }}>Welcome back, <strong style={{ color:'var(--white)' }}>{profile.name}</strong>! 👋</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:20 }}>
        <StatCard icon={Zap}        label="Challenges Taken"  value={challengeHistory.length}   sub="Keep going!"     color="var(--cyan)"       onClick={() => navigate('/challenges')} />
        <StatCard icon={TrendingUp} label="Average Score"     value={`${avgScore}%`}             sub="Across all quizzes" color="var(--green)"  />
        <StatCard icon={Target}     label="Role Readiness"    value={gapData?`${rs}%`:'—'}       sub={profile.target_role} color="var(--teal)"  onClick={() => navigate('/gap-analysis')} />
        <StatCard icon={Map}        label="Roadmap Phases"    value={roadmap?.phases?.length??'—'} sub={roadmap?`~${roadmap.estimated_weeks}w total`:'Not generated'} color="var(--purple)" onClick={() => navigate('/roadmap')} />
        <StatCard icon={BookOpen}   label="Skills Proven"     value={Object.keys(provenScores).length} sub="Unique skills"  color="var(--orange)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, alignItems:'start' }}>

        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Journey progress */}
          <div className="card" style={{ background:'linear-gradient(135deg,rgba(26,86,219,.06),rgba(6,182,212,.04))', borderColor:'rgba(6,182,212,.14)' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:16 }}>Your Journey</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <JourneyStep num={1} label="Profile Created"       done={journeySteps[0]} active={!journeySteps[0]} />
              <JourneyStep num={2} label="Skills Tested"         done={journeySteps[1]} active={journeySteps[0]&&!journeySteps[1]} />
              <JourneyStep num={3} label="Gap Analysis Done"     done={journeySteps[2]} active={journeySteps[1]&&!journeySteps[2]} />
              <JourneyStep num={4} label="Roadmap Generated"     done={journeySteps[3]} active={journeySteps[2]&&!journeySteps[3]} />
            </div>
            {journeySteps.filter(Boolean).length < 4 && (
              <button className="btn btn-primary" style={{ marginTop:14, width:'100%', justifyContent:'center', fontSize:13 }}
                onClick={() => navigate(!journeySteps[1]?'/challenges':!journeySteps[2]?'/gap-analysis':'/roadmap')}>
                Continue Journey <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* Radar */}
          {radarData.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:16 }}>Skills Radar</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill:'#64748b', fontSize:10 }} />
                  <Radar name="Required" dataKey="required" stroke="rgba(255,255,255,.18)" fill="rgba(255,255,255,.03)" strokeDasharray="5 3" />
                  <Radar name="You" dataKey="proven" stroke="#06b6d4" fill="rgba(6,182,212,.18)" />
                </RadarChart>
              </ResponsiveContainer>
              <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', marginTop:8, fontSize:12 }} onClick={() => navigate('/gap-analysis')}>
                Full Gap Analysis <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Score history */}
          {histData.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:16 }}>Challenge History</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={histData}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}  />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="attempt" tick={{ fill:'#64748b', fontSize:10 }} />
                  <YAxis domain={[0,100]} tick={{ fill:'#64748b', fontSize:10 }} />
                  <Tooltip contentStyle={{ background:'var(--navy-3)', border:'1px solid rgba(255,255,255,.08)', borderRadius:8, fontSize:12 }} />
                  <Area type="monotone" dataKey="score" stroke="#06b6d4" fill="url(#sg)" strokeWidth={2} dot={{ fill:'#06b6d4', r:3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* All skill scores */}
          {Object.keys(provenScores).length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:16 }}>All Skill Scores</h3>
              {Object.entries(provenScores).sort((a,b)=>b[1]-a[1]).map(([sk,sc]) => {
                const req = gapData?.role_requirements?.[sk] || 0;
                const gap = req - sc;
                return (
                  <div key={sk} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                      <span style={{ color:'var(--gray-200)' }}>{sk}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {gap > 0 && <span style={{ fontSize:10, color:'var(--orange)' }}>-{gap}%</span>}
                        <span style={{ fontFamily:'var(--font-mono)', fontWeight:600, color:sc>=70?'var(--green)':sc>=40?'var(--orange)':'var(--red)' }}>{sc}%</span>
                      </div>
                    </div>
                    <div style={{ position:'relative', height:6, background:'rgba(255,255,255,.06)', borderRadius:3 }}>
                      <div style={{ height:'100%', width:`${sc}%`, background:sc>=70?'var(--green)':sc>=40?'var(--orange)':'var(--red)', borderRadius:3, transition:'width 1s' }} />
                      {req > 0 && <div style={{ position:'absolute', top:-1, left:`${req}%`, height:8, width:2, background:'rgba(255,255,255,.25)', borderRadius:1 }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Skill certificate */}
          <div
            onMouseEnter={() => setCertHover(true)}
            onMouseLeave={() => setCertHover(false)}
            style={{
              background:'linear-gradient(135deg,#060d1a,#0d1b2e,#112240)',
              border:`1px solid ${certHover?'rgba(6,182,212,.35)':'rgba(6,182,212,.18)'}`,
              borderRadius:16, padding:22, position:'relative', overflow:'hidden',
              transition:'all .3s', boxShadow:certHover?'0 8px 40px rgba(6,182,212,.15)':'none',
            }}>
            {/* decorative */}
            <div style={{ position:'absolute', top:-30, right:-30, width:110, height:110, borderRadius:'50%', background:'rgba(6,182,212,.06)', border:'1px solid rgba(6,182,212,.1)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-20, left:-20, width:80, height:80, borderRadius:'50%', background:'rgba(26,86,219,.07)', pointerEvents:'none' }} />

            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Award size={16} color="var(--cyan)" />
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:11, color:'var(--cyan)', textTransform:'uppercase', letterSpacing:'1px' }}>Skill Certificate</span>
            </div>

            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, marginBottom:3 }}>{profile.name}</div>
            {profile.college && <div style={{ fontSize:12, color:'var(--gray-500)', marginBottom:14 }}>{profile.college} · {profile.year}</div>}

            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
              <span className="badge badge-cyan">🎯 {profile.target_role}</span>
              {gapData && <span className="badge badge-green">✓ {rs}% Ready</span>}
              {challengeHistory.length > 0 && <span className="badge badge-purple">⚡ {challengeHistory.length} Challenges</span>}
            </div>

            {topSkills.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, color:'var(--gray-600)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.6px' }}>Top Proven Skills</div>
                {topSkills.map(([sk,sc]) => (
                  <div key={sk} style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                      <span>{sk}</span>
                      <span style={{ fontFamily:'var(--font-mono)', color:'var(--cyan)' }}>{sc}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width:`${sc}%`, background:'linear-gradient(90deg,var(--blue),var(--cyan))' }} /></div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ paddingTop:12, borderTop:'1px solid rgba(255,255,255,.05)', fontSize:10, color:'var(--gray-600)', display:'flex', justifyContent:'space-between' }}>
              <span>SkillForge · Gemini AI</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:12 }}>Quick Actions</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { label:'Take a Challenge', to:'/challenges',   color:'var(--cyan)',   icon:Zap },
                { label:'Gap Analysis',     to:'/gap-analysis', color:'var(--teal)',   icon:Target },
                { label:'My Roadmap',       to:'/roadmap',      color:'var(--purple)', icon:Map },
                { label:'Edit Profile',     to:'/profile',      color:'var(--blue-light)', icon:User },
              ].map(a => (
                <button key={a.to} className="btn btn-ghost" style={{ justifyContent:'flex-start', gap:9, padding:'9px 12px', fontSize:13, width:'100%' }}
                  onClick={() => navigate(a.to)}>
                  <a.icon size={14} color={a.color} /> {a.label}
                  <ChevronRight size={12} color="var(--gray-700)" style={{ marginLeft:'auto' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Roadmap summary */}
          {roadmap && (
            <div className="card" style={{ background:'rgba(139,92,246,.05)', borderColor:'rgba(139,92,246,.15)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                <Trophy size={15} color="var(--purple)" />
                <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--purple)' }}>Your Roadmap</span>
              </div>
              <p style={{ fontSize:12, color:'var(--gray-400)', lineHeight:1.6, marginBottom:10 }}>{roadmap.summary}</p>
              <div style={{ fontSize:11, color:'var(--gray-500)', marginBottom:10 }}>
                ~{roadmap.estimated_weeks} weeks · {roadmap.phases?.length} phases
              </div>
              <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', fontSize:12 }} onClick={() => navigate('/roadmap')}>
                View Full Roadmap <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size=16, color='currentColor', style:s }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={s}><polyline points="9 18 15 12 9 6"/></svg>;
}