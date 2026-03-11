import { useEffect, useRef } from 'react'

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const colours = ['#f59e0b', '#ec4899', '#8b5cf6', '#22c55e', '#3b82f6', '#f97316']
    const pieces: HTMLDivElement[] = []

    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div')
      const colour = colours[Math.floor(Math.random() * colours.length)]
      const size = Math.random() * 8 + 6
      el.style.cssText = `
        position:fixed; width:${size}px; height:${size}px;
        background:${colour}; border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        left:${Math.random() * 100}vw; top:-10px; z-index:9999;
        pointer-events:none; opacity:1;
        transform:rotate(${Math.random() * 360}deg);
      `
      container.appendChild(el)
      pieces.push(el)

      const duration = Math.random() * 1500 + 1500
      const horizontalDrift = (Math.random() - 0.5) * 300

      el.animate([
        { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(100vh) translateX(${horizontalDrift}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ], { duration, easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)', fill: 'forwards', delay: Math.random() * 500 })
    }

    const cleanup = setTimeout(() => {
      pieces.forEach(p => p.remove())
    }, 3500)

    return () => {
      clearTimeout(cleanup)
      pieces.forEach(p => p.remove())
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />
}
