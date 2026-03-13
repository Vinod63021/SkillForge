import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [apiKey,          setApiKey]          = useState(localStorage.getItem('sf_api_key') || '');
  const [profile,         setProfileState]    = useState(null);
  const [studentId,       setStudentId]       = useState(localStorage.getItem('sf_student_id') || null);
  const [provenScores,    setProvenScores]    = useState({});
  const [gapData,         setGapData]         = useState(null);
  const [roadmap,         setRoadmap]         = useState(null);
  const [challengeHistory,setChallengeHistory]= useState([]);
  const [loadingSession,  setLoadingSession]  = useState(false);

  // On mount — restore session from Supabase if student_id exists
  useEffect(() => {
    if (studentId && !profile) restoreSession(studentId);
  }, []);

  const restoreSession = async (id) => {
    setLoadingSession(true);
    try {
      const data = await api.getStudentFull(id);
      if (data.student) {
        setProfileState(data.student);
        setProvenScores(data.proven_scores || {});
        if (data.gap_data) setGapData(data.gap_data);
        if (data.roadmap)  setRoadmap(data.roadmap);
        if (data.quiz_history) setChallengeHistory(data.quiz_history);
      }
    } catch(e) {
      console.error('Session restore failed:', e);
    }
    setLoadingSession(false);
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('sf_api_key', key);
  };

  const setProfile = async (profileData, analysisData) => {
    // profileData = saved student from Supabase (has .id)
    setProfileState(profileData);
    if (profileData?.id) {
      setStudentId(profileData.id);
      localStorage.setItem('sf_student_id', profileData.id);
    }
    // Seed proven scores from AI analysis if available
    if (analysisData?.estimated_scores) {
      setProvenScores(prev => {
        const merged = { ...analysisData.estimated_scores };
        Object.keys(prev).forEach(k => { if (prev[k] > (merged[k] || 0)) merged[k] = prev[k]; });
        return merged;
      });
    }
  };

  const addChallengeResult = (result) => {
    setChallengeHistory(prev => [result, ...prev]);
    setProvenScores(prev => {
      const existing = prev[result.skill] || 0;
      return { ...prev, [result.skill]: Math.max(existing, result.skill_confidence || result.percentage || 0) };
    });
  };

  const clearSession = () => {
    setProfileState(null);
    setStudentId(null);
    setProvenScores({});
    setGapData(null);
    setRoadmap(null);
    setChallengeHistory([]);
    localStorage.removeItem('sf_student_id');
  };

  return (
    <AppContext.Provider value={{
      apiKey, saveApiKey,
      profile, setProfile,
      studentId,
      provenScores, setProvenScores, addChallengeResult,
      gapData,  setGapData,
      roadmap,  setRoadmap,
      challengeHistory,
      loadingSession,
      clearSession,
      restoreSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);