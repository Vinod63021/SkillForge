import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, User, Zap, Target, Map, Menu, X,
  ChevronRight, LogOut, Sparkles, Database, Bell
} from 'lucide-react';

const NAV = [
  { to:'/dashboard',    label:'Dashboard',      icon:LayoutDashboard, color:'#8b5cf6', desc:'Overview & stats' },
  { to:'/profile',      label:'My Profile',     icon:User,            color:'#3b82f6', desc:'Skills & info' },
  { to:'/challenges',   label:'Challenges',     icon:Zap,             color:'#06b6d4', desc:'Test your skills' },
  { to:'/gap-analysis', label:'Gap Analysis',   icon:Target,          color:'#0d9488', desc:'Find your gaps' },
  { to:'/roadmap',      label:'Learning Path',  icon:Map,             color:'#f59e0b', desc:'Your roadmap' },
];

export default function Layout({ children }) {
  const { profile, provenScores, gapData, roadmap, clearSession } = useApp();
  const navigate = useNavigate();
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const progress = [
    !!profile,
    Object.keys(provenScores).length > 0,
    !!gapData,
    !!roadmap,
  ].filter(Boolean).length;

  const progressPct = Math.round((progress / 4) * 100);

  return (
    <div style={{ display:'flex', minHeight:'100vh', position:'relative' }}>
      <div className="bg-mesh" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:39, backdropFilter:'blur(4px)' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position:'fixed', top:0, left:0, bottom:0,
        width: collapsed ? 68 : 'var(--sidebar-w)',
        background: 'rgba(7,16,31,.96)',
        borderRight: '1px solid rgba(255,255,255,.06)',
        backdropFilter: 'blur(20px)',
        display:'flex', flexDirection:'column',
        transition: 'width .3s cubic-bezier(.4,0,.2,1)',
        zIndex:40, overflow:'hidden',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 14px' : '20px 20px', borderBottom:'1px solid rgba(255,255,255,.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#1a56db,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(6,182,212,.35)' }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:16, background:'linear-gradient(135deg,#22d3ee,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>SkillForge</div>
                <div style={{ fontSize:9, color:'var(--gray-600)', letterSpacing:'1px', textTransform:'uppercase' }}>AI Career Platform</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#1a56db,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
              <Sparkles size={16} color="#fff" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="btn-ghost btn" style={{ padding:6, borderRadius:8, minWidth:'unset' }}>
            {collapsed ? <Menu size={15} /> : <X size={15} />}
          </button>
        </div>

        {/* Profile mini */}
        {!collapsed && profile && (
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,#1a56db,#8b5cf6)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, fontSize:14, flexShrink:0 }}>
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.name}</div>
                <div style={{ fontSize:11, color:'var(--gray-500)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.target_role}</div>
              </div>
            </div>
            {/* Journey progress */}
            <div style={{ marginTop:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:10, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:'.7px' }}>Journey</span>
                <span style={{ fontSize:10, color:'var(--cyan)', fontFamily:'var(--font-mono)' }}>{progressPct}%</span>
              </div>
              <div className="progress-bar" style={{ height:4 }}>
                <div className="progress-fill" style={{ width:`${progressPct}%`, background:'linear-gradient(90deg,var(--blue),var(--cyan))' }} />
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:3, overflowY:'auto' }}>
          {NAV.map((item) => {
            const active = loc.pathname === item.to;
            return (
              <button key={item.to}
                onClick={() => { navigate(item.to); setMobileOpen(false); }}
                style={{
                  display:'flex', alignItems:'center', gap:11,
                  padding: collapsed ? '10px 0' : '10px 12px',
                  borderRadius:10, cursor:'pointer', border:'none', width:'100%',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? `${item.color}18` : 'transparent',
                  borderLeft: active ? `3px solid ${item.color}` : '3px solid transparent',
                  transition: 'all .18s',
                }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.background='rgba(255,255,255,.04)'; }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}
              >
                <item.icon size={17} color={active ? item.color : 'var(--gray-600)'} style={{ flexShrink:0 }} />
                {!collapsed && (
                  <div style={{ flex:1, textAlign:'left', minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color: active ? 'var(--white)' : 'var(--gray-400)' }}>{item.label}</div>
                    <div style={{ fontSize:10, color:'var(--gray-600)', marginTop:1 }}>{item.desc}</div>
                  </div>
                )}
                {!collapsed && active && <ChevronRight size={13} color={item.color} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom: DB indicator + logout */}
        {!collapsed && (
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 10px', background:'rgba(16,185,129,.07)', border:'1px solid rgba(16,185,129,.15)', borderRadius:8, marginBottom:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite' }} />
              <Database size={11} color="var(--green)" />
              <span style={{ fontSize:11, color:'var(--green)', fontWeight:600 }}>Supabase Connected</span>
            </div>
            <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'flex-start', fontSize:12, padding:'8px 10px' }}
              onClick={() => { clearSession(); navigate('/'); }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: collapsed ? 68 : 'var(--sidebar-w)',
        flex:1, minHeight:'100vh', position:'relative', zIndex:1,
        transition:'margin-left .3s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Top bar */}
        <div style={{ position:'sticky', top:0, zIndex:30, background:'rgba(3,8,16,.85)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,.05)', padding:'0 28px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button className="btn btn-ghost" style={{ padding:7, display:'none' }} onClick={() => setMobileOpen(true)}>
            <Menu size={17} />
          </button>
          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
            <span style={{ color:'var(--gray-600)' }}>SkillForge</span>
            <ChevronRight size={12} color="var(--gray-600)" />
            <span style={{ color:'var(--white)', fontWeight:600, fontFamily:'var(--font-display)' }}>
              {NAV.find(n => n.to === loc.pathname)?.label || 'Home'}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {gapData && (
              <span className="badge badge-green" style={{ fontSize:11 }}>
                {gapData.readiness_score}% Ready
              </span>
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{ animation:'fadeUp .4s ease both' }}>
          {children}
        </div>
      </main>
    </div>
  );
}