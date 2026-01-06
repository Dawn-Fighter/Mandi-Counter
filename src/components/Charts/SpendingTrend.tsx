import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/utils/calculations';

interface DataPoint {
    date: string;
    amount: number;
}

interface SpendingTrendProps {
    data: DataPoint[];
}

export function SpendingTrend({ data }: SpendingTrendProps) {
    // Process data to be chronological and formatted
    const chartData = [...data].reverse().map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    }));

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground/40 text-sm font-medium">
                Not enough data
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                {/* Subtle Grid */}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />

                <XAxis
                    dataKey="displayDate"
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.7 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={30}
                />
                <YAxis
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.7 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                    width={45} // Consistent width
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: 'var(--foreground)', fontSize: '13px', fontWeight: 600 }}
                    cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '4 4' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Amount']}
                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}
                />
                <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
