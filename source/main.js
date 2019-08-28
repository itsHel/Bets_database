var options = {
    currency: "\u20AC",         //€
    limit: (localStorage.limit) ? localStorage.limit : 25,
    direction: "",
    last_order: "",
    types: ["Dota live", "Arb", "Bonus", "Special", "Dota", "Value bet"],
    sites: ["","ggbet","fusion","es","egb","loot","esporbet","thunder","tipsport","fortuna","pinnacle","rivalry","unibet","unikrn","thunder_cmb"]
}

function is_empty(value){
   return (value) ? value : "%";
}

function search(order, change_direction = false, limit_start = 0, element_id){
    $(".loading").fadeIn();
    
    // order
    if(change_direction && options.last_order == order){
        if(options.direction == "ASC")
            options.direction = "DESC";
        else
            options.direction = "ASC";
    } else {
        options.direction = "ASC";
    }
    options.last_order = order;
    
    if($("#search_date").val() != "yesterday")
        var mydate = new Date($("#search_date").val()).getTime()/1000;
    else
        var mydate = $("#search_date").val();
    var params = {
        type: is_empty($("#search_type").val()),
        bet: is_empty($("#search_bet").val()),
        rate: is_empty($("#search_rate").val()),
        site: is_empty($("#search_site").val()),
        note: is_empty($("#search_note").val()),
        date: (isNaN(mydate) && mydate != "yesterday") ? "%" : mydate,
        order: order,
        limit: {
            start: limit_start,
            count: options.limit
        },
        direction: options.direction
    };

    $.get("source/search.php", {params: params}, function(echo){
        if(echo == "no connection"){
            $(".table").text("Cant connect to database");
            $(".loading").fadeOut(200);
            return;
        }
        var data = echo.split("<br>");
//        console.log(data[0]);         //graph
//        console.log(data[1]);         //stats
//        console.log(data[2]);         //table data

        graph_options.data[0].dataPoints = JSON.parse(data[0]);
        var stats = JSON.parse(data[1]);
        $(".table").text("").append(data[2]);

        $(".graph").CanvasJSChart(graph_options);

        // stats
        $("#net").text(Math.round((stats.earned - stats.lost)*10)/10 + " " + options.currency);
        $("#in_play").text(stats.in_play + " " + options.currency);
        $("#count").text(stats.count);
        $("#winrate").text(Math.round(stats.won_count/(stats.won_count + stats.lost_count) *10000)/100 + "%");
        $("#ROI").text(Math.round((stats.earned - stats.lost)/(stats.won + stats.lost) *10000)/100 + "%");
        $("#avg_rate").text(stats.avg_rate);

        $(".result_input").on("keypress",function(e){
                if (e.keyCode == 13)
                    $(this).css({color:"blue"}); 
        });

        $(".row .icons #mark").on("click", function(){
            $(this).parent().parent().toggleClass("marked"); 
        });
        $(".row .icons #delete").on("click", function(){
            $(".wrapper").eq(1).fadeIn(300).find(".confirmation_panel").data("to_delete", $(this).parent().parent().attr("id"));
        });

        $(".row .blok").each(function(){
            change_on_dlbclick(this);
        });

        $(".mid div").eq(0).on("click", function(){
            $(".pages_button").eq(0).click();
        });
        $(".mid div").eq(2).on("click", function(){
            $(".pages_button").eq(1).click();
        });
        $("head").append("<style>.bet::after{content: ' " + options.currency + "' !important}</style>");
        
        if(element_id){
            if(options.direction == "ASC"){
                $("#" + element_id).addClass("order_up");
                $("#" + element_id).removeClass("order_down");
            } else if (options.direction == "DESC"){
                $("#" + element_id).addClass("order_down");
                $("#" + element_id).removeClass("order_up");
            }
        }
        
        $(".rate span").append(" " + options.currency);
        $(".loading").fadeOut(200);
        $("#net").html("<span onclick='this.textContent = \"" + $("#net").text() + "\"'>Net</span>");
    });
};

function add_bet(){
    //currency change
    if ($("#site").val() == "4")
        $("#bet").val(Math.round($("#bet").val()/1.18*10)/10);
    if ($("#site").val() == "8")
        $("#bet").val(Math.round($("#bet").val()/25*10)/10);
    //
    var type = ($("#type").val()) ? $("#type").val() : "Value bet", bet = $("#bet").val(), rate = $("#rate").val(), result = $("#result").val(), note = $("#note").val(), site = $("#site").val() ;
    var params = "type=" + type + "&bet=" + bet +"&rate=" + rate + "&result=" + result + "&note=" + note + "&site=" + site;
    if((!($.isNumeric(bet) && $.isNumeric(rate) && $.isNumeric(site))) || result.length > 1){
        if(!($.isNumeric(bet))){
            $("#bet").removeClass("highlight").addClass("warning").delay(700).queue(function(next){
                $(this).removeClass("warning").addClass("highlight");
                next();
            });
        }
        if(!($.isNumeric(rate))){
            $("#rate").removeClass("highlight").addClass("warning").delay(700).queue(function(next){
                $(this).removeClass("warning").addClass("highlight");
                next();
            });
        }
        if(!($.isNumeric(site))){
            $("#site").removeClass("highlight").addClass("warning").delay(700).queue(function(next){
                $(this).removeClass("warning").addClass("highlight");
                next();
            });
        }
        if(result.length > 1){
            $("#result").removeClass("highlight").addClass("warning").delay(700).queue(function(next){
                $(this).removeClass("warning").addClass("highlight");
                next();
            });
        }
        console.log("fail");
        return;
    }
    let url = "source/add.php?" + params;

    $.ajax({
        method:"post",
        url:url
    }).done(function(echo){
        if(!$.isNumeric(echo))
            alert(echo);
        else{
            $("#check").fadeIn(0).delay(800).fadeOut(500);
            search("result");
        }
    });

    myclear(0);
    $("#bet").focus();            
};

