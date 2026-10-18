'use client';

import React, { useState } from 'react';
import {
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  Search,
  Filter,
  FileCode
} from 'lucide-react';
import {
  getChangelogs,
  getReviewQueue,
  getStatus,
  getSourceById,
  ChangelogItem,
  ReviewItem
} from '../../lib/data';

export default function ChangelogPage() {
  const changelogs = getChangelogs();
  const reviewQueue = getReviewQueue();
  const status = getStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'applied' | 'queue'>('applied');

  const filteredChangelogs = changelogs.filter((chg) =>
    chg.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chg.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chg.field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
          변경 이력 및 검토 대기열 (Audit Trail & Verification)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          기존 상태에서 달라진 모든 사실 관계, 원천 근거, 반영 방식(자동/검토)을 보존하며 충돌 기사는 대기열에 격리합니다.
        </p>
      </div>

      {/* Sync Status Card */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-secondary)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                자동 수집·검증 엔진 동작 상태: {status.systemStatus}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                수집 주기: {status.schedule} (GitHub Actions 백그라운드 구동)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>마지막 시도:</span>{' '}
              <strong style={{ color: '#fff' }}>{status.lastAttemptAt.replace('T', ' ')}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>정상 완료:</span>{' '}
              <strong style={{ color: '#10B981' }}>{status.lastSuccessAt.replace('T', ' ')}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>데이터 변경:</span>{' '}
              <strong style={{ color: '#38BDF8' }}>{status.lastDataChangeAt.replace('T', ' ')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('applied')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'applied' ? '#38BDF8' : 'var(--text-secondary)',
            borderBottom: activeTab === 'applied' ? '2px solid #38BDF8' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          반영된 변경 이력 ({changelogs.length}건)
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'queue' ? '#F59E0B' : 'var(--text-secondary)',
            borderBottom: activeTab === 'queue' ? '2px solid #F59E0B' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={16} />
          충돌·불명확 검토 대기열 ({reviewQueue.length}건)
        </button>
      </div>

      {/* Applied Changelog */}
      {activeTab === 'applied' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="대상 기관, 프로젝트, 변경 항목 검색..."
                className="search-input"
                style={{ padding: '8px 12px 8px 34px', fontSize: '13px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Version Recovery Notice */}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={13} color="#38BDF8" />
              <span>모든 이력은 Git 커밋으로 기록되어 언제든 과거 시점으로 복구 가능합니다.</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredChangelogs.map((chg) => {
              const src = getSourceById(chg.evidenceSourceId);
              return (
                <div key={chg.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-blue">{chg.targetName}</span>
                      <span className="badge badge-muted">{chg.field}</span>
                      <span className="badge badge-green">{chg.appliedMode}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {chg.timestamp.replace('T', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
                    {chg.summary}
                  </div>

                  {/* Previous vs New Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#F87171', fontWeight: 600 }}>[변경 전]:</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{chg.oldValue || '(없음)'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#34D399', fontWeight: 600 }}>[변경 후]:</span>{' '}
                      <span style={{ color: '#fff' }}>{chg.newValue}</span>
                    </div>
                  </div>

                  {/* Evidence source link */}
                  {src && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>
                        근거: <strong>{src.title}</strong> ({src.publisher}, {src.eventDate})
                      </span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        원문 출처 <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Queue Tab */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#FDE68A' }}>
            <strong>검토 대기열 운영 원칙:</strong> 출처 간 사실관계가 상충하거나, 비공개 관측성 기사, 또는 현행 법령 요건과 충돌하여 검증이 완료되지 않은 수집 자료는 기초 데이터에 자동 반영하지 않고 격리하여 담당자가 판단할 수 있도록 보존합니다.
          </div>

          {reviewQueue.map((item) => (
            <div key={item.id} className="card" style={{ border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-amber">{item.issue}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  수집 시각: {item.discoveredAt.replace('T', ' ')}
                </span>
              </div>

              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                {item.title}
              </h2>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', lineHeight: 1.6 }}>
                {item.details}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  발행처: {item.publisher} | 상태: <strong style={{ color: '#F59E0B' }}>{item.status}</strong>
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={12} />
                  수집 기사 원문 보기
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
