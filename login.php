<?php
session_start();
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Dati mancanti'
    ]);
    exit;
}

$username = trim($data['username']);
$password = trim($data['password']);

$usersFile = __DIR__ . '/private/users.json';
$leaderboardFile = __DIR__ . '/private/leaderboard.json';

if (!file_exists($usersFile)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File utenti non trovato'
    ]);
    exit;
}

$users = json_decode(file_get_contents($usersFile), true);
$leaderboard = file_exists($leaderboardFile)
    ? json_decode(file_get_contents($leaderboardFile), true)
    : [];

if (!is_array($users)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'File utenti non valido'
    ]);
    exit;
}

foreach ($users as $user) {
    if (
        isset($user['username'], $user['password']) &&
        strtolower($user['username']) === strtolower($username) &&
        $user['password'] === $password
    ) {
        $_SESSION['username'] = $user['username'];
        $_SESSION['score'] = 0;

        if (is_array($leaderboard)) {
            foreach ($leaderboard as $entry) {
                if (isset($entry['name']) && $entry['name'] === $user['username']) {
                    $_SESSION['score'] = (int) ($entry['score'] ?? 0);
                    break;
                }
            }
        }

        echo json_encode(['status' => 'success']);
        exit;
    }
}

echo json_encode([
    'status' => 'error',
    'message' => 'Credenziali non valide'
]);
?>
