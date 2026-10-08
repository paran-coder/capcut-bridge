import {ADDITIONAL_ROWS} from './2026-10-08-additional-effects-v1.2.0.mjs';
const url=p=>'https://www.capcut.com/'+p;
export const SOURCES={
 transitions:url('tools/video-transition'),wipe:url('resource/wipe-transitions-in-film'),dissolve:url('resource/dissolve-transition-in-video'),motion:url('tools/motion-blur'),
 blur:url('resource/best-online-photo-editors-to-blur-background'),grain:url('resource/film-grain'),light:url('resource/film-light-leak-overlay'),noise:url('resource/old-film-noise-effects'),film:url('resource/dust-and-scratches-overlays'),cinema:url('resource/cinematic-video-editing'),color:url('resource/capcut-color-grading')
};
// Numeric values are this application's conservative starting points, not CapCut presets.
const rows=[
 ['cut','컷 + 톤 보정','Clean cut + Color adjustment','method','보정','tone','same',0,0,0,'color','기능 확인','경계의 밝기와 색감부터 맞추는 기본 방법입니다.','B 영상의 조정에서 밝기·색온도·채도를 작게 조절하고 원래 피사체 색도 확인하세요.','행동·시선·대사가 어긋난 경우에는 컷 위치를 먼저 바꾸세요.'],
 ['dissolve','디졸브','Dissolve / Cross dissolve','transition','기본','soft','unsure',.4,.15,.6,'dissolve','명칭 확인','짧은 겹침으로 화면 경계의 변화를 완화합니다.','전환에서 Dissolve를 검색해 두 클립 사이에 넣으세요.','인물과 물체가 이중으로 보이면 길이를 줄이세요.'],
 ['fade','블랙 페이드','Black Fade / Fade to black','transition','기본','break','different',.6,.3,.9,'transitions','명칭 확인','시간이나 장소가 달라질 때 짧은 쉼표를 만듭니다.','전환에서 Black Fade를 검색하고 짧은 길이부터 확인하세요.','연속 행동이나 대화에서는 흐름이 끊길 수 있습니다.'],
 ['vertical-blur','버티컬 블러','Vertical Blur','transition','블러','vertical','dynamic',.25,.15,.4,'transitions','명칭 확인','세로 움직임을 흐림으로 이어주는 전환입니다.','전환 검색창에 Vertical Blur를 입력해 적용하세요.','가로 동작이나 선명한 제품·문자 장면에서는 어울리지 않을 수 있습니다.'],
 ['shaky-inhale','셰이키 인헤일','Shaky Inhale','transition','카메라','impact','dynamic',.22,.12,.35,'transitions','명칭 확인','짧은 카메라 충격으로 경계에 리듬을 줍니다.','전환에서 Shaky Inhale을 찾아 짧게 적용하세요.','차분한 설명·인터뷰에서는 화면이 더 튀어 보일 수 있습니다.'],
 ['whirl','휠 회전 전환','Whirl','transition','회전','rotation','dynamic',.3,.18,.45,'transitions','명칭 확인','장면 변화를 회전 동작으로 강조합니다.','전환에서 Whirl을 검색하고 회전이 끝나는 지점을 확인하세요.','회전이 없는 연속 행동을 자연스럽게 복구하는 방법은 아닙니다.'],
 ['slide','슬라이드 계열','Slide','transition','이동','horizontal','dynamic',.3,.18,.45,'transitions','계열 확인','가로 이동과 다음 장면의 방향을 맞추는 전환입니다.','전환에서 Slide 계열을 찾아 원본 움직임과 같은 방향을 선택하세요.','방향이 반대이거나 움직임 추정이 불확실하면 눈으로 확인하세요.'],
 ['zoom','줌 계열','Zoom','transition','카메라','zoom','dynamic',.25,.15,.4,'transitions','계열 확인','장면 크기 변화에 짧은 확대 느낌을 더합니다.','전환에서 Zoom 계열을 선택하고 피사체 중심 위치를 맞추세요.','얼굴이나 글자가 잘릴 수 있으므로 중심을 직접 확인하세요.'],
 ['glitch-transition','글리치 전환 계열','Glitch transition','transition','왜곡','impact','dynamic',.18,.1,.3,'transitions','계열 확인','경계 변화를 짧은 디지털 왜곡으로 강조합니다.','전환의 Glitch 계열에서 가장 짧고 약한 항목부터 시도하세요.','자연스러운 일상·대화 장면에는 우선순위를 낮추세요.'],
 ['spin-3d','3D 스핀 계열','3D spin','transition','회전','rotation','dynamic',.35,.2,.5,'transitions','계열 확인','큰 장면 변화를 공간 회전으로 표현합니다.','전환에서 3D spin 계열을 찾아 두 컷의 프레임 비율을 맞추세요.','강한 스타일 전환입니다. 제품·인터뷰 연결에서는 시선을 방해할 수 있습니다.'],
 ['wipe','와이프 계열','Wipe','transition','마스크','wipe','different',.35,.2,.6,'wipe','계열 확인','화면을 덮어 새 장소나 장면으로 이동합니다.','전환에서 Wipe 계열을 선택하고 덮는 방향을 확인하세요.','이동 방향은 브라우저 추정만으로 확정하지 마세요.'],
 ['motion','모션 블러','Motion blur','effect','블러','motion','dynamic',.25,.12,.35,'motion','명칭 확인','움직임이 큰 경계에 약한 잔상을 더합니다.','경계 앞뒤를 분리하고 Video → Motion blur의 Blur를 약하게 적용하세요.','얼굴·텍스트에 잔상이 생기면 강도를 낮추거나 끄세요.'],
 ['gaussian','가우시안 블러 계열','Gaussian blur','effect','블러','soft','unsure',.2,.12,.35,'blur','계열 확인','경계 직전·직후를 잠깐 흐려 선명한 화면 변화의 충격을 줄입니다.','효과에서 Gaussian 또는 Blur 계열을 찾아 경계 주변에만 적용하세요.','오래 적용하면 초점이 나간 영상처럼 보입니다.'],
 ['radial','래디얼 블러 계열','Radial blur','effect','블러','zoom','dynamic',.22,.12,.35,'blur','계열 확인','방사형 흐림으로 짧은 확대 동작을 강조합니다.','효과에서 Radial blur 계열을 찾아 피사체 중심을 조절하세요.','배경 블러 자료에서 확인한 계열이며 실제 메뉴명은 버전에 따라 다릅니다.'],
 ['grain','필름 그레인','Film Grain','effect','필름','texture','film',.5,.25,.8,'grain','명칭 확인','두 컷에 같은 약한 질감을 더해 필름 분위기를 통일합니다.','Effects에서 Film Grain을 검색해 A/B에 같은 강도로 적용하세요.','밝기나 색감 불일치를 직접 해결하지는 않습니다.'],
 ['light-leak','라이트 리크','Light Leak','effect','빛','light','film',.3,.18,.5,'noise','명칭 확인','짧은 빛 번짐을 경계 위에 얹어 분위기를 연결합니다.','Effects에서 Light Leak을 검색해 경계 주변에만 적용하세요.','주요 피사체가 가려지거나 밝은 영역이 날아가면 강도를 낮추세요.'],
 ['edge-glow','에지 글로우 계열','Edge glow','effect','빛','light','film',.3,.18,.5,'light','계열 확인','화면 가장자리의 빛 번짐을 부드럽게 더합니다.','Effects에서 edge glow 계열을 검색하고 가장자리의 밝기를 약하게 유지하세요.','효과마다 파라미터가 다릅니다. 피사체를 가리지 않는지 확인하세요.'],
 ['lens-flare','렌즈 플레어 계열','Lens flare','effect','빛','light','film',.25,.15,.45,'cinema','계열 확인','빛 방향이 있는 장면에 짧은 광학 번짐을 더합니다.','Effects에서 lens flare 계열을 찾아 원본 빛 방향에 맞춰 배치하세요.','실제 광원 방향을 자동 분석하지 않습니다. 방향은 직접 선택하세요.'],
 ['scratches','스크래치','Scratches','effect','필름','texture','film',.5,.25,.8,'noise','명칭 확인','같은 필름 흠집 질감으로 두 컷의 스타일을 맞춥니다.','Effects에서 Scratches를 검색하고 두 컷에 약하게 적용하세요.','깨끗한 제품·문자 영상에는 적합도가 낮습니다.'],
 ['flicker','플리커','Flicker','effect','필름','flicker','film',.25,.15,.4,'noise','명칭 확인','빈티지 노출 변화를 짧게 더하는 효과입니다.','Effects에서 Flicker를 찾아 낮은 강도로 짧게 적용하세요.','밝기 차이가 큰 연결에는 우선 추천하지 않습니다. 반복 점멸을 피하세요.'],
 ['dv-tape','DV 테이프','DV Tape','effect','필름','texture','film',.5,.25,.8,'noise','명칭 확인','아날로그 테이프 질감을 A/B에 일관되게 적용합니다.','Effects에서 DV Tape를 검색하고 양쪽 클립에 같은 설정을 사용하세요.','노이즈가 많으면 세부 정보가 손실되어 보일 수 있습니다.'],
 ['film-frame','필름 프레임','Film Frame','effect','필름','frame','film',.5,.25,.8,'film','명칭 확인','동일한 프레임 테두리로 두 컷의 화면 구성을 묶습니다.','Effects에서 Film Frame을 찾아 A/B에 동일한 테두리를 적용하세요.','영상 가장자리와 자막이 잘리는지 확인하세요.'],
 ['film-overlay','필름 오버레이','Film overlay','effect','필름','texture','film',.5,.25,.8,'film','명칭 확인','필름 질감 레이어를 두 컷에 통일해 분위기를 연결합니다.','Effects에서 Film overlay를 검색하고 같은 강도를 유지하세요.','보정과 다른 역할의 질감 효과입니다. 색상 차이는 별도로 확인하세요.']
];
rows.push(...ADDITIONAL_ROWS);
const styleProfiles=new Set(['texture','light','frame','flicker','rotation','impact']);
export const CATALOG=Object.freeze(rows.map(([id,title,english,type,category,profile,mood,duration,minDuration,maxDuration,source,evidence,summary,tip,caution])=>Object.freeze({id,title,english,type,category,profile,mood,duration,minDuration,maxDuration,source:SOURCES[source],evidence,summary,tip,caution,verifiedAt:'2026-10-08',purpose:styleProfiles.has(profile)?'style':'support',purposeLabel:styleProfiles.has(profile)?'스타일 효과':'연결 보조',kind:type==='transition'?'전환':type==='effect'?'효과':'편집 방법',preview:['dissolve','fade'].includes(id)?id:'none',parameterNote:'수치는 자체 휴리스틱 시작값입니다. 상대 강도는 효과 슬라이더 전체 범위의 비율이며, 지원하지 않는 조절은 생략하세요.'})));
export function filterCatalog({query='',type='all',category='all',purpose='all'}={}){
 const q=query.trim().toLocaleLowerCase();return CATALOG.filter(x=>(type==='all'||x.type===type)&&(category==='all'||x.category===category)&&(purpose==='all'||x.purpose===purpose)&&(!q||[x.title,x.english,x.category,x.summary].join(' ').toLocaleLowerCase().includes(q)));
}
