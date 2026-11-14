/* Independent worksheet activities for curriculum content elements not in the
   original topic bank. These are examples for teacher review, not copied text. */
(()=>{
  const C=window.basicCurriculum2022, bands=window.expandBasicCurriculum;
  const original=C.createProblems;
  const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const pick=a=>a[rand(0,a.length-1)];
  const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=rand(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
  const options=(a,b,c,level)=>{const seen=new Set([a]);const other=[b,c,'다른 답','해당 없음'].filter(x=>{if(seen.has(x))return false;seen.add(x);return true});return `<div class="word-choices">보기: ${shuffle([a,...other.slice(0,level==='basic'?1:2)]).join('　·　')}</div>`};
  const question=(q,a,b,c,level)=>({question:q,answer:String(a),visual:options(String(a),String(b),String(c),level)});
  const dots=n=>Array.from({length:n},()=>'<span class="count-dot"></span>').join('');
  const shapeNames=['동그라미','세모','네모'];
  const objects=[['공','동그라미'],['피자 조각','세모'],['책','네모'],['시계','동그라미'],['교통 표지판','세모'],['창문','네모'],['바퀴','동그라미'],['삼각자','세모'],['액자','네모'],['접시','동그라미'],['달력','네모'],['삼각 깃발','세모'],['동전','동그라미'],['칠판','네모'],['도넛','동그라미']];
  const places=['교실','도서관','운동장','급식실','보건실','체육관'];
  function mathProblem(kind,level){
    if(['find','distinguish','objectShape','solidShape','flatShape','planeFigure','dailyGeometry'].includes(kind)){
      if(kind==='find'){let target=pick(['연필','책','컵','공','우산','가방','신발','지우개','가위','수첩','물병','모자','시계','장갑']);return question(`보기에서 ${target}을 찾아보세요.`,target,pick(['사과','버스','나무']),pick(['시계','숟가락','의자']),level)}
      if(kind==='distinguish'){let [obj,shape]=pick(objects);return question(`${obj}의 모양과 같은 것은?`,shape,...shuffle(shapeNames.filter(s=>s!==shape)),level)}
      if(kind==='solidShape'){let [item,answer]=pick([['공','공 모양'],['상자','상자 모양'],['깡통','둥근기둥 모양'],['주사위','상자 모양'],['음료 캔','둥근기둥 모양'],['구슬','공 모양'],['택배 상자','상자 모양'],['휴지심','둥근기둥 모양'],['지구본','공 모양'],['벽돌','상자 모양'],['원통형 컵','둥근기둥 모양'],['농구공','공 모양']]);return question(`${item}과 비슷한 입체 모양은?`,answer,...['공 모양','상자 모양','둥근기둥 모양'].filter(x=>x!==answer),level)}
      let [item,answer]=pick(objects);return question(`${item}에서 찾을 수 있는 ${kind==='planeFigure'?'평면도형':'평면 모양'}은?`,answer,...shapeNames.filter(x=>x!==answer),level)
    }
    if(['compareBasic','compareDirect','lengthCm','lengthM','weightKg','capacityL','dailyMeasure'].includes(kind)){
      let unit=kind==='lengthCm'?'cm':kind==='lengthM'?'m':kind==='weightKg'?'kg':kind==='capacityL'?'L':pick(['cm','개']);
      let a=rand(2,level==='challenge'?80:20),b=rand(2,level==='challenge'?80:20);if(a===b)b++;
      let x=pick(['리본','줄','나무 막대','물병','상자']);
      let label=unit==='kg'?'더 무거운':unit==='L'?'더 많이 담는':'더 긴';
      return question(`${x} A는 ${a}${unit}, B는 ${b}${unit}입니다. ${label} 것은?`,a>b?'A':'B',a>b?'B':'A','같다',level)
    }
    if(['orderBasic','ordinal','positionBasic','direction','spaceRead','spaceUse'].includes(kind)){
      if(kind==='ordinal'){let n=rand(1,9),side=pick(['앞','뒤']);return question(`${side}에서 ${n}번째를 나타내는 말은?`,`${n}번째`,`${n+1}번째`,`${Math.max(1,n-1)}번째`,level)}
      if(kind==='orderBasic'){let seq=shuffle(['사과','바나나','포도']);let p=pick([0,1,2]);return question(`${seq.join(' → ')} 순서에서 ${p+1}번째는?`,seq[p],seq[(p+1)%3],seq[(p+2)%3],level)}
      let direction=pick(['왼쪽','오른쪽','위쪽','아래쪽','앞쪽','뒤쪽']),object=pick(['공','책','로봇','자동차','사람','블록']);let opposite={왼쪽:'오른쪽',오른쪽:'왼쪽',위쪽:'아래쪽',아래쪽:'위쪽',앞쪽:'뒤쪽',뒤쪽:'앞쪽'}[direction];return question(`${object}이 기준점에서 ${direction}으로 한 칸 이동합니다. 어느 방향인가요?`,direction,opposite,pick(['가운데','제자리']),level)
    }
    if(['solidBuild','flatBuild','figureBuild','blocksBuild'].includes(kind)){
      if(kind==='blocksBuild'){let n=rand(2,16);return {question:`쌓기나무 ${n}개로 탑을 만들었습니다. 사용한 쌓기나무는 모두 몇 개인가요?`,visual:dots(n),answer:`${n}개`}}
      if(kind==='solidBuild'){let [item,shape]=pick([['공','공 모양'],['구슬','공 모양'],['농구공','공 모양'],['상자','상자 모양'],['주사위','상자 모양'],['택배 상자','상자 모양'],['벽돌','상자 모양'],['깡통','둥근기둥 모양'],['휴지심','둥근기둥 모양'],['음료 캔','둥근기둥 모양'],['원통형 컵','둥근기둥 모양'],['지구본','공 모양']]);return question(`${item}처럼 만들 때 필요한 입체 모양은?`,shape,...['공 모양','상자 모양','둥근기둥 모양'].filter(x=>x!==shape),level)}
      let [item,shape]=pick(objects);return question(`${item}을 만들거나 꾸밀 때 필요한 모양은?`,shape,...shapeNames.filter(x=>x!==shape),level)
    }
    if(kind==='classifyDouble'||kind==='classifyMany'){
      let color=pick(['빨간','파란','노란','초록']),shape=pick(shapeNames),size=pick(['큰','작은']);
      let answer=kind==='classifyMany'?`${size} ${color} ${shape}`:`${color} ${shape}`;
      let otherColor=pick(['빨간','파란','노란','초록'].filter(x=>x!==color));
      return question(`${kind==='classifyMany'?'크기·색·모양':'색과 모양'}을 모두 살펴 ${answer}를 찾으세요.`,answer,kind==='classifyMany'?`${size} ${otherColor} ${shape}`:`${otherColor} ${shape}`,kind==='classifyMany'?`${size} ${color} ${pick(shapeNames.filter(x=>x!==shape))}`:`${color} ${pick(shapeNames.filter(x=>x!==shape))}`,level)
    }
    if(kind==='classifyThree'){
      let sets=[['과일','사과','바나나','포도','버스'],['동물','강아지','고양이','토끼','의자'],['학용품','연필','지우개','공책','사과'],['탈것','버스','기차','자전거','수건'],['음식','밥','빵','국','신발'],['옷','셔츠','바지','양말','숟가락'],['가구','책상','의자','침대','바나나'],['악기','북','피아노','기타','우산'],['식물','나무','꽃','풀','기차'],['주방 도구','냄비','접시','숟가락','신발'],['운동 도구','공','줄넘기','라켓','책'],['청소 도구','빗자루','걸레','청소기','사과']];let [category,a,b,c,wrong]=pick(sets);return question(`${category} 세 가지를 함께 고르세요.`,`${a}, ${b}, ${c}`,`${a}, ${b}, ${wrong}`,`${a}, ${c}, ${wrong}`,level)
    }
    if(['classifyBasic','classifyTwo'].includes(kind)){
      let sets=[['과일','사과','바나나','연필'],['탈것','버스','기차','수건'],['옷','셔츠','바지','숟가락'],['학용품','연필','지우개','사과'],['동물','강아지','고양이','의자'],['음식','밥','빵','신발'],['가구','책상','의자','사과'],['운동 도구','공','줄넘기','컵'],['주방 도구','숟가락','접시','우산'],['식물','나무','꽃','자동차'],['악기','북','피아노','신발'],['청소 도구','빗자루','걸레','연필'],['날씨','비','눈','도서관'],['마시는 것','물','우유','책']];let [category,a,b,other]=pick(sets);return question(`${category}끼리 모을 때 알맞은 것은?`,`${a}, ${b}`,`${a}, ${other}`,`${b}, ${other}`,level)
    }
    if(kind==='matchingRule'){let rule=pick([2,3,4,5]),a=rand(2,6);return question(`1개→${rule}개, ${a}개→${a*rule}개입니다. 같은 규칙으로 ${a+1}개→?`,String((a+1)*rule),String((a+1)*rule+1),String(a*rule),level)}
    if(['patternBasic','patternObject','patternShape','patternUse'].includes(kind)){
      let pair=pick([['●','▲'],['빨강','파랑'],['사과','배'],['큰 공','작은 공'],['가','나'],['1','2'],['★','○'],['버스','기차']]),repeats=pick([2,3,4]);let seq=Array.from({length:repeats*2-1},(_,i)=>pair[i%2]);return question(`${seq.join(' → ')} → ? 규칙에 따라 다음에 올 것은?`,pair[1],pair[0],pick(['별','3','네모']),level)
    }
    if(['makeTable','simpleGraph','manyGraphs'].includes(kind)){
      let a=rand(2,10),b=rand(2,10);if(a===b)b++;let x=pick(['사과','책','공','연필']),y=pick(['배','가방','블록','지우개']);
      if(kind==='makeTable')return question(`${x} ${a}개, ${y} ${b}개를 조사했습니다. 표의 ${x} 칸에 쓸 수는?`,String(a),String(b),String(a+b),level);
      let graphType=kind==='manyGraphs'?pick(['그림그래프','막대그래프','표']):'간단한 그래프';
      let marks=`${x}: ${'■'.repeat(a)} / ${y}: ${'■'.repeat(b)}`;
      let ask=pick(['more','less','count','difference']);
      if(ask==='count')return {question:`${graphType} ${marks}. ${x}는 몇 개인가요?`,visual:'',answer:`${a}개`};
      if(ask==='difference')return {question:`${graphType} ${marks}. 두 자료의 개수 차이는?`,visual:'',answer:`${Math.abs(a-b)}개`};
      if(ask==='less')return question(`${graphType} ${marks}. 어느 것이 더 적나요?`,a<b?x:y,a<b?y:x,'같다',level);
      return question(`${graphType} ${marks}. 어느 것이 더 많나요?`,a>b?x:y,a>b?y:x,'같다',level)
    }
    if(['gameChance','lifeChance'].includes(kind)){
      if(kind==='lifeChance'){let a=rand(3,8),b=rand(1,2),color=pick(['빨간','파란','노란','초록']);return question(`주머니에 ${color} 공 ${a}개와 다른 색 공 ${b}개가 있습니다. 어느 색 공이 나올 가능성이 더 큰가요?`,color+' 공','다른 색 공','같다',level)}
      let item=pick(['빨간 공','파란 공','노란 공','초록 공','빨간 구슬','파란 구슬','노란 구슬','초록 구슬','빨간 블록','파란 블록','노란 블록','초록 블록']);return question(`주머니에 ${item}만 3개 있습니다. 하나를 꺼내면 무엇이 나올까요?`,item,'없는 색 물건','연필',level)
    }
    if(kind==='split5'){let total=rand(2,5),a=rand(1,total-1),thing=pick(['구슬','사과','블록','별','공']);return {question:`${thing} ${total}개를 ${a}개와 나머지로 가르면 나머지는 몇 개인가요?`,visual:dots(total),answer:`${total-a}개`}}
    if(kind==='singleDigit'){let n=rand(0,9),context=pick(['숫자','그림의 수']);return question(`${context} ${n}을 읽으면?`,['영','일','이','삼','사','오','육','칠','팔','구'][n],['영','일','이','삼','사','오','육','칠','팔','구'][(n+1)%10],['영','일','이','삼','사','오','육','칠','팔','구'][(n+2)%10],level)}
    if(kind==='dailyTime'){let before=pick([['아침','점심','저녁'],['등교','수업','하교'],['기상','세수','아침 식사'],['아침 식사','등교','수업'],['수업','점심 식사','하교'],['손 씻기','식사','양치'],['잠자리 준비','불 끄기','잠자기'],['기상','옷 입기','등교'],['아침 운동','수업','점심'],['버스 타기','학교 도착','교실 가기'],['점심','휴식','오후 수업'],['하교','집 도착','저녁 식사']]);return question(`${before.join(' → ')} 순서에서 두 번째는?`,before[1],before[0],before[2],level)}
    if(['tensCalc','hundredsCalc','largeCalc','carryAdd','borrowSubtract'].includes(kind)){
      let a,b,sign='+',answer;
      if(kind==='tensCalc'){a=rand(2,7)*10;b=rand(1,2)*10;sign=pick(['+','−']);answer=sign==='+'?a+b:a-b}
      else if(kind==='hundredsCalc'){a=rand(2,7)*100;b=rand(1,2)*100;sign=pick(['+','−']);answer=sign==='+'?a+b:a-b}
      else if(kind==='largeCalc'){a=rand(1000,7000);b=rand(100,900);sign=pick(['+','−']);answer=sign==='+'?a+b:a-b}
      else if(kind==='carryAdd'){a=rand(5,9);b=rand(10-a,9);answer=a+b}
      else {a=rand(11,18);b=rand(a-9,9);sign='−';answer=a-b}
      return {question:`${a} ${sign} ${b} = ?`,visual:level==='basic'?'<div class="word-choices">수를 차례대로 계산해 보세요.</div>':'',answer:String(answer)}
    }
    if(kind==='lifeNumbers'){let n=rand(1000,9999),place=pick(['버스 번호','사물함 번호','물건 번호']);return question(`${place} ${n}에서 맨 앞 숫자는?`,String(n)[0],String(n)[1],String(n)[2],level)}
    return null;
  }
  window.fullUnitMathProblem=mathProblem;
})();
