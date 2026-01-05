import { useChurch } from '../context/ChurchContext'

type LogoProps = {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  style?: React.CSSProperties
}

const sizes = {
  small: 36,
  medium: 48,
  large: 64,
  xlarge: 96,
}

const fontSizes = {
  small: 36,
  medium: 48,
  large: 64,
  xlarge: 96,
}

export default function Logo({ size = 'medium', style }: LogoProps) {
  const { logoUrl } = useChurch()
  const pixelSize = sizes[size]
  const fontSize = fontSizes[size]

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="로고"
        style={{
          width: pixelSize,
          height: pixelSize,
          objectFit: 'contain',
          ...style,
        }}
      />
    )
  }

  // 로고가 없으면 십자가 표시
  return (
    <div
      style={{
        fontSize,
        color: 'var(--color-secondary)',
        textShadow: '0 2px 4px rgba(201, 162, 39, 0.3)',
        lineHeight: 1,
        ...style,
      }}
    >
      ✝
    </div>
  )
}

