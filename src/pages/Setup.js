import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Key, ArrowRight, CheckCircle, ExternalLink, Eye, EyeOff, Sparkles, Info } from 'lucide-react';

export default function Setup() {
  const { saveApiKey } = useApp();
  const navigate = useNavigate();
  const [key, setKey]       = useState('');
  const [loading, setLoading] = useState(false);
  const [valid, setValid]   = useState(false);
  const [error, setError]   = useState('');
  const [show, setShow]     = useState(false);

  const validate = async () => {
    if (!key.trim()) return;
    setLoading(true); setError(''); setValid(false);
    try {
      await api.validateKey(key.trim());
      setValid(true);
      saveApiKey(key.trim());
      setTimeout(() => navigate('/profile'), 800);
    } catch(e) {
      setError(e.message || 'Invalid API key. Please check and try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative' }}>
      <div className="bg-mesh" />
      <div style={{ width:'100%', maxWidth:480, position:'relative', zIndex:1, animation:'fadeUp .5s ease' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#1a56db,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 8px 32px rgba(6,182,212,.35)' }}>
            <Sparkles size={26} color="#fff" />
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:28 }}>Welcome to <span className="text-gradient">SkillForge</span></h1>
          <p style={{ color:'var(--gray-500)', fontSize:14, marginTop:6 }}>Connect your Gemini API key to get started</p>
        </div>

        <div className="card" style={{ padding:28 }}>
          {/* How to get key */}
          <div style={{ padding:'12px 14px', background:'rgba(6,182,212,.06)', border:'1px solid rgba(6,182,212,.15)', borderRadius:10, marginBottom:22, display:'flex', gap:10 }}>
            <Info size={15} color="var(--cyan)" style={{ flexShrink:0, marginTop:1 }} />
            <div style={{ fontSize:12, color:'var(--gray-400)', lineHeight:1.6 }}>
              Get a free Gemini API key from{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                style={{ color:'var(--cyan)', textDecoration:'none', fontWeight:600 }}>
                Google AI Studio <ExternalLink size={10} />
              </a>
              . It's free with generous limits.
            </div>
          </div>

          {/* Key input */}
          <label className="label">Your Gemini API Key</label>
          <div style={{ position:'relative', marginBottom:16 }}>
            <Key size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-600)' }} />
            <input
              className="input"
              type={show ? 'text' : 'password'}
              placeholder="AIza..."
              value={key}
              style={{ paddingLeft:38, paddingRight:44, fontFamily:'var(--font-mono)', fontSize:13 }}
              onChange={e => { setKey(e.target.value); setError(''); setValid(false); }}
              onKeyDown={e => e.key === 'Enter' && validate()}
            />
            <button onClick={() => setShow(!show)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', padding:4 }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Error / success */}
          {error && (
            <div style={{ padding:'10px 14px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:9, marginBottom:14, fontSize:13, color:'var(--red)', animation:'fadeIn .3s ease' }}>
              ⚠️ {error}
            </div>
          )}
          {valid && (
            <div style={{ padding:'10px 14px', background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', borderRadius:9, marginBottom:14, fontSize:13, color:'var(--green)', animation:'fadeIn .3s ease', display:'flex', alignItems:'center', gap:7 }}>
              <CheckCircle size={15} /> Key verified! Redirecting...
            </div>
          )}

          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px' }} onClick={validate} disabled={!key.trim() || loading || valid}>
            {loading ? <><div className="spinner" style={{ width:15,height:15 }} /> Verifying...</> : <>Connect Key <ArrowRight size={14} /></>}
          </button>
        </div>

        {/* Privacy note */}
        <p style={{ textAlign:'center', fontSize:12, color:'var(--gray-600)', marginTop:14 }}>
          🔒 Your key is stored locally in your browser only. Never sent to our servers.
        </p>
      </div>
    </div>
  );
}