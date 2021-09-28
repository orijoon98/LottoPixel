var img = new Image();
var canvas = document.getElementById("canvas");
var resultcanvas = document.getElementById("resultCanvas");
var cropcanvas = document.getElementById("cropCanvas");
var ctx = canvas.getContext("2d");
var rctx = resultcanvas.getContext("2d");
var cctx = cropcanvas.getContext("2d");
var cropimg = document.getElementById("cropImg");
var wrapper = document.getElementById("wrapper");
var zoomctx = document.getElementById("zoom").getContext("2d");
var color = document.getElementById("color");
var pixel = document.getElementById("pixel");
var updatebtn = document.getElementById("updateBtn");
var graybtn = document.getElementById("grayBtn");
var thresholdbtn = document.getElementById("thresholdBtn");
var whiterowbtn = document.getElementById("rowBtn");
var areabtn = document.getElementById("areaBtn");
var cropbtn = document.getElementById("cropBtn");
var recognizebtn = document.getElementById("recognizeBtn");
var arearowbtn = document.getElementById("areaRowBtn");
var areacolbtn = document.getElementById("areaColBtn");
var eachareabtn = document.getElementById("eachAreaBtn");
var resultbtn = document.getElementById("resultBtn");
var result = document.getElementById("result");
var data;
var imageData;
var originalDataArray = []; // 그레이스케일 기능에서 원래 이미지를 저장하기 위한 배열
var rowArray = [];
var rowMidArray = new Array(1024);
var colArray = [];
var colMidArray = new Array(768);
var area = [];
var numArea = [];
var eachArea = [];
var numEachArea = [];
var lotto = "";
var datas = [];
var drwNo = [];
var drwtNo1 = [];
var drwtNo2 = [];
var drwtNo3 = [];
var drwtNo4 = [];
var drwtNo5 = [];
var drwtNo6 = [];
var bnusNo = [];
var winNo = [];
var curNum = [];
var curNumArea = [];

// 이미지 로딩 완료시 실행될 부분
function draw() {
  ctx.drawImage(img, 0, 0);
  rctx.drawImage(img, 0, 0);
  img.style.display = "none";
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData.data;
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

// 돋보기 기능
function zoom(event) {
  var x = event.layerX;
  var y = event.layerY;
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
}

function updateLotto() {
  const URI = "https://hyeokjoon.com/data/lottodata.php";
  axios.get(URI).then((result) => {
    datas = result.data.datas;
    for (var i = 0; i <= 52; i++) {
      drwNo[i] = datas[i].drwNo;
      drwtNo1[i] = datas[i].drwtNo1;
      drwtNo2[i] = datas[i].drwtNo2;
      drwtNo3[i] = datas[i].drwtNo3;
      drwtNo4[i] = datas[i].drwtNo4;
      drwtNo5[i] = datas[i].drwtNo5;
      drwtNo6[i] = datas[i].drwtNo6;
      bnusNo[i] = datas[i].bnusNo;
    }
    console.log(drwNo);
  });
}

function grayscale(e) {
  var nextState = e.target.getAttribute("data-next-state");
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
}

function threshold(e) {
  var nextState = e.target.getAttribute("data-next-state");
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
}

function searchRow() {
  rowMidArray.fill(0);
  for (var y = 0; y < 1024; y++) {
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
      rowArray[y] = 1;
    } else rowArray[y] = 0;
  }
  for (var start = 0; start < 1024; start++) {
    if (rowArray[start] == 1) {
      var end;
      for (var i = start; i < 1024; i++) {
        if (rowArray[i] == 0) {
          end = i - 1;
          var mid = Math.floor((start + end) / 2);
          rowMidArray[mid] = 1;
          //선 그리기
          if (end - start > 10) {
            ctx.beginPath();
            ctx.moveTo(0, mid);
            ctx.lineTo(768, mid);
            ctx.stroke();
          } else {
            rowMidArray[mid] = 0;
          }
          break;
        }
      }
    }
  }
}

