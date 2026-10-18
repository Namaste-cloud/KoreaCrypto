'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  Calendar,
  Building,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { getPolicies, getProjects, Policy } from '../../lib/data';

export default function PoliciesPage() {
  const policies = getPolicies();
  const projects = getProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.keyContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authority.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.implementationStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || p.policyType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
          정책·제도 현황 (Regulations & Policies)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          전자증권법·자본시장법 개정안 하위법규, 원화 스테이블코인 입법, 프로젝트 한강 규제특례 등 디지털자산 제도화의 법적 단계를 관리합니다.
        </p>
      </div>

      {/* Warning Alert */}
      <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={18} color="#F59E0B" />
        <span style={{ fontSize: '13px', color: '#FDE68A' }}>
          <strong>검증 원칙:</strong> 법률이나 정책 방향이 발표되었다는 이유만으로 해당 사업 전체가 허용되었다고 단정하지 않습니다. 확정 단계와 시행 시점을 구분하여 관리합니다.
        </span>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="법령명, 소관 기관, 핵심 내용 검색..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">전체 시행 상태</option>
          <option value="확정·시행 전">확정·시행 전 (법 통과/공포)</option>
          <option value="추진 중">추진 중 (입법예고/발의)</option>
          <option value="시행 중">시행 중 (규제특례 등)</option>
          <option value="연구·제안">연구·제안</option>
        </select>

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">전체 유형</option>
          <option value="법률">법률</option>
          <option value="시행령·감독규정">시행령·감독규정</option>
          <option value="정책 발표">정책 발표</option>
          <option value="입법 추진">입법 추진</option>
          <option value="규제특례">규제특례 (샌드박스)</option>
          <option value="감독 지침과 해석">감독 지침과 해석</option>
        </select>
      </div>

      {/* Policy Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredPolicies.map((pol) => {
          return (
            <div key={pol.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">{pol.policyType}</span>
                    <span
                      className={`badge ${
                        pol.implementationStatus === '확정·시행 전'
                          ? 'badge-amber'
                          : pol.implementationStatus === '시행 중'
                          ? 'badge-green'
                          : 'badge-purple'
                      }`}
                    >
                      {pol.implementationStatus}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      소관: {pol.authority}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
                    {pol.title}
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8' }}>
                    현재: {pol.currentStage}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    최종확인: {pol.lastVerifiedAt}
                  </div>
                </div>
              </div>

              {/* Key Content */}
              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  핵심 내용 요약
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {pol.keyContent}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <strong>적용 대상:</strong> {pol.applicableTargets}
                </div>
              </div>

              {/* Next Milestone */}
              {pol.nextSchedule && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px' }}>
                  <Calendar size={15} color="#F59E0B" />
                  <span style={{ fontSize: '12px', color: '#FBBF24' }}>
                    <strong>다음 일정:</strong> {pol.nextSchedule.date} — {pol.nextSchedule.title}
                  </span>
                </div>
              )}

              {/* Stage Progress Bar / Steps */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  확인된 단계 이력
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {pol.stageHistory.map((s, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', padding: '6px 10px', borderRadius: '4px', fontSize: '11px' }}>
                      <span style={{ color: '#38BDF8', fontWeight: 600 }}>{s.stage}</span>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>({s.date})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Projects Linkage */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>연계된 사업:</span>
                  {pol.relatedProjectLinks.map((link) => {
                    const proj = projects.find((p) => p.id === link.projectId);
                    return (
                      <Link
                        key={link.projectId}
                        href={`/companies?tab=projects`}
                        className={`badge ${link.impactType === '직접 적용' ? 'badge-blue' : 'badge-amber'}`}
                        title={link.description}
                      >
                        {proj?.shortName || link.projectId} ({link.impactType})
                      </Link>
                    );
                  })}
                </div>

                <a
                  href={pol.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={13} />
                  정부 공식 원문 확인
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
