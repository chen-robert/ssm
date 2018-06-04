$(function () {
  const util = {};
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 28;

  const imgDisp = document.getElementById("img-disp");
  util.renderImage = function (image) {

    const width = height = 28;

    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image.dataSync();
    for (let i = 0; i < height * width; ++i) {
      const j = i * 4;
      imageData.data[j + 0] = data[i] * 255;
      imageData.data[j + 1] = data[i] * 255;
      imageData.data[j + 2] = data[i] * 255;
      imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    imgDisp.getContext("2d").drawImage(canvas, 0, 0, imgDisp.width, imgDisp.height);

  }
  util.renderProbs = function (probs) {
    probChart.data.datasets[0].data = probs;
    probChart.update();
  }

  function createProbChart() {
    const labels = [];
    const zeroes = [];
    for (var i = 0; i < 10; i++) {
      labels.push(i.toString());
      zeroes.push(0);
    }

    return new Chart($("#prob-disp"), {
      "type": "bar",
      "data": {
        "labels": labels,
        "datasets": [{
          "label": "Predictions",
          "data": zeroes,
          "fill": false,
          "backgroundColor": "rgba(201, 203, 207, 0.2)",
          "borderColor": "rgb(201, 203, 207)",
          "borderWidth": 1
        }]
      },
      "options": {
        "scales": {
          "yAxes": [{
            "ticks": {
              "beginAtZero": true,
              min: 0,
              max: 1,
              stepSize: 0.1
            }
          }]
        },
        "tooltips": {
          enabled: false
        },
        "legend": {
          display: false
        }
      }
    });
  }

  util.addLossAccur = function (loss, accur) {
    lossChart.data.datasets[0].data.push(loss);
    lossChart.data.datasets[1].data.push(accur);


    lossChart.data.labels.push(lossChart.data.labels.length);

    lossChart.update();
  }

  function createLossChart() {
    return new Chart($("#loss-disp"), {
      "type": "line",
      "data": {
        "labels": [],
        "datasets": [{
          "label": "Loss",
          "data": [],
          yAxisID: "loss",
          "fill": false,
          "backgroundColor": "rgb(201, 0, 0)",
          "borderColor": "rgb(201, 0, 0)",
          "borderWidth": 1
        }, {
          "label": "Accuracy",
          "data": [],
          yAxisID: "accur",
          "fill": false,
          "backgroundColor": "rgb(0, 0, 201)",
          "borderColor": "rgb(0, 0, 201)",
          "borderWidth": 1
        }]
      },
      "options": {
        elements: {
          point: {
            radius: 0
          }
        },
        "scales": {
          "yAxes": [{
            type: "linear",
            "ticks": {
              "beginAtZero": true
            },
            position: "left",
            id: "loss",
            gridLines: {
              display: false
            }
          }, {
            type: "linear",
            "ticks": {
              "beginAtZero": true,
              min: 0,
              max: 1
            },
            position: "right",
            id: "accur",
            gridLines: {
              display: false
            }
          }],
          xAxes: [{
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10
            },
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true,
              labelString: "Iterations"
            }
          }]
        },
        tooltips: {
          enabled: false
        }
      }
    });
  }

  const probChart = createProbChart();
  const lossChart = createLossChart();

  window.disp = util;
});
