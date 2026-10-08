import {rankCatalog} from './2026-10-08-ranking-v1.2.0.mjs';
export const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
export function describeFrame({data,width,height}) {
  if(!width||!height||data.length!==width*height*4) throw new Error('유효한 프레임이 필요합니다.');
  let r=0,g=0,b=0,sat=0,sq=0,lum=0;
  const grid=new Array(16*9).fill(0),counts=new Array(16*9).fill(0);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4,R=data[i]/255,G=data[i+1]/255,B=data[i+2]/255;
    const L=.2126*R+.7152*G+.0722*B;
    r+=R;g+=G;b+=B;lum+=L;sq+=L*L;
    const high=Math.max(R,G,B),low=Math.min(R,G,B);
    sat+=high?(high-low)/high:0;
    const cell=Math.min(8,Math.floor(y/height*9))*16+Math.min(15,Math.floor(x/width*16));
    grid[cell]+=L;counts[cell]++;
  }
  const n=width*height,l=lum/n;
  return {r:r/n,g:g/n,b:b/n,luma:l,saturation:sat/n,contrast:Math.sqrt(Math.max(0,sq/n-l*l)),grid:grid.map((v,i)=>v/(counts[i]||1))};
}
export function compareFrames(a,b) {
  const brightness=Math.abs(a.luma-b.luma)*100;
  const color=(Math.abs((a.r-a.g)-(b.r-b.g))+Math.abs((a.b-a.g)-(b.b-b.g)))*50;
  const structure=mean(a.grid.map((v,i)=>Math.abs((v-a.luma)-(b.grid[i]-b.luma))))*180;
  return {brightness:clamp(brightness,0,100),color:clamp(color,0,100),structure:clamp(structure,0,100),saturation:Math.abs(a.saturation-b.saturation)*100};
}
function estimateMotion(frames) {
  const parts=[];
  for(let k=1;k<frames.length;k++){
    const a=frames[k-1],b=frames[k];
    function error(dx,dy){let sum=0,n=0;for(let y=2;y<7;y++)for(let x=3;x<13;x++){
      sum+=Math.abs((a.grid[y*16+x]-a.luma)-(b.grid[(y+dy)*16+x+dx]-b.luma));n++;
    }return sum/n;}
    let best=error(0,0),zero=best,dx=0,dy=0;
    for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++){const e=error(x,y);if(e<best-.0001){best=e;dx=x;dy=y;}}
    const reliable=zero>.012&&mean([a.contrast,b.contrast])>.025&&(zero-best)/zero>.22;
    parts.push({dx,dy,reliable,amount:clamp(zero*250,0,100)});
  }
  const good=parts.filter(v=>v.reliable);
  return {amount:mean(parts.map(v=>v.amount)),dx:good.length?mean(good.map(v=>v.dx)):0,dy:good.length?mean(good.map(v=>v.dy)):0,reliable:good.length>=Math.ceil(parts.length/2)};
}
export function analyzePair(a,b) {
  if(a.length<2||b.length<2) throw new Error('각 영상에서 최소 두 프레임이 필요합니다.');
  const A=a.at(-1),B=b[0],d=compareFrames(A,B),motionA=estimateMotion(a),motionB=estimateMotion(b);
  const motion=clamp(Math.abs(motionA.amount-motionB.amount),0,100);
  const opposed=motionA.reliable&&motionB.reliable&&(motionA.dx*motionB.dx+motionA.dy*motionB.dy)<-1;
  const cost=(x,y)=>{const q=compareFrames(x,y);return q.brightness*.35+q.color*.25+q.structure*.4;};
  const originalCost=cost(A,B);let candidate={a:A.time,b:B.time,cost:originalCost,gain:0};
  for(const x of a.slice(-5))for(const y of b.slice(0,5)){
    const raw=cost(x,y),penalty=(Math.abs(A.time-x.time)+Math.abs(y.time-B.time))*5;
    if(raw+penalty<candidate.cost)candidate={a:x.time,b:y.time,cost:raw+penalty,gain:originalCost-raw};
  }
  const change=Math.round(clamp(d.brightness*.32+d.color*.25+d.structure*.25+motion*.18+(opposed?8:0),0,100));
  return {...d,motion,motionA,motionB,opposed,change,candidate,frameA:A,frameB:B,sampleCount:a.length+b.length};
}
export function transitionLimit(a,b){return Math.floor(Math.max(0,Math.min(Number(a)||0,Number(b)||0,1.2))*100)/100;}
export const recommendAll=rankCatalog;
export function recommend(report,options={}) { return rankCatalog(report,options).slice(0,3); }
