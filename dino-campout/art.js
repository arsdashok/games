'use strict';
function campsiteArt(canvas) {
  const g = canvas.getContext('2d');
  const ground = 318, H = 400;
  let W = 900;
  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width*dpr); canvas.height = Math.round(box.height*dpr);
    W = H*box.width/box.height;
    g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  }
  const ink = '#21453c', gold = '#ffc564';
  function path(d, fill, stroke, width = 2) {
    const p = new Path2D(d);
    if (fill) { g.fillStyle = fill; g.fill(p); }
    if (stroke) { g.strokeStyle=stroke; g.lineWidth=width; g.lineJoin='round'; g.lineCap='round'; g.stroke(p); }
  }
  function ellipse(x,y,rx,ry,color) {
    g.fillStyle=color; g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();
  }
  function at(x,y,scale,draw) {
    g.save();g.translate(x,y);g.scale(scale,scale);draw();g.restore();
  }
  function noise(n) {const v=Math.sin(31.47*n+1.9)*23863.46;return v-Math.floor(v);}
  function mix(a,b,t) {
    return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')';
  }
  // A small repeatable ink texture, created once and reused as a pattern.
  const sheet=document.createElement('canvas');sheet.width=sheet.height=120;
  const paper=sheet.getContext('2d');
  for(let i=0;i<1250;i++){paper.fillStyle=i%3?'#fff4cb26':'#25342e26';paper.fillRect(noise(i)*120,noise(i+1800)*120,1+noise(i+98)*1.3,.8);}
  const grain=g.createPattern(sheet,'repeat');
  function row(spacing, offset, paint) {
    const first=Math.floor(offset/spacing)-1;
    for(let i=first;i<=Math.ceil((W+offset)/spacing)+1;i++) paint(i,i*spacing-offset);
  }
  function pine(x,base,h,shade,bright) {
    at(x,base,h/110,()=>{
      path('M-2 0L-1-70 2-72 3 0Z',shade);
      path('M0-110L-14-76-8-78-22-52-13-55-31-27-19-30-38-10Q-12-16 0-14Q17-11 36-14L19-33 29-29 12-56 21-53 7-80 13-77Z',shade);
      if(bright)path('M0-105L2-75 8-69 1-71 3-53 15-43 3-47 6-29 22-20 5-22 5-14-1-15Z',bright);
    });
  }
  function hills(x,t) {
    const sky=g.createLinearGradient(0,0,0,ground);
    const night = Math.max(0,(t-.68)/.32);
    sky.addColorStop(0,mix([140,203,194],[36,65,89],t));sky.addColorStop(1,mix([255,225,162],[208,161,145],t));
    g.fillStyle=sky;g.fillRect(0,0,W,H);
    const sunX=W*.73;
    ellipse(sunX,76+198*t*t,37,37,'#ffe19b');
    if(night>0){
      g.save();g.globalAlpha=night;
      for(let i=0;i<50;i++){
        const px=noise(i+67)*W,py=10+noise(i+127)*137;
        ellipse(px,py,1+(i%5===0),1.3,'#fff2cb');
      }
      ellipse(W*.32,65,18,18,'#f7e6b4');
      ellipse(W*.32-6,59,4,3,'#e5d5ae');ellipse(W*.32+5,69,3,3,'#e5d5ae');
      g.restore();
    }
    row(255,x*.075,(i,px)=>{
      const y=40+noise(i)*70;
      at(px,y,.7+noise(i+1)*.6,()=>path('M-54 8Q-48 2-32 3Q-23-7-8 0Q4-26 20-8Q33-11 42 2Q53 2 60 9Z','#fff4cd90'));
    });
    row(220,x*.15,(i,px)=>{
      const top=90+noise(i+9)*55;
      at(px,top,.9+noise(i+56)*.3,()=>{
        path('M-155 157L-92 89-68 76-46 25-30 21-22 0 19-4 47 46 59 46 78 94 148 162 148 260-155 260Z',mix([189,160,125],[174,123,145],t));
        path('M-22 0L-4 11-22 62-9 59-28 104-57 117-42 78-58 86Z M19-4L47 46 36 44 59 89 38 74 8 13Z',mix([218,184,140],[208,150,147],t));
      });
    });
    row(155,x*.23,(i,px)=>{ellipse(px,252,126,47+noise(i)*49,mix([128,161,127],[113,131,138],t));});
    row(52,x*.32,(i,px)=>pine(px,264,50+55*noise(i+5),mix([106,150,124],[89,126,132],t)));
    g.fillStyle=mix([123,185,165],[102,159,161],t);g.fillRect(0,263,W,55);
    row(95,x*.42,(i,px)=>{const y=272+noise(i+8)*19;path('M'+px+' '+y+'q16 -2 34 0',null,'#cfe4c0',1.5);});
    // The creek footbridge marks the middle trail; it passes behind the runner.
    const bridgeX = W*.3 + (2000-x)*.56;
    if(bridgeX>-310 && bridgeX<W+60) at(bridgeX,268,.9,()=>{
      for(let i=0;i<=6;i++){
        path('M'+(i*40)+' 19v-49',null,'#805c44',4);
        if(i<6)path('M'+(i*40)+' -27q20 10 40 0',null,'#76533b',2);
      }
      path('M-6 -8Q115 0 246-8L246-3Q116 5-6-3Z','#a9784f');
    });
    const dark=mix([52,107,81],[47,88,87],t);
    row(213,x*.53,(i,px)=>{
      const h=92+noise(i)*99;
      pine(px,305,h,dark,mix([69,124,88],[67,109,101],t));
      pine(px+32,306,h*.61,dark);
    });
  }
  function fern(x,y,scale,col) {
    at(x,y,scale,()=>{path('M0 0Q-9-8-18-10Q-9-12-3-6Q-12-19-10-24Q-2-17 1-6Q0-26 6-31Q9-18 5-7Q13-23 23-23Q19-14 7-5Q20-13 29-11Q20-3 0 0Z',col);});
  }
  function earth(x) {
    g.fillStyle='#75894f';g.fillRect(0,299,W,20);
    row(98,x*.72,(i,px)=>fern(px+noise(i)*26,307,.62+noise(i+4)*.5,'#52815a'));
    g.fillStyle='#d69c62';g.fillRect(0,ground,W,H-ground);
    g.fillStyle='#f3ce86';g.fillRect(0,ground,W,9);
    row(88,x,(i,px)=>{
      const y=340+noise(i)*48;path('M'+px+' '+y+'q7 -2 18 0',null,'#bc8359',2);
      ellipse(px+36,y+7,2.2,1.3,'#f6d694');
    });
    row(63,x*1.12,(i,px)=>{const h=10+noise(i)*20;ellipse(px,H+9,51,h,'#78864c');if(i%3===0)fern(px,H+4,.84,'#526e47');});
  }
  function hurdle(kind,x) {
    at(x,ground,1,()=>{
      if(kind==='log') {
        path('M0-5L48-11Q58-17 56-28L43-29 9-23Z','#875535',ink);
        path('M13-20L46-26 M21-14L42-18 M28-23L30-34 35-36 34-26',null,'#583f32',3);
        ellipse(7,-13,10,12,'#674530');ellipse(7,-13,8,10,'#f2bf78');ellipse(7,-13,5,7,'#ba8250');ellipse(7,-13,2,4,'#f9cf86');
      } else if(kind==='rock') {
        path('M-3 0L1-11 14-28 32-32 45-20 51-1Z','#9baaa1',ink);
        path('M1-11L14-28 32-32 25-19 11-8Z','#ced1ad');path('M25-19L32-32 45-20 51-1 38-3Z','#738b81');
      } else {
        path('M-6 0Q0-3 14-3L49-2Q67-2 74 2L66 9Q32 14 1 7Z','#517d72');
        path('M-2 2Q34 0 71 2L65 7Q32 11 3 6Z','#76bfc1');path('M10 4l14 1m8 1h14',null,'#e8eac7',1.5);
      }
    });
  }
  function item(slot,x,y,scale=1) {
    at(x,y,scale,()=>{
      if(slot===0){
        path('M-8-13Q-9-34 0-34Q10-34 8-13',null,ink,3);
        path('M-12-14L-8-19 9-19 13-14 11-11-11-11Z M-10 10H10L13 15H-13Z','#398875',ink);
        path('M-9-10L9-10 8 9-8 9Z','#ffda78',ink);
        path('M-1 6Q-6 2 0-5Q0-2 3 0Q6 5-1 6Z','#ed8a40');
      } else if(slot===1) {
        path('M-24-7Q-23-15-13-14L18-12Q24-12 24-1Q25 10 18 12L-18 11Q-25 9-24-7Z','#e78c62',ink);
        path('M-5-14L0-14 0 10-6 11Z','#70563e',ink,1);
        ellipse(-17,-1,8,11,'#ffb678');ellipse(-17,-1,5,7,'#be7051');ellipse(-17,-1,2,3,'#f7b07b');
      } else {
        path('M-26 13L-5-21 8-22 30 11 9 16Z','#e6984c',ink);
        path('M-26 13L-5-21 10 15Z','#ffcd71',ink);path('M-14 13L-5-6 3 15Z',ink);
        path('M-28 16l5-8m54 6-5-7',null,ink,1.7);
      }
    });
  }
  function dino(x,y,time,pose,stumble) {
    const run=pose==='run', jump=pose==='jump';
    const wave=run?Math.sin(time*14):0;
    g.save();g.translate(x,y-Math.abs(wave)*2);
    if(pose==='wait')g.rotate(.045+Math.sin(Math.min(stumble,.55)*23)*.16*Math.max(0,1-stumble/.55));
    if(jump) g.rotate(-.055);
    function leg(px,color,phase) {
      const dx=run?phase*12:jump?-9:0,dy=run?Math.max(0,-phase)*5:jump?7:0;
      path('M'+(px-8)+' -29Q'+(px-13)+' -17 '+(px+dx-5)+' '+(-5-dy)+'L'+(px+dx-4)+' '+(-1-dy)+'H'+(px+dx+12)+'Q'+(px+dx+17)+' '+(-6-dy)+' '+(px+dx+3)+' '+(-8-dy)+'L'+(px+6)+' -23Z',color,ink,2);
    }
    leg(-12,'#31816c',-wave);
    path('M-45-39L-43-51-33-46-33-58-20-49-18-61-5-49Z','#f0b753',ink,2);
    path('M-16-49Q-42-49-61-62Q-60-41-43-29Q-31-18-12-17Q13-10 22-35L28-50 11-64Q-1-46-16-49Z','#4baf8c',ink,2.7);
    path('M-42-31Q-15-23 0-43L17-51 19-37Q7-12-13-19Q-32-20-42-31Z','#c2dca2');
    leg(0,'#63bb94',wave);
    path('M1-54Q5-84 25-87Q42-88 45-72Q60-72 63-62Q66-51 55-47Q34-38 15-46Z','#64bd96',ink,2.7);
    path('M23-50Q42-49 61-60Q64-49 50-46Q30-40 23-50Z','#d6e4ac');
    ellipse(35,-70,5.4,6.2,'#fff3ca');ellipse(37,-70,3.2,4.2,ink);ellipse(38,-72,.95,1.1,'white');
    ellipse(56,-64,1.7,1.6,ink);path('M44-56q8 4 15-3',null,ink,1.6);
    path('M2-62Q10-52 23-52L19-43Q5-46-1-54L-13-50-21-58-7-61Z','#e77849',ink,2);
    path('M10-39q4 8 12 4l3 2q-8 10-18 0', '#62b38d',ink,1.7);
    for(let i=0;i<3;i++)ellipse(-36+i*7,-40-i%2*3,2.4,1.8,'#318975');
    g.restore();
  }
  function draw(s,time) {
    const camp=s.mode==='camp'||s.mode==='done';
    const hero=Math.min(157,W*.22), skyT=Math.min(1,s.x/Trail.end);
    hills(s.x,skyT);earth(s.x);
    for(const h of Trail.hurdles){
      const x=hero+h.at-s.x+38;
      if(x>-80&&x<W+60)hurdle(h.kind,x);
    }
    for(let i=s.packed;i<Trail.pickups.length;i++){
      const x=hero+Trail.pickups[i]-s.x;
      if(x<-50||x>W+45)continue;
      const y=ground-92+4*Math.sin(time*3+i);
      ellipse(x,y,29,29,'#fff2b58c');item(i,x,y,.86);
    }
    const campX=hero+Trail.end-s.x+W*.23;
    if(campX<W+130){
      at(campX,ground,1,()=>{
        path('M-40-2Q5-13 60 0Q30 8-40-2Z','#b28e60');
        if(s.placed&4)item(2,2,-29,2.05);
        if(s.placed&2)item(1,28,-2,.8);
        if(s.placed&1){path('M62 0v-55q0-7-11-6',null,ink,3);ellipse(51,-37,22,22,'#ffe8836e');item(0,51,-37,.65);}
      });
    }
    ellipse(hero,ground+1,Math.max(11,36-s.height*.15),4,'#6c68424d');
    dino(hero,ground-s.height,time,camp?'camp':s.mode==='wait'?'wait':s.height>0?'jump':'run',s.stumbleAge);
    if(skyT>.6){
      for(let i=0;i<14;i++){
        const x=(noise(i+33)*W-s.x*.035+W)%W;
        const y=125+noise(i+99)*136+Math.sin(time+i)*5;
        ellipse(x,y,1.5,1.5,'rgba(255,232,142,'+(.5+.35*Math.sin(time*2+i))+')');
      }
    }
    g.fillStyle=grain;g.fillRect(0,0,W,H);
  }
  return {resize,draw};
}
