import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

const gradientPresets = [
  'from-signal-blue to-active-teal',
  'from-midnight-harbor to-pale-steel',
  'from-active-teal to-signal-blue',
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function Avatar({ src, alt = '', name = '', size = 'md', className }: AvatarProps) {
  const gradient = gradientPresets[name.length % gradientPresets.length]

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden shrink-0', sizeMap[size], className)}>
        <Image src={src} alt={alt || name} fill className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br shrink-0 flex items-center justify-center text-white font-semibold',
        gradient,
        sizeMap[size],
        className
      )}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}
