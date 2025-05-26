<?php
header("Content-Type: application/json");
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT * FROM rooms");
        $rooms = [];
        while ($row = $result->fetch_assoc()) {
            $row['available'] = (bool)$row['available'];
            $row['discounted'] = (bool)$row['discounted'];
            $row['bookedDates'] = $row['bookedDates'] ? json_decode($row['bookedDates']) : [];
            $rooms[] = $row;
        }
        echo json_encode($rooms);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        // Проверка обязательных полей
        if (
            empty($data['name']) ||
            empty($data['type']) ||
            !isset($data['price'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $available = isset($data['available']) ? (int)$data['available'] : 1;
        $discounted = isset($data['discounted']) ? (int)$data['discounted'] : 0;
        $guests = isset($data['guests']) ? (int)$data['guests'] : 2;
        $rating = isset($data['rating']) ? (float)$data['rating'] : null;
        $image = isset($data['image']) ? $data['image'] : '';
        $description = isset($data['description']) ? $data['description'] : '';
        $bookedDates = isset($data['bookedDates']) ? json_encode($data['bookedDates']) : json_encode([]);

        $stmt = $conn->prepare("INSERT INTO rooms (name, type, price, available, discounted, guests, rating, image, description, bookedDates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "ssiiidssss",
            $data['name'],
            $data['type'],
            $data['price'],
            $available,
            $discounted,
            $guests,
            $rating,
            $image,
            $description,
            $bookedDates
        );
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Cannot save room', 'sql_error' => $stmt->error]);
        }
        exit;
    case 'PUT':
        parse_str(file_get_contents("php://input"), $data);
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing room id']);
            exit;
        }
        $json = json_decode(file_get_contents('php://input'), true);
        if (!$json) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $available = isset($json['available']) ? (int)$json['available'] : 1;
        $discounted = isset($json['discounted']) ? (int)$json['discounted'] : 0;
        $guests = isset($json['guests']) ? (int)$json['guests'] : 2;
        $rating = isset($json['rating']) ? (float)$json['rating'] : null;
        $image = isset($json['image']) ? $json['image'] : '';
        $description = isset($json['description']) ? $json['description'] : '';
        $bookedDates = isset($json['bookedDates']) ? json_encode($json['bookedDates']) : json_encode([]);

        $stmt = $conn->prepare("UPDATE rooms SET name=?, type=?, price=?, available=?, discounted=?, guests=?, rating=?, image=?, description=?, bookedDates=? WHERE id=?");
        $stmt->bind_param(
            "ssiiiidsssi",
            $json['name'],
            $json['type'],
            $json['price'],
            $available,
            $discounted,
            $guests,
            $rating,
            $image,
            $description,
            $bookedDates,
            $id
        );
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Cannot update room', 'sql_error' => $stmt->error]);
        }
        exit;
    case 'DELETE':
        $id = $_GET['id'] ?? 0;
        $stmt = $conn->prepare("DELETE FROM rooms WHERE id = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        echo json_encode(['success' => $ok]);
        break;

    case 'PATCH': // бронирование
        $id = $_GET['id'] ?? 0;
        $data = json_decode(file_get_contents("php://input"), true);
        $newDates = $data['newDates'] ?? [];

        $result = $conn->query("SELECT bookedDates FROM rooms WHERE id = $id");
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        $row = $result->fetch_assoc();
        $booked = json_decode($row['bookedDates'], true) ?? [];
        $merged = array_unique(array_merge($booked, $newDates));

        $stmt = $conn->prepare("UPDATE rooms SET bookedDates = ?, available = 0 WHERE id = ?");
        $jsonDates = json_encode($merged);
        $stmt->bind_param("si", $jsonDates, $id);
        $ok = $stmt->execute();
        echo json_encode(['success' => $ok, 'bookedDates' => $merged, 'available' => 0]);
        break;
}
?>
