import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, Zap, Target, Map, Award, ChevronDown, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon:Zap,    color:'#06b6d4', title:'Prove Skills',      desc:'Take AI-generated MCQ challenges that adapt from easy to hard, giving you a real confidence score.' },
  { icon:Target, color:'#10b981', title:'Detect Gaps',       desc:'Compare your proven skills vs industry benchmarks to pinpoint exactly where you need to grow.' },
  { icon:Map,    color:'#8b5cf6', title:'Bridge the Gap',    desc:'Get a personalized phased learning roadmap with curated YouTube videos for each skill.' },
  { icon:Award,  color:'#f59e0b', title:'Get Hired Faster',  desc:'Walk into interviews with verified skill scores, a clear readiness percentage, and a certificate.' },
];

const ROLES = ['Data Scientist','AI Engineer','Full Stack Developer','ML Engineer','Software Developer','IoT Engineer'];

export default function Landing() {
  const { apiKey, profile } = useApp();
  const navigate = useNavigate();
  const [roleIdx, setRoleIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setInterval(() => setRoleIdx(i => (i+1) % ROLES.length), 2200);
    return () => clearInterval(t);
  }, []);

  const start = () => {
    if (profile) navigate('/dashboard');
    else if (apiKey) navigate('/profile');
    else navigate('/setup');
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <div className="bg-mesh" />

      {/* Grid pattern */}
      <div style={{ position:'absolute', inset:0, zIndex:0, opacity:.025,
        backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
        backgroundSize:'60px 60px' }} />

      {/* Nav */}
      <nav style={{ position:'relative', zIndex:10, padding:'20px 48px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1a56db,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(6,182,212,.4)' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, background:'linear-gradient(135deg,#22d3ee,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>SkillForge</span>
        </div>
        <button className="btn btn-secondary" onClick={start} style={{ fontSize:13 }}>
          {profile ? 'Dashboard' : 'Get Started'} <ArrowRight size={13} />
        </button>
      </nav>

      {/* Hero */}
      <section style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'60px 24px 40px', position:'relative', zIndex:1 }}>

        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 16px', background:'rgba(6,182,212,.08)', border:'1px solid rgba(6,182,212,.2)', borderRadius:30, marginBottom:32, animation: visible ? 'fadeUp .5s ease both' : 'none' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--cyan)', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:12, fontWeight:600, color:'var(--cyan)', letterSpacing:'.5px' }}>Powered by Gemini AI × Supabase</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(38px,6vw,72px)', lineHeight:1.1, maxWidth:800, marginBottom:20, animation: visible ? 'fadeUp .5s .08s ease both' : 'none', opacity:0 }}>
          Don't just list skills.{' '}
          <span className="text-gradient">Prove them.</span>
        </h1>

        {/* Role rotator */}
        <div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'clamp(15px,2.5vw,22px)', color:'var(--gray-400)', marginBottom:16, height:32, overflow:'hidden', animation: visible ? 'fadeUp .5s .16s ease both' : 'none', opacity:0 }}>
          <div style={{ animation:'slideDown .35s ease both', key:roleIdx }}>
            Your path to{' '}
            <span style={{ color:'var(--cyan-bright)' }}>{ROLES[roleIdx]}</span>
          </div>
        </div>

        <p style={{ fontSize:17, color:'var(--gray-400)', maxWidth:560, lineHeight:1.7, marginBottom:40, animation: visible ? 'fadeUp .5s .22s ease both' : 'none', opacity:0 }}>
          SkillForge uses AI to test your skills with real challenges, map gaps against industry benchmarks, and build you a personalized learning roadmap.
        </p>

        {/* CTA */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', animation: visible ? 'fadeUp .5s .3s ease both' : 'none', opacity:0 }}>
          <button className="btn btn-primary" style={{ padding:'14px 32px', fontSize:15 }} onClick={start}>
            <Sparkles size={16} /> Start for Free <ArrowRight size={15} />
          </button>
          {profile && (
            <button className="btn btn-secondary" style={{ padding:'14px 28px', fontSize:15 }} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div style={{ display:'flex', gap:40, marginTop:60, flexWrap:'wrap', justifyContent:'center', animation: visible ? 'fadeUp .5s .38s ease both' : 'none', opacity:0 }}>
          {[['6','Career Roles'],['5','Skills per Role'],['30','Max Quiz Points'],['100%','AI-Powered']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:32, background:'linear-gradient(135deg,var(--cyan-bright),var(--blue-light))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{n}</div>
              <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'60px 48px 80px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:32 }}>Everything you need to <span className="text-gradient">get hired</span></h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, maxWidth:1000, margin:'0 auto' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card card-hover" style={{ animationDelay:`${i*.08}s`, animation:'fadeUp .5s ease both', opacity:0 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${f.color}18`, border:`1px solid ${f.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'var(--gray-500)', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey steps */}
      <section style={{ padding:'0 48px 80px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:28 }}>Your journey in <span className="text-gradient">4 steps</span></h2>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, flexWrap:'wrap', maxWidth:900, margin:'0 auto' }}>
          {[
            { n:1, label:'Add API Key',    sub:'Gemini AI key',  color:'#3b82f6' },
            { n:2, label:'Build Profile',  sub:'Skills & goals', color:'#06b6d4' },
            { n:3, label:'Take Challenges',sub:'Prove yourself', color:'#8b5cf6' },
            { n:4, label:'Get Roadmap',    sub:'Learn & grow',   color:'#10b981' },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ textAlign:'center', padding:'16px 20px' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:`${s.color}18`, border:`2px solid ${s.color}40`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:s.color }}>
                  {s.n}
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>{s.label}</div>
                <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:3 }}>{s.sub}</div>
              </div>
              {i < 3 && <ChevronDown size={18} color="var(--gray-700)" style={{ transform:'rotate(-90deg)' }} />}
            </React.Fragment>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:36 }}>
          <button className="btn btn-primary" style={{ padding:'14px 36px', fontSize:15 }} onClick={start}>
            Begin Your Journey <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}