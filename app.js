// LIBA v2.0 basic script
let recognition, recognizing = false;
let seconds = 0, timer = null;

const $ = (s)=>document.querySelector(s);

function startTimer(){
  seconds = 0;
  timer = setInterval(()=>{
    seconds++;
    $("#masa").textContent = new Date(seconds*1000).toISOString().substr(14,5);
  }, 1000);
}
function stopTimer(){
  if (timer) clearInterval(timer);
}

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
  recognition.onresult = (event)=>{
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++){
      const txt = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTxt += txt + " ";
      else interim += txt;
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
}

document.addEventListener("DOMContentLoaded", ()=>{
  $("#btn-mula").addEventListener("click", mulaBaca);
  $("#btn-tamat").addEventListener("click", tamatBaca);
});
