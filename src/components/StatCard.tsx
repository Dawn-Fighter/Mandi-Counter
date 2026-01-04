import type { StatCardProps } from '@/types';

export function StatCard({ title, value, icon, subtitle }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                {icon && <span className="stat-icon">{icon}</span>}
                <span className="stat-title">{title}</span>
            </div>
            <div className="stat-value">{value}</div>
            {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
    );
}
