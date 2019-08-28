<?php
	$db = new mysqli("127.0.0.1","root","","newDB");
	if ($db->connect_error)
		die($db->connect_error);
	$cmd = 'INSERT INTO bets VALUES (null,"'.$_GET["type"].'","'.$_GET["bet"].'","'.$_GET["rate"].'",UPPER("'.@$_GET["result"].'"),
	"'.@$_GET["note"].'","'.date("Y-m-d H:i:s").'","'.$_GET["site"].'")';
	//echo $cmd;
	$db->query($cmd) or die($db->error);
	echo $db->insert_id;
	$db->close();
?>