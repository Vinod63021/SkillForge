import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Profile from './pages/Profile';
import Challenges from './pages/Challenges';
import GapAnalysis from './pages/GapAnalysis';
import Roadmap from './pages/Roadmap';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }) {
  const { apiKey } = useApp();
  if (!apiKey) return <Navigate to="/setup" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"            element={<Landing />} />
      <Route path="/setup"       element={<Setup />} />
      <Route path="/profile"     element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/challenges"  element={<ProtectedRoute><Layout><Challenges /></Layout></ProtectedRoute>} />
      <Route path="/gap-analysis"element={<ProtectedRoute><Layout><GapAnalysis /></Layout></ProtectedRoute>} />
      <Route path="/roadmap"     element={<ProtectedRoute><Layout><Roadmap /></Layout></ProtectedRoute>} />
      <Route path="/dashboard"   element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}