/**
 * Full-screen fixed background. A base #E3E5E6 fill with a large yellow blob
 * heavily blurred (Gaussian stdDeviation 250) to create a warm diffused glow
 * in the lower portion of the viewport.
 */
export default function Background() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1280 832"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="1280" height="832" fill="#E3E5E6" />
      <g filter="url(#talvex-bg-blur)">
        <path
          d="M904 404C942.8 189.6 1234.83 123.333 1376 117V1093.5H-227V792.5C-161.5 706.167 0.5 556.6 124.5 649C248.5 741.4 473.833 727.5 571 709C665.833 696.667 865.2 618.4 904 404Z"
          fill="#FFD85F"
        />
      </g>
      <defs>
        <filter
          id="talvex-bg-blur"
          x="-727"
          y="-383"
          width="2603"
          height="1976.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur stdDeviation="250" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  )
}
