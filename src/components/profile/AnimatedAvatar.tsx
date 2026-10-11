import {
  colorOf,
  EYE_COLORS,
  HAIR_COLORS,
  SHIRT_COLORS,
  SKIN_TONES,
  type AvatarLook,
} from '@/domain/avatarLook'

const skinShade = (hex: string, amount: number) => {
  const value = hex.replace('#', '')
  const channel = (index: number) =>
    Math.max(0, Math.min(255, parseInt(value.slice(index, index + 2), 16) + amount))
  return `rgb(${channel(0)} ${channel(2)} ${channel(4)})`
}

export function AnimatedAvatar({ look, title }: { look: AvatarLook; title: string }) {
  const skin = colorOf(SKIN_TONES, look.skin)
  const skinDeep = skinShade(skin, -28)
  const hair = colorOf(HAIR_COLORS, look.hairColor)
  const hairDeep = skinShade(hair, -24)
  const iris = colorOf(EYE_COLORS, look.eyeColor)
  const shirt = colorOf(SHIRT_COLORS, look.shirt)
  const showEars = look.hair !== 'afro'

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={title} className="h-full w-full">
      <g className="avatar-bob">
        <ellipse cx="100" cy="178" rx="74" ry="36" fill={shirt} />
        <path d="M78 132h44v36c-6 8-16 12-22 12s-16-4-22-12z" fill={skin} />
        {look.hair === 'long' || look.hair === 'wavy' ? (
          <path
            className="avatar-sway"
            d="M58 108c-14 28-8 70 8 84 10-20 14-46 10-70 18 8 40 8 58 0-4 24 0 50 10 70 16-14 22-56 8-84-16 18-48 22-72 0z"
            fill={hair}
          />
        ) : null}
        {look.hair === 'braids' || look.hair === 'pigtails' ? (
          <g className="avatar-sway" fill={hair}>
            <path d="M46 96c-6 30-2 58 6 78 8-18 8-42 4-66z" />
            <path d="M154 96c6 30 2 58-6 78-8-18-8-42-4-66z" />
            <circle cx="50" cy="176" r="7" fill={hairDeep} />
            <circle cx="150" cy="176" r="7" fill={hairDeep} />
          </g>
        ) : null}
        {look.hair === 'ponytail' ? (
          <path className="avatar-sway" d="M132 70c28 8 40 36 28 62-16-6-22-28-16-48-8 4-14 2-12-14z" fill={hair} />
        ) : null}
        {look.hair === 'afro' ? <circle cx="100" cy="96" r="78" fill={hair} /> : null}
        {showEars ? (
          <>
            <ellipse cx="48" cy="104" rx="10" ry="14" fill={skin} />
            <ellipse cx="152" cy="104" rx="10" ry="14" fill={skin} />
            <ellipse cx="48" cy="106" rx="4" ry="7" fill={skinDeep} opacity="0.35" />
            <ellipse cx="152" cy="106" rx="4" ry="7" fill={skinDeep} opacity="0.35" />
          </>
        ) : null}
        <Head shape={look.face} fill={skin} />
        {look.cheeks ? (
          <>
            <ellipse cx="68" cy="118" rx="12" ry="7" fill="#F07167" opacity="0.35" />
            <ellipse cx="132" cy="118" rx="12" ry="7" fill="#F07167" opacity="0.35" />
          </>
        ) : null}
        {look.freckles ? (
          <g fill={skinDeep} opacity="0.7">
            <circle cx="70" cy="112" r="1.4" />
            <circle cx="78" cy="116" r="1.2" />
            <circle cx="74" cy="120" r="1.3" />
            <circle cx="122" cy="112" r="1.4" />
            <circle cx="130" cy="116" r="1.2" />
            <circle cx="126" cy="120" r="1.3" />
          </g>
        ) : null}
        <Brows shape={look.brows} color={hairDeep} />
        <Eye cx={78} cy={98} shape={look.eyes} iris={iris} delay="0s" />
        <Eye cx={122} cy={98} shape={look.eyes} iris={iris} delay="0.08s" />
        <Nose shape={look.nose} color={skinDeep} />
        <Mouth shape={look.mouth} />
        <FrontHair style={look.hair} color={hair} deep={hairDeep} />
        <Glasses style={look.glasses} />
        <Accessory style={look.accessory} hair={hair} />
      </g>
    </svg>
  )
}

function Head({ shape, fill }: { shape: AvatarLook['face']; fill: string }) {
  if (shape === 'square') {
    return <rect x="52" y="48" width="96" height="108" rx="32" fill={fill} />
  }
  if (shape === 'heart') {
    return (
      <path
        d="M100 50c-22 0-42 16-42 42 0 28 20 48 42 62 22-14 42-34 42-62 0-26-20-42-42-42z"
        fill={fill}
      />
    )
  }
  const rx = shape === 'oval' ? 44 : 50
  const ry = shape === 'oval' ? 58 : 52
  return <ellipse cx="100" cy="100" rx={rx} ry={ry} fill={fill} />
}

function Eye({
  cx,
  cy,
  shape,
  iris,
  delay,
}: {
  cx: number
  cy: number
  shape: AvatarLook['eyes']
  iris: string
  delay: string
}) {
  const ry = shape === 'soft' ? 7 : shape === 'wide' ? 13 : shape === 'almond' ? 8 : 11
  const rx = shape === 'almond' ? 13 : shape === 'wide' ? 12 : 11
  return (
    <g className="avatar-blink" style={{ animationDelay: delay }}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
      <circle cx={cx} cy={cy + 1} r={shape === 'soft' ? 4.5 : 5.5} fill={iris} />
      <circle cx={cx} cy={cy + 1} r="2.4" fill="#1C1C1C" />
      <circle cx={cx + 2} cy={cy - 1} r="1.3" fill="#fff" />
    </g>
  )
}

