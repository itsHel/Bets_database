<?php
	@$db = new mysqli("127.0.0.1","root","","newDB");
	if ($db->connect_error)
		die("no connection");
    
    $order = $_GET["params"]["order"];
    $type = $_GET["params"]["type"];
    $bet = $_GET["params"]["bet"];
    $date = $_GET["params"]["date"];
    $note = $_GET["params"]["note"];
    $rate = $_GET["params"]["rate"];
    $direction = $_GET["params"]["direction"];
    $site = $_GET["params"]["site"];
    $limit_start = $_GET["params"]["limit"]["start"];
    $limit_count = $_GET["params"]["limit"]["count"];

    // less more
    if($rate[0] == "<" || $rate[0] == ">")
        $rate = "rate ".$rate[0]." ".substr($rate,1);
    else 
        if(strpos($rate,"-") == false)
            $rate = "rate like '".$rate."'";

    if($bet[0] == "<" || $bet[0] == ">")
        $bet = "bet ".$bet[0]." ".substr($bet,1);
    else
        if(strpos($bet,"-") == false)
            $bet = "bet like '".$bet."'";

    // range
    if(strpos($rate,"-")){
        $temp = explode("-",$rate);
        $rate = "rate BETWEEN " . $temp[0] . " AND " . $temp[1]; 
    }
    if(strpos($bet,"-")){
        $temp = explode("-",$bet);
        $bet = "bet BETWEEN " . $temp[0] . " AND " . $temp[1]; 
    }

    
    if($date == "yesterday")
        $date = "BETWEEN subdate(current_date,1) and current_date";
    else if($date != "%")
        $date = "BETWEEN FROM_UNIXTIME(".$date.") AND NOW()";
    else
        $date = "LIKE '%'";
    
    $where = "WHERE time ".$date." AND ".$rate." AND note LIKE '%".$note."%' AND site LIKE '".$site."' AND type LIKE '".$type."' and ".$bet;
    
    //soft reset
    //$where.=" AND time >= '2019-01-28'";
    
    $cmd = "SELECT * FROM bets ".$where;
    
    //graph
    if(1){
        $graph_cmd = "SELECT UNIX_TIMESTAMP(time) as date, sum(if(result = 'W', bet*rate -bet, if(result = 'L', -bet, 0))) as daynet from bets ".$where." group by date(time) order by time ".$direction;
        $select = $db->query($graph_cmd) or die($db->error);
        $i = 0; $net = 0;
        echo "[";
        if ($select->num_rows > 0){
            while($row = $select->fetch_assoc()){
                $net += $row["daynet"];
                echo "{\"x\": ".($row["date"]*1000).", \"y\": ".round($net,1)."}";    
                if(++$i != $select->num_rows)
                    echo ",";
            }
        }
        echo "]<br>";
    }

    // default behavior
    if($order == "result" && $direction == "ASC")
        $new_order = "(CASE WHEN result = '' THEN result END) DESC, (CASE WHEN result != '' THEN time END) DESC, site";
    else
        $new_order = $order;
    $cmd .= " ORDER BY ".$new_order." ".$direction." LIMIT ".$limit_start.",".$limit_count;

    // stats
    $result = $db->query("SELECT AVG(rate) AS avg_rate, COUNT(*) as count FROM bets ".$where);
    $row = $result->fetch_assoc();
    $avg_rate = round($row["avg_rate"],2);
    $count = $row["count"];
    
    $result = $db->query("SELECT COALESCE(SUM(bet),0) AS bets, COUNT(*) AS count, COALESCE(SUM(bet*rate - bet), 0) AS earned FROM bets ".$where." AND result like 'W'") or die($db->error);;
    $row = $result->fetch_assoc();
    $won_bets = round($row["bets"],2);
    $won_count = $row["count"];
    $earned = $row["earned"];
    
    $result = $db->query("SELECT COALESCE(SUM(bet), 0) AS bets, COUNT(*) AS count FROM bets ".$where." AND result like 'L'");
    $row = $result->fetch_assoc();
    $lost_bets = round($row["bets"],2);
    $lost_count = $row["count"];

    $result = $db->query("SELECT COALESCE(SUM(bet), 0) AS in_play FROM bets ".$where." AND result like ''");
    $row = $result->fetch_assoc();
    $in_play = $row["in_play"];
    
    echo("{\"avg_rate\":".$avg_rate.",\"count\":".$count.",\"won\":".$won_bets.",\"won_count\":".$won_count.",\"earned\":".$earned.",\"lost\":".$lost_bets.",\"lost_count\":".$lost_count.",\"in_play\":".$in_play."}<br>"); 

    // table nav 
    echo "<div class=row><div id=tab_type class=blok1 onclick='search(\"type\", true, 0, this.id)'>Type</div><div id=tab_bet class=blok1 onclick='search(\"bet\", true, 0, this.id)'>Bet</div><div id=tab_rate class=blok1 onclick='search(\"rate\", true, 0, this.id)'>Rate</div><div class=blok1 id=tab_result text-align:center onclick='search(\"result\", true, 0, this.id)'>Result</div><div class=blok1 id=tab_site text-align:center onclick='search(\"site\", true, 0, this.id)'>Site</div><div id=tab_time class=blok1 onclick='search(\"time\", true, 0, this.id)'>Time</div><div id=tab_note class=blok1 onclick='search(\"note\", true, 0, this.id)'>Note</div></div>";
    
	$select = $db->query($cmd) or die($db->error);
	$db->close();
    if ($select->num_rows>0){
        while($row = $select->fetch_assoc())
        {
            $color = "style=text-align:center;";
            if($row["result"] == "W")
                $color .= "color:green;";
            else 
                if($row["result"] == "L")
                    $color .= "color:red;";
            $row["time"] = substr($row["time"],5,-3);                                              //time stringing
            $row["time"] = str_replace(" "," - ",$row["time"]);
            $row["time"] = str_replace(":","<span style='color:red'>:</span>",$row["time"]);
            $row["time"] = str_replace("-","<span style='color:red'>-</span>",$row["time"]);
            
            echo "<div class=row id=".$row["id"]."><div class=icons><img id=mark src='imgs/mark.png'><img id=delete src='imgs/delete.png'></div><div class='blok type'>".$row["type"]."</div><div class='blok bet'>".$row["bet"]."</div><div class='blok rate'>".substr($row["rate"],0,-1)."<span>".round($row["rate"] * $row["bet"],1)."</span></div><div class='blok result' ".$color.">".(($row["result"]!="") ? ($row["result"]) : "<input spellcheck=false class=result_input type=text name=vysledek onkeyup='if(event.keyCode==13) change_bet(this.value.toUpperCase(), \"result\", ".$row["id"].")'>")."</div><div class='blok site'>".$row["site"]."</div><div class='blok time'>".$row["time"]."</div><div class='blok note'>".$row["note"]."</div></div>";
        }
        // pagination
        if ($count > $limit_count){
            $page_count = ceil($count/$limit_count);
            $curr_page = $limit_start/$limit_count + 1;
            $page1 = $curr_page - 1;
            $page2 = $curr_page;
            $page3 = $curr_page + 1;
            $disabled = "style=display:none";
            $pages = "<div onclick='search(\"".$order."\",false,".($limit_start - $limit_count).")' ".(($page1 == 0) ? $disabled : "").">".($page1)."</div><div class=curr_page>".($page2)."</div><div onclick='search(\"".$order."\",false,".($limit_start + $limit_count).")' ".(($page3 > $page_count) ? $disabled : "").">".($page3)."</div>";
            echo "<div class=pages><div onclick='search(\"".$order."\",false,".($limit_start - $limit_count).")' class='pages_button ".((!$limit_start) ? "disabled" : "")."'>←Prev</div>".$pages."<div onclick='search(\"".$order."\",false,".($limit_start + $limit_count).")' class='pages_button ".(($limit_start + $limit_count >= $count) ? "disabled" : "")."'>Next→</div></div>";
        }
    }
    else
        return 0;
?>