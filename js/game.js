var Game = (function(){
    // Variabili di gioco
    var roundCompleted = false;
    var firstRound = true;
    var signature = 0;
    var noteData = [];
    var rightCrux = new Map();
    var cellMapping = [
      {row: 4, col: 2},
      {row: 3, col: 2},
      {row: 2, col: 0},
      {row: 2, col: 1},
      {row: 2, col: 4},
      {row: 2, col: 3},
      {row: 0, col: 2},
      {row: 1, col: 2}
    ];
  
    var noteTypes = [
      { value: 4 },
      { value: 3 },
      { value: 2 },
      { value: 1 },
      { value: 0.5 }
    ];
  
    var allNotes = [
      "a/3", "b/3",
      "c/4", "d/4", "e/4", "f/4", "g/4",
      "a/4", "b/4",
      "c/5", "d/5", "e/5", "f/5", "g/5",
      "a/5", "b/5",
      "c/6"
    ];
  
    function updateScoreDisplay(score){
      $("#score-display").text("Punteggio: " + score);
    }
  
    function generateCrux(){
      var l = 0;
      var array = [];
      var temp = [];
      
      noteData.forEach(function(note, i) {
        if(l !== note.battuta) {
          if(l !== 0)
            rightCrux.set(l, array);
          l = note.battuta;
          array = [];
        }
        
        if(!note.tune) {
          if(note.value > 0.5 && note.pronunciation) {
            var lastIndex = array.length > 0 ? array.length : 0;
            var tempStr = note.pronunciation.split("-");
            var newStr = tempStr.slice(lastIndex);
            temp = newStr.slice(0, note.value * 2);
          } else {
            temp = ["Un"];
          }
        }
        
        if(note.tune) {
          let size = note.value * 2;
          if(note.tune.toLowerCase() === "sol") {
            let isSecondHalf = note.tied === true;
            let isFirstHalf = false;
            if(i < noteData.length - 1) {
              let nextNote = noteData[i+1];
              if(nextNote.tune && nextNote.tune.toLowerCase() === "sol" && nextNote.tied === true) {
                isFirstHalf = true;
              }
            }
            temp = Helpers.getSolSyllables(size, isFirstHalf, isSecondHalf);
          } else {
            temp = Helpers.stringToArray(note.tune, size);
            if(note.tied) {
              temp[0] = temp[0].substring(1);
            }
          }
        }
        
        array.push(...temp);
        temp = [];
      });
      
      rightCrux.set(l, array);
      for(var j = 0; j < 2 * signature; j++){
        var value = Helpers.getElementFromMap(rightCrux, 1, j);
        var cellSelector = "#note-table-measure-1 tr:eq(" + cellMapping[j].row + ") td:eq(" + cellMapping[j].col + ")";
        $(cellSelector).data("solution", value).text("");
      }
    }
  
    function init(){
      // Imposta il suono al click sugli input
      $("input").click(function() {
        AudioModule.playSound("laser.mp3");
      });
      
      // Gestione del controllo soluzione
      $("#check").click(function(){
        AudioModule.playSound("check.mp3");
        if(roundCompleted) return;
        var currentScore = Login.getScore();
        var currentUser = Login.getCurrentUser();
        var solutionArray = rightCrux.get(1);
        var roundScore = 0;
        for(var j = 0; j < solutionArray.length; j++){
          var expected = solutionArray[j];
          var cellSelector = "#note-table-measure-1 tr:eq(" + cellMapping[j].row + ") td:eq(" + cellMapping[j].col + ")";
          var userValue = $(cellSelector).text().trim();
          if(expected.toLowerCase() !== userValue.toLowerCase()){
            $(cellSelector)
              .attr("contenteditable", "false")
              .html('<span class="correct-text" style="color: lightgrey; text-transform: uppercase; position: absolute; top: 0; left: 0; width: 100%; text-align: center;">' 
                    + expected + '</span>' +
                    '<span class="wrong-text" style="color: red; position: absolute; bottom: 0; left: 0; width: 100%; text-align: center;">' 
                    + userValue + '</span>');
          } else {
            $(cellSelector)
              .attr("contenteditable", "false")
              .html('<span class="correct-text" style="color: white; position: absolute; top: 0; left: 0; width: 100%; text-align: center;">' 
                    + expected + '</span>' +
                    '<span class="wrong-text" style="color: green; position: absolute; bottom: 0; left: 0; width: 100%; text-align: center;">' 
                    + userValue + '</span>');
            roundScore += 0.5;
          }
        }
        roundScore  = 10 * roundScore / (signature);
        if(roundScore > 0)
          AudioModule.playSound("score.mp3");
        currentScore += roundScore;
        Login.setScore(currentScore);
        updateScoreDisplay(currentScore);
        roundCompleted = true;
        disableButton("#generate", false);
        if(roundScore >= 0) {
          var animElem = $('<div class="floating-score">+' + roundScore.toFixed(1) + '</div>');
          $(".container").append(animElem);
          setTimeout(function() { animElem.remove(); }, 2000);
        }
        Leaderboard.update(currentUser, currentScore);
      });
      
      // Gestione del click su "Genera" (nuovo round)
      $("#generate").click(function() {
        $("td").css("border", "0")
          .css("font-weight", "bold")
          .attr("contenteditable", "false");
        disableButton("#generate", true);
        
        if(firstRound) {
          $(this).text("Continua");
          AudioModule.playSound("start.mp3");
          $("body").addClass("bg-animated");
          firstRound = false;
          $("#titleGame").hide();
        } else {
          AudioModule.playSound("continue.mp3");
        }
        $("#terminate").removeClass("hidden");
        roundCompleted = false;
        
        // Ripristina la tabella per la croce
        for(var j = 0; j < cellMapping.length; j++){
          var cellSelector = "#note-table-measure-1 tr:eq(" + cellMapping[j].row + ") td:eq(" + cellMapping[j].col + ")";
          $(cellSelector)
            .css("color", "")
            .attr("contenteditable", "true")
            .on("click", function(){ AudioModule.playSound("click.mp3"); })
            .empty();
        }
        $("#staff").empty();
        noteData = [];
      
        var VF = Vex.Flow;
        var timeSignatures = ["2/4", "3/4", "4/4"];
        var selectedTimeSignature = timeSignatures[Math.floor(Math.random() * timeSignatures.length)];
        var beats = parseInt(selectedTimeSignature.split("/")[0]);
        var beatValue = parseInt(selectedTimeSignature.split("/")[1]);
        signature = beats;
        
        var staffDiv = document.getElementById("staff");
        var width = staffDiv.clientWidth;
        var height = staffDiv.clientHeight;
        var renderer = new VF.Renderer(staffDiv, VF.Renderer.Backends.SVG);
        renderer.resize(width, height);
        var context = renderer.getContext();
      
        var stave = new VF.Stave(10, 0, width - 20);
        stave.addClef("treble").addTimeSignature(selectedTimeSignature);
        stave.setContext(context).draw();
        
        // Costruisci la sequenza di durate e la scelta tra nota/pausa
        var total = beats;
        var vfNotes = [];
        var ties = [];
        var lastValue = null;
        var allValue = [];
        
        while(total > 0){
          var possibleVals = noteTypes.filter(nt => nt.value <= total);
          var chosenVal = possibleVals[Math.floor(Math.random() * possibleVals.length)].value;
          var isNote = (Math.random() < 0.5);
          if(lastValue === 0.5 && chosenVal !== 0.5) {
            isNote = true;
          }
          if(allValue.length > 0){
            var sum = $.map(allValue, function(num) { return num; }).reduce((a, b) => a + b, 0);
            if (sum % 1 !== 0 && chosenVal !== 0.5){
              isNote = true;
            } 
          }
          if(isNote) {
            if(chosenVal > 0.5 && (chosenVal === 1 || chosenVal === 2 || chosenVal === 4) && Math.random() < 0.5) {
              var key = allNotes[Math.floor(Math.random() * allNotes.length)];
              var firstDur = Helpers.getVFDuration(chosenVal/2, false);
              var secondDur = Helpers.getVFDuration(chosenVal/2, false);
              var note1 = new VF.StaveNote({ clef: "treble", keys: [key], duration: firstDur });
              var note2 = new VF.StaveNote({ clef: "treble", keys: [key], duration: secondDur });
              var octave = parseInt(key.split("/")[1]);
              if(octave > 4) {
                note1.setStemDirection(-1);
                note2.setStemDirection(-1);
              }
              vfNotes.push(note1);
              vfNotes.push(note2);
              ties.push(new VF.StaveTie({
                first_note: note1,
                last_note: note2,
                first_indices: [0],
                last_indices: [0]
              }));
              noteData.push({
                battuta: 1,
                value: chosenVal/2,
                tune: Helpers.convertNoteToItalian(key),
                pronunciation: "",
                tied: false
              });
              noteData.push({
                battuta: 1,
                value: chosenVal/2,
                tune: Helpers.convertNoteToItalian(key),
                pronunciation: "",
                tied: true
              });
            } else {
              var key = allNotes[Math.floor(Math.random() * allNotes.length)];
              var duration = Helpers.getVFDuration(chosenVal, false);
              var noteVF = new VF.StaveNote({ clef: "treble", keys: [key], duration: duration });
              if(chosenVal === 3) { noteVF.addDotToAll(); }
              var octave = parseInt(key.split("/")[1]);
              if(octave > 4) { noteVF.setStemDirection(-1); }
              vfNotes.push(noteVF);
              noteData.push({
                battuta: 1,
                value: chosenVal,
                tune: Helpers.convertNoteToItalian(key),
                pronunciation: "",
                tied: false
              });
            }
          } else {
            var durationR = Helpers.getVFDuration(chosenVal, true);
            var rest;
            if(chosenVal > 3) {
              rest = new VF.StaveNote({ clef: "treble", keys: ["d/5"], duration: durationR });
            } else {
              rest = new VF.StaveNote({ clef: "treble", keys: ["b/4"], duration: durationR });
            }
            if(chosenVal === 3) { rest.addDotToAll(); }
            vfNotes.push(rest);
            var pausePronunciation = (chosenVal === 0.5) ? "Un" : "u-no-du-e-tre-e-qua-tro";
            noteData.push({
              battuta: 1,
              value: chosenVal,
              tune: "",
              pronunciation: pausePronunciation,
              tied: false
            });
          }
          
          total -= chosenVal;
          lastValue = chosenVal;
          allValue.push(chosenVal);
        }
      
        var voice = new VF.Voice({ num_beats: beats, beat_value: beatValue });
        voice.setStrict(false);
        voice.addTickables(vfNotes);
        new VF.Formatter().joinVoices([voice]).format([voice], width - 90);
        voice.draw(context, stave);
        ties.forEach(function(tie) {
          tie.setContext(context).draw();
        });
      
        // Disegna la tabella "croce" e genera la crux
        for(var j = 0; j < 2 * beats; j++){
          var cellSelector = "#note-table-measure-1 tr:eq(" + cellMapping[j].row + ") td:eq(" + cellMapping[j].col + ")";
          $(cellSelector)
            .css("border", "2px solid #ccc")
            .css("font-weight", "bold")
            .attr("contenteditable", "true")
            .empty()
            .attr("data-index", j);
        }
        
        generateCrux();
      });
      
      // Gestione del click sul bottone "Termina"
      $("#terminate").click(function(){
        AudioModule.playSound("end.mp3");
        setTimeout(function() {
          var currentUser = Login.getCurrentUser();
          var currentScore = Login.getScore();
          Leaderboard.update(currentUser, currentScore);
          location.reload();
        }, 500);
      });
    }
    
    function disableButton(selector, state) {
      $(selector).prop("disabled", state);
      if(state)
        $(selector).addClass("btn-disabled");
      else
        $(selector).removeClass("btn-disabled");
    }
  
    return {
      init: init
    };
  })();
  