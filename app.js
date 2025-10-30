let recognition, recognizing=false, transkripText="", seconds=0, timer, mediaStream, recorder, recordedChunks=[];
function $(s){return document.querySelector(s);}
function startTimer(){seconds=0;timer=setInterval(()=>{$("#masa").textContent=new Date(seconds++*1000).toISOString().substr(14,5);},1000);}
function stopTimer(){clearInterval(timer);}
function mulaBaca(){
 transkripText="";$("#transkrip").value="";$("#btn-mula").disabled=true;$("#btn-tamat").disabled=false;startTimer();
 if(!('webkitSpeechRecognition' in window)){alert('Browser tidak sokong pengecaman suara.');return;}
 recognition=new webkitSpeechRecognition();recognition.lang=$("#bahasa").value==="BI"?"en-US":"ms-MY";
 recognition.continuous=true;recognition.interimResults=true;
 recognition.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){let t=e.results[i][0].transcript;if(e.results[i].isFinal)transkripText+=t+' ';else interim+=t;}$("#transkrip").value=transkripText+interim;};
 recognition.start();recognizing=true;
}
function tamatBaca(){
 $("#btn-mula").disabled=false;$("#btn-tamat").disabled=true;stopTimer();
 if(recognizing){recognition.stop();recognizing=false;}analisisBacaan();
}
function wordCount(t){return (t.trim().match(/\b[\p{L}\p{N}’']+\b/gu)||[]).length;}
function analisisBacaan(){
 let teks=$("#transkrip").value;let wpm=Math.round((wordCount(teks)/seconds)*60)||0;
 let pct=Math.min(100,Math.round(wpm));let tp="";let hurai="";
 if(pct<40){tp="TP1";hurai="Bacaan sangat terhad.";}else if(pct<55){tp="TP2";hurai="Bacaan terhad.";}else if(pct<70){tp="TP3";hurai="Bacaan memuaskan.";}else if(pct<85){tp="TP4";hurai="Bacaan kukuh.";}else if(pct<95){tp="TP5";hurai="Bacaan sangat baik.";}else{tp="TP6";hurai="Bacaan cemerlang dan model teladan.";}
 $("#bacaan-peratus").textContent=pct+"%";$("#bacaan-tp").textContent=tp;$("#bacaan-tp").className=tp;$("#bacaan-huraian").textContent=hurai;
 updateLaporan();
}
async function mulaKamera(){
 try{
  mediaStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
  $("#preview").srcObject=mediaStream;
  recorder=new MediaRecorder(mediaStream);recordedChunks=[];
  recorder.ondataavailable=e=>{if(e.data.size>0)recordedChunks.push(e.data);};
  recorder.onstop=()=>{const blob=new Blob(recordedChunks,{type:'video/webm'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='bacaan_liba.webm';a.textContent='Muat Turun Video Bacaan';document.body.appendChild(a);};
  recorder.start();$("#btn-camera").disabled=true;$("#btn-stop-camera").disabled=false;
 }catch(err){alert('Tidak dapat mengakses kamera: '+err);}
}
function hentikanKamera(){
 if(recorder){recorder.stop();}
 if(mediaStream){mediaStream.getTracks().forEach(t=>t.stop());}
 $("#btn-camera").disabled=false;$("#btn-stop-camera").disabled=true;
}
function getTP(m){if(m<4)return{tajuk:"TP1",huraian:"Sangat Terhad"};if(m<5)return{tajuk:"TP2",huraian:"Terhad"};if(m<7)return{tajuk:"TP3",huraian:"Memuaskan"};if(m<9)return{tajuk:"TP4",huraian:"Kukuh"};if(m<10)return{tajuk:"TP5",huraian:"Sangat Baik"};return{tajuk:"TP6",huraian:"Cemerlang"};}
function updateLaporan(){
 const peratus=parseInt($("#bacaan-peratus").textContent)||0;
 const markahKuiz=parseInt($("#markah-kuiz").textContent)||0;
 const jumlah=Math.round((peratus*0.7)+((markahKuiz*10)*0.3));
 $("#jumlah-akhir").textContent=jumlah+"%";
 const tpAkhir=getTP(Math.round(jumlah/10));
 $("#tp-akhir").textContent=tpAkhir.tajuk+" – "+tpAkhir.huraian;
 $("#tp-akhir").className=tpAkhir.tajuk;
 $("#status-akhir").textContent=jumlah>=50?"MENGUASAI":"TIDAK MENGUASAI";
}
$("#btn-cetak")?.addEventListener('click',()=>{
 const laporan=document.createElement('div');
 laporan.innerHTML=`
 <h2>PSS ABU NAWAS SK BUKIT TONGKAT</h2>
 <h3>LAPORAN PENILAIAN BACAAN INTERAKTIF (LIBA)</h3>
 <p><b>Peratus Bacaan:</b> ${$("#bacaan-peratus").textContent}</p>
 <p><b>TP Bacaan:</b> ${$("#bacaan-tp").textContent}</p>
 <p><b>Markah Kuiz:</b> ${$("#markah-kuiz").textContent}</p>
 <p><b>TP Kuiz:</b> ${$("#tp-kuiz").textContent}</p>
 <p><b>Jumlah Markah:</b> ${$("#jumlah-akhir").textContent}</p>
 <p><b>TP Akhir:</b> ${$("#tp-akhir").textContent}</p>
 <p><b>Status:</b> ${$("#status-akhir").textContent}</p>
 <div class='signature-area'>
  <div class='signature'><hr>Guru Bahasa Melayu</div>
  <div class='signature'><hr>Guru Bahasa Inggeris</div>
  <div class='signature'><hr>Guru PSS</div>
 </div>`;
 const printWindow=window.open('','','width=800,height=600');
 printWindow.document.write('<html><head><title>Laporan Cetak LIBA</title><style>body{text-align:center;font-family:sans-serif;}h2,h3{color:#004aad;}hr{width:200px;margin:20px auto;border:1px solid #004aad;}</style></head><body>');
 printWindow.document.write(laporan.innerHTML);
 printWindow.document.write('</body></html>');
 printWindow.document.close();printWindow.print();
});
document.addEventListener('DOMContentLoaded',()=>{
 $("#btn-mula").addEventListener('click',mulaBaca);
 $("#btn-tamat").addEventListener('click',tamatBaca);
 $("#btn-camera").addEventListener('click',mulaKamera);
 $("#btn-stop-camera").addEventListener('click',hentikanKamera);
});
