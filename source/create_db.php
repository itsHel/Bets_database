<?php
    $server = "localhost";
    $user = "root";
    $pass = "";
    $database = "newdb";

    $db = new mysqli($server, $user, $pass, $database);

    if ($db->connect_error) 
         die("Connection failed: " . $db->connect_error);

    $cmd = 'CREATE TABLE bets (
             id int(6) unsigned NOT NULL AUTO_INCREMENT,
             type varchar(20) DEFAULT NULL,
             bet float(6,1) unsigned DEFAULT NULL,
             rate float(6,3) unsigned DEFAULT NULL,
             result varchar(20) DEFAULT NULL,
             note varchar(100) DEFAULT NULL,
             time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
             site varchar(30) NOT NULL,
             PRIMARY KEY (id)
             ) ENGINE=MyISAM AUTO_INCREMENT=1569 DEFAULT CHARSET=latin1';
    if($db->query($cmd))
        echo "created";
    else
        echo "Error creating database: " . $db->error;

    $db->close();
?>