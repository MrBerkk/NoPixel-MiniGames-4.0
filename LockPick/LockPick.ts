let timerProgressBar: NodeJS.Timeout;
let timerTimeout: NodeJS.Timeout;
let totalSeconds = 20;
let currentCircle = 1;
let isLocked = false;

function runTimer(): void {
  const timerProgress = document.querySelector(".timer-progress-bar") as HTMLElement;
  clearTimeout(timerProgressBar);
  timerProgressBar = setTimeout(function () {
      timerProgress.style.transition = `width ${totalSeconds}s cubic-bezier(0.4, 1, 0.7, 0.93)`;
      timerProgress.style.width = "0%";
    }, 100);

  clearTimeout(timerTimeout);
  timerTimeout = setTimeout(() => {
    resetGame("lose");
  }, totalSeconds * 1000);
}

function resetGame(status: "win" | "lose" | "init" | "reset"): void {
  // Remove existing lock circles and SVG elements
  const timerProgress = document.querySelector(
    ".timer-progress-bar"
  ) as HTMLElement;
  const lockContainer = document.querySelector(
    ".lock-container"
  ) as HTMLElement;
  const svgCircle = document.querySelector(".position-container svg") as HTMLElement;
  const overlay = document.querySelector(".overlay") as HTMLElement;

  // Block new input from the user when game over
  overlay.style.display = "block";
  isLocked = true;

  clearTimeout(timerTimeout);
  timerProgress.style.transition = "none";
  timerProgress.style.display = "none";
  timerProgress.style.width = "100%";

  if (status === "init") { // Initial game start, run the countdown
    
  } else if (status === "win") {
    const winMsg = document.querySelector(".win-message") as HTMLElement;
    winMsg.style.display = "flex";
    setTimeout(() => {winMsg.style.display = "none";}, 2000);
  } else if (status === "lose") {
    const loseMsg = document.querySelector(".lose-message") as HTMLElement;
    loseMsg.style.display = "flex";
    indicateFailed(currentCircle);
    setTimeout(() => {loseMsg.style.display = "none";}, 2000);
  } else if (status === "reset") {
    const resetMsg = document.querySelector(".reset-message") as HTMLElement;
    resetMsg.style.display = "flex";
    setTimeout(() => {resetMsg.style.display = "none";}, 2000);
  }

  setTimeout(() => {
    // Remove existing lock circles and SVG elements
    timerProgress.style.display = "block";
    lockContainer.innerHTML = "";
    svgCircle.innerHTML = "";
    currentCircle = 1;

    // Unlock the game after 2 seconds
    overlay.style.display = "none";
    isLocked = false;
    generateLines();
    generateHack();
    shuffleLock();
    runTimer();
  }, 2000);
}

function indicateFailed(circleNum: number): void {
  const lockCircle = document.getElementById(
    `lock-circle${circleNum}`
  ) as HTMLElement;

  if (lockCircle) {
    const balls = lockCircle.querySelectorAll(".ball");
    const svgCircle = document.querySelector(".position-container svg");

    if (svgCircle) {
      const semiCircles = svgCircle.querySelectorAll(".position-circle");

      semiCircles.forEach((semiCircle) => {
        if (semiCircle.id.includes(`circle${circleNum}`)) {
          const svgElement = semiCircle as SVGElement;
          svgElement.style.stroke = "rgb(255, 84, 84)";
        }
      });
    } else {
      console.log("SVG element not found in indicateCompleted");
    }

    lockCircle.style.outlineColor = "rgb(255, 84, 84)";

    balls.forEach((ball) => {
      (ball as HTMLElement).style.backgroundColor = "rgb(255, 84, 84)";
    });
  } else {
    console.log(`Lock circle ${circleNum} not found in indicateCompleted`);
  }
}

function nextLock(): void {
  const cracked = checkLockStatus(currentCircle);
  if (cracked && currentCircle <= 3) {
    indicateCompleted(currentCircle);

    currentCircle++;
    const lockCircle = document.getElementById(
      `lock-circle${currentCircle}`
    ) as HTMLElement;
    lockCircle.style.outlineColor = "rgb(239, 181, 17)";
  } else if (currentCircle === 4 && cracked) {
    indicateCompleted(currentCircle);
    resetGame("win");
  } else {
    resetGame("lose");
  }
}

