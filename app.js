// LIBA v2.0 - ikut struktur PDF
let recognition, recognizing=false;
let seconds=0, timer=null;
let mediaStream=null, recorder=null, recordedChunks=[];
const rekodData = [];

const $ = (s)=>document.querySelector(s);

function showHalamanUtama(){
  $("#halaman-utama").classList.remove("hidden");
  $("#halaman-analisis").classList.add("hidden");
}
function showHalamanAnalisis(){
  $("#halaman-utama").classList.add("hidden");
  $("#halaman-analisis").classList.remove("hidden");
}

function startTimer(){
  seconds = 0;
  timer = setInterval(()=>{
    seconds++;
    $("#masa").textContent = new Date(seconds*1000).toISOString().substr(14,5);
  },1000);
}
function stopTimer(){ if(timer) clearInterval(timer); }

function mulaBaca(){
  $("#btn-mula").disabled = true;
  $("#btn-tamat").disabled = false;
  $("#transkrip").value = "";
  startTimer();

  if (!('webkitSpeechRecognition' in window)){
    alert("Pelayar tidak sokong pengecaman suara.");
    return;
  }
  recognition = new webkitSpeechRecognition();
  recognition.lang = $("#bahasa").value === "BI" ? "en-US" : "ms-MY";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognizing = true;
  let finalTxt = "";
  recognition.onresult = (e)=>{
    let interim = "";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const t = e.results[i][0].transcript;
      if(e.results[i].isFinal) finalTxt += t + " ";
      else interim += t;
    }
    $("#transkrip").value = finalTxt + interim;
  };
  recognition.start();
}

function tamatBaca(){
  $("#btn-mula").disabled = false;
  $("#btn-tamat").disabled = true;
  stopTimer();
  if (recognizing && recognition){
    recognition.stop();
    recognizing = false;
  }
  analisisBacaan();
  simpanRekod();
}

