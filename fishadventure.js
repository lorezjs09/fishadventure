// =======================
// CONFIG
// =======================
var state = "menu";
var dialogIndex = 0;
var blockNextClick = false;

var dialogues = [
  {name: "Santiago", text: "Ehi... finalmente sei arrivato! Io sono Santiago."},
  {name: "Armando", text: "We! sono Armando , qui non è un bel posto."},
  {name: "Enrico", text: "E io sono Enrico. Cerco di mantenere la calma... ma è dura."},
  {name: "Santiago", text: "Fish City è diventata pericolosa e noi dobbiamo salvarla!"},
  {name: "Armando", text: "Dobbiamo trovare un modo per riuscire a scappare e andare nel lato ancora sano della città"},
  {name: "Enrico", text: "Ci servono soldi, documenti e vestiti."},
  {name: "Santiago", text: "Ci aiuterai?"}
];

var finalDialogues = [
  {name: "Santiago", text: "Oddio... ce l'abbiamo fatta!"},
  {name: "Armando", text: "Non ci credo... siamo vivi!"},
  {name: "Enrico", text: "È stato difficile... ma ci siamo riusciti."},
  {name: "Santiago", text: "Grazie davvero per l'aiuto!"}
];

var finalDialogIndex = 0;

var currentGame = 0;
var score = 0;
var maxScore = 10;

var items = [];
var speed = 5;

var gameLoopId;
var spawnLoopId;
var talkLoopId;
var finalLoopId;

// =======================
// MENU
// =======================
hideElement("dialogLabel");
hideElement("nameLabel");
hideElement("scoreLabel");
hideElement("santiago");
hideElement("enrico");
hideElement("armando");
hideElement("ricomincia");

// =======================
// START BUTTON
// =======================
onEvent("starrt", "click", function() {
  hideElement("starrt");
  blockNextClick = true;
  startDialog();
});

// =======================
// DIALOGHI
// =======================
function startDialog() {
  state = "dialog";
  dialogIndex = 0;
  
  showElement("dialogLabel");
  showElement("nameLabel");
  
  showDialog();
}

function showDialog() {
  var d = dialogues[dialogIndex];
  
  setText("nameLabel", d.name);
  setText("dialogLabel", d.text);
  
  showElement("santiago");
  showElement("enrico");
  showElement("armando");
  
  setPosition("santiago", 40, 300);
  setPosition("enrico", 130, 300);
  setPosition("armando", 220, 300);
  
  stopTalkingAnimation();
  startTalkingAnimation(getSpeakerId(d.name));
}

function getSpeakerId(name){
  if(name==="Santiago") return "santiago";
  if(name==="Enrico") return "enrico";
  return "armando";
}

// CLICK SCREEN
onEvent("screen1", "click", function() {
  

  if (blockNextClick) {
    blockNextClick = false;
    return;
  }
  
  if (state === "dialog") {
    dialogIndex++;
    
    if (dialogIndex < dialogues.length) {
      showDialog();
    } else {
      stopTalkingAnimation();
      startGame(1);
    }
  }
  
  if (state === "dialogAfter") {
    currentGame++;
    startGame(currentGame);
  }
});

// =======================
// ANIMAZIONE MOVIMENTO PERSONAGGI
// =======================
function startTalkingAnimation(id) {
  stopTalkingAnimation();
  
  var direction = 1;
  
  talkLoopId = timedLoop(200, function() {
    var y = getYPosition(id);
    
    if (y <= 290) direction = 1;
    if (y >= 310) direction = -1;
    
    setPosition(id, getXPosition(id), y + direction * 3);
  });
}

function stopTalkingAnimation() {
  if (talkLoopId) stopTimedLoop(talkLoopId);
}

// =======================
// START GAME
// =======================
function startGame(n) {
  state = "game";
  currentGame = n;
  score = 0;
  items = [];
  
  hideElement("dialogLabel");
  hideElement("nameLabel");
  
  showElement("scoreLabel");
  
  showCharacter();
  updateScore();
  
  spawnLoopId = timedLoop(800, spawnItem);
  gameLoopId = timedLoop(50, gameLoop);
}

function showCharacter() {
  hideElement("santiago");
  hideElement("enrico");
  hideElement("armando");
  
  var p = getPlayer();
  showElement(p);
  setPosition(p, 120, 350);
}

onEvent("screen1", "mousemove", function(e) {
  if (state === "game") {
    setPosition(getPlayer(), e.x - 25, 350);
  }
});

