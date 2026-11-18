(() => {
  const $ = s => document.querySelector(s);
  const C = window.basicCurriculum2022;
  const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let current={},problems=[];
  const minWorksheetSize = 14, maxWorksheetSize = 32;
  let editingIndex = -1;
  const historyKey='teukgyo-offline-question-history-v1';
  let questionHistory={};
  try{questionHistory=JSON.parse(localStorage.getItem(historyKey)||'{}')||{}}catch{questionHistory={}}
  const historyScope=(grade,subject,topic)=>[C.band(grade),subject,topic].join(':');
  const previousKeys=(grade,subject,topic)=>{
    const saved=questionHistory[historyScope(grade,subject,topic)];
    return Array.isArray(saved)?saved.filter(key=>typeof key==='string'):[];
  };
  function rememberQuestions(){
    if(!current.topic||!problems.length)return;
    const {grade,subject,topic}=current;
    const scope=historyScope(grade,subject,topic);
    questionHistory[scope]=[...previousKeys(grade,subject,topic),...problems.flatMap(p=>p.sourceKeys||[p.key])].slice(-300);
    try{localStorage.setItem(historyKey,JSON.stringify(questionHistory))}catch{}
  }

  document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===button));
    $('#worksheet-panel').classList.toggle('hidden',button.dataset.tab!=='worksheet');
    $('#letter-panel').classList.toggle('hidden',button.dataset.tab!=='letter');
  }));

  function sheetPage(items,page,total,layout,answer=false,start=0){
    const title=escapeHTML(current.title||`오늘의 ${C.topicInfo[current.topic][0]}`);
    const subject=C.subjectNames[current.subject];
    return `<article class="worksheet-page${answer?' answer-page':''}" data-font="${layout.font}" data-size="${layout.size}" style="--worksheet-scale:${layout.scale}">
      <div class="sheet-overline">${escapeHTML(C.gradeName(current.grade))} · ${escapeHTML(subject)}${current.title ? " · " + escapeHTML(C.topicInfo[current.topic][0]) : ""}</div>
      <div class="sheet-title-row"><h2>${title}${answer?' · 정답':''}</h2>${!answer?'<button type="button" class="sheet-edit-button" data-edit-title>제목 수정</button>':''}</div>
      <div class="sheet-meta"><b>이름 <span></span></b><b>날짜 <span></span></b></div>

      <div class="problem-list">${items.map((problem,index)=>renderProblem(problem,start+index+1,answer)).join('')}</div>
      <div class="sheet-footer"><span>${answer?'교사용 정답지':'학생용 학습지'}</span><span>${page+1} / ${total}</span></div>
    </article>`;
  }
  function renderProblem(problem, number, answerSheet){
    let response = '<div class="answer-line"><span>답</span><span class="answer-box"></span></div>';
    if (problem.type === 'ox') {
      response = '<div class="answer-line ox-answer"><span><b class="mark-symbol">○</b> 맞아요</span><span><b class="mark-symbol">×</b> 틀려요</span></div>';
    }
    if (problem.type === 'match' || problem.responseInVisual) response = '';
    if (answerSheet) response = `<div class="answer-value">${problem.exampleAnswer ? '예시 답' : '정답'}: ${escapeHTML(problem.answer)}</div>`;
    const choices = problem.choices || (problem.type === 'choice' ? readChoices(problem) : []);
    const content = choices.length ? `<ol class="worksheet-options">${choices.map((choice,i)=>`<li><span class="option-number">${i+1}</span><span>${escapeHTML(choice)}</span></li>`).join('')}</ol>` : problem.visual;
    if (!answerSheet && choices.length) response = '';
    const visual = !answerSheet && content
      ? `<div class="problem-visual">${content}</div>` : '';
    return `<section class="problem">
      <div class="problem-top"><span class="problem-num">${number}</span>
        ${!answerSheet?`<button type="button" class="sheet-edit-button" data-edit-problem="${number-1}" aria-label="${number}번 문항 수정">수정</button>`:''}
        <div><span class="problem-type">${escapeHTML(problem.typeLabel || '풀기')}</span>
        <div class="problem-question">${escapeHTML(problem.question)}${problem.candidate ? `<span class="problem-candidate">제시된 답: ${escapeHTML(problem.candidate)}</span>` : ''}</div></div>
      </div>${visual}${response}
    </section>`;
  }

  function renderSheet(){
    const font = $('#worksheet-font').value;
    const pixels = Number($('#worksheet-size').value) || 19;
    const size = pixels <= 22 ? 'normal' : 'expanded';
    const layout = {font, size, scale:pixels/19};
    for (const button of document.querySelectorAll('[data-size-step]')) {
      button.disabled = button.dataset.sizeStep === '-1' ? pixels <= minWorksheetSize : pixels >= maxWorksheetSize;
    }
    const printRoot = $('#print-root');
    const chunks = paginateWorksheet(printRoot, layout);
    const html = chunks.map(({items,start},i)=>sheetPage(items,i,chunks.length,layout,false,start)).join('');
    $('#worksheet-preview').innerHTML = html;
    printRoot.innerHTML = html + ($('#answer-key').checked
      ? chunks.map(({items,start},i)=>sheetPage(items,i,chunks.length,layout,true,start)).join('') : '');
    $('#preview-status').textContent=`${problems.length}문항 · 학생용 ${chunks.length}쪽${$('#answer-key').checked ? ' + 정답지 ' + chunks.length + '쪽' : ''}`;
  }

  function paginateWorksheet(root, layout){
    const pages=[];
    root.classList.add('measuring-sheet');
    try {
      for(let start=0;start<problems.length;){
        let count=problems.length-start;
        while(count>1){
          root.innerHTML=sheetPage(problems.slice(start,start+count),pages.length,9,layout,false,start);
          const page=root.firstElementChild;
          if(page.clientHeight > 0 && page.scrollHeight <= page.clientHeight) break;
          count--;
        }
        pages.push({start,items:problems.slice(start,start+count)});
        start+=count;
      }
    } finally {
      root.classList.remove('measuring-sheet');
    }
    return pages;
  }

  function readChoices(problem){
    const match = problem.visual?.match(/^<div class="word-choices">보기:\s*([^<]+)<\/div>$/);
    return match ? match[1].split(/　·　/).map(option=>option.trim()).filter(Boolean) : [];
  }
  function presentProblem(problem) {
    const choices = readChoices(problem);
    if (choices.length) {
      return {...problem, choices, type:'choice', typeLabel:'답 하나에 ○ 하세요'};
    }
    return {...problem, type:problem.type || 'write', typeLabel:problem.typeLabel || '답을 쓰세요'};
  }
  const unitKinds = new Map(Object.values(window.expandBasicCurriculum)
    .flatMap(Object.values).flat().map(unit=>[unit.id,unit.kind]));
  const pickItem = items=>items[Math.floor(Math.random()*items.length)];
  const integer = (min,max)=>min+Math.floor(Math.random()*(max-min+1));

  function generatedProblem(topic,level){
    const kind = unitKinds.get(topic);
    const basic = level === 'basic';
    const challenge = level === 'challenge';
    const items = ['공책','연필','책','색연필','카드','블록'];
    const item = pickItem(items);
    const place = pickItem(['도서관','체육관','운동장','교실','미술실','강당']);
    const hour = integer(1,6);
    const minute = basic ? 0 : pickItem([0,15,30,45]);
    const clock = (h,m)=>`${h}시${m ? ' '+m+'분' : ''}`;
    const problem = (question,answer,typeLabel,visual='')=>({question,answer:String(answer),typeLabel,visual});
    const card = (title,lines)=>`<div class="reading-passage"><strong>${escapeHTML(title)}</strong><br>${lines.map(escapeHTML).join('<br>')}</div>`;

    if (['add9','carryAdd','borrowSubtract','tensCalc','hundredsCalc','largeCalc'].includes(kind)) {
      if (kind === 'borrowSubtract') {
        const b = integer(4,9), ones = integer(1,b-1);
        return problem(`카드가 ${10+ones}장 있습니다. ${b}장을 쓰면 몇 장이 남나요?`,10+ones-b+'장','생활 속 계산');
      }
      const unit = {tensCalc:10,hundredsCalc:100,largeCalc:1000}[kind] || 1;
      const a = kind === 'carryAdd' ? integer(5,9) : integer(1,basic?4:7);
      const b = kind === 'carryAdd' ? integer(10-a,9) : integer(1,Math.min(9-a,basic?4:7));
      const subtract = unit > 1 && challenge;
      const sentence = subtract
        ? `물품이 ${(a+b)*unit}개 있습니다. ${b*unit}개를 나누어 주면 몇 개가 남나요?`
        : `물품이 ${a*unit}개 있습니다. ${b*unit}개를 더 받으면 모두 몇 개인가요?`;
      return problem(sentence,(subtract?a:a+b)*unit+'개','생활 속 계산');
    }

    if (kind === 'multiplication' || kind === 'division') {
      const groups = integer(2,basic?4:challenge?9:6);
      const each = integer(2,basic?4:challenge?9:6);
      return kind === 'multiplication'
        ? problem(`봉투 ${groups}개에 ${item} ${each}개씩 넣습니다. 모두 몇 개 필요한가요?`, groups*each+'개','묶음 계산')
        : problem(`${item} ${groups*each}개를 ${groups}명에게 똑같이 나눕니다. 한 사람은 몇 개 받나요?`,each+'개','똑같이 나누기');
    }

    if (['coins','bills','cardmoney','budget'].includes(kind)) {
      const unit = kind === 'coins' ? 100 : 1000;
      const price = integer(2,basic?5:8)*unit;
      const money = price+integer(1,5)*unit;
      const won = amount=>amount.toLocaleString('ko-KR')+'원';
      const visual = card('가격표', [`${item}  ${won(price)}`]);
      if (kind === 'cardmoney') {
        return problem(`카드로 ${item} 1개를 사면 얼마를 결제하나요?`,won(price),'가격표 읽기',visual);
      }
      return problem(`${won(money)}을 내고 ${item} 1개를 사면 거스름돈은 얼마인가요?`,won(money-price),'거스름돈 계산',visual);
    }

    if (['clock','schedule','notices','readingPurpose','mediaRead','infoSpeech','memo','timePlaceWords'].includes(kind)) {
      const time = clock(hour,minute);
      const setting = card('학교 활동 안내', [`시작: 오후 ${time}`,`장소: ${place}`,`준비물: ${item}`]);
      if (kind === 'schedule' && challenge) {
        const duration = pickItem([15,30,45]);
        const total = hour*60+minute+duration;
        return problem(`활동이 ${duration}분 동안 진행됩니다. 몇 시 몇 분에 끝나나요?`,`오후 ${clock(Math.floor(total/60),total%60)}`,'끝나는 시각 구하기',setting);
      }
      if (kind === 'memo' || kind === 'infoSpeech') {
        return problem('활동의 시작 시각과 장소를 메모하세요.',`오후 ${time}, ${place}`,'중요한 정보 기록하기',setting);
      }
      const [question,answer] = kind === 'clock' || kind === 'schedule' || kind === 'timePlaceWords'
        ? ['활동은 몇 시에 시작하나요?',`오후 ${time}`]
        : pickItem([['어디로 가야 하나요?',place],['무엇을 가져가야 하나요?',item],['활동은 몇 시에 시작하나요?',`오후 ${time}`]]);
      return problem(question,answer,'안내문 읽기',setting);
    }

    if (kind === 'punctuation') {
      const [sentence,answer] = pickItem([
        [`${place}에 언제 가나요`,'?'],[`오늘은 ${place}에 가요`,'.'],
        [`가방에 ${item}${item==='카드'?'가':'이'} 있나요`,'?'],[`가방에 ${item}${item==='카드'?'를':'을'} 넣어요`,'.']
      ]);
      return problem('문장 끝에 알맞은 문장 부호를 쓰세요.',answer,'문장 부호 쓰기',card('문장',[`${sentence}  □`]));
    }

    if (['lengthCm','lengthM','weightKg','capacityL'].includes(kind)) {
      const [name,unit] = {lengthCm:['끈','cm'],lengthM:['밧줄','m'],weightKg:['쌀','kg'],capacityL:['물','L']}[kind];
      const a = integer(2,basic?5:15), b = integer(1,a-1);
      return problem(`${name} ${a} ${unit} 중 ${b} ${unit}를 사용했습니다. 얼마가 남았나요?`,`${a-b} ${unit}`,'측정값으로 계산');
    }
    return null;
  }

  function generate(newSheet=false){
    const topic=$('input[name="topic"]:checked');if(!topic)return;
    const previous=problems.flatMap(p=>p.sourceKeys||[p.key]).filter(Boolean);
    current={grade:$('#grade').value,subject:$('#subject').value,topic:topic.value,level:$('input[name="level"]:checked').value,count:Number($('#count').value),title:$('#paper-title').value.trim()};
    const avoided = [...previousKeys(current.grade,current.subject,current.topic), ...previous];
    const used = new Set(avoided);
    const base = C.createProblems(current.topic,current.level,current.grade,current.count,avoided);
    base.forEach(problem=>used.add(problem.key));
    problems = base.map((problem, index) => {
      if (current.subject === 'social' || current.subject === 'career') return problem;
      const maker = index % 3 === 0 && generatedProblem(current.topic,current.level) ? generatedProblem
        : index % 2 === 0 ? window.pictureProblem : null;
      if (maker) {
        for (let attempt = 0; attempt < 32; attempt++) {
          const created = maker(current.topic,current.level);
          if (!created) break;
          const key = JSON.stringify([created.question,created.visual,created.answer]);
          if (used.has(key)) continue;
          used.add(key);
          return {...created,key};
        }
      }
      return presentProblem(problem);
    });
    renderSheet();
    if(newSheet)rememberQuestions();
  }
  function updateTopics(preferredTopic){
    const grade=$('#grade').value,subject=$('#subject').value,topics=C.catalog[C.band(grade)][subject],old=preferredTopic ?? $('input[name="topic"]:checked')?.value;
    let lastArea='';
    $('#topic-options').innerHTML=topics.map((key,i)=>{const [name,icon,description]=C.topicInfo[key],area=C.unitArea?.(key)||'';let heading=area!==lastArea?`<div class="unit-group-title">${escapeHTML(area)}</div>`:'';lastArea=area;return `${heading}<label class="choice"><input type="radio" name="topic" value="${key}" ${old===key||(!topics.includes(old)&&i===0)?'checked':''}><span class="choice-icon">${icon}</span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(description)}</small></label>`}).join('');
    generate();
  }
  function updateSubjects(preferences = {}){
    const grade=$('#grade').value,choices=C.catalog[C.band(grade)],old=preferences.subject ?? $('#subject').value;
    $('#subject').innerHTML=Object.keys(choices).map(key=>`<option value="${key}">${C.subjectNames[key]}</option>`).join('');
    if(choices[old])$('#subject').value=old;
    updateTopics(preferences.topic);
  }
  $('#grade').addEventListener('change',updateSubjects);
  $('#subject').addEventListener('change',()=>updateTopics());
  $('#topic-options').addEventListener('change',()=>generate());
  document.querySelectorAll('input[name="level"]').forEach(el=>el.addEventListener('change',()=>generate()));
  $('#count').addEventListener('change',()=>generate());
  $('#paper-title').addEventListener('input',()=>{if(current.topic){current.title=$('#paper-title').value.trim();renderSheet()}});
  $('#worksheet-form').addEventListener('submit',e=>{e.preventDefault();generate(true)});
  const sizeControl = $('#worksheet-size');
  for (let size = minWorksheetSize; size <= maxWorksheetSize; size++) {
    sizeControl.add(new Option(size + ' px', size, size === 19, size === 19));
  }
  document.querySelectorAll('[data-size-step]').forEach(button=>button.addEventListener('click',()=>{
    sizeControl.value = String(Number(sizeControl.value) + Number(button.dataset.sizeStep));
    sizeControl.dispatchEvent(new Event('change'));
  }));
  const editor = $('#problem-editor');
  $('#worksheet-preview').addEventListener('click', event=>{
    const titleButton = event.target.closest('[data-edit-title]');
    if (titleButton) {
      editingIndex = -1;
      $('#problem-editor-title').textContent = '학습지 제목 수정';
      $('#problem-edit-fields').innerHTML = editorField('title','제목',current.title || `오늘의 ${C.topicInfo[current.topic][0]}`,35);
      editor.showModal();
      return;
    }
    const button = event.target.closest('[data-edit-problem]');
    if (!button) return;
    editingIndex = Number(button.dataset.editProblem);
    const problem = problems[editingIndex];
    const choices = problem.choices || (problem.type === 'choice' ? readChoices(problem) : []);
    $('#problem-editor-title').textContent = (editingIndex + 1) + '번 문항 수정';
    $('#problem-edit-fields').innerHTML = editorField('question','문제 문장',problem.question,180,true)
      + (problem.candidate ? editorField('candidate','제시된 답',problem.candidate,100) : '')
      + choices.map((choice,i)=>editorField('choice','보기 ' + (i+1),choice,100)).join('')
      + editorField('answer','정답지에 표시할 답',problem.answer,120);
    editor.showModal();
  });
  function editorField(name,label,value,maxLength,multiline=false){
    const field = multiline
      ? `<textarea name="${name}" rows="3" maxlength="${maxLength}" required>${escapeHTML(value)}</textarea>`
      : `<input name="${name}" value="${escapeHTML(value)}" maxlength="${maxLength}" required>`;
    return `<label class="editor-field">${label}${field}</label>`;
  }
  $('#problem-edit-cancel').addEventListener('click',()=>editor.close());
  $('#problem-edit-form').addEventListener('submit',event=>{
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (editingIndex === -1) {
      current.title = data.get('title').trim();
      $('#paper-title').value = current.title;
    } else {
      const problem = problems[editingIndex];
      const question = data.get('question').trim();
      const answer = data.get('answer').trim();
      const choices = data.getAll('choice').map(value=>value.trim());
      const candidate = data.get('candidate')?.trim();
      if (!question || !answer || choices.some(choice=>!choice) || candidate === '') return;
      problem.question = question;
      problem.answer = answer;
      if (choices.length) problem.choices = choices;
      if (candidate) problem.candidate = candidate;
    }
    editor.close();
    renderSheet();
    const selector = editingIndex === -1 ? '[data-edit-title]' : `[data-edit-problem="${editingIndex}"]`;
    $('#worksheet-preview ' + selector)?.focus({preventScroll:true});
  });
  for (const selector of ['#worksheet-font', '#worksheet-size']) {
    const control = $(selector);
    const key = 'teukgyo:' + control.id;
    try {
      const stored = localStorage.getItem(key);
      const saved = selector === '#worksheet-size' ? ({normal:'19',large:'23',largest:'27'}[stored] || stored) : stored;
      if (Array.from(control.options).some(option=>option.value===saved)) control.value=saved;
    } catch {}
    control.addEventListener('change',()=>{
      try { localStorage.setItem(key,control.value); } catch {}
      renderSheet();
    });
  }
  $('#answer-key').addEventListener('change',renderSheet);
  $('#print-button').addEventListener('click',async ()=>{rememberQuestions();const page = $('#worksheet-preview .worksheet-page');
    if (page) {
      const font = getComputedStyle(page).fontFamily;
      await document.fonts.load('400 19px ' + font, '학습지').catch(()=>{});
    }
    await document.fonts.ready;
    renderSheet();
    window.print()});
  const settingsKey = 'teukgyo:worksheet-settings';
  let savedSettings = {};
  try { savedSettings = JSON.parse(localStorage.getItem(settingsKey)) || {}; } catch {}
  for (const field of ['grade','count']) {
    const control = $('#' + field);
    if (Array.from(control.options).some(option => option.value === savedSettings[field])) {
      control.value = savedSettings[field];
    }
  }
  for (const radio of document.querySelectorAll('input[name="level"]')) {
    if (radio.value === savedSettings.level) radio.checked = true;
  }
  $('#answer-key').checked = savedSettings.answerKey === true;
  updateSubjects(savedSettings);
  $('#worksheet-form').addEventListener('change', () => {
    const {grade, subject, topic, level} = current;
    const settings = {grade, subject, topic, level, count: $('#count').value, answerKey: $('#answer-key').checked};
    try { localStorage.setItem(settingsKey, JSON.stringify(settings)); } catch {}
  });
  document.fonts.addEventListener('loadingdone',()=>{if(!editor.open)renderSheet()});

  async function copyText(value){
    try{await navigator.clipboard.writeText(value);return true}
    catch{
      const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;
    }
  }
  function normalizeSentence(raw,tone) {
    let s=raw.trim().replace(/\s+/g,' ').replace(/^[•\-–]\s*/,'').replace(/[.!?。]+$/,'');
    if(!s) return '';
    const replacements=[
      [/학급\s*체험학습\s*가요/g,'학급 체험학습을 진행할 예정입니다'],[/가요$/g,'갈 예정입니다'],[/일정\s*바뀔\s*수\s*있어요/g,'일정이 변경될 수 있습니다'],[/비\s*오면/g,'비가 올 경우'],[/편한\s*신발\s*신고/g,'편한 신발을 신고'],[/물병\s*챙겨/g,'물병을 챙겨'],[/챙겨\s*주세요/g,'챙겨 보내 주시기 바랍니다'],[/보내\s*주세요/g,'보내 주시기 바랍니다'],[/입혀\s*주세요/g,'입혀 보내 주시기 바랍니다'],[/참석해\s*주세요/g,'참석해 주시기 바랍니다'],[/알려\s*주세요/g,'알려 주시기 바랍니다'],[/해\s*주세요/g,'해 주시기 바랍니다'],[/와\s*주세요/g,'와 주시기 바랍니다'],[/부탁해요/g,'부탁드립니다'],[/안\s*돼요/g,'어렵습니다'],[/없어요/g,'없습니다'],[/있어요/g,'있습니다'],[/이에요$/,'입니다'],[/예요$/,'입니다'],[/해요$/,'합니다'],[/돼요$/,'됩니다'],[/주세요$/,'주시기 바랍니다']
    ];
    for(const [a,b] of replacements) s=s.replace(a,b);
    if(!/[.?!]$/.test(s)) s+='.';
    return s;
  }
  function noticeDraft(text){
    const cleaned = text.trim().replace(/\r/g,'');
    const marker = cleaned.match(/(?:^|\n)\s*초안\s*[:：]\s*/);
    const draft = marker ? cleaned.slice(marker.index + marker[0].length) : cleaned;
    return draft.replace(/(^|\n)(\s*(?:학생\s*(?:이름|성명|실명)|보호자\s*(?:이름|성명))(?:\s*[:：]\s*|\s+))[^\n]+/g,(_, start, label)=>start + label + (label.includes('보호자') ? '보호자' : '학생'))
      .replace(/(?<!\d)01[016789][ -]?\d{3,4}[ -]?\d{4}(?!\d)/g,'[연락처 비공개]')
      .replace(/(?<!\d)\d{6}-[1-8]\d{6}(?!\d)/g,'[개인정보 비공개]');
  }
  function dateReview(draft, year = new Date().getFullYear()){
    const weekdays = ['일','월','화','수','목','금','토'];
    for (const [, explicitYear, month, day, weekday] of draft.matchAll(/(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일\s*\(?([일월화수목금토])요일\)?/g)) {
      const date = new Date(Number(explicitYear || year), Number(month)-1, Number(day));
      if (date.getMonth() !== Number(month)-1 || date.getDate() !== Number(day) || weekdays[date.getDay()] !== weekday) {
        return `${explicitYear || year}년 기준으로 입력한 날짜와 요일이 일치하지 않습니다. 발송 전에 확인해 주세요.`;
      }
    }
    return '';
  }
  function polish(text,tone,messageMode="auto",customMessage="") {
    const cleaned=noticeDraft(text);
    if(!cleaned) return '';
    const fieldGroups = [
      ['일시','날짜','시간','기간','대상','장소','집합시간','집합장소','출발시간','일정','내용'],
      ['등교방법','하교방법','복장','준비물','급식','참가비','변경사항','유의사항'],
      ['신청기한','신청방법','제출기한','제출방법','회신기한','회신방법','문의']
    ];
    const aliases = {'행사일시':'일시','행사장소':'장소','신청마감':'신청기한','제출마감':'제출기한','회신마감':'회신기한','참여대상':'대상'};
    const fieldNames = [...fieldGroups.flat(), ...Object.keys(aliases)].sort((a,b)=>b.length-a.length);
    const fieldPattern = new RegExp('^(' + fieldNames.map(label=>[...label].join('\\s*')).join('|') + ')(?:\\s*[:：]\\s*|\\s+)(.+)$');
    const details = [];
    const sentences = [];
    let title = '';
    for (const raw of cleaned.split(/\n+/)) {
      const line = raw.trim().replace(/^(?:[-•–]|\d+[.)])\s+/, '');
      if (!line) continue;
      const field = line.match(fieldPattern);
      if (field) {
        const label = field[1].replace(/\s+/g, '');
        details.push({label:aliases[label] || label, value:field[2].trim()});
        continue;
      }
      const scheduled = line.match(/^((?:다음\s*주|이번\s*주)\s*)?((?:\d{4}년\s*)?\d{1,2}월\s*\d{1,2}일(?:\s*\(?[일월화수목금토]요일\)?)?\s*)?(.+?)\s+(?:개최\s*|진행\s*)?예정[.。]?$/);
      if (scheduled) {
        const week = (scheduled[1] || '').trim().replace(/^(다음|이번)\s*주$/, '$1 주');
        const date = (scheduled[2] || '').trim();
        const event = scheduled[3];
        if (!title) title = event + ' 안내';
        else sentences.push(event + ' 일정을 안내드립니다.');
        if (week || date) details.push({label:'일시', value:[week,date].filter(Boolean).join(' ')});
      } else if (!title && /^[가-힣0-9 ·()]{2,36} (?:안내|일정 변경|신청|참석 요청)$/.test(line)) {
        title = line;
      } else {
        sentences.push(normalizeSentence(line,tone));
      }
    }
    const intro = tone === 'warm'
      ? '안녕하세요, 학부모님. 늘 학교 활동에 관심을 가져 주셔서 감사합니다.'
      : '안녕하세요, 학부모님.';
    const groupTitles = ['일정 및 장소', '참여 안내', '신청·제출 및 문의'];
    const sections = fieldGroups.map((group, index) => {
      const lines = group.flatMap(label=>details.filter(field=>field.label===label)
        .map(field=>`${field.label}: ${field.value}`));
      if (!lines.length) return '';
      return (tone === 'brief' ? [] : ['[' + groupTitles[index] + ']']).concat(lines).join('\n');
    });
    const labels = new Set(details.map(field=>field.label));
    const actions = [
      [['신청기한','신청방법'], '참여를 희망하시면 위 신청 안내를 확인해 주세요.'],
      [['제출기한','제출방법'], '위 제출 안내에 따라 제출해 주세요.'],
      [['회신기한','회신방법'], '위 회신 안내에 따라 답변해 주세요.'],
      [['변경사항'], '변경된 내용을 확인해 주세요.'],
      [['등교방법','하교방법'], '자녀와 함께 등하교 방법을 확인해 주세요.'],
      [['준비물','복장'], '자녀와 함께 복장이나 준비물을 확인해 주세요.']
    ];
    const match = actions.find(([fields])=>fields.some(field=>labels.has(field)));
    let message = '';
    if (messageMode === 'custom') {
      message = noticeDraft(customMessage);
    } else if (messageMode === 'auto') {
      message = match?.[1] || '안내 내용을 확인해 주세요.';
      if (match?.[0].includes('준비물')) {
        const items = labels.has('준비물') && labels.has('복장') ? '복장과 준비물'
          : labels.has('준비물') ? '준비물' : '복장';
        message = `자녀와 함께 ${items}을 확인해 주세요.`;
      }
      if (match?.[0].includes('등교방법')) {
        const travel = labels.has('등교방법') && labels.has('하교방법') ? '등하교'
          : labels.has('등교방법') ? '등교' : '하교';
        message = `자녀와 함께 ${travel} 방법을 확인해 주세요.`;
      }
      if (tone === 'warm') message = message.replace(/해 주세요\.$/, '해 주시면 감사하겠습니다.');
    }
    const closing = [message, message.endsWith('감사하겠습니다.') ? '' : '감사합니다.'].filter(Boolean).join(' ');
    return [title, intro, sentences.filter(Boolean).join('\n'), ...sections, closing].filter(Boolean).join('\n\n');
  }
  $('#notice-message-mode').addEventListener('change', event=>{
    $('#notice-message-custom').hidden = event.target.value !== 'custom';
  });
  $('#polish-button').addEventListener('click',()=>{
    const draft=$('#draft').value;
    if(!draft.trim()){ $('#draft').focus(); $('#draft').setCustomValidity('안내할 내용을 먼저 입력해 주세요.'); $('#draft').reportValidity(); return; }
    $('#draft').setCustomValidity('');
    const tone=$('input[name="tone"]:checked').value, result=polish(draft,tone,$('#notice-message-mode').value,$('#notice-message-text').value);
    $('#result').value=result;
    $('#result').readOnly=false;
    updateNoticeResult();
  });
  function updateNoticeResult(){
    const warning = dateReview($('#result').value);
    $('#notice-date-review').textContent = warning;
    $('#notice-date-review').hidden = !warning;
    $('#copy-button').disabled=!$('#result').value.trim();
    $('#copy-button').textContent='복사하기';
  }
  $('#result').addEventListener('input',updateNoticeResult);
  $('#draft').addEventListener('input',()=>$('#draft').setCustomValidity(''));
  $('#copy-button').addEventListener('click',async()=>{
    const value=$('#result').value;
    const copied=await copyText(value);
    $('#copy-button').textContent=copied?'복사했어요 ✓':'복사할 수 없어요';setTimeout(()=>$('#copy-button').textContent='복사하기',2200);
  });
})();
