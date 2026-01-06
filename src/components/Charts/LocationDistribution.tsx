import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/calculations';

interface LocationData {
    name: string;
    value: number;
    [key: string]: any;
}

interface LocationDistributionProps {
    data: LocationData[];
}

export const COLORS = ['#7000FF', '#00C2FF', '#FF0080', '#FFD700', '#00E676', '#FF9100'];

export function LocationDistribution({ data }: LocationDistributionProps) {
    if (data.length === 0) {
        return (
            <div className="h-[200px] flex items-center justify-center text-white/40 text-sm">
                No location data available
            </div>
        );
    }

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'oklch(1 0 0)',
                            borderColor: 'oklch(0.92 0 0)',
                            borderRadius: '16px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            color: 'oklch(0.145 0 0)',
                            padding: '8px 12px',
                        }}
                        itemStyle={{ color: 'oklch(0.145 0 0)', fontWeight: 500 }}
                        formatter={(value: number | undefined) => formatCurrency(value || 0)}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
