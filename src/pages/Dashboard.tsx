import { getDashboardData } from "@/api/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type DashboardResponse = {
  success: boolean;
  data: {
    summaryCards: {
      TotalRecords: number;
      TotalCustomers: number;
      TotalVendors: number;
      ValidGSTNs: number;
      InvalidMissingGSTNs: number;
      OverseasRecords: number;
    };
    charts: {
      gstnDistribution: {
        ValidGSTN: number;
        InvalidMissing: number;
      };
      currencyDistribution: {
        Currency: string;
        Count: number;
      }[];
    };
    alerts: {
      severity: string;
      title: string;
      message: string;
      actionLabel: string;
    }[];
  };
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dashboard = data?.data;

  // API INTEGRATION FOR DASHBOARD DATA
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboardData();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "Total Records",
      value: dashboard?.summaryCards?.TotalRecords,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Valid GSTNs",
      value: dashboard?.summaryCards?.ValidGSTNs,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Invalid/Missing GSTNs",
      value: dashboard?.summaryCards?.InvalidMissingGSTNs,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      title: "Overseas Customers",
      value: dashboard?.summaryCards?.OverseasRecords,
      icon: Globe,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];


  const gstnData = dashboard?.charts?.gstnDistribution
    ? [
        {
          name: "Valid GSTN",
          value: dashboard.charts.gstnDistribution.ValidGSTN,
          color: "#10b981",
        },
        {
          name: "Invalid/Missing",
          value: dashboard.charts.gstnDistribution.InvalidMissing,
          color: "#f43f5e",
        },
      ]
    : [];

  const currencyData =
    dashboard?.charts?.currencyDistribution?.map((item) => ({
      name: item.Currency,
      count: item.Count,
    })) || [];


  const alerts =
    dashboard?.alerts.map((alert) => ({
      type: alert.severity, // ✅ direct mapping
      title: alert.title,
      description: alert.message,
      buttonText: alert.actionLabel,
    })) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-slate-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-rose-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of Customer Master Database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stat.value ?? 0}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>GSTN Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gstnData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gstnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {gstnData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers by Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currencyData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Quality Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const isError = alert.type === "error";

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isError
                      ? "border-rose-200 bg-rose-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle
                      className={`w-5 h-5 ${
                        isError ? "text-rose-600" : "text-amber-600"
                      }`}
                    />
                    <div>
                      <h4
                        className={`font-medium ${
                          isError ? "text-rose-900" : "text-amber-900"
                        }`}
                      >
                        {alert.title}
                      </h4>
                      <p
                        className={`text-sm ${
                          isError ? "text-rose-700" : "text-amber-700"
                        }`}
                      >
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  <button
                    className={`text-sm font-medium underline ${
                      isError
                        ? "text-rose-700 hover:text-rose-800"
                        : "text-amber-700 hover:text-amber-800"
                    }`}
                  >
                    {alert.buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
