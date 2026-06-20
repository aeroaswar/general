// Aurora-glass backdrop — soft drifting gradient blobs behind the frosted UI.
export default function AuroraBg() {
  const blobs = [
    { bg: "var(--a1)", w: 540, top: "-8%", left: "-6%", anim: "drift1 22s ease-in-out infinite" },
    { bg: "var(--a2)", w: 480, top: "12%", right: "-8%", anim: "drift2 26s ease-in-out infinite" },
    { bg: "var(--a3)", w: 520, bottom: "-12%", left: "18%", anim: "drift3 30s ease-in-out infinite" },
    { bg: "var(--a4)", w: 380, top: "44%", left: "40%", anim: "drift1 28s ease-in-out infinite" },
  ];
  return (
    <>
      <div className="aurora-bg" aria-hidden="true">
        {blobs.map((b, i) => (
          <span
            key={i}
            className="aurora-blob"
            style={{ width: b.w, height: b.w, background: b.bg, top: b.top, left: b.left, right: b.right, bottom: b.bottom, animation: b.anim }}
          />
        ))}
      </div>
      <div className="aurora-grain" aria-hidden="true" />
    </>
  );
}
