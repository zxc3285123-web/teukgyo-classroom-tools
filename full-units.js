/* 2022 special education basic curriculum: grade-band knowledge/content elements.
   These are curriculum content elements, not textbook chapter titles.
   Source: MOE Notice 2022-34, Annex 3, Korean pp.63-65; Math pp.137-141.
   https://nise.go.kr/onmam/openapi/fileDown.do?fileSn=oZXmqchDx6q4fe5TJYtELA */
window.expandBasicCurriculum=(()=>{
  const rows={
    e12:{
      korean:`여러 가지 소리|sounds|듣기·말하기;표정과 몸짓|expression|듣기·말하기;의사소통 의도|intent|듣기·말하기;형태 지각|form|읽기;그림·기호·상징|symbols|읽기;글자의 기초가 되는 선과 모양|lines|쓰기`,
      math:`찾기|find|수와 연산;변별하기|distinguish|수와 연산;비교하기|compareBasic|수와 연산;짝짓기|matching|수와 연산;순서짓기|orderBasic|수와 연산;다섯까지 개수 세기|count5|수와 연산;가르기와 모으기|split5|수와 연산;화폐 탐색|moneyuse|수와 연산;사물의 모양|objectShape|도형;공간의 탐색|positionBasic|도형;직관적 비교|compareBasic|측정;시간 경험하기|daynight|측정;규칙 따라 하기|patternBasic|규칙성;분류 경험하기|classifyBasic|자료와 가능성`
    },
    e34:{
      korean:`일상생활과 관련된 단어|familiarwords|듣기·말하기;자신과 관련된 단어|selfWords|듣기·말하기;움직임을 나타내는 말|actionWords|듣기·말하기;상징·글자의 의미|symbolMeaning|읽기;환경 인쇄물의 정보|signs|읽기;글자의 모양|letterShape|쓰기;친숙한 글자|familiarLetters|쓰기`,
      math:`열까지 개수 세기|count9|수와 연산;한 자리 수|singleDigit|수와 연산;순서수|ordinal|수와 연산;한 자리 수의 덧셈과 뺄셈|add9|수와 연산;동전 활용|coins|수와 연산;입체 모양|solidShape|도형;입체 모양 만들기와 꾸미기|solidBuild|도형;위치와 방향의 변화|direction|도형;직접 비교|compareDirect|측정;하루의 일과|dailyTime|측정;물체 배열의 규칙|patternObject|규칙성;두 개로 분류하기|classifyTwo|자료와 가능성`
    },
    e56:{
      korean:`단어와 문장|wordsSentences|듣기·말하기;성질이나 상태를 나타내는 말|stateWords|듣기·말하기;시간·장소를 나타내는 말|timePlaceWords|듣기·말하기;묻는 말|askanswer|듣기·말하기;글자의 구성 요소|letterParts|읽기;단어의 의미|wordread|읽기;매체 자료|mediaRead|읽기;글자의 짜임과 획순|letterOrder|쓰기;단어의 의미|wordWriting|쓰기`,
      math:`두 자리 수|tens|수와 연산;10이 되는 더하기와 10에서 빼기|add10|수와 연산;몇십의 덧셈과 뺄셈|tensCalc|수와 연산;지폐 활용|bills|수와 연산;평면 모양|flatShape|도형;평면 모양 만들기와 꾸미기|flatBuild|도형;공간의 이해|spaceRead|도형;길이(cm)|lengthCm|측정;들이(L)|capacityL|측정;시각과 날짜|clock|측정;물체·무늬 배열의 규칙|patternShape|규칙성;세 개 이상으로 분류하기|classifyThree|자료와 가능성;표 만들기|makeTable|자료와 가능성`
    },
    middle:{
      korean:`느낌을 나타내는 말|feelingWords|듣기·말하기;준언어적·비언어적 표현|nonverbal|듣기·말하기;높임 표현|honorific|듣기·말하기;단어의 의미 확장|wordExpand|읽기;문장의 의미|reading|읽기;단어의 소리와 표기|spelling|쓰기;기록의 필요성|memo|쓰기;문장의 구성|sentenceBuild|쓰기`,
      math:`세 자리 수|hundreds|수와 연산;몇백의 덧셈과 뺄셈|hundredsCalc|수와 연산;받아올림이 있는 한 자리 수의 덧셈|carryAdd|수와 연산;곱셈의 기초|multiplication|수와 연산;여러 가지 화폐 활용|cardmoney|수와 연산;평면도형|planeFigure|도형;평면도형 만들기와 꾸미기|figureBuild|도형;쌓기나무 쌓기|blocksBuild|도형;길이(m)|lengthM|측정;무게(kg)|weightKg|측정;시간과 달력|calendar|측정;대응하는 규칙|matchingRule|규칙성;두 가지 기준으로 분류하기|classifyDouble|자료와 가능성;간단한 그래프|simpleGraph|자료와 가능성;놀이 속의 가능성|gameChance|자료와 가능성`
    },
    high:{
      korean:`정보를 전하는 말|infoSpeech|듣기·말하기;생각을 나타내는 말|opinionSpeech|듣기·말하기;대화의 목적|dialoguePurpose|듣기·말하기;매체를 활용한 의사소통 방법|mediaTalk|듣기·말하기;읽기의 목적과 방법|readingPurpose|읽기;글과 매체|notices|읽기;문장 부호의 의미|punctuation|쓰기;문단의 구성|paragraph|쓰기;쓰기 매체의 특성|writingMedia|쓰기`,
      math:`네 자리 수|thousands|수와 연산;생활 속의 수|lifeNumbers|수와 연산;큰 수의 덧셈과 뺄셈|largeCalc|수와 연산;받아내림이 있는 십몇과 한 자리 수의 뺄셈|borrowSubtract|수와 연산;나눗셈의 기초|division|수와 연산;화폐 활용과 관리|budget|수와 연산;생활과 도형|dailyGeometry|도형;공간의 활용|spaceUse|도형;생활과 측정|dailyMeasure|측정;시간 계획하기|schedule|측정;규칙의 활용|patternUse|규칙성;여러 가지 기준으로 분류하기|classifyMany|자료와 가능성;여러 가지 그래프|manyGraphs|자료와 가능성;생활 속의 가능성|lifeChance|자료와 가능성`
    }
  };
  const unitList=Object.fromEntries(Object.entries(rows).map(([band,subjects])=>[band,Object.fromEntries(Object.entries(subjects).map(([subject,value])=>[subject,value.split(';').map((line,index)=>{const [title,kind,area]=line.split('|');return {id:`${band}_${subject}_${index}`,title,kind,area}})]))]));
  return unitList;
})();
