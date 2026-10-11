import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { strokeCovers, type TracePoint } from '@/domain/reading/trace'

export function TracePad({
  letter,
  checkpoints,
  onPass,
}: {
  letter: string
  checkpoints: TracePoint[]
  onPass: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const points = useRef<TracePoint[]>([])
  const drawing = useRef(false)
  const [message, setMessage] = useState('Sigue los puntos. Un trazo tranquilo es suficiente.')

  const paintGuide = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#fff7ed'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#fdba74'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.beginPath()
    checkpoints.forEach((point, index) => {
      const x = point.x * width
      const y = point.y * height
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    checkpoints.forEach((point, index) => {
      ctx.beginPath()
      ctx.fillStyle = index === 0 ? '#10b981' : '#f59e0b'
      ctx.arc(point.x * width, point.y * height, 10, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#0f172a'
    ctx.font = '700 72px Nunito, sans-serif'
    ctx.globalAlpha = 0.12
    ctx.fillText(letter, width * 0.34, height * 0.62)
    ctx.globalAlpha = 1
  }

  useEffect(() => {
    paintGuide()
    points.current = []
    setMessage('Sigue los puntos. Un trazo tranquilo es suficiente.')
    // La guía se redibuja al cambiar la letra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter])

  const localPoint = (event: ReactPointerEvent<HTMLCanvasElement>): TracePoint => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }

  const drawSegment = (point: TracePoint) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const previous = points.current[points.current.length - 1]
    if (!canvas || !ctx || !previous) return
    ctx.strokeStyle = '#4f46e5'
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(previous.x * canvas.width, previous.y * canvas.height)
    ctx.lineTo(point.x * canvas.width, point.y * canvas.height)
    ctx.stroke()
  }

  const finish = () => {
    drawing.current = false
    if (strokeCovers(points.current, checkpoints)) {
      setMessage('¡Así se traza! La dirección está bien.')
      onPass()
      return
    }
    setMessage('Casi. Vuelve a seguir los puntos de color. No tiene que quedar perfecto.')
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={360}
        height={280}
        className="mx-auto w-full max-w-sm touch-none rounded-[1.5rem] ring-2 ring-amber/40"
        aria-label={`Zona para trazar la letra ${letter}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          drawing.current = true
          const point = localPoint(event)
          points.current = [point]
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return
          const point = localPoint(event)
          drawSegment(point)
          points.current.push(point)
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <p className="text-center text-sm font-bold text-ink-soft" aria-live="polite">
        {message}
      </p>
      <button
        type="button"
        className="mx-auto block text-sm font-bold text-teal underline"
        onClick={() => {
          points.current = []
          paintGuide()
          setMessage('Listo para un trazo nuevo.')
        }}
      >
        Borrar trazo
      </button>
    </div>
  )
}
