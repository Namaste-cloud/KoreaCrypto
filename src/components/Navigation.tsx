'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Building2, Network, Scale, History } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '종합 현황', icon: BarChart3 },
    { href: '/companies', label: '기업·프로젝트', icon: Building2 },
    { href: '/relations', label: '생태계 관계도', icon: Network },
    { href: '/policies', label: '정책·제도', icon: Scale },
    { href: '/changelog', label: '변경 이력', icon: History },
  ];

  return (
    <nav className="main-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
