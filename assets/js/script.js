const textDisplay = document.getElementById("textDisplay");
const overlay = document.getElementById("overlay");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");
const bestScoreEl = document.getElementById("bestScore");

let timer = 60;
let interval = null;
let started = false;
let startTime = null;

let typedChars = [];
let correctChars = 0;
let incorrectChars = 0;
let currentText = "";
let currentDifficulty = "medium";
let mode = "timer";
const passages = {
  easy: [
    "Typing is fun and easy to learn with consistent practice.",
    "Practice daily to improve your typing confidence and speed.",
    "Short sentences help beginners build muscle memory."
  ],

  medium: [
    "Consistent typing rhythm improves speed and precision over time.",
    "Accuracy should always come before raw typing speed.",
    "Developing discipline in typing builds long term efficiency."
  ],

  hard: [
    "Professional typists sustain exceptional keystroke discipline while maintaining compositional accuracy.",
    "Cognitive processing and motor coordination synchronize during advanced typing sessions.",
    "High performance typing demands endurance, accuracy, and rhythmic consistency."
  ]
};
textDisplay.innerText = currentText;
highlightText();


function getRandomPassage(difficulty) {
  const list = passages[difficulty];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
/* ========================
   Difficulty Switch
======================== */

document.querySelectorAll("[data-difficulty]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-difficulty]")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    currentDifficulty = btn.dataset.difficulty;
    resetTest();
  });
});

/* ========================
   Mode Switch
======================== */

document.querySelectorAll("[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    mode = btn.dataset.mode;
    resetTest();
  });
});

/* ========================
   Start Test
======================== */

function startTest() {
  if (started) return;

  started = true;
  overlay.style.display = "none";
  startTime = new Date();

  if (mode === "timer") {
    startTimer();
  }
}

overlay.addEventListener("click", startTest);
textDisplay.addEventListener("click", startTest);

/* ========================
   Timer
======================== */

function startTimer() {
  interval = setInterval(() => {
    timer--;
    timeEl.textContent = timer;

    if (timer <= 0) {
      endTest();
    }
  }, 1000);
}

/* ========================
   Typing Logic
======================== */

document.addEventListener("keydown", (e) => {
  if (!started) return;
  if (mode === "timer" && timer <= 0) return;

  const text = currentText;

  if (e.key === "Backspace") {
    if (typedChars.length > 0) {
      typedChars.pop();
    }
  } 
  else if (e.key.length === 1) {
    typedChars.push(e.key);
  }

  highlightText();
  updateStats();

  if (typedChars.length >= text.length) {
    endTest();
  }
});

/* ========================
   Highlight Text
======================== */

function highlightText() {
  const text = currentText;
  let result = "";

  correctChars = 0;
  incorrectChars = 0;

  for (let i = 0; i < text.length; i++) {

    if (i < typedChars.length) {
      if (typedChars[i] === text[i]) {
        result += `<span class="correct">${text[i]}</span>`;
        correctChars++;
      } else {
        result += `<span class="incorrect">${text[i]}</span>`;
        incorrectChars++;
      }
    } 
    else if (i === typedChars.length) {
      result += `<span class="current">${text[i]}</span>`;
    } 
    else {
      result += text[i];
    }
  }

  textDisplay.innerHTML = result;
}

/* ========================
   Stats
======================== */

function updateStats() {
  let minutes;

  if (mode === "timer") {
    minutes = (60 - timer) / 60;
  } 
  else {
    const elapsed = (new Date() - startTime) / 1000;
    minutes = elapsed / 60;
  }

  const wpm = minutes > 0
    ? Math.round((correctChars / 5) / minutes)
    : 0;

  const accuracy = typedChars.length > 0
    ? Math.round((correctChars / typedChars.length) * 100)
    : 100;

  wpmEl.textContent = wpm;
  accuracyEl.textContent = accuracy + "%";
}

/* ========================
   End Test
======================== */

function endTest() {
  clearInterval(interval);
  started = false;

  const finalWPM = parseInt(wpmEl.textContent);

  if (finalWPM > parseInt(bestScoreEl.textContent)) {
    bestScoreEl.textContent = finalWPM + " WPM";
  }

  overlay.innerHTML = `
    <h2>Test Complete</h2>
    <p>WPM: ${wpmEl.textContent}</p>
    <p>Accuracy: ${accuracyEl.textContent}</p>
    <button class="start-btn" id="restartBtn">Go Again</button>
  `;

  overlay.style.display = "flex";

  document.getElementById("restartBtn")
    .addEventListener("click", resetTest);
}

/* ========================
   Reset
======================== */

function resetTest() {
  clearInterval(interval);

  timer = 60;
  startTime = null;
  typedChars = [];
  correctChars = 0;
  incorrectChars = 0;
  started = false;

  wpmEl.textContent = 0;
  accuracyEl.textContent = "100%";
  timeEl.textContent = 60;
  currentText = getRandomPassage(currentDifficulty);
  textDisplay.innerText = currentText;
  highlightText();

  overlay.innerHTML = `
    <button class="start-btn">Start Test</button>
    <p>Or click text to begin</p>
  `;

  overlay.style.display = "flex";

  overlay.addEventListener("click", startTest);

  if (mode === "timer") {
    timeEl.parentElement.style.display = "block";
  } else {
    timeEl.parentElement.style.display = "none";
  }
}