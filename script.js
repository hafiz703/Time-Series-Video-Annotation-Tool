// $(document).ready(function() {
var interval = 100;
var isPaused = true;
var options = {
  autoplay: false
  // errorDisplay: false
};
// generateGraph();
var myPlot = document.getElementById("graph");
var global_annotations = [];
var layout = {
  hovermode: "closest",
  title: "$y"
};

var columns = new Object();
var rows = new Object();
var headers = [];

// Plotly.newPlot("chart", data, layout);

// myPlot.on("plotly_click", function(data) {
//   for (var i = 0; i < data.points.length; i++) {
//     annotate_text =
//       "x = " + data.points[i].x + "; y = " + data.points[i].y.toPrecision(4);

//     annotation = {
//       text: annotate_text,
//       x: data.points[i].x,
//       y: parseFloat(data.points[i].y.toPrecision(4))
//     };

//     // annotations = self.layout.annotations || [];
//     // annotations.push(annotation);
//     const checkText = obj => obj.text === annotation.text;
//     if (global_annotations.some(checkText)){
//         global_annotations = global_annotations.filter(function(e) { return e !== annotation })
//     }else{
//         global_annotations.push(annotation);
//     }

//     console.log( global_annotations)
//     Plotly.relayout("chart", { annotations: global_annotations });
//   }
// });

// myPlot.on('plotly_selected', function(eventData) {
//     console.log("kek")
//     var x = [];
//     var y = [];

//     var colors = [];
//     for(var i = 0; i < N; i++) colors.push(color1Light);

//     eventData.points.forEach(function(pt) {
//       x.push(pt.x);
//       y.push(pt.y);
//       colors[pt.pointNumber] = color1;
//     });

//     Plotly.restyle(myPlot, {
//       x: [x, y],
//       xbins: {}
//     }, [1, 2]);

//     Plotly.restyle(myPlot, 'marker.color', [colors], [0]);
//   });

var mplayer = videojs("my-video", options, function onPlayerReady() {
  videojs.log("Your player is ready!");

  // In this context, `this` is the player that was created by Video.js.
  this.play();

  // How about an event listener?
  this.on("ended", function() {
    videojs.log("Vide Ended");
  });
});

function drawGraphAxis() {}

function generateStaticGraph(x_, y_, divname, type_ = "scatter") {
  
  var dataTrace = {
    x: x_,
    y: y_,
    type: type_
  };

  Plotly.newPlot(divname, [dataTrace]);
}

function generateDynamicGraph() {
  function getData() {
    return Math.random();
  }
  Plotly.newPlot("chart", [
    {
      y: [getData()],
      type: "line",
      layout: layout
    }
  ]);

  //   Plotly.newPlot(
  //     "chart",
  //     {
  //       y: [getData()],
  //       type: "line"
  //     },
  //
  //   );

  var cnt = 0;
  setInterval(function() {
    if (!isPaused) {
      Plotly.extendTraces(
        "chart",
        {
          y: [[getData()]]
        },
        [0]
      );
      cnt++;
      if (cnt > 500) {
        Plotly.relayout("chart", {
          xaxis: {
            range: [cnt - 500, cnt]
          }
          //   annotations: self.layout.annotations
        });
      }
    }
  }, interval);
}

// generateGraph();

// Video
$(document).on("click", "#playPause", function(e) {
  e.preventDefault();
  isPaused = !isPaused;
  if (isPaused) {
    $("#playPause").html("Play");
    mplayer.pause();
  } else {
    $("#playPause").html("Pause");
    mplayer.play();
  }
});

// Video Picker

this.onFileChange = function() {
  //   this.mplayer.errorDisplay(true);
  //   $('#my-video').css('visibility','visible');
  let file = document.getElementById("videofile");

  this.mplayer.src("./" + file.files[0].name);

  this.mplayer.pause();
};

// CSV file picker

if (isAPIAvailable()) {
  $("#csvfile").bind("change", handleFileSelect);
}

function isAPIAvailable() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    return true;
  } else {
    // source: File API availability - http://caniuse.com/#feat=fileapi
    // source: <output> availability - http://html5doctor.com/the-output-element/
    document.writeln(
      "The HTML5 APIs used in this form are only available in the following browsers:<br />"
    );
    // 6.0 File API & 13.0 <output>
    document.writeln(" - Google Chrome: 13.0 or later<br />");
    // 3.6 File API & 6.0 <output>
    document.writeln(" - Mozilla Firefox: 6.0 or later<br />");
    // 10.0 File API & 10.0 <output>
    document.writeln(
      " - Internet Explorer: Not supported (partial support expected in 10.0)<br />"
    );
    // ? File API & 5.1 <output>
    document.writeln(" - Safari: Not supported<br />");
    // ? File API & 9.2 <output>
    document.writeln(" - Opera: Not supported");
    return false;
  }
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var file = files[0];

  // read the file metadata
  var output = "";

  // read the file contents
  printTable(file);

  // post the results
  $("#list").append(output);
}

