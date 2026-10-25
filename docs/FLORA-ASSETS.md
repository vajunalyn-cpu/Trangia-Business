# FLORA assets

FLORA canvas: **Trangia Business Website Assets** (`prj_ns78gj4yvg3tfzpqq14ydxrka98gyv6q`), in "VA JUNALYN's workspace".
Open it at https://app.flora.ai/projects/ns78gj4yvg3tfzpqq14ydxrka98gyv6q

## Generated on 25 Oct 2026

Model: Nano Banana 2.1 (`t2i-elote-gateway`), 16:9, 2K. Cost: US$0.077 each, US$0.23 total.

| Slot (`src/config/brand.ts`) | File to create | FLORA run | Used on |
|---|---|---|---|
| `pezaEcozone` | `public/media/flora/peza-ecozone-{960,1920}.webp` | `run_m1733hsbtp3szfbjvy2t05gqdh8gye7s` | PEZA page hero |
| `boiRenewables` | `public/media/flora/boi-renewables-{960,1920}.webp` | `run_m17dmy82rj3e3nhg16wpkxkf418gz14w` | BOI page hero |
| `manilaSkyline` | `public/media/flora/manila-cbd-{960,1920}.webp` | `run_m179dz1vby5wyj95j3g01y8hr58gyzf4` | Why Philippines hero |

The build environment couldn't download from `media.flora.ai`, so these aren't in the repository yet. To add one:

1. Open the canvas, review the image, and download it if it's suitable.
2. `python3 scripts/optimize-media.py ~/Downloads/<file>.png public/media/flora/peza-ecozone`
3. In `src/config/brand.ts`, set `available: true` for `pezaEcozone`.
4. Commit and push. Vercel redeploys.

These are AI-generated illustrations. Their alt text says so, and they must not be presented as specific
real zones or projects.

## Prompts

**peza-ecozone**
> Aerial architectural photograph at golden hour of a modern industrial economic zone in the Philippines:
> orderly rows of clean white and pale grey manufacturing plants and logistics warehouses, a few glass office
> blocks, wide landscaped avenues lined with palm and acacia trees, green mountains softly hazed in the
> distance. Low warm 24k-gold sunlight raking across roofs, long deep navy-blue shadows, champagne-coloured sky
> near the horizon. Calm, premium, restrained colour palette of navy, ivory and gold. Photorealistic, high
> detail, editorial quality. Absolutely no text, no signage, no logos, no flags, no watermarks.

**boi-renewables**
> Wide cinematic landscape photograph at dusk on a coastal ridge in northern Philippines: a line of modern
> white wind turbines along the ridge, a large solar array on the slope below, calm sea to the left. Sky
> graded from deep navy blue overhead to champagne gold at the horizon, the last warm gold light catching the
> turbine blades. Serene, premium, editorial, restrained navy, ivory and gold palette. Photorealistic, high
> detail. Absolutely no text, no logos, no watermarks, no people.

**manila-cbd**
> Blue-hour aerial photograph of a modern Metro Manila central business district: dense cluster of
> contemporary glass and stone office towers, wide tree-lined avenues, warm gold window lights and gold streams
> of traffic light, Manila Bay faintly visible in the far distance. Deep navy sky with a thin band of
> champagne gold at the horizon. Cinematic, premium, calm, photorealistic, high detail. Absolutely no readable
> text, no brand signage, no logos, no watermarks.

## Not yet generated (prompts ready)

**Hero film (optional, ~US$0.48 for 5 s at 768p with MiniMax H3 Max image-to-video)**
Animate `manila-cbd` or a new still. Suggested prompt:
> Slow, steady aerial dolly forward over the business district at blue hour; window lights flicker on; gentle
> gold light trails of traffic; no camera shake, no cuts, seamless loop feel.

To use a film: export MP4 (H.264, ≤8 MB, 1920×1080) and optionally WebM, place them in `public/media/flora/`,
and set `ambientVideo.mp4` (and `.webm`) in `src/config/brand.ts`. It plays muted and looped behind the closing
call-to-action band, loads only when scrolled near, and is replaced by the poster for visitors who prefer
reduced motion. The 3D hero stays as the signature, since it's interactive and loads faster.

**Services: advisory meeting still**
> Close, editorial photograph of two professionals reviewing financial documents and a tablet showing charts at
> an ivory marble table with brushed-gold details and a navy leather folder; soft daylight; hands and documents
> in focus, faces out of frame; no text legible, no logos.

**Section transition texture**
> Abstract macro of fine gold lines flowing across deep navy silk, subtle champagne highlights, minimal,
> elegant, seamless, no text.

## Using FLORA from Claude

The FLORA connector is connected in this account. Generations spend workspace credit (balance US$7.50 on
25 Oct 2026, before US$0.23 spent). Ask for a quote first; Claude will quote in USD before generating.
