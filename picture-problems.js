/* Original visual exercises, matched to the selected curriculum topic. */
(() => {
  const pick = items => items[Math.floor(Math.random() * items.length)];
  const number = (low, high) => low + Math.floor(Math.random() * (high - low + 1));
  const symbols = (items, label, start=-1) => `<div class="picture-row" role="img" aria-label="${label}">${items.map((item,i) => item === '□' ? '<span class="draw-cell"></span>' : `<span${i===start?' class="cue-start"':''}>${item}</span>`).join('')}</div>`;
  const make = (question, visual, answer, typeLabel = '그림 보고 쓰기') =>
    ({question, visual, answer: String(answer), typeLabel, responseInVisual: ['따라 그리기','모양 그리기','표 채우기','규칙 보고 그리기','빈칸 채우기','그림 보고 고르기'].includes(typeLabel)});
  const shape = (name, color = '') => `<i class="figure ${name} ${color}"></i>`;
  const tile = ['●', '▲', '■', '◆', '★'];
  const objects = [['🍎','사과'], ['🍐','배'], ['🍊','귤'], ['🍌','바나나'], ['🍓','딸기'], ['🍇','포도'], ['🍋','레몬']];
  const scenes = [['📖','책을 읽어요'], ['🏃','달려요'], ['🧹','빗자루로 쓸어요'], ['✍️','글씨를 써요'], ['👏','박수를 쳐요'], ['🚲','자전거를 타요'], ['🎤','노래를 불러요'], ['🍽️','식사를 해요']];
  const signs = [['🚭','금연','담배를 피우면 안 돼요'], ['🅿','주차장','차를 세울 수 있어요'], ['🚻','화장실','화장실을 찾을 때 봐요'], ['🚳','자전거 통행 금지','자전거로 지나가면 안 돼요'], ['🚷','보행 금지','걸어서 지나가면 안 돼요'], ['⚠','주의','위험에 조심해야 해요']];
  const kinds = new Map(Object.values(window.expandBasicCurriculum).flatMap(subjects =>
    Object.values(subjects).flat().map(unit => [unit.id, unit.kind])));

  window.pictureProblem = (id, level) => {
    const kind = kinds.get(id);
    const basic = level === 'basic';
    const [item, name] = pick(objects);
    if (['count5','count9','singleDigit','compareBasic','compareDirect','split5','add9','add10'].includes(kind)) {
      const limit = ['count5','split5','compareBasic'].includes(kind) ? 5 : 9;
      const a = number(1, kind === 'split5' ? 4 : kind === 'add9' ? 8 : limit);
      const b = number(1, kind === 'split5' ? 5-a : Math.max(1, limit-a));
      const row = (n, label) => symbols(Array(n).fill(item), label + '에 ' + name + ' ' + n + '개',0);
      if (kind === 'split5' || kind === 'add9' || kind === 'add10') {
        const total = kind === 'add10' ? 10 : a+b;
        return make('그림을 보고 빈칸에 들어갈 수를 쓰세요.', row(a,'첫 묶음') + `<div class="picture-equation">${a} ＋ <span class="inline-blank"></span> ＝ ${total}</div>`, total-a, '빈칸 채우기');
      }
      if (kind.startsWith('compare')) {
        const other = a === b ? (b === limit ? b-1 : b+1) : b;
        const more = Math.random() < .5;
        return make(`그림이 더 ${more?'많은 줄은 어디인가요':'적은 줄은 어디인가요'}? A 또는 B를 쓰세요.`,  `<div class="compare-rows"><div><b>A</b>${row(a,'A')}</div><div><b>B</b>${row(other,'B')}</div></div>`, (a>other)===more?'A':'B');
      }
      return make(`그림 속 ${name}의 개수를 세어 쓰세요.`, row(a,'그림'), a+'개');
    }
    if (['ordinal','orderBasic'].includes(kind)) {
      const start = number(0, objects.length-1);
      const amount = basic ? 4 : 6;
      const row = Array.from({length:amount}, (_,i)=>objects[(start+i)%objects.length]);
      const position = number(2,amount);
      const reverse = Math.random()<.5;
      return make(`${reverse?'오른쪽':'왼쪽'}에서 ${position}번째 과일은 무엇인가요?`,
        symbols(row.map(entry=>entry[0]),
          (reverse?'오른쪽':'왼쪽')+'부터 세기. '+row.map(entry=>entry[1]).join(', '),reverse?row.length-1:0),
        row[reverse ? amount-position : position-1][1], '과일 이름 쓰기');
    }
    if (['positionBasic','direction','spaceRead','spaceUse'].includes(kind)) {
      const [position, answer] = pick([[1,'위'],[3,'왼쪽'],[5,'오른쪽'],[7,'아래']]);
      const board = Array.from({length:9}, (_,i)=>`<span>${i===4?'●':i===position?'★':''}</span>`).join('');
      return make('별은 동그라미의 어느 쪽에 있나요? 방향을 쓰세요.',
        `<div class="position-board" role="img" aria-label="동그라미는 가운데, 별은 ${answer}">${board}</div>`,
        answer, '위치 보고 쓰기');
    }
    if (['patternBasic','patternObject','patternShape','patternUse','matchingRule'].includes(kind) && kind !== 'matchingRule') {
      const offset = number(0,4);
      const pattern = Array.from({length: basic ? 2 : 3}, (_,i) => tile[(offset+i)%5]);
      const length = pattern.length*2+number(0,pattern.length-1);
      return make('같은 규칙으로 이어질 다음 모양을 그리세요.', symbols([...Array.from({length},(_,i)=>pattern[i%pattern.length]), '□'], '모양 규칙'), pattern[length%pattern.length], '규칙 보고 그리기');
    }
    if (['makeTable','simpleGraph','manyGraphs'].includes(kind)) {
      const [other, otherName] = pick(objects.filter(entry=>entry[1]!==name));
      const a=number(1,7), b=number(1,7);
      const chart = `<table class="picture-table"><caption>좋아하는 과일 조사 (■ 한 칸 = 1명)</caption><tbody><tr><th scope="row">${item} ${name}</th><td>${'■ '.repeat(a)}</td></tr><tr><th scope="row">${other} ${otherName}</th><td>${'■ '.repeat(b)}</td></tr></tbody></table>`;
      if (kind==='makeTable') return make('그래프를 보고 표의 두 빈칸을 채우세요.', chart+`<table class="picture-table"><tr><th>${name}</th><th>${otherName}</th></tr><tr><td><span class="inline-blank"></span> 명</td><td><span class="inline-blank"></span> 명</td></tr></table>`, `${name} ${a}명, ${otherName} ${b}명`, '표 채우기');
      return make(basic ? `‘${name}’에 표시한 사람은 몇 명인가요?` : '두 줄의 칸을 모두 세면 몇 명인가요?', chart, (basic?a:a+b)+'명', '그래프 읽기');
    }
    if (['form','lines','flatShape','objectShape','planeFigure','dailyGeometry','flatBuild','figureBuild','distinguish'].includes(kind)) {
      const forms = [['circle','동그라미'],['triangle','세모'],['square','네모']];
      const [form,label] = pick(forms);
      if (kind==='lines') {
        const line = pick(['─','│','╱','╲','⌒']);
        return make('왼쪽 선을 보고 오른쪽 칸에 따라 그리세요.', symbols([line,'□'],'선 따라 그리기',0), '왼쪽과 같은 모양의 선', '따라 그리기');
      }
      return make('첫 번째 모양과 같은 모양을 빈칸에 그리세요.', symbols([shape(form), '→','□'],label+' 다음에 빈칸',0), label, '모양 그리기');
    }
    if (['signs','symbols','symbolMeaning','mediaRead','notices','readingPurpose'].includes(kind)) {
      const [icon,title,meaning] = pick(signs);
      const wrong = pick(signs.filter(entry=>entry[1]!==title));
      if (!basic && Math.random()<.5) {
        const reverse=Math.random()<.5;
        const meanings=reverse?[wrong[2],meaning]:[meaning,wrong[2]];
        return {question:'각 표지와 그 뜻을 선으로 이으세요.', type:'match', typeLabel:'선 잇기',
          visual:`<div class="match-task"><span>① ${icon} ${title}</span><span>●　●</span><span>㉠ ${meanings[0]}</span><span>② ${wrong[0]} ${wrong[1]}</span><span>●　●</span><span>㉡ ${meanings[1]}</span></div>`,
          answer:reverse?'①–㉡, ②–㉠':'①–㉠, ②–㉡'};
      }
      const options = Math.random()<.5?[meaning,wrong[2]]:[wrong[2],meaning];
      return basic
        ? make('표지의 뜻에 동그라미 하세요.', symbols([icon], '표지 그림') + `<div class="picture-options"><span>① ${options[0]}</span><span>② ${options[1]}</span></div>`, options.indexOf(meaning)+1, '그림 보고 고르기')
        : make('이 표지는 무엇을 알려 주나요?', symbols([icon], '표지 그림'), `${title} (${meaning})`);
    }
    if (['actionWords','familiarwords','wordsSentences','reading','sentenceBuild','wordWriting','paragraph','infoSpeech'].includes(kind)) {
      const [icon,action] = pick(scenes);
      if(basic || Math.random()<.5){
        const other=pick(scenes.filter(row=>row[1]!==action));
        return {question:'그림과 맞는 행동을 찾으세요.',type:'choice',typeLabel:'가리키거나 ○ 하세요',
          stimulus:symbols([icon],'행동 그림'),choices:Math.random()<.5?[action,other[1]]:[other[1],action],answer:action};
      }
      return make('그림 속 사람이 무엇을 하는지 한 문장으로 써 보세요.', symbols([icon], '행동 그림'), '예: '+action, '그림 보고 문장 쓰기');
    }
    if (['expression','nonverbal','feelingWords','intent'].includes(kind)) {
      const [face, answer] = pick([['😃','기뻐요'],['😢','슬퍼요'],['😠','화가 나요'],['😲','놀랐어요'],['😨','무서워요'],['😴','졸려요']]);
      return make('표정을 보고 어떤 기분인지 말하거나 써 보세요.', symbols([face],'얼굴 표정',0), '예: '+answer, '표정 보고 표현하기');
    }
    if (['dailyTime','daynight','schedule'].includes(kind)) {
      const series = pick([[['🛏','일어나기'],['🥣','아침 먹기'],['🎒','학교 가기']],[['🧼','손 씻기'],['🍽','밥 먹기'],['🪥','이 닦기']],[['☀','해 뜨기'],['🌇','해 지기'],['🌙','밤 되기']]]);
      const order = [0,1,2];
      for(let i=2;i>0;i--){const j=number(0,i);[order[i],order[j]]=[order[j],order[i]]}
      const mixed = order.map(index=>series[index]);
      return make('일어나는 순서대로 그림의 번호를 쓰세요.', symbols(mixed.map(([icon,label],i)=>`<b class="picture-number">${i+1}</b>${icon}<small>${label}</small>`),mixed.map(row=>row[1]).join(', ')), [0,1,2].map(index=>order.indexOf(index)+1).join(' → '), '순서 정하기');
    }
    return null;
  };
})();
