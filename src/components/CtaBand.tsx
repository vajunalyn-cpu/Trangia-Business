import Link from "next/link";
import { media, ambientVideo } from "@/config/brand";
import { MediaSlot } from "./MediaSlot";
import { AmbientVideo } from "./AmbientVideo";
import { Spotlight } from "./fx/Spotlight";
import s from "./CtaBand.module.css";

export function CtaBand({
  title = "Tell us about your project",
  body = "Share your activity, preferred location and timeline. A consultant will reply with the registration route that fits and what it involves.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className={`surface-navy ${s.band}`} aria-labelledby="cta-title">
      <div className={s.media} aria-hidden="true">
        {ambientVideo.mp4 ? <AmbientVideo {...ambientVideo} /> : <MediaSlot slot={media.globeRender} sizes="100vw" />}
      </div>
      <Spotlight />
      <div className={`wrap ${s.inner}`}>
        <h2 id="cta-title" className="h2">
          {title}
        </h2>
        <p className="lede">{body}</p>
        <div className={s.ctas}>
          <Link href="/inquire/" className="btn btn-gold">
            Inquire now
          </Link>
          <Link href="/peza/#calculator" className="btn btn-line">
            Try the incentive calculator
          </Link>
        </div>
      </div>
    </section>
  );
}
