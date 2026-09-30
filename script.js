const FEELS=["heavy","anxious","sad","restless","numb","tender","angry","overwhelmed","hollow","tense","lonely","on edge"];
const SRCS=["After talking with someone","Scrolling the news","In a crowd","Around someone's mood","While alone","Out of nowhere"];
const WHEN=[["before","Yes, it was already here","It was with me before anything happened"],["after","No, it came after","It arrived with that moment or person"],["unsure","I'm not sure","It all blurs together"]];
const VERDICT={
 before:{v:"mine",tag:"Yours",t:"This one is yours.",p:"It was here before anything touched it. You don't need to hand it back or fix it. It only needs to be noticed, and it's allowed to be here."},
 after:{v:"borrowed",tag:"Borrowed",t:"This one is borrowed.",p:"It arrived with someone else's weather. You felt it because you're attuned, not because it belongs to you. You can care about them without carrying it."},
 unsure:{v:"unsure",tag:"Not sure yet",t:"Not knowing is an honest answer.",p:"When you feel deeply, the edges blur. Treat it gently either way. Sometimes naming it is enough to loosen it."}
};
const S={feel:"",src:"",when:""};
const $=id=>document.getElementById(id);
let token=0;

function show(id){
  document.querySelectorAll(".step").forEach(s=>s.classList.toggle("on",s.id===id));
  const h=document.querySelector("#"+id+" h1, #"+id+" h2");
  if(h){h.tabIndex=-1;setTimeout(()=>h.focus({preventScroll:true}),50)}
  if(id==="breathe")breathe();
}
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));

function chips(el,list,key,next,text){
  list.forEach(l=>{
    const b=document.createElement("button");b.className="chip";b.textContent=l;b.setAttribute("aria-pressed","false");
    b.onclick=()=>{el.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");S[key]=l;if(text)text.value="";next.disabled=false};
    el.appendChild(b);
  });
}
chips($("feelChips"),FEELS,"feel",$("feelNext"),$("feelText"));
chips($("srcChips"),SRCS,"src",$("srcNext"));
$("feelText").oninput=e=>{const v=e.target.value.trim();if(v){document.querySelectorAll("#feelChips .chip").forEach(c=>c.setAttribute("aria-pressed","false"));S.feel=v.toLowerCase().slice(0,24)}
  $("feelNext").disabled=!v&&!document.querySelector('#feelChips [aria-pressed="true"]')};
$("feelNext").onclick=()=>show("src");
$("srcNext").onclick=()=>show("when");

WHEN.forEach(([k,a,b])=>{
  const btn=document.createElement("button");btn.className="chip";
  btn.innerHTML=a+"<small>"+b+"</small>";
  btn.onclick=()=>{S.when=k;const V=VERDICT[k];
    $("vTag").textContent=V.tag;$("vTag").className="tag "+V.v;
    $("vTitle").textContent=V.t;$("vText").textContent=V.p;show("verdict")};
  $("whenChoices").appendChild(btn);
});

function breathe(){
  const my=++token,orb=$("orb"),t=$("bText");
  $("bDone").hidden=true;$("bSkip").hidden=false;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  (async()=>{
    t.textContent="Get comfortable";orb.className="orb";await wait(1800);
    for(let i=0;i<3;i++){
      if(my!==token)return;t.textContent="Breathe in";orb.className="orb in";await wait(4000);
      if(my!==token)return;t.textContent="Breathe out";orb.className="orb out";await wait(6000);
    }
    if(my!==token)return;
    t.textContent="Whenever you're ready";$("bDone").hidden=false;$("bSkip").hidden=true;
  })();
}
function toRelease(){
  token++;
  const V=VERDICT[S.when],w=$("word");
  w.textContent=S.feel;w.className="word "+V.v;
  $("rText").textContent=V.v==="mine"?"Keeping it, more softly.":V.v==="borrowed"?"Handing it back to where it came from.":"Letting it go where it wants to go.";
  save(V.v);show("release");
  setTimeout(()=>{w.classList.add(V.v==="mine"?"settle":"rise");burst()},700);
  setTimeout(toClose,5200);
}
$("bDone").onclick=toRelease;$("bSkip").onclick=toRelease;

function load(){try{return JSON.parse(localStorage.getItem("mb_log")||"[]")}catch(e){return[]}}
function save(v){try{const l=load();l.push({f:S.feel,s:S.src,v,t:Date.now()});localStorage.setItem("mb_log",JSON.stringify(l.slice(-200)))}catch(e){}}
function toClose(){
  const tips={mine:"Put a hand where you feel it, and let it know you heard it.",borrowed:"Feel your feet on the floor and name three things you can see.",unsure:"Drink some water and let your shoulders drop."};
  $("cText").textContent=tips[VERDICT[S.when].v];
  const l=load(),b=l.filter(x=>x.v==="borrowed"),m=l.filter(x=>x.v==="mine");
  let txt="";
  if(l.length>=3){
    txt=`Across ${l.length} check-ins: ${m.length} felt yours, ${b.length} felt borrowed.`;
    if(b.length>=2){const c={};b.forEach(x=>c[x.s]=(c[x.s]||0)+1);const top=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];
      if(top[1]>=2)txt+=` Borrowed feelings most often show up: ${top[0].toLowerCase()}.`}
  }else txt="Come back again. Patterns appear after a few check-ins.";
  $("cPattern").textContent=txt;show("close");
}
$("again").onclick=()=>{S.feel=S.src=S.when="";$("feelText").value="";
  document.querySelectorAll(".chip[aria-pressed]").forEach(c=>c.setAttribute("aria-pressed","false"));
  $("feelNext").disabled=true;$("srcNext").disabled=true;show("feel")};
$("clear").onclick=()=>{try{localStorage.removeItem("mb_log")}catch(e){}$("cPattern").textContent="History cleared."};

/* ambient water */
const cv=$("c"),x=cv.getContext("2d"),calm=matchMedia("(prefers-reduced-motion:reduce)").matches;
let W,H,rip=[],pts=[],last=0;
function size(){const d=devicePixelRatio||1;W=cv.width=innerWidth*d;H=cv.height=innerHeight*d;x.setTransform(1,0,0,1,0,0)}
addEventListener("resize",size);size();
function burst(){if(calm)return;for(let i=0;i<40;i++)pts.push({x:W/2+(Math.random()-.5)*W*.2,y:H*.48,vy:-(.4+Math.random()*1.2)*(devicePixelRatio||1),a:.8,r:(1+Math.random()*2)*(devicePixelRatio||1)})}
function frame(t){
  const rgb=getComputedStyle(document.documentElement).getPropertyValue("--ring").trim();
  x.clearRect(0,0,W,H);
  if(!calm&&t-last>2600){last=t;rip.push({x:Math.random()*W,y:H*(.25+Math.random()*.6),r:0,a:.22})}
  rip.forEach(o=>{o.r+=.35*(devicePixelRatio||1);o.a-=.0008;x.beginPath();x.ellipse(o.x,o.y,o.r*1.6,o.r*.6,0,0,7);x.strokeStyle=`rgba(${rgb},${Math.max(o.a,0)})`;x.lineWidth=1.2;x.stroke()});
  rip=rip.filter(o=>o.a>0);
  pts.forEach(p=>{p.y+=p.vy;p.a-=.004;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle=`rgba(${rgb},${Math.max(p.a,0)})`;x.fill()});
  pts=pts.filter(p=>p.a>0);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
