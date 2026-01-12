import { useDashboardStats } from "@/hooks/use-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Loader2, Briefcase, Users, Trophy, XCircle, HandCoins, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

const STATUS_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'];
const SPONSORSHIP_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#6b7280'];

export default function Dashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return <div className="text-destructive p-4">Failed to load dashboard data.</div>;
  }

  const { counts, chartData } = stats;

  const statCards = [
    { 
      title: "Total Applications", 
      value: counts.totalApplications, 
      icon: Briefcase, 
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      href: "/applications"
    },
    { 
      title: "Interviews", 
      value: counts.interviewsCount, 
      icon: Users, 
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
      href: "/applications?status=Interviewing"
    },
    { 
      title: "Offers", 
      value: counts.offersCount, 
      icon: Trophy, 
      color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
      href: "/applications?status=Offer"
    },
    { 
      title: "Rejected", 
      value: counts.rejectionsCount, 
      icon: XCircle, 
      color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
      href: "/applications?status=Rejected"
    },
    { 
      title: "Sponsorship Offered", 
      value: counts.sponsorshipOfferedCount, 
      icon: HandCoins, 
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
      href: "/applications?sponsorshipStatus=Offered"
    },
    { 
      title: "Overdue Follow-ups", 
      value: counts.overdueFollowUpsCount, 
      icon: AlertTriangle, 
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      href: "/applications"
    },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your job search progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card 
            key={stat.title}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(stat.href)}
            data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '6px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontSize: '13px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Applications Trend (Last 8 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.applicationsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="periodLabel" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                    contentStyle={{ 
                      borderRadius: '6px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontSize: '13px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Sponsorship Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.sponsorshipBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.sponsorshipBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SPONSORSHIP_COLORS[index % SPONSORSHIP_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '6px', 
                    border: '1px solid hsl(var(--border))', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: '13px'
                  }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
