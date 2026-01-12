import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const INSIGHTS = [
  "Consistency beats intensity. Track every application.",
  "Follow up within 5 days to boost your response rate by 20%.",
  "Quality over quantity. Tailor each application.",
];

function getDailyInsight(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return INSIGHTS[dayOfYear % INSIGHTS.length];
}

interface InsightBannerProps {
  variant: "dashboard" | "sidebar";
  text?: string;
}

export function InsightBanner({ variant, text }: InsightBannerProps) {
  const isDashboard = variant === "dashboard";
  const displayText = text || getDailyInsight();

  const content = (
    <motion.div
      initial={{ opacity: 0, y: isDashboard ? 8 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isDashboard ? 0.3 : 0.4, ease: "easeOut" }}
      className={`
        group relative overflow-hidden rounded-2xl transition-all duration-300
        ${isDashboard 
          ? "px-5 py-4 shadow-sm border border-primary/10 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-purple-50/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 dark:border-primary/20" 
          : "px-4 py-3 border border-white/10 bg-slate-800/50 hover:bg-slate-800/60 hover:border-white/15 hover:shadow-lg hover:shadow-primary/5"
        }
      `}
    >
      {isDashboard && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
            animation: "shimmer 10s ease-in-out infinite",
          }}
        />
      )}
      
      <div className={`flex items-center ${isDashboard ? "gap-3" : "gap-2"}`}>
        <motion.div 
          className={`
            flex items-center justify-center rounded-lg
            ${isDashboard ? "w-9 h-9 bg-primary/10" : "w-7 h-7 bg-white/10"}
          `}
          whileHover={{ scale: 1.05, rotate: 3 }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className={`${isDashboard ? "w-4 h-4 text-primary" : "w-3.5 h-3.5 text-white/70"}`} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 ${isDashboard ? "mb-0.5" : ""}`}>
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
            {displayText}
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

  if (isDashboard) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Daily insight
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
