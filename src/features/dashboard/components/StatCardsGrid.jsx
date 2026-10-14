import React from 'react';
import { StatCard } from '@/components/common/StatCard/StatCard';

export const StatCardsGrid = ({ stats = {} }) => {
  const cards = [
    {
      id: 'active_orders',
      title: 'Joriy Buyurtmalar',
      value: stats.activeOrders ?? 0,
      trendPercentage: '+12.5%',
      trendLabel: 'o\'tgan oyga nisbatan',
      icon: 'bi-cart-check',
      iconBgColor: 'bg-primary bg-opacity-10',
      iconColor: 'text-primary',
    },
    {
      id: 'active_production',
      title: 'Ishlab Chiqarishda',
      value: stats.activeProduction ?? 0,
      trendPercentage: '+8.3%',
      trendLabel: 'faol sex liniyalari',
      icon: 'bi-gear-wide-connected',
      iconBgColor: 'bg-info bg-opacity-10',
      iconColor: 'text-info',
    },
    {
      id: 'warehouse_stock',
      title: 'Ombor Zaxiralari',
      value: stats.totalStockQuantity ?? 0,
      trendPercentage: '-2.4%',
      trendLabel: 'umumiy xomashyo',
      icon: 'bi-box-seam',
      iconBgColor: 'bg-success bg-opacity-10',
      iconColor: 'text-success',
    },
    {
      id: 'low_stock',
      title: 'Zaxira Ogohlantirishlari',
      value: stats.lowStockAlerts ?? 0,
      trendPercentage: 'Brak',
      trendLabel: 'kam qolgan tovarlar',
      icon: 'bi-exclamation-triangle',
      iconBgColor: 'bg-warning bg-opacity-10',
      iconColor: 'text-warning',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((stat) => (
        <div key={stat.id} className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title={stat.title}
            value={stat.value}
            trendPercentage={stat.trendPercentage}
            trendLabel={stat.trendLabel}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            iconColor={stat.iconColor}
          />
        </div>
      ))}
    </div>
  );
};
