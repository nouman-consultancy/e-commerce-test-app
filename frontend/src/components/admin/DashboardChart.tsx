'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  pending: '#9E9E9E',
  processing: '#1976d2',
  shipped: '#ed6c02',
  delivered: '#2e7d32',
  cancelled: '#d32f2f',
};

interface Props {
  data: { status: string; count: number }[];
}

export default function DashboardChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" vertical={false} />
        <XAxis
          dataKey="status"
          tick={{ fontSize: 12, textTransform: 'capitalize', fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(99,102,241,0.06)' }}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 4px 12px rgba(15,23,42,0.1)',
            fontSize: 13,
          }}
          formatter={(value: number) => [value, 'Orders']}
          labelFormatter={(label: string) => label.charAt(0).toUpperCase() + label.slice(1)}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map(({ status }) => (
            <Cell key={status} fill={STATUS_COLORS[status] ?? '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
