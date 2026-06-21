import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// Lightweight canvas signature pad — pointer-based, DPR-aware.
const SignaturePad = forwardRef(function SignaturePad({ height = 150 }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1a1714"; // fixed ink so it's legible on the paper strip & in print
    };
    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, []);

  const at = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
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
        style={{ width: "100%", height, touchAction: "none", background: "#faf8f5" }}
        className="rounded-xl border hairline cursor-crosshair"
      />
      {empty && (
        <span className="absolute inset-0 grid place-items-center text-sm pointer-events-none" style={{ color: "#9b948c" }}>Draw your signature here</span>
      )}
    </div>
  );
});

export default SignaturePad;
