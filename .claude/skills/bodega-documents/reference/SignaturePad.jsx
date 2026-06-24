import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// Lightweight canvas signature pad — pointer-based, DPR-aware. Sizes its buffer
// from the canvas's *layout* size (clientWidth/Height), which is unaffected by
// the modal's open transform — otherwise the buffer mismatches what's on screen
// and the ink lands offset from the finger (the "glitch").
const SignaturePad = forwardRef(function SignaturePad({ height = 150, placeholder = "Draw your signature here" }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
      if (canvas.width === bw && canvas.height === bh) return; // unchanged — keep the drawing
      canvas.width = bw;
      canvas.height = bh;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1a1714"; // fixed ink so it's legible on the paper strip & in print
      setEmpty(true);
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // map a pointer event to the canvas's CSS-pixel space, correcting for any
  // residual transform/scale (e.g. while the modal is still animating in)
  const at = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    const sx = r.width ? c.clientWidth / r.width : 1;
    const sy = r.height ? c.clientHeight / r.height : 1;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };
  const down = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const p = at(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = at(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (empty) setEmpty(false);
  };
  const up = () => { drawing.current = false; };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const c = canvasRef.current;
      c.getContext("2d").clearRect(0, 0, c.width, c.height);
      setEmpty(true);
    },
    isEmpty: () => empty,
    toDataURL: () => (empty ? null : canvasRef.current.toDataURL("image/png")),
  }), [empty]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        style={{ width: "100%", height, touchAction: "none", background: "#faf8f5" }}
        className="rounded-xl border hairline cursor-crosshair"
      />
      {empty && (
        <span className="absolute inset-0 grid place-items-center text-sm pointer-events-none" style={{ color: "#9b948c" }}>{placeholder}</span>
      )}
    </div>
  );
});

export default SignaturePad;
