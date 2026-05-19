<?php
session_start();
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['name']) || !isset($data['score'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Dati mancanti'
    ]);
    exit;
}

$name = trim($data['name']);
$score = (int) $data['score'];

if ($name === '' || strtolower($name) === 'anonimo') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Anonymous score not saved'
    ]);
    exit;
}

$privateDir = __DIR__ . '/private';
$leaderboardFile = $privateDir . '/leaderboard.json';

if (!is_dir($privateDir)) {
    mkdir($privateDir, 0755, true);
}

$leaderboard = [];
if (file_exists($leaderboardFile)) {
    $decoded = json_decode(file_get_contents($leaderboardFile), true);
    if (is_array($decoded)) {
        $leaderboard = $decoded;
    }
}

$date = date('d/m/Y, H:i');
$found = false;

foreach ($leaderboard as $index => $entry) {
    if (isset($entry['name']) && strtolower($entry['name']) === strtolower($name)) {
        $leaderboard[$index]['score'] = $score;
        $leaderboard[$index]['date'] = $date;
        $found = true;
        break;
    }
}

if (!$found) {
    $leaderboard[] = [
        'name' => $name,
        'score' => $score,
        'date' => $date
    ];
}

$result = file_put_contents(
    $leaderboardFile,
    json_encode($leaderboard, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);

if ($result === false) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Errore nel salvataggio'
    ]);
} else {
    echo json_encode(['status' => 'success']);
}
?>
