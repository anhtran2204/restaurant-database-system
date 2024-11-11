<?php
include 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = $_POST['employeeID'];
    $fname = $_POST['fname'];
    $lname = $_POST['lname'];
    $dob = $_POST['dob'];
    $position = $_POST['position'];
    $hoursPerWeek = $_POST['hoursPerWeek'];

    $sql = "UPDATE Employees SET fname='$fname', lname='$lname', dob='$dob', position='$position', HoursPerWeek='$hoursPerWeek' WHERE ID='$id'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Employee updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
    }
}

$conn->close();
?>
