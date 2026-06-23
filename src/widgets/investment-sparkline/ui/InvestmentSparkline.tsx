interface InvestmentSparklineProps {
  history: number[]
  profitable: boolean
}

export function InvestmentSparkline({ history, profitable }: InvestmentSparklineProps) {
  if (history.length < 2) {
    return <div className="h-10 w-24" aria-hidden="true" />
  }

  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const width = 100
  const height = 32
  const step = width / (history.length - 1)

  const points = history.map((value, i) => {
    const x = i * step
    const y = height - ((value - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const linePath = `M ${points.join(' L ')}`
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`
  const color = profitable ? 'var(--color-positive)' : 'var(--color-negative)'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-10 w-24" role="img" aria-label={profitable ? 'En ganancia' : 'En pérdida'}>
      <defs>
        <linearGradient id={`spark-${profitable ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${profitable ? 'up' : 'down'})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}