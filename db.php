<?php
$host = 'localhost';
$user = 'olekksa';
$pass = 'jk2h3fIUl2k3jriIQJKK!';
$dbname = 'olekksa';

$conn = new mysqli($host, $user, $pass, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'DB connection failed']));
}
?>
