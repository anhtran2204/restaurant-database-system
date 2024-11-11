<?php
include 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fname = $_POST['fname'];
    $lname = $_POST['lname'];
    $dob = $_POST['dob'];
    $position = $_POST['position'];
    $hoursPerWeek = $_POST['hoursPerWeek'];

    $sql = "INSERT INTO Employees (fname, lname, dob, position, HoursPerWeek) VALUES ('$fname', '$lname', '$dob', '$position', '$hoursPerWeek')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Employee added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
    }
}

$conn->close();
?>
