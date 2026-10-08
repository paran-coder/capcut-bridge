import {describeFrame,clamp} from './2026-10-08-analysis-v1.2.0.mjs';
export const abortError=()=>new DOMException('작업을 취소했습니다.','AbortError');
export function checkAbort(signal){if(signal?.aborted)throw abortError();}
function waitEvent(target,event,signal,timeout=12000){
  return new Promise((resolve,reject)=>{
    let timer;
    const cleanup=()=>{clearTimeout(timer);target.removeEventListener(event,done);target.removeEventListener('error',failed);signal?.removeEventListener('abort',aborted);};
    const done=()=>{cleanup();resolve();};
    const failed=()=>{cleanup();reject(new Error('이 영상은 브라우저에서 읽을 수 없습니다. 다른 코덱의 MP4 또는 WebM을 선택해 주세요.'));};
    const aborted=()=>{cleanup();reject(abortError());};
    target.addEventListener(event,done,{once:true});target.addEventListener('error',failed,{once:true});signal?.addEventListener('abort',aborted,{once:true});
    timer=setTimeout(()=>{cleanup();reject(new Error('영상 읽기 시간이 초과되었습니다. 더 짧은 파일로 다시 시도해 주세요.'));},timeout);
    if(signal?.aborted)aborted();
  });
}
export async function loadFile(file,signal){
  if(!file||file.size===0)throw new Error('비어 있는 파일입니다. 다른 영상을 선택해 주세요.');
  if(!file.type.startsWith('video/')&&!/\.(mp4|m4v|mov|webm|ogv|ogg)$/i.test(file.name))throw new Error('영상 파일을 선택해 주세요.');
  const url=URL.createObjectURL(file),video=document.createElement('video');
  video.preload='auto';video.muted=true;video.playsInline=true;
  try{
    const ready=waitEvent(video,'loadeddata',signal,20000);video.src=url;video.load();await ready;checkAbort(signal);
    if(!Number.isFinite(video.duration)||video.duration<.15||!video.videoWidth)throw new Error('0.15초 이상의 정상적인 영상 파일이 필요합니다.');
    return {kind:'file',name:file.name,size:file.size,duration:video.duration,width:video.videoWidth,height:video.videoHeight,video,url};
  }catch(e){video.removeAttribute('src');video.load();URL.revokeObjectURL(url);throw e;}
}
export function disposeClip(clip){if(clip?.video){clip.video.pause();clip.video.removeAttribute('src');clip.video.load();URL.revokeObjectURL(clip.url);}}
export async function seekClip(clip,time,signal){
  checkAbort(signal);if(clip.kind==='demo')return;
  const t=clamp(time,0,Math.max(0,clip.duration-.025));
  if(Math.abs(clip.video.currentTime-t)<.002&&clip.video.readyState>=2)return;
  const done=waitEvent(clip.video,'seeked',signal);clip.video.currentTime=t;await done;checkAbort(signal);
}
export function makeDemoClip(side){return {kind:'demo',side,name:side==='a'?'해안 산책 · 오후':'해안 산책 · 다음 컷',duration:6,width:960,height:540,size:0};}
function demoScene(ctx,clip,t,w,h){
  ctx.save();ctx.scale(w/960,h/540);
  const cool=clip.side==='b',pan=t*7+(cool?22:0);
  const sky=ctx.createLinearGradient(0,0,0,540);sky.addColorStop(0,cool?'#b0c9d0':'#e0d1b8');sky.addColorStop(1,cool?'#dce9df':'#f0e7cb');ctx.fillStyle=sky;ctx.fillRect(0,0,960,540);
  ctx.fillStyle=cool?'#f4f1d3':'#fff2c8';ctx.beginPath();ctx.arc(742-pan*.1,118,37,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=cool?'#6b9694':'#739b8a';ctx.beginPath();ctx.moveTo(0,247);ctx.bezierCurveTo(230,280,280,208,440,245);ctx.bezierCurveTo(600,275,680,239,960,260);ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.fill();
  for(let i=0;i<16;i++){ctx.strokeStyle=`rgba(232,242,225,${.1+(i%3)*.035})`;ctx.lineWidth=2;ctx.beginPath();let y=282+i*12;ctx.moveTo((i*63+pan)%150,y);ctx.bezierCurveTo(310,y-4,530,y+6,930,y);ctx.stroke();}
  ctx.fillStyle=cool?'#759087':'#667e64';ctx.beginPath();ctx.moveTo(-40,210);ctx.lineTo(58,158);ctx.lineTo(178,211);ctx.lineTo(289,267);ctx.lineTo(374,287);ctx.lineTo(0,340);ctx.fill();
  ctx.fillStyle=cool?'#c6ba9d':'#d6c4a2';ctx.beginPath();ctx.moveTo(0,352);ctx.bezierCurveTo(380,318,430,396,960,415);ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.fill();
  ctx.fillStyle='#465e4a';ctx.beginPath();ctx.moveTo(0,450);ctx.bezierCurveTo(300,344,200,460,610,540);ctx.lineTo(0,540);ctx.fill();
  for(let i=0;i<18;i++){let x=i*28-pan*.35;ctx.fillStyle=i%2?'#738366':'#526d52';ctx.beginPath();ctx.ellipse(x,466+i%3*20,35,18,-.4,0,Math.PI*2);ctx.fill();}
  const x=535+pan,y=370;ctx.strokeStyle='#354747';ctx.lineCap='round';ctx.lineWidth=8;
  ctx.beginPath();ctx.moveTo(x,y+20);ctx.lineTo(x-5+Math.sin(t*5)*8,y+52);ctx.moveTo(x,y+20);ctx.lineTo(x+8-Math.sin(t*5)*8,y+52);ctx.stroke();
  ctx.fillStyle='#eee5cd';ctx.fillRect(x-9,y-17,18,40);ctx.fillStyle='#685444';ctx.beginPath();ctx.arc(x,y-27,8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#bc9a70';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-9,y-10);ctx.lineTo(x-16,y+10);ctx.moveTo(x+9,y-10);ctx.lineTo(x+16,y+8);ctx.stroke();ctx.restore();
}
export function renderFrame(ctx,clip,time,rect,alpha=1){
  const {x=0,y=0,w,h}=rect,scale=Math.min(w/clip.width,h/clip.height),dw=clip.width*scale,dh=clip.height*scale;
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x+(w-dw)/2,y+(h-dh)/2);
  if(clip.kind==='demo')demoScene(ctx,clip,time,dw,dh);else ctx.drawImage(clip.video,0,0,dw,dh);ctx.restore();
}
export async function sampleClip(clip,cut,side,signal,onProgress){
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=Math.max(32,Math.round(160*clip.height/clip.width));
  canvas.height=Math.min(284,canvas.height);const ctx=canvas.getContext('2d',{willReadFrequently:true}),samples=[];
  const extent=side==='a'?Math.min(.8,cut):Math.min(.8,clip.duration-cut-.025);
  if(extent<.025)throw new Error('연결 지점 앞뒤에 분석할 영상 구간을 남겨 주세요.');
  for(let i=0;i<9;i++){
    checkAbort(signal);const time=side==='a'?cut-extent+extent*i/8:cut+extent*i/8;
    await seekClip(clip,time,signal);ctx.clearRect(0,0,canvas.width,canvas.height);
    // Statistics use the full source image, without black letterbox borders.
    if(clip.kind==='demo')demoScene(ctx,clip,time,canvas.width,canvas.height);else ctx.drawImage(clip.video,0,0,canvas.width,canvas.height);
    samples.push({...describeFrame(ctx.getImageData(0,0,canvas.width,canvas.height)),time});onProgress?.(i+1,9);
    await new Promise(resolve=>setTimeout(resolve,0));
  }return samples;
}
