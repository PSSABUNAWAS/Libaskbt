const $=s=>document.querySelector(s);
let recognition,timer,seconds=0;
function startTimer(){seconds=0;timer=setInterval(()=>{$("#masa").textContent=new Date(seconds++*1000).toISOString().substr(14,5);},1000);}
function stopTimer(){clearInterval(timer);}
function mulaBaca(){
 $("#btn-mula").disabled=true;$("#btn-tamat").disabled=false;$("#transkrip").value="";startTimer();
 if(!('webkitSpeechRecognition'in window)){alert('Browser tidak sokong.');return;}
 recognition=new webkitSpeechRecognition();recognition.lang=$("#bahasa").value==="BI"?"en-US":"ms-MY";recognition.continuous=true;recognition.interimResults=true;
 recognition.onresult=e=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++){t+=e.results[i][0].transcript+' ';}$("#transkrip").value=t;};recognition.start();}
function tamatBaca(){
 $("#btn-mula").disabled=false;$("#btn-tamat").disabled=true;stopTimer();
 if(recognition)recognition.stop();kiraAnalisis();}
function wordCount(t){return(t.trim().match(/\b[\p{L}\p{N}’']+\b/gu)||[]).length;}
function kiraAnalisis(){let teks=$("#transkrip").value;let wpm=Math.round((wordCount(teks)/seconds)*60)||0;let pct=Math.min(100,wpm);let tp,h;
 if(pct<40){tp='TP1';h='Bacaan sangat terhad.';}else if(pct<55){tp='TP2';h='Bacaan terhad.';}else if(pct<70){tp='TP3';h='Memuaskan.';}
 else if(pct<85){tp='TP4';h='Kukuh.';}else if(pct<95){tp='TP5';h='Sangat Baik.';}else{tp='TP6';h='Cemerlang.';}
 $("#bacaan-peratus").textContent=pct+'%';$("#bacaan-tp").textContent=tp;$("#bacaan-huraian").textContent=h;}
function janaKuiz(){let teks=$("#transkrip").value;if(!teks){alert('Tiada teks.');return;}const kont=$("#kuiz-container");kont.innerHTML='';
 const words=teks.split(/\s+/).filter(w=>w.length>4);for(let i=0;i<5&&i<words.length;i++){let w=words[Math.floor(Math.random()*words.length)];
 let div=document.createElement('div');div.innerHTML=`<b>Soalan ${i+1}:</b> Apakah maksud perkataan "${w}"?<br>
 <label><input type='radio' name='q${i}' value='${w}'>A) ${w}</label><br>
 <label><input type='radio' name='q${i}' value='lain1'>B) lain1</label><br>
 <label><input type='radio' name='q${i}' value='lain2'>C) lain2</label><br>`;kont.appendChild(div);}}
function semakKuiz(){let betul=0;for(let i=0;i<5;i++){let c=document.querySelector(`input[name=q${i}]:checked`);if(c&&c.value!=='lain1'&&c.value!=='lain2')betul++;}
 let mark=betul*2;$("#markah-kuiz").textContent=mark+' / 10';$("#tp-kuiz").textContent=mark>=8?'TP5':'TP3';}
function showAnalisis(){$("#halaman-utama").classList.remove('active');$("#halaman-analisis").classList.add('active');}
function showUtama(){$("#halaman-utama").classList.add('active');$("#halaman-analisis").classList.remove('active');}
$("#btn-mula").addEventListener('click',mulaBaca);$("#btn-tamat").addEventListener('click',tamatBaca);
$("#btn-jana-kuiz").addEventListener('click',janaKuiz);$("#btn-semak-kuiz").addEventListener('click',semakKuiz);
$("#btn-analisis").addEventListener('click',showAnalisis);$("#btn-kembali").addEventListener('click',showUtama);