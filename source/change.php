<?php
	$db = new mysqli("127.0.0.1","root","","newDB");
	
    if ($db->connect_error)
		die($db->connect_error);
    $cmd='UPDATE bets SET '.$_GET["type"].'="'.$_GET["value"].'" WHERE id='.$_GET["id"];
	
	$db->query($cmd) or die($db->error);
	echo 'ok';
	$db->close();
?>