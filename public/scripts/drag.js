$(function () {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 28;

  const ctx = canvas.getContext("2d");

  $("#img-drag").change((file) => {
    const reader = new FileReader();

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

    reader.readAsDataURL(file.target.files[0]);
  });
});
