function formatMMSS(sec){sec=Math.max(0,Math.floor(sec));const m=Math.floor(sec/60);const s=sec%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
// ===== Router =====
const sections = { login: 'route-login', home:'route-home', game:'route-game', results:'route-results' };
function goto(hash){ location.hash = hash; renderRoute(); }
function renderRoute(){
  const hash = location.hash || '#/login';
  const isLogged = !!currentUser();
  if(!isLogged && hash !== '#/login'){ location.hash = '#/login'; }
  const h = location.hash || '#/login';
  Object.values(sections).forEach(id=>document.getElementById(id).classList.add('hidden'));
  document.getElementById('topbar').classList.toggle('hidden', h==="#/login");
  if(h==="#/login"){ document.getElementById(sections.login).classList.remove('hidden'); }
  if(h==="#/home"){ document.getElementById(sections.home).classList.remove('hidden'); refreshHome(); }
  if(h==="#/game"){ document.getElementById(sections.game).classList.remove('hidden'); layoutCanvas(); loadProfileToGame(); }
  if(h==="#/results"){ document.getElementById(sections.results).classList.remove('hidden'); renderStudents(); renderResults(); }
}
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.goto)));

// ===== Storage =====
const STUDENT_KEY='edukeys_students_v3';
const RESULTS_KEY='edukeys_results_v3';
function loadStudents(){ try{return JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]')}catch(e){return []} }
function saveStudents(list){ localStorage.setItem(STUDENT_KEY, JSON.stringify(list)); }
function loadResults(){ try{return JSON.parse(localStorage.getItem(RESULTS_KEY)||'[]')}catch(e){return []} }
function saveResults(list){ localStorage.setItem(RESULTS_KEY, JSON.stringify(list)); }
function currentUser(){ try{ return JSON.parse(localStorage.getItem('edukeys_current_user')||'null'); }catch(e){ return null; } }
function setCurrentUser(u){ localStorage.setItem('edukeys_current_user', JSON.stringify(u)); }

// ===== Login =====
const elFirst = document.getElementById('inFirst');
const elLast = document.getElementById('inLast');
const elClass = document.getElementById('inClass');
const elNo = document.getElementById('inNo');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const tblStudentsLogin = document.getElementById('tblStudentsLogin');

function renderStudentsLogin(){ tblStudentsLogin.innerHTML=''; loadStudents().slice(-10).reverse().forEach(s=>{
  const tr=document.createElement('tr'); tr.innerHTML = `<td>${s.first} ${s.last}</td><td>${s.className}</td><td>${s.no}</td><td>${s.time}</td>`; tblStudentsLogin.appendChild(tr);
}); }

btnLogin.addEventListener('click', ()=>{
  const first=(elFirst.value||'').trim(); const last=(elLast.value||'').trim(); const className=(elClass.value||'').trim(); const no=(elNo.value||'').trim();
  if(!first||!last||!className||!no){ alert('กรอกข้อมูลให้ครบ: ชื่อ นามสกุล ชั้น เลขที่'); return; }
  const profile={ first,last,className,no, time:new Date().toLocaleString() };
  const list=loadStudents(); list.push(profile); saveStudents(list); setCurrentUser(profile);
  renderStudentsLogin(); elFirst.value=elLast.value=elClass.value=elNo.value='';
  goto('#/home');
});
btnLogout.addEventListener('click', ()=>{ localStorage.removeItem('edukeys_current_user'); goto('#/login'); });

// Export/Clear (Login page)
document.getElementById('btnExportStudentsLogin').addEventListener('click', ()=>{
  const ws=XLSX.utils.json_to_sheet(loadStudents()); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Students'); XLSX.writeFile(wb, 'students.xlsx');
});
document.getElementById('btnClearStudentsLogin').addEventListener('click', ()=>{ if(confirm('ลบรายชื่อทั้งหมด?')){ saveStudents([]); renderStudentsLogin(); }});

// ===== Home =====
const who = document.getElementById('who');
const tblLatest = document.getElementById('tblLatest');
const minScoreHome = document.getElementById('minScoreHome');
const minAccHome = document.getElementById('minAccHome');

function refreshHome(){
  const u=currentUser(); if(!u) return;
  who.textContent = `${u.first} ${u.last} (${u.className} เลขที่ ${u.no})`;
  tblLatest.innerHTML='';
  loadResults().slice(-8).reverse().forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${r.time}</td><td>${r.name}</td><td>${r.score}</td><td>${r.acc}%</td><td><span class="badge ${r.pass?'pass':'fail'}">${r.pass?'ผ่าน':'ไม่ผ่าน'}</span></td>`;
    tblLatest.appendChild(tr);
  });
}

document.getElementById('btnExportResultsHome').addEventListener('click', ()=>{
  const ws=XLSX.utils.json_to_sheet(loadResults()); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Results'); XLSX.writeFile(wb, 'results.xlsx');
});
document.getElementById('btnClearResultsHome').addEventListener('click', ()=>{ if(confirm('ลบผลทั้งหมด?')){ saveResults([]); refreshHome(); }});

// ===== Results page =====
const tblStudents = document.getElementById('tblStudents');
const tblResults = document.getElementById('tblResults');
function renderStudents(){ tblStudents.innerHTML=''; loadStudents().forEach(s=>{
  const tr=document.createElement('tr'); tr.innerHTML = `<td>${s.first} ${s.last}</td><td>${s.className}</td><td>${s.no}</td><td>${s.time}</td>`; tblStudents.appendChild(tr); }); }
function renderResults(){ tblResults.innerHTML=''; loadResults().forEach(r=>{
  const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.time}</td><td>${r.name}</td><td>${r.mode}</td><td>${r.score}</td><td>${r.miss}</td><td>${r.acc}%</td><td>${r.wpm}</td><td><span class="badge ${r.pass?'pass':'fail'}">${r.pass?'ผ่าน':'ไม่ผ่าน'}</span></td>`; tblResults.appendChild(tr); }); }
