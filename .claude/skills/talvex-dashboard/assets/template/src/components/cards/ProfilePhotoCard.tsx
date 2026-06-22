/**
 * Card 1 — Profile photo with a blurred glass info bar at the bottom.
 * Natural 4:3 aspect on mobile; fills the parent cell on desktop.
 */
export default function ProfilePhotoCard() {
  return (
    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-full shadow-[0_2px_20px_rgba(0,0,0,0.10)]">
      <img
        src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600"
        alt="Nora Elliston"
        className="w-full h-full object-cover object-top"
      />

      {/* Frosted blur overlay at the bottom (35% height) */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '35%',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          background:
            'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 100%)',
        }}
      />

      {/* Info bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-4 py-3 rounded-2xl">
        <div className="min-w-0">
          <div className="text-white text-sm font-medium truncate">
            Nora Elliston
          </div>
          <div className="text-white/70 text-xs truncate">UI/UX Architect</div>
        </div>
        <div
          className="text-white text-xs font-medium px-3 py-1 rounded-full shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.35)' }}
        >
          $1,200
        </div>
      </div>
    </div>
  )
}
