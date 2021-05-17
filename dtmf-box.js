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

const toneMinDuration = 0.2;

const oscillatorsForTone = (tone, audioCtx) => {
  if (!tone in toneIdx) {
    throw new Error(`Unrecognised tone: ${tone}`);
  }

  // DTMF works by arranging the keypad in a 4x4 matrix.
  // Here we work out indices
  const idx = toneIdx[tone];
  const x = idx % 4;
  const y = (idx - x) / 4;

  return [xFreqs[x], yFreqs[y]].map((frequency) => {
    const osc = audioCtx.createOscillator();
    osc.frequency.value = frequency;
    return osc;
  });
};

class DtmfTone {
  constructor(tone, audioCtx) {
    this._ctx = audioCtx;
    const g = (this._gain = audioCtx.createGain());
    g.gain.setValueAtTime(0.4, audioCtx.currentTime);
    g.connect(audioCtx.destination);
    this._osc = oscillatorsForTone(tone.toLowerCase(), audioCtx);
    this._osc.forEach((o) => o.connect(g));

    this._startTime = undefined;
  }

  start(time = this._ctx.currentTime) {
    if (this._osc === undefined) {
      throw new Error(
        "Cannot start a tone that was stopped; make another one."
      );
    }
    this._startTime = time;
    this._gain.gain.setTargetAtTime(0.4, time + 0.1, 0.01);
    this._osc.forEach((o) => o.start(time));
  }

  stop(time = this._ctx.currentTime) {
    time = Math.max(time, this._startTime + toneMinDuration);
    this._gain.gain.cancelScheduledValues(time);
    this._gain.gain.setTargetAtTime(0, time + 0.01, 0.03);
    this._osc.forEach((o) => {
      o.stop(time + 1);
    });
  }
}

class DtmfPlayer {
  constructor(audioCtx) {
    this._ctx = audioCtx;
    this._currentTone = undefined;
  }

  startTone(t) {
    this.stop();
    const tone = (this._currentTone = new DtmfTone(t, this._ctx));
    tone.start();
  }

  stop() {
    if (this._currentTone !== undefined) {
      this._currentTone.stop();
      this._currentTone = undefined;
    }
  }
}

function playDtmfSequence(seq, audioCtx) {
  seq = [...seq];

  const seqStartTime = audioCtx.currentTime + 0.1;
  const toneDuration = 0.2;
  const toneInterval = 0.05;

  const tones = seq.map((t) => new DtmfTone(t, audioCtx));

  tones.forEach((t, index) => {
    const toneStartTime = seqStartTime + (toneDuration + toneInterval) * index;

    t.start(toneStartTime);
    t.stop(toneStartTime + toneDuration);
  });
}
