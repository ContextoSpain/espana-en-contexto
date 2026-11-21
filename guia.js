(function(){
'use strict';
var yo=document.currentScript, base=yo?yo.src.replace(/guia\.js.*$/,''):'';
function hay(f){return !!document.querySelector('header nav a[href$="'+f+'"]');}
var sitio=(document.querySelector('.sitio')||{}).textContent||'Esta web';
var pasos=[
 {t:'Cómo usar esta web',h:'<p><b>'+sitio+'</b> reúne lo que cada partido prometió, dijo y votó, con la prueba enlazada. No recomienda el voto.</p><p>El menú va de lo más sencillo a lo más detallado. Este recorrido dura un minuto.</p>'},
 {t:'Promesas',ir:'partidos/promesas.html',si:'partidos/promesas.html',h:'<p><b>Lo más rápido.</b> Cada promesa del programa de 2023 y, a su lado, qué pasó con ella. Se elige un partido y un tema.</p>'},
 {t:'Partidos',ir:'partidos/index.html',si:'partidos/index.html',h:'<p><b>El detalle, partido a partido:</b> su programa, cada promesa con su prueba y sus votos, y lo que dijo en el Congreso frente a lo que votó.</p>'},
 {t:'Temas',ir:'temas.html',si:'temas.html',h:'<p><b>Un asunto y los nueve partidos a la vez:</b> vivienda, sanidad, trenes… Qué prometió cada uno, qué dijo y qué votó.</p>'},
 {t:'Votaciones, Actualidad y Hemeroteca',ir:'votaciones.html',h:'<p><b>El archivo.</b> Cada votación de las Cortes con el voto de cada diputado; los titulares de la semana en medios de distinta orientación, y las noticias guardadas mes a mes.</p>'},
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
if(!ya)abre();
var up=document.createElement('a');up.href='#';up.className='arriba';up.textContent='↑ Arriba';up.hidden=true;
document.body.appendChild(up);
window.addEventListener('scroll',function(){up.hidden=window.scrollY<900;},{passive:true});
})();
