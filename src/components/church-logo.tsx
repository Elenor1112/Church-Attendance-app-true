import logoAsset from "@/assets/church-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function ChurchLogo({ className, size = 64 }: { className?: string; size?: number }) {
  return (
    <img
      src={logoAsset.url}
      alt="كنيسة العذراء والأنبا بيشوي"
      width={size}
      height={size}
      loading="lazy"
      className={cn("object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
