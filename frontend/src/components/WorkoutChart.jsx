import React from 'react';

const WorkoutChart = ({ steps: initialSteps, size = 'small' }) => {
    if (!initialSteps || initialSteps.length === 0) return null;

    // Helper to flatten steps (handles nested repeats)
    const flattenSteps = (stepsList) => {
        let items = [];
        stepsList.forEach(s => {
            // Estimate duration if missing but distance is present
            let duration = s.duration_min || 0;
            if (!duration && s.distance_m) {
                // Heuristic: 100m swimming ~ 2min, 1000m running ~ 5min
                if (s.distance_m <= 500) duration = (s.distance_m / 100) * 2;
                else duration = (s.distance_m / 1000) * 5;
            }

            if (s.repeat_count > 1) {
                for (let i = 0; i < s.repeat_count; i++) {
                    items = [...items, ...flattenSteps(s.steps)];
                }
            } else {
                items.push({ ...s, visual_duration: duration || 1 }); // Min 1 min for visibility
            }
        });
        return items;
    };

    const steps = flattenSteps(initialSteps);
    const totalDuration = steps.reduce((acc, s) => acc + (s.visual_duration || 0), 0);
    if (totalDuration === 0) return null;

    const getStepColor = (type) => {
        switch (type?.toUpperCase()) {
            case 'WARMUP': return 'bg-blue-500/80';
            case 'COOLDOWN': return 'bg-blue-400/60';
            case 'INTERVAL': return 'bg-emerald-500';
            case 'RECOVERY': return 'bg-gray-600';
            default: return 'bg-gray-500/50';
        }
    };

    const getStepHeight = (step) => {
        // Base height on intensity if available
        if (step.power_watts) {
            // Assume 400W is max height for scaling
            return `${Math.min(100, (step.power_watts / 400) * 100)}%`;
        }

        if (step.pace_ms) {
            // For pace, higher speed = higher bar. 
            // Assume 6.0 m/s (approx 2:45/km) is max height
            return `${Math.min(100, (step.pace_ms / 6.0) * 100)}%`;
        }

        // Fallback to type-based defaults if no metrics
        const type = step.type?.toUpperCase();
        switch (type) {
            case 'INTERVAL': return '90%';
            case 'WARMUP': return '50%';
            case 'COOLDOWN': return '40%';
            case 'RECOVERY': return '25%';
            default: return '40%';
        }
    };

    const containerHeight = size === 'large' ? 'h-32' : 'h-10';

    return (
        <div className={`w-full ${containerHeight} flex items-end gap-0.5 rounded-lg overflow-hidden bg-black/40 border border-white/5 p-1`}>
            {steps.map((step, idx) => {
                const widthPercent = ((step.visual_duration || 0) / totalDuration) * 100;
                return (
                    <div
                        key={idx}
                        className={`${getStepColor(step.type)} relative group transition-all hover:brightness-125 rounded-t-sm`}
                        style={{
                            width: `${widthPercent}%`,
                            height: getStepHeight(step)
                        }}
                        title={`${step.description} (${step.distance_m ? step.distance_m + 'm' : step.duration_min + '′'})`}
                    >
                        {size === 'large' && widthPercent > 10 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="text-[10px] uppercase tracking-tighter bg-black/40 px-1 rounded">
                                    {step.distance_m ? `${step.distance_m}m` : `${step.duration_min}′`}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default WorkoutChart;
