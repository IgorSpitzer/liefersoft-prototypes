const menu = {
 beef:['Beef-Patty',450,.15], chicken:['Crispy Chicken',450,.14], cheese:['Cheddar',100,.03], bacon:['Bacon',200,.06], lettuce:['Salat',50,.07], tomato:['Tomate',50,.08], onion:['Rote Zwiebel',50,.04], pickles:['Gurken',50,.035], egg:['Spiegelei',150,.075], sauce:['Haussauce',50,.025], fries:['Pommes',350,0], shake:['Vanilleshake',500,0]
};
const $=selector=>document.querySelector(selector);
const money=cents=>(cents/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
const image=id=>'<img draggable="false" alt="" src="img/'+id+'.webp">';
const embedded = window.parent !== window && new URLSearchParams(location.search).get('embed') === '1';
function sendSelection(){
 const sideIds=['fries','shake'];
 const selection={
  version:1, base:'brioche', layers:items.filter(id=>!sideIds.includes(id)),
  sides:items.filter(id=>sideIds.includes(id)), currency:'EUR', previewTotalCents:total()
 };
 window.parent.postMessage({type:'liefersoft:burger-selected',selection},location.origin);
}
const dialog=$('dialog'), panel=$('#panel');
let items=['beef','cheese'], orderNumber=42, service='Abholung', busy=false, serial=0;
const counts=()=>items.reduce((result,id)=>{result[id]=(result[id]||0)+1;return result}, {});
const total=()=>items.reduce((value,id)=>value+menu[id][1],300);
const orderId=()=>String(orderNumber).padStart(3,'0');
function render(){
 const amounts=counts();
 $('.to-lines').innerHTML='<li><span>Brioche-Bun</span><b>'+money(300)+'</b></li>'+Object.entries(amounts).map(([id,n])=>'<li><span>'+(n>1?n+' × ':'')+menu[id][0]+'</span><button data-remove="'+id+'" aria-label="'+menu[id][0]+' entfernen">−</button><b>'+money(n*menu[id][1])+'</b></li>').join('');
 $('.to-total b').textContent=money(total());
 $('.to-bill-meta').textContent='Bestellung '+orderId()+(embedded?'':(' · '+service));
 $('#mode').textContent=embedded?'Schließen ×':service+' ▾';
 let bottom=.153;
 const stack=$('.to-stack');
 const previous=[...stack.querySelectorAll('button')];
 items.forEach((id,index)=>{
  if(!menu[id][2])return;
  let node=previous.find(n=>n.dataset.index==index&&n.dataset.id===id);
  if(!node){node=document.createElement('button');node.className='to-piece';node.innerHTML=image(id);stack.append(node)}
  node.dataset.index=index;node.dataset.id=id;node.dataset.render=serial;
  node.setAttribute('aria-label',menu[id][0]+' entfernen');
  node.style.cssText='--b:'+bottom+';--w:.99;--z:'+(index+1)+';--tilt:'+(index%2?2:-2)+'deg;--d:0ms';
  bottom+=menu[id][2];
 });
 previous.filter(node=>node.dataset.render!=serial).forEach(node=>node.remove());serial++;
 const height=(5.8+(bottom-.153)*20).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' cm';
 $('.to-ruler span').textContent=$('.to-stat b').textContent=height;
 $('.to-stage').style.cssText='--H:'+(bottom+1.09)+';--top:'+(bottom+.52);
 $('.to-lid').style.setProperty('--b',bottom+.35);
 for(const side of ['fries','shake'])$('.to-side-'+side).classList.toggle('is-on',!!amounts[side]);
 document.querySelectorAll('[data-add]').forEach(node=>{
  const n=amounts[node.dataset.add]||0;node.classList.toggle('is-on',!!n);
  node.querySelector('.to-count').style.display=n?'grid':'none';node.querySelector('.to-count').textContent=n;
 });
}
$('.to-tray-in').innerHTML=Object.entries(menu).map(([id,[name,price]])=>(id==='fries'?'<span class="to-split"></span>':'')+'<button class="to-tile" data-add="'+id+'"><span class="to-thumb">'+image(id)+'</span><span class="to-name">'+name+'</span><span class="to-price">'+money(price)+'</span><span class="to-count"></span></button>').join('');
function show(html){panel.innerHTML=html;if(!dialog.open)dialog.showModal()}
function close(){dialog.close();busy=false;render()}
function restart(){items=['beef','cheese'];service='Abholung';close()}
function servicePanel(){
 show('<small>Bestellart</small><h2>Wohin darf’s gehen?</h2><button class="primary" data-action="pickup">Selbst abholen</button><form id="table"><label>Tischnummer<input name="table" inputmode="numeric" pattern="[0-9]{1,3}" maxlength="3" required placeholder="z. B. 12"></label><button>Am Tisch servieren</button></form><button data-action="back">Zurück</button>');
}
function checkout(){
 if(embedded){
  show('<small>Burger Studio</small><h2>Dein Burger ist fertig.</h2><p>'+money(total())+'</p><button class="primary" data-action="cart">In den Warenkorb</button><button data-action="back">Bearbeiten</button>');
  return;
 }
 show('<small>Demo · Bestellung '+orderId()+'</small><h2>Alles dabei?</h2><p>'+service+' · '+money(total())+'</p><p>Brioche-Bun, '+(Object.entries(counts()).map(([id,n])=>n+' × '+menu[id][0]).join(', ')||'ohne Extras')+'</p><button class="primary" data-action="pay">Testzahlung abschließen</button><button data-action="back">Bearbeiten</button>');
}
document.addEventListener('submit',e=>{if(e.target.id==='table'){e.preventDefault();service='Tisch '+new FormData(e.target).get('table');close()}});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(dialog.open){
  switch(b.dataset.action){
   case 'cart':b.disabled=true;sendSelection();break;
   case 'back':close();break;
   case 'pickup':service='Abholung';close();break;
   case 'restart':restart();break;
   case 'pay':show('<small>Testbestellung abgeschlossen</small><h2>Bestellung '+orderId()+'</h2><p>'+service+' · '+money(total())+'</p><button class="primary" data-action="next">Nächster Gast</button>');orderNumber++;break;
   case 'next':restart();break;
  }return;
 }
 if(busy)return;
 if(b.id==='finish'){busy=true;$('.to-lid').style.setProperty('--b',.153+items.reduce((sum,id)=>sum+menu[id][2],0));setTimeout(checkout,550);return}
 if(b.id==='mode'){servicePanel();return}
 if(b.id==='reset'){show('<h2>Neu anfangen?</h2><p>Deine aktuelle Auswahl wird zurückgesetzt.</p><button class="primary" data-action="restart">Neu starten</button><button data-action="back">Behalten</button>');return}
 if(b.dataset.add){if(items.length>=32){show('<h2>Burger voll!</h2><p>Entferne eine Zutat, um eine andere hinzuzufügen.</p><button data-action="back">Zurück</button>');return}items.push(b.dataset.add)}
 else if(b.dataset.remove){items.splice(items.lastIndexOf(b.dataset.remove),1)}
 else if(b.dataset.index!==undefined){items.splice(Number(b.dataset.index),1)}
 else return;
 render();
});
dialog.addEventListener('cancel',event=>{event.preventDefault();if(panel.querySelector('[data-action="next"]'))restart();else close()});
render();

if(embedded){
 $('#mode').textContent='Schließen ×';
 $('#mode').addEventListener('click',event=>{
  event.stopPropagation();
  window.parent.postMessage({type:'liefersoft:burger-cancel'},location.origin);
 });
}