function mytype(where){
    switch(where.value.toLowerCase()){
        case "l":
                where.value="Dota live";
                break;
        case "a":
                where.value="Arb";
                break;
        case "b":
                where.value="Bonus";
                break;
        case "s":
                where.value="Special";
                break;
        case "d":
                where.value="Dota";
                break;
        case "v":
                where.value="Value bet";
                break;       
        case "value bet":
                where.value="Value bet";
                break;
    }
};

function change_on_dlbclick(element){
    $(element).on("dblclick", function(){
        if($(this).find("input").length)
            return;
        $(this).html("<input class=change_value>")
        .find("input").focus().on("keypress", function(e){
            if(e.keyCode == 13){
                $(this).css({color:"blue"});
                change_bet($(this).val(), $(this).parent().attr("class"), $(this).parent().parent().attr("id"));
            }
        });
    });
};

function myblur(){
    if(this.value != "" && !(this.classList.contains("warning"))){
        this.classList.add("highlight");
    } else {
        this.classList.remove("highlight");
    }
}

function change_bet(value, type, id){
    var params = "value=" + value + "&type=" + type.replace("blok ","") + "&id=" + id;
    var url = "source/change.php?" + params;
    $.ajax({
        method:"post",
        url:url
    }).done(function(echo){
        if(echo != "ok")
            alert(echo);
    });
}

function myclear(where){
    $(".form").eq(where).find("input").val("").removeClass("highlight");
}

function delete_row(id){
    $.post("source/delete.php?id=" + id, function(echo){
        if(echo != "ok")
            alert(echo);
    });
}

//init
$(function(){
    search('result');
    
    let siteList = options.sites.map(function(i, row){
        if(i == 0)
            return "";
        return "<li><div>" + i + "</div><div>" + row + "</div></li>";    
    }).join("");
    $(".sites ul").append(siteList);
    
    $(window).on("keydown", function(e){
        if(!$(e.target).is("input"))
            if(e.keyCode == 32){
                e.preventDefault();
                $("#search").click();
            }
    });

    $(".form").eq(0).find("input").on("keyup", function(e){
        if(e.keyCode == 13) 
            $("#set").click(); 
    });
    $(".form").eq(1).find("input").on("keyup", function(e){
        if(e.keyCode == 13)
            $("#search").click(); 
    });  
    $("#today").on("click", function(){
        $("#search_date").val($.datepicker.formatDate('mm-dd-yy', new Date()));
        $("#search").click();
    });
    $("#yesterday").on("click", function(){
        $("#search_date").val("yesterday");
        $("#search").click();
    });

    $(".form input:first-of-type").devbridgeAutocomplete({lookup:options.types});

    $(".form input").on("keyup", myblur);
    $(".form input").on("focus", function(){
        $(this).select();
    });

    $("input[type='text']").on("keydown", function(e){
        if (e.key == "Escape")
            $(this).blur();
    });
    $("#search_date").datepicker({
        dateFormat:"mm-dd-yy",
        onClose: function(){
            $("#search_date").focus();
            $("#search_date").each(myblur);
        }
    });

    $(document).on("keydown",function(e){
        if(e.keyCode == 36)
            $("input").eq(1).focus();
    });

    $(window).on("focus",function(){
        $("input").eq(1).focus();
    });

    // nav
    for(let i = 0; i < 2; i++)
        $("nav li").eq(i).on("click", function(){
            $(".form").eq(i).find("input").eq(1).focus();
        });
    $("nav li").eq(2).on("click", function(){
        search("result"); 
    });

    // settings
    $("#limit").text(localStorage.limit).parent().on("click", function(){
        $(this).html("<input class=limit value=" + localStorage.limit + ">").find("input").on("keydown", function(e){
            if(e.keyCode == 13 || e.keyCode == 27){
                var mylimit = Math.round($(this).val());
                if(mylimit < 1)
                    mylimit = 1;
                else if(mylimit > 1000)
                    mylimit = 1000;
                localStorage.limit = mylimit;
                options.limit = mylimit;
                $(this).parent().html("Limit: <span id=limit>" + mylimit + "</span>");
            }
        }).select();
    });
    $("#limit").text(" " + options.limit);
    localStorage.limit = options.limit;
    //
    $(".confirmation_panel #delete_button").on("click", function(){
        var id = $(".confirmation_panel").data("to_delete");
        delete_row(id);
        $(".wrapper").eq(1).fadeOut(150);
        $("#" + id).css({color:"red"});
    });

    // popups
    $(".wrapper").on("click", function(e){
        if($(e.target).hasClass("wrapper")){
            $(this).fadeOut(150);
        }
    });
    $(window).on("keydown", function(e){
        if(e.keyCode == 27){
            $(".wrapper").fadeOut(150);
        }
    });
    $("#graph").on("click", function(){
        $(".wrapper").eq(0).fadeIn(300);
    });
    $(".wrapper").eq(0).hide();
    $(".confirmation_panel button:last-of-type, .close").on("click", function(){
        $(".wrapper").eq(1).fadeOut(150);
    })

    $("input").eq(1).focus();
});