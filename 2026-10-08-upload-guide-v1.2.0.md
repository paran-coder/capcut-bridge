# CapCut Bridge v1.2.0 · GitHub 업로드 및 Vercel 배포

이 폴더에는 실행 파일 14개와 안내/사용 설명/출처 문서 3개, 총 17개만 있습니다.

## GitHub 업로드

1. GitHub에서 저장소를 만듭니다.
2. Add file → Upload files를 선택합니다.
3. **이 폴더 안의 파일 17개**를 저장소 최상위에 올립니다. 이 폴더 자체를 한 단계 감싸 올리지 마세요.
4. Commit changes로 저장합니다.

저장소 최상위에서 vercel.json과 2026-10-08-capcut-bridge-v1.2.0.html이 보여야 합니다.

## Vercel

1. Add New → Project에서 GitHub 저장소를 Import합니다.
2. Framework Preset: Other.
3. Root Directory: 저장소 루트.
4. Build Command: 비워 둡니다. 별도 빌드 없음.
5. Output Directory: .
6. 환경변수와 API 키 없이 Deploy합니다.
7. 배포 주소에서 샘플 체험/분석, 라이브러리 검색, 가이드 보기를 확인합니다.

vercel.json이 / 주소를 버전 HTML로 연결합니다. 브라우저 사용자 설치, npm 의존성, 영상 업로드, 서버 API가 없습니다. 선택 영상은 브라우저 안에서만 처리합니다.

## 구성

- HTML 1개: 앱 화면.
- CSS 5개: 기본 스타일, 텍스트 위계, 색상, 가이드 창, 라이브러리.
- MJS 7개: 앱, 미디어, 분석, 카탈로그, 순위 계산, 라이브러리 UI, 추가 효과.
- vercel.json: 첫 화면과 보안 헤더.
- 문서 3개: 이 안내, 사용 설명서, 항목별 출처 기록.

검증용 영상/스크린샷/테스트/이전 버전/ZIP/로컬 개발 서버는 이 폴더에 포함하지 않습니다. 앱 파일을 직접 더블클릭하는 file:// 실행 대신 배포 주소에서 사용하세요.

실제 GitHub 업로드 및 Vercel 공개 배포는 아직 수행하지 않았습니다.
