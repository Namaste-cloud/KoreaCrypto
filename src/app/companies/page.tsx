'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Download,
  GitCompare,
  X,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import {
  getOrganizations,
  getProjects,
  getPolicies,
  getProjectsForOrg,
  isOutdated,
  Organization,
  Project,
  Policy
} from '../../lib/data';

export default function CompaniesPage() {
  const organizations = getOrganizations();
  const allProjects = getProjects();
  const allPolicies = getPolicies();

  const [activeTab, setActiveTab] = useState<'companies' | 'projects'>('companies');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  
  // Detail Modal states
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Compare mode states
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Filtered organizations
  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.keyBusinessAreas.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSector = sectorFilter === 'ALL' || org.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  // Filtered projects
  const filteredProjects = allProjects.filter((proj) => {
    const matchesSearch =
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.businessArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || proj.currentStage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Toggle compare selection
  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((i) => i !== id));
    } else {
      if (compareIds.length >= 4) {
        alert('최대 4개 기업까지 비교할 수 있습니다.');
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  // CSV Export for companies
  const exportCompaniesCSV = () => {
    const headers = ['기업명', '영문명', '업권', '조사상태', '주요사업분야', '최종확인일', '요약'];
    const rows = filteredOrgs.map((o) => [
      `"${o.name}"`,
      `"${o.englishName}"`,
      `"${o.sector}"`,
      `"${o.investigationStatus}"`,
      `"${o.keyBusinessAreas.join('; ')}"`,
      `"${o.lastVerifiedAt}"`,
      `"${o.summary.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `koreacrypto_companies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
            기업 및 사업·프로젝트 현황
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            금융기관별 공식 참여 프로젝트, 역할, 기술 인프라, 사업상 의미 및 남은 쟁점을 체계적으로 검증합니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {compareIds.length > 0 && (
            <button
              onClick={() => setIsComparing(true)}
              className="btn btn-primary btn-sm"
              style={{ background: '#F59E0B' }}
            >
              <GitCompare size={14} />
              선택 기업 비교 ({compareIds.length}/4)
            </button>
          )}
          <button onClick={exportCompaniesCSV} className="btn btn-secondary btn-sm">
            <Download size={14} />
            표 내보내기 (CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('companies')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'companies' ? '#38BDF8' : 'var(--text-secondary)',
            borderBottom: activeTab === 'companies' ? '2px solid #38BDF8' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={16} />
          기업별 현황 ({filteredOrgs.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'projects' ? '#38BDF8' : 'var(--text-secondary)',
            borderBottom: activeTab === 'projects' ? '2px solid #38BDF8' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Layers size={16} />
          프로젝트별 상세 ({filteredProjects.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={activeTab === 'companies' ? "기업명, 사업 분야, 주요 전략 검색..." : "프로젝트명, 대상 자산, 기술 검색..."}
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'companies' ? (
          <select
            className="filter-select"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="ALL">전체 업권</option>
            <option value="증권">증권</option>
            <option value="은행">은행</option>
            <option value="금융지주">금융지주</option>
            <option value="수탁사">수탁사</option>
            <option value="공공·인프라">공공·인프라</option>
            <option value="핀테크">핀테크·조각투자</option>
            <option value="해외·블록체인">해외·블록체인</option>
          </select>
        ) : (
          <select
            className="filter-select"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="ALL">전체 추진 단계</option>
            <option value="발표·협약">발표·협약</option>
            <option value="PoC">PoC (개념검증)</option>
            <option value="실증">실증 (규제특례/테스트)</option>
            <option value="제한적 서비스">제한적 서비스</option>
            <option value="상용 운영">상용 운영</option>
          </select>
        )}
      </div>

      {/* View: Companies Tab */}
      {activeTab === 'companies' && (
        <div className="grid-3">
          {filteredOrgs.map((org) => {
            const orgProjects = getProjectsForOrg(org.id);
            const isOld = isOutdated(org.lastVerifiedAt);
            const isSelected = compareIds.includes(org.id);

            return (
              <div
                key={org.id}
                className="card"
                style={{
                  border: isSelected ? '1px solid #F59E0B' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>{org.name}</h2>
                        {org.previousNames.length > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            (구 {org.previousNames[0].name})
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{org.englishName}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="badge badge-blue">{org.sector}</span>
                      {isOld && <span className="badge badge-outdated">확인필요</span>}
                    </div>
                  </div>

                  {org.disambiguationNote && (
                    <div style={{ fontSize: '11px', color: '#FBBF24', background: 'rgba(245, 158, 11, 0.08)', padding: '4px 8px', borderRadius: '4px', marginBottom: '10px' }}>
                      ※ {org.disambiguationNote}
                    </div>
                  )}

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', minHeight: '40px' }}>
                    {org.summary}
                  </p>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>주요 사업 분야</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {org.keyBusinessAreas.map((area) => (
                        <span key={area} className="badge badge-muted">{area}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                      연계 프로젝트 ({orgProjects.length}건)
                    </div>
                    {orgProjects.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {orgProjects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedProject(p)}
                            style={{
                              textAlign: 'left',
                              fontSize: '12px',
                              color: '#38BDF8',
                              background: 'var(--bg-secondary)',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
                              {p.shortName}
                            </span>
                            <span className="badge badge-green" style={{ fontSize: '10px' }}>{p.currentStage}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        공개 확인 프로젝트 없음 (단정 불가)
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => toggleCompare(org.id)}
                    style={{ fontSize: '12px', color: isSelected ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <GitCompare size={13} />
                    {isSelected ? '비교 선택 해제' : '비교 선택'}
                  </button>

                  <button
                    onClick={() => setSelectedOrg(org)}
                    className="btn btn-secondary btn-sm"
                  >
                    기업 상세 정보
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View: Projects Tab */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredProjects.map((proj) => {
            const isOld = isOutdated(proj.lastVerifiedAt);
            const relatedPolicies = allPolicies.filter(p => proj.relatedPolicyIds.includes(p.id));

            return (
              <div key={proj.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{proj.name}</h2>
                      <span className="badge badge-green">{proj.currentStage}</span>
                      {isOld && <span className="badge badge-outdated">최종확인 180일 초과</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '2px' }}>
                      분야: {proj.businessArea} | 대상 자산: {proj.targetAssets} | 고객: {proj.targetClients}
                    </div>
                  </div>

                  <button onClick={() => setSelectedProject(proj)} className="btn btn-primary btn-sm">
                    프로젝트 상세 분석
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  <strong>목적:</strong> {proj.purpose}
                </p>

                {/* Verified vs Analysis Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#34D399', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={14} /> 확인된 사실 (Fact)
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                      {proj.businessSignificance.verifiedFacts}
                    </p>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={14} /> 사업상 분석 (Analysis)
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                      {proj.businessSignificance.analysis}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div>
                    <strong>사용 네트워크:</strong>{' '}
                    {proj.networks.map(n => `${n.name} (${n.type}, ${n.status})`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>연계 정책:</span>
                    {relatedPolicies.map(pol => (
                      <Link key={pol.id} href="/policies" style={{ color: '#FBBF24', textDecoration: 'underline' }}>
                        {pol.shortTitle}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Org Detail Modal */}
      {selectedOrg && (
        <div className="modal-overlay" onClick={() => setSelectedOrg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{selectedOrg.name}</h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {selectedOrg.englishName} | 업권: {selectedOrg.sector} | 상태: {selectedOrg.investigationStatus}
                </div>
              </div>
              <button onClick={() => setSelectedOrg(null)} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                {selectedOrg.summary}
              </div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                최종 확인일: {selectedOrg.lastVerifiedAt} {isOutdated(selectedOrg.lastVerifiedAt) && '(180일 경과)'}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#38BDF8', marginBottom: '10px' }}>
                참여 프로젝트 목록 및 역할
              </h3>
              {getProjectsForOrg(selectedOrg.id).map(p => (
                <div key={p.id} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '4px', marginBottom: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{p.name}</span>
                    <span className="badge badge-green">{p.currentStage}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.purpose}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right' }}>
              <Link href={`/relations?focus=${selectedOrg.id}`} className="btn btn-primary btn-sm">
                생태계 관계도에서 이 기업 탐색하기 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{selectedProject.name}</h2>
                  <span className="badge badge-green">{selectedProject.currentStage}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '2px' }}>
                  사업 분야: {selectedProject.businessArea} | 대상 자산: {selectedProject.targetAssets}
                </div>
              </div>
              <button onClick={() => setSelectedProject(null)} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>사업 목적 & 대상 고객</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                {selectedProject.purpose} (대상 고객: {selectedProject.targetClients})
              </p>
            </div>

            {/* Significance Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#34D399', marginBottom: '3px' }}>
                  [확인된 사실]
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {selectedProject.businessSignificance.verifiedFacts}
                </div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', marginBottom: '3px' }}>
                  [사업상 의미 및 시사점]
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {selectedProject.businessSignificance.analysis}
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#FBBF24', marginBottom: '3px' }}>
                  [미확인 사항 / 대외 비공개]
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {selectedProject.businessSignificance.unverifiedAspects}
                </div>
              </div>
            </div>

            {/* Remaining Issues */}
            <div style={{ marginBottom: '20px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F87171', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={15} /> 남은 제도적·사업적 쟁점
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {selectedProject.remainingIssues}
              </p>
            </div>

            {/* Stage Timeline */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>추진 단계 이력</h3>
              <div className="timeline">
                {selectedProject.stageHistory.map((sh, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-date">{sh.date}</div>
                    <div className="timeline-text">{sh.stage} 확인</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Link href={`/relations?focus=${selectedProject.id}`} className="btn btn-primary btn-sm">
                관계도에서 네트워크 및 파트너 보기 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isComparing && (
        <div className="modal-overlay" onClick={() => setIsComparing(false)}>
          <div className="modal-content" style={{ maxWidth: '1100px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCompare size={20} color="#F59E0B" />
                선택 기업 간 디지털자산 사업 비교
              </h2>
              <button onClick={() => setIsComparing(false)} className="btn btn-secondary btn-sm">
                <X size={16} /> 닫기
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareIds.length}, 1fr)`, gap: '16px', overflowX: 'auto' }}>
              {compareIds.map((id) => {
                const org = organizations.find((o) => o.id === id);
                if (!org) return null;
                const orgProjs = getProjectsForOrg(org.id);

                return (
                  <div key={org.id} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{org.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-blue)', marginBottom: '12px' }}>{org.sector}</div>

                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>주요 전략 요약</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>{org.summary}</div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>핵심 사업 분야</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {org.keyBusinessAreas.map(a => (
                          <span key={a} className="badge badge-muted" style={{ fontSize: '10px' }}>{a}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>참여 프로젝트 ({orgProjs.length}건)</div>
                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {orgProjs.map(p => (
                          <div key={p.id} style={{ fontSize: '11px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '4px' }}>
                            <div style={{ color: '#fff', fontWeight: 600 }}>{p.shortName}</div>
                            <div style={{ color: '#10B981' }}>{p.currentStage}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
