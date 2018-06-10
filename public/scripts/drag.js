$(function () {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 28;

  const ctx = canvas.getContext("2d");

  const uploadFiles = (e, files = e.target.files) => {
    const reader = new FileReader();

    if (typeof model === "undefined") return true;
    if (!/image\/.*/.test(files[0].type)) {
      return false;
    }

    reader.onload = function () {

      const img = document.createElement("img");
      img.src = reader.result;

      img.onload = () => {
        ctx.drawImage(img, 0, 0, 28, 28);

        const data = ctx.getImageData(0, 0, 28, 28).data;
        const grayedData = [];
        for (let i = 0; i < data.length; i += 4) {
          const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
          grayedData.push(average / 255);
        }

        const xs = tf.tensor2d(new Float32Array(grayedData), [1, grayedData.length]);

        window.ui.setRunning(false);
        window.ml.predict(model, xs);

      }
    }

    reader.readAsDataURL(files[0]);
    return true;
  };

  $("html").on("drag dragover dragstart dragend dragenter dragleave drop", (e) => e.preventDefault());
  $("#img-upload").change(uploadFiles);
  $("#img-upload").click(function () {
    this.value = null;
  });

  $("#img-drag").click(() => $("#img-upload").click())
    .on("drop", (e) => {
      if (!uploadFiles(e, e.originalEvent.dataTransfer.files)) {
        $("#img-drag").addClass("drag-error").delay(3000).queue(function () {
          $(this).removeClass("drag-error").dequeue()
        });
      }
    })
    .on("dragover dragenter", (e) => {
      if (typeof model !== "undefined") $("#img-drag").addClass("is-hover");
    })
    .on("dragleave dragend drop", () => $("#img-drag").removeClass("is-hover"));

});
