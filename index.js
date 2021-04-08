const padEntry = document.getElementById("padEntry");
const backspaceKey = "Backspace";
const backspaceBtn = document.getElementById(backspaceKey);
const playBtn = document.getElementById("play");
const btnClass = "button";
const validKeys = "1234567890*#abcd";

const player = new DtmfPlayer(new AudioContext());

function setEntryText(text) {
  padEntry.value = text;
  [backspaceBtn, playBtn].forEach((b) =>
    b.classList.toggle("hidden", text.length === 0)
  );
}

padEntry.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") {
    e.preventDefault();
  }
});

document.addEventListener("mousedown", ({ target: { id, innerText } }) => {
  if (id.length > 0) {
    if (validKeys.indexOf(id) !== -1) {
      setEntryText(padEntry.value + innerText);
      player.startTone(id);
    } else if (id === backspaceKey) {
      setEntryText(padEntry.value.slice(0, -1));
    }
  }
});

document.addEventListener("keydown", ({ key, repeat }) => {
  if (repeat && key !== backspaceKey) {
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

document.addEventListener("mouseup", ({ target: { id } }) => {
  player.stop(id);
});

document.addEventListener("keyup", ({ key }) => {
  player.stop(key);
  if (
    document.activeElement !== padEntry &&
    (validKeys.indexOf(key) !== -1 || key === backspaceKey)
  ) {
    document.activeElement.blur();
  }
});

setEntryText(padEntry.value);
