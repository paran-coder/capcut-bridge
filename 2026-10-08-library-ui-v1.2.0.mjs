import {CATALOG,filterCatalog} from './2026-10-08-catalog-v1.2.0.mjs';
const $=id=>document.getElementById(id);
const element=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
export function setupLibrary({getRanked,onSelect}){
 let current=null;
 function show(entry){
  current=entry;
  $('catalog-title').textContent=entry.title;$('catalog-keywords').textContent=`검색어: ${entry.english}`;
  $('catalog-description').textContent=entry.summary;
  $('catalog-evidence').textContent=`${entry.purposeLabel} · ${entry.evidence} · ${entry.verifiedAt} 공식 자료 확인 · 버전/지역/플랜별 제공 여부는 캡컷에서 확인`;
  const ranked=getRanked().find(x=>x.id===entry.id);
  $('catalog-reason').textContent=ranked?`${ranked.fit} · ${ranked.reasonEvidence}`:'영상 분석 후 이 항목과 영상의 적합도를 비교할 수 있습니다.';
  $('catalog-settings').textContent=ranked?(entry.type==='transition'?`권장 전환 ${ranked.duration.toFixed(2)}초 · 확보 가능한 길이 ${ranked.maxDuration.toFixed(2)}초`:entry.type==='effect'?`권장 상대 강도 ${ranked.strength}% · ${ranked.parameters.find(p=>p.label==='적용 구간')?.value}`:'밝기·색온도·채도를 뒤 영상에서 작은 폭으로 조절'):(entry.type==='transition'?`일반 시작 길이 ${entry.duration.toFixed(2)}초 · 검토 범위 ${entry.minDuration.toFixed(2)}–${entry.maxDuration.toFixed(2)}초`:entry.type==='effect'?'일반 상대 강도 5–20% · 분석 후 구간별 값 제안':'작은 폭의 톤 보정부터 확인');
  $('catalog-tip').textContent=entry.tip;$('catalog-caution').textContent=entry.caution;$('catalog-parameter-note').textContent=entry.parameterNote;
  $('catalog-source').href=entry.source;$('catalog-apply').disabled=!ranked;$('catalog-apply').textContent=ranked?'이 항목으로 가이드 확인':'영상 분석 후 선택 가능';
  $('catalog-dialog').showModal();
 }
 function refresh(){
  const items=filterCatalog({query:$('catalog-query').value,type:$('catalog-type').value,category:$('catalog-category').value,purpose:$('catalog-purpose').value});
  const ranked=getRanked(),ranks=new Map(ranked.map(e=>[e.id,e]));
  if(ranked.length)items.sort((a,b)=>(ranks.get(b.id)?.score||0)-(ranks.get(a.id)?.score||0));
  $('catalog-count').textContent=`${items.length} / ${CATALOG.length}개`;const list=$('catalog-list');list.replaceChildren();
  for(const item of items){const button=element('button','','catalog-card');button.type='button';button.dataset.id=item.id;button.setAttribute('aria-haspopup','dialog');
   const top=element('div','','catalog-card-top');top.append(element('span',`${item.kind} · ${item.category}`,'tag'),element('span',`${item.purposeLabel} · ${item.evidence}`,'catalog-proof'));
   button.append(top,element('h3',item.title),element('p',item.english,'catalog-english'),element('p',item.summary));
   if(ranks.has(item.id))button.append(element('small',ranks.get(item.id).fit));
   button.addEventListener('click',()=>show(item));list.append(button);
  }
  $('catalog-empty').hidden=items.length>0;
 }
 for(const id of ['catalog-type','catalog-category','catalog-purpose'])$(id).addEventListener('change',refresh);
 $('catalog-query').addEventListener('input',refresh);
 $('catalog-clear').addEventListener('click',()=>{$('catalog-query').value='';$('catalog-type').value='all';$('catalog-category').value='all';$('catalog-purpose').value='all';refresh();});
 $('catalog-dialog').querySelector('.dialog-close').addEventListener('click',()=>$('catalog-dialog').close());
 $('catalog-apply').addEventListener('click',()=>{if(current&&getRanked().length){$('catalog-dialog').close();onSelect(current.id);}});
 refresh();return {refresh};
}
