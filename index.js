const padEntry = document.getElementById("padEntry");
const btnClass = "button";
const validKeys = "1234567890*#abcd";

padEntry.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") {
    e.preventDefault();
  }
});

document.addEventListener("mousedown", ({ target }) => {
  if (target.classList.contains(btnClass)) {
    padEntry.value += target.innerText;
  }
});

document.addEventListener("keydown", (e) => {
  const { key, repeat } = e;

  if (repeat) {
    return;
  }

  if (validKeys.indexOf(key) !== -1) {
    const entry = key.toUpperCase();
    padEntry.value += entry;

    if (document.activeElement !== padEntry) {
      document.getElementById(entry).focus();
    }
  } else if (key === "Backspace" && padEntry.value.length > 0) {
    padEntry.value = padEntry.value.slice(0, -1);

    if (document.activeElement !== padEntry) {
      document.activeElement.blur();
    }
  } else if (key === " ") {
    const activeElement = document.activeElement;
    if (activeElement.classList.contains(btnClass)) {
      padEntry.value += activeElement.innerText;
    }
  }
});

document.addEventListener("mouseup", () => {});

document.addEventListener("keyup", ({ key }) => {
  if (document.activeElement !== padEntry && validKeys.indexOf(key) !== -1) {
    document.activeElement.blur();
  }
});
