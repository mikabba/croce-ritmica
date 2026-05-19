var Leaderboard = (function(){
    function loadLeaderboard(){
      $.ajax({
        url: 'get_leaderboard.php',
        type: 'GET',
        data: { _: new Date().getTime() },
        dataType: 'json',
        cache: false,
        success: function(data) {
          data.sort(function(a, b) {
            var scoreA = a.score !== undefined ? a.score : a.moves;
            var scoreB = b.score !== undefined ? b.score : b.moves;
            return scoreB - scoreA;
          });
          var list = $("#leaderboardList");
          list.empty();
          data.forEach(function(item, index) {
            var coins = "★".repeat(Math.floor(item.score / 1000)); // Usa ★ per ogni 1000 punti
            list.append("<li>" + (index + 1) + ". " + item.name + " " + " - " +
                        (item.score !== undefined ? item.score : item.moves) + coins + "</li>");
          });
        },
        error: function() {
          $("#leaderboardList").html("<li>Impossibile caricare la classifica</li>");
        }
      });
    }
  
    function updateLeaderboard(currentUser, score){
      if(currentUser === "Anonimo") return;
      var newScore = {
        name: currentUser,
        score: score
      };
      $.ajax({
        url: 'update_leaderboard.php',
        type: 'POST',
        data: JSON.stringify(newScore),
        contentType: 'application/json',
        success: function(response) {
          console.log("Punteggio salvato con successo!");
        },
        error: function(e) {
          alert("Errore nel salvataggio del punteggio.");
          console.log(e.message);
        }
      });
    }
  
    return {
      load: loadLeaderboard,
      update: updateLeaderboard
    };
  })();
  