$(function () {
  const util = {};
  const canvas = document.createElement("canvas");
  const imgDisp = document.getElementById("img-disp");
  util.renderImage = function (image) {

    const [width, height] = [28, 28];
    
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
    
    imgDisp.src = canvas.toDataURL("image/png");
    
  }

  window.disp = util;
});
