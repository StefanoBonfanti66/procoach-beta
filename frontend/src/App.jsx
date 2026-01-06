import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import WorkoutLibrary from './pages/WorkoutLibrary';
import Progress from './pages/Progress';
import HelpCenter from './pages/HelpCenter';
import Login from './pages/Login';
import Chat from './pages/Chat';

const AppContent = () => {
    const location = useLocation();
    // Only show Navigation on non-onboarding pages? 
    // The prompt explicitly asking for Navigation structure implies it should be there for the app.
    // But Onboarding usually doesn't have the main app nav. 
    // However, the user asked for the "UI for /your-plan".
    // I will show Navigation on Dashboard, maybe not on Onboarding.
    const showNav = location.pathname !== '/' && location.pathname !== '/login';

    return (
        <>
            {showNav && <Navigation />}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/your-plan" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/your-plan" replace />} />
                {/* Placeholders for other links */}
                <Route path="/progress" element={<Progress />} />
                <Route path="/workout-library" element={<WorkoutLibrary />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>
        </>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
