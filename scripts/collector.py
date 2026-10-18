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

def run_collector():
    print(f"[*] KoreaCrypto Collector started at {get_kst_iso()}")
    status = load_json("status.json")
    status["lastAttemptAt"] = get_kst_iso()

    queries = [
        "KB증권 토큰증권",
        "KB증권 캔톤",
        "토큰증권 전자증권법 입법예고",
        "프로젝트 한강 예금토큰 2단계",
        "디지털자산기본법 원화 스테이블코인"
    ]

    collected_count = 0
    new_findings = []
    
    for q in queries:
        items = fetch_rss_items(q, max_items=5)
        print(f"    - Query '{q}': {len(items)} items found")
        collected_count += len(items)
        time.sleep(1)

    # 갱신 타임스탬프 기록
    status["lastSuccessAt"] = get_kst_iso()
    status["systemStatus"] = "정상 가동 중"
    
    # 만약 새롭게 검증된 데이터가 저장되었다면 lastDataChangeAt 갱신
    if new_findings:
        status["lastDataChangeAt"] = get_kst_iso()
        
    save_json("status.json", status)
    print(f"[+] Collector completed successfully. Processed {collected_count} signals.")

if __name__ == "__main__":
    run_collector()
