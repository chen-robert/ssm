$(function () {
  const uiData = {};
  let network = null;

  uiData.layers = [];
  uiData.network = "fc";
  uiData.rebuild = true;
  uiData.running = false;

  function submit() {
    switch (uiData.network) {
      case "fc":
        let outDims = new Number($("input[name=output-dim]").val());
        uiData.layers.push({
          type: "fc",
          dims: outDims
        });
        appendTensor("Fully Connected", [outDims]);

        $("input[name=output-dim]").val("");
        updateMdl();

        if (outDims == 10) {
          $("#train-button").removeAttr("disabled");
        } else {
          $("#train-button").attr("disabled", "disabled");
        }

        break;
      case "cnn":
        break;
      case "ops":
        break;
    }
    setRunning(false);
  }

  function setRunning(val) {
    $("#train-button i").text(val ? "stop" : "play_arrow");
    uiData.running = val;
  }

  $("#add-button").click(submit);

  $("#train-button").click(function () {
    if (uiData.rebuild) {
      uiData.rebuild = false;
      model = window.ml.createModel(uiData.layers);
    }

    setRunning(!uiData.running);
  });

  $(".final-input").keypress((e) => {
    if (e.which == 13) {
      submit();
    }
  })

  $('ul[for="choice-button"] .mdl-menu__item').click(function () {
    uiData.network = $(this).attr("value");
  });

  function appendTensor(name, dim, icon = "keyboard_arrow_down") {
    const base = $("#input-tensor").clone().removeAttr("id");
    base.find(".tensor-name").text(name);
    base.find(".tensor-dims").text(dim.join("x"));
    base.find(".material-icons").text(icon);

    $("#tensor-list").append(base);
  }

  function updateMdl() {
    $(".mdl-textfield").each((index, e) => {
      e.MaterialTextfield.change();
    })
  }

  let ITERS = 0;
  //Training loop
  setInterval(() => {
    if (uiData.running) {
      window.ml.train(model);

      if (ITERS++ % 5 == 0) {
        window.ml.predict(model);
      }
    }
  }, 250);
});
