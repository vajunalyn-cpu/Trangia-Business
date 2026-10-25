import Image from "next/image";
import { logo } from "@/config/brand";

type Props = { variant: "onDark" | "onLight"; height: number; priority?: boolean };

// The official logo is shown as supplied: never recoloured, stretched or redrawn.
export function Logo({ variant, height, priority }: Props) {
  const l = logo[variant];
  const width = Math.round((l.width / l.height) * height);
  return <Image src={l.src} alt="Trangia Business" width={width} height={height} priority={priority} style={{ height, width: "auto" }} />;
}
