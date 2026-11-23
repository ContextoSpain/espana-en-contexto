(function(){
'use strict';
var yo=document.currentScript, base=yo?yo.src.replace(/buscador\.js.*$/,''):'';
var caja=document.getElementById('busca');
if(!caja||!window.fetch)return;
var inp=caja.querySelector('input'),info=caja.querySelector('.busca-info'),res=caja.querySelector('.busca-res');
var datos=null,pidiendo=false,espera=0;
caja.hidden=false;
function norm(s){s=(s||'').toLowerCase();if(s.normalize)s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 return s.replace(/[^a-z0-9]+/g,' ').trim();}
function raiz(p){return p.length>5&&/es$/.test(p)?p.slice(0,-2):p.length>4&&/s$/.test(p)?p.slice(0,-1):p;}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function carga(){
 if(datos||pidiendo)return;pidiendo=true;
 fetch(base+'partidos/buscador.json').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
  j.filas.forEach(function(f){var p=j.partidos[f[0]]||[];f.k=' '+norm([f[3],p[0],p[2]].join(' '));});
  j.tp={};j.tn={};Object.keys(j.temas||{}).forEach(function(t){j.tn[t]=0;
   j.tp[t]=norm(j.temas[t]).split(' ').filter(function(p){return p.length>1;}).map(raiz);});
  j.filas.forEach(function(f){if(f[1] in j.tn)j.tn[f[1]]++;});
  (j.otros||[]).forEach(function(o){o.w=norm(o[2]||o[1]).split(' ').filter(function(p){return p.length>1;}).map(raiz);});
  datos=j;busca();
 }).catch(function(){pidiendo=false;info.textContent='El buscador no está disponible ahora mismo.';});}
function busca(){
 var q=inp.value.trim(),pal=norm(q).split(' ').filter(function(p){return p.length>1;}).map(raiz);
 res.textContent='';
 try{history.replaceState(null,'',location.pathname+(q?'?q='+encodeURIComponent(q):'')+location.hash);}catch(e){}
 if(pal.join('').length<3){info.textContent=q?'Escribe al menos tres letras.':'';return;}
 if(!datos){info.textContent='Buscando…';carga();return;}
 // El nombre del tema también cuenta. Si lo escrito es el nombre entero de un tema («sanidad»), salen todas
 // sus promesas; si es solo una parte («pensiones», de «Pensiones y fiscalidad»), se ofrece el tema entero.
 var enT={},parc=[],largas=pal.every(function(p){return p.length>3;});
 function casa(w,p){return w.indexOf(p)===0;}
 if(largas)Object.keys(datos.tp).forEach(function(t){var w=datos.tp[t];
  if(!w.length||!datos.tn[t]||!pal.every(function(p){return w.some(function(x){return casa(x,p);});}))return;
  if(w.every(function(x){return pal.some(function(p){return casa(x,p);});}))enT[t]=1;else parc.push(t);});
 var hall=datos.filas.filter(function(f){return enT[f[1]]===1||pal.every(function(p){return f.k.indexOf(' '+p)>=0;});});
 function nombres(l){return l.map(function(t){return '«'+datos.temas[t]+'»';}).join(' y ');}
 function ofrece(){parc.forEach(function(t){
  var p=el('p','nota busca-tema-mas','«'+q+'» es parte del nombre de un tema. Ver sus '+datos.tn[t]+' promesas: ');
  var b=el('button','busca-ej',datos.temas[t]);b.type='button';
  b.onclick=function(){inp.value=datos.temas[t];busca();};p.appendChild(b);res.appendChild(p);});}
 // Temas que no son de promesas (amnistía, trenes…): no hay filas que enseñar, pero sí una página entera.
 var otros=largas?(datos.otros||[]).filter(function(o){return o.w.length&&pal.every(function(p){return o.w.some(function(x){return casa(x,p);});});}):[];
 function enlaza(texto){if(!otros.length)return;var p=el('p','nota busca-tema-mas',texto+' ');
  otros.forEach(function(o,i){if(i)p.appendChild(document.createTextNode(' · '));
   var a=el('a','pf-mas',o[1]+' →');a.href=base+'temas/'+o[0]+'.html';p.appendChild(a);});res.appendChild(p);}
 if(!hall.length){
  if(otros.length){info.textContent='De «'+q+'» no hay promesas recogidas, pero esta web tiene '+(otros.length===1?'un tema entero':'temas enteros')+' sobre ello:';enlaza('');}
  else info.textContent='Ninguna de las promesas recogidas en esta web lleva «'+q+'». Prueba con otra palabra o solo con su principio («alquil» encuentra «alquiler» y «alquileres»).';
  ofrece();return;}
 var ts=Object.keys(enT),nT=ts.reduce(function(n,t){return n+datos.tn[t];},0),mas=hall.length-nT;
 if(ts.length)info.textContent=hall.length+' promesas: '+(mas?'las '+nT+' del tema '+nombres(ts)+' y '+mas+' más que '+(mas===1?'lleva':'llevan')+' «'+q+'»':'todas las del tema '+nombres(ts))+', por orden alfabético de partido. Cada una lleva a su prueba.';
 else info.textContent=hall.length+(hall.length===1?' promesa':' promesas')+' con «'+q+'», por orden alfabético de partido. Cada una lleva a su prueba.';
 if(document.querySelector('header nav a[href$="temas.html"]'))ts.forEach(function(t){
  var p=el('p','busca-tema-mas'),a=el('a','pf-mas','Ver el tema '+nombres([t])+' con todos los partidos a la vez →');
  a.href=base+'temas/'+t+'.html';p.appendChild(a);res.appendChild(p);});
 ofrece();enlaza(otros.length===1?'También hay un tema entero:':'También hay temas enteros:');
 var ult='';
 hall.forEach(function(f){
  var p=datos.partidos[f[0]]||[f[0],''];
  if(f[0]!==ult){ult=f[0];var h=el('h3','busca-partido',p[0]);if(p[1])h.style.setProperty('--color-partido',p[1]);res.appendChild(h);}
  var a=el('a','busca-fila comp-'+f[5]);a.href=base+'partidos/'+f[0]+'.html#c-'+f[1]+'-'+f[2];
  a.appendChild(el('span','busca-tema',datos.temas[f[1]]||f[1]));
  a.appendChild(el('span','busca-texto',f[3]));
  var e=el('span','busca-paso');
  if(f[4])e.appendChild(el('span','estado-et est-'+f[5],f[4]));
  if(f[6])e.appendChild(document.createTextNode((/^[,.;:]/.test(f[6])?'':' ')+f[6]));
  if(f[4]||f[6])a.appendChild(e);
  res.appendChild(a);});
 res.appendChild(el('p','nota',datos.nota||''));}
inp.addEventListener('input',function(){clearTimeout(espera);espera=setTimeout(busca,180);});
inp.addEventListener('focus',carga);
caja.addEventListener('submit',function(e){e.preventDefault();clearTimeout(espera);busca();});
[].forEach.call(caja.querySelectorAll('.busca-ej'),function(b){b.addEventListener('click',function(){inp.value=b.textContent;busca();});});
var m=/[?&]q=([^&]*)/.exec(location.search);
if(m){try{inp.value=decodeURIComponent(m[1].replace(/\+/g,' '));}catch(e){}if(inp.value)busca();}
})();
