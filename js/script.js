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
var globalAnnotations = {};
// var frequency = 10;
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

// Video Picker

this.onFileChange = function() {
  let file = document.getElementById("videofile");
  this.mplayer.src("./" + file.files[0].name);
  $("#video-container").css("visibility", "visible");
  $("#videoTitle").html(
    file.files[0].name == null ? "Video" : file.files[0].name
  );

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
  $("#dashboardTitle").html(file.name);
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

    plotlyPlot(columns[0], columns[0], headers[0]);

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

//Table Logic
function generateRowMarkup(id, val) {
  var row = `<tr class='d-flex'> \
  <td id=${id} onClick="deleteRow(this.id)" class='col-1'><a href='#'><i class="fas fa-trash deleteRow"></i></a></td> \
  <td class='col-1'>${id}</td> \
  <td class='col-6'>${val}</td> \
  <td class='col-4'> \
      <input style='height:25px' class='form-control' value='1' type='number' />\
  </td>\
</tr>`;
  return row;
}

//Delete Row
// $(document).on("click", ".deleteRow", function() {
//   alert("clicked");
//   $("table tbody")
//     .find('td[name="record"]')
//     .each(function() {
//       console.log($(this));
//     });
// });

 
$(document).on('click', '.deleteRow', function() {
  var idToRemove = parseInt($(this).parents("td").attr("id"));
  delete globalAnnotations[idToRemove];
  $(this).parents("tr").remove();
});

function deleteRow(idToDelete){
  // console.log($(idToDelete));
  $(idToDelete).parent("tr").remove();
}
 

// Plot Graph
function plotlyPlot(x_, y_, selectedcolumn, divName = "graph") {
  Plotly.newPlot(divName, {
    data: [
      //  scatter plot that changes with user inputs
      {
        x: [],
        y: [],

        // mode: "lines",
        mode: "markers+lines",

        marker: {
          color: "rgb(255, 0, 0)"
        },
        line: {
          color: "rgba(255, 0, 0, 0.3)"
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

  myPlot.on("plotly_selected", function(eventData) {
    var x = [];
    var y = [];
    eventData.points.forEach(function(pt) {
      x.push(pt.x);
      y.push(pt.y);
    });

    // alert(x, y);

    //TODO : x,y update in table

    var range = Math.min(...x) + "..." + Math.max(...x);
    var id = Object.keys(globalAnnotations).length;
    globalAnnotations[id] = {
      id: id,
      range: range
    };

    var rowToAdd = generateRowMarkup(id, range);
    $("table tbody").append(rowToAdd);
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

  function setSliderTextValue(newval) {
    var secs = newval / getFrequency();
    mplayer.currentTime(secs);
    $("#sliderVal").val(fmtMSS(secs) + " || " + newval);
  }

  function sliderCallback(ui) {
    setSliderTextValue(ui.value);

    function filterValues(arr, val) {
      var nearThousand = Math.floor(val / 1000) * 1000;
      return arr.slice(nearThousand, val);
    }

    Plotly.animate(
      "graph",
      {
        data: [
          {
            x: columnObject[0].slice(0, ui.value),
            y: columnObject[selector.selectedIndex].slice(0, ui.value)
            // x: filterValues(columnObject[0], ui.value),
            // y: filterValues(columnObject[selector.selectedIndex], ui.value)
          }
        ],
        traces: [0]
      },
      {
        transition: {
          duration: 0
        },
        frame: { duration: 0, redraw: false }
      }
    );

    Plotly.relayout("graph", {
      "xaxis.autorange": true,
      "yaxis.autorange": true
    });
  }

  // Init slider
  $("#slider").slider({
    orientation: "horizontal",
    value: 0,
    max: columnObject[0].length,
    slide: function(event, ui) {
      sliderCallback(ui);
    }
    // change: function(event, ui) {
    //   sliderCallback(ui);
    // }
  });

  function updateColumn() {
    setTimeout(function() {
      $("#loader").show();
      $("#slider").slider("value", 0);
      $("#sliderVal").val($("#slider").slider("value"));
    }, 100);

    setTimeout(function() {
      // plotlyPlot(
      //   columnObject[0],
      //   columnObject[selector.selectedIndex],
      //   selector.value
      // );
      updatePointsOnPlot(
        columnObject[0],
        columnObject[selector.selectedIndex],
        {
          title: selector.value
        }
      );

      $("#loader").hide();
    }, 500);
  }
  selector.addEventListener("change", updateColumn, false);

  $("#sliderVal").val($("#slider").slider("value"));

  // Video
  $("#playPause").click(function() {
    isPaused = !isPaused;
    if (isPaused) {
      $("#playPause").html("Play");
      mplayer.pause();
    } else {
      $("#playPause").html("Pause");
      mplayer.play();
      // frequency =  $('#frequencyInput').val();
      // console.log("Frequency:" +frequency);
    }

    setInterval(function() {
      if (!isPaused) {
        var currentSliderVal = parseInt($("#slider").slider("value"));

        setSliderTextValue(currentSliderVal);
        $("#slider").slider("option", "value", currentSliderVal + 1);

        Plotly.extendTraces(
          "graph",
          {
            x: [[currentSliderVal + 1]],
            y: [[columnObject[selector.selectedIndex][currentSliderVal + 1]]]
          },
          [0]
        );
      }
    }, 1000 / getFrequency());
  });
}

// Frequency

function getFrequency(freqId = "frequencyInput") {
  var res = $("#frequencyInput").val() <= 0 ? 10 : $("#frequencyInput").val();
  // console.log("freq "+res);
  return res;
}

// Clear Annotations
$(document).on("click", "#clearAnnotations", function(e) {
  e.preventDefault();
  global_annotations = [];
  Plotly.relayout("graph", { annotations: global_annotations });
});

// Clear Points
$(document).on("click", "#clearPoints", function(e) {
  e.preventDefault();
  removePointsOnPlot();
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
