import React from 'react';
import { Bitcoin, Gift, Gamepad2 } from 'lucide-react';

interface RevenueItem {
  id: string;
  label: string;
  amount: string;
  percentage: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const revenueItems: RevenueItem[] = [
  {
    id: '1',
    label: 'Crypto',
    amount: '₦800,000',
    percentage: 68,
    icon: Bitcoin,
    iconBg: 'bg-gradient-to-br from-orange-400 to-orange-500',
    iconColor: 'text-white',
  },
  {
    id: '2',
    label: 'Giftcard',
    amount: '₦300,000',
    percentage: 26,
    icon: Gift,
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconColor: 'text-white',
  },
  {
    id: '3',
    label: 'Game points',
    amount: '₦100,000',
    percentage: 6,
    icon: Gamepad2,
    iconBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
    iconColor: 'text-white',
  },
];

const RevenueBreakdown = () => {
  return (
    <div className="bg-white/80 dark:bg-[#1C1C1C]/90 backdrop-blur-xl rounded-[20px] p-6 border border-gray-200/50 dark:border-gray-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-[24px] mb-1">
          Revenue Breakdown
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-[15px]">This month</p>
      </div>

      {/* Revenue Items */}
      <div className="space-y-4">
        {revenueItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-[#F5F5F5]/80 dark:bg-[#2D2B2B]/80 rounded-[18px] p-4 hover:bg-[#DFDFDF]/80 dark:hover:bg-[#3A3737]/80 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                {/* Left - Icon and Label */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-[14px] ${item.iconBg} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white text-[20px]">
                    {item.label}
                  </span>
                </div>

                {/* Right - Amount and Percentage */}
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white text-[20px] mb-0.5">
                    {item.amount}
                  </p>
                  <p className="font-semibold text-green-600 dark:text-green-400 text-[16px]">
                    {item.percentage}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueBreakdown;