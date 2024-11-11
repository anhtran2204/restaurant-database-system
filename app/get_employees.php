<?php
include 'db_connect.php';

$sql = "SELECT * FROM Employees";
$result = $conn->query($sql);

if (!$result) {
    // Display SQL error if query fails
    die("SQL query failed: " . $conn->error);
}

$employees = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
}

echo json_encode($employees);
$conn->close();
?>
