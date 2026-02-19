import { Landmark, Leaf, DollarSign, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import {
  obligations,
  recentActivity,
  liabilityTrendData,
  getTotalLiability,
  getTotalAccretion,
  getObligationsByStatus,
  formatCurrency,
  formatCurrencyK,
} from "@/data/mock-data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = ["hsl(187, 60%, 38%)", "hsl(38, 92%, 50%)", "hsl(152, 55%, 42%)", "hsl(215, 14%, 50%)"];

const Dashboard = () => {
  const navigate = useNavigate();
  const totalARO = getTotalLiability("ARO");
  const totalERO = getTotalLiability("ERO");
  const totalCombined = getTotalLiability();
  const totalAccretion = getTotalAccretion();
  const statusData = getObligationsByStatus();
  const activeCount = obligations.filter(o => o.status === "Active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Environmental obligation overview — Q1 2026</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/aro")}>
            <Landmark className="mr-1 h-4 w-4" /> New ARO
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/ero")}>
            <Leaf className="mr-1 h-4 w-4" /> New ERO
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total ARO Liability"
          value={formatCurrencyK(totalARO)}
          subtitle={`${obligations.filter(o => o.type === "ARO").length} obligations`}
          icon={Landmark}
          trend={{ value: "3.2% from last quarter", positive: false }}
        />
        <StatCard
          title="Total ERO Liability"
          value={formatCurrencyK(totalERO)}
          subtitle={`${obligations.filter(o => o.type === "ERO").length} obligations`}
          icon={Leaf}
          trend={{ value: "2.8% from last quarter", positive: false }}
        />
        <StatCard
          title="Combined Exposure"
          value={formatCurrencyK(totalCombined)}
          subtitle={`${activeCount} active obligations`}
          icon={DollarSign}
        />
        <StatCard
          title="Annual Accretion"
          value={formatCurrencyK(totalAccretion)}
          subtitle="Current year expense"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Liability Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Liability Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liabilityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatCurrencyK(v)} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="aro" stackId="1" stroke="hsl(187, 60%, 38%)" fill="hsl(187, 60%, 38%)" fillOpacity={0.3} name="ARO" />
                  <Area type="monotone" dataKey="ero" stackId="1" stroke="hsl(32, 80%, 50%)" fill="hsl(32, 80%, 50%)" fillOpacity={0.3} name="ERO" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Obligations by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {statusData.map((item, i) => (
                <div key={item.status} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                  {item.status} ({item.count})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Badge variant={item.type === "ARO" ? "default" : "secondary"} className="text-[10px] w-10 justify-center">
                    {item.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{item.obligationName}</p>
                    <p className="text-xs text-muted-foreground">{item.action}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
