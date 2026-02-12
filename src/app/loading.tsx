export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-accent" />
        </div>
        <p className="text-sm text-primary">იტვირთება...</p>
      </div>
    </div>
  );
}
