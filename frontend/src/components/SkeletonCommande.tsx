function SkeletonCommande() {
  return (
    <div className="border border-neutral-200 p-6 animate-pulse">
      <div className="flex justify-between items-center mb-5">
        <div className="h-4 bg-neutral-200 w-28" />
        <div className="h-5 bg-neutral-200 w-20 rounded" />
      </div>

      <div className="space-y-3 mb-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-16 bg-neutral-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 w-2/3" />
              <div className="h-3 bg-neutral-200 w-1/3" />
            </div>
            <div className="h-4 bg-neutral-200 w-16" />
          </div>
        ))}
      </div>

      <div className="flex justify-between border-t border-neutral-200 pt-4">
        <div className="h-4 bg-neutral-200 w-12" />
        <div className="h-4 bg-neutral-200 w-20" />
      </div>
    </div>
  )
}

export default SkeletonCommande
