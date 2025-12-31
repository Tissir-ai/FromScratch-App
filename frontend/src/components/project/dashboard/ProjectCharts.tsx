'use client'

import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Activity, PieChart as PieChartIcon } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
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

export interface TeamPerformanceDatum {
  month: string;
  velocity: number;
  efficiency: number;
}

export interface TaskDistributionDatum {
  status: string;
  count: number;
  color: string;
}

export default function ProjectCharts({
  projectProgressData,
  costData,
  teamPerformanceData,
  taskDistribution,
}: {
  projectProgressData: ProgressDatum[];
  costData: CostDatum[];
  teamPerformanceData?: TeamPerformanceDatum[];
  taskDistribution?: TaskDistributionDatum[];
}) {
  return (
    <div className="space-y-6">
      {/* First Row - Progress and Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Chart */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Project Progress</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projectProgressData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorCompleted)"
                strokeWidth={3}
                name="Completed Tasks"
              />
              <Area
                type="monotone"
                dataKey="inProgress"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorInProgress)"
                strokeWidth={3}
                name="In Progress"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Cost Breakdown Chart */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Cost Breakdown</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
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
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Second Row - Team Performance and Task Distribution */}
      {teamPerformanceData && taskDistribution && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Performance Chart */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Team Performance</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={teamPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="velocity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Velocity (Points)"
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={3}
                  name="Efficiency (%)"
                  dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Task Status Distribution */}
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Task Status Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="status" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}