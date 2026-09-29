"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SizeDistribution } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS_PALETTE = [
  "#00b1cd",
  "#000000",
   "#6b7280",
   "#83dce9",
   "#343434",
   "#a5a5a5",
   "#007c91",
];

interface PieChartBySizeProps {
  data: SizeDistribution[];
  isLoading: boolean;
}

export function PieChartBySize({ data, isLoading }: PieChartBySizeProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock por Talle</CardTitle>
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
          <CardTitle>Stock por Talle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-12">Sin datos</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: d.sizeName,
    value: d.totalStock,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stock por Talle</CardTitle>
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
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS_PALETTE[index % COLORS_PALETTE.length]}
                  />
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
