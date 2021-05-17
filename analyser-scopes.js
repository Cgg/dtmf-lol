class WaveformScope {
  constructor(analyserNode, canvas) {
    this._analyserNode = analyserNode;
    this._bufferLength = analyserNode.frequencyBinCount;
    this._dataArray = new Uint8Array(this._bufferLength);
    this._canvas = canvas;
    this._canvasCtx = canvas.getContext("2d");

    this.draw();
  }

  draw() {
    window.requestAnimationFrame(() => this.draw());

    const ctx = this._canvasCtx;
    const { width, height } = this._canvas;

    ctx.fillStyle = "#f8f9faff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "transparent";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#007bff";

    this._analyserNode.getByteTimeDomainData(this._dataArray);
    const bufferSliceWidth = (this._bufferLength - 1) / width;
    const y = (x) =>
      (this._dataArray[Math.round(x * bufferSliceWidth)] / 128) * (height / 2);

    ctx.beginPath();
    ctx.moveTo(0, y(0));
    for (let i = 1; i <= width; ++i) {
      ctx.lineTo(i, y(i));
    }
    ctx.stroke();
  }
}
