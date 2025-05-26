<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT id, name, email, isAdmin FROM users");
        $users = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($users);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($_GET['action']) && $_GET['action'] === 'login') {
            $stmt = $conn->prepare("SELECT id, name, email, isAdmin FROM users WHERE email=? AND password=?");
            $stmt->bind_param("ss", $data['email'], $data['password']);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
            }
        } else {
            // Регистрация пользователя
            $isAdmin = isset($data['isAdmin']) ? (int)$data['isAdmin'] : 0;
            $stmt = $conn->prepare("INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sssi", $data['name'], $data['email'], $data['password'], $isAdmin);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'User already exists or invalid data']);
            }
        }
        break;
}
?>
