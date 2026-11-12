'use strict';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEY = 'bedroom-dashboard-v1';
const initial = {
  lights: [
    {id:'main',name:'Main lights',icon:'bulb',on:true,brightness:80,color:'#f4ce91'},
    {id:'accent',name:'Accent lights',icon:'strip',on:true,brightness:60,color:'#b3a0e1'},
    {id:'bed',name:'Under-bed lights',icon:'bed',on:true,brightness:35,color:'#dda797'},
    {id:'lamp',name:'Lamp lights',icon:'lamp',on:false,brightness:50,color:'#f4ce91'}
  ], ac:{on:true,temp:70,mode:'Cool'}, music:{track:0,progress:92,volume:45}, scene:null
};
const presets = [
  {name:'Warm white',color:'#f4ce91'}, {name:'Daylight',color:'#e5ecff'},
  {name:'Lavender',color:'#b3a0e1'}, {name:'Rose',color:'#dda797'},
  {name:'Ocean',color:'#8abbdc'}, {name:'Mint',color:'#9ec9ac'}
];
const tracks = [
  {title:'Weightless',artist:'Marconi Union',duration:480},
  {title:'A Walk',artist:'Tycho',duration:316},
  {title:'Sunset Lover',artist:'Petit Biscuit',duration:237}
];
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const safeNumber = (n,fallback,min,max) => Number.isFinite(n) ? clamp(n,min,max) : fallback;
let state = structuredClone(initial);
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && typeof saved === 'object') {
    state.lights = initial.lights.map((light,i) => {
      const s = saved.lights?.[i]; if(!s) return {...light};
      return {...light,on:typeof s.on === 'boolean'?s.on:light.on,
        brightness:safeNumber(s.brightness,light.brightness,1,100),
        color:typeof s.color === 'string' && /^#[0-9a-f]{6}$/i.test(s.color)?s.color:light.color};
    });
    state.ac = {on:typeof saved.ac?.on==='boolean'?saved.ac.on:true,temp:Math.round(safeNumber(saved.ac?.temp,70,60,86)),mode:['Cool','Auto','Fan'].includes(saved.ac?.mode)?saved.ac.mode:'Cool'};
    state.music = {track:Math.floor(safeNumber(saved.music?.track,0,0,tracks.length-1)),progress:safeNumber(saved.music?.progress,92,0,480),volume:safeNumber(saved.music?.volume,45,0,100)};
    state.scene = ['relax','focus','night','off'].includes(saved.scene)?saved.scene:null;
  }
} catch (_) { /* Private browsing and file URLs may not offer persistent storage. */ }
let playing=false, selectedLight=null, toastTimer;
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){}}
function icon(name){return `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;}
function rangeFill(input){const min=Number(input.min)||0,max=Number(input.max)||100;input.style.setProperty('--fill',`${(Number(input.value)-min)/(max-min)*100}%`);}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function clearScene(){state.scene=null;renderScenes();}
function renderScenes(){$$('[data-scene]').forEach(button=>{const active=button.dataset.scene===state.scene;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}
function renderLights(){
  if (!$('#light-grid').children.length) {
    $('#light-grid').innerHTML=state.lights.map(light=>`<div class="light-card" data-card="${light.id}"><div class="tile-fill"></div><div class="light-open"><span class="light-symbol">${icon(light.icon)}</span><strong>${light.name}</strong><small></small></div><input class="tile-brightness" data-brightness="${light.id}" type="range" min="0" max="100" aria-label="${light.name} brightness"><button class="light-toggle" data-toggle="${light.id}" aria-label="${light.name} power"></button><button class="color-button" data-light="${light.id}" aria-label="Adjust ${light.name} color">${icon('spark')}</button></div>`).join('');
  }
  state.lights.forEach(light=>{
    const card=$(`[data-card="${light.id}"]`), value=light.on?light.brightness:0;
    card.classList.toggle('is-on',light.on);
    card.style.setProperty('--light-color',light.color);
    card.style.setProperty('--brightness',value+'%');
    card.querySelector('small').textContent=light.on?value+'% brightness':'Off';
    card.querySelector('input').value=value;
    card.querySelector('[data-toggle]').setAttribute('aria-pressed',String(light.on));
  });
  const on=state.lights.filter(light=>light.on);
  $('#light-count').textContent=`${on.length} on`;
  const average=on.length?Math.round(on.reduce((sum,l)=>sum+l.brightness,0)/on.length):0;
  $('#room-level').textContent=average+'%';$('#room-brightness').value=average;rangeFill($('#room-brightness'));
}
// Keep range nodes stable during pointer capture and keyboard adjustment.
$('#light-grid').addEventListener('input',event=>{
  const id=event.target.dataset.brightness;if(!id)return;
  const light=state.lights.find(l=>l.id===id),value=Number(event.target.value);
  light.on=value>0;if(value>0)light.brightness=value;
  clearScene();save();renderLights();
});
// Drag from the existing value: touching the box never jumps brightness.
let brightnessDrag=null;
document.addEventListener('pointerdown',event=>{
  const input=event.target.closest('.tile-brightness, #room-brightness, #light-brightness');
  if(!input||!event.isPrimary||event.button!==0)return;
  event.preventDefault();input.focus({preventScroll:true});
  brightnessDrag={input,id:event.pointerId,x:event.clientX,value:Number(input.value),width:input.getBoundingClientRect().width};
  input.setPointerCapture(event.pointerId);
});
document.addEventListener('pointermove',event=>{
  const drag=brightnessDrag;if(!drag||drag.id!==event.pointerId)return;
  const min=Number(drag.input.min),max=Number(drag.input.max);
  const value=Math.round(clamp(drag.value+(event.clientX-drag.x)/drag.width*(max-min),min,max));
  if(value!==Number(drag.input.value)){
    drag.input.value=value;drag.input.dispatchEvent(new Event('input',{bubbles:true}));
  }
});
function endBrightnessDrag(event){
  if(!brightnessDrag||brightnessDrag.id!==event.pointerId)return;
  const {input,id}=brightnessDrag;brightnessDrag=null;
  if(input.hasPointerCapture(id))input.releasePointerCapture(id);
}
document.addEventListener('pointerup',endBrightnessDrag);
document.addEventListener('pointercancel',endBrightnessDrag);
document.addEventListener('lostpointercapture',endBrightnessDrag);
$('#light-grid').addEventListener('click',event=>{
  const toggle=event.target.closest('[data-toggle]');
  if(toggle){const light=state.lights.find(l=>l.id===toggle.dataset.toggle);light.on=!light.on;clearScene();save();renderLights();$(`[data-toggle="${light.id}"]`).focus({preventScroll:true});return;}
  const button=event.target.closest('[data-light]');
  if(button){selectedLight=state.lights.find(l=>l.id===button.dataset.light);renderLightDialog();$('#light-dialog').showModal();}
});
function renderLightDialog(){
  const light=selectedLight;if(!light)return;
  $('#dialog-title').textContent=light.name;$('#light-dialog').setAttribute('aria-labelledby','dialog-title');
  $('#modal-icon').innerHTML=icon(light.icon);$('#modal-icon').style.color=light.color;
  $('#modal-power').setAttribute('aria-pressed',String(light.on));$('#modal-power').setAttribute('aria-label',light.name+' power');
  $('#light-brightness').value=light.brightness;rangeFill($('#light-brightness'));$('#light-level').textContent=light.brightness+'%';
  $('#color-name').textContent=presets.find(p=>p.color===light.color)?.name||'Custom';$('#custom-color').value=light.color;
  $('#swatches').innerHTML=presets.map(p=>`<button class="swatch ${p.color===light.color?'selected':''}" style="--swatch:${p.color}" data-color="${p.color}" aria-label="${p.name}" aria-pressed="${p.color===light.color}"><span></span></button>`).join('');
}
function updateLight(){clearScene();save();renderLights();renderLightDialog();}
$('#modal-power').addEventListener('click',()=>{selectedLight.on=!selectedLight.on;updateLight();});
$('#light-brightness').addEventListener('input',event=>{selectedLight.brightness=Number(event.target.value);selectedLight.on=true;clearScene();save();renderLights();$('#light-level').textContent=selectedLight.brightness+'%';$('#modal-power').setAttribute('aria-pressed','true');rangeFill(event.target);});
$('#swatches').addEventListener('click',event=>{const button=event.target.closest('[data-color]');if(button){selectedLight.color=button.dataset.color;selectedLight.on=true;updateLight();$('#swatches').querySelector(`[data-color="${selectedLight.color}"]`).focus({preventScroll:true});}});
$('#custom-color').addEventListener('input',event=>{selectedLight.color=event.target.value;selectedLight.on=true;updateLight();});
$('#light-dialog').addEventListener('click',event=>{if(event.target!==$('#light-dialog'))return;const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();});
$('#light-dialog').addEventListener('close',()=>{if(selectedLight)$(`[data-light="${selectedLight.id}"]`).focus({preventScroll:true});});
$('#room-brightness').addEventListener('input',event=>{
  const value=Number(event.target.value), anyOn=state.lights.some(l=>l.on);
  state.lights.forEach(light=>{if(value===0)light.on=false;else if(light.on||!anyOn){light.on=true;light.brightness=value;}});
  clearScene();save();renderLights();
});
$$('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
  state.scene=button.dataset.scene;
  const sceneSettings={relax:[[65,'#f4ce91'],[40,'#dda797'],[30,'#dda797'],[35,'#f4ce91']],focus:[[100,'#e5ecff'],[70,'#e5ecff'],[0,'#e5ecff'],[85,'#e5ecff']],night:[[0,'#f4ce91'],[10,'#b3a0e1'],[15,'#dda797'],[0,'#f4ce91']],off:[[0],[0],[0],[0]]};
  state.lights.forEach((light,i)=>{const [brightness,color]=sceneSettings[state.scene][i];light.on=brightness>0;if(brightness)light.brightness=brightness;if(color)light.color=color;});
  save();renderLights();renderScenes();toast({relax:'Relax scene · Settle in',focus:'Focus scene · A fresh start',night:'Good night · Lights softened',off:'All bedroom lights are off'}[state.scene]);
}));
function renderClimate(){
  const {on,temp,mode}=state.ac;
  $('#ac-power').setAttribute('aria-pressed',String(on));$('#temperature').textContent=temp;
  $('#ac-status').textContent=!on?'Powered off':mode==='Fan'?'Circulating air':`${mode==='Auto'?'Auto · Set to':'Cooling to'} ${temp}°`;
  $('#ac-mode-label').textContent=!on?'Off':mode==='Fan'?'Fan only':mode==='Auto'?'Auto mode':'Cooling';
  $('#thermostat').classList.toggle('off',!on);
  $('#temp-down').disabled=!on||mode==='Fan'||temp<=60;$('#temp-up').disabled=!on||mode==='Fan'||temp>=86;
  $$('[data-mode]').forEach(button=>{button.classList.toggle('active',button.dataset.mode===mode);button.setAttribute('aria-pressed',String(button.dataset.mode===mode));});
}
$('#ac-power').addEventListener('click',()=>{state.ac.on=!state.ac.on;save();renderClimate();});
$('#temp-down').addEventListener('click',()=>{state.ac.temp=clamp(state.ac.temp-1,60,86);save();renderClimate();});
$('#temp-up').addEventListener('click',()=>{state.ac.temp=clamp(state.ac.temp+1,60,86);save();renderClimate();});
$$('[data-mode]').forEach(button=>button.addEventListener('click',()=>{state.ac.mode=button.dataset.mode;state.ac.on=true;save();renderClimate();}));
function formatTime(seconds){const whole=Math.floor(seconds);return `${Math.floor(whole/60)}:${String(whole%60).padStart(2,'0')}`;}
function renderProgress(){const track=tracks[state.music.track];state.music.progress=clamp(state.music.progress,0,track.duration);$('#track-progress').max=track.duration;$('#track-progress').value=state.music.progress;rangeFill($('#track-progress'));$('#elapsed').textContent=formatTime(state.music.progress);$('#remaining').textContent='−'+formatTime(track.duration-state.music.progress);}
function renderMusic(){const track=tracks[state.music.track];$('#track-title').textContent=track.title;$('#track-artist').textContent=track.artist;$('#play').innerHTML=icon(playing?'pause':'play');$('#play').setAttribute('aria-label',playing?'Pause':'Play');$('#play').setAttribute('aria-pressed',String(playing));$('#equalizer').classList.toggle('playing',playing);$('#volume').value=state.music.volume;$('#volume-label').textContent=state.music.volume+'%';rangeFill($('#volume'));renderProgress();}
$('#play').addEventListener('click',()=>{playing=!playing;renderMusic();if(playing)toast('Demo playback · No audio connected');});
function changeTrack(direction){state.music.track=(state.music.track+direction+tracks.length)%tracks.length;state.music.progress=0;save();renderMusic();}
$('#next').addEventListener('click',()=>changeTrack(1));$('#previous').addEventListener('click',()=>changeTrack(-1));
$('#track-progress').addEventListener('input',event=>{state.music.progress=Number(event.target.value);save();renderProgress();});
$('#volume').addEventListener('input',event=>{state.music.volume=Number(event.target.value);$('#volume-label').textContent=state.music.volume+'%';rangeFill(event.target);save();});
setInterval(()=>{if(!playing)return;state.music.progress++;if(state.music.progress>=tracks[state.music.track].duration)changeTrack(1);else renderProgress();if(state.music.progress%5===0)save();},1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
function updateClock(){const now=new Date(),hour=now.getHours();$('#greeting').innerHTML=`Good ${hour<12?'morning':hour<18?'afternoon':'evening'}<span>.</span>`;$('#date').textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(now);$('#clock').textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(now);}
$$('[data-nav]').forEach(button=>button.addEventListener('click',()=>{
  $$('[data-nav]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-current',b===button?'true':'false');});
  const target=$('#'+button.dataset.nav);target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:button.dataset.nav==='home'?'start':'center'});
  if(button.dataset.nav!=='home'){target.classList.remove('section-flash');requestAnimationFrame(()=>target.classList.add('section-flash'));setTimeout(()=>target.classList.remove('section-flash'),1100);}
}));
$('#night-mode').addEventListener('click',()=>{const dimmed=document.body.classList.toggle('dimmed');$('#night-mode').setAttribute('aria-pressed',String(dimmed));$('#night-mode').setAttribute('aria-label',dimmed?'Restore display brightness':'Dim display');});
renderLights();renderScenes();renderClimate();renderMusic();updateClock();setInterval(updateClock,30000);
