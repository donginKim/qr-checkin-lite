#!/usr/bin/env python3
"""
엑셀 회원 명단 일괄 등록 스크립트

엑셀 형식 (data.xlsx 포맷):
  - 시트명 = 구역명 (예: "1.개봉구역", "2. 성가대")
  - 5행: 컬럼 헤더 (순번, 출생년도, 성명, 세례명, 연락처, ...)
  - 6행~: 데이터
  - C열(3번): 성명, D열(4번): 세례명, E열(5번): 연락처

사용법:
  pip install requests
  python import_participants.py --file 명단.xlsx --url https://example.com --pin 1234
"""

import argparse
import sys

import requests


def authenticate(session: requests.Session, base_url: str, pin: str):
    resp = session.post(
        f"{base_url}/api/admin/auth/verify",
        json={"pin": pin},
        timeout=10,
    )
    if resp.status_code != 200:
        print(f"인증 실패 (HTTP {resp.status_code}): {resp.text}")
        sys.exit(1)
    print("인증 성공")


def upload(session: requests.Session, base_url: str, file_path: str, replace_all: bool):
    with open(file_path, "rb") as f:
        resp = session.post(
            f"{base_url}/api/admin/participants/import",
            files={"file": (file_path, f,
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            params={"replaceAll": str(replace_all).lower()},
            timeout=30,
        )
    if resp.status_code != 200:
        print(f"업로드 실패 (HTTP {resp.status_code}): {resp.text}")
        sys.exit(1)
    return resp.json()


def main():
    parser = argparse.ArgumentParser(description="엑셀 회원 명단 일괄 등록")
    parser.add_argument("--file", required=True, help="엑셀 파일 경로")
    parser.add_argument("--url", required=True, help="서버 URL (예: https://example.com)")
    parser.add_argument("--pin", required=True, help="관리자 PIN")
    parser.add_argument("--replace-all", action="store_true",
                        help="기존 회원 데이터 전체 삭제 후 등록")
    args = parser.parse_args()

    confirm = input(
        f"\n{'[전체 삭제 후 ] ' if args.replace_all else ''}"
        f"{args.file} 파일을 {args.url} 에 업로드하시겠습니까? (y/N): "
    )
    if confirm.strip().lower() != "y":
        print("취소되었습니다.")
        sys.exit(0)

    session = requests.Session()
    authenticate(session, args.url.rstrip("/"), args.pin)
    result = upload(session, args.url.rstrip("/"), args.file, args.replace_all)

    print(f"\n등록 완료!")
    print(f"  전체: {result.get('totalRows', 0)}명")
    print(f"  성공: {result.get('inserted', 0)}명")
    print(f"  스킵: {result.get('skipped', 0)}명")


if __name__ == "__main__":
    main()
