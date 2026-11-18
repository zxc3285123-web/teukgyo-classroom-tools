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
  function models(digits,drawOnes=false) {
    return '<div class="pv-board">'+digits.map((n,i)=>{
      const power=digits.length-i-1;
      const content=drawOnes && power===0
        ? '<div class="pv-draw" aria-label="낱개를 그릴 칸"></div>'
        : '<div class="pv-blocks" role="img" aria-label="'+10**power+' 모형 '+n+'개">'+(n?block(power).repeat(n):'<span>없음</span>')+'</div>';
      return '<div class="pv-column"><b>'+['낱개','십 모형','백 모형','천 모형'][power]+'</b>'+content+'</div>';
    }).join('')+'</div>';
  }
  function placeValue(kind,level,index) {
    const width={tens:2,hundreds:3,thousands:4}[kind];
    const digits=Array.from({length:width},(_,i)=>rand(i===0?1:0,level==='basic'?3:level==='challenge'?7:5));
    const number=Number(digits.join('')), board=models(digits);
    const pos=rand(0,width-1), current=digits[pos], place=placeNames[width-1-pos];
    switch(index%4) {
      case 0: return {...choose('모형과 같은 수를 찾으세요.',board,number,number+10**rand(0,width-2)),activityId:'total-'+number};
      case 1: {
        const amount=rand(1,level==='basic'?3:5);
        const target=digits.slice(0,-1).concat(amount);
        const total=Number(target.join(''));
        const emptyOnes=models(target,true);
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
        return {...choose('수 카드 '+number+'와 같은 모형을 찾으세요.','<div class="pv-model-pair"><b>㉠</b>'+models(first)+'<b>㉡</b>'+models(second)+'</div>',reverse?'㉡':'㉠',reverse?'㉠':'㉡'),activityId:'models-'+number+'-'+pos};
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
  add('lengthCm lengthM dailyMeasure', [['📏　0 ┃ 1 ┃ 2 ┃ 3 cm','길이를 재는 도구를 찾으세요.','📏 자','⚖ 저울'],['✂　끈 A ━━　│　끈 B ━━━━━','더 긴 끈을 가리키세요.','B','A']]);
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
  function arithmetic(kind,level,index) {
    const unit={tensCalc:10,hundredsCalc:100,largeCalc:1000}[kind]||1;
    const groups=rand(2,level==='basic'?3:5), each=rand(2,4);
    const dotGroup=n=>'<span class="counter-group">'+'● '.repeat(n)+'</span>';
    if(kind==='division'||kind==='multiplication'){
      const question=kind==='division'?'한 칸에 몇 개씩 있나요?':'모두 몇 개인가요?';
      const answer=kind==='division'?each:groups*each;
      return choose(question,dotGroup(each).repeat(groups),answer,answer+1);
    }
    if(kind==='borrowSubtract'||kind==='carryAdd'){
      const left=rand(6,9),right=rand(10-left,8);
      const subtract=kind==='borrowSubtract';
      const start=subtract?left+right:left;
      const visual=dotGroup(left)+(subtract?'<span class="crossed">'+dotGroup(right)+'</span>':' ＋ '+dotGroup(right));
      return choose(subtract?'지운 점을 빼면 몇 개가 남나요?':'두 묶음의 점은 모두 몇 개인가요?',visual,subtract?left:start+right,subtract?start:start+right-1);
    }
    const a=rand(2,4),b=rand(1,3);
    const chips=n=>'<span class="value-set">'+('<b>'+unit+'</b>').repeat(n)+'</span>';
    const subtract=index%4===2;
    return choose(subtract?'지운 수 카드를 빼세요.':'수 카드를 모두 더하세요.',chips(a)+(subtract?'<span class="crossed">'+chips(b)+'</span>':' ＋ '+chips(b)),(subtract?a:a+b)*unit,(subtract?a+b:a+b-1)*unit);
  }
  window.supportedActivity=(topic,kind,level,index)=>{
    if(['tens','hundreds','thousands'].includes(kind))return placeValue(kind,level,index);
    if(['multiplication','division','tensCalc','hundredsCalc','largeCalc','borrowSubtract','carryAdd'].includes(kind))return arithmetic(kind,level,index);
    const tasks=cards[topic]||cards[kind];
    if(!tasks)return null;
    const [clue,prompt,right,wrong]=pick(tasks);
    return choose(prompt,'<div class="activity-clue">'+clue+'</div>',right,wrong);
  };
})();
