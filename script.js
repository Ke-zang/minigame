const ROUNDS=[
 {name:"Roles and definitions",items:[
  {id:"a",l:"Issuer",em:"🏛️",r:"A trusted organization that creates and digitally signs a credential, such as the Department of Civil Registration issuing a Foundational ID.",fact:"Issuers sign credentials so anyone can check they are real."},
  {id:"b",l:"Holder",em:"📱",r:"The person who receives a credential and keeps it in their digital wallet, choosing when and with whom to share it.",fact:"Holders stay in control of what they share."},
  {id:"c",l:"Verifier",em:"🔍",r:"The party that requests proof and checks that the credential is genuine, such as a bank doing eKYC.",fact:"Verifiers check proofs before trusting them."}]},
 {name:"Who is who?",items:[
  {id:"a",l:"Issuer",em:"🏛️",r:"Your school issues a Student ID to a student.",fact:"The school creates and signs the Student ID."},
  {id:"b",l:"Holder",em:"📱",r:"A student keeps their Student ID in the NDI wallet on their phone.",fact:"The student is the Holder and controls their data."},
  {id:"c",l:"Verifier",em:"🔍",r:"The school library checks the student’s proof before lending a book.",fact:"The library asks for proof and verifies it."}]},
 {name:"What does each role do?",items:[
  {id:"a",l:"Issuer",em:"🏛️",r:"Creates, signs and can revoke credentials.",fact:"Issuing, signing and revoking belong to the Issuer."},
  {id:"b",l:"Holder",em:"📱",r:"Chooses which credentials or proofs to share, and shares only what is needed.",fact:"Holders share a proof, not all their data."},
  {id:"c",l:"Verifier",em:"🔍",r:"Checks the signature and approves or declines the request.",fact:"Verifiers check, then approve or decline."}]},
 {name:"Trust tools",items:[
  {id:"a",l:"NDI Wallet",em:"👛",r:"The app on the phone where the Holder keeps credentials.",fact:"The wallet is the Holder’s safe place for credentials."},
  {id:"b",l:"NDI Trust Registry",em:"📋",r:"Keeps the list of trusted issuers and verifiers.",fact:"Only verified parties are allowed in the ecosystem."},
  {id:"c",l:"Verifiable Data Registry",em:"⛓️",r:"Stores issuer public keys, DID documents and credential schemas.",fact:"It helps prove a credential is authentic."}]},
 {name:"The trust flow",items:[
  {id:"a",l:"1. Issuance",em:"✍️",r:"The Issuer creates and signs a credential for the Holder.",fact:"The flow starts with the Issuer."},
  {id:"b",l:"2. Presentation",em:"📤",r:"The Holder shows a proof from the NDI Wallet to a Verifier, for example for login or eKYC.",fact:"The Holder presents proof to the Verifier."},
  {id:"c",l:"3. Verification",em:"✅",r:"The Verifier checks the registries, confirms the signature, and trusts the credential.",fact:"Trust is established: Issuer ➜ Holder ➜ Verifier."}]}
];
const $=id=>document.getElementById(id),board=$("board"),svg=$("lines"),msg=$("msg"),face=$("face");
let score,matched,errors,sel,drag,links=[],rd,DATA,CLR=["#2563eb","#16a34a","#9333ea"];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("on",s.id===id))}
function say(t,c,f){msg.textContent=t;msg.className=c||"";face.textContent=f||"🛡️"}
function upd(){$("score").textContent="⭐ "+score;$("prog").textContent="🧩 Round "+(rd+1)+" / "+ROUNDS.length;$("err").textContent="❌ "+errors}
function bump(id){const e=$(id);e.classList.remove("pop");void e.offsetWidth;e.classList.add("pop")}

// sound + confetti
let ac;function tone(f,d,t,dl){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=t||"triangle";o.frequency.value=f;g.gain.setValueAtTime(.15,ac.currentTime+(dl||0));g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+(dl||0)+d);o.connect(g);g.connect(ac.destination);o.start(ac.currentTime+(dl||0));o.stop(ac.currentTime+(dl||0)+d)}catch(e){}}
const cv=$("cv"),cx=cv.getContext("2d");let parts=[],raf=0;
function sz(){cv.width=innerWidth;cv.height=innerHeight}sz();
function confetti(x,y,n){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*10,vy:-Math.random()*10-3,s:5+Math.random()*6,c:`hsl(${Math.random()*360},90%,60%)`,r:Math.random()*6,l:90});if(!raf)loop()}
function loop(){cx.clearRect(0,0,cv.width,cv.height);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.32;p.r+=.2;p.l--;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore()});parts=parts.filter(p=>p.l>0);raf=parts.length?requestAnimationFrame(loop):0;if(!raf)cx.clearRect(0,0,cv.width,cv.height)}

const pt=(el,s)=>{const b=board.getBoundingClientRect(),r=el.getBoundingClientRect();return{x:(s==="r"?r.right:r.left)-b.left,y:r.top+r.height/2-b.top}};
const mk=(c,d)=>{const l=document.createElementNS("http://www.w3.org/2000/svg","line");l.setAttribute("stroke",c);l.setAttribute("stroke-width","6");l.setAttribute("stroke-linecap","round");if(d)l.setAttribute("stroke-dasharray","4 12");svg.appendChild(l);return l};
const sl=(l,a,b)=>{l.setAttribute("x1",a.x);l.setAttribute("y1",a.y);l.setAttribute("x2",b.x);l.setAttribute("y2",b.y)};
function clr(){if(drag){drag.remove();drag=null}document.querySelectorAll(".role").forEach(x=>x.classList.remove("sel"));sel=null}

