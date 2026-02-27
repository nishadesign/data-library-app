import React from 'react'
import { ArrowUpRight } from '../../assets/icons'

export default function DataSourceCard({ icon, label, badges, badgeMore, externalLink, overlay, onClick }) {
  return (
    <button
      className="flex flex-col justify-end bg-card rounded-lg p-4 min-h-[108px] cursor-pointer text-left font-sans transition-all gap-3 shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_2px_var(--primary),0_2px_8px_rgba(0,0,0,0.1)]"
      onClick={onClick}
    >
      {icon && (
        <div className="flex items-start relative flex-1">
          {icon}
          {overlay && <div className="absolute -bottom-1.5 left-[18px]">{overlay}</div>}
        </div>
      )}
      {badges && (
        <div className="flex items-center gap-0.5 flex-wrap flex-1">
          {badges}
          {badgeMore && (
            <span className="text-[11px] font-semibold text-[#7B61FF] bg-[#F0EBFF] px-2 py-0.5 rounded-[10px] whitespace-nowrap">
              {badgeMore}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {externalLink && <ArrowUpRight size={12} className="text-primary" />}
      </div>
    </button>
  )
}