// =======================
// SPAWN EMOJI MINIGIOCHI
// =======================
function spawnItem() {
  var id = "item" + randomNumber(0,99999);
  
  var emoji;
  
  if (currentGame == 1) emoji = "💰"; 
  else if (currentGame == 2) emoji = "🪪";
  else emoji = "👕";
  

  textLabel(id, emoji);
  
  setPosition(id, randomNumber(0,280), 0, 40, 40);
  setProperty(id, "font-size", 24);
  setProperty(id, "text-align", "center");
  
  items.push(id);
}

// =======================
// LOOP
// =======================
function gameLoop() {
  var p = getPlayer();
  
  for (var i=0;i<items.length;i++) {
    var id = items[i];
    var y = getYPosition(id);
    
    setPosition(id, getXPosition(id), y + speed);
    
    if (touch(id,p)) {
      deleteElement(id);
      items.splice(i,1);
      score++;
      updateScore();
      
      if (score>=maxScore) levelComplete();
    }
    
    if (y>400) gameOver();
  }
}

// =======================
// GAME OVER
// =======================
function gameOver(){
  stopGameLoops();
  clearItems();
  
  state="gameover";
  
  hideElement("scoreLabel");
  showElement("dialogLabel");
  showElement("nameLabel");
  showElement("ricomincia");
  
  setText("nameLabel","Oh no!");
  setText("dialogLabel","Hai perso!");
}

// RICOMINCIA
onEvent("ricomincia","click",function(){
  stopGameLoops();
  clearItems();
  
  currentGame=0;
  speed=5;
  
  hideElement("ricomincia");
  showElement("starrt");
  
  hideElement("dialogLabel");
  hideElement("nameLabel");
  hideElement("scoreLabel");
  
  state="menu";
});

function getPlayer(){
  if(currentGame==1) return "santiago";
  if(currentGame==2) return "enrico";
  return "armando";
}

function updateScore(){
  setText("scoreLabel","Score: "+score+"/10");
}

function touch(a,b){
  return (
    getXPosition(a)<getXPosition(b)+50 &&
    getXPosition(a)+30>getXPosition(b) &&
    getYPosition(a)<getYPosition(b)+50 &&
    getYPosition(a)+30>getYPosition(b)
  );
}

function clearItems(){
  for(var i=0;i<items.length;i++){
    deleteElement(items[i]);
  }
  items=[];
}

function stopGameLoops(){
  if(gameLoopId) stopTimedLoop(gameLoopId);
  if(spawnLoopId) stopTimedLoop(spawnLoopId);
}

// =======================
// LIVELLI COMPLETATI
// =======================
function levelComplete(){
  stopGameLoops();
  clearItems();
  
  hideElement("scoreLabel");
  
  state="dialogAfter";
  
  showElement("dialogLabel");
  showElement("nameLabel");
  
  if(currentGame==1){
    setText("nameLabel","Santiago");
    setText("dialogLabel","Perfetto! Ora tocca ad Enrico!");
  }
  else if(currentGame==2){
    setText("nameLabel","Enrico");
    setText("dialogLabel","Grande! Ora tocca ad Armando!");
  }
  else{
    finale();
  }
}

// =======================
// SCENA FINALE
// =======================
function finale(){
  setScreen("city");
  
  state="finalDialog";
  finalDialogIndex=0;
  
  setPosition("santiago_final",60,300);
  setPosition("enrico_final",130,300);
  setPosition("armando_final",200,300);
  
  showFinalDialog();
}

function showFinalDialog(){
  var d=finalDialogues[finalDialogIndex];
  setText("finalText", d.name+": "+d.text);
}

onEvent("city","click",function(){
  if(state==="finalDialog"){
    finalDialogIndex++;
    
    if(finalDialogIndex<finalDialogues.length){
      showFinalDialog();
    } else {
      startFinalCelebration();
    }
  }
});

// =======================
// RITORNO A FISH CITY
// =======================
function startFinalCelebration(){
  state="final";
  
  setText("finalText","Grazie per l'aiuto, finalmente siamo tornati a Fish City! ❤️");
  
  var direction=1;
  
  finalLoopId=timedLoop(200,function(){
    bounce("santiago_final",direction);
    bounce("enrico_final",direction);
    bounce("armando_final",direction);
    bounce("finalText",direction);
    
    if(getYPosition("santiago_final")<=280) direction=1;
    if(getYPosition("santiago_final")>=320) direction=-1;
  });
}

function bounce(id,d){
  setPosition(id,getXPosition(id),getYPosition(id)+d*4);
}
