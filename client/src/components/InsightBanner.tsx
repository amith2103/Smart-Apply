import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface InsightBannerProps {
  variant: "dashboard" | "sidebar";
  text: string;
}

export function InsightBanner({ variant, text }: InsightBannerProps) {
  const isDashboard = variant === "dashboard";

  return (
    <motion.div
      initial={{ opacity: 0, y: isDashboard ? 8 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isDashboard ? 0.35 : 0.4, ease: "easeOut" }}
      className={`
        relative overflow-hidden rounded-2xl
        ${isDashboard 
          ? "px-5 py-4 shadow-sm border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5" 
          : "px-4 py-3 border border-white/10 bg-slate-800/40"
        }
      `}
    >
      {isDashboard && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
            animation: "shimmer 10s ease-in-out infinite",
          }}
        />
      )}
      
      <div className={`flex items-center gap-3 ${isDashboard ? "" : "gap-2"}`}>
        <div className={`
          flex items-center justify-center rounded-lg
          ${isDashboard ? "w-9 h-9 bg-primary/10" : "w-7 h-7 bg-white/10"}
        `}>
          <Sparkles className={`${isDashboard ? "w-4 h-4 text-primary" : "w-3.5 h-3.5 text-white/70"}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`
            flex items-center gap-2 
            ${isDashboard ? "mb-0.5" : ""}
          `}>
            <span className={`
              font-semibold tracking-wide uppercase
              ${isDashboard ? "text-[10px] text-primary" : "text-[9px] text-primary/80"}
            `}>
              Insight
            </span>
          </div>
          <p className={`
            leading-snug
            ${isDashboard ? "text-sm text-foreground/80" : "text-xs font-medium text-slate-200"}
          `}>
            {text}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
}
