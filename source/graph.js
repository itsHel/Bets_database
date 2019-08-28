var graph_options = {
    animationEnabled: true,
    theme: "light2",
    title:{
        text: ""
    },
    axisY: {
        title: "Networth",
        suffix: options.currency
    },
    toolTip:{
        shared:true
    }, 
    width:($(window).width()/100*90),
    legend:{
        cursor:"pointer",
        verticalAlign: "bottom",
        horizontalAlign: "left",
        dockInsidePlotArea: true
    },
    axisX:{
        title: "time",
        gridThickness: 2,
        interval:2, 
        valueFormatString: "DD MMM YY", 
        labelAngle: -20
    },
    data: [{
        type: "line",
        showInLegend: true,
        name: "Net",
        markerType: "square",
        color: "#F08080",
        xValueType: "dateTime"
    }]
};