//10회 이상 틀릴 시 -> 쓰리아웃
//중복 숫자 -> alert

let answer = []; //정답의 4자리 수가 저장되는 배열

while (answer.length !== 4) {
  let num = Math.floor(Math.random() * 10); //1의 자리 난수 생성
  if (answer.indexOf(String(num)) == -1) {
    //중복되는 숫자가 없는 경우에만 추가
    answer.push(String(num));
  }
}

let try_num = 1; // 시도 횟수
const btn_submit = document.getElementById("submit");

btn_submit.addEventListener("click", () => {
  if (try_num > 10) {
    alert(`쓰리아웃!! 정답: ${answer.join("")}`);
  } else {
    let input = document.getElementById("input").value.split("");
    if (isValid(input)) {
      print_result(check_answer(input, answer), input, try_num++);
    }
  }
});

//중복숫자가 있는지, 4개의 숫자가 입력됐는지 확인
function isValid(input) {
  if (input.length !== 4) {
    alert("숫자 4자리를 입력해주세요!");
    return false;
  } else {
    for (let i = 0; i < input.length - 1; i++) {
      if (input.indexOf(input[i], i + 1) != -1) {
        alert("중복된 숫자가 포함되어 있습니다. 모두 다른 숫자를 입력하세요.");
        return false;
      }
    }
  }
  return true;
}

//입력값과 정답 비교 함수
function check_answer(input, answer) {
  let strike = 0;
  let ball = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] == answer[i]) strike++;
    else if (answer.indexOf(input[i]) != -1) ball++;
  }

  return [strike, ball];
}

//결과 출력 함수
function print_result(result, input, try_num) {
  let innerHTML = `<br/>${try_num}차 시도 : ${input.join("")}, `;
  if (result[0] == 4) {
    innerHTML += "홈런!!!";
    const label = document.getElementsByTagName("label")[0];
    label.innerHTML = `${answer.join("")}`;
  } else innerHTML += `STRIKE: ${result[0]}, BALL: ${result[1]}`;

  const div_result = document.getElementById("result");
  div_result.innerHTML += innerHTML;
}
