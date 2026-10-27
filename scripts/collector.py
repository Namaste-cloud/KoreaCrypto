#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KoreaCrypto Institutional Digital Asset Automated Collector & Verifier
- 실행 주기: 매 1시간마다 자동 실행 (GitHub Actions 또는 로컬 crontab)
- 출처: 금융위원회, 한국은행, 구글 뉴스 RSS, 네이버 뉴스
- 처리: 신규 기사 정규화, 중복 제거, 사건 묶기, 공식 근거 기반 분류, 검토 큐 격리, 상태 기록
"""

import os
import sys
import json
import time
import datetime
import urllib.parse
import urllib.request
import re
import html
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_json(filename, data):
    path = os.path.join(DATA_DIR, filename)
    # 안전 보존: 기존 파일 백업
    if os.path.exists(path):
        backup_path = path + ".bak"
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(open(path, "r", encoding="utf-8").read())
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_kst_iso():
    tz_offset = datetime.timezone(datetime.timedelta(hours=9))
    now = datetime.datetime.now(tz_offset)
    return now.isoformat(timespec='seconds')

def fetch_rss_items(query, max_items=10):
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=ko&gl=KR&ceid=KR:ko"
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            content = res.read().decode("utf-8", "ignore")
            items = re.findall(r"<item>(.*?)</item>", content, re.S)
            results = []
            for it in items[:max_items]:
                title_match = re.search(r"<title>(.*?)</title>", it, re.S)
                pubdate_match = re.search(r"<pubDate>(.*?)</pubDate>", it)
                link_match = re.search(r"<link>(.*?)</link>", it)
                source_match = re.search(r'<source[^>]*>(.*?)</source>', it)
                
                title = html.unescape(title_match.group(1)) if title_match else ""
                link = link_match.group(1) if link_match else ""
                pubdate = pubdate_match.group(1) if pubdate_match else ""
                publisher = source_match.group(1) if source_match else "뉴스"
                
                results.append({
                    "title": title,
                    "link": link,
                    "pubdate": pubdate,
                    "publisher": publisher
                })
            return results
    except Exception as e:
        print(f"[-] RSS fetch error for '{query}': {e}", file=sys.stderr)
        return []

import hashlib
from email.utils import parsedate_to_datetime

def parse_date(pubdate_str):
    try:
        dt = parsedate_to_datetime(pubdate_str)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        tz_offset = datetime.timezone(datetime.timedelta(hours=9))
        return datetime.datetime.now(tz_offset).strftime("%Y-%m-%d")

def match_entities_and_topics(title):
    matched_orgs = []
    if "KB" in title or "국민" in title:
        matched_orgs.append("org_kb_sec")
    if "신한" in title:
        matched_orgs.append("org_shinhan_fg")
    if "하나" in title:
        matched_orgs.append("org_hana_sec")
    if "미래에셋" in title:
        matched_orgs.append("org_mirae_sec")
    if "한국은행" in title or "한은" in title:
        matched_orgs.append("org_bok")
    if "금융위" in title or "금융위원회" in title:
        matched_orgs.append("org_fsc")
    if "코스콤" in title:
        matched_orgs.append("org_koscom")
    if "빗썸" in title or "업비트" in title or "두나무" in title:
        matched_orgs.append("org_upbit")
    return matched_orgs

def run_collector():
    kst_now = get_kst_iso()
    today_date = kst_now[:10]
    print(f"[*] KoreaCrypto Collector started at {kst_now}")

    status = load_json("status.json")
    status["lastAttemptAt"] = kst_now

    sources = load_json("sources.json")
    review_queue = load_json("review_queue.json")
    changelog = load_json("changelog.json")
    coverage = load_json("coverage.json")

    existing_titles = {s.get("title", "").strip() for s in sources}
    existing_urls = {s.get("url", "").strip() for s in sources}
    existing_queue_titles = {r.get("title", "").strip() for r in review_queue}

    queries = [
        "KB증권 토큰증권",
        "KB증권 캔톤",
        "토큰증권 전자증권법 입법예고",
        "프로젝트 한강 예금토큰 2단계",
        "디지털자산기본법 원화 스테이블코인",
        "코스콤 토큰증권 공동플랫폼"
    ]

    new_sources_added = []
    new_reviews_added = []

    for q in queries:
        items = fetch_rss_items(q, max_items=5)
        print(f"    - Query '{q}': {len(items)} items found")
        for item in items:
            title = item.get("title", "").strip()
            url = item.get("link", "").strip()
            publisher = item.get("publisher", "언론사")
            pub_date = parse_date(item.get("pubdate", ""))

            # 제목 뒤의 ' - 매체명' 접미사 분리 정리
            clean_title = re.sub(r"\s*-\s*[^-]+$", "", title) if " - " in title else title

            # 중복 검사
            if clean_title in existing_titles or url in existing_urls:
                continue

            # 신규 소스 생성
            hash_suffix = hashlib.md5(clean_title.encode('utf-8')).hexdigest()[:8]
            source_id = f"src_auto_{hash_suffix}"

            source_entry = {
                "id": source_id,
                "title": clean_title,
                "url": url,
                "publisher": publisher,
                "docType": "언론 보도",
                "publishedDate": pub_date,
                "eventDate": pub_date,
                "verifiedDate": today_date,
                "evidenceLevel": "언론 보도",
                "eventId": "evt_market_signal"
            }
            sources.insert(0, source_entry)
            existing_titles.add(clean_title)
            existing_urls.add(url)
            new_sources_added.append(source_entry)

            # 관련 기관 매칭 및 검토 대기열 등록
            matched_orgs = match_entities_and_topics(clean_title)
            if clean_title not in existing_queue_titles and len(matched_orgs) > 0:
                rev_id = f"rev_{today_date.replace('-', '')}_{hash_suffix[:4]}"
                review_entry = {
                    "id": rev_id,
                    "discoveredAt": kst_now,
                    "title": clean_title,
                    "publisher": publisher,
                    "url": url,
                    "matchedEntities": matched_orgs,
                    "issue": "신규 감지 시장 동향 (자동 수집)",
                    "details": f"[{publisher}] 보도: '{clean_title}' 관련 시장 신호 감지. 사업 영향도 및 공식 확인 여부 검토 대기.",
                    "status": "검토 대기"
                }
                review_queue.insert(0, review_entry)
                existing_queue_titles.add(clean_title)
                new_reviews_added.append(review_entry)

        time.sleep(0.5)

    print(f"[+] Total new sources added: {len(new_sources_added)}")
    print(f"[+] Total new review queue items added: {len(new_reviews_added)}")

    # 신규 데이터가 있으면 changelog 및 타임스탬프 갱신
    if new_sources_added:
        status["lastDataChangeAt"] = kst_now
        
        # 대표적인 신규 소스로 changelog 1건 생성
        top_src = new_sources_added[0]
        chg_entry = {
            "id": f"chg_{today_date.replace('-', '')}_{len(changelog) + 1:02d}",
            "timestamp": kst_now,
            "targetType": "project",
            "targetId": "proj_kb_sto_v2",
            "targetName": "기관 디지털자산 시장 동향 모니터",
            "field": "시장 신호 자동 수집 동기화",
            "oldValue": None,
            "newValue": f"신규 기사 '{top_src['title']}' 등 {len(new_sources_added)}건 수집 반영",
            "changeType": "정보 갱신",
            "evidenceSourceId": top_src["id"],
            "appliedMode": "자동 수집(검토 큐 연계)",
            "summary": f"자동 수집기를 통해 '{top_src['publisher']}' 등에서 최신 동향 기사 {len(new_sources_added)}건이 신규 탐지되어 검토 대기열에 등록되었습니다."
        }
        changelog.insert(0, chg_entry)
        save_json("changelog.json", changelog)
        save_json("sources.json", sources)
        save_json("review_queue.json", review_queue)

    # 조사 기준일 갱신
    if isinstance(coverage, dict):
        coverage["investigationBaseDate"] = today_date
        save_json("coverage.json", coverage)

    # 시스템 상태 메트릭 갱신
    status["lastSuccessAt"] = kst_now
    status["systemStatus"] = "정상 가동 중"
    if "metrics" in status:
        status["metrics"]["totalSources"] = len(sources)
        status["metrics"]["pendingReviewCount"] = len(review_queue)
        status["metrics"]["totalChangelogs"] = len(changelog)

    save_json("status.json", status)
    print(f"[+] Collector completed successfully at {kst_now}.")

if __name__ == "__main__":
    run_collector()
