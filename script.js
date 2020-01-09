// $(document).ready(function() {
var interval = 100;
var isPaused = true;
var options = {};

var mplayer = videojs("my-video", options, function onPlayerReady() {
  videojs.log("Your player is ready!");

  // In this context, `this` is the player that was created by Video.js.
  this.play();

  // How about an event listener?
  this.on("ended", function() {
    videojs.log("Awww...over so soon?!");
  });
});

function drawGraphAxis(){

}

function generateGraph() {
  function getData() {
    return Math.random();
  }
  Plotly.plot("chart", [
    {
      y: [getData()],
      type: "line"
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
        });
      }
    }
  }, interval);
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

this.onFileChange = function () {
    let file = document.getElementById('videofile');  
     
    this.mplayer.src("./"+file.files[0].name);
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
$.fn.getColumn = function(column) {
    return this.find('tr').map(function() {
        return $(this).find('td').eq(column).text();
    }).get();
};

function printTable(file) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    var csv = event.target.result;
    var data = $.csv.toArrays(csv);
    var html = "";
    for (var row in data) {
      html += "<tr>\r\n";
      for (var item in data[row]) {
        html += "<td>" + data[row][item] + "</td>\r\n";
      }
      html += "</tr>\r\n";
    }
    $("#contents").html(html);
  };
  reader.onerror = function() {
    alert("Unable to read " + file.fileName);
  };
  console.log($('table').getColumn(1));
  generateGraph();
}


 

// });
