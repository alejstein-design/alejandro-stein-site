export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      <div className="w-full h-[2px] overflow-hidden bg-border">
        <div className="h-full w-1/3 bg-muted/40 animate-loading-bar" />
      </div>
    </div>
  )
}