function indicateCompleted(circleNum: number): void {
  const lockCircle = document.getElementById(
    `lock-circle${circleNum}`
  ) as HTMLElement;

  if (lockCircle) {
    const balls = lockCircle.querySelectorAll(".ball");
    const svgCircle = document.querySelector(".position-container svg");

    if (svgCircle) {
      const semiCircles = svgCircle.querySelectorAll(".position-circle");

      semiCircles.forEach((semiCircle) => {
        if (semiCircle.id.includes(`circle${circleNum}`)) {
          const svgElement = semiCircle as SVGElement;
          svgElement.style.stroke = "rgba(48, 221, 189, 0.815)";
        }
      });
    } else {
      console.log("SVG element not found in indicateCompleted");
    }

    lockCircle.style.outlineColor = "rgb(173, 173, 173)";

    balls.forEach((ball) => {
      (ball as HTMLElement).style.backgroundColor = "rgba(48, 221, 189, 0.815)";
    });
  } else {
    console.log(`Lock circle ${circleNum} not found in indicateCompleted`);
  }
}

//Function that runs to randomize the position of the balls compared to their original position
function shuffleLock(): void {
  for (let i = 1; i < 5; i++) {
    const shuffleTimes = Math.floor(Math.random() * (12 - 1) + 1);
    currentCircle = i;
    for (let j = 0; j < shuffleTimes; j++) {
      rotateBalls("Right");
    }
  }
  currentCircle = 1;
}

function checkLockStatus(circleNum: number): boolean {
  const lockCircle = document.getElementById(
    `lock-circle${circleNum}`
  ) as HTMLElement;
  const svgCircle = document.querySelector(
    ".position-container svg"
  ) as SVGElement;
  const semiCircles = svgCircle.querySelectorAll(".position-circle");
  const balls = lockCircle.querySelectorAll("div");
  let allLocks = true;

  interface positionColor {
    color: string;
  }
  var currPositionCheck: { [id: number]: positionColor } = {};
  balls.forEach((ball) => {
    const position = getRotateZValue(ball.style.transform) % 360;
    currPositionCheck[position] = { color: ball.style.backgroundColor };
  });
  semiCircles.forEach((semiCircle) => {
    if (semiCircle.id.includes(`circle${circleNum}`)) {
      const semiCircleElem = semiCircle as SVGElement;
      const semiCirclePos = parseInt(semiCircle.id.split("-")[1], 10);
      const semiCircleColor = semiCircleElem.style.stroke;
      if (
        currPositionCheck[semiCirclePos]?.color !== undefined &&
        currPositionCheck[semiCirclePos]?.color !== semiCircleColor
      ) {
        allLocks = false;
      }
    }
  });
  return allLocks;
}

function shufflePositions(array: number[]): number[] {
  for (let a = array.length - 1; a > 0; a--) {
    const b = Math.floor(Math.random() * (a + 1));
    [array[a], array[b]] = [array[b], array[a]];
  }
  return array;
}

function generateLines(): void {
  const hackContainer = document.querySelector(".hack-box") as HTMLElement;
  for (let i = 1; i < 7; i++) {
    const line = document.createElement("div") as HTMLElement;
    line.className = "line";
    line.id = `line${i}`;
    line.style.transform = `rotateZ(${30 * (i - 1)}deg)`;
    hackContainer.appendChild(line);
  }
}

function generateCircle(circleNum: number): HTMLElement {
  const lockContainer = document.querySelector(
    ".lock-container"
  ) as HTMLElement;
  const lockCircle = document.createElement("div") as HTMLElement;

  if (circleNum === 1) {
    //Ensure the selector is on the first circle at start
    lockCircle.style.outlineColor = "rgb(239, 181, 17)";
  }
  lockCircle.id = `lock-circle${circleNum}`;
  lockCircle.className = "lock-circle";
  lockCircle.style.width = `${-20 + 100 * circleNum}px`;
  lockCircle.style.height = `${-20 + 100 * circleNum}px`;
  lockContainer.appendChild(lockCircle);
  return lockCircle;
}

function generateSemiCircle(
  circleNum: number,
  position: number,
  color: string
): void {
  const semiCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  const svgCircle = document.querySelector(".position-container svg");
  const r = 5 + circleNum * 50; //The radius needed for the different lockCircles

  semiCircle.setAttribute("class", "position-circle");
  semiCircle.setAttribute("id", `circle${circleNum}-${position}`);
  semiCircle.setAttribute("cx", "50%");
  semiCircle.setAttribute("cy", "50%");
  semiCircle.setAttribute("r", `${r}`);

  semiCircle.style.transform = `rotate(${-15 + position}deg)`;
  semiCircle.style.stroke = color;
  semiCircle.style.strokeDasharray = `${2 * r * Math.PI}`;
  semiCircle.style.strokeDashoffset = `${(11 * (2 * r * Math.PI)) / 12}`;

  svgCircle?.appendChild(semiCircle);
}