function searchArea() {
  var index = 0;
  for (var i = 0; i < 1024; i++) {
    if (rowMidArray[i] == 0) {
      for (var j = i; j < 1024; j++) {
        if (rowMidArray[j] == 1) {
          j = j - 1;
          var xy = [];
          xy[0] = 0;
          xy[1] = i;
          xy[2] = 767;
          xy[3] = j;
          area[index] = xy;
          index++;
          i = j;
          break;
        }
      }
    }
  }
  numArea[0] = area[4][0];
  numArea[1] = area[4][1];
  numArea[2] = area[4][2];
  numArea[3] = area[4][3];
}

async function crop() {
  var w = area[4][2] - area[2][0];
  var h = area[4][3] - area[2][1];
  await cropimg.setAttribute("src", canvas.toDataURL());
  await cctx.drawImage(cropimg, area[2][0], area[2][1], w, h, 0, 0, w, h);
  await cropimg.setAttribute("src", cropcanvas.toDataURL());
}

const worker = Tesseract.createWorker({
  logger: (m) => console.log(m),
});

async function recognize() {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789",
  });
  const {
    data: { text },
  } = await worker.recognize(cropimg);
  await worker.terminate();
  lotto = text;
  console.log(lotto);
  lotto = lotto.split("\n");
  lotto[0] = lotto[0].substr(0, lotto[0].length - 1);
  var tIndex = 52 - (parseInt(drwNo[52]) - parseInt(lotto[0]));
  winNo = [
    drwtNo1[tIndex],
    drwtNo2[tIndex],
    drwtNo3[tIndex],
    drwtNo4[tIndex],
    drwtNo5[tIndex],
    drwtNo6[tIndex],
    bnusNo[tIndex],
  ];
  console.log(winNo);
  var cnt = 0;
  for (var i = 0; i < lotto.length; i++) {
    if (lotto[i].length == 12) {
      var one = parseInt(lotto[i].substr(0, 2));
      var two = parseInt(lotto[i].substr(2, 2));
      var three = parseInt(lotto[i].substr(4, 2));
      var four = parseInt(lotto[i].substr(6, 2));
      var five = parseInt(lotto[i].substr(8, 2));
      var six = parseInt(lotto[i].substr(10, 2));
      var curNums = [one, two, three, four, five, six];
      curNum[cnt] = curNums;
      cnt++;
    }
  }
  console.log(curNum);
}

