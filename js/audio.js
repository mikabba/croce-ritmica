var AudioModule = (function(){
    // Inizializza la musica di sottofondo
    var backgroundMusic = new Audio("sounds/background.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
  
    function playSound(soundFile) {
      new Audio("sounds/" + soundFile).play();
    }
  
    return {
      playSound: playSound,
      backgroundMusic: backgroundMusic
    };
  })();
  