function generateHack(): void {
  let positions: number[] = [
    0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
  ]; //Available positions (deg) for the balls
  let colors: string[] = [
    "rgb(202, 39, 97)",
    "rgb(239, 181, 17)",
    "rgb(46, 134, 213)",
  ]; //Available colors for the balls

  //Generate between 2-12 balls in different colors for each lock-circle
  for (let i = 1; i < 5; i++) {
    const positionChecks = Math.floor(Math.random() * (8 - 4) + 4); //The semi-circles that indicate which color needs to be where
    const ballAmt = Math.floor(Math.random() * (13 - 5) + 5);
    const shuffledPositions = shufflePositions(positions);
    const lockCircle = generateCircle(i);

    for (let j = 0; j < ballAmt; j++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const ballElem = document.createElement("div");

      if (j < positionChecks) {
        generateSemiCircle(i, shuffledPositions[j], randomColor);
      }
      ballElem.id = `C${i}ball${j}`;
      ballElem.className = "ball";
      ballElem.style.transform = `translate(-50%, -50%) rotateZ(${
        shuffledPositions[j]
      }deg) translate(${-10 + 50 * i}px, 0px)`;
      ballElem.style.backgroundColor = randomColor;
      lockCircle?.appendChild(ballElem);
    }
  }
  currentCircle = 1;
}

function getRotateZValue(transformValue: string): number {
  const matches = transformValue.match(/rotateZ\(([^deg)]+)deg\)/);
  return matches && matches[1] ? parseFloat(matches[1]) : 0;
}

type Direction = "Left" | "Right";
function rotateBalls(dir: Direction): void {
  const lockCircle = document.getElementById(
    `lock-circle${currentCircle}`
  ) as HTMLElement;
  const balls = lockCircle.querySelectorAll("div");

  balls.forEach((ball) => {
    const currentRotateZ = getRotateZValue(ball.style.transform);
    let newRotateZ;
    if (dir === "Right") {
      newRotateZ = currentRotateZ + 30;
    } else {
      newRotateZ = currentRotateZ - 30;
    }
    ball.style.transform = `translate(-50%, -50%) rotateZ(${newRotateZ}deg) translate(${
      -10 + 50 * currentCircle
    }px, 0px)`;
  });
}

function handleKeyPress(event: KeyboardEvent) {
  if (isLocked) return; //Game is over, key presses are ignored

  if (event.key === "ArrowLeft" || event.key === "a") {
    rotateBalls("Left");
  } else if (event.key === "ArrowRight" || event.key === "d") {
    rotateBalls("Right");
  } else if (event.key === "Enter" || event.key === " ") {
    nextLock();
  } else {
    return;
  }
}

function toggleSettings(action: string = "") {
  const settingsMenu = document.querySelector(".settings-container") as HTMLElement;
  if (action === "close" || settingsMenu.style.display === "flex") {
      settingsMenu.style.display = "none";
  } else {
      settingsMenu.style.display = "flex";
  }
}


function applySettings() {
  const timingSliderValue = document.querySelector(".timing-container .slider-value span") as HTMLElement;
  totalSeconds = Number(timingSliderValue.textContent);

  // Run the game with the new settings
  toggleSettings("close");
  resetGame("reset");
}


function resetSettings() {
  const timingSliderValue = document.querySelector(".timing-container .slider-value span") as HTMLElement;
  const timingSliderInput = document.querySelector(".timing-container input[type='range']") as HTMLInputElement;

  timingSliderInput.value = "20";
  timingSliderValue.style.left = "20%"
  timingSliderValue.textContent = "20";
}


document.addEventListener("DOMContentLoaded", (event) => {
  const timingSliderValue = document.querySelector(".timing-container .slider-value span") as HTMLElement;
  const timingSliderInput = document.querySelector(".timing-container input[type='range']") as HTMLInputElement;

  timingSliderInput.addEventListener('input', () => {
    const value = timingSliderInput.value;
    timingSliderValue.textContent = value;
    timingSliderValue.style.left = `${Number(value)}%`;
  });

  generateLines();
  generateHack();
  shuffleLock();
  runTimer();
});

document.addEventListener("keydown", handleKeyPress);
