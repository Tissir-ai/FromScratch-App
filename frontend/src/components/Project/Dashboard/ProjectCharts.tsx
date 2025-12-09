'use client'

import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ProgressDatum {
  month: string;
  completed: number;
  inProgress: number;
}

export interface CostDatum {
  category: string;
  value: number;
  color: string;
}

export default function ProjectCharts({
  projectProgressData,
  costData,
}: {
  projectProgressData: ProgressDatum[];
  costData: CostDatum[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Progress Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Project Improvements</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={projectProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="inProgress"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="In Progress"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost Breakdown Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Cost Breakdown</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={costData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="value"
            >
              {costData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}