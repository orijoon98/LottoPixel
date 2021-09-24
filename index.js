// 컨텍스트 생성 및 받아오기
var img = new Image();
img.src = "./lotto.jpeg";
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
img.onload = draw;
var color = document.getElementById("color");
var pixel = document.getElementById("pixel");
var whiterow = document.getElementById("whiterow");
var whitecol = document.getElementById("whitecol");
var originalDataArray = []; // 그레이스케일 기능에서 원래 이미지를 저장하기 위한 배열

// 이미지 로딩 완료시 실행될 부분
function draw() {
  ctx.drawImage(img, 0, 0);
  img.style.display = "none";
  // ctx.getImageData(sx, sy, sw, sh);
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  var grayscale = function (e) {
    var nextState = e.target.getAttribute("data-next-state");
    console.log(nextState);
    if (nextState == "grayscale") {
      for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // 되돌리기 위해 원래 이미지를 백업
        originalDataArray[i] = data[i];
        originalDataArray[i + 1] = data[i + 1];
        originalDataArray[i + 2] = data[i + 2];
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
      }
      e.target.setAttribute("data-next-state", "normal");
    } else {
      for (var i = 0; i < data.length; i += 4) {
        data[i] = originalDataArray[i];
        data[i + 1] = originalDataArray[i + 1];
        data[i + 2] = originalDataArray[i + 2];
      }
      e.target.setAttribute("data-next-state", "grayscale");
    }
    ctx.putImageData(imageData, 0, 0);
  };
  var threshold = function (e) {
    var nextState = e.target.getAttribute("data-next-state");
    console.log(nextState);
    if (nextState == "threshold") {
      for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        var thres = 127;
        // 되돌리기 위해 원래 이미지를 백업
        originalDataArray[i] = data[i];
        originalDataArray[i + 1] = data[i + 1];
        originalDataArray[i + 2] = data[i + 2];

        if (avg > thres) {
          data[i] = 255; // red
          data[i + 1] = 255; // green
          data[i + 2] = 255; // blue
        } else {
          data[i] = 0; // red
          data[i + 1] = 0; // green
          data[i + 2] = 0; // blue
        }
      }
      e.target.setAttribute("data-next-state", "normal");
    } else {
      for (var i = 0; i < data.length; i += 4) {
        data[i] = originalDataArray[i];
        data[i + 1] = originalDataArray[i + 1];
        data[i + 2] = originalDataArray[i + 2];
      }
      e.target.setAttribute("data-next-state", "threshold");
    }
    ctx.putImageData(imageData, 0, 0);
  };
  // 돋보기 기능
  var zoomctx = document.getElementById("zoom").getContext("2d");
  var zoom = function (event) {
    var x = event.layerX;
    var y = event.layerY;
    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    var SPX = 20;
    var DPX = 200;
    zoomctx.drawImage(
      canvas,
      Math.min(Math.max(0, x - SPX / 2), img.width - SPX),
      Math.min(Math.max(0, y - SPX / 2), img.height - SPX),
      SPX,
      SPX,
      0,
      0,
      DPX,
      DPX
    );
  };
  // 이벤트 적용
  var graybtn = document.getElementById("grayBtn");
  graybtn.addEventListener("click", grayscale);
  var thresholdbtn = document.getElementById("thresholdBtn");
  thresholdbtn.addEventListener("click", threshold);
  canvas.addEventListener("mousemove", zoom);
}
// 픽셀별 컬러 추출
function pick(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = ctx.getImageData(x, y, 1, 1);
  var data = pixel.data;
  var rgba =
    "rgba(" +
    data[0] +
    ", " +
    data[1] +
    ", " +
    data[2] +
    ", " +
    data[3] / 255 +
    ")";
  color.style.background = rgba;
  color.textContent = rgba;
  if (data[0] + data[1] + data[2] < 480) {
    color.style.color = "white";
  } else {
    color.style.color = "black";
  }
}

//픽셀 좌표
function showPixel(event) {
  var x = event.layerX;
  var y = event.layerY;
  var pixelText = "pixel(" + x + ", " + y + ")";
  pixel.textContent = pixelText;
}

function searchRow(event) {
  var y = event.layerY;
  var pixelArray = [];
  for (var x = 0; x < 768; x++) {
    var pixel = ctx.getImageData(x, y, 1, 1);
    var data = pixel.data;
    var avg = (data[0] + data[1] + data[2]) / 3;
    if (avg == 0) pixelArray[x] = 0;
    else pixelArray[x] = 1;
  }
  var cnt = 0;
  var thres = 95;
  for (var clr of pixelArray) {
    if (clr == 1) cnt++;
  }
  if ((cnt / 768) * 100 > thres) {
    whiterow.textContent = "흰색 가로선: " + "True";

    //선 그리기
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(768, y);
    ctx.stroke();
  } else whiterow.textContent = "흰색 가로선: " + "False";
}

function searchCol(event) {
  var x = event.layerX;
  var pixelArray = [];
  for (var y = 0; y < 1024; y++) {
    var pixel = ctx.getImageData(x, y, 1, 1);
    var data = pixel.data;
    var avg = (data[0] + data[1] + data[2]) / 3;
    if (avg == 0) pixelArray[y] = 0;
    else pixelArray[y] = 1;
  }
  var cnt = 0;
  var thres = 95;
  for (var clr of pixelArray) {
    if (clr == 1) cnt++;
  }
  if ((cnt / 1024) * 100 > thres) {
    whitecol.textContent = "흰색 세로선: " + "True";

    //선 그리기
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  } else whitecol.textContent = "흰색 세로선: " + "False";
}

canvas.addEventListener("mousemove", pick);
canvas.addEventListener("mousemove", showPixel);
canvas.addEventListener("mousemove", searchRow);
canvas.addEventListener("mousemove", searchCol);
