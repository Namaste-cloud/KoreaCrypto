import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import Link from 'next/link';
import { getStatus, getCoverage } from '../lib/data';
import Navigation from '../components/Navigation';

export const metadata: Metadata = {
  title: 'KoreaCrypto | 국내 금융권 디지털자산 사업·정책 모니터',
  description: 'KB증권 STO 및 기관 디지털자산 사업 담당자를 위한 경쟁사 동향, 생태계 관계도, 정책·제도 상시 모니터링 포털',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = getStatus();
  const coverage = getCoverage();

  return (
    <html lang="ko">
      <body>
        {/* Top Info Bar */}
        <div className="top-notice-bar">
          <div className="container top-notice-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="target-badge">KB증권 STO·기관디지털자산 사업 전용</span>
              <span>조사 기준일: <strong>{coverage.investigationBaseDate}</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span>조사 완료: <strong>{coverage.investigatedSectors['증권'].completed.length}개 증권사, {coverage.investigatedSectors['은행'].completed.length}개 은행 등</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: '#FBBF24' }}>※ 미공개 기업은 사업 미추진으로 단정하지 않음</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>수집 시도: {status.lastAttemptAt.slice(5, 16).replace('T', ' ')}</span>
              <span>정상 완료: {status.lastSuccessAt.slice(5, 16).replace('T', ' ')}</span>
              <span style={{ color: '#38BDF8' }}>데이터 변경: {status.lastDataChangeAt.slice(5, 16).replace('T', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Global App Header */}
        <header className="app-header">
          <div className="container header-inner">
            <div className="brand-section">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="brand-badge">PRO</span>
                <div>
                  <div className="brand-title">
                    KoreaCrypto
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#38BDF8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      INSTITUTIONAL
                    </span>
                  </div>
                  <div className="brand-subtitle">국내 금융회사 디지털자산 사업 & 정책·제도 모니터</div>
                </div>
              </Link>
            </div>

            <Navigation />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="header-status-badge">
                <span className="status-dot"></span>
                <span>자동갱신 매일 06:30 KST</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main style={{ padding: '32px 0 60px' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', padding: '32px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>KoreaCrypto 모니터링 포털 (비공개 기관용)</p>
              <p>원천 자료: 금융위원회, 한국은행, 금융감독원, 한국예탁결제원, 한국거래소 및 각 사 공시·보도자료</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p>데이터 무단 복제 및 대외 배포 금지 | KB증권 내부 사업 검토 목적</p>
              <p>최종 엔진 빌드: 2026-10-13 | Next.js 15 & Vanilla Design System</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
