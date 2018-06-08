$(function () {
  const util = {};
  const uiData = {};

  uiData.layers = [];
  uiData.network = "fc";
  uiData.rebuild = true;
  uiData.running = false;

  uiData.currDim = [28, 28, 1];

  function submit() {
    const appendFlatOp = function() {
      let dim = 1;
      uiData.currDim.forEach((n) => dim *= n);
      uiData.currDim = [dim];
      appendTensor("Flatten", "vertical_align_bottom");

    }
    switch (uiData.network) {
      case "fc":
        let outDims = new Number($("input[name=output-dim]").val());
        if (isNaN(outDims) || outDims <= 0 || outDims > 1024) return;

        //If they forgot to flatten, we flatten for them
        if (uiData.currDim.length > 1) {
          uiData.layers.push({
            type: "ops",
            operation: "flatten"
          });
          appendFlatOp();
        }

        uiData.layers.push({
          type: "fc",
          dims: outDims
        });
        uiData.currDim = [outDims];
        appendTensor("Dense", "horizontal_split");

        $("input[name=output-dim]").val("");
        updateMdl();

        if (outDims == 10) {
          $("#train-button").removeAttr("disabled");
        } else {
          $("#train-button").attr("disabled", "disabled");
        }

        break;
      case "cnn":
        let kernelSize = new Number($("input[name=cnn-size]").val());
        let features = new Number($("input[name=cnn-features]").val());
        let strides = new Number($("input[name=cnn-strides]").val());

        uiData.layers.push({
          type: "cnn",
          kernelSize,
          features,
          strides
        });

        uiData.currDim[2] = features.valueOf();
        appendTensor("Convolve", "filter");
        break;
      case "ops":
        let operation = $("input[name=ops-choice]").val();
        uiData.layers.push({
          type: "ops",
          operation
        });

        switch (operation) {
          case "flatten":
            appendFlatOp();
            break;
        }
        break;
    }
    util.setRunning(false);
  }

  util.setRunning = function (val) {
    $("#train-button i").text(val ? "stop" : "play_arrow");
    uiData.running = val;
  }

  $("#add-button").click(submit);

  $("#train-button").click(function () {
    if (uiData.rebuild) {
      uiData.rebuild = false;
      model = window.ml.createModel(uiData.layers);
    }

    util.setRunning(!uiData.running);
  });

  $(".final-input").keypress((e) => {
    if (e.which == 13) {
      submit();
    }
  })

  $('ul[for="choice-button"] .mdl-menu__item').click(function () {
    uiData.network = $(this).attr("value");

    $(".tensor-data").hide();
    $(`.tensor-data-${$(this).attr("value")}`).show();
  });

  function appendTensor(name, icon = "keyboard_arrow_down") {
    const base = $("#input-tensor").clone().removeAttr("id");
    base.find(".tensor-name").text(name);
    base.find(".tensor-dims").text(uiData.currDim.join("x"));
    base.find(".material-icons").text(icon);

    $("#tensor-list").append(base);
  }

  function updateMdl() {
    $(".mdl-textfield").each((index, e) => {
      e.MaterialTextfield.change();
    })
  }

  const updateFreq = 3;
  let ITERS = 0;
  //Training loop
  const trainingLoop = () => {
    if (uiData.running) {
      ITERS++;

      window.ml.train(model, ITERS % updateFreq == 0);

      if (ITERS % updateFreq == 0) {
        window.ml.predict(model);
      }
    }
    setTimeout(trainingLoop, 1000);
  }
  trainingLoop();
  
  window.ui = util;
});
