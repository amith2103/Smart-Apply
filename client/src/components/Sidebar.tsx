import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, PlusCircle } from "lucide-react";
import { InsightBanner } from "./InsightBanner";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/applications", label: "Applications", icon: Briefcase },
  ];

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border min-h-screen fixed left-0 top-0 z-40 hidden md:flex flex-col">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-foreground">
          Smart Apply
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-0.5">
          Job Application Tracker
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href === "/applications" && location.startsWith("/applications"));
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
              ${isActive 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }
            `}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 space-y-3 border-t border-sidebar-border">
        <InsightBanner 
          variant="sidebar" 
          text="Consistency beats intensity. Track every application." 
        />
        <Link 
          href="/applications/new"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          data-testid="sidebar-add-application"
        >
          <PlusCircle className="w-4 h-4" />
          Add Application
        </Link>
      </div>
    </aside>
  );
}
