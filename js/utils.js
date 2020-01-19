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

var observeDOM = (function() {
  var MutationObserver =
    window.MutationObserver || window.WebKitMutationObserver;

  return function(obj, callback) {
    if (!obj || !obj.nodeType === 1) return; // validation

    if (MutationObserver) {
      // define a new observer
      var obs = new MutationObserver(function(mutations, observer) {
        callback(mutations);
      });
      // have the observer observe foo for changes in children
      obs.observe(obj, { childList: true, subtree: true });
    } else if (window.addEventListener) {
      obj.addEventListener("DOMNodeInserted", callback, false);
      obj.addEventListener("DOMNodeRemoved", callback, false);
    }
  };
})();

function fmtMSS(s) {
  return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + Math.round(s * 10) / 10;
}

function updatePointsOnPlot(
  newx,
  newy,
  layout_,
  graphdiv = "graph",
  traces_ = [0]
) {
  Plotly.update(
    graphdiv,
    {
      x: [newx],
      y: [newy]
    },
    layout_,
    traces_
  );
}

function removePointsOnPlot() {
  updatePointsOnPlot([], [], {});
}

function range(start, stop, step = 1) {
  var a = [start],
    b = start;
  while (b < stop) {
    a.push((b += step || 1));
  }
  return a;
}

//* headerArray -> array
//* rows -> object of array rows
function downloadCsv(headerArray, data,outputFileName = "output.csv") {   
  var csv = headerArray.join() + "\n";
  for (row in data) {
    csv +=data[row].join(",");
    csv += "\n";     
  }   
  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = outputFileName;
  hiddenElement.click();
}

//Unused functions
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
