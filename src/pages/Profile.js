import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import {
  User, Plus, X, ArrowRight, BookOpen, Code, Briefcase,
  Heart, CheckCircle, Info, AlertTriangle, Star, Zap,
  Lock, TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';

const ROLES = [
  'Data Scientist','AI Engineer','Software Developer',
  'IoT Engineer','Full Stack Developer','ML Engineer'
];

/* ── Complete role requirements: all skills a role needs ─────────────────── */
const ROLE_REQUIREMENTS = {
  'Data Scientist': {
    core:    ['Python','Machine Learning','Statistics','SQL','Data Visualization'],
    advanced:['Deep Learning','Feature Engineering','Model Evaluation','Pandas','Scikit-learn'],
    tools:   ['Jupyter Notebook','Git','Tableau/Power BI','TensorFlow or PyTorch'],
  },
  'AI Engineer': {
    core:    ['Python','Deep Learning','Machine Learning','LLM/NLP','MLOps'],
    advanced:['Model Fine-tuning','Prompt Engineering','API Development','Docker','Cloud Platforms'],
    tools:   ['HuggingFace','LangChain','FastAPI','Git','Kubernetes'],
  },
  'Software Developer': {
    core:    ['Python','JavaScript','Data Structures','Algorithms','Databases'],
    advanced:['System Design','REST APIs','Version Control','Testing','CI/CD'],
    tools:   ['Git','Docker','Linux','Postman','VS Code'],
  },
  'IoT Engineer': {
    core:    ['Embedded C','Python','Electronics','MQTT/Protocols','Linux'],
    advanced:['Sensors/Hardware','Cloud IoT','Real-time Processing','RTOS','PCB Design'],
    tools:   ['Arduino','Raspberry Pi','AWS IoT','Node-RED','Wireshark'],
  },
  'Full Stack Developer': {
    core:    ['JavaScript','React','Node.js','Databases','REST APIs'],
    advanced:['CSS/HTML','System Design','TypeScript','Authentication','DevOps Basics'],
    tools:   ['Git','Docker','MongoDB','PostgreSQL','Webpack'],
  },
  'ML Engineer': {
    core:    ['Python','Machine Learning','MLOps','Docker/Kubernetes','Model Optimization'],
    advanced:['Cloud Platforms','Data Engineering','Feature Stores','Distributed Training','API Development'],
    tools:   ['MLflow','Airflow','Spark','Terraform','Prometheus'],
  },
};

/* Flat list of all skills for a role */
const allRoleSkills = (role) => {
  const r = ROLE_REQUIREMENTS[role];
  if (!r) return [];
  return [...r.core, ...r.advanced, ...r.tools];
};

const COMMON_COURSES = [
  'CS50','Machine Learning (Coursera)','Deep Learning Specialization',
  'Web Dev Bootcamp','Data Structures & Algorithms','Statistics for Data Science',
  'The Complete Python Bootcamp','React - The Complete Guide',
];

/* ── Tag chip ─────────────────────────────────────────────────────────────── */
function TagChip({ label, onRemove, color, extra }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'4px 10px', background:`${color}14`,
      border:`1px solid ${color}28`, borderRadius:20,
      fontSize:12, color:'var(--white)',
    }}>
      {extra && <span style={{ fontSize:10 }}>{extra}</span>}
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', display:'flex', padding:0, lineHeight:1 }}>
          <X size={11}/>
        </button>
      )}
    </span>
  );
}

