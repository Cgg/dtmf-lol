const xFreqs = [1209, 1336, 1477, 1633];
const yFreqs = [697, 770, 852, 941];

const toneIdx = {
  1: 0,
  2: 1,
  3: 2,
  a: 3,
  4: 4,
  5: 5,
  6: 6,
  b: 7,
  7: 8,
  8: 9,
  9: 10,
  c: 11,
  "*": 12,
  0: 13,
  "#": 14,
  d: 15,
};

const oscillatorsForTone = (tone, audioCtx) => {
  if (!tone in toneIdx) {
    throw new Error(`Unrecognised tone: ${tone}`);
  }

  // DTMF works by arranging the keypad in a 4x4 matrix.
  // Here we work out indices
  const idx = toneIdx[tone];
  const x = idx % 4;
  const y = (idx - x) / 4;

  return [xFreqs[x], yFreqs[y]].map(
    (frequency) => new OscillatorNode(audioCtx, { frequency })
  );
};

class DtmfTone {
  constructor(tone, audioCtx) {
    this._osc = oscillatorsForTone(tone.toLowerCase(), audioCtx);
    this._osc.forEach((o) => {
      const g = new GainNode(audioCtx, { gain: 0.4 });
      o.connect(g).connect(audioCtx.destination);
    });
  }
  start() {
    if (this._osc === undefined) {
      throw new Error(
        "Cannot start a tone that was stopped; make another one."
      );
    }
    this._osc.forEach((o) => o.start());
  }
  stop() {
    this._osc.forEach((o) => {
      o.stop();
      o.disconnect();
    });
    this._osc = undefined;
  }
}

class DtmfPlayer {
  constructor(audioCtx) {
    this._ctx = audioCtx;
    this._tones = {};
  }

  startTone(t) {
    this.stop(t);
    const tone = (this._tones[t] = new DtmfTone(t, this._ctx));
    tone.start();
  }

  playSequence(seq) {}

  stop(t) {
    if (this._tones[t] !== undefined) {
      this._tones[t].stop();
      delete this._tones[t];
    }
  }
}
