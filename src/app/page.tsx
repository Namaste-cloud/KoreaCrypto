'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertCircle,
  Calendar,
  Building,
  ShieldCheck,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  getChangelogs,
  getPolicies,
  getProjects,
  getOrganizations,
  getStatus,
  getSourceById,
  getProjectById,
  getOrganizationById,
  ChangelogItem,
  Policy,
  Project
} from '../lib/data';

export default function DashboardPage() {
  const changelogs = getChangelogs();
  const policies = getPolicies();
  const projects = getProjects();
  const organizations = getOrganizations();
  const status = getStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChange, setSelectedChange] = useState<ChangelogItem | null>(null);

  // Stats calculation
  const totalOrgs = organizations.length;
  const totalProjects = projects.length;
  const completedOrgs = organizations.filter(o => o.investigationStatus === '조사완료').length;
  const stageCounts = projects.reduce((acc, p) => {
    acc[p.currentStage] = (acc[p.currentStage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Business areas breakdown
  const areaBreakdown = [
    { area: '토큰증권(STO)', count: projects.filter(p => p.businessArea.includes('토큰증권')).length, color: '#38BDF8' },
    { area: '자산 토큰화 / MMF', count: projects.filter(p => p.businessArea.includes('토큰화')).length, color: '#10B981' },
    { area: '스테이블코인 / 결제', count: projects.filter(p => p.businessArea.includes('스테이블코인') || p.businessArea.includes('결제')).length, color: '#F59E0B' },
    { area: '예금토큰 / CBDC', count: projects.filter(p => p.businessArea.includes('예금토큰') || p.businessArea.includes('CBDC')).length, color: '#8B5CF6' },
    { area: '디지털자산 수탁', count: organizations.filter(o => o.sector === '수탁사').length, color: '#EC4899' },
    { area: '거래·중개(장외거래소)', count: projects.filter(p => p.businessArea.includes('중개') || p.businessArea.includes('거래')).length, color: '#6366F1' },
  ];

  // Upcoming policy events
  const upcomingPolicies = policies
    .filter(p => p.nextSchedule)
    .sort((a, b) => (a.nextSchedule?.date || '').localeCompare(b.nextSchedule?.date || ''));

  return (
    <div className="container">
      {/* Overview Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          종합 현황 대시보드
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          국내 주요 금융기관의 디지털자산·STO 사업 추진 단계, 시장 인프라, 금융당국 정책 변동을 실시간으로 추적합니다.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>조사 대상 기관</span>
            <Building size={18} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {totalOrgs} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>개사</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-green)', marginTop: '4px' }}>
            정밀 조사 완료 {completedOrgs}개사 (증권·은행 중심)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>추진 중인 사업·프로젝트</span>
            <Layers size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {totalProjects} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>개 프로젝트</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            PoC {stageCounts['PoC'] || 0}건 · 실증 {stageCounts['실증'] || 0}건 · 협약 {stageCounts['발표·협약'] || 0}건
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>핵심 법령·정책 의제</span>
            <ShieldCheck size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {policies.length} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>건</span>
          </div>
          <div style={{ fontSize: '12px', color: '#FBBF24', marginTop: '4px' }}>
            2027.2.4 STO 시행 앞두고 하위법규 예고 중
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>자동 갱신 상태</span>
            <Database size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
            {status.systemStatus}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            마지막 정상 수집: {status.lastSuccessAt.slice(0, 10)} 06:31
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Column: Recent Changes & Events */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={18} color="#38BDF8" />
                <span>최근 주요 변화 및 확인된 진전</span>
              </div>
              <Link href="/changelog" className="btn btn-secondary btn-sm">
                전체 변경 이력 ({changelogs.length})
                <ArrowRight size={14} />
              </Link>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              공식 보도자료 및 인가 사실에 기반해 검증된 실질적 상태 변화 목록입니다. (클릭 시 세부 근거 확인)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {changelogs.slice(0, 5).map((chg) => (
                <div
                  key={chg.id}
                  onClick={() => setSelectedChange(chg)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38BDF8')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-blue">{chg.targetName}</span>
                      <span className="badge badge-muted">{chg.field}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {chg.timestamp.slice(0, 10)}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {chg.summary}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>
                      <strong style={{ color: '#F87171' }}>이전:</strong> {chg.oldValue || '(없음)'} → <strong style={{ color: '#34D399' }}>현재:</strong> {chg.newValue}
                    </span>
                    <span style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      근거 확인 <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Policies & Sector Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Key Policy Deadlines */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={18} color="#F59E0B" />
                <span>주요 제도 추진 일정 & 마일스톤</span>
              </div>
              <Link href="/policies" className="btn btn-secondary btn-sm">
                정책 전문
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {upcomingPolicies.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{p.shortTitle}</span>
                    <span className="badge badge-amber">{p.nextSchedule?.date}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {p.nextSchedule?.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    소관: {p.authority} · 현재: {p.currentStage}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Breakdown */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Layers size={18} color="#10B981" />
                <span>사업 분야별 프로젝트 분포</span>
              </div>
              <Link href="/companies" className="btn btn-secondary btn-sm">
                프로젝트 목록
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {areaBreakdown.map((item) => (
                <div key={item.area}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.area}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.count}개</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (item.count / 8) * 100)}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* KB Securities Strategy Spotlight */}
      <div className="card" style={{ border: '1px solid rgba(56, 189, 248, 0.4)', background: 'linear-gradient(180deg, #112238 0%, #0C1A2E 100%)' }}>
        <div className="card-header">
          <div className="card-title" style={{ color: '#38BDF8' }}>
            <Building size={18} />
            <span>KB증권 STO & 디지털자산 사업 동향 포커스</span>
          </div>
          <span className="badge badge-blue">주관 사업 3건 집중 분석</span>
        </div>

        <div className="grid-3">
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              차세대 인프라: KB STO V2
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              회사채·사모MMF 온체인화 지원 및 에이전틱 AI를 활용한 상품 심사·발행 자동화 PoC
            </p>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
              단계: PoC 진행 중 (2027.2 시행 대비)
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              글로벌 인프라: 캔톤 네트워크 연계
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              캔톤 재단·웨이브릿지와 3자 MOU 체결. 골드만삭스·DTCC 참여 글로벌 금융망 연계 모델 검토
            </p>
            <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600 }}>
              단계: 발표·협약 (2026.06)
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              기관 발행 파트너: 시큐리타이즈 & 옵티미즘
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              블랙록 BUIDL 파트너사 시큐리타이즈 및 이더리움 L2 옵티미즘과 기관 토큰증권 협력 체계 구축
            </p>
            <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>
              단계: 발표·협약 (2026.09)
            </div>
          </div>
        </div>
      </div>

      {/* Change Evidence Modal */}
      {selectedChange && (
        <div className="modal-overlay" onClick={() => setSelectedChange(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                변경 사실 및 원천 근거 확인
              </div>
              <button onClick={() => setSelectedChange(null)} className="btn btn-secondary btn-sm">
                닫기
              </button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                항목: {selectedChange.targetName} ({selectedChange.field})
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
                {selectedChange.summary}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ color: '#F87171', fontWeight: 600, marginBottom: '2px' }}>변경 전 상태</div>
                  <div>{selectedChange.oldValue || '(없음)'}</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ color: '#34D399', fontWeight: 600, marginBottom: '2px' }}>변경 후 상태</div>
                  <div>{selectedChange.newValue}</div>
                </div>
              </div>
            </div>

            {/* Evidence Source details */}
            {(() => {
              const src = getSourceById(selectedChange.evidenceSourceId);
              if (!src) return null;
              return (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#38BDF8', marginBottom: '8px' }}>
                    원천 근거 자료
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                    {src.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    발행처: {src.publisher} | 문서유형: {src.docType} | 사건일: {src.eventDate} | 근거수준: <span className="badge badge-green">{src.evidenceLevel}</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <ExternalLink size={14} />
                      공식 원문 바로가기
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