// Step 1-3: start, display roles, display definitions in random order
function startGame(){score=0;errors=0;rd=0;show("s-play");loadRound()}
function loadRound(){
  DATA=ROUNDS[rd].items;matched=0;sel=null;drag=null;links=[];
  $("roles").innerHTML="";$("defs").innerHTML="";svg.innerHTML="";$("nextr").style.display="none";
  DATA.forEach((d,i)=>{const e=document.createElement("div");e.className="node role";e.dataset.id=d.id;e.style.borderColor=CLR[i];e.innerHTML="<i>"+d.em+"</i>"+d.l;$("roles").appendChild(e)});
  shuffle(DATA).forEach(d=>{const e=document.createElement("div");e.className="node def";e.dataset.id=d.id;e.textContent=d.r;$("defs").appendChild(e)});
  upd();say("Round "+(rd+1)+": "+ROUNDS[rd].name+". Select an item on the left, then connect it to its match!");
  document.querySelectorAll(".role").forEach(n=>n.addEventListener("pointerdown",()=>selectRole(n)));
  document.querySelectorAll(".def").forEach(n=>n.addEventListener("click",()=>checkMatch(n)));
}
$("nextr").onclick=()=>{rd++;loadRound()};
// Step 4: player selects a role
function selectRole(n){
  if(n.classList.contains("locked"))return;
  document.querySelectorAll(".role").forEach(x=>x.classList.remove("sel"));
  n.classList.add("sel");sel=n;tone(660,.07,"square");
  if(drag)drag.remove();
  drag=mk("#ff6b35",true);const a=pt(n,"r");sl(drag,a,a);
  say("Which one matches “"+DATA.find(x=>x.id===n.dataset.id).l+"”? 🤔",null,"🤔");
}
board.addEventListener("pointermove",ev=>{if(!drag||!sel)return;const b=board.getBoundingClientRect();sl(drag,pt(sel,"r"),{x:ev.clientX-b.left,y:ev.clientY-b.top})});
board.addEventListener("pointerup",ev=>{if(!sel||!drag)return;const t=document.elementFromPoint(ev.clientX,ev.clientY),d=t&&t.closest&&t.closest(".def");if(d)checkMatch(d)});

// Steps 5-9: connect, check, lock/award or error + retry, repeat until all matched
function checkMatch(d){
  if(!sel||d.classList.contains("locked"))return;
  const d0=DATA.find(x=>x.id===sel.dataset.id);
  if(sel.dataset.id===d.dataset.id){                       // Step 7: correct
    const l=mk("#15a34a");sl(l,pt(sel,"r"),pt(d,"l"));links.push([sel,d,l]);
    sel.classList.remove("sel");sel.classList.add("locked");d.classList.add("locked");
    score+=10;matched++;
    const r=d.getBoundingClientRect(),f=document.createElement("div");f.className="float";f.textContent="+10";f.style.left=(r.left+r.width/2-20)+"px";f.style.top=r.top+"px";document.body.appendChild(f);setTimeout(()=>f.remove(),1100);
    confetti(r.left+r.width/2,r.top+r.height/2,40);tone(523,.12);tone(784,.18,"triangle",.1);
    say(pick(["Locked in! 🔒","Nailed it! 🎯","Yes!"])+" "+d0.fact+" +10 points","ok","🤩");
    clr();upd();bump("score");bump("prog");
    if(matched===3){if(rd<ROUNDS.length-1)setTimeout(()=>{$("nextr").style.display="inline-block";},900);else setTimeout(endGame,1100)}
  }else{                                                   // Step 8: incorrect
    score=Math.max(0,score-5);errors++;
    d.classList.add("shake");setTimeout(()=>d.classList.remove("shake"),420);tone(200,.25,"sawtooth");
    say("Oops! That’s not the match for “"+d0.l+"”. Try again! −5 points","bad","😵");
    clr();upd();bump("err");
  }
}
// Steps 10-11: calculate final score, display result, end
function endGame(){
  const MAX=ROUNDS.length*30,n=score>=MAX*0.9?3:score>=MAX*0.7?2:1;
  $("title").textContent=n===3?"Perfect! Trust established! 🏆":n===2?"Great job! 🎉":"You did it! 👏";
  $("stars").textContent="★".repeat(n)+"☆".repeat(3-n);
  $("final").textContent=score+" / "+MAX;
  $("verdict").textContent="Wrong tries: "+errors+". "+(n===3?"Flawless run!":"Play again to get a perfect score.")+" Remember: Issuer ➜ Holder ➜ Verifier.";
  show("s-end");
  confetti(innerWidth/2,innerHeight/3,150);setTimeout(()=>confetti(innerWidth/4,innerHeight/3,80),300);setTimeout(()=>confetti(innerWidth*.75,innerHeight/3,80),500);
  [523,659,784,1047].forEach((f,i)=>tone(f,.25,"triangle",i*.12));
}
$("start").onclick=startGame;$("again").onclick=startGame;
addEventListener("resize",()=>{sz();links.forEach(([a,b,l])=>sl(l,pt(a,"r"),pt(b,"l")))});
