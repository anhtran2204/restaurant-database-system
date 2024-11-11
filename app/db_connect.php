<?php
$servername = "db";
$username = "root";
$password = "rootpassword";
$dbname = "Restaurant";

// Retry connection a few times
$retries = 5;
while ($retries > 0) {
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        $retries--;
        sleep(2); // Wait 2 seconds before retrying
    } else {
        break; // Connection successful
    }
}

// Check if connection failed after retries
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
