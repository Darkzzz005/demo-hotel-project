(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var root=document.documentElement;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  try{var sv=localStorage.getItem('lumen-theme');if(sv){root.setAttribute('data-theme',sv)}}catch(e){}
  function isDark(){var a=root.getAttribute('data-theme');if(a)return a==='dark';return matchMedia('(prefers-color-scheme: dark)').matches}
  $('#theme').addEventListener('click',function(){
    var n=isDark()?'light':'dark';root.setAttribute('data-theme',n);
    try{localStorage.setItem('lumen-theme',n)}catch(e){}
    readColors();if(reduce)drawWaves(0);
  });

  var clk=$('#clock');
  function tick(){try{clk.textContent=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date())}catch(e){clk.textContent=''}}
  tick();setInterval(tick,30000);

  var cv=$('#waves'),ctx=cv.getContext('2d'),W=0,H=0,cols=[[205,218,201],[236,211,205],[211,223,232]],running=false,raf=0,t0=0,mx=.5;
  function toRGB(v){v=v.trim();if(v.charAt(0)==='#'){var h=v.slice(1);if(h.length===3)h=h.split('').map(function(c){return c+c}).join('');var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}var m=v.match(/\d+/g);return m?[+m[0],+m[1],+m[2]]:[200,210,200]}
  function readColors(){var cs=getComputedStyle(root);cols=['--sage','--blush','--sky'].map(function(k){return toRGB(cs.getPropertyValue(k))})}
  function size(){var r=cv.parentElement.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);drawWaves(0)}
  function drawWaves(t){
    ctx.clearRect(0,0,W,H);
    var sc=(window.scrollY||0)*.0016;
    for(var l=0;l<3;l++){
      var c=cols[l],amp=26+l*16,base=H*(.52+l*.13),f=.0042-l*.0006,sp=.5+l*.25;
      ctx.beginPath();ctx.moveTo(0,H);
      for(var x=0;x<=W;x+=8){
        var y=base+Math.sin(x*f+t*sp*.0009+sc*(2+l))*amp+Math.sin(x*f*2.1+t*.0006*sp-l)*(amp*.35)+(mx-.5)*Math.sin(x*.003+l)*30;
        ctx.lineTo(x,y);
      }
      ctx.lineTo(W,H);ctx.closePath();
      ctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(.5-l*.08)+')';ctx.fill();
      ctx.beginPath();
      for(var x2=0;x2<=W;x2+=8){
        var y2=base+Math.sin(x2*f+t*sp*.0009+sc*(2+l))*amp+Math.sin(x2*f*2.1+t*.0006*sp-l)*(amp*.35)+(mx-.5)*Math.sin(x2*.003+l)*30;
        if(x2===0)ctx.moveTo(x2,y2);else ctx.lineTo(x2,y2);
      }
      ctx.strokeStyle='rgba('+Math.max(0,c[0]-40)+','+Math.max(0,c[1]-40)+','+Math.max(0,c[2]-40)+',.35)';ctx.lineWidth=1;ctx.stroke();
    }
  }
  function loop(ts){if(!t0)t0=ts;drawWaves(ts-t0);if(running)raf=requestAnimationFrame(loop)}
  var hero=$('#hero');
  hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();mx=(e.clientX-r.left)/r.width});
  readColors();size();
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,150)});
  if(!reduce&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){var on=es[0].isIntersecting;if(on&&!running){running=true;raf=requestAnimationFrame(loop)}if(!on){running=false;cancelAnimationFrame(raf)}}).observe(hero);
  }

  var nav=$('#nav'),pars=$$('[data-par]'),ticking=false;
  function onScroll(){
    var h=document.documentElement.scrollHeight-window.innerHeight,y=window.scrollY||0,p=h>0?Math.min(1,y/h):0;
    root.style.setProperty('--p',p.toFixed(4));
    nav.classList.toggle('scrolled',y>10);
    if(!reduce)pars.forEach(function(el){el.style.setProperty('--py',(y*parseFloat(el.getAttribute('data-par'))).toFixed(1)+'px')});
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();

  var glow=$('#glow');
  window.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;glow.style.opacity='.55';glow.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)'},{passive:true});
  document.addEventListener('pointerleave',function(){glow.style.opacity='0'});
  $$('.card').forEach(function(t){t.addEventListener('pointermove',function(e){var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')})});

  if(!reduce){$$('[data-mag]').forEach(function(b){
    b.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.28).toFixed(1)+'px)'});
    b.addEventListener('pointerleave',function(){b.style.transform=''});
  })}

  $$('[data-stagger]').forEach(function(g){$$(':scope > *',g).forEach(function(c,i){c.style.setProperty('--k',i)})});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target)}})},{threshold:.12});
    $$('[data-reveal],[data-stagger]').forEach(function(el){var r=el.getBoundingClientRect();if(r.top>window.innerHeight*.92){el.classList.add('pre');io.observe(el)}});
    var links=$$('.links a');
    var spy=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.setAttribute('aria-current',a.getAttribute('href')==='#'+e.target.id?'true':'false')})}})},{rootMargin:'-45% 0px -50% 0px'});
    $$('section.s').forEach(function(s){spy.observe(s)});
  }

  var rooms={
    deluxe:{name:'Deluxe Double',sleeps:'2 guests',beds:'One double bed',bath:'Private, with bath and shower',best:'Solo travellers and couples',size:'14',
      blurb:'A compact, quiet room for one or two guests. A double bed, a sofa and a seating and dining corner, with a private bathroom of your own.',
      beds_:[['double','Double bed']],
      chips:['Air conditioning','Fan','TV with cable','Sofa and seating area','Dining area','Linen and towels','Body soap','Crib on request']},
    two:{name:'Two-Bedroom Apartment',sleeps:'Up to 4 guests',beds:'Two double beds and a sofa bed',bath:'Bath and shower',best:'Families and small groups',size:'23',
      blurb:'Two bedrooms around a shared living room, with a kitchen and a balcony. Enough room to settle in for a few days.',
      beds_:[['double','Double bed'],['double','Double bed'],['sofa','Sofa bed']],
      chips:['Balcony','Living room','Dining area','Kitchen with fridge','Air conditioning','Fan','TV with cable','Crib on request']},
    three:{name:'Three-Bedroom Apartment',sleeps:'Up to 6 guests',beds:'Three double beds and a sofa bed',bath:'Bathroom',best:'Larger families and group trips',size:'',
      blurb:'Space for a whole family or a group travelling together, with three bedrooms and a living room to share.',
      beds_:[['double','Double bed'],['double','Double bed'],['double','Double bed'],['sofa','Sofa bed']],
      chips:['Three bedrooms','Living room','Free parking','24-hour front desk','Room service']}
  };
  var dbl='<svg viewBox="0 0 120 80" aria-hidden="true"><rect x="12" y="26" width="96" height="34" rx="6"/><path d="M12 60v10M108 60v10M12 26V12h96v14"/><rect x="22" y="32" width="34" height="14" rx="5"/><rect x="64" y="32" width="34" height="14" rx="5"/></svg>';
  var sofa='<svg viewBox="0 0 120 80" aria-hidden="true"><rect x="14" y="30" width="92" height="28" rx="8"/><path d="M14 30V20a8 8 0 0 1 8-8h76a8 8 0 0 1 8 8v10M22 58v10M98 58v10M40 30v28M80 30v28"/></svg>';
  var cur='deluxe',zone=$('#zone');
  function setRoom(k){
    cur=k;var r=rooms[k];
    $$('.rtab').forEach(function(b){var on=b.getAttribute('data-k')===k;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1});
    $('#rName').textContent=r.name;$('#rBlurb').textContent=r.blurb;$('#rSleeps').textContent=r.sleeps;$('#rBeds').textContent=r.beds;$('#rBath').textContent=r.bath;$('#rBest').textContent=r.best;
    $('#rChips').innerHTML=r.chips.map(function(c){return '<li>'+c+'</li>'}).join('');
    $('#beds').innerHTML=r.beds_.map(function(b,i){return '<div class="bed" style="--n:'+i+'">'+(b[0]==='double'?dbl:sofa)+'<small>'+b[1]+'</small></div>'}).join('');
    $('#size').innerHTML=r.size?(r.size+' m&sup2;<small>Floor area</small>'):'<small>Floor area to be confirmed</small>';
    zone.classList.remove('swap');void zone.offsetWidth;zone.classList.add('swap');
    $('#room').value=k;limitGuests();summary();
  }
  var tabs=$$('.rtab');
  tabs.forEach(function(b,i){
    b.addEventListener('click',function(){setRoom(b.getAttribute('data-k'))});
    b.addEventListener('keydown',function(e){var n=-1;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(n>-1){e.preventDefault();tabs[n].focus();setRoom(tabs[n].getAttribute('data-k'))}});
  });
  var stage=$('#stage');
  stage.addEventListener('pointermove',function(e){if(reduce||e.pointerType==='touch')return;var r=stage.getBoundingClientRect();stage.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*7).toFixed(2)+'deg');stage.style.setProperty('--rx',((.5-(e.clientY-r.top)/r.height)*5).toFixed(2)+'deg')});
  stage.addEventListener('pointerleave',function(){stage.style.setProperty('--rx','0deg');stage.style.setProperty('--ry','0deg')});

  var near=[
    {n:'Ernakulam railway station',km:.35,d:'On foot, about a five-minute walk'},
    {n:'ATM',km:.85,d:'Close by for cash'},
    {n:'Vijaya Institute of Medical Sciences',km:.87,d:'Hospital nearby'},
    {n:'Mattancherry',km:4.95,d:'Old quarter, spice markets and the synagogue'},
    {n:'Lulu Mall',km:5.52,d:'Shopping, food and a cinema'},
    {n:'Cherai Beach',km:20.9,d:'A day trip to the coast'},
    {n:'Cochin International Airport',km:22,d:'Listings put it between 22 and 27 km'}
  ];
  var maxS=Math.sqrt(27);
  $('#bars').innerHTML=near.map(function(p){var w=Math.max(4,Math.sqrt(p.km)/maxS*100).toFixed(1);return '<div class="br"><div class="top"><b>'+p.n+'</b><output data-km="'+p.km+'">0 km</output></div><div class="tr"><i style="--w:'+w+'%"></i></div><span class="d">'+p.d+'</span></div>'}).join('');
  var nearEl=$('#near'),counted=false;
  function fmtKm(v,end){return (end<1?v.toFixed(2):end<10?v.toFixed(1):Math.round(v))+' km'}
  function countUp(){
    if(counted)return;counted=true;nearEl.classList.add('in');
    $$('#bars output').forEach(function(o){
      var end=parseFloat(o.getAttribute('data-km'));
      if(reduce){o.textContent=(end<1?end.toFixed(2):end<10?end.toFixed(1):end)+' km';return}
      var s=performance.now();
      (function f(n){var k=Math.min(1,(n-s)/1500),e=1-Math.pow(1-k,3);o.textContent=fmtKm(end*e,end);if(k<1)requestAnimationFrame(f);else o.textContent=(end<1?end.toFixed(2):end<10?end.toFixed(1):end)+' km'})(s);
    });
  }
  if('IntersectionObserver' in window){new IntersectionObserver(function(es,ob){if(es[0].isIntersecting){countUp();ob.disconnect()}},{threshold:.25}).observe(nearEl)}else{countUp()}

  var ci=$('#ci'),co=$('#co'),roomSel=$('#room'),gc=$('#gc'),guests=2,err=$('#err');
  function ymd(d){var m=d.getMonth()+1,dd=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(dd<10?'0':'')+dd}
  function addDays(s,n){var p=s.split('-');return ymd(new Date(+p[0],+p[1]-1,+p[2]+n))}
  var today=ymd(new Date());ci.min=today;co.min=addDays(today,1);ci.value=addDays(today,7);co.value=addDays(today,9);
  function nights(){if(!ci.value||!co.value)return 0;var a=ci.value.split('-'),b=co.value.split('-');return Math.round((new Date(+b[0],+b[1]-1,+b[2])-new Date(+a[0],+a[1]-1,+a[2]))/864e5)}
  function fmt(s){if(!s)return '-';var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
  var maxG={deluxe:2,two:4,three:6};
  function limitGuests(){var m=maxG[roomSel.value];if(guests>m)guests=m;gc.textContent=guests}
  function summary(){var n=nights();$('#sR').textContent=rooms[roomSel.value].name;$('#sD').textContent=fmt(ci.value)+' to '+fmt(co.value);$('#sN').textContent=n>0?n:'-';$('#sG').textContent=guests}
  ci.addEventListener('change',function(){co.min=addDays(ci.value||today,1);if(nights()<1)co.value=addDays(ci.value,1);summary()});
  co.addEventListener('change',function(){err.textContent=nights()<1?'Check-out must be after check-in.':'';summary()});
  roomSel.addEventListener('change',function(){setRoom(roomSel.value)});
  $('#gm').addEventListener('click',function(){if(guests>1){guests--;gc.textContent=guests;summary()}});
  $('#gp').addEventListener('click',function(){var m=maxG[roomSel.value];if(guests<m){guests++;gc.textContent=guests;err.textContent='';summary()}else{err.textContent='This room sleeps up to '+m+'. Choose a larger room for more guests.'}});
  $('#bform').addEventListener('submit',function(e){
    e.preventDefault();
    if(nights()<1){err.textContent='Choose a check-out date after check-in.';return}
    if(!$('#nm').value.trim()){err.textContent='Add your name so the front desk can find your enquiry.';$('#nm').focus();return}
    err.textContent='';var n=nights();
    $('#doneT').textContent='Enquiry captured';
    $('#doneP').textContent=rooms[roomSel.value].name+', '+n+' night'+(n>1?'s':'')+', '+guests+' guest'+(guests>1?'s':'')+'. This is a demo and nothing was sent. Connect the form to the property before launch.';
    $('#done').classList.add('show');
  });
  setRoom('deluxe');
})();
