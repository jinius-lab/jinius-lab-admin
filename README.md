# JINIUS-LAB SYSTEM

학원 관리 전용 대시보드

## 배포 방법

### 1단계 — GitHub에 올리기
```bash
git init
git add .
git commit -m "첫 배포"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jinius-lab.git
git push -u origin main
```

### 2단계 — Vercel 배포
1. https://vercel.com 접속 → GitHub 로그인
2. "Add New Project" → jinius-lab 레포 선택
3. Framework: Create React App 자동 감지됨
4. "Deploy" 클릭 → 2~3분 후 완료

### 3단계 — 가비아 도메인 연결
1. Vercel 대시보드 → Settings → Domains
2. 구매한 도메인 입력 (예: jinius-lab.com)
3. Vercel이 알려주는 DNS 값 복사
4. 가비아 → My가비아 → DNS 관리
5. CNAME 레코드 추가:
   - 호스트: www
   - 값: cname.vercel-dns.com
6. A 레코드 추가:
   - 호스트: @
   - 값: 76.76.21.21
7. 10~30분 후 적용 완료

## 비밀번호 변경
`src/App.jsx` 파일 맨 위 `const PASSWORD = "1234";` 수정
