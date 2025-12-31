import Image from "next/image";

export default function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="h-9 w-9 rounded-full bg-brand/20 text-brand flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}
