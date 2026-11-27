(function(){
'use strict';
var yo=document.currentScript, base=yo?yo.src.replace(/guia\.js.*$/,''):'';
function hay(f){return !!document.querySelector('header nav a[href$="'+f+'"]');}
var sitio=(document.querySelector('.sitio')||{}).textContent||'Esta web';
var pasos=[
 {t:'Cómo usar esta web',h:'<p><b>'+sitio+'</b> reúne lo que cada partido prometió, dijo y votó, con la prueba enlazada. No recomienda el voto.</p><p>El menú va de lo más sencillo a lo más detallado. Este recorrido dura un minuto.</p>'},
 {t:'Portada y buscador',ir:'index.html',si:'partidos/promesas.html',h:'<p><b>Lo más directo.</b> En la portada hay una caja: escribe una palabra («alquiler», «sanidad», «Ucrania»…) y sale lo que cada partido prometió, lo que se dijo en el Congreso y las votaciones, cada cosa con su prueba.</p><p>Si te equivocas al escribir, te propone la palabra; si la web no trata el asunto, te lo dice.</p>'},
 {t:'Promesas',ir:'partidos/promesas.html',si:'partidos/promesas.html',h:'<p><b>Promesa a promesa.</b> Cada promesa del programa de 2023 y, a su lado, qué pasó con ella. Se elige un partido y, si se quiere, un tema.</p>'},
 {t:'Partidos',ir:'partidos/index.html',si:'partidos/index.html',h:'<p><b>El detalle, partido a partido:</b> su programa, cada promesa con su prueba y sus votos, y lo que dijo en el Congreso frente a lo que votó.</p>'},
 {t:'Temas',ir:'temas.html',si:'temas.html',h:'<p><b>Un asunto y los nueve partidos a la vez:</b> vivienda, sanidad, trenes… Qué prometió cada uno, qué dijo y qué votó.</p>'},
 {t:'Votaciones, Actualidad y Hemeroteca',ir:'votaciones.html',h:'<p><b>El archivo.</b> Cada votación de las Cortes con el voto de cada grupo y de cada formación; los titulares de la semana en medios de distinta orientación, y las noticias guardadas mes a mes.</p>'},
 {t:'Anclas, Constitución y Metodología',ir:'metodologia.html',h:'<p><b>El fondo.</b> Los datos lentos (economía, calidad democrática…), la Constitución para consultarla y cómo se hace todo esto.</p><p>Esta guía se abre de nuevo con el botón «Guía» del menú.</p>'}
].filter(function(p){return !p.si||hay(p.si);});
var d=document.createElement('dialog');
if(!d.showModal)return;
d.className='guia';d.setAttribute('aria-labelledby','guia-t');
d.innerHTML='<button type="button" class="guia-x" id="guia-x" aria-label="Cerrar la guía">×</button><p class="guia-paso" id="guia-n"></p><h2 id="guia-t"></h2><div id="guia-c"></div><div class="guia-puntos" id="guia-p"></div><div class="guia-pie"><button type="button" id="guia-ant">Anterior</button><a id="guia-ir" class="guia-ir"></a><button type="button" id="guia-sig"></button></div>';
document.body.appendChild(d);
var i=0;function el(x){return document.getElementById(x);}
function pinta(){var p=pasos[i];
 el('guia-n').textContent=i?('Paso '+i+' de '+(pasos.length-1)):'Guía rápida';
 el('guia-t').textContent=p.t;el('guia-c').innerHTML=p.h;
 el('guia-ant').hidden=!i;
 var ir=el('guia-ir');ir.hidden=!p.ir;if(p.ir){ir.href=base+p.ir;ir.textContent='Ir a '+p.t.split(',')[0].split(' y ')[0];}
 el('guia-sig').textContent=i<pasos.length-1?'Siguiente':'Entendido';
 el('guia-p').innerHTML=pasos.map(function(_,k){return '<i'+(k===i?' class="on"':'')+'></i>';}).join('');}
function visto(){try{localStorage.setItem('guia-vista','1');}catch(e){}}
function abre(){i=0;pinta();d.showModal();el('guia-sig').focus();visto();}
el('guia-ant').onclick=function(){if(i){i--;pinta();}};
el('guia-sig').onclick=function(){if(i<pasos.length-1){i++;pinta();}else d.close();};
el('guia-x').onclick=function(){d.close();};
d.addEventListener('click',function(e){if(e.target===d)d.close();});
var b=el('abre-guia');if(b){b.hidden=false;b.onclick=abre;}
var ya='1';try{ya=localStorage.getItem('guia-vista');}catch(e){}
// Sola, solo en la portada (26-11-2026): quien llega por un enlace a una promesa debe ver la promesa, no la guía.
var enPortada=location.href.split(/[?#]/)[0].replace(/index\.html$/,'');
if(!ya&&enPortada===base)abre();
var up=document.createElement('a');up.href='#';up.className='arriba';up.textContent='↑ Arriba';up.hidden=true;
document.body.appendChild(up);
window.addEventListener('scroll',function(){up.hidden=window.scrollY<900;},{passive:true});
// «Copiar enlace» en cada promesa: para enviar a alguien una promesa concreta con su prueba, no la página entera.
function copia(u,b){
 function ok(){var t=b.innerHTML;b.textContent='Enlace copiado ✓';b.classList.add('ok');
  setTimeout(function(){b.innerHTML=t;b.classList.remove('ok');},2200);}
 function a_mano(){var a=document.createElement('textarea');a.value=u;a.setAttribute('readonly','');
  a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();var r=false;
  try{r=document.execCommand('copy');}catch(e){}document.body.removeChild(a);
  if(r)ok();else window.prompt('Copia este enlace:',u);}
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,a_mano);else a_mano();}
// Desde el 26-11-2026 es un icono (antes, la palabra «Copiar enlace» repetida en cada promesa).
var ICONO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';
function boton(u){var b=document.createElement('button');b.type='button';b.className='copia-enlace';
 b.innerHTML=ICONO;b.setAttribute('aria-label','Copiar enlace a esta promesa');b.title='Copia la dirección de esta promesa, con su prueba, para enviarla';
 b.onclick=function(){copia(u,b);};return b;}
var aqui=location.href.split('#')[0].split('?')[0];
[].forEach.call(document.querySelectorAll('article.comp[id]'),function(a){
 var m=a.querySelector('.comp-meta');if(m)m.appendChild(boton(aqui+'#'+a.id));});
[].forEach.call(document.querySelectorAll('.pf-fila a.pf-mas'),function(a){a.parentNode.appendChild(boton(a.href));});
// En el móvil, las entradas largas se pliegan a cuatro líneas con un «Leer más»: medido el 25-11-2026, en las
// páginas de tema había que pasar entre una y dos pantallas de texto antes de llegar a lo primero útil. Sin
// JavaScript no se pliega nada: el texto sigue entero en la página.
if(window.matchMedia&&matchMedia('(max-width:640px)').matches){
 function pliega(p){
  p.classList.add('plegado');var b=document.createElement('button');b.type='button';b.className='leer-mas';
  b.textContent='Leer más';b.setAttribute('aria-expanded','false');
  b.onclick=function(){var c=p.classList.toggle('plegado');b.textContent=c?'Leer más':'Leer menos';b.setAttribute('aria-expanded',c?'false':'true');};
  p.parentNode.insertBefore(b,p.nextSibling);}
 [].forEach.call(document.querySelectorAll('p.entrada, p.nota, p.aviso'),function(p){
  // El aviso de neutralidad no se corta a media frase (26-11-2026): se pliega solo si pasa de unas siete líneas.
  if(!p.closest||p.closest('details,article,form,dialog,table,header,footer')||p.scrollHeight<(p.classList.contains('aviso')?240:170))return;
  pliega(p);});
 // 26-11-2026: «En qué se apoya» de cada promesa, a cuatro líneas (de media ocupaba diez; la página de un partido
 // medía 56 pantallas). Quien quiera la prueba entera la abre; sin JavaScript se ve entera.
 [].forEach.call(document.querySelectorAll('article.comp dt'),function(dt){
  var dd=dt.nextElementSibling;
  if(!/se apoya/i.test(dt.textContent)||!dd||dd.tagName!=='DD'||dd.scrollHeight<150)return;pliega(dd);});
 [].forEach.call(document.querySelectorAll('p.tema-paso.nota'),function(p){if(p.scrollHeight>=150)pliega(p);});
 // Tablas que siguen a la derecha (las de datos): se dice, porque en el móvil no se nota.
 [].forEach.call(document.querySelectorAll('.tw'),function(w){
  if(w.scrollWidth<=w.clientWidth+4)return;var d=document.createElement('p');d.className='desliza';
  d.textContent='La tabla sigue a la derecha: desliza →';w.parentNode.insertBefore(d,w);});}
})();
