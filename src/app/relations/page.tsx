'use client';

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Compass,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Building2,
  Share2,
  Download,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Plus,
  Check,
  CheckCircle2,
  Info,
  Car,
  ShoppingBag,
  Cpu,
  Coins,
  Truck,
  Sparkle,
  Network,
  ShieldCheck,
  Landmark,
  Palette,
  Home,
  Music,
  Beef,
  Gem,
  Ship,
  Calendar,
  ChevronRight,
  Filter,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  getOrganizations,
  getProjects,
  getRelations,
  getSourceById,
  Organization,
  Project,
  Relation
} from '../../lib/data';

function RelationsInteractiveDashboard() {
  const searchParams = useSearchParams();
  const initialFocus = searchParams.get('focus') || 'org_kb_sec';

  const organizations = getOrganizations();
  const projects = getProjects();
  const relations = getRelations();

  // All Nodes Dictionary
  const allNodes = useMemo(() => {
    const nodes: Record<string, { id: string; name: string; type: 'org' | 'proj'; subType: string; sector: string }> = {};
    organizations.forEach((o) => {
      nodes[o.id] = { id: o.id, name: o.name, type: 'org', subType: o.sector, sector: o.sector };
    });
    projects.forEach((p) => {
      nodes[p.id] = { id: p.id, name: p.shortName, type: 'proj', subType: p.businessArea, sector: '컨소시엄' };
    });
    return nodes;
  }, [organizations, projects]);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Frame 3: Single Org Direct Relations (KB증권 ST 오너스 중심) ---
  const [f3Target, setF3Target] = useState<string>('org_kb_sec');
  const [f3Filter, setF3Filter] = useState<'all' | 'issuer' | 'infra' | 'bank'>('all');

  // --- Frame 4: Multi-Alliance Common Partners (KB/한투 vs 미래/NH) ---
  const [f4SummaryOpen, setF4SummaryOpen] = useState(true);
  const [f4SelectedBridge, setF4SelectedBridge] = useState<string>('org_seoul_auction_blue');

  // --- Frame 5: Financial Holding Group Cluster (KB금융 vs 신한금융 vs 하나금융) ---
  const [f5SelectedGroup, setF5SelectedGroup] = useState<'kb' | 'shinhan' | 'hana'>('kb');
  const [f5HoveredGroup, setF5HoveredGroup] = useState(false);

  // --- Frame 6: Modal Popup for Unrevealed/Discovered Partner ---
  const [modalOrgId, setModalOrgId] = useState<string | null>(null);
  const selectedModalOrg = useMemo(() => {
    if (!modalOrgId) return null;
    return organizations.find((o) => o.id === modalOrgId) || null;
  }, [modalOrgId, organizations]);

  // --- Frame 7: Table Management & Multi-Select ---
  const [tableItems, setTableItems] = useState(() => {
    return [
      { id: 'org_yeolmae', name: '열매컴퍼니(아트앤가이드)', sector: '미술품 1호', stage: '신고서 완판', relationSummary: '키움증권(1호 전담 계좌관리기관), 신한투자증권', checked: true },
      { id: 'org_seoul_auction_blue', name: '서울옥션블루(SOTWO)', sector: '미술품', stage: '공모 청약', relationSummary: 'KB증권(ST오너스), 신한투자증권, 미래에셋(NFI)', checked: true },
      { id: 'org_kasa_korea', name: '카사코리아(Kasa)', sector: '부동산 DABS', stage: '그룹 편입', relationSummary: '대신증권(모기업 인수 90%), SK증권(1~2호)', checked: true },
      { id: 'org_lucente_block', name: '루센트블록(소유)', sector: '부동산 DABS', stage: '지속 공모', relationSummary: '하나증권(전담 계좌관리·신탁), 한국투자증권', checked: true },
      { id: 'org_music_cow', name: '뮤직카우', sector: '음악저작권', stage: '인가 완료', relationSummary: '키움증권(계좌관리), 하나은행(신탁), KB증권', checked: true },
      { id: 'org_stockkeeper', name: '스탁키퍼(뱅카우)', sector: '한우 실물', stage: '신고서 심사', relationSummary: 'KB증권(ST오너스 창립회원), 키움증권', checked: true },
      { id: 'org_itcen', name: '아이티센(크레더/센골드)', sector: '금·귀금속 RWA', stage: '상용화', relationSummary: '하나증권(독점 계좌관리), 부산BDX', checked: true },
      { id: 'org_koda', name: '한국디지털에셋(KODA)', sector: '가상자산 수탁', stage: '최대 수탁고', relationSummary: 'KB국민은행(합작 설립 주주), 해치랩스', checked: true },
      { id: 'org_kdac', name: '한국디지털자산수탁(KDAC)', sector: '가상자산 수탁', stage: '신한 통제', relationSummary: '신한은행(지분투자), 코빗, 블로코', checked: true },
      { id: 'org_bitgo_kr', name: '비트고코리아(BitGo)', sector: '글로벌 수탁', stage: '법인 설립', relationSummary: '하나은행(전략적 지분투자), BitGo 글로벌', checked: true }
    ];
  });
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);

  const toggleTableRow = (id: string) => {
    setTableItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleAllTableRows = () => {
    const allChecked = tableItems.every((item) => item.checked);
    setTableItems((prev) => prev.map((item) => ({ ...item, checked: !allChecked })));
  };

  const selectedCount = tableItems.filter((i) => i.checked).length;

  return (
    <div
      style={{
        background: '#0B0E14',
        color: '#F1F5F9',
        minHeight: '100vh',
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        overflowX: 'hidden'
      }}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#6366F1',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Main Single Column Container */}
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>

        {/* =========================================================
            [Frame 1 변환] 히어로 섹션: 디지털자산 생태계 은하수 네트워크
        ========================================================= */}
        <section
          style={{
            padding: '60px 0 50px',
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.15fr',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Left Title & Value Proposition */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#A5B4FC',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '20px'
              }}
            >
              <Sparkles size={14} color="#818CF8" />
              <span>KB증권 STO & 기관 디지털자산 전용 인텔리전스</span>
            </div>

            <h1
              style={{
                fontSize: '42px',
                fontWeight: 800,
                lineHeight: '1.2',
                letterSpacing: '-1.5px',
                color: '#fff',
                marginBottom: '16px'
              }}
            >
              디지털자산 생태계 관계도
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                금융사와 조각투자사의 이해관계를
                <br />
                지도 한 장으로
              </span>
            </h1>

            <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '32px' }}>
              2023년 초 금융위 토큰증권 가이드라인부터 2026년 전자증권법·자본시장법 개정안 하위법규 예고까지.
              KB증권, 한국투자, 미래에셋, NH, 신한, 하나 등 17개 증권사와 12개 은행, 17개 조각투자사 간의
              <strong>110건의 공식 계좌관리·얼라이언스·수탁·인프라 제휴망</strong>을 인터랙티브하게 탐색하세요.
            </p>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const el = document.getElementById('sec_single_org');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #6366F1 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 26px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
                }}
              >
                KB증권 직접 관계망 보기
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('sec_presets');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '14px 22px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                실무 추천 프리셋 탐색
              </button>
            </div>
          </div>

          {/* Right Hero Visual: Massive STO Financial Constellation */}
          <div
            style={{
              position: 'relative',
              height: '460px',
              borderRadius: '20px',
              background: 'radial-gradient(ellipse at center, #161B26 0%, #0B0E14 75%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Background Grid Pattern */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                opacity: 0.6
              }}
            />

            {/* Glowing Ambient */}
            <div
              style={{
                position: 'absolute',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.15)',
                filter: 'blur(75px)',
                top: '20%',
                left: '25%'
              }}
            />

            {/* SVG Complex Fin-Crypto Cluster Constellation */}
            <svg width="100%" height="100%" viewBox="0 0 520 460">
              <defs>
                <linearGradient id="kbGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="kisGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="miraeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Connecting Lines for Major Hubs */}
              {/* KB Hub (210, 170) connections */}
              <line x1="210" y1="170" x2="120" y2="120" stroke="url(#kbGlow)" strokeWidth="2" />
              <line x1="210" y1="170" x2="110" y2="200" stroke="url(#kbGlow)" strokeWidth="2" />
              <line x1="210" y1="170" x2="140" y2="270" stroke="url(#kbGlow)" strokeWidth="2" />
              <line x1="210" y1="170" x2="280" y2="100" stroke="url(#kbGlow)" strokeWidth="2" />
              <line x1="210" y1="170" x2="310" y2="210" stroke="url(#kbGlow)" strokeWidth="2.5" />
              <line x1="210" y1="170" x2="210" y2="290" stroke="url(#kbGlow)" strokeWidth="2" />
              <line x1="210" y1="170" x2="360" y2="330" stroke="url(#kbGlow)" strokeWidth="1.8" strokeDasharray="3,3" />

              {/* KIS Hub (360, 130) connections */}
              <line x1="360" y1="130" x2="280" y2="100" stroke="url(#kisGlow)" strokeWidth="1.8" />
              <line x1="360" y1="130" x2="440" y2="90" stroke="url(#kisGlow)" strokeWidth="2" />
              <line x1="360" y1="130" x2="450" y2="170" stroke="url(#kisGlow)" strokeWidth="2" />
              <line x1="360" y1="130" x2="310" y2="210" stroke="url(#kisGlow)" strokeWidth="2" />

              {/* Mirae Hub (360, 330) connections */}
              <line x1="360" y1="330" x2="440" y2="290" stroke="url(#miraeGlow)" strokeWidth="2" />
              <line x1="360" y1="330" x2="430" y2="380" stroke="url(#miraeGlow)" strokeWidth="2" />
              <line x1="360" y1="330" x2="280" y2="370" stroke="url(#miraeGlow)" strokeWidth="2" />
              <line x1="360" y1="330" x2="310" y2="210" stroke="url(#miraeGlow)" strokeWidth="2" />

              {/* Background Stars / Tiny Satellite Nodes */}
              {[
                [80, 80], [150, 60], [240, 50], [330, 60], [420, 50],
                [480, 130], [490, 220], [470, 350], [380, 420], [270, 420],
                [180, 390], [90, 340], [70, 240], [170, 140], [250, 150]
              ].map(([cx, cy], idx) => (
                <circle key={idx} cx={cx} cy={cy} r="2.5" fill="#64748B" opacity="0.5" />
              ))}

              {/* Center Major Hub: KB증권 (ST 오너스 맹주) */}
              <g transform="translate(210, 170)" style={{ cursor: 'pointer' }} onClick={() => setF3Target('org_kb_sec')}>
                <circle r="34" fill="#0B2545" stroke="#38BDF8" strokeWidth="3" filter="drop-shadow(0 0 16px rgba(56, 189, 248, 0.7))" />
                <text y="-2" textAnchor="middle" fill="#fff" fontSize="12px" fontWeight="800">KB증권</text>
                <text y="14" textAnchor="middle" fill="#38BDF8" fontSize="9px" fontWeight="600">ST 오너스</text>
              </g>

              {/* Hub 2: 한국투자증권 (ST 프렌즈) */}
              <g transform="translate(360, 130)" style={{ cursor: 'pointer' }} onClick={() => setF3Target('org_kis')}>
                <circle r="28" fill="#2E1065" stroke="#A855F7" strokeWidth="2.5" filter="drop-shadow(0 0 14px rgba(168, 85, 247, 0.6))" />
                <text y="-1" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="700">한국투자</text>
                <text y="13" textAnchor="middle" fill="#C084FC" fontSize="8px">ST 프렌즈</text>
              </g>

              {/* Hub 3: 미래에셋증권 (NFI 연합) */}
              <g transform="translate(360, 330)" style={{ cursor: 'pointer' }} onClick={() => setF3Target('org_mirae_sec')}>
                <circle r="28" fill="#064E3B" stroke="#10B981" strokeWidth="2.5" filter="drop-shadow(0 0 14px rgba(16, 185, 129, 0.6))" />
                <text y="-1" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="700">미래에셋</text>
                <text y="13" textAnchor="middle" fill="#34D399" fontSize="8px">NFI 연합</text>
              </g>

              {/* Cross-Alliance Shared Hub: 서울옥션블루 (모든 연합 교차) */}
              <g transform="translate(310, 210)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_seoul_auction_blue')}>
                <circle r="22" fill="#831843" stroke="#F43F5E" strokeWidth="2" filter="drop-shadow(0 0 12px rgba(244, 63, 94, 0.5))" />
                <text y="4" textAnchor="middle" fill="#fff" fontSize="9px" fontWeight="700">서울옥션블루</text>
              </g>

              {/* Satellite 1: 스탁키퍼 (뱅카우) */}
              <g transform="translate(120, 120)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_stockkeeper')}>
                <circle r="18" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fill="#fff" fontSize="8px">스탁키퍼</text>
              </g>

              {/* Satellite 2: 펀블 */}
              <g transform="translate(110, 200)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_funble')}>
                <circle r="18" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fill="#fff" fontSize="8px">펀블</text>
              </g>

              {/* Satellite 3: 람다256 */}
              <g transform="translate(140, 270)">
                <circle r="18" fill="#1E293B" stroke="#10B981" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fill="#fff" fontSize="8px">람다256</text>
              </g>

              {/* Satellite 4: KB국민은행 (KODA 수탁) */}
              <g transform="translate(210, 290)">
                <circle r="20" fill="#1E293B" stroke="#FBBF24" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fill="#fff" fontSize="9px">국민은행</text>
              </g>

              {/* Satellite 5: 카카오뱅크 */}
              <g transform="translate(440, 90)">
                <circle r="18" fill="#1E293B" stroke="#A855F7" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fill="#fff" fontSize="8px">카카오뱅크</text>
              </g>

              {/* Satellite 6: 토스뱅크 */}
              <g transform="translate(450, 170)">
                <circle r="18" fill="#1E293B" stroke="#A855F7" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fill="#fff" fontSize="8px">토스뱅크</text>
              </g>

              {/* Satellite 7: 하나금융그룹 */}
              <g transform="translate(440, 290)">
                <circle r="18" fill="#1E293B" stroke="#10B981" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fill="#fff" fontSize="8px">하나금융</text>
              </g>
            </svg>

            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                color: '#94A3B8',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
              110개 검증 제휴 관계 · 76개 참여사 전수 맵
            </div>
          </div>
        </section>

        {/* =========================================================
            [Frame 2 변환] 인트로 안내 배너: 3대 핵심 요약
        ========================================================= */}
        <section
          style={{
            margin: '30px 0 60px',
            background: 'linear-gradient(180deg, rgba(22, 27, 38, 0.8) 0%, rgba(15, 20, 29, 0.6) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            padding: '30px 34px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
              "기사와 공시를 하나씩 보면 알 수 없던 국내 디지털자산 자본과 기술 연계가 보입니다"
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '6px' }}>
              증권사-은행-조각투자사-블록체인 인프라-수탁사 간의 복잡한 그물망을 지도 한 장으로 압축했습니다.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>110+개 공식 관계망 구축</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.4' }}>2023년 초 토큰증권 가이드라인부터 2026년 하반기 법제화까지의 전수 데이터를 체계화했습니다.</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Search size={18} color="#818CF8" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>궁금한 기관만 넣으면 즉시 파악</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.4' }}>KB증권, 키움, 미래에셋, 카사 등 기업 이름만 누르면 계좌관리·얼라이언스 관계를 지도로 보여드립니다.</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={18} color="#34D399" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>경쟁사 동향 조사를 단 몇 분 만에</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.4' }}>각 사 보도자료를 일일이 찾아 정리하던 고된 리서치를 클릭 몇 번으로 즉시 끝내세요.</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            [Frame 3 변환] 기능 섹션 1: 단일 금융사의 직접 관계 탐색 (KB증권 중심)
        ========================================================= */}
        <section id="sec_single_org" style={{ padding: '40px 0 70px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              FEATURE 01 · 단일 금융사 직접 관계
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              누구와 실제로 엮여 있는지 바로 보입니다
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '8px' }}>
              조각투자사만 남기면 계좌관리와 발행 파트너가 보이고, 인프라만 남기면 블록체인 코어 기술진이 드러납니다.
            </p>
          </div>

          <div style={{ background: '#121620', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden', boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)' }}>
            {/* Top Toolbar / Filter Controls */}
            <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {/* Target Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>기준 금융사:</span>
                <select
                  value={f3Target}
                  onChange={(e) => setF3Target(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="org_kb_sec">KB증권 (ST 오너스 맹주)</option>
                  <option value="org_kis">한국투자증권 (ST 프렌즈 맹주)</option>
                  <option value="org_mirae_sec">미래에셋증권 (NFI 연합 맹주)</option>
                  <option value="org_nh_sec">NH투자증권 (비전그룹 맹주)</option>
                  <option value="org_shinhan_sec">신한투자증권 (신한금융 연합)</option>
                  <option value="org_hana_sec">하나증권 (금·부동산 RWA)</option>
                  <option value="org_kiwoom_sec">키움증권 (1호 조각투자 허브)</option>
                </select>
              </div>

              {/* Filter Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setF3Filter('all')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: f3Filter === 'all' ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)',
                    background: f3Filter === 'all' ? '#38BDF8' : 'rgba(255, 255, 255, 0.05)',
                    color: f3Filter === 'all' ? '#07111E' : '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  전체 관계 보기
                </button>
                <button
                  onClick={() => setF3Filter('issuer')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: f3Filter === 'issuer' ? '#EC4899' : 'rgba(255, 255, 255, 0.1)',
                    background: f3Filter === 'issuer' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: f3Filter === 'issuer' ? '#F472B6' : '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  🎨 조각투자사만 남기기
                </button>
                <button
                  onClick={() => setF3Filter('infra')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: f3Filter === 'infra' ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                    background: f3Filter === 'infra' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: f3Filter === 'infra' ? '#34D399' : '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  ⚙️ 블록체인·인프라만 남기기
                </button>
                <button
                  onClick={() => setF3Filter('bank')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: f3Filter === 'bank' ? '#FBBF24' : 'rgba(255, 255, 255, 0.1)',
                    background: f3Filter === 'bank' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: f3Filter === 'bank' ? '#FBBF24' : '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  🏦 금융지주·은행망만 남기기
                </button>
              </div>
            </div>

            {/* Canvas Area: Radial Direct Links for KB증권 */}
            <div style={{ height: '420px', position: 'relative', background: '#0F131D' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 420">
                {/* Center Node Pos: 400, 210 */}

                {/* 1. 스탁키퍼 뱅카우 (조각투자) */}
                {(f3Filter === 'all' || f3Filter === 'issuer') && (
                  <g style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_stockkeeper')}>
                    <line x1="400" y1="210" x2="210" y2="100" stroke="#EC4899" strokeWidth="2" />
                    <rect x="270" y="135" width="60" height="18" rx="4" fill="#1E293B" stroke="#EC4899" strokeWidth="1" />
                    <text x="300" y="148" textAnchor="middle" fill="#EC4899" fontSize="9px" fontWeight="700">한우 조각투자</text>
                    <g transform="translate(210, 100)">
                      <circle r="26" fill="#1E1B4B" stroke="#EC4899" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">스탁키퍼</text>
                    </g>
                  </g>
                )}

                {/* 2. 서울옥션블루 (조각투자) */}
                {(f3Filter === 'all' || f3Filter === 'issuer') && (
                  <g style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_seoul_auction_blue')}>
                    <line x1="400" y1="210" x2="170" y2="210" stroke="#EC4899" strokeWidth="2" />
                    <rect x="240" y="200" width="66" height="18" rx="4" fill="#1E293B" stroke="#EC4899" strokeWidth="1" />
                    <text x="273" y="213" textAnchor="middle" fill="#EC4899" fontSize="9px" fontWeight="700">미술품 계좌관리</text>
                    <g transform="translate(170, 210)">
                      <circle r="28" fill="#1E1B4B" stroke="#EC4899" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">서울옥션블루</text>
                    </g>
                  </g>
                )}

                {/* 3. 테사 (조각투자) */}
                {(f3Filter === 'all' || f3Filter === 'issuer') && (
                  <g style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_tessa')}>
                    <line x1="400" y1="210" x2="220" y2="310" stroke="#EC4899" strokeWidth="2" />
                    <rect x="275" y="245" width="56" height="18" rx="4" fill="#1E293B" stroke="#EC4899" strokeWidth="1" />
                    <text x="303" y="258" textAnchor="middle" fill="#EC4899" fontSize="9px" fontWeight="700">미술품 STO</text>
                    <g transform="translate(220, 310)">
                      <circle r="26" fill="#1E1B4B" stroke="#EC4899" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">테사 (TESSA)</text>
                    </g>
                  </g>
                )}

                {/* 4. 펀블 (부동산) */}
                {(f3Filter === 'all' || f3Filter === 'issuer') && (
                  <g style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_funble')}>
                    <line x1="400" y1="210" x2="330" y2="350" stroke="#EC4899" strokeWidth="2" />
                    <rect x="345" y="270" width="56" height="18" rx="4" fill="#1E293B" stroke="#EC4899" strokeWidth="1" />
                    <text x="373" y="283" textAnchor="middle" fill="#EC4899" fontSize="9px" fontWeight="700">부동산 DABS</text>
                    <g transform="translate(330, 350)">
                      <circle r="24" fill="#1E1B4B" stroke="#EC4899" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">펀블</text>
                    </g>
                  </g>
                )}

                {/* 5. 람다256 (인프라) */}
                {(f3Filter === 'all' || f3Filter === 'infra') && (
                  <g>
                    <line x1="400" y1="210" x2="590" y2="120" stroke="#10B981" strokeWidth="2" />
                    <rect x="470" y="145" width="60" height="18" rx="4" fill="#1E293B" stroke="#10B981" strokeWidth="1" />
                    <text x="500" y="158" textAnchor="middle" fill="#10B981" fontSize="9px" fontWeight="700">루니버스 원장</text>
                    <g transform="translate(590, 120)">
                      <circle r="26" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">람다256</text>
                    </g>
                  </g>
                )}

                {/* 6. SK C&C (인프라) */}
                {(f3Filter === 'all' || f3Filter === 'infra') && (
                  <g>
                    <line x1="400" y1="210" x2="620" y2="210" stroke="#10B981" strokeWidth="2" />
                    <rect x="490" y="200" width="54" height="18" rx="4" fill="#1E293B" stroke="#10B981" strokeWidth="1" />
                    <text x="517" y="213" textAnchor="middle" fill="#10B981" fontSize="9px" fontWeight="700">클라우드 보안</text>
                    <g transform="translate(620, 210)">
                      <circle r="26" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">SK C&C</text>
                    </g>
                  </g>
                )}

                {/* 7. 캔톤 재단 / 시큐리타이즈 (글로벌 RWA) */}
                {(f3Filter === 'all' || f3Filter === 'infra') && (
                  <g>
                    <line x1="400" y1="210" x2="580" y2="300" stroke="#6366F1" strokeWidth="2" strokeDasharray="4,4" />
                    <rect x="470" y="245" width="56" height="18" rx="4" fill="#1E293B" stroke="#6366F1" strokeWidth="1" />
                    <text x="498" y="258" textAnchor="middle" fill="#818CF8" fontSize="9px" fontWeight="700">글로벌 RWA</text>
                    <g transform="translate(580, 300)">
                      <circle r="26" fill="#1E1B4B" stroke="#6366F1" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="9px" fontWeight="700">캔톤/시큐리타이즈</text>
                    </g>
                  </g>
                )}

                {/* 8. KB국민은행 (금융그룹·KODA 수탁) */}
                {(f3Filter === 'all' || f3Filter === 'bank') && (
                  <g>
                    <line x1="400" y1="210" x2="350" y2="70" stroke="#FBBF24" strokeWidth="2.5" />
                    <rect x="345" y="120" width="56" height="18" rx="4" fill="#1E293B" stroke="#FBBF24" strokeWidth="1" />
                    <text x="373" y="133" textAnchor="middle" fill="#FBBF24" fontSize="9px" fontWeight="700">KODA 수탁·CBDC</text>
                    <g transform="translate(350, 70)">
                      <circle r="28" fill="#1E293B" stroke="#FBBF24" strokeWidth="2" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="800">KB국민은행</text>
                    </g>
                  </g>
                )}

                {/* Center Node: KB증권 */}
                <g transform="translate(400, 210)">
                  <circle r="46" fill="#38BDF8" opacity="0.2">
                    <animate attributeName="r" values="46;54;46" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle r="38" fill="#0B2545" stroke="#38BDF8" strokeWidth="3" filter="drop-shadow(0 0 18px rgba(56, 189, 248, 0.8))" />
                  <Building2 size={20} color="#38BDF8" style={{ transform: 'translate(-10px, -14px)' }} />
                  <text y="16" textAnchor="middle" fill="#fff" fontSize="12px" fontWeight="800">KB증권</text>
                </g>
              </svg>

              <div style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '12px', color: '#94A3B8' }}>
                💡 외곽의 조각투자사 노드를 클릭하면 <strong>공모 세부내역과 계좌관리 현황 모달</strong>이 열립니다.
              </div>
            </div>

            {/* Bottom 3-Bullet Explanation */}
            <div style={{ padding: '24px 30px', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', marginTop: '6px' }} />
                  <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
                    <strong style={{ color: '#fff' }}>ST 오너스 맹주 입지:</strong> 스탁키퍼(한우), 테사, 서울옥션블루 등 최다 조각투자사와의 계좌관리기관 계약을 확보했습니다.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginTop: '6px' }} />
                  <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
                    <strong style={{ color: '#34D399' }}>엔터프라이즈 블록체인 코어:</strong> 람다256 루니버스 분산원장과 SK C&C 보안망으로 제도권 수준의 전산 체계를 구축했습니다.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FBBF24', marginTop: '6px' }} />
                  <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5' }}>
                    <strong style={{ color: '#FBBF24' }}>그룹 은행 및 글로벌 연계:</strong> 국민은행의 KODA 수탁고와 한은 예금토큰 실증, 캔톤 글로벌 기관망 PoC로 차별화했습니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            [Frame 4 변환] 기능 섹션 2: 다중 증권사 간의 공통 조각투자사 브릿지 탐색
        ========================================================= */}
        <section id="sec_bridges" style={{ padding: '60px 0 70px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#A855F7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              FEATURE 02 · 다중 증권사 공통 파트너
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              여러 금융사가 함께 닿아 있는 곳을 찾아드립니다
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '8px' }}>
              경쟁 증권사들을 함께 배치하면 복수의 협의체에 중복 참여 중인 핵심 발행사와 인프라 브릿지가 한눈에 드러납니다.
            </p>
          </div>

          <div style={{ background: '#121620', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
            {/* Tag Header */}
            <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#94A3B8', marginRight: '6px' }}>비교 증권사 진영:</span>
              {[
                { name: 'KB증권 (ST오너스)', color: '#38BDF8' },
                { name: '한국투자증권 (ST프렌즈)', color: '#A855F7' },
                { name: '미래에셋증권 (NFI)', color: '#10B981' },
                { name: 'NH투자증권 (비전그룹)', color: '#F59E0B' }
              ].map((c, i) => (
                <div key={i} style={{ padding: '5px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.06)', border: `1px solid ${c.color}60`, fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={13} color={c.color} />
                  {c.name}
                </div>
              ))}
            </div>

            {/* Canvas Area: Multi-Alliance Bridge */}
            <div style={{ height: '380px', position: 'relative', background: '#0F131D' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 380">
                {/* Bridge Connections from SeoulAuctionBlue (Center 400, 190) */}
                <path d="M 160 110 Q 400 110 400 190" stroke="#38BDF8" strokeWidth="2.5" fill="none" opacity="0.85" />
                <path d="M 160 270 Q 400 270 400 190" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.75" />
                <path d="M 640 110 Q 400 110 400 190" stroke="#10B981" strokeWidth="2.5" fill="none" opacity="0.85" />
                <path d="M 640 270 Q 400 270 400 190" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.75" />

                {/* Bridge Connections from Funble (Center Top 400, 90) */}
                <path d="M 160 110 Q 400 50 400 90" stroke="#38BDF8" strokeWidth="1.8" fill="none" opacity="0.7" />
                <path d="M 640 110 Q 400 50 400 90" stroke="#10B981" strokeWidth="1.8" fill="none" opacity="0.7" />

                {/* Bridge Connections from Koscom (Center Bottom 400, 290) */}
                <path d="M 160 270 Q 400 330 400 290" stroke="#EC4899" strokeWidth="2" fill="none" opacity="0.8" />
                <path d="M 640 270 Q 400 330 400 290" stroke="#EC4899" strokeWidth="2" fill="none" opacity="0.8" />

                {/* Left 1: KB증권 */}
                <g transform="translate(160, 110)">
                  <circle r="36" fill="#0B2545" stroke="#38BDF8" strokeWidth="2.5" filter="drop-shadow(0 0 12px rgba(56, 189, 248, 0.5))" />
                  <text y="-2" textAnchor="middle" fill="#fff" fontSize="12px" fontWeight="800">KB증권</text>
                  <text y="14" textAnchor="middle" fill="#38BDF8" fontSize="9px">ST 오너스</text>
                </g>

                {/* Left 2: 한국투자증권 */}
                <g transform="translate(160, 270)">
                  <circle r="34" fill="#2E1065" stroke="#A855F7" strokeWidth="2" />
                  <text y="-2" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="700">한국투자</text>
                  <text y="12" textAnchor="middle" fill="#A855F7" fontSize="9px">ST 프렌즈</text>
                </g>

                {/* Right 1: 미래에셋증권 */}
                <g transform="translate(640, 110)">
                  <circle r="36" fill="#064E3B" stroke="#10B981" strokeWidth="2.5" filter="drop-shadow(0 0 12px rgba(16, 185, 129, 0.5))" />
                  <text y="-2" textAnchor="middle" fill="#fff" fontSize="12px" fontWeight="800">미래에셋</text>
                  <text y="14" textAnchor="middle" fill="#10B981" fontSize="9px">NFI 연합</text>
                </g>

                {/* Right 2: NH투자증권 */}
                <g transform="translate(640, 270)">
                  <circle r="34" fill="#451A03" stroke="#F59E0B" strokeWidth="2" />
                  <text y="-2" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="700">NH투자</text>
                  <text y="12" textAnchor="middle" fill="#F59E0B" fontSize="9px">비전그룹</text>
                </g>

                {/* Center Bridge 1: 서울옥션블루 (소투) */}
                <g transform="translate(400, 190)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_seoul_auction_blue')}>
                  <circle r="32" fill="#831843" stroke="#F43F5E" strokeWidth="3" filter="drop-shadow(0 0 18px rgba(244, 63, 94, 0.8))" />
                  <text y="-2" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="800">서울옥션블루</text>
                  <text y="12" textAnchor="middle" fill="#FDA4AF" fontSize="9px">4대 연합 교차</text>
                </g>

                {/* Center Bridge 2: 펀블 (부동산) */}
                <g transform="translate(400, 90)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_funble')}>
                  <circle r="24" fill="#1E1B4B" stroke="#38BDF8" strokeWidth="2" />
                  <text y="3" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">펀블</text>
                </g>

                {/* Center Bridge 3: 코스콤 공동플랫폼 */}
                <g transform="translate(400, 290)" style={{ cursor: 'pointer' }}>
                  <circle r="26" fill="#1E293B" stroke="#EC4899" strokeWidth="2" />
                  <text y="-2" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">코스콤</text>
                  <text y="10" textAnchor="middle" fill="#F472B6" fontSize="8px">공동 분산원장</text>
                </g>
              </svg>

              <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '11px', background: 'rgba(0, 0, 0, 0.6)', padding: '4px 10px', borderRadius: '6px', color: '#CBD5E1' }}>
                브릿지 노드를 클릭하면 중복 제휴 상세 내역이 표시됩니다.
              </div>
            </div>

            {/* Bottom Collapsible Report */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div onClick={() => setF4SummaryOpen(!f4SummaryOpen)} style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkle size={16} color="#A855F7" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>얼라이언스 교차 협력 핵심 요약</span>
                  <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', padding: '2px 8px', borderRadius: '4px' }}>
                    3건의 주요 브릿지
                  </span>
                </div>
                {f4SummaryOpen ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
              </div>

              {f4SummaryOpen && (
                <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '13px' }}>
                    <strong style={{ color: '#F43F5E' }}>[교차 발행사] 서울옥션블루:</strong> KB증권 ST오너스 창립회원이자 신한투자증권 계좌관리, 미래에셋 NFI 글로벌 토큰화 협약을 동시 체결한 유일한 미술품 발행사
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '13px' }}>
                    <strong style={{ color: '#38BDF8' }}>[교차 발행사] 펀블:</strong> 신한투자증권의 부동산 DABS 공모 주관과 키움증권 계좌관리, KB증권 ST오너스에 모두 참여하여 유통망 다변화
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', fontSize: '13px' }}>
                    <strong style={{ color: '#F472B6' }}>[공동 인프라] 코스콤:</strong> 키움·대신·유진·교보·DB 등 10개 중소형 증권사의 전산 비용 절감을 위해 공동 분산원장을 제공하는 핵심 중개 기관
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
            [Frame 5 변환] 기능 섹션 3: 5대 금융지주 그룹/계열사 간접 연결 탐색
        ========================================================= */}
        <section id="sec_holding_groups" style={{ padding: '60px 0 70px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              FEATURE 03 · 금융지주 그룹 간접 연결
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              직접 관계가 없어도 금융그룹 계열사를 거쳐 이어진 곳까지
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '8px' }}>
              증권사 명의로 직접 계약되지 않았더라도, 은행·지주사의 합작 수탁사(KODA/KDAC)나 거래소 실명계좌를 거쳐 연결된 진짜 영향력을 파악하세요.
            </p>
          </div>

          <div style={{ background: '#121620', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
            {/* Group Switcher Bar */}
            <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>금융그룹 선택:</span>
                {(['kb', 'shinhan', 'hana'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setF5SelectedGroup(g)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: f5SelectedGroup === g ? '#FBBF24' : 'rgba(255, 255, 255, 0.1)',
                      background: f5SelectedGroup === g ? '#FBBF24' : 'rgba(255, 255, 255, 0.05)',
                      color: f5SelectedGroup === g ? '#000' : '#94A3B8',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {g === 'kb' ? 'KB금융그룹' : g === 'shinhan' ? '신한금융그룹' : '하나금융그룹'}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: '#FBBF24' }}>
                {f5SelectedGroup === 'kb'
                  ? 'KB국민은행 수탁사 KODA 및 빗썸 계좌 제휴 추진'
                  : f5SelectedGroup === 'shinhan'
                  ? '신한은행 수탁사 KDAC 및 코빗 독점 계좌'
                  : '하나은행 비트고 코리아(BitGo) 합작사 설립'}
              </div>
            </div>

            {/* Canvas Area: Holding Group Cluster with Halo & Indirect Links */}
            <div style={{ height: '420px', position: 'relative', background: '#0F131D' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 420">
                {/* Gold Boundary Halo for Selected Group */}
                <circle cx="400" cy="210" r="130" fill="rgba(251, 191, 36, 0.04)" stroke="#FBBF24" strokeWidth="2" strokeDasharray="6,6" />
                <text x="400" y="70" textAnchor="middle" fill="#FBBF24" fontSize="11px" fontWeight="700">
                  ── {f5SelectedGroup === 'kb' ? 'KB금융그룹' : f5SelectedGroup === 'shinhan' ? '신한금융그룹' : '하나금융그룹'} 계열 클러스터 ──
                </text>

                {/* KB Group Scenario */}
                {f5SelectedGroup === 'kb' && (
                  <>
                    {/* Indirect Dash Line to KODA */}
                    <line x1="160" y1="210" x2="340" y2="210" stroke="#FBBF24" strokeWidth="3" strokeDasharray="4,4">
                      <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                    </line>
                    <line x1="340" y1="210" x2="400" y2="180" stroke="#FBBF24" strokeWidth="2.5" />
                    <line x1="400" y1="180" x2="460" y2="210" stroke="#FBBF24" strokeWidth="2.5" />
                    <line x1="400" y1="180" x2="400" y2="260" stroke="#FBBF24" strokeWidth="2.5" />

                    {/* Outer Node: KODA */}
                    <g transform="translate(160, 210)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_koda')}>
                      <circle r="34" fill="#1E293B" stroke="#34D399" strokeWidth="2.5" filter="drop-shadow(0 0 16px rgba(52, 211, 153, 0.6))" />
                      <text y="-2" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="800">KODA</text>
                      <text y="14" textAnchor="middle" fill="#34D399" fontSize="8px">국민은행 수탁</text>
                    </g>

                    {/* Outer Node: 빗썸 */}
                    <g transform="translate(640, 150)">
                      <circle r="28" fill="#18181B" stroke="#F97316" strokeWidth="1.8" />
                      <line x1="400" y1="260" x2="640" y2="150" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3,3" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">빗썸</text>
                    </g>

                    {/* Outer Node: 캔톤 네트워크 */}
                    <g transform="translate(640, 270)">
                      <circle r="26" fill="#18181B" stroke="#6366F1" strokeWidth="1.8" />
                      <line x1="460" y1="210" x2="640" y2="270" stroke="#6366F1" strokeWidth="1.5" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px">캔톤</text>
                    </g>

                    {/* Center Cluster: KB Holdings */}
                    <g transform="translate(400, 180)">
                      <circle r="30" fill="#FBBF24" filter="drop-shadow(0 0 16px rgba(251, 191, 36, 0.8))" />
                      <text y="4" textAnchor="middle" fill="#000" fontSize="11px" fontWeight="900">KB금융지주</text>
                    </g>
                    {/* KB Bank */}
                    <g transform="translate(340, 210)">
                      <circle r="24" fill="#FBBF24" stroke="#000" strokeWidth="1" />
                      <text y="4" textAnchor="middle" fill="#000" fontSize="10px" fontWeight="800">국민은행</text>
                    </g>
                    {/* KB Securities */}
                    <g transform="translate(460, 210)">
                      <circle r="24" fill="#38BDF8" stroke="#fff" strokeWidth="1.5" />
                      <text y="4" textAnchor="middle" fill="#000" fontSize="10px" fontWeight="800">KB증권</text>
                    </g>
                    {/* KB Investment */}
                    <g transform="translate(400, 260)">
                      <circle r="20" fill="#FBBF24" stroke="#000" strokeWidth="1" />
                      <text y="3" textAnchor="middle" fill="#000" fontSize="9px">KB인베</text>
                    </g>
                  </>
                )}

                {/* Shinhan Group Scenario */}
                {f5SelectedGroup === 'shinhan' && (
                  <>
                    <line x1="160" y1="210" x2="340" y2="210" stroke="#6366F1" strokeWidth="3" strokeDasharray="4,4" />
                    <line x1="340" y1="210" x2="400" y2="180" stroke="#6366F1" strokeWidth="2.5" />
                    <line x1="400" y1="180" x2="460" y2="210" stroke="#6366F1" strokeWidth="2.5" />

                    <g transform="translate(160, 210)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_kdac')}>
                      <circle r="34" fill="#1E293B" stroke="#38BDF8" strokeWidth="2.5" />
                      <text y="-2" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="800">KDAC</text>
                      <text y="14" textAnchor="middle" fill="#38BDF8" fontSize="8px">신한은행 수탁</text>
                    </g>

                    <g transform="translate(640, 210)">
                      <circle r="28" fill="#18181B" stroke="#38BDF8" strokeWidth="1.8" />
                      <line x1="460" y1="210" x2="640" y2="210" stroke="#6366F1" strokeWidth="1.5" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">코빗</text>
                    </g>

                    <g transform="translate(400, 180)">
                      <circle r="30" fill="#6366F1" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="900">신한금융지주</text>
                    </g>
                    <g transform="translate(340, 210)">
                      <circle r="24" fill="#6366F1" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="800">신한은행</text>
                    </g>
                    <g transform="translate(460, 210)">
                      <circle r="24" fill="#38BDF8" />
                      <text y="4" textAnchor="middle" fill="#000" fontSize="10px" fontWeight="800">신한투자증권</text>
                    </g>
                  </>
                )}

                {/* Hana Group Scenario */}
                {f5SelectedGroup === 'hana' && (
                  <>
                    <line x1="160" y1="210" x2="340" y2="210" stroke="#10B981" strokeWidth="3" strokeDasharray="4,4" />
                    <line x1="340" y1="210" x2="400" y2="180" stroke="#10B981" strokeWidth="2.5" />
                    <line x1="400" y1="180" x2="460" y2="210" stroke="#10B981" strokeWidth="2.5" />

                    <g transform="translate(160, 210)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_bitgo_kr')}>
                      <circle r="34" fill="#1E293B" stroke="#10B981" strokeWidth="2.5" />
                      <text y="-2" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="800">비트고코리아</text>
                      <text y="14" textAnchor="middle" fill="#10B981" fontSize="8px">하나은행 수탁</text>
                    </g>

                    <g transform="translate(640, 210)" style={{ cursor: 'pointer' }} onClick={() => setModalOrgId('org_itcen')}>
                      <circle r="28" fill="#18181B" stroke="#FBBF24" strokeWidth="1.8" />
                      <line x1="460" y1="210" x2="640" y2="210" stroke="#10B981" strokeWidth="1.5" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="700">아이티센</text>
                    </g>

                    <g transform="translate(400, 180)">
                      <circle r="30" fill="#10B981" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="11px" fontWeight="900">하나금융지주</text>
                    </g>
                    <g transform="translate(340, 210)">
                      <circle r="24" fill="#10B981" />
                      <text y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="800">하나은행</text>
                    </g>
                    <g transform="translate(460, 210)">
                      <circle r="24" fill="#38BDF8" />
                      <text y="4" textAnchor="middle" fill="#000" fontSize="10px" fontWeight="800">하나증권</text>
                    </g>
                  </>
                )}
              </svg>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid #FBBF24',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontSize: '12px',
                  color: '#FBBF24',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={14} color="#FBBF24" />
                {f5SelectedGroup === 'kb'
                  ? 'KODA 수탁사는 국민은행 지분 투자를 통해 KB금융 계열망 및 증권 STO와 유기적으로 결합되어 있습니다.'
                  : f5SelectedGroup === 'shinhan'
                  ? 'KDAC 수탁사와 코빗 거래소는 신한은행 지분 및 실명계좌를 통해 신한금융 밸류체인과 연결되어 있습니다.'
                  : '하나은행의 비트고 코리아 합작사와 하나증권의 아이티센 금 RWA는 하나금융 디지털자산 원팀 체제입니다.'}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            [Frame 6 변환] 기능 섹션 4: 미발견 조각투자/기관 탐색 및 팝업 모달
        ========================================================= */}
        <section id="sec_modal_preview" style={{ padding: '60px 0 70px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              FEATURE 04 · 미발견 조각투자사 탐색 모달
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              협력 가능한 다음 조각투자 파트너를 찾아보세요
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '8px' }}>
              지도 위에서 아직 발굴하지 않은 유망 기초자산 발행사를 발견하고, 어떤 금융사와 엮여 있는지 확인한 뒤 관계도에 추가하세요.
            </p>
          </div>

          {/* Quick Trigger Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { id: 'org_yeolmae', name: '열매컴퍼니 (아트앤가이드)', role: '1호 투자계약증권(미술품) 완판', sec: '키움증권 전담 계좌관리' },
              { id: 'org_kasa_korea', name: '카사코리아 (Kasa)', role: '부동산 1호 DABS 상장', sec: '대신파이낸셜그룹 인수 90%' },
              { id: 'org_itcen', name: '아이티센 (크레더/센골드)', role: '100% 실물보관 금·귀금속 RWA', sec: '하나증권 독점 계좌관리' },
              { id: 'org_music_cow', name: '뮤직카우', role: '음악저작권료 참여청구권', sec: '키움증권(계좌관리), 하나은행' }
            ].map((card) => (
              <div
                key={card.id}
                onClick={() => setModalOrgId(card.id)}
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700, marginBottom: '4px' }}>{card.role}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{card.name}</h3>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>{card.sec}</div>
                <div style={{ marginTop: '14px', fontSize: '11px', color: '#6366F1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  상세 관계 팝업 열기 <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>

          {/* EXACT POPUP MODAL (Matching Specification) */}
          {modalOrgId && selectedModalOrg && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}
              onClick={() => setModalOrgId(null)}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  background: '#161B26',
                  borderRadius: '18px',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  boxShadow: '0 24px 50px rgba(0, 0, 0, 0.8)',
                  overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#1E1B4B', border: '1px solid #6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      🏛️
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{selectedModalOrg.name}</h3>
                        <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', padding: '2px 8px', borderRadius: '4px' }}>
                          {selectedModalOrg.sector}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                        {selectedModalOrg.englishName}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setModalOrgId(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Summary Box */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div>
                      <div style={{ color: '#64748B', fontSize: '11px' }}>조사 및 검증 상태</div>
                      <div style={{ color: '#fff', fontWeight: 700, marginTop: '2px' }}>{selectedModalOrg.investigationStatus} (최근: {selectedModalOrg.lastVerifiedAt})</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748B', fontSize: '11px' }}>업종 / 분류</div>
                      <div style={{ color: '#fff', fontWeight: 700, marginTop: '2px' }}>{selectedModalOrg.sector}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ color: '#64748B', fontSize: '11px' }}>핵심 사업 및 자산</div>
                      <div style={{ color: '#CBD5E1', marginTop: '2px', lineHeight: '1.4' }}>{selectedModalOrg.summary}</div>
                    </div>
                  </div>

                  {/* Relations List to Major Securities */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#A5B4FC', marginBottom: '8px', textTransform: 'uppercase' }}>
                      국내 금융회사 및 얼라이언스 연계 현황
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {relations
                        .filter((r) => r.source === selectedModalOrg.id || r.target === selectedModalOrg.id)
                        .slice(0, 3)
                        .map((rel) => {
                          const otherId = rel.source === selectedModalOrg.id ? rel.target : rel.source;
                          const otherName = allNodes[otherId]?.name || otherId;
                          return (
                            <div key={rel.id} style={{ padding: '10px 14px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', fontSize: '12px' }}>
                              <strong style={{ color: '#38BDF8' }}>{otherName}:</strong> {rel.role} ({rel.evidenceSummary})
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Link
                    href={`/companies`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#CBD5E1',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    기업 프로필 상세 열기
                  </Link>

                  <button
                    onClick={() => {
                      triggerToast(`${selectedModalOrg.name}이(가) 내 관계도 분석 바스켓에 추가되었습니다!`);
                      setModalOrgId(null);
                    }}
                    style={{
                      background: '#6366F1',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={15} />
                    관계도에 추가
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================
            [Frame 7 변환] 기능 섹션 5: 테이블 리스트 뷰 및 일괄 작업
        ========================================================= */}
        <section id="sec_table_list" style={{ padding: '60px 0 70px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 30px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              FEATURE 05 · 테이블 리스트 및 일괄 작업
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              읽은 기업은 바로 다음 업무로
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '8px' }}>
              관계도에서 파악한 76개 참여사 목록과 제휴 관계를 확인하고, 필요한 기업만 골라 리스트에 담거나 엑셀로 다운로드하세요.
            </p>
          </div>

          <div style={{ background: '#121620', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
            {/* Table Control Bar */}
            <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                지도에서 추출된 디지털자산 참여사 목록 ({tableItems.length})
              </div>
              <input
                type="text"
                placeholder="기업명 검색..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 18px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedCount === tableItems.length}
                        onChange={toggleAllTableRows}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>기업명</th>
                    <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>기초자산 / 섹터</th>
                    <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>진행 단계</th>
                    <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 600 }}>지정 계좌관리기관 / 제휴 금융사</th>
                    <th style={{ padding: '12px 18px', color: '#94A3B8', fontWeight: 600, textAlign: 'right' }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {tableItems
                    .filter((item) => tableSearch === '' || item.name.includes(tableSearch) || item.sector.includes(tableSearch))
                    .map((row) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: row.checked ? 'rgba(56, 189, 248, 0.03)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <input
                            type="checkbox"
                            checked={row.checked}
                            onChange={() => toggleTableRow(row.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#fff' }}>{row.name}</td>
                        <td style={{ padding: '14px 18px', color: '#94A3B8' }}>{row.sector}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', color: '#CBD5E1', padding: '2px 8px', borderRadius: '4px' }}>
                            {row.stage}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#CBD5E1' }}>{row.relationSummary}</td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => triggerToast(`${row.name}을(를) ST 오너스 파트너 후보로 추가했습니다.`)}
                              style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              + 관계도 추가
                            </button>
                            <Link
                              href="/companies"
                              style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8', fontSize: '11px', textDecoration: 'none' }}
                            >
                              프로필
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Floating Action Bar */}
            {selectedCount > 0 && (
              <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(56, 189, 248, 0.4)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <CheckCircle2 size={16} color="#38BDF8" />
                  <span style={{ color: '#fff', fontWeight: 700 }}>{selectedCount}개 기관 선택됨</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => triggerToast(`${selectedCount}개 기관을 'KB증권 협력 후보 바스켓'에 담았습니다.`)}
                    style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    KB증권 파트너 후보 등록
                  </button>

                  <button
                    onClick={() => triggerToast(`${selectedCount}개 기관 비교 분석표를 생성했습니다.`)}
                    style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    경쟁사 비교하기
                  </button>

                  <button
                    onClick={() => triggerToast(`${selectedCount}개 기관 관계 데이터를 엑셀(CSV)로 다운로드했습니다.`)}
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={13} />
                    엑셀 다운로드 (CSV)
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            [Frame 8 변환] 기능 섹션 6: KB증권 및 금융권 실무자용 3대 페르소나별 프리셋
        ========================================================= */}
        <section id="sec_presets" style={{ padding: '60px 0 100px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              RECOMMENDED PRESETS FOR KB SECURITIES
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              직무별 맞춤 추천 유즈케이스
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '8px' }}>
              KB증권 STO 사업추진단, 투자심사역, 사업개발 담당자를 위한 즉시 탐색 프리셋입니다.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Persona 1: KB증권 STO 사업개발 담당자 */}
            <div style={{ background: 'linear-gradient(180deg, rgba(22, 27, 38, 0.9) 0%, rgba(15, 20, 29, 0.6) 100%)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', background: 'rgba(56, 189, 248, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>
                  KB증권 사업개발 담당자
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: '12px 0 16px', lineHeight: '1.4' }}>
                  "경쟁사(한투·미래·NH)가 아직 선점하지 않은 유망 기초자산은 어디일까요?"
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    onClick={() => {
                      triggerToast('귀금속 RWA 프리셋으로 이동합니다.');
                      const el = document.getElementById('sec_single_org');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>귀금속·원자재 RWA 토큰화</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>아이티센·크레더·센골드·한국금거래소</div>
                    </div>
                    <ArrowRight size={16} color="#38BDF8" />
                  </div>

                  <div
                    onClick={() => {
                      triggerToast('선박금융 및 신종자산 프리셋으로 이동합니다.');
                      const el = document.getElementById('sec_modal_preview');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>선박금융 & 항공자산 조각투자</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>바이셀스탠다드(피스)·갤럭시아머니트리</div>
                    </div>
                    <ArrowRight size={16} color="#38BDF8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Persona 2: 기관 디지털자산 투자심사역 */}
            <div style={{ background: 'linear-gradient(180deg, rgba(22, 27, 38, 0.9) 0%, rgba(15, 20, 29, 0.6) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#818CF8', background: 'rgba(99, 102, 241, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>
                  기관 디지털자산 투자심사역
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: '12px 0 16px', lineHeight: '1.4' }}>
                  "은행권 가상자산 수탁(Custody)과 거래소 실명계좌는 어떻게 얽혀 있을까요?"
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    onClick={() => {
                      triggerToast('5대 은행 수탁 합작사 맵으로 이동합니다.');
                      const el = document.getElementById('sec_holding_groups');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>5대 은행 가상자산 수탁 JV</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>KODA(국민)·KDAC(신한)·비트고(하나)·카르도(농협)</div>
                    </div>
                    <ArrowRight size={16} color="#818CF8" />
                  </div>

                  <div
                    onClick={() => {
                      triggerToast('5대 거래소 실명계좌 프리셋으로 이동합니다.');
                      const el = document.getElementById('sec_holding_groups');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>5대 원화거래소 실명계좌망</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>업비트(케이뱅크)·빗썸(농협/KB)·코인원(카뱅)</div>
                    </div>
                    <ArrowRight size={16} color="#818CF8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Persona 3: STO 플랫폼 엔지니어링 / 인프라 기획자 */}
            <div style={{ background: 'linear-gradient(180deg, rgba(22, 27, 38, 0.9) 0%, rgba(15, 20, 29, 0.6) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '4px' }}>
                  인프라 기획·전략 담당자
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: '12px 0 16px', lineHeight: '1.4' }}>
                  "분산원장 공동플랫폼과 글로벌 RWA 프로토콜 연동은 어떻게 진행 중일까요?"
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    onClick={() => {
                      triggerToast('코스콤 증권사 공동플랫폼 맵으로 이동합니다.');
                      const el = document.getElementById('sec_bridges');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>코스콤 증권사 공동플랫폼</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>키움·대신·유진·교보·DB 등 10개 증권사 공동망</div>
                    </div>
                    <ArrowRight size={16} color="#34D399" />
                  </div>

                  <div
                    onClick={() => {
                      triggerToast('글로벌 RWA 프로토콜 맵으로 이동합니다.');
                      const el = document.getElementById('sec_single_org');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>글로벌 RWA 프로토콜 연계</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>캔톤 네트워크(Canton)·시큐리타이즈·폴리곤</div>
                    </div>
                    <ArrowRight size={16} color="#34D399" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

export default function RelationsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8' }}>디지털자산 생태계 관계도를 불러오는 중입니다...</div>}>
      <RelationsInteractiveDashboard />
    </Suspense>
  );
}
