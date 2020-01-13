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

 





// old gen graph code
/*
function generateDropdown(columnObject, headerArray) {
    var arrayColumnRange = [...Array(headerArray.length).keys()];
    var t = columnObject[0];
  
    function makeTrace(i) {
      var lineChart = {
        x: columnObject[0],
        y: columnObject[i],
        line: {
          shape: "line",
          color: "blue"
        },
  
        visible: i === 0,
        name: headerArray[i]
      };
  
      var markers = {
        x:t,
        y: columnObject[i],
        id: t,
        mode: 'markers',
        transforms: [{
          type: 'filter',
          operation: '<=',
          target: t,
          value: 0.0,   
        
        }]
  
      } 
      return markers;
    }
  
    function generateButtonDropdowns(rangeList, headerArray) {
      result = [];
      for (var i in rangeList) {
        var temp = Object();
        var boolList = Array(rangeList.length).fill(false);
        boolList[i] = true;
        temp["method"] = "restyle";
        temp["args"] = ["visible", boolList];
        temp["label"] = headerArray[i];
        result.push(temp);
      }
      return result;
    }
  
    var layout = {
      title: {
        text: selectedColumn === undefined ? "" : selectedColumn,
        font: {
          family: "Montserrat",
          size: 36
        },
        xref: "paper",
        x: window.innerWidth / 2
      },
      updatemenus: [
        {
          y: 1,
          yanchor: "top",
          buttons: generateButtonDropdowns(arrayColumnRange, headerArray)
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
      ],
  
      frames: t.map(t => ({
        name: t,
        data: [{'transforms[0].value': t}]
      }))
    };
  
    // Plotly.plot("graph", arrayColumnRange.map(makeTrace), layout);
  
    // Show Annotations on graph
    // myPlot.on("plotly_click", function(data) {
    //   for (var i = 0; i < data.points.length; i++) {
    //     annotate_text =
    //       "x = " + data.points[i].x + "; y = " + data.points[i].y.toPrecision(4);
  
    //     annotation = {
    //       text: annotate_text,
    //       x: data.points[i].x,
    //       y: parseFloat(data.points[i].y.toPrecision(4))
    //     };
  
    //     const checkText = obj => obj.text === annotation.text;
    //     if (global_annotations.some(checkText)) {
    //       global_annotations = global_annotations.filter(function(e) {
    //         return e !== annotation;
    //       });
    //     } else {
    //       global_annotations.push(annotation);
    //     }
  
    //     console.log(global_annotations);
    //     Plotly.relayout("graph", { annotations: global_annotations });
    //   }
    // });
  
    // // Retrieve name of column selected
    // myPlot.on("plotly_restyle", function(data) {
    //   const isTrue = element => element === true;
    //   var visIndex = data[0]["visible"].findIndex(isTrue);
    //   selectedColumn = headerArray[visIndex];
    //   Plotly.relayout("graph", { title: selectedColumn });
    // });
  
    /////////////////////////////////////////
  
   
  
  Plotly.plot('chart', {
    data: [{
      x: t,
      y: columnObject[2],
      id: t,
      mode: 'markers',
      transforms: [{
        type: 'filter',
        operation: '<=',
        target: t,
        value: 0.0
      }]
    }],
    layout: {    
      xaxis: {autorange: false, range:[0, t.length()]},
      yaxis: {autorange: true},
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
  
  
  
  }
  */