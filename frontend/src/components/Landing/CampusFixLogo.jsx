import { Shield, Wrench, Zap } from "lucide-react";

export const CampusFixLogo = ({ size = "md" }) => {
    const isLarge = size === "lg";
    const containerSize = isLarge ? "h-20 w-20" : "h-14 w-14";
    const dashedRing = isLarge ? "rounded-2xl border-2" : "rounded-xl border";
    const glowInset = isLarge ? "inset-1 rounded-xl" : "inset-[3px] rounded-lg";
    const innerSize = isLarge ? "h-16 w-16 rounded-2xl" : "h-11 w-11 rounded-xl";
    const wrenchSize = isLarge ? 28 : 20;
    const topBadge = isLarge ? "-top-1.5 -right-1.5 h-6 w-6" : "top-0 right-0 h-4 w-4";
    const bottomBadge = isLarge ? "-bottom-1 -left-1 h-5 w-5" : "bottom-0 left-0 h-3.5 w-3.5";
    const zapSize = isLarge ? 12 : 9;
    const shieldSize = isLarge ? 10 : 8;

    return (
        <div className="relative flex items-center gap-2.5">
            <div className={`relative flex ${containerSize} items-center justify-center`}>
                <div className={`absolute inset-0 ${dashedRing} border-dashed border-campus-300/60 dark:border-campus-500/30 animate-spin-slow`} />
                <div className={`absolute ${glowInset} bg-campus-400/10 dark:bg-campus-500/10 animate-pulse-ring`} />
                <div className={`relative flex ${innerSize} items-center justify-center bg-gradient-to-br from-campus-500 to-campus-700 shadow-lg shadow-campus-500/30`}>
                    <Wrench size={wrenchSize} className="text-white animate-spin-reverse" style={{ animationDuration: "8s" }} />
                </div>
                <div className={`absolute ${topBadge} flex items-center justify-center rounded-full bg-amber-400 shadow-sm`}>
                    <Zap size={zapSize} className="text-white" />
                </div>
                <div className={`absolute ${bottomBadge} flex items-center justify-center rounded-full bg-emerald-400 shadow-sm`}>
                    <Shield size={shieldSize} className="text-white" />
                </div>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
                Campus<span className="text-campus-500">Fix</span>
            </span>
        </div>
    );
};
