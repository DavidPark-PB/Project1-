# 빠른 시작 가이드 (Quick Start)

## 🚀 가장 빠른 방법 (CLI 테스트)

```bash
# 프로젝트 루트에서 실행
./test_converter.sh
```

이것만 실행하면:
- 자동으로 환경 설정
- 샘플 데이터 생성
- 7개 플랫폼으로 변환
- 결과 파일 생성 (`server/out/` 폴더)

## 🌐 웹 UI로 실행

```bash
# 프로젝트 루트에서 실행
./run.sh
```

그 다음:
- 브라우저에서 http://localhost:3000/converter 접속
- Excel 파일 업로드
- 플랫폼 선택 및 변환

Ctrl+C 누르면 모든 서버 종료

## 📝 수동 실행 방법

### 방법 1: CLI만 사용 (간단)

```bash
cd server

# 최초 1회만 (환경 설정)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir -p out temp logs
python sample_data_generator.py

# 변환 실행
python convert.py \
  --input sample_master.xlsx \
  --targets ebay,shopify,coupang,naver,shopee,qoo10,alibaba \
  --out out/
```

### 방법 2: 웹 UI 사용 (풀 스택)

**터미널 1 - 백엔드:**
```bash
cd server
source venv/bin/activate
python main.py
```

**터미널 2 - 프론트엔드:**
```bash
npm install  # 최초 1회만
npm run dev
```

**브라우저:**
- http://localhost:3000/converter

## 📊 샘플 데이터

샘플 데이터는 자동으로 생성됩니다:
- `server/sample_master.xlsx` - 3개 상품, 6개 변형

직접 만들려면:
```bash
cd server
source venv/bin/activate
python sample_data_generator.py
```

## 🔍 결과 확인

변환된 파일 위치: `server/out/`

```bash
ls server/out/
# 출력:
# ebay.csv
# shopify.csv
# coupang.xlsx
# naver.xlsx
# shopee.csv
# qoo10.xlsx
# alibaba.xlsx
```

로그 파일: `server/logs/convert_*.jsonl`

## ❓ 문제 해결

### Python 모듈 없음
```bash
cd server
source venv/bin/activate
pip install -r requirements.txt
```

### npm 패키지 없음
```bash
npm install
# 또는
pnpm install
```

### 포트 이미 사용 중
백엔드(8000) 또는 프론트엔드(3000) 포트가 사용중이면:
```bash
# 사용중인 프로세스 찾기
lsof -i :8000
lsof -i :3000

# 종료 후 다시 실행
```

## 📚 더 자세한 정보

- 전체 가이드: [README.md](README.md)
- 개발자 가이드: [DEVELOPMENT.md](DEVELOPMENT.md)
- API 문서: http://localhost:8000/docs (서버 실행 후)

## 🎯 다음 단계

1. ✅ 샘플 데이터로 테스트
2. 📝 자신의 Master Excel 파일 준비
3. 🔄 실제 데이터로 변환
4. 📦 각 플랫폼에 업로드

## 💡 팁

- CLI가 웹 UI보다 빠름
- 대량 데이터는 `--max-workers 8` 사용
- 먼저 `--validate-only`로 검증 추천
- `--dry-run`으로 미리보기 가능
