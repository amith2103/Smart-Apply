import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, PlusCircle, CheckCircle } from "lucide-react";

export function Sidebar({ onOpenNewModal }: { onOpenNewModal?: () => void }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/applications", label: "Applications", icon: Briefcase },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen fixed left-0 top-0 z-40 hidden md:flex flex-col">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Smart Apply
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">
          Career Tracker
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-primary/10 text-primary font-semibold' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }
            `}>
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {item.label}
            </Link>
          );
        })}
        
        <div className="pt-6 mt-4 border-t border-border/50">
           <button 
            onClick={onOpenNewModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
           >
             <PlusCircle className="w-5 h-5" />
             Add Application
           </button>
        </div>
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pro Tip</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Follow up within 3-5 business days to increase your response rate by 20%.
          </p>
        </div>
      </div>
    </aside>
  );
}
