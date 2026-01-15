
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Waves, Bike, Footprints, Trophy } from 'lucide-react';

const CalendarView = ({ fullPlan, onSelectWorkout }) => {
    // Generate dates for the calendar
    // In a real tri-app, the calendar starts on the start_date of the first week of the plan
    // and spans the number of weeks in the plan.

    const weeks = useMemo(() => {
        if (!fullPlan) return [];
        return fullPlan.map(week => {
            const start = week.start_date;
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            return days.map((day, idx) => {
                const workout = week.days?.[day];
                const date = new Date(start);
                date.setDate(date.getDate() + idx);
                return {
                    day,
                    date: date.toISOString().split('T')[0],
                    workout,
                    weekNumber: week.week_number
                };
            });
        });
    }, [fullPlan]);

    if (!fullPlan || fullPlan.length === 0) return null;

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'swim': return <Waves size={14} className="text-blue-400" />;
            case 'bike': return <Bike size={14} className="text-emerald-400" />;
            case 'run': return <Footprints size={14} className="text-orange-400" />;
            default: return null;
        }
    };

    const getBg = (type) => {
        switch (type?.toLowerCase()) {
            case 'swim': return 'bg-blue-400/10 border-blue-400/20';
            case 'bike': return 'bg-emerald-400/10 border-emerald-400/20';
            case 'run': return 'bg-orange-400/10 border-orange-400/20';
            default: return 'bg-white/5 border-white/5 opacity-40';
        }
    };

    return (
        <div className="bg-[#12141c] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        Piano Strategico
                        <span className="text-xs font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {fullPlan.length} Settimane
                        </span>
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">Sguardo d'insieme sulla tua preparazione atletica</p>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4 overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    <div className="space-y-2">
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} className="grid grid-cols-7 gap-2 group">
                                {week.map((day, dIdx) => {
                                    const isRest = !day.workout || day.workout.activity === 'Rest';
                                    const sport = day.workout?.sport_type;

                                    return (
                                        <div
                                            key={dIdx}
                                            onClick={() => !isRest && onSelectWorkout(day.workout, wIdx)}
                                            className={`
                                                relative h-24 rounded-xl border p-2 transition-all duration-300
                                                ${getBg(sport)}
                                                ${!isRest ? 'cursor-pointer hover:scale-[1.03] hover:shadow-xl active:scale-95' : 'cursor-default'}
                                            `}
                                        >
                                            {/* Date Label */}
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-bold text-gray-500">
                                                    {new Date(day.date).getDate()}
                                                </span>
                                                {getIcon(sport)}
                                            </div>

                                            {!isRest ? (
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-white/90 leading-tight line-clamp-2 uppercase">
                                                        {day.workout.activity}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] font-mono font-black text-white/60">
                                                            {day.workout.duration}'
                                                        </span>
                                                        {day.workout.distance_km > 0 && (
                                                            <span className="text-[8px] font-mono text-gray-400">
                                                                {day.workout.distance_km.toFixed(1)}k
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Rest</span>
                                                </div>
                                            )}

                                            {/* Week Number Overlay (left side of first day) */}
                                            {dIdx === 0 && (
                                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center pointer-events-none">
                                                    <span className="text-[8px] font-black text-white/10 whitespace-nowrap uppercase tracking-[0.2em]">
                                                        WEEK {day.weekNumber}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="p-4 bg-white/5 flex items-center gap-6 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Swim</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Bike</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Run</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
