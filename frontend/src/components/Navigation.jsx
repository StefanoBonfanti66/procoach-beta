import React from 'react';
import { LayoutDashboard, Activity, BookOpen, HelpCircle, Mail, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#0a0c10]/80 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/your-plan')}>
                    <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-all shadow-lg shadow-blue-600/20">
                        <Activity className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight font-outfit text-white">PRO<span className="text-blue-500 text-shadow-glow">COACH</span></span>
                </div>

                {/* Center: Main Menu */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <NavItem
                        label="Il tuo piano"
                        active={isActive('/your-plan') || isActive('/dashboard')}
                        onClick={() => navigate('/your-plan')}
                        icon={LayoutDashboard}
                    />
                    <NavItem
                        label="Progressi"
                        active={isActive('/progress')}
                        onClick={() => navigate('/progress')}
                        icon={Activity}
                    />
                    <NavItem
                        label="Libreria"
                        active={isActive('/workout-library')}
                        onClick={() => navigate('/workout-library')}
                        icon={BookOpen}
                    />
                    <NavItem
                        label="Help"
                        active={isActive('/help-center')}
                        onClick={() => navigate('/help-center')}
                        icon={HelpCircle}
                    />
                </div>

                {/* Right: User Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <Mail size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all relative">
                        <Bell size={20} />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0a0c10]" />
                    </button>

                    <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />

                    <div
                        className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/onboarding')}
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-white leading-none">Stefano B.</div>
                            <div className="text-[10px] text-blue-400 mt-1 uppercase tracking-wider font-bold">Profilo Atleta</div>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-lg shadow-blue-900/20">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavItem = ({ label, active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
    >
        {Icon && <Icon size={16} />}
        <span>{label}</span>
    </button>
);

export default Navigation;