/* ── Simple text tag input ────────────────────────────────────────────────── */
function TagInput({ label, icon: Icon, color, tags, setTags, placeholder, suggestions=[] }) {
  const [input, setInput] = useState('');
  const add = (v) => { const t=v.trim(); if(t && !tags.includes(t)) setTags([...tags,t]); setInput(''); };
  const remove = (t) => setTags(tags.filter(x=>x!==t));
  return (
    <div style={{ marginBottom:20 }}>
      <label className="label" style={{ display:'flex', alignItems:'center', gap:5 }}>
        <Icon size={11} color={color}/>{label}
      </label>
      {tags.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
          {tags.map(t => <TagChip key={t} label={t} onRemove={()=>remove(t)} color={color}/>)}
        </div>
      )}
      <div style={{ display:'flex', gap:8 }}>
        <input className="input" style={{ flex:1 }} placeholder={placeholder} value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'||e.key===','){e.preventDefault();add(input);}}}
        />
        <button className="btn btn-ghost" style={{ padding:'9px 13px' }} onClick={()=>add(input)} disabled={!input.trim()}>
          <Plus size={14}/>
        </button>
      </div>
      {suggestions.filter(s=>!tags.includes(s)).length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:7 }}>
          {suggestions.filter(s=>!tags.includes(s)).slice(0,8).map(s=>(
            <button key={s} onClick={()=>add(s)}
              style={{ padding:'3px 9px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:20, fontSize:11, color:'var(--gray-500)', cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='var(--white)';e.currentTarget.style.borderColor=color;}}
              onMouseLeave={e=>{e.currentTarget.style.color='var(--gray-500)';e.currentTarget.style.borderColor='rgba(255,255,255,.07)';}}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── The big skill gap panel shown in Step 2 ─────────────────────────────── */
function SkillGapPanel({ role, mySkills, setSkills }) {
  const reqs   = ROLE_REQUIREMENTS[role] || {};
  const [open, setOpen] = useState({ core:true, advanced:false, tools:false });

  const toggle = (k) => setOpen(p => ({...p,[k]:!p[k]}));

  const STATUS = {
    core:     { label:'Core Skills',     color:'#ef4444', icon:'🔴', desc:'Must-have to get hired. Industry minimum.' },
    advanced: { label:'Advanced Skills', color:'#f59e0b', icon:'🟡', desc:'Separates you from other candidates.' },
    tools:    { label:'Tools & Frameworks', color:'#06b6d4', icon:'🔵', desc:'Day-to-day tools used in this role.' },
  };

  const mySkillsLower = mySkills.map(s=>s.toLowerCase());
  const hasSkill = (s) => mySkillsLower.some(m => m.includes(s.toLowerCase()) || s.toLowerCase().includes(m));

  const totalNeeded = Object.values(reqs).flat().length;
  const totalHave   = Object.values(reqs).flat().filter(s=>hasSkill(s)).length;
  const coverPct    = totalNeeded ? Math.round((totalHave/totalNeeded)*100) : 0;

  return (
    <div style={{ marginBottom:22 }}>
      {/* Header bar */}
      <div style={{
        padding:'14px 16px',
        background:'linear-gradient(135deg,rgba(26,86,219,.08),rgba(6,182,212,.04))',
        border:'1px solid rgba(6,182,212,.2)', borderRadius:'12px 12px 0 0',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10,
      }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, color:'var(--white)', display:'flex', alignItems:'center', gap:7 }}>
            <TrendingUp size={14} color="var(--cyan)"/> Skills Required for <span style={{ color:'var(--cyan)' }}>{role}</span>
          </div>
          <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:3 }}>
            Add the missing ones to your profile so SkillForge can track your progress
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:coverPct>=70?'var(--green)':coverPct>=40?'var(--orange)':'var(--red)' }}>{coverPct}%</div>
            <div style={{ fontSize:10, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'.6px' }}>Coverage</div>
          </div>
        </div>
      </div>

      {/* Coverage progress */}
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderTop:'none', padding:'10px 16px' }}>
        <div style={{ display:'flex', gap:3 }}>
          {Object.values(reqs).flat().map((s,i) => (
            <div key={i} style={{ flex:1, height:6, borderRadius:3, background:hasSkill(s)?'var(--green)':'rgba(255,255,255,.07)', transition:'background .3s' }}/>
          ))}
        </div>
        <div style={{ display:'flex', gap:14, marginTop:7, fontSize:11 }}>
          <span style={{ color:'var(--green)' }}>✅ {totalHave} you have</span>
          <span style={{ color:'var(--red)' }}>❌ {totalNeeded-totalHave} missing</span>
          <span style={{ color:'var(--gray-600)' }}>{totalNeeded} total needed</span>
        </div>
      </div>

      {/* Sections: core / advanced / tools */}
      {Object.entries(reqs).map(([cat, skillList]) => {
        const st       = STATUS[cat];
        const missing  = skillList.filter(s=>!hasSkill(s));
        const have     = skillList.filter(s=>hasSkill(s));
        return (
          <div key={cat} style={{ border:'1px solid rgba(255,255,255,.06)', borderTop:'none', background:'rgba(255,255,255,.015)', overflow:'hidden' }}>
            {/* Section header - clickable */}
            <button onClick={()=>toggle(cat)}
              style={{ width:'100%', padding:'11px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'transparent', border:'none', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <span style={{ fontSize:14 }}>{st.icon}</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:st.color }}>{st.label}</div>
                  <div style={{ fontSize:11, color:'var(--gray-600)', marginTop:1 }}>{st.desc}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:11, color:'var(--green)', fontWeight:600 }}>{have.length}/{skillList.length}</span>
                {missing.length > 0 && <span style={{ fontSize:11, color:st.color, fontWeight:700 }}>+{missing.length} missing</span>}
                {open[cat] ? <ChevronUp size={14} color="var(--gray-600)"/> : <ChevronDown size={14} color="var(--gray-600)"/>}
              </div>
            </button>

            {/* Expanded skill chips */}
            {open[cat] && (
              <div style={{ padding:'4px 16px 14px', animation:'fadeUp .25s ease' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {skillList.map(s => {
                    const had = hasSkill(s);
                    return (
                      <button key={s}
                        onClick={() => { if (!had) { setSkills(prev => prev.includes(s)?prev:[...prev,s]); } }}
                        title={had ? 'You already have this skill' : `Click to add "${s}" to your skills`}
                        style={{
                          display:'inline-flex', alignItems:'center', gap:5,
                          padding:'5px 11px', borderRadius:20, cursor:had?'default':'pointer',
                          fontFamily:'var(--font-display)', fontWeight:700, fontSize:11,
                          border:`1.5px solid ${had?'rgba(16,185,129,.35)':'rgba(255,255,255,.1)'}`,
                          background:had?'rgba(16,185,129,.1)':'rgba(255,255,255,.02)',
                          color:had?'var(--green)':'var(--gray-400)',
                          transition:'all .18s',
                        }}
                        onMouseEnter={e=>{ if(!had){ e.currentTarget.style.borderColor=st.color; e.currentTarget.style.background=`${st.color}12`; e.currentTarget.style.color=st.color; }}}
                        onMouseLeave={e=>{ if(!had){ e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.background='rgba(255,255,255,.02)'; e.currentTarget.style.color='var(--gray-400)'; }}}
                      >
                        {had ? <CheckCircle size={11} color="var(--green)"/> : <Plus size={11} color="var(--gray-600)"/>}
                        {s}
                        {!had && <span style={{ fontSize:9, padding:'1px 5px', background:`${st.color}18`, borderRadius:10, color:st.color, border:`1px solid ${st.color}30` }}>Add</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Missing callout */}
                {missing.length > 0 && (
                  <div style={{ marginTop:10, padding:'9px 12px', background:`${st.color}08`, border:`1px solid ${st.color}20`, borderRadius:9, fontSize:12, color:'var(--gray-400)', lineHeight:1.6 }}>
                    <span style={{ color:st.color, fontWeight:700 }}>⚠️ You're missing: </span>
                    {missing.map((s,i) => (
                      <button key={s} onClick={()=>setSkills(prev=>prev.includes(s)?prev:[...prev,s])}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--white)', fontWeight:600, fontSize:12, padding:'0 2px', textDecoration:'underline', textDecorationStyle:'dotted', textDecorationColor:st.color }}>
                        {s}{i<missing.length-1?', ':''}
                      </button>
                    ))}
                    <span style={{ color:'var(--gray-600)', marginLeft:6 }}>(click to add)</span>
                  </div>
                )}

                {/* All have message */}
                {missing.length === 0 && (
                  <div style={{ marginTop:8, padding:'8px 12px', background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.18)', borderRadius:9, fontSize:12, color:'var(--green)' }}>
                    ✅ You have all {cat} skills for this role!
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom summary */}
      <div style={{ padding:'12px 16px', background:'rgba(255,255,255,.015)', border:'1px solid rgba(255,255,255,.06)', borderTop:'none', borderRadius:'0 0 12px 12px' }}>
        {totalHave < totalNeeded ? (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
            <AlertTriangle size={14} color="var(--orange)" style={{ flexShrink:0, marginTop:1 }}/>
            <div style={{ fontSize:12, color:'var(--gray-400)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--orange)' }}>{totalNeeded - totalHave} skills needed</strong> for <strong style={{ color:'var(--white)' }}>{role}</strong> are not yet in your profile.
              {' '}Even if you know them partially — add them! SkillForge's challenges will measure your actual level and show what's left to learn.
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Star size={14} color="var(--orange)" fill="var(--orange)"/>
            <div style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>
              You've added all skills needed for {role}! Now let's prove them with challenges. 🎯
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Skills step with my skills + role gap side by side ─────────────────── */
function SkillsStep({ form, skills, setSkills, courses, setCourses, projects, setProjects, interests, setInterests }) {
  const suggestedSkills = allRoleSkills(form.target_role);
  const [showAll, setShowAll] = useState(false);

  /* Skills the student has that are NOT in the role requirements */
  const reqSkillsLower = allRoleSkills(form.target_role).map(s=>s.toLowerCase());
  const extraSkills = skills.filter(s => !reqSkillsLower.some(r => r.includes(s.toLowerCase()) || s.toLowerCase().includes(r)));

  return (
    <div>
      {/* Required role skills panel */}
      <SkillGapPanel role={form.target_role} mySkills={skills} setSkills={setSkills}/>

      {/* My skills added */}
      <div className="card" style={{ marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <label className="label" style={{ margin:0, display:'flex', alignItems:'center', gap:5 }}>
            <Code size={11} color="var(--blue-light)"/> Your Current Skills *
          </label>
          <span style={{ fontSize:11, color:'var(--gray-500)' }}>{skills.length} added</span>
        </div>

        {skills.length === 0 && (
          <div style={{ padding:'12px', background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.15)', borderRadius:9, marginBottom:12, fontSize:12, color:'var(--red)', display:'flex', gap:7 }}>
            <Info size={13} style={{ flexShrink:0, marginTop:1 }}/> Add at least 1 skill to continue. Use the panel above to quick-add role skills.
          </div>
        )}

        {/* All added skills shown as chips */}
        {skills.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
            {skills.map(s => {
              const reqLow = allRoleSkills(form.target_role).map(x=>x.toLowerCase());
              const isRequired = reqLow.some(r => r.includes(s.toLowerCase()) || s.toLowerCase().includes(r));
              return (
                <TagChip key={s} label={s}
                  color={isRequired ? 'var(--cyan)' : 'var(--purple)'}
                  extra={isRequired ? '✓' : ''}
                  onRemove={() => setSkills(skills.filter(x=>x!==s))}
                />
              );
            })}
          </div>
        )}

        {/* Legend */}
        {skills.length > 0 && (
          <div style={{ display:'flex', gap:12, marginBottom:12, fontSize:11, color:'var(--gray-600)' }}>
            <span><span style={{ color:'var(--cyan)' }}>✓</span> Required for your role</span>
            <span><span style={{ color:'var(--purple)' }}>●</span> Extra / bonus skill</span>
          </div>
        )}

        {/* Manual type-in */}
        <div style={{ display:'flex', gap:8 }}>
          <input id="skill-input" className="input" style={{ flex:1 }} placeholder="Type a skill and press Enter..."
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const v = e.target.value.trim();
                if (v && !skills.includes(v)) setSkills([...skills, v]);
                e.target.value = '';
              }
            }}
          />
          <button className="btn btn-ghost" style={{ padding:'9px 13px' }}
            onClick={() => {
              const el = document.getElementById('skill-input');
              const v = el.value.trim();
              if (v && !skills.includes(v)) setSkills([...skills, v]);
              el.value = '';
            }}>
            <Plus size={14}/>
          </button>
        </div>
      </div>

      <TagInput label="Completed Courses"  icon={BookOpen}  color="var(--teal)"   tags={courses}   setTags={setCourses}   placeholder="e.g. ML by Andrew Ng"  suggestions={COMMON_COURSES} />
      <TagInput label="Projects Built"     icon={Briefcase} color="var(--purple)" tags={projects}  setTags={setProjects}  placeholder="e.g. Chatbot, Dashboard" />
      <TagInput label="Interests"          icon={Heart}     color="var(--orange)" tags={interests} setTags={setInterests} placeholder="e.g. NLP, Computer Vision"/>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function Profile() {
  const { apiKey, setProfile, profile } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [step,    setStep]    = useState(0);

  const [form, setForm] = useState({
    name:        profile?.name        || '',
    email:       profile?.email       || '',
    college:     profile?.college     || '',
    year:        profile?.year        || '2nd Year',
    target_role: profile?.target_role || 'Data Scientist',
  });
  const [skills,    setSkills]    = useState(profile?.skills    || []);
  const [courses,   setCourses]   = useState(profile?.courses   || []);
  const [projects,  setProjects]  = useState(profile?.projects  || []);
  const [interests, setInterests] = useState(profile?.interests || []);

  /* When role changes, reset skills so gap panel refreshes */
  const changeRole = (r) => {
    setForm(f => ({...f, target_role:r}));
  };

  const STEPS = ['Basic Info', 'Target Role', 'Skills & Experience'];
  const canNext0  = form.name.trim().length > 1;
  const canNext1  = !!form.target_role;
  const canSubmit = canNext0 && canNext1 && skills.length > 0;

  const completeness = [form.name, form.email, form.college, skills.length>0, courses.length>0, projects.length>0].filter(Boolean).length;
  const pct = Math.round((completeness/6)*100);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const result = await api.saveProfile({ ...form, skills, courses, projects, interests, api_key:apiKey });
      await setProfile(result.student, result.analysis);
      setSaved(true);
      setTimeout(() => navigate('/challenges'), 1000);
    } catch(e) {
      alert('Error: '+e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding:'28px 32px', maxWidth:800, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:8 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'rgba(59,130,246,.15)', border:'1px solid rgba(59,130,246,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <User size={17} color="var(--blue-light)"/>
          </div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22 }}>Build Your Profile</h1>
            <p style={{ fontSize:12, color:'var(--gray-500)' }}>Tell us about yourself — we'll show exactly what skills you need for your dream job</p>
          </div>
        </div>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:11 }}>
            <span style={{ color:'var(--gray-600)' }}>Profile completeness</span>
            <span style={{ color:pct===100?'var(--green)':'var(--cyan)', fontFamily:'var(--font-mono)' }}>{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%`, background:'linear-gradient(90deg,var(--blue),var(--cyan))' }}/></div>
        </div>
      </div>

      {/* Step tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:24, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:4 }}>
        {STEPS.map((s, i) => (
          <button key={i}
            onClick={() => (i===0 || (i===1 && canNext0) || (i===2 && canNext1 && canNext0)) ? setStep(i) : null}
            style={{ flex:1, padding:'9px', borderRadius:9, border:'none', cursor:'pointer',
              background:step===i?'var(--navy-4)':'transparent',
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:12,
              color:step===i?'var(--white)':i<step?'var(--cyan)':'var(--gray-600)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'all .2s' }}>
            {i<step
              ? <CheckCircle size={12} color="var(--cyan)"/>
              : <span style={{ width:16,height:16,borderRadius:'50%',background:step===i?'var(--blue)':'rgba(255,255,255,.06)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,color:step===i?'#fff':'var(--gray-600)' }}>{i+1}</span>
            }
            {s}
          </button>
        ))}
      </div>

      {/* ── Step 0: Basic Info ── */}
      {step === 0 && (
        <div className="card" style={{ animation:'fadeUp .35s ease' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--cyan)', marginBottom:18 }}>Basic Information</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
            </div>
            <div>
              <label className="label">College / University</label>
              <input className="input" placeholder="Your institution" value={form.college} onChange={e=>setForm({...form,college:e.target.value})}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="label">Year of Study</label>
              <select className="input" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}>
                {['1st Year','2nd Year','3rd Year','4th Year','Graduate','Working Professional'].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
            <button className="btn btn-primary" onClick={()=>setStep(1)} disabled={!canNext0}>
              Next: Choose Role <ArrowRight size={13}/>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Target Role ── */}
      {step === 1 && (
        <div className="card" style={{ animation:'fadeUp .35s ease' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--cyan)', marginBottom:6 }}>Target Career Role</h2>
          <p style={{ fontSize:13, color:'var(--gray-500)', marginBottom:18 }}>
            Pick your dream job. We'll show you every skill needed to get it.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
            {ROLES.map(r => {
              const active = form.target_role === r;
              const reqs   = ROLE_REQUIREMENTS[r] || {};
              const coreCount = reqs.core?.length || 0;
              return (
                <button key={r} onClick={()=>changeRole(r)}
                  style={{ padding:'14px 16px', borderRadius:12, cursor:'pointer', textAlign:'left',
                    border:`1.5px solid ${active?'var(--cyan)':'rgba(255,255,255,.07)'}`,
                    background:active?'rgba(6,182,212,.08)':'rgba(255,255,255,.02)',
                    transition:'all .2s' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:active?'var(--cyan-bright)':'var(--gray-300)', marginBottom:6 }}>
                    {active && <span style={{ marginRight:5 }}>🎯</span>}{r}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:6 }}>
                    {(reqs.core||[]).slice(0,3).map(s=>(
                      <span key={s} style={{ fontSize:10, padding:'1px 6px', background:'rgba(255,255,255,.05)', borderRadius:4, color:'var(--gray-500)' }}>{s}</span>
                    ))}
                    {coreCount>3 && <span style={{ fontSize:10, color:'var(--gray-600)' }}>+{coreCount-3} more</span>}
                  </div>
                  <div style={{ fontSize:11, color:active?'var(--cyan)':'var(--gray-600)' }}>
                    {Object.values(reqs).flat().length} skills needed total
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'space-between' }}>
            <button className="btn btn-ghost" onClick={()=>setStep(0)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(2)}>
              Next: Add Skills <ArrowRight size={13}/>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Skills ── */}
      {step === 2 && (
        <div style={{ animation:'fadeUp .35s ease' }}>
          <SkillsStep
            form={form}
            skills={skills}    setSkills={setSkills}
            courses={courses}  setCourses={setCourses}
            projects={projects} setProjects={setProjects}
            interests={interests} setInterests={setInterests}
          />
          <div className="card" style={{ display:'flex', gap:10, justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' }}>
            <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
            {saved ? (
              <div style={{ display:'flex', alignItems:'center', gap:7, color:'var(--green)', fontWeight:600, fontSize:13 }}>
                <CheckCircle size={16}/> Saved! Redirecting...
              </div>
            ) : (
              <button className="btn btn-primary" style={{ padding:'11px 24px' }} onClick={handleSubmit} disabled={!canSubmit || loading}>
                {loading
                  ? <><div className="spinner" style={{ width:14,height:14 }}/> Saving...</>
                  : <>Save & Start Challenges <Zap size={13}/></>
                }
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}