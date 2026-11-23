(function(){
'use strict';
var yo=document.currentScript, base=yo?yo.src.replace(/buscador\.js.*$/,''):'';
var caja=document.getElementById('busca');
if(!caja||!window.fetch)return;
var inp=caja.querySelector('input'),info=caja.querySelector('.busca-info'),res=caja.querySelector('.busca-res');
var datos=null,pidiendo=false,espera=0;
caja.hidden=false;
function norm(s){s=(s||'').toLowerCase();if(s.normalize)s=s.normalize('NFD').replace(/[̀-ͯ]/g,'');
 return s.replace(/[^a-z0-9]+/g,' ').trim();}
function raiz(p){return p.length>5&&/es$/.test(p)?p.slice(0,-2):p.length>4&&/s$/.test(p)?p.slice(0,-1):p;}
function pals(s){return norm(s).split(' ').filter(function(p){return p.length>1;}).map(raiz);}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function carga(){
 if(datos||pidiendo)return;pidiendo=true;
 fetch(base+'partidos/buscador.json').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
  j.filas.forEach(function(f){var p=j.partidos[f[0]]||[];f.k=' '+norm([f[3],p[0],p[2]].join(' '));});
  j.tp={};j.tn={};j.te={};Object.keys(j.temas||{}).forEach(function(t){j.tn[t]=0;
   j.tp[t]=pals(j.temas[t]);j.te[t]=pals((j.entradas||{})[t]||'');});
  j.filas.forEach(function(f){f.e=f.k+' ';if(f[1] in j.tn)j.tn[f[1]]++;});
  (j.otros||[]).forEach(function(o){o.w=pals(o[2]||o[1]);});
  // Equivalencias: la palabra de la calle («okupas») y los términos con que la escriben los programas.
  j.eq=(j.equiv||[]).map(function(e){return {k:e[0].map(function(c){return pals(c).join(' ');})
   .sort(function(a,b){return b.length-a.length;}),t:e[1]};});
  // Vocabulario para las erratas: cada palabra que la web conoce, con la forma en que se escribe.
  j.voc={};function apunta(s){(s||'').toLowerCase().split(/[^0-9a-zÀ-ɏ]+/).forEach(function(w){var n=norm(w);
   if(n.length<4||/\d/.test(n))return;if(j.voc[n])j.voc[n].n++;else j.voc[n]={o:w,n:1};});}
  j.filas.forEach(function(f){apunta(f[3]);});
  Object.keys(j.temas||{}).forEach(function(t){apunta(j.temas[t]);apunta((j.entradas||{})[t]);});
  (j.otros||[]).forEach(function(o){apunta(o[1]);apunta(o[2]);});
  (j.equiv||[]).forEach(function(e){e[0].forEach(apunta);});
  datos=j;busca();
 }).catch(function(){pidiendo=false;info.textContent='El buscador no está disponible ahora mismo.';});}
function casa(w,p){return w.indexOf(p)===0;}
// Una palabra corta casa solo con la palabra entera (o su plural): «trans» no es «transporte» ni «casa», «casación».
function casaT(e,p,pref){if(!pref&&p.length<6)return e.indexOf(' '+p+' ')>=0||e.indexOf(' '+p+'s ')>=0||e.indexOf(' '+p+'es ')>=0;
 return e.indexOf(' '+p)>=0;}
function resuelve(pal,pref){
 var qn=' '+pal.join(' ')+' ',vars=[{w:pal,t:''}],usados=[];
 datos.eq.forEach(function(e){e.k.some(function(k){var i=k?qn.indexOf(' '+k+' '):-1;if(i<0)return false;
  var resto=(qn.slice(0,i)+' '+qn.slice(i+k.length+1)).split(' ').filter(Boolean);
  e.t.forEach(function(t){vars.push({w:resto,t:' '+norm(t)});if(usados.indexOf(t)<0)usados.push(t);});return true;});});
 // El nombre del tema también cuenta. Si lo escrito es el nombre entero de un tema («sanidad»), salen todas
 // sus promesas; si es una parte («pensiones») o una palabra de entrada («casa»), se ofrece el tema entero.
 var enT={},parc=[],largas=pal.every(function(p){return p.length>3;});
 if(largas)Object.keys(datos.tp).forEach(function(t){var w=datos.tp[t],x=w.concat(datos.te[t]);
  if(!w.length||!datos.tn[t]||!pal.every(function(p){return x.some(function(y){return casa(y,p);});}))return;
  if(w.every(function(y){return pal.some(function(p){return casa(y,p);});}))enT[t]=1;else parc.push(t);});
 var hall=datos.filas.filter(function(f){return enT[f[1]]===1||vars.some(function(v){
  return v.w.every(function(p){return casaT(f.e,p,pref);})&&(!v.t||f.e.indexOf(v.t)>=0);});});
 // Temas que no son de promesas (amnistía, trenes…): no hay filas que enseñar, pero sí una página entera.
 var otros=largas?(datos.otros||[]).filter(function(o){return o.w.length&&pal.every(function(p){return o.w.some(function(x){return casa(x,p);});});}):[];
 return {hall:hall,enT:enT,parc:parc,otros:otros,usados:hall.length?usados:[],algo:hall.length||parc.length||otros.length};}
