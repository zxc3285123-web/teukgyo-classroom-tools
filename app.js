(() => {
  const $ = s => document.querySelector(s);
  const C = window.basicCurriculum2022;
  const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const levelNames={basic:'기초',practice:'연습',challenge:'도전'};
  let current={},problems=[];
  const historyKey='teukgyo-question-history-v1';
  let questionHistory={};
  try{questionHistory=JSON.parse(localStorage.getItem(historyKey)||'{}')||{}}catch{questionHistory={}}
  const historyScope=(grade,subject,topic)=>[C.band(grade),subject,topic].join(':');
  const normalizeQuestion=value=>String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  function similarQuestion(left,right){
    const a=normalizeQuestion(left),b=normalizeQuestion(right);
    if(a===b)return true;
    if(a.length<13||b.length<13||Math.abs(a.length-b.length)>Math.max(a.length,b.length)*.35)return false;
    const grams=s=>new Set(Array.from({length:s.length-1},(_,i)=>s.slice(i,i+2)));
    const x=grams(a),y=grams(b),common=[...x].filter(g=>y.has(g)).length;
    return common/(x.size+y.size-common)>=.82;
  }
  const previousQuestions=(grade,subject,topic)=>{
    const saved=questionHistory[historyScope(grade,subject,topic)];
    return Array.isArray(saved)?saved.filter(q=>typeof q==='string'):[];
  };
  function repeatedIndices(items,grade,subject,topic){
    const prior=previousQuestions(grade,subject,topic),accepted=[],repeated=[];
    items.forEach((item,i)=>{
      if([...prior,...accepted].some(old=>similarQuestion(item.question,old)))repeated.push(i+1);
      else accepted.push(item.question);
    });
    return repeated;
  }
  function rememberQuestions(items,grade,subject,topic){
    const scope=historyScope(grade,subject,topic);
    questionHistory[scope]=[...previousQuestions(grade,subject,topic),...items.map(p=>p.question)].slice(-200);
    try{localStorage.setItem(historyKey,JSON.stringify(questionHistory));return true}catch{return false}
  }

  document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===button));
    $('#worksheet-panel').classList.toggle('hidden',button.dataset.tab!=='worksheet');
    $('#letter-panel').classList.toggle('hidden',button.dataset.tab!=='letter');
  }));

  function sheetPage(items,page,total,answer=false){
    const title=escapeHTML(current.title||`오늘의 ${C.topicInfo[current.topic][0]}`);
    const subject=C.subjectNames[current.subject],topic=C.topicInfo[current.topic][0];
    return `<article class="worksheet-page${answer?' answer-page':''}">
      <div class="sheet-overline">2022 특수교육 기본 교육과정 · ${escapeHTML(C.bandName(current.grade))}</div>
      <div class="sheet-title-row"><h2>${title}${answer?' · 정답':''}</h2><span>${escapeHTML(C.gradeName(current.grade))} · ${escapeHTML(subject)}</span></div>
      <div class="sheet-meta"><b>이름 <span></span></b><b>날짜 <span></span></b></div>
      <div class="sheet-instruction"><strong>${escapeHTML(topic)} · </strong>${answer?'답을 확인하세요.':'문제를 읽고 알맞은 답을 적어 보세요.'}</div>
      <div class="problem-list">${items.map((p,i)=>`<div class="problem"><div class="problem-top"><span class="problem-num">${page*4+i+1}</span><div class="problem-question">${escapeHTML(p.question)}</div></div>${!answer&&p.visual?`<div class="problem-visual">${p.visual}</div>`:''}${answer?`<div class="answer-value">정답: ${escapeHTML(p.answer)}</div>`:'<div class="answer-line">답 <span class="answer-box"></span></div>'}</div>`).join('')}</div>
      <div class="sheet-footer"><span>한 걸음씩, 나의 속도로</span><span>${page+1} / ${total}</span></div>
    </article>`;
  }
  function renderSheet(){
    const chunks=[];for(let i=0;i<problems.length;i+=4)chunks.push(problems.slice(i,i+4));
    const html=chunks.map((items,i)=>sheetPage(items,i,chunks.length)).join('');
    $('#worksheet-preview').innerHTML=html;
    $('#print-root').innerHTML=html+($('#answer-key').checked?chunks.map((items,i)=>sheetPage(items,i,chunks.length,true)).join(''):'');
    $('#preview-status').textContent=`${problems.length}문항 · ${chunks.length}쪽 준비됨`;
  }
  function generate(){
    const topic=$('input[name="topic"]:checked');if(!topic)return;
    current={grade:$('#grade').value,subject:$('#subject').value,topic:topic.value,level:$('input[name="level"]:checked').value,count:Number($('#count').value),title:$('#paper-title').value.trim()};
    problems=C.createProblems(current.topic,current.level,current.grade,current.count);
    renderSheet();
  }
  function updateTopics(){
    const grade=$('#grade').value,subject=$('#subject').value,topics=C.catalog[C.band(grade)][subject],old=$('input[name="topic"]:checked')?.value;
    $('#topic-options').innerHTML=topics.map((key,i)=>{const [name,icon,description]=C.topicInfo[key];return `<label class="choice"><input type="radio" name="topic" value="${key}" ${old===key||(!topics.includes(old)&&i===0)?'checked':''}><span class="choice-icon">${icon}</span><strong>${name}</strong><small>${description}</small></label>`}).join('');
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
  $('#topic-options').addEventListener('change',generate);
  document.querySelectorAll('input[name="level"]').forEach(el=>el.addEventListener('change',generate));
  $('#count').addEventListener('change',generate);
  $('#paper-title').addEventListener('input',()=>{if(current.topic){current.title=$('#paper-title').value.trim();renderSheet()}});
  $('#worksheet-form').addEventListener('submit',e=>{e.preventDefault();generate()});
  $('#answer-key').addEventListener('change',renderSheet);
  $('#print-button').addEventListener('click',()=>window.print());
  updateSubjects();

  async function copyText(value){
    try{await navigator.clipboard.writeText(value);return true}
    catch{
      const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;
    }
  }
  function copyPrompt(value){
    const field=document.createElement('textarea'),previous=document.activeElement;
    field.value=value;field.style.position='fixed';field.style.left='-9999px';document.body.appendChild(field);field.focus();field.select();
    const copied=document.execCommand('copy');field.remove();previous?.focus?.();
    if(!copied&&navigator.clipboard?.writeText)navigator.clipboard.writeText(value).catch(()=>{});
    return copied;
  }
  function prepareSheetPrompt(){
    const gradeCode=$('#grade').value,subjectCode=$('#subject').value,topicCode=$('input[name="topic"]:checked').value;
    const grade=C.gradeName(gradeCode),subject=C.subjectNames[subjectCode],topic=C.topicInfo[topicCode][0];
    const level=levelNames[$('input[name="level"]:checked').value],count=Number($('#count').value);
    const prior=previousQuestions(gradeCode,subjectCode,topicCode).slice(-30);
    const avoid=prior.length?`\n다음은 이 선생님이 이전에 사용한 문항입니다. 같은 질문이나 표현만 바꾼 유사 문항은 만들지 마세요:\n${prior.map((q,i)=>`${i+1}. ${q}`).join('\n')}`:'';
    const prompt=`특수교육 기본 교육과정을 참고하여 ${grade} ${subject} 학습지를 만들어 주세요. 주제는 “${topic}”, 학생의 현재 수행 수준은 “${level}”, 문항 수는 ${count}개입니다. 2022 개정 특수교육 기본 교육과정의 해당 학년군에 맞는 생활 밀착형 활동으로 구성하되, 특정 성취기준의 원문을 확인하지 못했다면 그대로 인용하거나 근거를 지어내지 마세요. 이번 학습지 안에서도 같은 문제를 반복하지 말고, 답이 명확한 문제로 작성해 주세요. 학생 개인정보는 사용하지 마세요.${avoid}\n아래 형식의 유효한 JSON 객체만 출력하고 설명, 마크다운, 코드 블록은 넣지 마세요. 질문과 정답은 모두 한국어로 적어 주세요.\n{"title":"학습지 제목","questions":[{"question":"문제 1","answer":"정답 1"}]}`;
    $('#sheet-prompt-preview').value=prompt;$('#sheet-import-area').classList.remove('hidden');
    return prompt;
  }
  $('#copy-sheet-prompt').addEventListener('click',async()=>{
    const copied=await copyText(prepareSheetPrompt());
    $('#ai-sheet-status').textContent=copied?'요청 문구를 복사했어요. 이제 ② 내 ChatGPT 열기를 누르고 붙여 넣어 주세요.':'자동 복사가 허용되지 않았어요. 아래 요청 문구 직접 보기를 펼쳐 복사해 주세요.';
  });
  $('#open-sheet-chatgpt').addEventListener('click',()=>{
    const prompt=prepareSheetPrompt();
    const copied=copyPrompt(prompt);
    $('#ai-sheet-status').textContent=copied?'ChatGPT 입력창에 붙여 넣고 전송하세요. 답변 전체를 복사해 아래에 가져오세요.':'ChatGPT 입력창에 붙여 넣기가 안 되면 아래 요청 문구 직접 보기를 펼쳐 복사해 주세요.';
  });
  $('#import-sheet-result').addEventListener('click',()=>{
    const raw=$('#ai-sheet-result').value.trim();
    try{
      const cleaned=raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
      const data=JSON.parse(cleaned),items=data.questions||data.problems;
      if(!Array.isArray(items)||items.length<1||items.length>12||items.some(p=>typeof p.question!=='string'||typeof p.answer!=='string'||!p.question.trim()||!p.answer.trim()))throw Error('문항 형식을 확인해 주세요.');
      const grade=$('#grade').value,subject=$('#subject').value,topic=$('input[name="topic"]:checked').value;
      const repeated=repeatedIndices(items,grade,subject,topic);
      if(repeated.length){$('#ai-sheet-status').textContent=`${repeated.join(', ')}번 문항이 이전 문항 또는 이번 학습지의 다른 문항과 비슷합니다. ChatGPT에서 바꿔 달라고 요청해 주세요.`;return}
      current={grade,subject,topic,title:typeof data.title==='string'?data.title.slice(0,35):''};
      problems=items.map(p=>({question:p.question.trim().slice(0,500),answer:p.answer.trim().slice(0,200),visual:''}));
      const saved=rememberQuestions(problems,grade,subject,topic);
      renderSheet();$('#ai-sheet-status').textContent=`${problems.length}문항을 가져왔어요. ${saved?'이 브라우저에 사용 기록을 저장했습니다.':'브라우저가 사용 기록 저장을 허용하지 않았습니다.'} 정답과 교육과정 적합성을 확인해 주세요.`;
    }catch(e){$('#ai-sheet-status').textContent='가져오지 못했어요. ChatGPT에 JSON 형식으로 다시 작성해 달라고 요청해 주세요.'}
  });

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
  function polish(text,tone) {
    const cleaned=text.trim().replace(/\r/g,'');
    if(!cleaned) return '';
    const sentences=cleaned.split(/\n+|(?<=[.!?])\s+/).map(s=>normalizeSentence(s,tone)).filter(Boolean);
    const intro=tone==='warm'?'안녕하세요, 학부모님. 늘 학교 활동에 관심을 가져 주셔서 감사합니다.':tone==='brief'?'안녕하세요, 학부모님.':'안녕하세요, 학부모님. 아래 내용을 안내드립니다.';
    const close=tone==='warm'?'가정에서도 내용을 확인해 주시면 감사하겠습니다. 궁금하신 점은 학교로 문의해 주세요.':tone==='brief'?'확인 부탁드립니다. 감사합니다.':'내용을 확인해 주시고, 궁금하신 점은 학교로 문의해 주시기 바랍니다. 감사합니다.';
    return `${intro}\n\n${sentences.join(tone==='brief'?'\n':' ')}\n\n${close}`;
  }
  $('#polish-button').addEventListener('click',()=>{
    const draft=$('#draft').value;
    if(!draft.trim()){ $('#draft').focus(); $('#draft').setCustomValidity('안내할 내용을 먼저 입력해 주세요.'); $('#draft').reportValidity(); return; }
    $('#draft').setCustomValidity('');
    const tone=$('input[name="tone"]:checked').value, result=polish(draft,tone);
    $('#result').textContent=result; $('#result').classList.remove('empty'); $('#copy-button').disabled=false; $('#copy-button').textContent='복사하기';
  });
  $('#draft').addEventListener('input',()=>$('#draft').setCustomValidity(''));
  $('#open-letter-chatgpt').addEventListener('click',event=>{
    const draft=$('#draft').value.trim();
    if(!draft){event.preventDefault();$('#ai-letter-status').textContent='초안을 먼저 입력해 주세요.';$('#draft').focus();return}
    const tone={formal:'정중하고 전문적인',warm:'따뜻하고 공손한',brief:'간결하고 공손한'}[$('input[name="tone"]:checked').value];
    const prompt=`다음 학부모 안내문 초안을 ${tone} 한국어로 다듬어 주세요. 원문에 없는 날짜·장소·준비물·약속은 만들지 마세요. 학생 개인정보가 있으면 익명 표현으로 바꾸고, 결과 안내문만 출력해 주세요.\n\n초안:\n${draft}`;
    $('#letter-prompt-preview').value=prompt;$('#letter-import-area').classList.remove('hidden');
    const copied=copyPrompt(prompt);
    $('#ai-letter-status').textContent=copied?'ChatGPT가 열립니다. 붙여 넣기가 안 되면 요청 문구 직접 복사를 펼쳐 주세요.':'자동 복사가 허용되지 않았어요. 요청 문구 직접 복사를 펼쳐 주세요.';
  });
  $('#import-letter-result').addEventListener('click',()=>{
    const value=$('#ai-letter-result').value.trim();
    if(!value){$('#ai-letter-status').textContent='ChatGPT 결과를 먼저 붙여 넣어 주세요.';return}
    $('#result').textContent=value;$('#result').classList.remove('empty');$('#copy-button').disabled=false;$('#copy-button').textContent='복사하기';
    $('#ai-letter-status').textContent='안내문을 가져왔어요. 보내기 전에 내용을 확인해 주세요.';
  });
  $('#copy-button').addEventListener('click',async()=>{
    const value=$('#result').textContent;
    await copyText(value);
    $('#copy-button').textContent='복사했어요 ✓';setTimeout(()=>$('#copy-button').textContent='복사하기',2200);
  });
})();
