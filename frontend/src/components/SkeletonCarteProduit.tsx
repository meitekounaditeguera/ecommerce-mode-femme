function SkeletonCarteProduit() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-neutral-200" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-neutral-200 w-3/4" />
        <div className="h-4 bg-neutral-200 w-1/3" />
      </div>
    </div>
  )
}

export default SkeletonCarteProduit