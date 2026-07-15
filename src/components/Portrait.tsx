const SIZES = {
  sm: "size-12 text-base",
  md: "size-20 text-xl",
  lg: "size-32 sm:size-40 text-3xl",
};

/**
 * Dumb portrait component, safe in server and client components.
 * Pass src=null (e.g. from lib/portraits.ts) to render a monogram fallback.
 */
export default function Portrait({
  name,
  src,
  alt,
  size = "md",
}: {
  name: string;
  src: string | null;
  alt?: string;
  size?: keyof typeof SIZES;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? `Portrait of ${name}`}
        className={`${SIZES[size]} rounded-full object-cover object-top border border-(--line) bg-(--bg-raised) shrink-0`}
        loading="lazy"
      />
    );
  }

  const initials = name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      aria-hidden="true"
      className={`${SIZES[size]} rounded-full border border-(--line) bg-(--accent-soft) text-(--accent) font-display font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </div>
  );
}
