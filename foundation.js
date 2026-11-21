// Each activity uses one instruction and a response matched to the learning goal.
(() => {
  const find = id => document.getElementById(id);
  const shapes = ['●','▲','■','★','♥','◆'];
  const letters = [...'가나다라마바'];
  const words = ['가방','나비','다리','라디오','모자','바지','사과','우산','기차','포도'];
  const digits = ['1','2','3','4','5','6'];
  const dots = n => Array.from({length:Number(n)}, ()=>'●').join(' ');
  const shuffled = values => {
    const out = [...values];
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  };
  const pick = values => shuffled(values)[0];
  const other = (values, chosen) => pick(values.filter(v=>v!==chosen));
  const frame = content => '<span class="f-tile">'+content+'</span>';
  const row = values => values.map(frame).join('');
  const blank = '<span class="f-blank" aria-label="빈칸"></span>';
  function choose(prompt, model, right, wrong){
    return {prompt,model,label:'답 고르기',response:shuffled([right,wrong]).map(frame).join(''),answer:right};
  }
  function produce(prompt, model, answer, label='써 보세요'){
    return {prompt,model,label,response:'<div class="f-write"></div>',answer};
  }
  const activities=[];
  function add(group,id,title,seeds,build){activities.push({group,id,title,seeds,build});}
  const visual='모양과 규칙', language='한글과 낱말', math='수와 양', hand='선과 손 움직임';
  function matching(group,id,title,pool,prompt){
    add(group,id,title,pool,t=>choose(prompt,frame(t),t,other(pool,t)));
  }
  matching(visual,'shape','같은 모양 찾기',shapes,'같은 모양을 찾으세요.');
  matching(language,'letter','같은 글자 찾기',letters,'같은 글자를 찾으세요.');
  matching(language,'word','같은 낱말 찾기',words,'같은 낱말을 찾으세요.');
  matching(math,'digit','같은 숫자 찾기',digits,'같은 숫자를 찾으세요.');
  for(const [id,title,repeats] of [['ab','두 모양 규칙 잇기',1],['aab','두 번 반복하는 규칙 잇기',2]]){
    add(visual,id,title,shapes,a=>{
      const b=other(shapes,a),unit=[...Array(repeats).fill(a),b];
      return choose('빈칸에 올 모양을 고르세요.',row([...unit,...unit,...unit.slice(0,-1)])+blank,b,a);
    });
  }
  add(visual,'odd','다른 모양 표시하기',shapes,t=>{
    const fill=other(shapes,t), tiles=shuffled([fill,fill,t,fill]);
    return {prompt:'다른 모양 하나에 ○ 하세요.',model:'',label:'여기에 표시해요',response:row(tiles),answer:(tiles.indexOf(t)+1)+'번째 '+t};
  });
  add(visual,'copyShape','모양 보고 그리기',shapes,t=>produce('같은 모양을 그리세요.',frame(t),t,'그리는 곳'));
  function connect(group,id,title,pool,transform){
    add(group,id,title,pool,a=>{
      const left=[a,other(pool,a)],right=shuffled(left.map(transform));
      return {prompt:'짝끼리 선을 이으세요.',model:'',label:'선 잇기',
        response:'<div class="f-pairs">'+left.map((v,i)=>'<div><b>'+v+'</b><i>●</i><span></span><i>●</i><b>'+right[i]+'</b></div>').join('')+'</div>',
        answer:left.map(v=>v+' — '+transform(v)).join(' / ')};
    });
  }
  connect(visual,'pairShape','같은 모양끼리 선 잇기',shapes,v=>v);
  connect(math,'pairDots','숫자와 점 잇기',['1','2','3','4'],dots);
  add(language,'first','첫 글자 찾기',words,w=>choose('맨 앞 글자를 고르세요.',row([...w]),w[0],w[1]));
  add(language,'last','끝 글자 찾기',words,w=>choose('맨 끝 글자를 고르세요.',row([...w]),w.at(-1),w[0]));
  add(language,'fillWord','낱말의 빈 글자 쓰기',words,w=>produce('빠진 글자를 쓰세요.',frame(w)+'<span class="f-break"></span>'+row([...w].slice(0,-1))+blank,w.at(-1)));
  add(language,'copy','한 글자 보고 쓰기',letters,t=>produce('같은 글자를 쓰세요.',frame(t),t));
  const categories=[['과일','사과','포도','양말'],['옷','바지','셔츠','책상'],['탈것','기차','버스','연필'],['동물','토끼','고양이','우산'],['학용품','연필','지우개','수박'],['가구','의자','책상','딸기']];
  add(language,'sort','같은 종류 낱말 찾기',categories,([name,sample,right,wrong])=>choose(name+' 낱말을 하나 더 찾으세요.',frame(sample),right,wrong));
  add(math,'count','점 1~3개 세기',[1,2,3],n=>choose('점이 몇 개인가요?',frame(dots(n)),n,other([1,2,3],n)));
  add(math,'makeDots','숫자만큼 점 그리기',[1,2,3,4,5],n=>produce('숫자만큼 점을 그리세요.',frame(n),dots(n),'그리는 곳'));
  add(math,'writeCount','점의 개수 쓰기',[1,2,3,4,5],n=>produce('점이 몇 개인지 쓰세요.',frame(dots(n)),n));
  for(const [id,title,fn] of [['more','더 많은 쪽 찾기',Math.max],['less','더 적은 쪽 찾기',Math.min]]){
    add(math,id,title,[1,2,3,4],n=>{const m=other([1,2,3,4],n),best=fn(n,m);
      return choose('점이 더 '+(id==='more'?'많은':'적은')+' 쪽을 고르세요.','',dots(best),dots(best===n?m:n));});
  }
  add(math,'next','다음 수 쓰기',[1,2,3,4,5,6],n=>produce('다음 수를 쓰세요.',row([n,n+1])+blank,n+2));
  add(math,'middle','사이 수 찾기',[1,2,3,4,5,6],n=>choose('빈칸에 올 수를 고르세요.',frame(n)+blank+frame(n+2),n+1,n));
  add(math,'add','두 묶음 합치기',[1,2,3],n=>{const m=pick([1,2]);return produce('점을 모두 세어 쓰세요.',window.pictureAddition(frame(dots(n)),frame(dots(m))),n+m);});
  add(math,'sub','남은 점 세기',[2,3,4,5],n=>choose('남은 점은 몇 개인가요?',frame(dots(n-1)+' <s class="f-cross">●</s>'),n-1,n));
  const paths={
    '곧은 선':['M12 35 H228','M12 55 L228 15','M12 18 L228 52'],
    '꺾인 선':['M12 50 L66 15 L120 50 L174 15 L228 50','M12 50 H80 V18 H154 V50 H228'],
    '굽은 선':['M12 35 Q39 0 66 35 T120 35 T174 35 T228 35','M12 50 Q66 0 120 35 T228 20']
  };
  for(const [title,variants] of Object.entries(paths)){
    add(hand,title,title+' 따라가기',variants,d=>{
      const y=d.split(' ')[1];
      return {prompt:'점에서 시작해 선을 따라가세요.',model:'',label:'따라가는 곳',
        response:'<svg class="f-path" viewBox="0 0 240 70" aria-label="'+title+' 점선"><path d="'+d+'" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/><circle cx="12" cy="'+y+'" r="4"/></svg>',answer:'시작점부터 '+title+'을 따라갑니다.'};
    });
  }
  const select=find('foundation-task');
  select.innerHTML='<option value="mix">여러 활동 섞기</option>';
  for(const group of [visual,language,math,hand]){
    const opts=document.createElement('optgroup');opts.label=group;
    for(const a of activities.filter(a=>a.group===group))opts.append(new Option(a.title,a.id));
    select.append(opts);
  }
  select.value='shape';
  let problems=[];
  function generate(){
    const n=Number(find('foundation-count').value),activity=activities.find(a=>a.id===select.value);
    const types=activity?Array(n).fill(activity):shuffled(activities).slice(0,n);
    const queues=new Map();
    problems=types.map(a=>{
      if(!queues.get(a)?.length)queues.set(a,shuffled(a.seeds));
      return a.build(queues.get(a).pop());
    });
    render();
  }
  function render(){
    const title=select.selectedOptions[0].textContent,pages=[];
    for(let i=0;i<problems.length;i+=2){
      const items=problems.slice(i,i+2).map((p,j)=>`<section class="f-item"><h3><span>${i+j+1}</span>${p.prompt}</h3>
        ${p.model?`<div class="f-model">${p.model}</div>`:''}
        <div class="f-response"><strong>${p.label}</strong><div class="f-space">${p.response}</div></div></section>`).join('');
      pages.push(`<article class="foundation-page"><header><h2>${title}</h2><span>이름 __________</span></header><div class="f-items">${items}</div><footer>학생용 학습지 · ${pages.length+1} / ${Math.ceil(problems.length/2)}</footer></article>`);
    }
    find('foundation-preview').innerHTML=pages.join('');
    const key=find('foundation-key').checked?`<article class="foundation-page"><header><h2>${title} · 교사용 정답지</h2></header><ol>${problems.map(p=>'<li>'+p.answer+'</li>').join('')}</ol></article>`:'';
    find('foundation-print-root').innerHTML=pages.join('')+key;
    find('foundation-preview-status').textContent=problems.length+'문항 · 학생용 '+pages.length+'쪽'+(key?' + 정답지 1쪽':'');
  }
  find('foundation-form').addEventListener('submit',e=>{e.preventDefault();generate()});
  select.addEventListener('change',generate);
  find('foundation-count').addEventListener('change',generate);
  find('foundation-key').addEventListener('change',render);
  find('foundation-print').addEventListener('click',()=>window.print());
  generate();
})();
