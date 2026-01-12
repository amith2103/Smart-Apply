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
        relative overflow-hidden rounded-2xl border border-primary/10
        bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5
        ${isDashboard 
          ? "px-5 py-4 shadow-sm" 
          : "px-4 py-3 shadow-none"
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
          flex items-center justify-center rounded-lg bg-primary/10
          ${isDashboard ? "w-9 h-9" : "w-7 h-7"}
        `}>
          <Sparkles className={`text-primary ${isDashboard ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`
            flex items-center gap-2 
            ${isDashboard ? "mb-0.5" : ""}
          `}>
            <span className={`
              font-semibold tracking-wide text-primary uppercase
              ${isDashboard ? "text-[10px]" : "text-[9px]"}
            `}>
              Insight
            </span>
          </div>
          <p className={`
            text-foreground/80 leading-snug
            ${isDashboard ? "text-sm" : "text-xs"}
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
