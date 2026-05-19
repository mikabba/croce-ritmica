<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['username'])) {
    echo json_encode([
        'username' => $_SESSION['username'],
        'score' => $_SESSION['score'] ?? 0
    ]);
} else {
    echo json_encode([
        'username' => 'Anonimo',
        'score' => 0
    ]);
}
?>
