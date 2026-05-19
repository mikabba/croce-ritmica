<?php
header('Content-Type: application/json');

$leaderboardFile = __DIR__ . '/private/leaderboard.json';

if (!file_exists($leaderboardFile)) {
    echo json_encode([]);
    exit;
}

$leaderboard = json_decode(file_get_contents($leaderboardFile), true);

if (!is_array($leaderboard)) {
    echo json_encode([]);
    exit;
}

echo json_encode($leaderboard);
?>
