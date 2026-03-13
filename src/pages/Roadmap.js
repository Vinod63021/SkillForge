import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import {
  Map, Clock, BookOpen, Code, ArrowRight, RefreshCw,
  Play, Youtube, Search, ChevronRight, Zap, Trophy,
  CheckCircle, Circle, ArrowDown, Layers, Target, ExternalLink
} from 'lucide-react';

// ─── YouTube Search via backend proxy ────────────────────────────────────────
const YOUTUBE_API_KEY = 'AIzaSyD_placeholder'; // user can add — we use embed search

function buildYouTubeSearchURL(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function buildYouTubeEmbedSearch(query) {
  // Use YouTube's no-cookie embed with search
  return `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=0`;
}

// ─── Flowchart Node ───────────────────────────────────────────────────────────
const PHASE_COLORS = [
  { main: '#1a56db', light: 'rgba(26,86,219,0.15)',  border: 'rgba(26,86,219,0.4)',  glow: 'rgba(26,86,219,0.3)' },
  { main: '#0d9488', light: 'rgba(13,148,136,0.15)', border: 'rgba(13,148,136,0.4)', glow: 'rgba(13,148,136,0.3)' },
  { main: '#8b5cf6', light: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', glow: 'rgba(139,92,246,0.3)' },
  { main: '#f59e0b', light: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', glow: 'rgba(245,158,11,0.3)' },
  { main: '#06b6d4', light: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.4)',  glow: 'rgba(6,182,212,0.3)' },
];

function FlowNode({ phase, index, total, isActive, onClick }) {
  const c = PHASE_COLORS[index % PHASE_COLORS.length];
  const isLast = index === total - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Node */}
      <div
        onClick={onClick}
        style={{
          width: '100%', maxWidth: 680, cursor: 'pointer',
          background: isActive ? c.light : 'rgba(255,255,255,0.03)',
          border: `2px solid ${isActive ? c.main : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 16, padding: '0',
          boxShadow: isActive ? `0 0 32px ${c.glow}` : 'none',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <div style={{ background: isActive ? `${c.main}22` : 'rgba(255,255,255,0.02)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${isActive ? c.border : 'rgba(255,255,255,0.06)'}` }}>
          {/* Phase number bubble */}
          <div style={{ width: 44, height: 44, borderRadius: 14, background: isActive ? c.main : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isActive ? `0 4px 16px ${c.glow}` : 'none', transition: 'all 0.3s' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: isActive ? 'white' : 'var(--gray-400)' }}>{index + 1}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: isActive ? 'var(--white)' : 'var(--gray-300)' }}>{phase.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isActive ? c.main : 'var(--gray-500)' }}>
                <Clock size={11} /> {phase.duration_weeks} week{phase.duration_weeks > 1 ? 's' : ''}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isActive ? c.main : 'var(--gray-500)' }}>
                <Layers size={11} /> {phase.skills?.length || 0} skills
              </span>
            </div>
          </div>
          {/* Skill pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: 200 }}>
            {phase.skills?.slice(0, 3).map((sk, i) => (
              <span key={i} style={{ padding: '3px 8px', background: `${c.main}20`, border: `1px solid ${c.border}`, borderRadius: 20, fontSize: 10, color: isActive ? c.main : 'var(--gray-500)', fontWeight: 600 }}>{sk}</span>
            ))}
          </div>
          <ChevronRight size={18} color={isActive ? c.main : 'var(--gray-600)'} style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }} />
        </div>

        {/* Expanded detail */}
        {isActive && (
          <div style={{ padding: '20px', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'grid', gap: 12 }}>
              {phase.topics?.map((topic, ti) => (
                <div key={ti} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: `1px solid ${c.border}` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: c.main, marginBottom: 10 }}>
                    📌 {topic.skill}
                  </div>
                  {/* Topics to learn */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Topics</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {topic.topics_to_learn?.map((t, i) => (
                        <span key={i} style={{ padding: '3px 10px', background: `${c.main}12`, border: `1px solid ${c.main}25`, borderRadius: 20, fontSize: 11, color: 'var(--gray-200)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  {/* Resources */}
                  {topic.resources?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Resources</div>
                      {topic.resources.map((r, ri) => (
                        <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--gray-300)', marginBottom: 4 }}>
                          {r.type === 'course' ? <BookOpen size={11} color="var(--cyan)" /> : <Code size={11} color="var(--purple)" />}
                          <span>{r.name}</span>
                          {r.url_hint && <span style={{ color: 'var(--gray-600)', fontSize: 11 }}>· {r.url_hint}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Project */}
                  {topic.project_idea && (
                    <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', fontSize: 12, color: 'var(--gray-200)' }}>
                      🛠 <strong style={{ color: 'var(--green)' }}>Build: </strong>{topic.project_idea}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connector arrow (not on last) */}
      {!isLast && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
          <div style={{ width: 2, height: 24, background: `linear-gradient(to bottom, ${c.main}, ${PHASE_COLORS[(index+1) % PHASE_COLORS.length].main})`, opacity: 0.5 }} />
          <ArrowDown size={16} color={PHASE_COLORS[(index+1) % PHASE_COLORS.length].main} style={{ opacity: 0.7, marginTop: -2 }} />
        </div>
      )}
    </div>
  );
}

// ─── YouTube Videos Section ───────────────────────────────────────────────────
function YouTubeSection({ skills, targetRole }) {
  const [activeSkill, setActiveSkill]   = useState(skills[0] || '');
  const [searchQuery, setSearchQuery]   = useState('');
  const [videos, setVideos]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searched, setSearched]         = useState(false);

  // Auto-generate YouTube search terms per skill
  const getSearchQuery = (skill) => `${skill} tutorial for beginners ${targetRole} 2024`;

  useEffect(() => {
    if (activeSkill) fetchVideos(activeSkill);
  }, [activeSkill]);

  const fetchVideos = async (skill) => {
    setLoading(true);
    setVideos([]);
    setSearched(false);
    const q = searchQuery.trim() || getSearchQuery(skill);
    // Use YouTube oEmbed / noembed to get real video data
    // We'll use the YouTube search URL embed approach
    try {
      // Fetch YouTube search results via RSS/scrape-free approach
      // Using YouTube's public search endpoint
      const query = encodeURIComponent(q);
      const res = await fetch(
        `https://www.youtube.com/results?search_query=${query}&sp=EgIQAQ%253D%253D`,
        { mode: 'no-cors' }
      ).catch(() => null);

      // Since direct YouTube fetch is CORS-blocked, we generate smart embed queries
      // that show real videos via iframe embeds with search
      const videoQueries = [
        `${skill} tutorial complete course`,
        `${skill} for beginners step by step`,
        `${skill} crash course ${targetRole}`,
        `learn ${skill} fast 2024`,
        `${skill} projects for beginners`,
        `${skill} interview preparation`,
      ];

      const generatedVideos = videoQueries.map((vq, i) => ({
        id: i,
        embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(vq)}&index=1`,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(vq)}`,
        title: vq,
        skill: skill,
      }));

      setVideos(generatedVideos.slice(0, 6));
      setSearched(true);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!activeSkill) return;
    fetchVideos(activeSkill);
  };

  return (
    <div style={{ marginTop: 40 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Youtube size={20} color="#ef4444" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>Learning Videos</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>YouTube tutorials matched to your learning path — watch directly here</p>
        </div>
      </div>

      {/* Skill selector tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {skills.map(sk => (
          <button key={sk} onClick={() => { setActiveSkill(sk); setSearchQuery(''); }}
            style={{
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
              background: activeSkill === sk ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
              border: activeSkill === sk ? '1.5px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
              color: activeSkill === sk ? '#ef4444' : 'var(--gray-400)',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
            }}>
            {sk}
          </button>
        ))}
      </div>

      {/* Custom search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder={`Search "${activeSkill}" videos...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="btn btn-primary" style={{ padding: '10px 20px' }} onClick={handleSearch}>
          <Search size={14} /> Search
        </button>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery || getSearchQuery(activeSkill))}`}
          target="_blank" rel="noreferrer"
          className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: 13 }}>
          <ExternalLink size={13} /> Open YouTube
        </a>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>Finding best {activeSkill} tutorials...</div>
        </div>
      )}

      {/* Video Grid */}
      {!loading && searched && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {videos.map((v, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = ''; }}>

                {/* Embed iframe */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: 'rgba(0,0,0,0.3)' }}>
                  <iframe
                    src={v.embedUrl}
                    title={v.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Card footer */}
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-200)', marginBottom: 3, lineHeight: 1.4 }}>
                      {v.title.replace('tutorial complete course', '').replace('for beginners step by step','').replace('crash course','').trim()}
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#ef4444', fontWeight: 600 }}>{activeSkill}</span>
                  </div>
                  <a href={v.searchUrl} target="_blank" rel="noreferrer"
                    style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ExternalLink size={13} color="#ef4444" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Direct YouTube search CTA */}
          <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#ef4444', marginBottom: 3 }}>Want more {activeSkill} videos?</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Search directly on YouTube for the latest tutorials</div>
            </div>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(getSearchQuery(activeSkill))}&sp=EgIQAQ%253D%253D`}
              target="_blank" rel="noreferrer" className="btn"
              style={{ background: '#ef4444', color: 'white', padding: '10px 18px', fontSize: 13 }}>
              <Youtube size={14} /> Search on YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Roadmap Page ────────────────────────────────────────────────────────
export default function Roadmap() {
  const { apiKey, profile, gapData, roadmap, setRoadmap, studentId } = useApp();
  const navigate  = useNavigate();
  const [loading, setLoading]       = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [activeTab, setActiveTab]   = useState('flowchart'); // 'flowchart' | 'videos'

  useEffect(() => { if (!roadmap && gapData) generateRoadmap(); }, [gapData]);

  const generateRoadmap = async () => {
    if (!gapData) return;
    setLoading(true);
    try {
      const data = await api.generateRoadmap({
        name: profile.name, target_role: profile.target_role,
        skill_gaps: gapData.gaps, api_key: apiKey, student_id: studentId,
      });
      setRoadmap(data);
      setActivePhase(0);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  if (!profile) return <div style={{ padding: 40, color: 'var(--gray-400)' }}>Please complete your profile first.</div>;
  if (!gapData)  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
      <p style={{ marginBottom: 16 }}>Run Gap Analysis first to generate your roadmap.</p>
      <button className="btn btn-primary" onClick={() => navigate('/gap-analysis')}>Go to Gap Analysis <ArrowRight size={14} /></button>
    </div>
  );

  // Collect all unique skills across all phases for YouTube
  const allSkills = roadmap ? [...new Set(roadmap.phases?.flatMap(p => p.skills || []) || [])] : [];

  return (
    <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Map size={18} color="var(--cyan)" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26 }}>Learning Roadmap</h1>
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Your personalized path to <strong style={{ color: 'var(--cyan)' }}>{profile.target_role}</strong></p>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ padding: '10px 16px' }} onClick={generateRoadmap} disabled={loading}>
          <RefreshCw size={14} /> Regenerate
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--gray-400)' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            Gemini AI is crafting your roadmap...
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Analyzing your skill gaps and building a personalized path</div>
        </div>
      )}

      {roadmap && !loading && (
        <>
          {/* ── Summary Banner ── */}
          <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(26,86,219,0.08), rgba(6,182,212,0.05))', borderColor: 'rgba(6,182,212,0.2)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: 72 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 44, color: 'var(--cyan)', lineHeight: 1 }}>{roadmap.estimated_weeks}</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 3 }}>Weeks</div>
              </div>
              <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 14, color: 'var(--gray-200)', lineHeight: 1.7 }}>{roadmap.summary}</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ textAlign: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--white)' }}>{roadmap.phases?.length || 0}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Phases</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--white)' }}>{allSkills.length}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Skills</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tips ── */}
          {roadmap.tips?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {roadmap.tips.map((tip, i) => (
                <div key={i} style={{ flex: '1 1 180px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'var(--gray-300)', lineHeight: 1.5 }}>
                  💡 {tip}
                </div>
              ))}
            </div>
          )}

          {/* ── Tab Switcher ── */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { id: 'flowchart', label: '🗺 Flowchart Path',   icon: Map },
              { id: 'videos',    label: '▶ Learning Videos',  icon: Youtube },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 18px', borderRadius: 9, cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--navy-3)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                  color: activeTab === tab.id ? 'var(--cyan-bright)' : 'var(--gray-500)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                  transition: 'all 0.2s',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── FLOWCHART TAB ── */}
          {activeTab === 'flowchart' && (
            <div>
              {/* START node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
                <div style={{ padding: '10px 28px', background: 'linear-gradient(135deg, var(--blue), var(--cyan))', borderRadius: 30, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'white', boxShadow: '0 4px 20px rgba(6,182,212,0.3)', letterSpacing: '1px' }}>
                  🎯 START — {profile.name}
                </div>
                <div style={{ width: 2, height: 24, background: 'linear-gradient(to bottom, var(--cyan), var(--blue))', opacity: 0.5, marginTop: 0 }} />
                <ArrowDown size={16} color="var(--blue)" style={{ opacity: 0.7, marginTop: -2 }} />
              </div>

              {/* Phase nodes */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                {roadmap.phases?.map((phase, i) => (
                  <FlowNode
                    key={i}
                    phase={phase}
                    index={i}
                    total={roadmap.phases.length}
                    isActive={activePhase === i}
                    onClick={() => setActivePhase(activePhase === i ? -1 : i)}
                  />
                ))}
              </div>

              {/* Capstone / END */}
              {roadmap.final_project && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 0 }}>
                  <div style={{ width: 2, height: 24, background: 'linear-gradient(to bottom, var(--purple), var(--cyan))', opacity: 0.5 }} />
                  <ArrowDown size={16} color="var(--purple)" style={{ opacity: 0.7, marginTop: -2, marginBottom: 8 }} />
                  <div style={{ width: '100%', maxWidth: 680, padding: '18px 22px', background: 'rgba(139,92,246,0.08)', border: '2px solid rgba(139,92,246,0.35)', borderRadius: 16, boxShadow: '0 0 24px rgba(139,92,246,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Trophy size={20} color="var(--purple)" />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--purple)' }}>Capstone Project</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--gray-200)', lineHeight: 1.6 }}>{roadmap.final_project}</p>
                  </div>
                  <div style={{ width: 2, height: 20, background: 'rgba(139,92,246,0.4)', marginTop: 8 }} />
                  <ArrowDown size={16} color="var(--purple)" style={{ opacity: 0.7, marginTop: -2, marginBottom: 8 }} />
                  <div style={{ padding: '10px 28px', background: 'linear-gradient(135deg, var(--green), var(--teal))', borderRadius: 30, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'white', boxShadow: '0 4px 20px rgba(16,185,129,0.3)', letterSpacing: '1px' }}>
                    🏆 JOB READY — {profile.target_role}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 28 }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
                  onClick={() => setActiveTab('videos')}>
                  <Youtube size={16} /> Watch Learning Videos <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── VIDEOS TAB ── */}
          {activeTab === 'videos' && (
            <YouTubeSection skills={allSkills.length > 0 ? allSkills : (profile.skills || [])} targetRole={profile.target_role} />
          )}

          {/* ── Dashboard button ── */}
          <div style={{ marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={() => navigate('/dashboard')}>
              View Full Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}