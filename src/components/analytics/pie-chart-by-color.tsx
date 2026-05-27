"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ColorDistribution } from "@/types/analytics";
import { COLOR_LABELS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface PieChartByColorProps {
  data: ColorDistribution[];
  isLoading: boolean;
}

export function PieChartByColor({ data, isLoading }: PieChartByColorProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock por Color</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock por Color</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-12">Sin datos</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: COLOR_LABELS[d.colorName] ?? d.colorName,
    value: d.totalStock,
    color: d.hex ?? "#999",
  }));

  return (
    <Card className="bg-[#d5d5d5]">
      <CardHeader>
        <CardTitle className="text-base">Stock por Color</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
