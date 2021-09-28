# 로또 이미지 처리

## 목표

- 로또 용지를 촬영하면 당첨 번호와 일치하는 숫자에 동그라미 표시
- 당첨 결과 확인

## 구현 언어

- JavaScript

## 전체 코드

- [https://github.com/orijoon98/LottoPixel](https://github.com/orijoon98/LottoPixel)

## 구현 순서

- 1년치 로또 당첨번호 API 호출
- 이미지에 Grayscale 적용
- 임계값 Threshold 설정 후 검은색, 흰색으로만 이미지 변환
- 이미지의 픽셀을 확인하며 흰색 가로선 확인
- 흰색 가로선으로 구분된 영역 나누고 숫자 영역 판별
- 문자 인식으로 회차 및 번호 읽기
- 숫자 영역에서 흰색 가로선, 세로선으로 숫자별 영역 나누기
- 당첨 번호와 일치하면 영역에 동그라미 그리기

## 처리할 이미지

![image](https://user-images.githubusercontent.com/74812188/135009957-2975e5c5-47ca-43dc-bc23-396eddcd3d03.png)


## 당첨번호 API 호출

[](https://hyeokjoon.com/data/lottodata.php)

개인 RPI4 웹서버에 만들어둔 1년치 로또 내역이다. 

axios 를 사용해 JSON 형태의 데이터를 가져와서 파싱했다.

```jsx
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
  });
}
```

1년치 정보라 53개의 회차에 대한 정보가 저장되고 가장 최근회차는 52번째 인덱스에 가장 오래된 회차는 0번째 인덱스에 저장된다.

## Grayscale 적용

![grayscale](https://user-images.githubusercontent.com/74812188/135010005-edd973e3-aa4b-4102-877a-1d2f6601cfcb.png)


```jsx
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
```

grayscale 의 핵심은 색상이 rgb(30, 30, 30) 이라고 했을 때 각각의 red, green, blue 값을 3으로 나눠주는 것이다.

## Threshold 적용

![threshold](https://user-images.githubusercontent.com/74812188/135010037-0277ac1e-f5ed-4bdd-9c48-c5435164c5a2.png)


```jsx
function threshold(e) {
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
}
```

threshold 는 임계값이라는 의미인데 흰색에 가까운 색은 흰색으로, 검은색에 가까운 색은 검은색으로 설정해주는 과정이다. 

여기서 설정한 임계값은 127이고 rgb의 평균이 127 보다 크면 흰색으로, 같거나 작으면 검은색으로 설정해줬다. 

글자를 인식해야 하기 때문에 인식에 방해가 되는 부분들을 제거해주는 과정이다.

## 흰색 가로선 확인

![row](https://user-images.githubusercontent.com/74812188/135010063-88ed555b-2bfe-42a5-b6ee-087994514dc4.png)


```jsx
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
          y = end - 1;
          break;
        }
      }
    }
  }
}
```

흰색 가로선을 찾아서 검은색 선을 그려주는 함수이다.

```jsx
var cnt = 0;
var thres = 95;
for (var clr of pixelArray) {
  if (clr == 1) cnt++;
}
if ((cnt / 768) * 100 > thres) {
  rowArray[y] = 1;
} else rowArray[y] = 0;
```

이 부분이 흰색 가로선인지 아닌지 판별하는 부분인데 여기서 thres 값을 95라고 설정한 것은 가로로 픽셀을 전부 확인했을 때 95프로보다 많은 픽셀이 흰색이라면 흰색 가로선이라고 판별하겠다는 의미이다. 

가로선이라고 판별되면 rowArray[y] 를 가로선이라고 표시한다.

## 영역 나누기 및 숫자 영역 판별

```jsx
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
```

가로선으로 구분한 영역들 중 숫자 영역은 다섯번째 영역이다.

다섯번째 영역의 시작 좌표, 마지막 좌표를 저장한다.

## 문자 인식

문자 인식에는 tesseract.js 라는 라이브러리를 사용했다.

```jsx
const worker = Tesseract.createWorker({
  logger: (m) => console.log(m),
});

async function recognize() {
  const img = document.getElementById("canvas");
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789",
  });
  const {
    data: { text },
  } = await worker.recognize(img);
  await worker.terminate();
  lotto = text;
  console.log(lotto);
}
```

언어를 영어로 설정했기 때문에 영어 문자와 숫자들을 인식하는데 나는 숫자 정보만 필요하기 때문에 tessedit_char_whitelist: "0123456789" 이 코드를 작성해서 숫자만 저장되게 했다.


![code1](https://user-images.githubusercontent.com/74812188/135010104-18f546fc-3f0a-498c-9f39-27f88fc11fe7.png)

 

전체 영역을 인식하게 되면 결과값으로 이런 텍스트가 저장되는데 지금 보면 불필요한 숫자들이 함께 인식 된다.

내가 필요한 데이터는 회차 정보인 978과 선택한 30개의 번호들이기 때문에 이 영역들을 따로 크롭해서 다시 OCR을 돌려야 한다.

![crop](https://user-images.githubusercontent.com/74812188/135010255-f71aec95-1458-4097-a758-02ddc77e8b40.png)


```jsx
async function crop() {
  var w = area[4][2] - area[2][0];
  var h = area[4][3] - area[2][1];
  await cropimg.setAttribute("src", canvas.toDataURL());
  await cctx.drawImage(cropimg, area[2][0], area[2][1], w, h, 0, 0, w, h);
  await cropimg.setAttribute("src", cropcanvas.toDataURL());
}
```

회차 번호가 있는 영역부터 숫자들이 적힌 영역까지 크롭해서 이 부분만 OCR을 다시 돌렸다. 

![code2](https://user-images.githubusercontent.com/74812188/135010185-8173cc1a-71c5-4fd3-97f9-4999b87c7aa7.png)


그랬더니 이런 결과가 나왔는데 원래 기대했던 결과값은 첫줄에 978 그리고 마지막 5줄에 번호 정보가 저장된 결과였는데 첫줄에 3이 같이 인식됐다. 

이것 저것 시도해본 결과 언어를 eng 으로 설정해서 제 978 회 중 회를 3으로 인식한 것이다.

언어를 kor로 설정하고 OCR을 돌려보니 회는 제대로 인식했지만 숫자 인식이 제대로 안됐다.

이 문제는 tesseract.js 자체의 문제이고 아직 딥러닝에 대해서는 공부하지 못했기 때문에 우선 이대로 진행하기로 했다.

## 당첨번호, 입력번호 저장

```jsx
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
```

문자 인식한 결과값에서 첫번째 줄에서 3을 뺀 번호가 우리가 원하는 회차이다.

그 회차에 맞는 인덱스를 찾아서 당첨번호를 저장했다.

![code3](https://user-images.githubusercontent.com/74812188/135010300-9a09a951-58a6-4b3f-b3b0-59f2d3e14f71.png)


978회에 해당하는 당첨번호와 보너스 번호가 정상적으로 저장됐다.

입력번호는 두자리씩 총 6개의 숫자이기 때문에 길이가 12인 줄을 확인하면 된다.

길이가 12인 줄에서 숫자 하나당 길이가 2이기 때문에 두자리씩 잘라서 번호를 저장 해준다.

![code4](https://user-images.githubusercontent.com/74812188/135010319-acbbb09a-da4d-46c3-89a0-e75911d5f4d2.png)


5세트의 입력번호들도 정상적으로 저장됐다.

이제 이 번호들과 당첨번호를 가지고 당첨결과를 판단하고 일치하는 번호에는 동그라미 표시를 해주면 된다.

## 숫자 영역 가로선, 세로선 확인

![rowcol](https://user-images.githubusercontent.com/74812188/135010353-a519fc2f-f77a-454a-bbbc-fb521ad18b42.png)


```jsx
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
```

숫자 영역에 가로선, 세로선을  그리는 방법은 처음에 흰색 가로선을 그린 방법과 같다.

다른 점은 숫자 영역 내부에서만 흰색 선들을 확인하고 그린다는 점이다.

## 숫자별 영역 나누기

일치하는 번호에 동그라미를 그려주기 위해서는 이미지 내에 있는 숫자들의 위치를 알아야 한다. 

숫자 영역에서 가로, 세로선으로 구분한 영역들을 흰색 영역이 나올 때마다 시작점의 x, y 좌표를 저장하게 구현했다.

```jsx
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
```

![code5](https://user-images.githubusercontent.com/74812188/135010390-7f461539-4e61-4af3-82b7-81e4d16fb23c.png)


결과 값중 첫 행에 대한 결과이다. 

정상적으로 잘 저장되는 모습이다.

인덱스 4부터 9까지가 내가 원하는 정보인 숫자들의 영역이다.

이제 일치하는 번호를 찾으면 위치를 찾아서 이미지에 동그라미를 그려줄 수 있다.

인덱스 4부터 9까지의 좌표들을 사용하기 편하게 배열에 저장해뒀다.

![code6](https://user-images.githubusercontent.com/74812188/135010406-4ae338e6-7a4a-4fcd-b0e9-3beb6d9915cc.png)


30개의 숫자들의 영역의 시작좌표도 모두 잘 저장됐다. 

## 당첨결과 확인 및 동그라미 그리기

![result](https://user-images.githubusercontent.com/74812188/135010420-02941235-ba18-4802-9aea-ac2740e15e64.png)


```jsx
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
```

동그라미를 그려주는 코드인데 arc의 매개변수에 시작 좌표, 반지름, 시작 각도, 종료 각도를 넣어준다.

```jsx
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
  resultcanvas.style.display = "block";
}
```

당첨결과를 판단하고 번호가 일치하면 해당 위치에 동그라미를 그려주는 코드이다.

![code7](https://user-images.githubusercontent.com/74812188/135010441-818ddaee-c868-4018-bf8e-36355fb09414.png)


당첨결과도 정상적으로 나오고 동그라미도 원하는대로 그려줬다.
