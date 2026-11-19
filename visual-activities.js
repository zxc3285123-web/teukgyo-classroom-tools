/* Print-first manipulatives and short, supported responses. */
(() => {
  const pick = values => values[Math.floor(Math.random() * values.length)];
  const rand = (lo,hi) => lo + Math.floor(Math.random() * (hi-lo+1));
  const pair = (a,b) => Math.random()<.5 ? [a,b] : [b,a];
  const choose = (question,stimulus,right,wrong) => ({
    question,stimulus,choices:pair(String(right),String(wrong)),answer:String(right),
    type:'choice',typeLabel:'가리키거나 ○ 하세요'
  });

  // Grid lines remain visible on a printer with background graphics disabled.
  function block(power) {
    if (power===3) {
      const grid=Array.from({length:9},(_,i)=>{
        const n=(i+1)*2;
        return 'M'+(2+n)+' 10v20 M2 '+(10+n)+'h20 M'+(2+n)+' 10l8 -8 M22 '+(10+n)+'l8 -8';
      }).join(' ');
      return '<svg class="pv-thousand" viewBox="0 0 32 32" aria-hidden="true"><path d="M2 10 10 2H30L22 10Z M22 10 30 2V22L22 30Z M2 10H22V30H2Z" fill="white" stroke="currentColor"/><path d="'+grid+'" fill="none" stroke="currentColor" stroke-width=".42"/></svg>';
    }
    const cols=power===2?10:1,rows=power>=1?10:1;
    const w=cols*4,h=rows*4;
    let lines='';
    for(let x=4;x<w;x+=4) lines+='M'+x+' 0v'+h;
    for(let y=4;y<h;y+=4) lines+='M0 '+y+'h'+w;
    return '<svg aria-hidden="true" width="'+(w+2)+'" height="'+(h+2)+'" viewBox="-1 -1 '+(w+2)+' '+(h+2)+'"><rect width="'+w+'" height="'+h+'" fill="white" stroke="currentColor"/><path d="'+lines+'" fill="none" stroke="currentColor" stroke-width=".65"/></svg>';
  }
  const placeNames=['일','십','백','천'];
  function models(digits,drawOnes=false,focus=-1) {
    return '<div class="pv-board">'+digits.map((n,i)=>{
      const power=digits.length-i-1;
      const content=drawOnes && power===0
        ? '<div class="pv-draw" aria-label="낱개를 그릴 칸"></div>'
        : '<div class="pv-blocks" role="img" aria-label="'+10**power+' 모형 '+n+'개">'+(n?block(power).repeat(n):'<span>없음</span>')+'</div>';
      return '<div class="pv-column'+(i===focus?' cue-target':'')+'"><b>'+['낱개','십 모형','백 모형','천 모형'][power]+'</b>'+content+'</div>';
    }).join('')+'</div>';
  }
  function placeValue(kind,level,index) {
    const width={tens:2,hundreds:3,thousands:4}[kind];
    const digits=Array.from({length:width},(_,i)=>rand(i===0?1:0,level==='basic'?3:level==='challenge'?7:5));
    const number=Number(digits.join('')), board=models(digits);
    const pos=rand(0,width-1), current=digits[pos];
    if(level==='challenge' && index%2===0){
      const step=10**pos;
      return {question:(pos===0?'낱개':placeNames[pos]+' 모형')+' 하나를 더 놓으면 어떤 수가 되나요?',
        typeLabel:'모형 바꾸기',visual:board,answer:String(number+step)};
    }
    if(level==='basic' && index%2===0){
      const target=width-pos-1;
      return choose(placeNames[target]+'의 자리 칸에서 모형을 세어 보세요.',models(digits,false,pos),current+'개',((current+1)%5)+'개');
    }
    switch(index%4) {
      case 0: return {...choose('모형과 같은 수를 찾으세요.',board,number,number+10**rand(0,width-2)),activityId:'total-'+number};
      case 1: {
        const amount=rand(1,level==='basic'?3:5);
        const target=digits.slice(0,-1).concat(amount);
        const total=Number(target.join(''));
        const emptyOnes=models(target,true,width-1);
        return {question:'낱개 칸에 점을 그리세요.',typeLabel:'수 모형 완성하기',
          visual:'<div class="pv-target">만들 수 <b>'+total+'</b></div>'+emptyOnes,
          responseInVisual:true,answer:'낱개 칸에 점 '+amount+'개',activityId:'draw-'+total};
      }
      case 2: {
        const columns=digits.map((n,i)=>'<div><small>'+placeNames[width-i-1]+'</small><b>'+(i===pos?'□':n)+'</b></div>').join('');
        return {question:'모형을 보고 빈칸 하나를 채우세요.',typeLabel:'숫자 쓰기',visual:board+'<div class="pv-digits">'+columns+'</div>',responseInVisual:true,answer:String(current),activityId:'fill-'+number+'-'+pos};
      }
      default: {
        const other=digits.slice();other[pos]=current===0?1:current-1;
        const reverse=Math.random()<.5;
        const first=reverse?other:digits,second=reverse?digits:other;
        return {...choose('숫자 '+number+'에 맞는 모형을 찾으세요.','<div class="pv-model-pair"><b>㉠</b>'+models(first)+'<b>㉡</b>'+models(second)+'</div>',reverse?'㉡':'㉠',reverse?'㉠':'㉡'),activityId:'models-'+number+'-'+pos};
      }
    }
  }

  // Each entry is a task with its own illustrated clue and two response cards.
  // Entries sharing a unit use the same skill in different familiar contexts.
  const cards={};
  function add(kinds,rows){for(const key of kinds.split(' '))cards[key]=rows}
  add('sounds',[
    ['🐶','이 동물의 소리는?','멍멍','야옹'],['🐱','이 동물의 소리는?','야옹','꽥꽥'],
    ['꽥꽥','이 소리를 내는 동물은?','🦆','🐮'],['🐮','이 동물의 소리는?','음메','찍찍'],
    ['🔔','이 물건의 소리는?','딸랑','주룩주룩'],['🐷','이 동물의 소리는?','꿀꿀','멍멍']
  ]);
  add('find matching familiarwords wordread wordWriting familiarLetters',[
    ['✏️','그림과 같은 낱말을 찾으세요.','연필','가위'],['☂️','그림과 같은 낱말을 찾으세요.','우산','안경'],
    ['신발','낱말과 맞는 그림을 찾으세요.','👟','🧤'],['가방','낱말과 맞는 그림을 찾으세요.','🎒','🧢']
  ]);
  add('moneyuse coins bills cardmoney budget',[
    ['가격표　🥛 500원　🍞 1,000원','500원으로 살 수 있는 것을 가리키세요.','🥛 우유','🍞 빵'],
    ['가격표　🍎 1,000원　🍐 2,000원','더 싼 과일을 가리키세요.','🍎 사과','🍐 배']
  ]);
  add('classifyBasic classifyTwo classifyThree classifyMany classifyDouble',[
    ['🍎　🍐　🍌','같은 무리에 넣을 그림은?','🍇','🧦'],['🧤　🧥　🧦','같은 무리에 넣을 그림은?','👕','🍎'],
    ['▲　▲　▲','색과 모양이 같은 것은?','▲','○']
  ]);
  add('solidShape solidBuild',[
    ['🥫','캔과 닮은 모양은?','원기둥','공'],['🎲','주사위와 닮은 모양은?','상자 모양','공 모양']
  ]);
  add('timePlaceWords schedule',[
    ['09:00　📖 독서　→　10:00　🎵 음악','10시에 할 활동을 가리키세요.','🎵 음악','📖 독서'],
    ['월　⚽ 체육　│　화　🎨 미술','화요일에 할 활동을 가리키세요.','🎨 미술','⚽ 체육']
  ]);
  add('letterShape letterParts',[
    ['ㄱ　+　ㅏ','두 글자 조각을 합쳐 보세요.','가','나'],['ㄴ　+　ㅗ','두 글자 조각을 합쳐 보세요.','노','누']
  ]);
  add('stateWords',[
    ['🧊','그림과 어울리는 말은?','차가워요','뜨거워요'],['☀️　🌡️ 35°C','그림과 어울리는 말은?','더워요','추워요']
  ]);
  add('askanswer dialoguePurpose',[
    ['💬　어디에서 만날까요?','질문에 맞는 답을 찾으세요.','🏫 학교 앞','⏰ 세 시'],
    ['💬　몇 시에 만날까요?','질문에 맞는 답을 찾으세요.','⏰ 두 시','🏫 교실']
  ]);
  add('punctuation', [['💬　어디로 가나요 □','빈칸에 놓을 기호는?','?','.'],['💬　집에 가요 □','문장을 마치는 기호는?','.','?']]);
  add('lengthCm lengthM dailyMeasure', [['끈 A ━━　│　끈 B ━━━━━','더 긴 끈을 가리키세요.','B','A']]);
  add('weightKg', [['⚖　🎒 3 kg　│　📦 5 kg','더 무거운 것을 가리키세요.','📦','🎒']]);
  add('capacityL', [['물통 A　1 L　│　물통 B　3 L','더 많이 담는 물통은?','B','A']]);
  add('lifeNumbers', [['🚌　21번　│　🚏 35번','버스에 적힌 번호를 찾으세요.','21','35']]);
  add('matchingRule', [['● → ▲▲　　●● → ▲▲▲▲','●가 하나 늘면 ▲는 몇 개 늘까요?','2','1']]);
  add('lifeChance gameChance', [['주머니　● ● ● ○','한 개를 뽑을 때 더 잘 나오는 모양은?','●','○'],['주머니　▲ ▲ ■ ▲','어느 모양이 더 많이 들어 있나요?','▲','■']]);
  add('e34_social_self middle_career_interest',[
    ['내가 좋아하는 일　♥　🎨','관심 카드에 맞는 활동은?','🎨 그림 그리기','⚽ 축구하기'],
    ['내가 잘하는 일　★　🪴','강점 카드에 맞는 활동은?','🪴 식물 돌보기','📞 전화 받기']
  ]);
  add('e34_social_friends e56_social_manners',[
    ['💬　연필을 빌려도 될까?　✏️','빌려줄 때 할 말을 가리키세요.','응, 여기 있어.','고마워, 잘 썼어.'],
    ['친구　🧑　→　🎁　→　나','선물을 받은 내가 할 말은?','고마워!','어서 와!']
  ]);
  add('e34_social_rules e56_social_norms',[
    ['📚 도서관　🤫','표지에 맞는 행동을 찾으세요.','작은 소리로 말하기','큰 소리로 외치기'],
    ['🚦 빨간불　🧍','지금 할 행동을 고르세요.','서서 기다려요','길을 건너요']
  ]);
  add('e56_social_choice middle_social_decide',[
    ['오늘 날씨　☔','비를 피할 물건을 가리키세요.','☂️ 우산','🕶️ 선글라스'],
    ['내 계획　📚 조용히 책 읽기','계획에 맞는 장소는?','📖 도서관','⚽ 운동장']
  ]);
  add('middle_social_responsibility',[
    ['내 역할　🪴 화분 돌봄','내가 쓸 도구를 찾으세요.','💧 물뿌리개','🧹 빗자루'],
    ['내 역할　📝 회의 기록','준비할 것을 가리키세요.','✏️ 필기구','🎤 마이크']
  ]);
  add('middle_social_democracy',[
    ['우리 모둠 투표　⚽ ●●　│　🎨 ●●●','표를 더 많이 받은 활동은?','🎨 미술','⚽ 축구'],
    ['발표 순서　① 가람 → ② 하늘 → ③ 보라','가람 다음에 말할 사람은?','하늘','보라']
  ]);
  add('high_social_rights high_social_human',[
    ['내 선택 카드　📷 촬영　✋ 원하지 않아요','카드의 뜻에 맞는 행동은?','카메라를 내려요','사진을 찍어요'],
    ['도움 요청　🔎 큰 글씨','요청한 자료를 가리키세요.','큰 글씨 안내문','작은 글씨 안내문']
  ]);
  add('high_social_conflict',[
    ['회의실 사용표　🕐 1시 가람　│　🕑 2시 보라','2시에 쓰기로 한 사람은?','보라','가람'],
    ['공동 사용 순서　① 민수 → ② 유진','민수 다음에 쓸 사람은?','유진','민수']
  ]);
  add('middle_career_work',[
    ['작업대　🥖　🥐　🍞','여기에서 일하는 사람은?','제빵사','버스 기사'],
    ['일터　📚　대출 · 반납','여기에서 일하는 사람은?','사서','미용사']
  ]);
  add('middle_career_task',[
    ['포장 순서　① 물건 넣기 → ② 📦 닫기 → ③ 이름표 붙이기','상자를 닫은 다음에 할 일은?','이름표 붙이기','물건 넣기'],
    ['작업　✂️　종이 자르기','쓸 도구를 가리키세요.','✂️ 가위','📏 자']
  ]);
  add('middle_career_attitude high_career_team',[
    ['작업표　📦 📦 📦　│　완료　📦 📦','남은 상자 수를 알려 주세요.','1개','3개'],
    ['근무표　시작 09:00 → 끝 12:00','일을 시작할 시각은?','오전 9시','낮 12시']
  ]);
  add('middle_career_plan high_career_plan',[
    ['관심　🥖 빵 만들기　→　체험　□','계획에 넣을 체험은?','🥐 제과제빵','🌱 원예'],
    ['관심　🪴 식물 돌보기　→　체험　□','계획에 넣을 체험은?','🌱 원예','📦 물류 포장']
  ]);
  add('middle_career_prepare high_career_prepare',[
    ['실습 준비물　👟 실내화　＋　💧 물병','준비표에 있는 물건을 가리키세요.','💧 물병','☂️ 우산'],
    ['집합 안내　📍 안내실　│　⏰ 10:00','모이는 곳을 가리키세요.','안내실','작업실']
  ]);
  add('high_career_strength',[
    ['요청 카드　👀　먼저 보여 주세요','요청에 맞는 도움은?','작업 시범','빠른 말로 설명'],
    ['요청 카드　🔎　글씨를 크게','요청에 맞는 도움은?','확대한 이름표','작은 글씨 목록']
  ]);
  add('high_career_work',[
    ['A　🚌 10분　│　B　🚌 30분','버스를 더 짧게 타는 일터는?','A','B'],
    ['A　📦 포장　│　B　☎ 전화 안내','손님 전화를 받는 일터는?','B','A']
  ]);
  add('high_career_safety',[
    ['작업장 표지　⛑ 안전모 착용','머리를 보호할 물건은?','⛑ 안전모','🧤 장갑'],
    ['작업장 표지　🧤 보호 장갑 착용','표지에 맞는 준비물은?','🧤 장갑','🥾 신발']
  ]);
  add('honorific',[['👩‍🏫 선생님　←　아침 인사','인사말을 가리키세요.','안녕하세요.','안녕!']]);
  add('opinionSpeech',[['내 선택　♥　⚽','내 생각과 맞는 말은?','축구를 하고 싶어요.','책을 읽고 싶어요.']]);
  add('writingMedia mediaTalk',[['📱　💬 문자 보내기','글을 입력할 곳은?','⌨️ 자판','🔊 스피커']]);
  add('memo',[['준비물　✏️　📓','준비물 메모를 고르세요.','연필 · 공책','가위 · 풀']]);
  add('wordExpand',[['🏃　빠르다','뜻이 비슷한 말을 찾으세요.','재빠르다','느리다']]);
  add('spelling',[['그림　🌳','그림 이름을 바르게 쓴 것은?','나무','나므']]);
  add('letterOrder',[['ㄴ　＋　ㅏ　→　□','두 조각으로 만든 글자를 찾으세요.','나','다']]);
  add('blocksBuild',[['위층　■　│　아래층　■ ■','두 층에 쓴 블록은 모두 몇 개인가요?','3','2']]);
  add('selfWords',[['내 물건　🎒　이름표　하늘','가방 이름표에서 이름을 찾으세요.','하늘','가방']]);
  add('calendar', [['11월　월 2 │ 화 3 │ 수 4','수요일 날짜를 가리키세요.','4일','2일'],['6월　목 4 │ 금 5 │ 토 6','금요일 날짜를 가리키세요.','5일','6일']]);
  add('clock',[['🕑','시계와 같은 시각을 찾으세요.','2시','5시'],['🕕','시계와 같은 시각을 찾으세요.','6시','9시']]);
  add('bills',[['지폐　[1,000원]　[1,000원]','두 장의 값을 모으세요.','2,000원','1,000원']]);
  add('coins',[['동전　◯ 100원　◯ 100원','두 동전의 값을 모으세요.','200원','100원']]);
  add('cardmoney',[['우유 900원　│　카드 결제　□ 원','카드로 낼 금액을 가리키세요.','900원','90원']]);
  add('budget',[['내 돈 2,000원　│　🥛 1,000원　🍞 3,000원','살 수 있는 것을 가리키세요.','🥛','🍞']]);
  function subtraction(remaining,removed,unit,level) {
    const total=remaining+removed;
    if(level==='challenge'){
      return {question:'빠진 수를 구하세요.',typeLabel:'거꾸로 계산하기',
        visual:'<div class="sub-equation">'+total*unit+' − <span class="inline-blank"></span> = '+remaining*unit+'</div>',responseInVisual:true,answer:String(removed*unit)};
    }
    const tokens=Array.from({length:total},(_,i)=>{
      const taken=i>=remaining;
      const mark=taken?'<path d="M3 3L29 29M29 3L3 29" fill="none" stroke="currentColor" stroke-width="3"/>':'';
      const icon=unit===1
        ? '<circle cx="16" cy="16" r="9" fill="white" stroke="currentColor" stroke-width="2"/>'
        : '<rect x="1" y="5" width="30" height="22" rx="2" fill="white" stroke="currentColor"/><text x="16" y="20" text-anchor="middle" font-size="10">'+unit+'</text>';
      return '<svg class="sub-token '+(taken?'cue-taken':'cue-keep')+'" viewBox="0 0 32 32" aria-hidden="true">'+icon+mark+'</svg>';
    }).join('');
    const visual='<div class="subtract-model"><div class="sub-equation">'+total*unit+' − '+removed*unit+' = □</div><div class="sub-tokens" role="img" aria-label="전체 '+total+'개 중 '+removed+'개에 ×표">'+tokens+'</div><small>×표가 있는 '+(unit===1?'동그라미는 세지 않아요.':'카드는 더하지 않아요.')+'</small></div>';
    if(level==='practice'){
      return {question:'그림을 보고 뺄셈식을 완성하세요.',typeLabel:'숫자 쓰기',
        visual:visual.replace(' = □',' = <span class="inline-blank"></span>'),responseInVisual:true,answer:String(remaining*unit)};
    }
    return choose(unit===1?'남은 동그라미는 몇 개인가요?':'남은 수 카드의 값을 모두 더하세요.',visual,remaining*unit,total*unit);
  }
  function arithmetic(kind,level,index) {
    const unit={tensCalc:10,hundredsCalc:100,largeCalc:1000}[kind]||1;
    const groups=rand(2,level==='basic'?3:5), each=rand(2,4);
    const mark=pick(['●','▲','■']);
    const dotGroup=n=>'<span class="counter-group">'+mark.repeat(n).split('').join(' ')+'</span>';
    if(kind==='division'||kind==='multiplication'){
      const question=kind==='division'?'한 칸에 몇 개씩 있나요?':'모두 몇 개인가요?';
      const answer=kind==='division'?each:groups*each;
      return choose(question,dotGroup(each).repeat(groups),answer,answer+1);
    }
    if(kind==='borrowSubtract'||kind==='carryAdd'){
      const left=rand(6,9),right=rand(10-left,8);
      if(kind==='borrowSubtract')return subtraction(left,right,1,level);
      return choose('두 묶음의 모양은 모두 몇 개인가요?',window.pictureAddition(dotGroup(left),dotGroup(right)),left+right,left+right-1);
    }
    const a=rand(2,4),b=rand(1,3);
    const chips=n=>'<span class="value-set">'+('<b>'+unit+'</b>').repeat(n)+'</span>';
    if(index%4===2)return subtraction(a,b,unit,level);
    return choose('수 카드를 모두 더하세요.',window.pictureAddition(chips(a),chips(b)),(a+b)*unit,(a+b-1)*unit);
  }
  // Only use reversible, one-to-one pairs in matching tasks.
  const pairSets={};
  function register(keys,prompt,rows) {
    for(const key of keys.split(' '))pairSets[key]={prompt,rows};
  }
  register('sounds','그림과 소리를 이으세요.',[
    ['🐶','멍멍'],['🐱','야옹'],['🐮','음메'],['🐷','꿀꿀'],['🐥','삐약삐약'],['🦆','꽥꽥']
  ]);
  register('matching find familiarwords spelling wordread wordWriting familiarLetters','그림과 낱말을 이으세요.',[
    ['👓','안경'],['🎒','가방'],['⌚','시계'],['☂️','우산'],['🔑','열쇠'],['✂️','가위']
  ]);
  register('actionWords wordsSentences sentenceBuild reading infoSpeech paragraph','그림과 하는 일을 이으세요.',[
    ['🏃','달려요'],['🏊','수영해요'],['🚲','자전거를 타요'],['✍️','글을 써요'],['👏','손뼉을 쳐요']
  ]);
  register('expression nonverbal feelingWords','얼굴과 어울리는 말을 이으세요.',[
    ['😢','슬퍼요'],['😠','화나요'],['😲','놀랐어요'],['😴','졸려요']
  ]);
  register('signs symbols symbolMeaning notices readingPurpose mediaRead','표지와 뜻을 이으세요.',[
    ['🚻','화장실'],['🚭','금연'],['🅿','주차장'],['♿','휠체어 이용 가능']
  ]);
  register('letterParts letterShape letterOrder','글자 조각과 완성된 글자를 이으세요.',[
    ['ㄱ + ㅏ','가'],['ㄴ + ㅏ','나'],['ㄷ + ㅗ','도'],['ㅁ + ㅜ','무']
  ]);
  register('clock dailyTime','시계와 시각을 이으세요.',[
    ['🕐','1시'],['🕒','3시'],['🕕','6시'],['🕘','9시']
  ]);
  register('middle_career_work middle_career_interest middle_career_plan high_career_plan','도구와 관련된 일을 이으세요.',[
    ['✂️ 빗·가위','머리 다듬기'],['🥣 반죽기','빵 만들기'],['🪴 물뿌리개','식물 돌보기'],['🖌 붓','그림 그리기']
  ]);
  register('middle_career_task middle_social_responsibility','도구와 할 일을 이으세요.',[
    ['🧹 빗자루','바닥 쓸기'],['📏 자','길이 재기'],['✂️ 가위','종이 자르기'],['✏️ 연필','기록하기']
  ]);
  register('high_career_safety','보호구와 보호할 곳을 이으세요.',[
    ['🧤 장갑','손'],['🥽 보안경','눈'],['⛑ 안전모','머리'],['🥾 안전화','발']
  ]);
  register('e56_social_choice middle_social_decide','날씨와 필요한 물건을 이으세요.',[
    ['☔ 비','우산'],['❄️ 추위','방한 장갑'],['☀️ 강한 햇빛','햇빛 가리개']
  ]);
  register('e34_social_rules e56_social_norms','표지와 행동을 이으세요.',[
    ['🤫 조용히','목소리 낮추기'],['🚯 투기 금지','쓰레기 되가져가기'],['🚷 통행 금지','다른 길로 가기']
  ]);
  register('high_social_rights high_social_human high_career_strength','요청 카드와 도움을 이으세요.',[
    ['🔎 크게','글자 키우기'],['🐢 천천히','말하는 속도 낮추기'],['👀 시범','먼저 보여 주기']
  ]);
  register('middle_career_prepare high_career_prepare','안내 기호와 정보를 이으세요.',[
    ['📍','장소'],['🕘','시각'],['📅','날짜'],['🎒','준비물']
  ]);
  register('e34_social_self','좋아하는 활동과 그림을 이으세요.',[['그림 그리기','🎨'],['수영하기','🏊'],['노래하기','🎤'],['자전거 타기','🚲']]);
  register('e34_social_friends e56_social_manners honorific','상황과 인사말을 이으세요.',[['👋 만남','안녕하세요'],['🎁 선물 받기','고맙습니다'],['🎂 생일','축하해요']]);
  register('stateWords','그림과 느낌을 이으세요.',[['🧊 얼음','차가워요'],['🪨 돌','딱딱해요'],['🪶 깃털','가벼워요']]);
  register('askanswer dialoguePurpose','질문과 대답을 이으세요.',[['⏰ 몇 시?','오후 두 시'],['📍 어디?','도서관'],['📅 무슨 요일?','금요일']]);
  register('writingMedia mediaTalk','기호와 기능을 이으세요.',[['📷','사진 찍기'],['🎤','음성 녹음'],['⌨️','글 입력']]);
  register('lengthCm lengthM weightKg capacityL dailyMeasure','재려는 것과 도구를 이으세요.',[['끈의 길이','📏 자'],['상자의 무게','⚖ 저울'],['물의 양','눈금 계량컵']]);
  function matchingActivity(set,level) {
    const first=pick(set.rows),second=pick(set.rows.filter(row=>row!==first));
    if(level==='basic'){
      return choose('카드와 짝이 되는 것을 가리키세요.','<div class="activity-clue">'+first[0]+'</div>',first[1],second[1]);
    }
    if(level==='challenge'){
      const third=pick(set.rows.filter(row=>row!==first&&row!==second));
      const rows=[first,second,third];
      const shift=rand(0,2);
      const order=rows.map((_,i)=>rows[(i+shift)%3]);
      return {question:set.prompt,typeLabel:'세 쌍 연결하기',type:'match',
        visual:'<div class="match-task">'+rows.map((row,i)=>'<span>'+['①','②','③'][i]+' '+row[0]+'</span><span class="link-space">●　●</span><span>'+['㉠','㉡','㉢'][i]+' '+order[i][1]+'</span>').join('')+'</div>',
        answer:rows.map((row,i)=>['①','②','③'][i]+'–'+['㉠','㉡','㉢'][order.indexOf(row)]).join(', ')};
    }
    const answers=pair(first[1],second[1]);
    const lines=[first,second].map((row,i)=>
      '<span>'+['①','②'][i]+' '+row[0]+'</span><span class="link-space" aria-hidden="true">●　　　　●</span><span>'+['㉠','㉡'][i]+' '+answers[i]+'</span>'
    ).join('');
    return {question:set.prompt,type:'match',typeLabel:'선 잇기',visual:'<div class="match-task">'+lines+'</div>',
      answer:answers[0]===first[1]?'①–㉠, ②–㉡':'①–㉡, ②–㉠'};
  }

  function voteActivity(){
    const options=pair(pick(['⚽ 축구','🏀 농구','🎵 노래']),pick(['🎲 보드게임','🎨 미술','🏓 탁구']));
    const votes=pair(rand(1,2),rand(3,5));
    const table='<table class="picture-table"><caption>모둠 투표 · ● 한 개는 한 표</caption><tbody>'+options.map((name,i)=>'<tr><th>'+name+'</th><td>'+('● '.repeat(votes[i]))+'</td></tr>').join('')+'</tbody></table>';
    const winner=votes[0]>votes[1]?0:1;
    return choose('표가 더 많은 활동을 가리키세요.',table,options[winner],options[1-winner]);
  }

  // Students locate information on an everyday timetable, task list or name tag.
  const boards={};
  function boardSet(keys,title,items,prompt){
    for(const key of keys.split(' '))boards[key]={title,items,prompt};
  }
  boardSet('middle_social_democracy','발표 순서',['가람','누리','보라','하늘'],'말할 사람');
  boardSet('high_social_conflict','회의실 사용 순서',['기획 모둠','미술 모둠','음악 모둠','체육 모둠'],'사용할 모둠');
  boardSet('high_career_team middle_career_attitude','근무 순서',['민수','수아','준호','유진'],'일할 사람');
  boardSet('middle_career_prepare high_career_prepare','체험 순서',['🏷 이름표 받기','👋 인사하기','📦 포장하기','🧹 정리하기'],'할 일');
  boardSet('high_career_work','오늘의 직무 체험',['📦 포장','📞 전화 안내','🧹 청소','🌱 원예'],'체험');
  boardSet('timePlaceWords schedule calendar memo','오늘의 일정',['📚 독서','🎨 미술','🎵 음악','⚽ 체육'],'활동');
  function scheduleActivity(board,level) {
    const first=pick(board.items),second=pick(board.items.filter(item=>item!==first));
    const [a,b]=[rand(9,11),rand(13,16)];
    const which=rand(0,1), times=[a+'시',(b-12)+'시'], periods=['오전','오후'];
    const rows=[first,second].map((item,i)=>'<tr><th'+(i===which?' class="cue-target"':'')+'>'+periods[i]+' '+times[i]+'</th><td>'+item+'</td></tr>').join('');
    const table='<table class="picture-table"><caption>'+board.title+'</caption><tbody>'+rows+'</tbody></table>';
    if(level==='challenge'){
      const late=rand(1,2);
      return {question:'오후 일정이 '+late+'시간 늦어졌어요. 새로운 시작 시각은?',typeLabel:'일정 바꾸기',visual:table,answer:'오후 '+(b-12+late)+'시'};
    }
    if(level==='practice'){
      return {question:periods[which]+'에 '+board.prompt+'을 말하거나 쓰세요.',typeLabel:'표 읽기',visual:table,answer:which?second:first};
    }
    return choose(periods[which]+' 칸에서 '+board.prompt+'을 찾으세요.',
      '<table class="picture-table"><caption>'+board.title+'</caption><tbody>'+rows+'</tbody></table>',which?second:first,which?first:second);
  }
  register('intent','말과 뜻을 이으세요.',[['👋 안녕','인사'],['🙏 도와줘','부탁'],['🎉 축하해','축하'],['✋ 그만','멈춤 요청']]);
  register('form lines','선을 보고 이름과 이으세요.',[['━','가로선'],['┃','세로선'],['╱','비스듬한 선'],['〰','물결선']]);
  register('solidShape solidBuild','물건과 닮은 모양을 이으세요.',[['🎲 주사위','상자 모양'],['⚽ 축구공','공 모양'],['🥫 통조림','원기둥 모양']]);
  register('wordExpand','뜻이 비슷한 낱말을 이으세요.',[['🙂 기쁘다','즐겁다'],['🤫 조용하다','고요하다'],['⚡ 빠르다','재빠르다']]);
  register('classifyBasic classifyTwo classifyThree','그림과 무리 이름을 이으세요.',[['🍎 사과','과일'],['👕 셔츠','옷'],['🚌 버스','탈것'],['✏️ 연필','학용품']]);
  register('positionBasic direction spaceRead spaceUse','화살표와 방향을 이으세요.',[['⬅','왼쪽'],['➡','오른쪽'],['⬆','위쪽'],['⬇','아래쪽']]);

  function freshBoard(kind,level){
    const number=rand(2,level==='basic'?5:8);
    if(['coins','moneyuse','bills','cardmoney','budget'].includes(kind)){
      const unit=kind==='coins'||kind==='moneyuse'?100:1000;
      const wallet='<div class="value-set">'+('<b>'+unit+'원</b>').repeat(number)+'</div>';
      const sum=number*unit;
      if(kind==='budget'||kind==='cardmoney'){
        const fruit=pick(['🍐 배','🍎 사과','🍇 포도']),other=pick(['🥛 우유','🥖 빵','🥕 당근']);
        const prices=pair([fruit,sum],[other,sum+unit]);
        const table='<table class="picture-table"><caption>가격표</caption>'+prices.map(([item,price])=>'<tr><th>'+item+'</th><td>'+price+'원</td></tr>').join('')+'</table>';
        return kind==='budget'?choose('가진 돈으로 살 수 있는 것을 찾으세요.',wallet+table,fruit,other):
          choose(fruit+'의 결제 금액을 찾으세요.',table,sum+'원',(sum+unit)+'원');
      }
      const extra=pick([0,1,2])*unit/2;
      const money=wallet+(extra?'<span class="value-set"><b>'+extra+'원</b></span>':'');
      // Only print actual coin or banknote denominations.
      if(kind==='bills'){
        const bill=pick([1000,5000,10000]);
        const notes='<div class="value-set">'+('<b>'+bill+'원</b>').repeat(number)+'</div>';
        return choose('지폐를 모으면 얼마인가요?',notes,number*bill+'원',(number+1)*bill+'원');
      }
      return choose('동전을 모으면 얼마인가요?',money,(sum+extra)+'원',(sum+extra+unit)+'원');
    }
    if(['distinguish','objectShape','flatShape','flatBuild','figureBuild','planeFigure','dailyGeometry','classifyMany','classifyDouble'].includes(kind)){
      const shapes=[['○','동그라미'],['△','세모'],['□','네모'],['◇','마름모']];
      const a=pick(shapes),b=pick(shapes.filter(s=>s!==a));
      const tags=pair(a,b);
      if(kind==='classifyDouble'||kind==='classifyMany'){
        const size=pick(['큰','작은']),order=pair(size,'다른');
        const opt=order.map(v=>'<b style="font-size:'+(v===size?(size==='큰'?32:18):(size==='큰'?18:32))+'px">'+a[0]+'</b>');
        return {question:size+' '+a[1]+' 모양을 찾으세요.',typeLabel:'그림에 ○ 하세요',responseInVisual:true,
          visual:'<div class="activity-clue">㉠ '+opt[0]+'　　 ㉡ '+opt[1]+'　　 ㉢ <b>'+b[0]+'</b></div>',answer:order[0]===size?'㉠':'㉡'};
      }
      return {question:'왼쪽 모양을 오른쪽에 그리세요.',typeLabel:'보고 그리기',responseInVisual:true,
        visual:'<div class="picture-row">'+tags.map(s=>'<span>'+s[0]+'</span>').join('')+'<span>→</span><span class="draw-cell"></span><span class="draw-cell"></span></div>',answer:tags.map(s=>s[1]).join(' → ')};
    }
    if(kind==='blocksBuild'){
      const bottom=rand(2,4),top=rand(1,bottom);
      const blocks='<div class="activity-clue" aria-label="위층 '+top+'개, 아래층 '+bottom+'개">'+'■ '.repeat(top)+'<br>'+'■ '.repeat(bottom)+'</div>';
      return choose('블록은 모두 몇 개인가요?',blocks,top+bottom,bottom);
    }
    if(['gameChance','lifeChance','matchingRule'].includes(kind)){
      const marks=pair(pick(['●','▲']),pick(['□','◇']));
      if(kind==='matchingRule'){
        const start=rand(1,4);
        return choose('빈칸에 들어갈 수는?','<div class="activity-clue">'+start+' → '+start*number+'<br>'+(start+1)+' → '+(start+1)*number+'<br>'+(start+2)+' → □</div>',(start+2)*number,(start+1)*number);
      }
      const all=[...Array(number).fill(marks[0]),marks[1]];
      all.splice(rand(0,number-1),0,all.pop());
      return choose('하나를 뽑으면 어떤 모양이 더 잘 나올까요?','<div class="activity-clue">주머니　'+all.join(' ')+'</div>',marks[0],marks[1]);
    }
    if(kind==='punctuation'){
      const thing=pick(['연필','공책','사과','책','물병','공']),ask=Math.random()<.5;
      return choose('빈칸에 놓을 기호는?', '<div class="activity-clue">💬 '+thing+(ask?' 어디에 있나요':' 여기 있어요')+' □</div>',ask?'?':'.',ask?'.':'?');
    }
    if(kind==='opinionSpeech'){
      const options=pair(pick(['⚽ 축구','🏀 농구','🏸 배드민턴']),pick(['🎨 그림','🎵 노래','📚 독서']));
      const selected=rand(0,1);
      return choose('내가 고른 활동을 가리키세요.','<div class="activity-clue">'+options.map((v,i)=>(i===selected?'☑ ':'☐ ')+v).join('　　 ')+'</div>',options[selected],options[1-selected]);
    }
    if(kind==='lifeNumbers'||kind==='selfWords'){
      const name=pick(['누리','보라','하늘','가람']),no=rand(10,89);
      return kind==='lifeNumbers'?choose('버스 번호를 가리키세요.','<div class="activity-clue">🚌 '+no+'번</div>',no,no+1):
        choose('이름표와 같은 이름을 찾으세요.','<div class="activity-clue">'+pick(['🎒 가방','📓 공책','🧢 모자'])+' 이름표　'+name+'</div>',name,pick(['지우','은호','수현']));
    }
    return null;
  }
  window.supportedActivity=(topic,kind,level,index)=>{
    if(['tens','hundreds','thousands'].includes(kind))return placeValue(kind,level,index);
    if(['multiplication','division','tensCalc','hundredsCalc','largeCalc','borrowSubtract','carryAdd'].includes(kind))return arithmetic(kind,level,index);
    if(index%3!==0){
      const fresh=freshBoard(kind,level);
      if(fresh)return fresh;
    }
    const set=pairSets[topic]||pairSets[kind],board=boards[topic]||boards[kind];
    if(topic==='middle_social_democracy' && index%3===0)return voteActivity();
    if(board && index%3!==0)return scheduleActivity(board,level);
    if(set && index%3===1)return matchingActivity(set,level);
    const tasks=cards[topic]||cards[kind];
    if(!tasks && set)return matchingActivity(set,level);
    if(!tasks)return null;
    const [clue,prompt,right,wrong]=pick(tasks);
    return choose(prompt,'<div class="activity-clue">'+clue+'</div>',right,wrong);
  };
})();
