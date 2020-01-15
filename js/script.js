//********************//
// Global variables //
//********************//

var isPaused = true;
 
// Video options
var video_options = {
  autoplay: false
  // errorDisplay: false
};

var myPlot = document.getElementById("graph");
var global_annotations = [];
var frequency = 10;
// var columns = new Object();
// var rows = new Object();
// var headers = [];

// Initialize video component
var mplayer = videojs("my-video", video_options, function onPlayerReady() {
  videojs.log("Your player is ready!");

  // In this context, `this` is the player that was created by Video.js.
  this.pause();

  // How about an event listener?
  this.on("ended", function() {
    videojs.log("Video Ended");
  });
});

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

  var layout = {
    hovermode: "closest",
    title: "$y"
  };
  Plotly.newPlot("chart", [
    {
      y: [getData()],
      type: "line",
      layout: layout
    }
  ]);

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
  }, frequency);
}

// Video Picker

this.onFileChange = function() {
  let file = document.getElementById("videofile");
  this.mplayer.src("./" + file.files[0].name);
  // this.mplayer.pause();
};

// CSV file picker
// *
// * isAPIAvailable defined in utils
// *
if (isAPIAvailable()) {
  $("#csvfile").bind("change", handleFileSelect);
  $("#csvfile").bind("click", function() {
    setTimeout(function() {
      $("#loader").show();
    }, 500);
  });
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var file = files[0];
  // console.log(file);
  //DEBUGONLY
  // var file = "./file1.csv"

  // read the file metadata
  var output = "";

  // read the file contents
  printTable(file);

  // post the results
  $("#list").append(output);
}

//Table utils

// * Input csv data in raw form
// *
// * Outputs html, column, row and header objects
function parseCSV(csvData) {
  const columns = Object();
  const rows = Object();
  var headers = [];
  var html = "";
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
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
  return [html, rows, columns, headers];
}

function printTable(file) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    var csv = event.target.result;
    var data = $.csv.toArrays(csv);
    var columnSelector = document.querySelector(".columndata");

    const [html, rows, columns, headers] = parseCSV(data);

    // generateStaticGraph(columns[0], columns[6], "graph");
    generateGraph(columns, headers);

    // initialize dropdowns
    initializeUIWidgets(headers, columnSelector, columns);
    $("#contents").html(html);
  };
  reader.onerror = function() {
    alert("Unable to read " + file.fileName);
  };

  $("#loader").hide();

  // generateDynamicGraph();
}

function plotlyPlot(x_, y_, selectedcolumn, divName = "graph") {
  Plotly.newPlot(divName, {
    data: [
      {
        x: x_,
        y: y_,

        // mode: "lines+markers",
        mode: "marker",
        marker: {
          color: "rgb(85, 178, 250)",
          line: {
            color: "rgb(0, 0, 0)",
            width: 0.5
          }
        },

        line: {
          color: "rgb(21, 0, 158)"
        }
      }
    ],
    layout: {
      xaxis: { autorange: false, range: [0, x_.length] },
      yaxis: { autorange: true },
      title: {
        text: selectedcolumn === undefined ? "" : selectedcolumn,
        font: {
          family: "Montserrat",
          size: 36
        },
        dragmode: "lasso",
        xref: "paper",
        x: window.innerWidth / 2
      }
    }
  });
}

// Generate Graph
function generateGraph(columnObject, headerArray) {
  // var arrayColumnRange = [...Array(headerArray.length).keys()];
  var t = columnObject[0];
  plotlyPlot(t, t, headerArray[0]);

  // myPlot.on("plotly_animated", function(d) {

  // });

  myPlot.on("plotly_selected", function(eventData) {
    var x = [];
    var y = [];

    eventData.points.forEach(function(pt) {
      x.push(pt.x);
      y.push(pt.y);
    });

    alert(x, y);
    //TODO : x,y update in table
  });
}



function initializeUIWidgets(textArray, selector, columnObject) {
  // Init dropdown
  $(".control-row").css("visibility", "visible");
  for (var i = 0; i < textArray.length; i++) {
    var currentOption = document.createElement("option");
    currentOption.text = textArray[i];
    selector.appendChild(currentOption);
  }

  function sliderCallback(ui) {
    var secs = ui.value / frequency;
    mplayer.currentTime(secs);

    $("#sliderVal").val(fmtMSS(secs) + " || " + ui.value);

    function filterValues(arr,val){
         
        var nearThousand = Math.floor(val/1000)*1000;
        return arr.slice(nearThousand, val);
         
    }

    Plotly.animate(
      "graph",
      {
        data: [
          {
            // x: columnObject[0].slice(0, ui.value),
            // y: columnObject[selector.selectedIndex].slice(0, ui.value)
            x: filterValues(columnObject[0],ui.value),
            y: filterValues(columnObject[selector.selectedIndex],ui.value)
          }
        ]
      },
      {
        transition: {
          duration: 0
        },
        frame: { duration: 0, redraw: false }
      }
    );

    // Plotly.relayout("graph", {
    //   "xaxis.autorange": true,
    //   "yaxis.autorange": true
    // });
  }

  // Init slider
  $("#slider").slider({
    orientation: "horizontal",
    value: 0,
    max: columnObject[0].length,
    slide: function(event, ui) {
      sliderCallback(ui);
    },
    change: function(event, ui) {
      sliderCallback(ui);
    }
  });

  function updateColumn() {
    setTimeout(function() {
      $("#loader").show();
      $("#slider").slider("value", 0);
    }, 100);

    setTimeout(function() {
      plotlyPlot(
        columnObject[0],
        columnObject[selector.selectedIndex],
        selector.value
      );
      $("#loader").hide();
    }, 500);
  }
  selector.addEventListener("change", updateColumn, false);

  $("#sliderVal").val($("#slider").slider("value"));


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

    setInterval(function() {
      if (!isPaused) {
        $("#slider").slider(
          "option",
          "value",
          $("#slider").slider("value") + 1
        );
      }
    }, 1000/frequency);
  });
}

// Clear Annotations
$(document).on("click", "#clearAnnotations", function(e) {
  e.preventDefault();
  global_annotations = [];
  Plotly.relayout("graph", { annotations: global_annotations });
});


// $("#slider").on("mousedown", function(e) {
//   e.preventDefault();
//   // alert("mousedown");
// });

// //slider range pointer mouseup event
// $("#slider").on("mouseup", function(e) {
//   e.preventDefault();
//   // alert("mouseup");
// });
