class DtmfAnalyser {
  static highTones = [1209, 1336, 1477, 1633];
  static lowTones = [697, 770, 852, 941];
  static tones = [
    ["1", "2", "3", "A"],
    ["4", "5", "6", "B"],
    ["7", "8", "9", "C"],
    ["*", "0", "#", "D"],
  ];
  static toneBufferLength = 3;
  static analysisInterval = 10;

  constructor(source, audioCtx, onToneDetected) {
    const maxFreq = audioCtx.sampleRate / 2;
    const fftSize = 2048;
    const binCount = fftSize / 2;

    this._analyserNode = audioCtx.createAnalyser();
    this._analyserNode.fftSize = fftSize;
    this._analyserNode.smoothingTimeConstant = 0;
    source.connect(this._analyserNode);

    this._freqStep = maxFreq / binCount;

    // 1633 Hz is the max frequency we care about
    const bufferLength = Math.ceil(1633 / this._freqStep) + 1;
    this._dataArray = new Uint8Array(bufferLength);

    let lastDetectedTone = undefined;
    const toneBuffer = new Array(DtmfAnalyser.toneBufferLength);

    setInterval(() => {
      const currentTone = this.analyse();

      // detect a tone if we've heard the same thing for the last few analysis runs
      const detectedTone = toneBuffer.every((t) => t === currentTone)
        ? currentTone
        : undefined;

      if (detectedTone !== lastDetectedTone) {
        lastDetectedTone = detectedTone;
        if (detectedTone !== undefined) {
          onToneDetected(detectedTone);
        }
      }

      toneBuffer.push(currentTone);
      toneBuffer.shift();
    }, DtmfAnalyser.analysisInterval);
  }

  analyse() {
    this._analyserNode.getByteFrequencyData(this._dataArray);

    const highTonesData = DtmfAnalyser.highTones.map((f) =>
      getFrequencyReading(f, this._dataArray, this._freqStep)
    );
    const lowTonesData = DtmfAnalyser.lowTones.map((f) =>
      getFrequencyReading(f, this._dataArray, this._freqStep)
    );
    const htIndex = highTonesData.reduce(getHarmonicIndex, undefined);
    const ltIndex = lowTonesData.reduce(getHarmonicIndex, undefined);

    return htIndex !== undefined && ltIndex !== undefined
      ? DtmfAnalyser.tones[ltIndex][htIndex]
      : undefined;
  }
}

function getFrequencyReading(frequency, frequencyDataArray, frequencyStep) {
  const frequencyFloatIdx = frequency / frequencyStep;
  const freqLeftIdx = Math.floor(frequencyFloatIdx);

  const frequencyLeft = frequencyDataArray[freqLeftIdx];
  const frequencyRight = frequencyDataArray[Math.ceil(frequencyFloatIdx)];

  return (
    frequencyLeft +
    (frequencyFloatIdx - freqLeftIdx) * (frequencyRight - frequencyLeft)
  );
}

function getHarmonicIndex(acc, currentFreq, currentIndex) {
  if (acc !== undefined) {
    return currentFreq > 200 ? undefined : acc;
  } else if (currentFreq > 250) {
    return currentIndex;
  } else {
    return undefined;
  }
}
