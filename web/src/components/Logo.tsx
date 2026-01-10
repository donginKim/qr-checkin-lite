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

export default function Logo({ size = 'medium', style }: LogoProps) {
  const { logoUrl } = useChurch()
  const pixelSize = sizes[size]

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

  // 로고가 없으면 빈 공간
  return null
}

