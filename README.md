# 다정한 교실 도구함

특수교사를 위한 학습지와 학부모 안내문 도구입니다. 별도 서버나 API 키 없이 브라우저에서 실행됩니다.

## 기능

- 학년·과목·주제·수준·문항 수 선택 후 A4 학습지 미리보기 및 인쇄/PDF 저장
- 본인 ChatGPT에서 만든 새 문항 가져오기 및 같은 브라우저에 저장된 이전 문항과 중복 검사
- 학부모 안내문 초안 정리, 톤 선택, 결과 복사

## GitHub Pages 배포

이 저장소의 루트에 `index.html`이 있습니다. GitHub 저장소의 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**, `main` 브랜치와 `/ (root)`를 선택하면 게시됩니다.

문항 기록은 각 브라우저의 로컬 저장소에 보관됩니다. 기기 간 동기화되지 않으며 브라우저 데이터를 삭제하면 사라질 수 있습니다. ChatGPT 기능은 선생님 본인의 계정에서 요청 문구를 보내고 결과를 다시 붙여 넣는 방식입니다. 학생 개인정보는 입력하지 마세요.

교육과정 내용은 수업 전 [2022 개정 특수교육 기본 교육과정 원문](https://www.nise.go.kr/onmam/openapi/fileDown.do?fileSn=oZXmqchDx6q4fe5TJYtELA)과 학생별 목표에 맞게 검토해 주세요.

글꼴: Pretendard (라이선스는 `Pretendard-LICENSE.txt`).

## 광고 설정

현재 AdSense 게시자 계정의 자동 광고 코드를 `index.html`의 `<head>`에 연결했습니다. 광고 표시 위치와 형식은 [AdSense 광고 화면](https://adsense.google.com/adsense/)에서 `zxc3285123-web.github.io` 사이트의 **수정**을 눌러 관리합니다. 이 페이지 자체에는 선생님이 바꿀 수 있는 광고 설정을 두지 않았습니다. 광고 수익은 이 게시자 계정에 귀속됩니다.

AdSense에서 사이트 상태가 **준비됨**이어도 새 페이지에 광고가 즉시 보이지 않을 수 있습니다. 광고 게재 여부는 AdSense 계정의 자동 광고 설정과 심사 상태를 확인해 주세요. 인쇄하는 학습지에는 광고를 넣지 않았습니다.