document.getElementById('btnExportStudents').addEventListener('click', ()=>{ const ws=XLSX.utils.json_to_sheet(loadStudents()); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Students'); XLSX.writeFile(wb, 'students.xlsx'); });
document.getElementById('btnExportResults').addEventListener('click', ()=>{ const ws=XLSX.utils.json_to_sheet(loadResults()); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Results'); XLSX.writeFile(wb, 'results.xlsx'); });
document.getElementById('btnClearStudents').addEventListener('click', ()=>{ if(confirm('ลบรายชื่อทั้งหมด?')){ saveStudents([]); renderStudents(); }});
document.getElementById('btnClearResults').addEventListener('click', ()=>{ if(confirm('ลบผลทั้งหมด?')){ saveResults([]); renderResults(); }});

// ===== Fullscreen Game =====
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const modeEl = document.getElementById('mode');
const diffEl = document.getElementById('difficulty');
const timeEl = document.getElementById('timeLimit');
const wordSetEl = document.getElementById('wordSet');
const studentNameEl = document.getElementById('studentName');
const minScoreEl = document.getElementById('minScore');
const minAccEl = document.getElementById('minAcc');
const wordInputFS = document.getElementById('wordInputFS');
const wrapWordInput = document.getElementById('wrapWordInput');

const statTime=document.getElementById('statTime');
const statScore=document.getElementById('statScore');
const statMiss=document.getElementById('statMiss');
const statAcc=document.getElementById('statAcc');
const statSpeed=document.getElementById('statSpeed');

const btnStart=document.getElementById('btnStart');
const btnPause=document.getElementById('btnPause');
const btnReset=document.getElementById('btnReset');
const btnBackHome=document.getElementById('btnBackHome');

const kbd = document.getElementById('kbd');
const keyEls = {}; const kbdRows = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=', 'Backspace'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
  ['CapsLock','A','S','D','F','G','H','J','K','L',';','\'','Enter'],
  ['Shift','Z','X','C','V','B','N','M',',','.','/','Shift','Space','Space']
];
function buildKeyboard(){ kbd.innerHTML=''; for(const k in keyEls){ delete keyEls[k]; } kbdRows.flat().forEach(k=>{ const el=document.createElement('div'); el.className='key'; el.textContent=k.length>8?k.slice(0,8)+'…':k; kbd.appendChild(el); keyEls[k.toLowerCase()] = el; }); }
buildKeyboard();
function flashKey(code){ const map={ ' ':'space','enter':'enter','shiftleft':'shift','shiftright':'shift','capslock':'capslock','tab':'tab','backspace':'backspace' }; const id=(map[code]||code).toLowerCase(); for(const k in keyEls){ keyEls[k].classList.remove('hit'); } if(keyEls[id]){ keyEls[id].classList.add('hit'); setTimeout(()=>keyEls[id].classList.remove('hit'),120) } }

const wordSets={
  basic:['cat','dog','tree','game','code','book','home','fast','blue','light','space','star','moon','sun','note','class','study','learn','type','skill'],
  tech:['keyboard','monitor','router','python','javascript','binary','server','client','socket','packet','cookie','canvas','vector','matrix','compute','storage','upload','download','cache','thread'],
  thai:['robot','system','data','digital','signal','sensor','model','project','online','submit','score','credit','profile','record','classroom','module','topic','lesson','review','quiz']
}

let running=false, paused=false, over=false; let timeLeft=60, score=0, miss=0, total=0; let spawnTimer=0; let objects=[]; let currentTarget=''; let lastTime=0; let typedBuffer='';

function layoutCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; drawBackdrop(); }
addEventListener('resize', layoutCanvas);

function loadProfileToGame(){
  const u=currentUser(); if(!u){ goto('#/login'); return; }
  studentNameEl.value = `${u.first} ${u.last} (${u.className} เลขที่ ${u.no})`;
  if(minScoreHome.value) minScoreEl.value = parseInt(minScoreHome.value,10)||25;
  if(minAccHome.value) minAccEl.value = parseInt(minAccHome.value,10)||85;
  reset();
}

function clearCanvas(){ ctx.clearRect(0,0,canvas.width,canvas.height); }
function drawBackdrop(){
  const grd=ctx.createRadialGradient(canvas.width/2,80,80, canvas.width/2,80,Math.max(canvas.width,canvas.height));
  grd.addColorStop(0,'rgba(120,140,255,.25)'); grd.addColorStop(1,'rgba(10,14,34,0)');
  ctx.fillStyle=grd; ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<120;i++){ const x=Math.random()*canvas.width; const y=Math.random()*canvas.height; const r=Math.random()*1.8+0.2; ctx.fillStyle='rgba(255,255,255,'+(Math.random()*0.8+0.2)+')'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
}

function reset(){ running=false; paused=false; over=false; timeLeft=parseInt(timeEl.value,10); score=0; miss=0; total=0; spawnTimer=0; objects.length=0; currentTarget=''; typedBuffer=''; updateStats(); clearCanvas(); drawBackdrop(); if(modeEl.value==='words') pickWord(); toggleWordInput(); }
function start(){ if(over) reset(); running=true; paused=false; lastTime=performance.now(); loop(); }
function pause(){ paused=!paused; if(!paused){ lastTime=performance.now(); loop(); } }

function updateStats(){
  statTime.textContent = formatMMSS(timeLeft); statScore.textContent=score; statMiss.textContent=miss;
  const acc = total? Math.max(0, Math.round((score/total)*100)) : 100; statAcc.textContent=acc+"%";
  const elapsed = parseInt(timeEl.value,10)-timeLeft; const wpm = (modeEl.value==='words' && elapsed>0)? Math.round((score/(elapsed/60))): Math.round(((score)/(elapsed/60)) / 5 ); statSpeed.textContent=isFinite(wpm)&&wpm>=0? wpm : 0;
  const minS=parseInt(minScoreEl.value||'0',10); const minA=parseInt(minAccEl.value||'0',10); const pass = (score>=minS) && (acc>=minA);
  const chip = statScore.parentElement; chip.style.background = pass? '#103522' : '#3a1212'; chip.style.borderColor = pass? '#1e6b4a' : '#7a2a2a';
}

function toggleWordInput(){ const show = (modeEl.value==='words'); wrapWordInput.style.display = show? 'block':'none'; wordInputFS.value=''; typedBuffer=''; if(show){ wordInputFS.focus(); } }

function spawnObject(dt){
  const diff = diffEl.value; const base = (modeEl.value==='letters')? 800:1200; const mult = diff==='easy'?1.3 : diff==='hard'?0.75 : 1; const threshold = base*mult; spawnTimer += dt;
  if(spawnTimer>=threshold){ spawnTimer=0; if(modeEl.value==='letters'){ const char = String.fromCharCode(65+Math.floor(Math.random()*26)); const speed = (diff==='easy'? 90 : diff==='hard'? 170 : 130) + Math.random()*40; objects.push({type:'letter', char, x:60+Math.random()*(canvas.width-120), y:-20, speed}); } else { const word=currentTarget||pickWord(); const speed = (diff==='easy'? 60 : diff==='hard'? 110 : 85); objects.push({type:'word', word, x:60+Math.random()*(canvas.width-220), y:-30, speed}); currentTarget=''; } }
}

function pickWord(){ const list = wordSets[wordSetEl.value]; const w = list[Math.floor(Math.random()*list.length)]; currentTarget=w; return w; }

function update(dt){ if(running && !paused){ timeLeft -= dt/1000; if(timeLeft<=0){ timeLeft=0; running=false; over=true; } } if(running && !paused) spawnObject(dt); if(running && !paused){ objects.forEach(o=>{ o.y += o.speed * (dt/1000); }); } for(let i=objects.length-1;i>=0;i--){ if(objects[i].y>canvas.height+40){ miss++; total++; objects.splice(i,1); } } updateStats(); }

function draw(){ clearCanvas(); drawBackdrop(); ctx.textAlign='center'; ctx.textBaseline='middle'; if(modeEl.value==='letters'){ ctx.font='bold 64px Prompt'; objects.forEach(o=>{ ctx.fillStyle='#1a2f80'; ctx.fillText(o.char, o.x, o.y); }) } else { ctx.font='bold 40px Prompt'; objects.forEach(o=>{ ctx.fillStyle='#1a2f80'; ctx.fillText(o.word, o.x, o.y); }) } if(over){ const accText = statAcc.textContent.replace('%',''); const minS=parseInt(minScoreEl.value||'0',10); const minA=parseInt(minAccEl.value||'0',10); const pass = (score>=minS) && (parseInt(accText,10)>=minA); ctx.fillStyle='rgba(10,14,34,.88)'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle= pass? '#a7ffd8' : '#ffb4b4'; ctx.font='700 48px Prompt'; ctx.fillText(pass? 'ผ่านเกณฑ์' : 'ไม่ผ่าน', canvas.width/2, canvas.height/2 - 80); ctx.fillStyle='#fff'; ctx.font='600 26px Prompt'; ctx.fillText(`คะแนน ${score} • พลาด ${miss} • Accuracy ${statAcc.textContent}`, canvas.width/2, canvas.height/2 - 28); ctx.fillText(`เกณฑ์: คะแนน ≥ ${minS} และ Accuracy ≥ ${minA}%`, canvas.width/2, canvas.height/2 + 12); ctx.fillText('กด รีเซ็ต หรือ เริ่ม เพื่อเล่นใหม่ หรือ ออกจากเกม', canvas.width/2, canvas.height/2 + 50); const elapsed = parseInt(timeEl.value,10); const wpm = (modeEl.value==='words')? Math.round((score/(elapsed/60))) : Math.round((score/(elapsed/60))/5); const u=currentUser(); const rec={ time: new Date().toLocaleString(), name: u? `${u.first} ${u.last} (${u.className} เลขที่ ${u.no})` : (studentNameEl.value||''), mode: modeEl.value, score, miss, acc: parseInt(statAcc.textContent,10), wpm: isFinite(wpm)&&wpm>=0? wpm:0, pass, minScore: minS, minAcc: minA }; const list=loadResults(); list.push(rec); saveResults(list); refreshHome(); renderResults(); } }

function loop(now){ if(!running || paused){ draw(); return; } if(!now) now=performance.now(); const dt = now - lastTime; lastTime=now; update(dt); draw(); requestAnimationFrame(loop); }

// Inputs
window.addEventListener('keydown', (e)=>{ flashKey(e.code.toLowerCase()); if(modeEl.value==='letters' && running && !paused && !over){ const key = e.key.toUpperCase(); for(let i=0;i<objects.length;i++){ const o=objects[i]; if(o.type==='letter' && o.char===key){ score++; total++; objects.splice(i,1); break; } } updateStats(); draw(); } });
wordInputFS.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ const val=wordInputFS.value.trim().toLowerCase(); if(!val) return; let matched=false; for(let i=0;i<objects.length;i++){ const o=objects[i]; if(o.type==='word' && o.word.toLowerCase()===val){ score++; total++; objects.splice(i,1); matched=true; break; } } if(!matched){ miss++; total++; } wordInputFS.value=''; if(!currentTarget) pickWord(); updateStats(); draw(); } });