function Brows({ shape, color }: { shape: AvatarLook['brows']; color: string }) {
  const stroke = shape === 'thick' ? 5 : 3
  const left =
    shape === 'arched'
      ? 'M62 82q12-10 26-2'
      : shape === 'straight'
        ? 'M64 80h24'
        : shape === 'thick'
          ? 'M62 82q14-6 26 0'
          : 'M64 84q12-8 24-2'
  const right =
    shape === 'arched'
      ? 'M112 80q14-8 26 2'
      : shape === 'straight'
        ? 'M112 80h24'
        : shape === 'thick'
          ? 'M112 82q12-6 26 0'
          : 'M112 82q12-6 24 2'
  return (
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <path d={left} />
      <path d={right} />
    </g>
  )
}

function Nose({ shape, color }: { shape: AvatarLook['nose']; color: string }) {
  if (shape === 'narrow') {
    return <path d="M100 102v12" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
  }
  const rx = shape === 'wide' ? 8 : 5
  return <ellipse cx="100" cy="114" rx={rx} ry="4" fill={color} opacity="0.45" />
}

function Mouth({ shape }: { shape: AvatarLook['mouth'] }) {
  if (shape === 'open') {
    return (
      <g>
        <ellipse cx="100" cy="132" rx="10" ry="8" fill="#C94B6A" />
        <ellipse cx="100" cy="134" rx="6" ry="4" fill="#7A2944" />
      </g>
    )
  }
  if (shape === 'grin') {
    return (
      <g>
        <path d="M78 126q22 22 44 0" fill="#C94B6A" />
        <path d="M84 128h32v5H84z" fill="#fff" />
      </g>
    )
  }
  const width = shape === 'soft' ? 14 : 22
  return (
    <path
      d={`M${100 - width} 128q${width} ${shape === 'soft' ? 10 : 16} ${width * 2} 0`}
      fill="none"
      stroke="#C94B6A"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  )
}

function FrontHair({
  style,
  color,
  deep,
}: {
  style: AvatarLook['hair']
  color: string
  deep: string
}) {
  if (style === 'none' || style === 'afro') return null
  if (style === 'buzz') {
    return <path d="M58 96c2-40 28-52 42-52s40 12 42 52c-16-18-68-18-84 0z" fill={deep} />
  }
  if (style === 'curly') {
    return (
      <g fill={color}>
        {[
          [70, 58],
          [90, 46],
          [110, 46],
          [130, 58],
          [58, 78],
          [142, 78],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="14" />
        ))}
      </g>
    )
  }
  if (style === 'bun') {
    return (
      <g fill={color}>
        <path d="M56 104 C58 58 78 42 100 42 C122 42 142 58 144 104 C128 82 112 76 100 78 C88 76 72 82 56 104 Z" />
        <circle cx="100" cy="40" r="16" />
        <circle cx="100" cy="40" r="6" fill={deep} />
      </g>
    )
  }
  if (style === 'bob') {
    return (
      <path
        d="M50 124 C52 54 76 38 100 38 C124 38 148 54 150 124 C136 100 118 92 100 94 C82 92 64 100 50 124 Z"
        fill={color}
      />
    )
  }
  if (style === 'long' || style === 'wavy') {
    return (
      <path
        d="M58 96 C62 48 80 36 100 36 C120 36 138 48 142 96 C128 74 114 70 100 72 C86 70 72 74 58 96 Z"
        fill={color}
      />
    )
  }
  return (
    <path
      d="M56 108 C58 52 78 40 100 40 C122 40 142 52 144 108 C130 84 116 78 100 80 C84 78 70 84 56 108 Z"
      fill={color}
    />
  )
}

function Glasses({ style }: { style: AvatarLook['glasses'] }) {
  if (style === 'none') return null
  const rx = style === 'round' ? 16 : 18
  const ry = style === 'round' ? 14 : 12
  return (
    <g fill="none" stroke="#243044" strokeWidth="3">
      <ellipse cx="78" cy="98" rx={rx} ry={ry} />
      <ellipse cx="122" cy="98" rx={rx} ry={ry} />
      <path d="M94 98h12" />
    </g>
  )
}

function Accessory({ style, hair }: { style: AvatarLook['accessory']; hair: string }) {
  if (style === 'none') return null
  if (style === 'cap') {
    return (
      <g>
        <path d="M48 96c4-46 32-62 52-62s48 16 52 62H48z" fill="#2C3E50" />
        <path d="M46 96h118l-10 16H58z" fill="#243044" />
      </g>
    )
  }
  if (style === 'flower') {
    return (
      <g>
        <circle cx="138" cy="70" r="6" fill="#F07167" />
        <circle cx="148" cy="76" r="6" fill="#F6C445" />
        <circle cx="132" cy="80" r="6" fill="#F49AC2" />
        <circle cx="140" cy="76" r="4" fill="#F7F4EF" />
      </g>
    )
  }
  return (
    <g>
      <circle cx="142" cy="72" r="8" fill="#F07167" />
      <circle cx="154" cy="80" r="8" fill="#F07167" />
      <circle cx="146" cy="78" r="4" fill={hair} />
    </g>
  )
}
