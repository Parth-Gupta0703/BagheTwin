import React from 'react';
import { useI18n } from '../i18n';
import type { RiskTier } from '../types';

interface StatusBadgeProps {
  tier: RiskTier | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  tier,
  size = 'md',
  showIcon = true,
}) => {
  const { t } = useI18n();

  const normalized = tier.toUpperCase();
  const isNormal = normalized === 'LOW' || normalized === 'NORMAL' || normalized === 'HEALTHY';
  const isCritical = normalized === 'CRITICAL';
  const isAttention = !isNormal && !isCritical;

  const label = isCritical
    ? t.status.critical
    : isAttention
    ? t.status.attention
    : t.status.normal;

  const icon = isCritical ? '!' : isAttention ? '▲' : '●';

  const colorClasses = isCritical
    ? 'bg-red-50 text-red-700 border-red-200'
    : isAttention
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const sizeClasses =
    size === 'lg'
      ? 'px-3.5 py-1.5 text-sm'
      : size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && <span className="leading-none">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

// Simple dot indicator for compact displays
export const StatusDot: React.FC<{ tier: RiskTier | string; size?: number }> = ({
  tier,
  size = 8,
}) => {
  const normalized = tier.toUpperCase();
  const isNormal = normalized === 'LOW' || normalized === 'NORMAL' || normalized === 'HEALTHY';
  const isCritical = normalized === 'CRITICAL';
  const color = isCritical
    ? 'bg-red-500'
    : isNormal
    ? 'bg-emerald-500'
    : 'bg-amber-500';

  return (
    <span
      className={`inline-block rounded-full ${color}`}
      style={{ width: size, height: size }}
    />
  );
};
