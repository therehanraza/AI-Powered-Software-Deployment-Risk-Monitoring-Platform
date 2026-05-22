"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const colors = ["#3B82F6", "#06B6D4", "#22C55E", "#F59E0B", "#F97316", "#EF4444"];

export function RiskTrendChart({ data }: { data: { name: string; riskScore: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Release Risk Trend</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
            <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", color: "#F8FAFC" }} />
            <Line type="monotone" dataKey="riskScore" stroke="#06B6D4" strokeWidth={3} dot={{ fill: "#3B82F6" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StatusPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
              {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", color: "#F8FAFC" }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function IncidentsBarChart({ data }: { data: { module: string; incidents: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Incidents by Module</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="module" stroke="#94A3B8" fontSize={12} />
            <YAxis stroke="#94A3B8" fontSize={12} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", color: "#F8FAFC" }} />
            <Bar dataKey="incidents" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
