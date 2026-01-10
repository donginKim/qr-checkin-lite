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
  const pixelSize = sizes[size]

  return (
    <img
      src="/logo.png"
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

