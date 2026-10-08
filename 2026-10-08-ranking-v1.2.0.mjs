import {CATALOG} from './2026-10-08-catalog-v1.2.0.mjs';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export function rankCatalog(r,{intent='unsure',mood='natural',availableA=2,availableB=2}={}){
 const max=Math.floor(Math.max(0,Math.min(availableA,availableB,1.2))*100)/100;
 const amount=Math.max(r.motionA.amount,r.motionB.amount),known=r.motionA.reliable||r.motionB.reliable;
 const dx=Math.max(Math.abs(r.motionA.dx),Math.abs(r.motionB.dx)),dy=Math.max(Math.abs(r.motionA.dy),Math.abs(r.motionB.dy));
 const adjustments={brightness:Math.round(clamp((r.frameA.luma-r.frameB.luma)*40,-25,25)),temperature:Math.round(clamp(((r.frameA.r-r.frameA.b)-(r.frameB.r-r.frameB.b))*25,-20,20)),saturation:Math.round(clamp((r.frameA.saturation-r.frameB.saturation)*25,-15,15))};
 return CATALOG.map((entry,index)=>{
   let score=35,reason=entry.summary;
   const match={tone:16+Math.max(r.brightness,r.color)*.4,soft:12+r.structure*.25,break:intent==='different'?40+r.change*.35:0,vertical:known&&dy>dx?amount*.45:0,horizontal:known&&dx>=dy?amount*.45:0,motion:amount*.6,impact:amount*.3,rotation:r.structure*.2,zoom:r.structure*.25,wipe:intent==='different'?25:0,texture:r.color*.15,light:r.brightness*.2,flicker:r.brightness>12?-15:0,frame:0};
   score+=match[entry.profile]||0;
   if(mood==='natural'){score+=entry.id==='cut'?23:entry.id==='dissolve'?25:entry.id==='fade'?8:entry.id==='motion'?0:-22;}
   if(mood==='dynamic'){score+=['horizontal','vertical','motion','zoom','impact'].includes(entry.profile)?25:entry.profile==='rotation'?16:-5;}
   if(mood==='film'){score+=['texture','light','frame'].includes(entry.profile)?25:entry.profile==='soft'||entry.profile==='break'?10:-10;}
   if(entry.purpose==='style'&&mood==='natural')score-=15;
   if(entry.mood==='dynamic'&&mood==='dynamic'&&entry.purpose==='style')score+=8+amount*.12;
   if(intent==='same'&&entry.profile==='tone')score+=20;
   if(r.change<8&&intent!=='different'&&mood==='natural'&&entry.id==='cut')score=99;
   if(r.opposed&&entry.id==='cut'){score+=16;reason='이동 방향이 반대로 추정됩니다. 전환 선택 전에 컷 위치와 동작 방향을 확인하세요.';}
   if(entry.type==='transition'&&max<entry.minDuration)score-=28;
   if(entry.profile==='motion'&&amount<12)score-=25;
   if(['texture','frame'].includes(entry.profile)&&mood!=='film')score-=18;
   if(['impact','rotation','flicker'].includes(entry.profile)&&mood==='natural')score-=15;
   const desired=entry.type==='transition'?(amount>30?Math.min(entry.duration,.25):entry.duration):0;
   const duration=Math.min(max,desired);
   const safeStarts={'shake-2':7,diamond:8,explosion:6,disco:6,'to-color':8,'sunset-light':10,neon:8,halo:10,beam:7,flames:6,'retro-dv-3':8,'vintage-flash':5,noise:6,'videotape-iii':8};
   const strength=entry.type==='effect'?Math.round(clamp(safeStarts[entry.id]??(entry.profile==='motion'?amount*.35:entry.profile==='texture'?8:entry.profile==='frame'?15:12),5,20)):0;
   const span=entry.type==='effect'?Math.min(max,entry.duration):0;
   const evidence=`밝기 차이 ${Math.round(r.brightness)}/100 · 색감 차이 ${Math.round(r.color)}/100 · 화면 구조 차이 ${Math.round(r.structure)}/100 · 경계 움직임 ${Math.round(amount)}/100`;
   const preferences=`${mood==='natural'?'자연스러운 연결':mood==='dynamic'?'리듬감 있는 연결':'필름 분위기'} 기준`;
   const parameters=entry.type==='effect'?[{label:'효과 상대 강도',value:`${strength}%`},{label:'적용 구간',value:['texture','frame'].includes(entry.profile)?'A/B에 동일하게 적용':`경계 앞뒤 각 ${span.toFixed(2)}초`}]:entry.type==='transition'&&['horizontal','vertical','wipe'].includes(entry.profile)?[{label:'방향',value:known&&!r.opposed?(dx>=dy?'가로 방향 · 원본 동작과 맞춤':'세로 방향 · 원본 동작과 맞춤'):'직접 확인 후 선택'}]:[];
   return {...entry,score:Math.round(clamp(score,0,99)),order:index,duration,maxDuration:max,adjustments,strength,span,parameters,why:reason,reasonEvidence:`${entry.purposeLabel} · ${preferences}. ${evidence}`,caution:entry.caution+(entry.type==='transition'&&max<entry.minDuration?' 사용 가능한 구간이 짧아 권장 길이를 확보하기 어렵습니다. 컷을 우선 확인하세요.':''),fit:score>=70?'우선 검토':score>=45?'조건부 검토':'스타일 확인 필요'};
 }).sort((a,b)=>b.score-a.score||a.order-b.order);
}
