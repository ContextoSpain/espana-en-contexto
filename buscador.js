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
  datos=j;busca();
 }).catch(function(){pidiendo=false;info.textContent='El buscador no está disponible ahora mismo.';});}
function busca(){
 var q=inp.value.trim(),pal=norm(q).split(' ').filter(function(p){return p.length>1;}).map(raiz);
 res.textContent='';
 try{history.replaceState(null,'',location.pathname+(q?'?q='+encodeURIComponent(q):'')+location.hash);}catch(e){}
 if(pal.join('').length<3){info.textContent=q?'Escribe al menos tres letras.':'';return;}
 if(!datos){info.textContent='Buscando…';carga();return;}
 var hall=datos.filas.filter(function(f){return pal.every(function(p){return f.k.indexOf(' '+p)>=0;});});
 if(!hall.length){info.textContent='Ninguna de las promesas recogidas en esta web lleva «'+q+'». Prueba con otra palabra o solo con su principio («alquil» encuentra «alquiler» y «alquileres»).';return;}
 info.textContent=hall.length+(hall.length===1?' promesa':' promesas')+' con «'+q+'», por orden alfabético de partido. Cada una lleva a su prueba.';
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
