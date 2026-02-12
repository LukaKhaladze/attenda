type Props = {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
  sm: "h-12 w-12 text-sm",
  md: "h-16 w-16 text-base",
  lg: "h-24 w-24 text-xl",
  xl: "h-32 w-32 text-2xl"
};

export function UIAvatar({ src, alt, size = "md" }: Props) {
  const initials = alt
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return src ? (
    <img src={src} alt={alt} className={`${sizeClasses[size]} rounded-full object-cover`} />
  ) : (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-white`}
    >
      {initials}
    </div>
  );
}
