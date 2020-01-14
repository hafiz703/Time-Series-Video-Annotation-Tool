//********************//
// Global variables //
//********************//

var isPaused = true;
var frequency = 100;
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
    initializeDropdownsAndSlider(headers, columnSelector, columns);
    $("#contents").html(html);
  };
  reader.onerror = function() {
    alert("Unable to read " + file.fileName);
  };

  $("#loader").hide();

  // generateDynamicGraph();
}

function plotlyPlot(x_, y_, selectedcolumn) {
  var t = x_;
  Plotly.newPlot("graph", {
    data: [
      {
        x: t,
        y: y_,
        id: t,
        mode: "lines+markers",
        transforms: [
          {
            type: "filter",
            operation: "<=",
            target: t,
            value: 0.0
          }
        ]
      }
    ],
    layout: {
      xaxis: { autorange: false, range: [0, t.length] },
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
      },
      updatemenus: [
        {
          type: "buttons",
          xanchor: "left",
          yanchor: "top",
          direction: "right",
          x: 0,
          y: 0,
          pad: { t: 60 },
          showactive: false,
          buttons: [
            {
              label: "Play",
              method: "animate",
              args: [
                null,
                {
                  transition: { duration: 0 },
                  frame: { duration: frequency, redraw: false },
                  mode: "immediate",
                  fromcurrent: true
                }
              ]
            },
            {
              label: "Pause",
              method: "animate",
              args: [
                [null],
                {
                  frame: { duration: 0, redraw: false },
                  mode: "immediate"
                }
              ]
            }
          ]
        }
      ],
      sliders: [
        {
          currentvalue: {
            prefix: "t = ",
            xanchor: "right"
          },
          pad: { l: 130, t: 30 },
          transition: {
            duration: 0
          },
          steps: t.map(t => ({
            label: t,
            method: "animate",
            args: [
              [t],
              {
                frame: { duration: 0, redraw: false },
                mode: "immediate"
              }
            ]
          }))
        }
      ]
    },
    frames: t.map(t => ({
      name: t,
      data: [{ "transforms[0].value": t }]
    }))
  });
}

// Generate Graph
function generateGraph(columnObject, headerArray) {
  // var arrayColumnRange = [...Array(headerArray.length).keys()];
  var t = columnObject[0];
  plotlyPlot(t, t, headerArray[0]);

  myPlot.on("plotly_animated", function(d) {
    Plotly.relayout("graph", {
      "xaxis.autorange": true,
      "yaxis.autorange": true
    });
  });

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

function initializeDropdownsAndSlider(textArray, selector, columnObject) {
  // Init dropdown
  $(".control-row").css("visibility", "visible");
  for (var i = 0; i < textArray.length; i++) {
    var currentOption = document.createElement("option");
    currentOption.text = textArray[i];
    selector.appendChild(currentOption);
  }

  function updateColumn() {
    setTimeout(function() {
      $("#loader").show();
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

  // Init slider
  $("#slider").slider({
    orientation: "horizontal",
    value: 0,
    max: columnObject[0].length,
    slide: function(event, ui) {
      mplayer.currentTime(ui.value / frequency);

      $("#sliderVal").val(ui.value);
    }
  });
  $("#sliderVal").val($("#slider").slider("value"));

  $("#slider").on("mousedown", function(e) {
    e.preventDefault();
    alert("mousedown");
  });

  //slider range pointer mouseup event
  $("#slider").on("mouseup", function(e) {
    e.preventDefault();
    alert("mouseup");
  });
}

// Clear Annotations
$(document).on("click", "#clearAnnotations", function(e) {
  e.preventDefault();
  global_annotations = [];
  Plotly.relayout("graph", { annotations: global_annotations });
});