function dist(a,b,max){if(Math.abs(a.length-b.length)>max)return 9;var p=[],c,pp=[],i,j,co;
 for(j=0;j<=b.length;j++)p[j]=j;
 for(i=1;i<=a.length;i++){c=[i];for(j=1;j<=b.length;j++){co=a.charAt(i-1)===b.charAt(j-1)?0:1;
   c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+co);
   if(i>1&&j>1&&a.charAt(i-1)===b.charAt(j-2)&&a.charAt(i-2)===b.charAt(j-1))c[j]=Math.min(c[j],pp[j-2]+1);}
  pp=p;p=c;}
 return p[b.length];}
// Erratas: si una palabra no es el principio de ninguna que la web conozca, se propone la que está a UNA letra
// (y solo en palabras de seis o más): con dos letras de margen «igualdad» salía como «igualar» y «toros», «todos».
function corrige(q){var cambio=false,voc=Object.keys(datos.voc);
 var nueva=norm(q).split(' ').filter(Boolean).map(function(w){
  if(w.length<6||/\d/.test(w))return datos.voc[w]?datos.voc[w].o:w;var r=raiz(w);
  if(voc.some(function(v){return v.indexOf(r)===0;}))return datos.voc[w]?datos.voc[w].o:w;
  var max=1,mejor=null,md=9;
  voc.forEach(function(v){var d=dist(w,v,max);if(d>max)return;
   if(d<md||(d===md&&datos.voc[v].n>datos.voc[mejor].n)){md=d;mejor=v;}});
  if(!mejor)return w;cambio=true;return datos.voc[mejor].o;}).join(' ');
 return cambio&&resuelve(pals(nueva),false).algo?nueva:null;}
function busca(){
 var q=inp.value.trim(),pal=pals(q);
 res.textContent='';
 try{history.replaceState(null,'',location.pathname+(q?'?q='+encodeURIComponent(q):'')+location.hash);}catch(e){}
 if(pal.join('').length<3){info.textContent=q?'Escribe al menos tres letras.':'';return;}
 if(!datos){info.textContent='Buscando…';carga();return;}
 var r=resuelve(pal,false);
 // Sin nada con la palabra entera, se prueba por su principio («alquil» encuentra «alquiler»): así se va viendo al escribir.
 if(!r.algo){var r2=resuelve(pal,true);if(r2.algo)r=r2;}
 var hall=r.hall,enT=r.enT,parc=r.parc,otros=r.otros,hayTemas=!!document.querySelector('header nav a[href$="temas.html"]');
 function nombres(l){return l.map(function(t){return '«'+datos.temas[t]+'»';}).join(' y ');}
 function boton(texto,valor){var b=el('button','busca-ej',texto);b.type='button';
  b.onclick=function(){inp.value=valor;busca();};return b;}
 function ofrece(){parc.forEach(function(t){
  var p=el('p','nota busca-tema-mas','Tema relacionado, con '+datos.tn[t]+' promesas: ');
  p.appendChild(boton(datos.temas[t],datos.temas[t]));res.appendChild(p);});}
 function enlaza(texto){if(!otros.length)return;var p=el('p','nota busca-tema-mas',texto+' ');
  otros.forEach(function(o,i){if(i)p.appendChild(document.createTextNode(' · '));
   var a=el('a','pf-mas',o[1]+' →');a.href=base+'temas/'+o[0]+'.html';p.appendChild(a);});res.appendChild(p);}
 if(!r.algo){
  // Nada de nada: se dice claro (no es que el lector haya buscado mal) y se enseña lo que la web sí trata.
  info.textContent='Con «'+q+'» no sale ninguna promesa ni ningún tema de esta web.';
  var c=corrige(q);
  if(c){var pc=el('p','busca-tema-mas','¿Quisiste decir ');pc.appendChild(boton('«'+c+'»',c));pc.appendChild(document.createTextNode('?'));res.appendChild(pc);}
  if(hayTemas){var pt=el('p','nota busca-tema-mas','Los temas que esta web sí trata: ');
   Object.keys(datos.temas).map(function(t){return [t,datos.temas[t]];}).concat(datos.otros||[]).forEach(function(o,i){
    if(i)pt.appendChild(document.createTextNode(' · '));var a=el('a','',o[1]);a.href=base+'temas/'+o[0]+'.html';pt.appendChild(a);});
   res.appendChild(pt);}
  return;}
 if(!hall.length){info.textContent='Ninguna promesa recogida lleva «'+q+'», pero esta web sí trata el asunto:';enlaza('');ofrece();return;}
 var ts=Object.keys(enT),nT=ts.reduce(function(n,t){return n+datos.tn[t];},0),mas=hall.length-nT;
 var tambien=r.usados.length?' (se ha buscado también '+r.usados.map(function(t){return '«'+t+'»';}).join(', ')+')':'';
 if(ts.length)info.textContent=hall.length+' promesas: '+(mas?'las '+nT+' del tema '+nombres(ts)+' y '+mas+' más que '+(mas===1?'lleva':'llevan')+' «'+q+'»':'todas las del tema '+nombres(ts))+', por orden alfabético de partido. Cada una lleva a su prueba.';
 else info.textContent=hall.length+(hall.length===1?' promesa':' promesas')+' con «'+q+'»'+tambien+', por orden alfabético de partido. Cada una lleva a su prueba.';
 if(hayTemas)ts.forEach(function(t){
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
