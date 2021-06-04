const padEntry = document.getElementById("padEntry");
const outputLabel = document.getElementById("outputLabel");
const backspaceKey = "Backspace";
const backspaceBtn = document.getElementById(backspaceKey);
const playId = "play";
const playBtn = document.getElementById(playId);
const btnClass = "button";
const validKeys = "1234567890*#abcd";
let onGoingTouchCount = 0;
let keyDownCount = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const passThrough = audioCtx.createGain();
passThrough.connect(audioCtx.destination);

const player = new DtmfPlayer(passThrough, audioCtx);

const dtmfAnalyser = new DtmfAnalyser(passThrough, audioCtx, (t) => {
  outputLabel.value = outputLabel.value + t;
});

initScopes(passThrough, audioCtx);

function setEntryText(text) {
  padEntry.value = text;
  [backspaceBtn, playBtn].forEach((b) =>
    b.classList.toggle("hidden", text.length === 0)
  );
}

function handleTouchOrMouseEvent(e) {
  const {
    target: { id, innerText },
  } = e;
  if (id.length > 0) {
    if (validKeys.indexOf(id) !== -1) {
      setEntryText(padEntry.value + innerText);
      player.startTone(id);
    } else if (id === backspaceKey) {
      setEntryText(padEntry.value.slice(0, -1));
    } else if (id === playId) {
      outputLabel.value = "";
      playDtmfSequence(padEntry.value, passThrough, audioCtx);
    }
  }
}

padEntry.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") {
    e.preventDefault();
  }
});

// Touch handlers

document.addEventListener("touchstart", (e) => {
  audioCtx.resume();
  e.preventDefault();
  if (onGoingTouchCount === 0) {
    handleTouchOrMouseEvent(e);
  }
  onGoingTouchCount += 1;
});

document.addEventListener("touchend", (e) => {
  e.preventDefault();
  onGoingTouchCount = Math.max(onGoingTouchCount - 1, 0);
  if (onGoingTouchCount === 0) {
    player.stop();
  }
});

// Mouse handlers

document.addEventListener("mousedown", (e) => {
  audioCtx.resume();
  handleTouchOrMouseEvent(e);
});

document.addEventListener("mouseup", () => {
  player.stop();
});

// Keyboard handlers

document.addEventListener("keydown", ({ key, repeat }) => {
  audioCtx.resume();

  if (repeat && key !== backspaceKey) {
    return;
  }

  keyDownCount += repeat || key === "Shift" ? 0 : 1;

  if (keyDownCount > 1) {
    return;
  }

  if (validKeys.indexOf(key) !== -1) {
    const entry = key.toUpperCase();

    setEntryText(padEntry.value + entry);
    player.startTone(key);

    if (document.activeElement !== padEntry) {
      document.getElementById(key).focus();
    }
  } else if (key === backspaceKey && padEntry.value.length > 0) {
    setEntryText(padEntry.value.slice(0, -1));

    if (document.activeElement !== padEntry) {
      backspaceBtn.focus();
    }
  } else if (key === " ") {
    const activeElement = document.activeElement;
    if (activeElement.classList.contains(btnClass)) {
      setEntryText(padEntry.value + activeElement.innerText);
    }
  }
});

document.addEventListener("keyup", ({ key }) => {
  keyDownCount = Math.max(keyDownCount - 1, 0);
  if (keyDownCount > 0) {
    return;
  }

  player.stop();

  if (
    document.activeElement !== padEntry &&
    (validKeys.indexOf(key) !== -1 || key === backspaceKey)
  ) {
    document.activeElement.blur();
  }
});

setEntryText(padEntry.value);

const blurbLink = document.querySelector("#huh a");

const updateBlurbVisibility = (showing) => {
  blurbLink.innerText = showing ? "Ok!" : "Huh?";
  document
    .getElementById("blurbText")
    .classList[showing ? "remove" : "add"]("blurbHidden");
};

blurbLink.addEventListener("click", () => {
  const showing = blurbLink.innerText === "Huh?" ? true : false;
  updateBlurbVisibility(showing);
});

updateBlurbVisibility(false);
