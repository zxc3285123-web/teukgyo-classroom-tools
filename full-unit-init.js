/* Expose every grade-band knowledge/content element as a selectable worksheet
   unit while keeping the original offline exercise bank and local history. */
(()=>{
  const C=window.basicCurriculum2022, expansion=window.expandBasicCurriculum;
  const original=C.createProblems;
  const originalKinds=new Set(['sounds','expression','matching','count5','moneyuse','daynight','familiarwords','requests','count9','add9','coins','wordread','askanswer','tens','add10','bills','clock','reading','memo','hundreds','multiplication','cardmoney','calendar','notices','punctuation','thousands','division','budget','schedule']);
  const sourceAlias={wordsSentences:'reading',wordWriting:'familiarwords'};
  const details={};
  const icons={'듣기·말하기':'☏','읽기':'▤','쓰기':'✎','수와 연산':'＋','도형':'◇','측정':'◷','규칙성':'▦','자료와 가능성':'▥'};
  for(const [band,subjects] of Object.entries(expansion)){
    for(const [subject,units] of Object.entries(subjects)){
      C.catalog[band][subject]=units.map(unit=>unit.id);
      for(const unit of units){
        details[unit.id]=unit;
        C.topicInfo[unit.id]=[unit.title,icons[unit.area]||'◈',unit.area];
      }
    }
  }
  C.unitArea=id=>details[id]?.area||'';
  C.createProblems=(id,level,grade,count,avoidKeys=[])=>{
    const unit=details[id];if(!unit)return original(id,level,grade,count,avoidKeys);
    const kind=sourceAlias[unit.kind]||unit.kind;
    if(originalKinds.has(kind)){
      const prefix=id+'|',prior=avoidKeys.filter(key=>key.startsWith(prefix)).map(key=>key.slice(prefix.length));
      return original(kind,level,grade,count,prior).map(problem=>({...problem,key:prefix+problem.key}));
    }
    const maker=grade[0]==='e'||grade[0]==='m'||grade[0]==='h'?(id.includes('_korean_')?window.fullUnitKoreanProblem:window.fullUnitMathProblem):null;
    if(!maker)return [];
    const byKey=new Map();
    for(let i=0;i<Math.max(360,count*40);i++){
      const p=maker(kind,level);if(!p)break;
      p.key=`${id}|${p.question}|${p.answer}`;
      byKey.set(p.key,p);
    }
    const recent=new Map(avoidKeys.map((key,index)=>[key,index]));
    const pool=[...byKey.values()];
    for(let i=pool.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
    pool.sort((a,b)=>(recent.get(a.key)??-1)-(recent.get(b.key)??-1));
    return Array.from({length:Math.min(count,pool.length)},(_,index)=>pool[index]);
  };
})();