function searchAreaRow() {
  rowArray.fill(0);
  rowMidArray.fill(0);
  for (var y = numArea[1]; y <= numArea[3]; y++) {
    var pixelArray = [];
    for (var x = numArea[0]; x <= numArea[2]; x++) {
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
    if ((cnt / (numArea[2] - numArea[0])) * 100 > thres) {
      rowArray[y] = 1;
    } else rowArray[y] = 0;
  }
  for (var start = 0; start < 1024; start++) {
    if (rowArray[start] == 1) {
      var end;
      for (var i = start; i < 1024; i++) {
        if (rowArray[i] == 0) {
          end = i - 1;
          var mid = Math.floor((start + end) / 2);
          rowMidArray[mid] = 1;
          //선 그리기
          if (end - start > 3) {
            ctx.beginPath();
            ctx.moveTo(numArea[0], mid);
            ctx.lineTo(numArea[2], mid);
            ctx.stroke();
          } else {
            rowMidArray[mid] = 0;
          }
          break;
        }
      }
    }
  }
}

function searchAreaCol() {
  colMidArray.fill(0);
  for (var x = numArea[0]; x <= numArea[2]; x++) {
    var pixelArray = [];
    for (var y = numArea[1]; y <= numArea[3]; y++) {
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
    if ((cnt / (numArea[3] - numArea[1])) * 100 > thres) {
      colArray[x] = 1;
    } else colArray[x] = 0;
  }
  for (var start = 0; start < 768; start++) {
    if (colArray[start] == 1) {
      var end;
      for (var i = start; i < 768; i++) {
        if (colArray[i] == 0) {
          end = i - 1;
          var mid = Math.floor((start + end) / 2);
          colMidArray[mid] = 1;
          //선 그리기
          if (end - start > 10) {
            ctx.beginPath();
            ctx.moveTo(mid, numArea[1]);
            ctx.lineTo(mid, numArea[3]);
            ctx.stroke();
          } else {
            colMidArray[mid] = 0;
          }
          break;
        }
      }
    }
  }
}

function searchEachArea() {
  var index = 0;
  for (var j = numArea[1]; j <= numArea[3]; j++) {
    var nj;
    for (nj = j; nj <= numArea[3]; nj++) {
      if (rowMidArray[nj] == 0) {
        j = nj;
        break;
      }
    }
    for (var i = 0; i < 768; i++) {
      var ni;
      for (ni = i; ni < 768; ni++) {
        if (colMidArray[ni] == 0) {
          i = ni;
          var xy = [];
          xy[0] = i;
          xy[1] = j;
          eachArea[index] = xy;
          index++;
          break;
        }
      }
      for (ni = i; ni < 768; ni++) {
        if (colMidArray[ni] == 1) {
          i = ni;
          break;
        }
        if (ni == 767) {
          i = 767;
        }
      }
    }
    for (nj = j; nj <= numArea[3]; nj++) {
      if (rowMidArray[nj] == 1) {
        j = nj;
        break;
      }
      if (nj == numArea[3]) {
        j = numArea[3];
      }
    }
  }
  console.log(eachArea);
  var cnt = 0;
  for (var n = 10; n < eachArea.length; n++) {
    if (n % 10 >= 4 && n % 10 <= 9) {
      if (n % 10 == 4) curNumArea[cnt] = new Array(6);
      curNumArea[cnt][(n % 10) - 4] = eachArea[n];
      if (n % 10 == 9) cnt++;
      if (cnt == 5) break;
    }
  }
  console.log(curNumArea);
}

function drawCircle(i, j) {
  var w = (curNumArea[0][1][0] - curNumArea[0][0][0] - 10) / 2;
  var h = (curNumArea[1][0][1] - curNumArea[0][0][1] - 3) / 2;
  var x = curNumArea[i][j][0] + w - 5;
  var y = curNumArea[i][j][1] + h;
  var r = curNumArea[1][0][1] - curNumArea[0][0][1] - 3;
  rctx.beginPath();
  rctx.arc(x, y, r, 0, 2 * Math.PI);
  rctx.stroke();
}

function getResult() {
  var cnt = 0,
    bcnt = 0;
  for (var i = 0; i < curNum.length; i++) {
    for (var j = 0; j < 6; j++) {
      var num = curNum[i][j];
      for (var w = 0; w < 6; w++) {
        if (winNo[w] == num) {
          drawCircle(i, j);
          cnt++;
        }
        if (winNo[6] == num) {
          drawCircle(i, j);
          bcnt++;
          break;
        }
      }
    }
  }
  if (cnt == 6) {
    console.log("1등");
    result.textContent = "1등";
  } else if (cnt == 5 && bcnt == 1) {
    console.log("2등");
    result.textContent = "2등";
  } else if (cnt == 5 && bcnt == 0) {
    console.log("3등");
    result.textContent = "3등";
  } else if (cnt == 4) {
    console.log("4등");
    result.textContent = "4등";
  } else if (cnt == 3) {
    console.log("5등");
    result.textContent = "5등";
  } else {
    console.log("낙첨");
    result.textContent = "낙첨";
  }
  canvas.style.display = "none";
  cropcanvas.style.display = "none";
  wrapper.style.display = "none";
}

img.src = "./lotto.jpeg";
img.onload = draw;
canvas.addEventListener("mousemove", pick);
canvas.addEventListener("mousemove", showPixel);
canvas.addEventListener("mousemove", zoom);
updatebtn.addEventListener("click", updateLotto);
graybtn.addEventListener("click", grayscale);
thresholdbtn.addEventListener("click", threshold);
whiterowbtn.addEventListener("click", searchRow);
areabtn.addEventListener("click", searchArea);
cropbtn.addEventListener("click", crop);
recognizebtn.addEventListener("click", recognize);
arearowbtn.addEventListener("click", searchAreaRow);
areacolbtn.addEventListener("click", searchAreaCol);
eachareabtn.addEventListener("click", searchEachArea);
resultbtn.addEventListener("click", getResult);