function wordCount(t){
  return (t.trim().match(/\b[\p{L}\p{N}’']+\b/gu) || []).length;
}

function analisisBacaan(){
  const teks = $("#transkrip").value;
  const wc = wordCount(teks);
  const wpm = seconds>0 ? Math.round((wc/seconds)*60) : 0;
  const peratus = Math.min(100, Math.round(wpm));
  let tp="", h="";
  if (peratus < 40){tp="TP1";h="Bacaan sangat terhad.";}
  else if (peratus < 55){tp="TP2";h="Bacaan terhad.";}
  else if (peratus < 70){tp="TP3";h="Bacaan memuaskan.";}
  else if (peratus < 85){tp="TP4";h="Bacaan kukuh.";}
  else if (peratus < 95){tp="TP5";h="Bacaan sangat baik.";}
  else {tp="TP6";h="Bacaan cemerlang dan model teladan.";}

  $("#bacaan-peratus").textContent = peratus + "%";
  $("#bacaan-tp").textContent = tp;
  $("#bacaan-huraian").textContent = h;

  // kira laporan gabungan
  kemaskiniLaporan();
}

async function mulaKamera(){
  try{
    mediaStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    const v = $("#preview");
    v.style.display = "block";
    v.srcObject = mediaStream;
    recorder = new MediaRecorder(mediaStream);
    recordedChunks = [];
    recorder.ondataavailable = e=>{ if(e.data.size>0) recordedChunks.push(e.data); };
    recorder.onstop = ()=>{
      const blob = new Blob(recordedChunks,{type:'video/webm'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bacaan_liba.webm";
      a.textContent = "Muat Turun Video Bacaan";
      document.body.appendChild(a);
    };
    recorder.start();
    $("#btn-camera").disabled = true;
    $("#btn-stop-camera").disabled = false;
  }catch(err){ alert("Tidak dapat akses kamera: "+err); }
}
function hentikanKamera(){
  if(recorder) recorder.stop();
  if(mediaStream) mediaStream.getTracks().forEach(t=>t.stop());
  $("#btn-camera").disabled = false;
  $("#btn-stop-camera").disabled = true;
}

function janaKuiz(){
  const teks = $("#transkrip").value.trim();
  const bahasa = $("#bahasa").value;
  const kont = $("#kuiz-container");
  kont.innerHTML = "";
  if(!teks){ alert("Tiada transkrip untuk jana kuiz."); return; }
  const words = teks.split(/\s+/).map(w=>w.replace(/[.,?!]/g,"")).filter(w=>w.length>4);
  const jum = Math.min(5, words.length);
  for(let i=0;i<jum;i++){
    const w = words[Math.floor(Math.random()*words.length)];
    const salah = bahasa==="BM" ? ["cantik","pantas","besar","kecil","gembira","baik"] : ["beautiful","fast","slow","big","small","happy"];
    const pilihan = [w, ...salah.sort(()=>0.5-Math.random()).slice(0,3)].sort(()=>Math.random()-0.5);
    const div = document.createElement("div");
    div.className = "soalan";
    div.innerHTML = `<b>${bahasa==="BM"?"Soalan":"Question"} ${i+1}:</b> ${bahasa==="BM"?"Apakah maksud perkataan":"What is the meaning of the word"} "${w}"?<br>` +
      pilihan.map((p,idx)=>`<label><input type="radio" name="q${i}" value="${p}"> ${String.fromCharCode(65+idx)}) ${p}</label><br>`).join("");
    kont.appendChild(div);
  }
}

function semakKuiz(){
  const soalan = document.querySelectorAll("#kuiz-container .soalan");
  if(!soalan.length){ alert("Tiada kuiz."); return; }
  let betul=0;
  soalan.forEach(s=>{
    const match = s.innerHTML.match(/"([^"]+)"/);
    const jk = match ? match[1] : "";
    const btns = s.querySelectorAll("input[type=radio]");
    btns.forEach(b=>b.disabled=true);
    const dipilih = s.querySelector("input[type=radio]:checked");
    if(dipilih && dipilih.value.toLowerCase()===jk.toLowerCase()){
      betul++; s.style.background="#c8f7c5";
    } else {
      s.style.background="#f7c5c5";
    }
  });
  const markah = betul*2;
  $("#markah-kuiz").textContent = markah + " / 10";
  let tp = "-";
  if (markah < 4) tp="TP1 – Sangat Terhad";
  else if (markah < 5) tp="TP2 – Terhad";
  else if (markah < 7) tp="TP3 – Memuaskan";
  else if (markah < 9) tp="TP4 – Kukuh";
  else if (markah < 10) tp="TP5 – Sangat Baik";
  else tp="TP6 – Cemerlang";
  $("#tp-kuiz").textContent = tp;
  kemaskiniLaporan();
}

function kemaskiniLaporan(){
  const peratus = parseInt($("#bacaan-peratus").textContent) || 0;
  const mkKuiz = parseInt($("#markah-kuiz").textContent) || 0;
  const jumlah = Math.round((peratus*0.7) + ((mkKuiz*10)*0.3));
  $("#jumlah-akhir").textContent = jumlah + "%";
  let tp = "", h="";
  const skor = Math.round(jumlah/10);
  if (skor <= 3){tp="TP1";h="Sangat Terhad";}
  else if (skor === 4){tp="TP2";h="Terhad";}
  else if (skor === 5){tp="TP3";h="Memuaskan";}
  else if (skor === 6){tp="TP4";h="Kukuh";}
  else if (skor === 7){tp="TP5";h="Sangat Baik";}
  else {tp="TP6";h="Cemerlang";}
  $("#tp-akhir").textContent = tp + " – " + h;
  $("#status-akhir").textContent = jumlah >= 50 ? "MENGUASAI" : "TIDAK MENGUASAI";
}

function simpanRekod(){
  const now = new Date();
  const tr = document.createElement("tr");
  const nama = $("#nama").value || "-";
  const kelas = $("#kelas").value || "-";
  const teks = $("#transkrip").value;
  const wpm = seconds>0 ? Math.round((wordCount(teks)/seconds)*60) : 0;
  tr.innerHTML = `
    <td>${now.toLocaleDateString("ms-MY")}</td>
    <td>${now.toLocaleTimeString("ms-MY")}</td>
    <td>${nama}</td>
    <td>${kelas}</td>
    <td>${seconds}</td>
    <td>${wpm}</td>
    <td>${$("#bacaan-peratus").textContent || "0%"}</td>
    <td>${$("#bacaan-tp").textContent || "-"}</td>
    <td>${$("#markah-kuiz").textContent || "0 / 10"}</td>
  `;
  $("#rekod-body").appendChild(tr);
}

function eksportData(){
  alert("Fungsi eksport boleh ditambah ke CSV / Sheets.");
}

function cetakLaporan(){
  const w = window.open("","","width=800,height=600");
  w.document.write("<html><head><title>Laporan LIBA</title></head><body>");
  w.document.write("<h2>PSS ABU NAWAS SK BUKIT TONGKAT</h2>");
  w.document.write("<h3>LAPORAN PENILAIAN BACAAN INTERAKTIF (LIBA)</h3>");
  w.document.write(`<p><b>Nama:</b> ${$("#nama").value || "-"}</p>`);
  w.document.write(`<p><b>Kelas:</b> ${$("#kelas").value || "-"}</p>`);
  w.document.write(`<p><b>Peratus Bacaan:</b> ${$("#bacaan-peratus").textContent}</p>`);
  w.document.write(`<p><b>TP Bacaan:</b> ${$("#bacaan-tp").textContent}</p>`);
  w.document.write(`<p><b>Markah Kuiz:</b> ${$("#markah-kuiz").textContent}</p>`);
  w.document.write(`<p><b>TP Kuiz:</b> ${$("#tp-kuiz").textContent}</p>`);
  w.document.write(`<p><b>Jumlah Markah:</b> ${$("#jumlah-akhir").textContent}</p>`);
  w.document.write(`<p><b>TP Akhir:</b> ${$("#tp-akhir").textContent}</p>`);
  w.document.write(`<p><b>Status:</b> ${$("#status-akhir").textContent}</p>`);
  w.document.write("<p>&nbsp;</p><p>_________________________<br>Guru Bahasa Melayu</p>");
  w.document.write("<p>_________________________<br>Guru Bahasa Inggeris</p>");
  w.document.write("<p>_________________________<br>Guru PSS</p>");
  w.document.write("</body></html>");
  w.document.close();
  w.print();
}

document.addEventListener("DOMContentLoaded", ()=>{
  $("#btn-mula").addEventListener("click", mulaBaca);
  $("#btn-tamat").addEventListener("click", tamatBaca);
  $("#btn-camera").addEventListener("click", mulaKamera);
  $("#btn-stop-camera").addEventListener("click", hentikanKamera);
  $("#btn-jana-kuiz").addEventListener("click", janaKuiz);
  $("#btn-semak-kuiz").addEventListener("click", semakKuiz);
  $("#btn-export").addEventListener("click", eksportData);
  $("#btn-analisis").addEventListener("click", showHalamanAnalisis);
  $("#btn-kembali").addEventListener("click", showHalamanUtama);
  $("#btn-cetak").addEventListener("click", cetakLaporan);
});
