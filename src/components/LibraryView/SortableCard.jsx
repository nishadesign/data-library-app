import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const JIGGLE_DELAY_CLASSES = [
  'arrange-jiggle-delay-1',
  'arrange-jiggle-delay-2',
  'arrange-jiggle-delay-3',
  'arrange-jiggle-delay-4',
]

export default function SortableCard({ id, arranging, jiggle, delayIndex = 0, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !arranging })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
  }

  const jiggleClasses =
    arranging && jiggle && !isDragging
      ? `arrange-jiggle ${JIGGLE_DELAY_CLASSES[delayIndex % JIGGLE_DELAY_CLASSES.length]}`
      : ''

  const liftClasses = isDragging
    ? 'scale-[1.02] shadow-2xl z-10'
    : ''

  const cursor = arranging
    ? isDragging
      ? 'cursor-grabbing'
      : 'cursor-grab'
    : ''

  const sortableAttrs = arranging ? attributes : {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging ? 'true' : 'false'}
      className={`relative transition-transform duration-150 ${jiggleClasses} ${liftClasses} ${cursor}`}
      {...sortableAttrs}
    >
      {children}
      {arranging && (
        <div
          {...listeners}
          aria-hidden="true"
          className="absolute inset-0 z-20 select-none touch-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      )}
    </div>
  )
}
