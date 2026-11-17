(() => {
  const $ = s => document.querySelector(s);
  const C = window.basicCurriculum2022;
  const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let current={},problems=[];
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

  function sheetPage(items,page,total,layout,answer=false){
    const title=escapeHTML(current.title||`오늘의 ${C.topicInfo[current.topic][0]}`);
    const subject=C.subjectNames[current.subject],topic=C.topicInfo[current.topic][0];
    return `<article class="worksheet-page${answer?' answer-page':''}" data-font="${layout.font}" data-size="${layout.size}">
      <div class="sheet-overline">2022 특수교육 기본 교육과정 · ${escapeHTML(C.bandName(current.grade))}</div>
      <div class="sheet-title-row"><h2>${title}${answer?' · 정답':''}</h2><span>${escapeHTML(C.gradeName(current.grade))} · ${escapeHTML(subject)}</span></div>
      <div class="sheet-meta"><b>이름 <span></span></b><b>날짜 <span></span></b></div>
      <div class="sheet-instruction"><strong>${escapeHTML(topic)} · </strong>${answer?'답을 확인하세요.':'그림과 문제를 살펴보고, 문항에 나온 방법대로 풀어 보세요.'}</div>
      <div class="problem-list">${items.map((problem,index)=>renderProblem(problem,page*layout.perPage+index+1,answer)).join('')}</div>
      <div class="sheet-footer"><span>한 걸음씩, 나의 속도로</span><span>${page+1} / ${total}</span></div>
    </article>`;
  }
  function renderProblem(problem, number, answerSheet){
    let response = '<div class="answer-line"><span>답</span><span class="answer-box"></span></div>';
    if (problem.type === 'ox') {
      response = '<div class="answer-line ox-answer"><span><b class="mark-symbol">○</b> 맞아요</span><span><b class="mark-symbol">×</b> 틀려요</span></div>';
    }
    if (problem.type === 'match' || problem.responseInVisual) response = '';
    if (answerSheet) response = `<div class="answer-value">정답: ${escapeHTML(problem.answer)}</div>`;
    const choices = problem.type === 'choice' ? readChoices(problem) : [];
    const content = choices.length ? `<ol class="worksheet-options">${choices.map((choice,i)=>`<li><span class="option-number">${i+1}</span><span>${escapeHTML(choice)}</span></li>`).join('')}</ol>` : problem.visual;
    if (!answerSheet && choices.length) response = '';
    const visual = !answerSheet && content
      ? `<div class="problem-visual">${content}</div>` : '';
    return `<section class="problem">
      <div class="problem-top"><span class="problem-num">${number}</span>
        <div><span class="problem-type">${escapeHTML(problem.typeLabel || '풀기')}</span>
        <div class="problem-question">${escapeHTML(problem.question)}${problem.candidate ? `<span class="problem-candidate">제시된 답: ${escapeHTML(problem.candidate)}</span>` : ''}</div></div>
      </div>${visual}${response}
    </section>`;
  }

  function renderSheet(){
    const font = $('#worksheet-font').value;
    const size = $('#worksheet-size').value;
    const perPage = size === 'normal' ? 3 : 2;
    const layout = {font, size, perPage};
    const chunks = [];
    for (let i=0; i<problems.length; i+=perPage) {
      chunks.push(problems.slice(i,i+perPage));
    }
    const html = chunks.map((items,i)=>sheetPage(items,i,chunks.length,layout)).join('');
    $('#worksheet-preview').innerHTML = html;
    $('#print-root').innerHTML = html + ($('#answer-key').checked
      ? chunks.map((items,i)=>sheetPage(items,i,chunks.length,layout,true)).join('') : '');
    $('#preview-status').textContent=`${problems.length}문항 · ${chunks.length}쪽 준비됨`;
  }
  function readChoices(problem){
    const match = problem.visual?.match(/^<div class="word-choices">보기:\s*([^<]+)<\/div>$/);
    return match ? match[1].split(/　·　/).map(option=>option.trim()).filter(Boolean) : [];
  }
  function varyProblem(problem,index,used){
    const p={...problem};
    const choices=readChoices(p);
    if(!choices.length){p.type='write';p.typeLabel='직접 쓰기';return p}
    const mode=index%4;
    if(mode===0){p.type='choice';p.typeLabel='알맞은 답에 ○ 하기';return p}
    if(mode===1 && !/고르|보기|찾으세요/.test(p.question)){p.type='write';p.typeLabel='직접 쓰기';p.visual='';return p}
    const wrong=choices.find(choice=>choice!==String(p.answer));
    if(mode===2&&wrong&&!/고르|보기|찾으세요/.test(p.question)){
      const candidate=Math.random()<.5?String(p.answer):wrong;
      p.candidate=candidate;
      p.answer=candidate===String(p.answer)?'○':'×';
      p.visual='';p.type='ox';p.typeLabel='제시된 답이 맞으면 ○, 틀리면 ×';return p;
    }
    if(mode===3&&wrong&&!/보기|그림|표를|고르/.test(p.question)){
      const second=C.createProblems(current.topic,current.level,current.grade,5,[...used]).find(item=>!used.has(item.key)&&item.answer!==p.answer&&readChoices(item).length&&!/보기|그림|표를|고르/.test(item.question));
      if(!second){p.type='choice';p.typeLabel='알맞은 답에 ○ 하기';return p}
      used.add(second.key);
      p.sourceKeys=[p.key,second.key];
      p.type='match';p.typeLabel='선 잇기';
      p.question='왼쪽 물음과 알맞은 답을 선으로 이으세요.';
      const reverse=Math.random()<.5;
      const first=reverse?second.answer:p.answer,other=reverse?p.answer:second.answer;
      p.visual=`<div class="match-task">
        <span>① ${escapeHTML(problem.question)}</span><span class="match-points" aria-hidden="true">●　　●</span><span>㉠ ${escapeHTML(first)}</span>
        <span>② ${escapeHTML(second.question)}</span><span class="match-points" aria-hidden="true">●　　●</span><span>㉡ ${escapeHTML(other)}</span>
      </div>`;
      p.answer=reverse?'①–㉡, ②–㉠':'①–㉠, ②–㉡';
      return p;
    }
    p.type='choice';p.typeLabel='알맞은 답에 ○ 하기';
    return p;
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
      if (index % 2 === 0) {
        for (let attempt = 0; attempt < 32; attempt++) {
          const picture = window.pictureProblem(current.topic, current.level);
          if (!picture) break;
          const key = JSON.stringify([picture.question, picture.visual, picture.answer]);
          if (used.has(key)) continue;
          used.add(key);
          return {...picture, key};
        }
      }
      return varyProblem(problem, (index + Math.floor(index / 4)) % 4, used);
    });
    renderSheet();
    if(newSheet)rememberQuestions();
  }
  function updateTopics(){
    const grade=$('#grade').value,subject=$('#subject').value,topics=C.catalog[C.band(grade)][subject],old=$('input[name="topic"]:checked')?.value;
    let lastArea='';
    $('#topic-options').innerHTML=topics.map((key,i)=>{const [name,icon,description]=C.topicInfo[key],area=C.unitArea?.(key)||'';let heading=area!==lastArea?`<div class="unit-group-title">${escapeHTML(area)}</div>`:'';lastArea=area;return `${heading}<label class="choice"><input type="radio" name="topic" value="${key}" ${old===key||(!topics.includes(old)&&i===0)?'checked':''}><span class="choice-icon">${icon}</span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(description)}</small></label>`}).join('');
    generate();
  }
  function updateSubjects(){
    const grade=$('#grade').value,choices=C.catalog[C.band(grade)],old=$('#subject').value;
    $('#subject').innerHTML=Object.keys(choices).map(key=>`<option value="${key}">${C.subjectNames[key]}</option>`).join('');
    if(choices[old])$('#subject').value=old;
    updateTopics();
  }
  $('#grade').addEventListener('change',updateSubjects);
  $('#subject').addEventListener('change',updateTopics);
  $('#topic-options').addEventListener('change',()=>generate());
  document.querySelectorAll('input[name="level"]').forEach(el=>el.addEventListener('change',()=>generate()));
  $('#count').addEventListener('change',()=>generate());
  $('#paper-title').addEventListener('input',()=>{if(current.topic){current.title=$('#paper-title').value.trim();renderSheet()}});
  $('#worksheet-form').addEventListener('submit',e=>{e.preventDefault();generate(true)});
  for (const selector of ['#worksheet-font', '#worksheet-size']) {
    const control = $(selector);
    const key = 'teukgyo:' + control.id;
    try {
      const saved = localStorage.getItem(key);
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
    window.print()});
  updateSubjects();

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
    const warning = dateReview(noticeDraft(draft));
    $('#notice-date-review').textContent = warning;
    $('#notice-date-review').hidden = !warning;
    $('#result').textContent=result; $('#result').classList.remove('empty'); $('#copy-button').disabled=false; $('#copy-button').textContent='복사하기';
  });
  $('#draft').addEventListener('input',()=>$('#draft').setCustomValidity(''));
  $('#copy-button').addEventListener('click',async()=>{
    const value=$('#result').textContent;
    const copied=await copyText(value);
    $('#copy-button').textContent=copied?'복사했어요 ✓':'복사할 수 없어요';setTimeout(()=>$('#copy-button').textContent='복사하기',2200);
  });
})();
