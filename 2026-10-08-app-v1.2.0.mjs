import {setupLibrary} from './2026-10-08-library-ui-v1.2.0.mjs';
import {analyzePair,recommendAll,clamp} from './2026-10-08-analysis-v1.2.0.mjs';
import {loadFile,disposeClip,makeDemoClip,seekClip,sampleClip,renderFrame,checkAbort} from './2026-10-08-media-v1.2.0.mjs';

const $=id=>document.getElementById(id);
const state={clips:{a:null,b:null},cuts:{a:0,b:0},loading:{a:false,b:false},loadControllers:{},thumbControllers:{},analysis:null,recs:[],pool:[],selected:0,busy:false,mode:'recommended',duration:0,preview:null,revision:0};
const seconds=n=>`${Number(n).toFixed(2)}초`;
const timestamp=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${(n%60).toFixed(2).padStart(5,'0')}`;
const signed=n=>`${n>0?'+':''}${n}%`;
const safeText=(tag,text,className)=>{const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;};
function notify(message){$('status').textContent=message;}
function error(message){$('error').textContent=message;$('error').hidden=!message;}
function setBusy(busy){
  state.busy=busy;$('cancel').hidden=!busy;$('progress-wrap').hidden=!busy;$('analyze').hidden=busy;
  for(const side of ['a','b']){for(const id of [`file-${side}`,`cut-${side}`,`time-${side}`])$(id).disabled=busy||(!id.startsWith('file')&&!state.clips[side]);}
  $('intent').disabled=busy;$('mood').disabled=busy;
  document.querySelectorAll('.change').forEach(el=>el.disabled=busy);
  updateReady();
}
function updateReady(){
  const hasDemo=Object.values(state.clips).some(clip=>clip?.kind==='demo');
  $('demo').textContent=hasDemo?'샘플 체험 종료 ↩':'샘플로 체험 ↗';
  $('demo').setAttribute('aria-label',hasDemo?'샘플 체험 종료하고 영상 선택으로 돌아가기':'샘플로 체험');
  $('demo').disabled=state.busy&&!hasDemo;
  const ready=state.clips.a&&state.clips.b&&!state.loading.a&&!state.loading.b&&!state.busy;
  $('analyze').disabled=!ready;$('ready-note').textContent=ready?'두 컷이 준비됐어요':'영상 두 개를 선택하면 준비 완료';
}
function stopPreview(){
  if(state.preview){state.preview.abort();state.preview=null;}
  for(const clip of Object.values(state.clips))clip?.video?.pause();
  $('play').textContent='▶ 연결 재생';$('play').setAttribute('aria-pressed','false');
}
function invalidate(){
  state.revision++;state.analysisController?.abort();stopPreview();state.analysis=null;state.recs=[];state.pool=[];library.refresh();
  $('results').hidden=true;$('empty-guide').hidden=false;error('');
}
async function thumbnail(side){
  const clip=state.clips[side];if(!clip)return;
  state.thumbControllers[side]?.abort();const controller=new AbortController();state.thumbControllers[side]=controller;
  try{await seekClip(clip,state.cuts[side],controller.signal);checkAbort(controller.signal);
    const canvas=$(`thumb-${side}`),ctx=canvas.getContext('2d');ctx.fillStyle='#172b25';ctx.fillRect(0,0,canvas.width,canvas.height);
    renderFrame(ctx,clip,state.cuts[side],{w:canvas.width,h:canvas.height});
  }catch(e){if(e.name!=='AbortError')error(e.message);}
}
function displayClip(side){
  const clip=state.clips[side],drop=$(`drop-${side}`);drop.classList.toggle('loaded',!!clip);
  drop.querySelector('label').hidden=!!clip;drop.querySelector('.frame-label').hidden=!clip;$(`thumb-${side}`).hidden=!clip;
  document.querySelector(`.change[data-side="${side}"]`).hidden=!clip;
  $(`name-${side}`).textContent=clip?clip.name:'선택된 영상이 없습니다';
  $(`meta-${side}`).textContent=clip?`${clip.width}×${clip.height} · ${seconds(clip.duration)}${clip.kind==='demo'?' · 샘플':''}`:'LOCAL FILE';
  if(clip){
    const min=side==='a'?.08:0,max=side==='a'?clip.duration-.03:clip.duration-.08;
    state.cuts[side]=clamp(state.cuts[side],min,max);
    for(const id of [`cut-${side}`,`time-${side}`]){const el=$(id);el.min=min.toFixed(2);el.max=max.toFixed(2);el.value=state.cuts[side].toFixed(2);el.disabled=false;}
    thumbnail(side);
  }else{for(const id of [`cut-${side}`,`time-${side}`]){$(id).disabled=true;$(id).value=0;}}
  updateReady();
}
async function chooseFile(side,file){
  if(state.busy||!file)return;
  state.loadControllers[side]?.abort();state.thumbControllers[side]?.abort();invalidate();
  const controller=new AbortController();state.loadControllers[side]=controller;state.loading[side]=true;$(`card-${side}`).classList.add('loading');updateReady();notify(`${side.toUpperCase()} 영상을 브라우저에서 읽고 있습니다…`);
  try{
    const clip=await loadFile(file,controller.signal);checkAbort(controller.signal);
    disposeClip(state.clips[side]);state.clips[side]=clip;state.cuts[side]=side==='a'?Math.max(.08,clip.duration-.04):0;
    displayClip(side);notify('연결 위치를 맞춘 뒤 분석해 주세요. 영상은 업로드되지 않습니다.');
  }catch(e){if(e.name!=='AbortError')error(e.message);}
  finally{if(state.loadControllers[side]===controller){state.loading[side]=false;$(`card-${side}`).classList.remove('loading');updateReady();}}
}
for(const side of ['a','b']){
  $(`file-${side}`).addEventListener('change',e=>{chooseFile(side,e.target.files[0]);e.target.value='';});
  document.querySelector(`.change[data-side="${side}"]`).addEventListener('click',()=>$(`file-${side}`).click());
  const drop=$(`drop-${side}`);
  drop.addEventListener('dragover',e=>{e.preventDefault();if(!state.busy)drop.classList.add('dragging');});
  drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');if(e.dataTransfer.files.length!==1){error('한 칸에 영상 한 개씩 넣어 주세요.');return;}chooseFile(side,e.dataTransfer.files[0]);});
  const setCut=e=>{
    if(!state.clips[side]||state.busy)return;
    const el=e.target;if(el.value==='')return;
    const value=clamp(Number(el.value),Number(el.min),Number(el.max));if(!Number.isFinite(value)||value===state.cuts[side])return;
    invalidate();state.cuts[side]=value;$(`cut-${side}`).value=value;$(`time-${side}`).value=value.toFixed(2);thumbnail(side);notify('연결 위치가 바뀌었습니다. 다시 분석해 주세요.');
  };
  $(`cut-${side}`).addEventListener('input',setCut);$(`time-${side}`).addEventListener('change',setCut);
}
$('demo').addEventListener('click',()=>{
  if(Object.values(state.clips).some(clip=>clip?.kind==='demo')){resetWorkspace(true);return;}
  if(state.busy)return;invalidate();
  for(const side of ['a','b']){state.loadControllers[side]?.abort();state.thumbControllers[side]?.abort();state.loading[side]=false;$(`card-${side}`).classList.remove('loading');disposeClip(state.clips[side]);state.clips[side]=makeDemoClip(side);state.cuts[side]=side==='a'?4.5:1.2;displayClip(side);}
  notify('브라우저에서 그린 샘플입니다. 연결 분석하기를 눌러 밝기와 색감 차이를 확인하세요.');
});
for(const id of ['intent','mood'])$(id).addEventListener('change',()=>{invalidate();notify('편집 의도나 분위기가 바뀌었습니다. 다시 분석해 주세요.');});
$('analyze').addEventListener('click',async()=>{
  if(state.busy||!state.clips.a||!state.clips.b)return;
  invalidate();for(const side of ['a','b'])state.thumbControllers[side]?.abort();
  const revision=state.revision,controller=new AbortController();state.analysisController=controller;setBusy(true);$('progress').value=0;
  notify('앞 영상의 끝부분을 확인하고 있습니다…');
  try{
    const a=await sampleClip(state.clips.a,state.cuts.a,'a',controller.signal,n=>{$('progress').value=n;});
    notify('뒤 영상의 시작부분을 비교하고 있습니다…');
    const b=await sampleClip(state.clips.b,state.cuts.b,'b',controller.signal,n=>{$('progress').value=9+n;});
    checkAbort(controller.signal);if(revision!==state.revision)return;
    state.analysis=analyzePair(a,b);state.pool=recommendAll(state.analysis,{intent:$('intent').value,mood:$('mood').value,availableA:state.cuts.a,availableB:state.clips.b.duration-state.cuts.b-.025});state.recs=state.pool.slice(0,3);library.refresh();
    renderResults();notify(`${state.analysis.sampleCount}개 프레임 분석 완료. 아래에서 추천 이유와 조절값을 확인하세요.`);
    $('results-heading').focus({preventScroll:true});$('results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }catch(e){if(revision!==state.revision)return;if(e.name==='AbortError')notify('분석을 취소했습니다. 영상과 연결 위치는 유지됩니다.');else error(e.message);}
  finally{if(state.analysisController===controller){setBusy(false);for(const side of ['a','b'])thumbnail(side);}}
});
$('cancel').addEventListener('click',()=>state.analysisController?.abort());
function renderResults(){
  const r=state.analysis;
  $('results').hidden=false;$('empty-guide').hidden=true;
  const dominant=[['밝기',r.brightness],['색감',r.color],['화면 구조',r.structure],['움직임',r.motion]].sort((a,b)=>b[1]-a[1])[0];
  $('diagnosis-title').textContent=r.change<8?'큰 화면 차이는 보이지 않아요':`${dominant[0]} 차이부터 살펴보세요`;
  $('diagnosis-copy').textContent=r.opposed?'화면 이동 방향이 반대로 추정됩니다. 같은 행동을 잇는 컷이라면 연결 위치를 먼저 바꿔 보세요.':'차이는 편집의 단서입니다. 장면의 의미와 동작이 이어지는지는 직접 확인해 주세요.';
  $('metrics').replaceChildren();
  for(const [name,value] of [['밝기 차이',r.brightness],['색감 차이',r.color],['화면 구조 차이',r.structure],['움직임 차이',r.motion]]){
    const wrap=safeText('div','','metric'),label=safeText('div','','metric-label');label.append(safeText('span',name),safeText('span',value<8?'작음':value<22?'보통':'큼'));
    const meter=document.createElement('progress');meter.max=100;meter.value=Math.round(value);meter.setAttribute('aria-label',`${name}: 상대 차이 ${Math.round(value)} / 100`);if(value>22)meter.className='high';wrap.append(label,meter);$('metrics').append(wrap);
  }
  $('analysis-footnote').textContent=`연결 주변 ${r.sampleCount}프레임 · 낮은 해상도로 샘플링한 상대 차이이며 품질 점수가 아닙니다. 오디오·장면 의미는 분석하지 않습니다.${state.clips.a.width/state.clips.a.height!==state.clips.b.width/state.clips.b.height?' 화면 비율이 다릅니다. 캡컷에서 프레임 맞춤도 확인하세요.':''}`;
  $('recommendations').replaceChildren();
  state.recs.forEach((rec,i)=>{
    const button=document.createElement('button');button.type='button';button.className='rec';button.setAttribute('aria-pressed','false');button.dataset.index=i;
    const content=document.createElement('div'),row=safeText('div','','rec-title-row');row.append(safeText('h3',rec.title),safeText('span',rec.manual?'직접 선택':i===0?'먼저 시도':rec.kind,'tag'));
    content.append(row,safeText('p',rec.why),safeText('p',rec.reasonEvidence,'evidence-note'),safeText('small',`${rec.kind} · ${rec.duration?seconds(rec.duration):'전환 없음'}${rec.blur?' · 블러 약하게':''}`));button.append(safeText('span',`0${i+1}`,'rec-index'),content);button.addEventListener('click',()=>selectRec(i));$('recommendations').append(button);
  });selectRec(0);
}
function valueRow(name,value){const row=safeText('div','','value-row');row.append(safeText('span',name),safeText('strong',value));return row;}
function selectRec(index){
  stopPreview();state.selected=index;const rec=state.recs[index];state.duration=rec.duration;
  document.querySelectorAll('.rec').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
  $('detail-title').textContent=rec.title;$('detail-english').textContent=rec.english;$('detail-tip').textContent=rec.tip;$('detail-caution').textContent=rec.caution;$('detail-evidence').textContent=`${rec.fit} · ${rec.reasonEvidence}`;$('detail-source').href=rec.source;$('detail-source').textContent=`${rec.evidence} · 공식 기능 자료 ↗`;
  const previewSupported=rec.preview!=='none';
  $('mode-recommended').disabled=!previewSupported;state.mode=previewSupported?'recommended':'original';
  for(const m of ['original','recommended'])$(`mode-${m}`).setAttribute('aria-pressed',String(m===state.mode));
  $('preview-badge').textContent=previewSupported?'추천 전환':'원본 연결';
  $('preview-note').textContent=previewSupported?'전환 타이밍만 근사합니다. 보정·효과는 캡컷에서 확인해 주세요.':'이 항목의 전용 효과는 여기서 재현하지 않습니다. 원본 연결을 재생하고 적용 결과는 캡컷에서 확인해 주세요.';
  $('duration').max=rec.maxDuration;$('duration').value=rec.duration;$('duration').disabled=rec.type!=='transition'||rec.maxDuration<.01;
  renderValues();updateDuration();drawStill();
}
function renderValues(){
  const rec=state.recs[state.selected];if(!rec)return;
  const values=$('detail-values');values.replaceChildren(valueRow('전환 길이',state.duration?seconds(state.duration):'0초 · 단순 컷'));
  if($('intent').value!=='different'){
    for(const [key,label] of [['brightness','B 밝기 · 상대 보정'],['temperature','B 색온도 · 상대 보정'],['saturation','B 채도 · 상대 보정']]){
      const n=rec.adjustments[key];values.append(valueRow(label,Math.abs(n)>=2?signed(n):'유지'));
    }
  }else values.append(valueRow('장면별 색감','의도한 차이는 유지'));
  if(rec.blur){values.append(valueRow('Blur · 범위 대비 강도',`${rec.blur}%`),valueRow('적용 구간',`경계 앞뒤 각 ${seconds(rec.span)}`));}
  for(const p of rec.parameters||[])values.append(valueRow(p.label,p.value));
  const candidate=state.analysis.candidate;
  if(candidate.gain>4)values.append(valueRow('대체 컷 후보 · 직접 확인',`A ${seconds(candidate.a)} / B ${seconds(candidate.b)}`));
}
function updateDuration(){
  $('duration-value').textContent=seconds(state.duration);
  $('frame-count').textContent=`${$('fps').value} fps 프로젝트 기준 약 ${Math.round(state.duration*Number($('fps').value))}프레임 · 원본 FPS 자동 감지 아님`;
  $('duration-note').textContent=$('duration').disabled?'이 추천은 별도 전환을 사용하지 않습니다.':`가능한 범위 0–${state.recs[state.selected].maxDuration.toFixed(2)}초 · 캡컷의 실제 제한은 다를 수 있어요.`;
  renderValues();
}
$('duration').addEventListener('input',()=>{stopPreview();state.duration=Number($('duration').value);updateDuration();drawStill();});
$('fps').addEventListener('change',updateDuration);
function previewTiming(){
  const lenA=Math.min(1.6,state.cuts.a),lenB=Math.min(1.6,state.clips.b.duration-state.cuts.b-.025);
  const overlap=state.mode==='recommended'&&state.recs[state.selected].preview!=='none'?Math.min(state.duration,lenA,lenB):0;
  return {lenA,lenB,overlap,bStart:lenA-overlap,total:lenA+lenB-overlap,aSource:state.cuts.a-lenA};
}
function paintPreview(time,timing){
  const ctx=$('preview').getContext('2d'),rect={w:960,h:540};ctx.fillStyle='#13261d';ctx.fillRect(0,0,960,540);
  const ta=timing.aSource+Math.min(time,timing.lenA),tb=state.cuts.b+Math.max(0,time-timing.bStart);
  const id=state.mode==='original'?'cut':state.recs[state.selected].id;
  const inTransition=timing.overlap>0&&time>=timing.bStart&&time<timing.lenA;
  if(inTransition){
    const p=clamp((time-timing.bStart)/timing.overlap,0,1);
    if(id==='fade'){
      ctx.fillStyle='#000';ctx.fillRect(0,0,960,540);
      if(p<.5)renderFrame(ctx,state.clips.a,ta,rect,1-p*2);else renderFrame(ctx,state.clips.b,tb,rect,(p-.5)*2);
    }else{renderFrame(ctx,state.clips.a,ta,rect);renderFrame(ctx,state.clips.b,tb,rect,p);}
  }else if(time<timing.lenA)renderFrame(ctx,state.clips.a,ta,rect);else renderFrame(ctx,state.clips.b,tb,rect);
  $('play-time').textContent=`${timestamp(time)} / ${timestamp(timing.total)}`;
}
async function drawStill(){
  if(!state.analysis)return;
  // Thumbnail refresh and preview share video elements; use the cut frame until playback starts.
  const ctx=$('preview').getContext('2d');ctx.fillStyle='#13261d';ctx.fillRect(0,0,960,540);
  renderFrame(ctx,state.clips.a,state.cuts.a,{w:960,h:540});
  $('play-time').textContent=`${timestamp(0)} / ${timestamp(previewTiming().total)}`;
}
for(const mode of ['original','recommended'])$(`mode-${mode}`).addEventListener('click',()=>{
  stopPreview();state.mode=mode;for(const m of ['original','recommended'])$(`mode-${m}`).setAttribute('aria-pressed',String(m===mode));
  $('preview-badge').textContent=mode==='original'?'원본 연결':'추천 전환';drawStill();
});
$('play').addEventListener('click',async()=>{
  if(state.preview){stopPreview();return;}if(!state.analysis)return;
  for(const side of ['a','b'])state.thumbControllers[side]?.abort();
  const controller=new AbortController();state.preview=controller;const timing=previewTiming();
  $('play').textContent='■ 재생 정지';$('play').setAttribute('aria-pressed','true');error('');
  try{
    await Promise.all([seekClip(state.clips.a,timing.aSource,controller.signal),seekClip(state.clips.b,state.cuts.b,controller.signal)]);checkAbort(controller.signal);
    if(state.clips.a.video)await state.clips.a.video.play();checkAbort(controller.signal);
    let startedB=false,raf,wallStart=performance.now();
    controller.signal.addEventListener('abort',()=>cancelAnimationFrame(raf),{once:true});
    const tick=()=>{
      if(controller.signal.aborted)return;
      const t=Math.min((performance.now()-wallStart)/1000,timing.total);
      if(t>=timing.bStart&&!startedB){startedB=true;state.clips.b.video?.play().catch(e=>{if(!controller.signal.aborted){stopPreview();error(`재생할 수 없습니다: ${e.message}`);}});}
      if(t>=timing.lenA)state.clips.a.video?.pause();
      paintPreview(t,timing);
      if(t>=timing.total){stopPreview();return;}raf=requestAnimationFrame(tick);
    };tick();
  }catch(e){if(!controller.signal.aborted){stopPreview();error(e.message);}}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreview();});
function guideText(){
  const rec=state.recs[state.selected],a=state.clips.a,b=state.clips.b;
  const lines=['CapCut Bridge v1.2.0 · 편집 가이드',`앞 영상: ${a.name} / 끝 ${seconds(state.cuts.a)}`,`뒤 영상: ${b.name} / 시작 ${seconds(state.cuts.b)}`,`편집 의도: ${$('intent').selectedOptions[0].textContent}`,'',`${rec.title} (${rec.english})`,`전환 길이: ${seconds(state.duration)} (프로젝트 ${$('fps').value} fps 기준 약 ${Math.round(state.duration*Number($('fps').value))}프레임)`,`추천 이유: ${rec.why}`];
  if($('intent').value!=='different')lines.push(`B 상대 보정: 밝기 ${signed(rec.adjustments.brightness)}, 색온도 ${signed(rec.adjustments.temperature)}, 채도 ${signed(rec.adjustments.saturation)}`);
  if(rec.blur)lines.push(`모션 블러 상대 강도 ${rec.blur}%, 경계 앞뒤 각 ${seconds(rec.span)}`);
  if(state.analysis.candidate.gain>4)lines.push(`대체 컷 후보 (의미/동작 직접 확인): A ${seconds(state.analysis.candidate.a)} / B ${seconds(state.analysis.candidate.b)}`);
  lines.push(`검색어: ${rec.english}`,`기능 확인: ${rec.evidence}`,`추천 근거: ${rec.reasonEvidence}`,`분위기: ${$('mood').selectedOptions[0].textContent}`);
  for(const p of rec.parameters||[])lines.push(`${p.label}: ${p.value}`);
  lines.push('',rec.tip,rec.caution,'','권장 시작값이며 공식 프리셋이 아닙니다. 양방향 보정 %는 중립점에서 한쪽 끝까지의 비율, 효과 강도 %는 전체 범위의 비율입니다.','작은 보정은 유지해도 됩니다. CapCut 버전별 명칭/범위/유료 여부를 확인하세요.','영상 업로드 없음. 의미/오디오 분석 없음. 미리보기는 무음 전환 근사이며 색 보정/모션 블러는 반영하지 않습니다.');return lines.join('\n');
}
$('guide-open').addEventListener('click',()=>{
  if(!state.analysis)return;
  $('guide-content').value=guideText();$('guide-dialog').showModal();
  $('guide-content').focus({preventScroll:true});
});
$('guide-dialog').querySelector('.dialog-close').addEventListener('click',()=>$('guide-dialog').close());
$('save').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob(['\uFEFF'+guideText()],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  a.href=url;a.download=`${date}-capcut-bridge-v1.2.0-편집가이드.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('편집 가이드 텍스트를 저장했습니다.');
});
function resetWorkspace(samplesOnly=false){
  invalidate();state.analysisController=null;
  for(const side of ['a','b']){
    state.loadControllers[side]?.abort();state.loadControllers[side]=null;
    state.thumbControllers[side]?.abort();state.loading[side]=false;
    $(`card-${side}`).classList.remove('loading');
    if(!samplesOnly||state.clips[side]?.kind==='demo'){
      disposeClip(state.clips[side]);state.clips[side]=null;state.cuts[side]=0;
    }
    displayClip(side);
  }
  state.mode='recommended';setBusy(false);
  for(const m of ['original','recommended'])$(`mode-${m}`).setAttribute('aria-pressed',String(m===state.mode));
  $('preview-badge').textContent='추천 전환';
  notify(samplesOnly?'샘플 체험을 종료했습니다. 내 영상을 선택해 편집을 이어가세요.':'초기화했습니다. 원본 영상은 변경되지 않았습니다.');
  $('demo').focus({preventScroll:true});
  $('workspace').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
$('reset').addEventListener('click',()=>resetWorkspace());
for(const name of ['help','privacy']){$(`${name}-open`).addEventListener('click',()=>$(`${name}-dialog`).showModal());$(`${name}-dialog`).querySelector('.dialog-close').addEventListener('click',()=>$(`${name}-dialog`).close());}
window.addEventListener('pagehide',()=>{stopPreview();state.analysisController?.abort();for(const side of ['a','b']){state.loadControllers[side]?.abort();state.thumbControllers[side]?.abort();disposeClip(state.clips[side]);}});
updateReady();

function chooseCatalog(id){
   const item=state.pool.find(x=>x.id===id);if(!item)return;
   const existing=state.recs.findIndex(x=>x.id===id);
   if(existing>=0){selectRec(existing);}else{
     state.recs=[...state.pool.slice(0,2),{...item,manual:true}];renderResults();selectRec(2);
   }
   $('detail-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
   notify('선택한 항목의 적용값과 주의점을 확인해 주세요. 낮은 적합도의 항목은 스타일을 직접 판단하세요.');
 }
 const library=setupLibrary({getRanked:()=>state.pool,onSelect:chooseCatalog});