//Table utils

function printTable(file) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    var csv = event.target.result;
    var data = $.csv.toArrays(csv);

    var html = "";

    // for (var row in data) {
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      rows[i] = row;
      html += "<tr>\r\n";

      for (var j = 0; j < row.length; j++) {
        item = row[j];
        html += "<td>" + item + "</td>\r\n";
        if (!(j in columns)) {
          columns[j] = [];
        }

        if (i != 0) {
          columns[j].push(item);
        }
      }

      html += "</tr>\r\n";
    }

    headers = rows[0];
    delete rows[0];
    // generateStaticGraph(columns[0], columns[6], "graph");
    generateDropdown(columns,headers);
    $("#contents").html(html);
  };
  reader.onerror = function() {
    alert("Unable to read " + file.fileName);
  };

  // generateDynamicGraph();
  
}


// Dropdown + Graph

function generateDropdown(columnObject,headerObject){
  function makeTrace(i) {

    return {
        x:columnObject[0],
        y: columnObject[i],
        line: { 
            shape: 'line' ,
            color: 'blue'
        },
        visible: i === 0,
        name: headerObject[i],
  
    };
  }

  var arrayColumnRange = [...Array(headers.length).keys()];

  function generateButtonDropdowns(rangeList,headerList){
      result = [];
      for(var i in rangeList){
        var temp = Object();
        var boolList = Array(rangeList.length).fill(false);
        boolList[i] = true
        temp['method'] = 'restyle';
        temp['args'] = ['visible',boolList];
        temp['label'] = headerList[i];
        result.push(temp);

      }
      return result;
  }

  Plotly.newPlot('graph', arrayColumnRange.map(makeTrace), {
    updatemenus: [      
     {
        y: 1,
        yanchor: 'top',
        buttons: generateButtonDropdowns(arrayColumnRange,headerObject),
    }],
  });

  

  
  // Show Annotations on graph 
  myPlot.on("plotly_click", function(data) {
    for (var i = 0; i < data.points.length; i++) {
      annotate_text =
        "x = " + data.points[i].x + "; y = " + data.points[i].y.toPrecision(4);
  
      annotation = {
        text: annotate_text,
        x: data.points[i].x,
        y: parseFloat(data.points[i].y.toPrecision(4))
      };
 
      const checkText = obj => obj.text === annotation.text;
      if (global_annotations.some(checkText)){
          global_annotations = global_annotations.filter(function(e) { return e !== annotation })
      }else{
          global_annotations.push(annotation);
      }
  
      console.log( global_annotations)
      Plotly.relayout("graph", { annotations: global_annotations });
    }
  });



  myPlot.on("plotly_restyle",function(data){
    console.log(data[0]['visible']);
    const isTrue = (element) => element === true;
    var visIndex = data[0]['visible'].findIndex(isTrue);
    alert(headers[visIndex]);
     
  })
}

// Clear Annotations
$(document).on("click", "#clearAnnotations", function(e) {
  e.preventDefault();
  global_annotations = [];
  Plotly.relayout("graph", { annotations: global_annotations });
});

// });

/* Animation trace chart
var t = new Array(101).fill(0).map((d, i) => i / 100);

Plotly.plot('graph', {
  data: [{
    x: t,
    y: t.map(t => t * t + Math.sin(t * 30)),
    id: t,
    mode: 'markers',
    transforms: [{
      type: 'filter',
      operation: '=',
      target: t,
      value: 0.0
    }]
  }],
  layout: {
    xaxis: {autorange: false, range: [0, 1]},
    yaxis: {autorange: false, range: [-1, 2]},
    updatemenus: [{
      type: 'buttons',
      xanchor: 'left',
      yanchor: 'top',
      direction: 'right',
      x: 0,
      y: 0,
      pad: {t: 60},
      showactive: false,
      buttons: [{
        label: 'Play',
        method: 'animate',
        args: [null, {
          transition: {duration: 0},
          frame: {duration: 20, redraw: false},
          mode: 'immediate',
          fromcurrent: true,
        }]
      }, {
        label: 'Pause',
        method: 'animate',
        args: [[null], {
          frame: {duration: 0, redraw: false},
          mode: 'immediate',
        }]
      }]
    }],
    sliders: [{
      currentvalue: {
        prefix: 't = ',
        xanchor: 'right'
      },
      pad: {l: 130, t: 30},
      transition: {
        duration: 0,
      },
      steps: t.map(t => ({
        label: t,
        method: 'animate',
        args: [[t], {
          frame: {duration: 0, redraw: false},
          mode: 'immediate',
        }]
      }))
    }]
  },
  frames: t.map(t => ({
    name: t,
    data: [{'transforms[0].value': t}]
  }))
})

*/
