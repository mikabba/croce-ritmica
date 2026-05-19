var Login = (function(){
    var currentUser = "";
    var score = 0;
    var CERTIFICATE_THRESHOLD = 1000;
    
    function init(){
      $("#closeModal").click(function() {
        $("#attestatoModal").fadeOut();
      });
  
      $("#loginButton").click(function(){
        var username = $("#username").val().trim();
        var password = $("#password").val().trim();
        if(username === "" && password === ""){
          AudioModule.playSound("loginAccepted.mp3");
          AudioModule.backgroundMusic.play().catch(function(error) {
            console.log("Autoplay bloccato, l'utente deve interagire prima con la pagina.");
          });
          $("#loginContainer").hide();
          $("#gameContainer").show();
          $("#titleGame").show();
          currentUser = "Anonimo";
          score = 0;
          $("#userDisplay").text("Giocatore: " + currentUser);
          $("#score-display").text("Punteggio: " + score);
          return;
        }
        $.ajax({
          url: 'login.php',
          type: 'POST',
          data: JSON.stringify({ username: username, password: password }),
          contentType: 'application/json',
          dataType: 'json',
          success: function(response) {
            if(response.status === "success"){
              AudioModule.playSound("loginAccepted.mp3");
              AudioModule.backgroundMusic.play().catch(function(error) {
                console.log("Autoplay bloccato, l'utente deve interagire prima con la pagina.");
              });
              $("#loginContainer").hide();
              $("#gameContainer").show();
              $("#titleGame").show();
              $.ajax({
                url: 'get_current_user.php',
                type: 'GET',
                dataType: 'json',
                success: function(resp){
                  currentUser = resp.username;
                  score = resp.score || 0;
                  if(score >= CERTIFICATE_THRESHOLD){
                    $("#attestatoModal").fadeIn();
                  }
                  $("#userDisplay").text("Giocatore: " + currentUser);
                  $("#score-display").text("Punteggio: " + score);
                },
                error: function(){
                  $("#userDisplay").text("Giocatore: Errore");
                  currentUser = "Errore";
                }
              });
            } else {
              AudioModule.playSound("loginRejected.mp3");
              $("#loginError").text(response.message || "Credenziali non valide");
            }
          },
          error: function(){
            AudioModule.playSound("loginRejected.mp3");
            $("#loginError").text("Errore nel login");
          }
        });
      });
    }
  
    function getCurrentUser(){
      return currentUser;
    }
    function getScore(){
      return score;
    }
    function setScore(newScore){
      score = newScore;
    }
  
    return {
      init: init,
      getCurrentUser: getCurrentUser,
      getScore: getScore,
      setScore: setScore
    };
  })();
  