// Controls
btnStart.addEventListener('click', start); btnPause.addEventListener('click', pause); btnReset.addEventListener('click', reset); btnBackHome.addEventListener('click', ()=>{ goto('#/home'); });
modeEl.addEventListener('change', ()=>{ reset(); }); diffEl.addEventListener('change', reset); timeEl.addEventListener('change', reset); wordSetEl.addEventListener('change', ()=>{ if(modeEl.value==='words'){ currentTarget=pickWord(); } });

// ===== Results/Students rendering =====
function renderStudents(){ const tbody=document.getElementById('tblStudents'); tbody.innerHTML=''; loadStudents().forEach(s=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${s.first} ${s.last}</td><td>${s.className}</td><td>${s.no}</td><td>${s.time}</td>`; tbody.appendChild(tr); }); }
function renderResults(){ const tbody=document.getElementById('tblResults'); tbody.innerHTML=''; loadResults().forEach(r=>{ const tr=document.createElement('tr'); tr.innerHTML = `<td>${r.time}</td><td>${r.name}</td><td>${r.mode}</td><td>${r.score}</td><td>${r.miss}</td><td>${r.acc}%</td><td>${r.wpm}</td><td><span class="badge ${r.pass?'pass':'fail'}">${r.pass?'ผ่าน':'ไม่ผ่าน'}</span></td>`; tbody.appendChild(tr); }); }

// init
renderStudentsLogin(); renderRoute(); addEventListener('hashchange', renderRoute);
