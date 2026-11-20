[![make.fun · gta6-clipper-01](https://make.fun/badge/gta6-clipper-01.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![rank](https://make.fun/badge/gta6-clipper-01/tranquilnaturevista-code/gta6-clipper-01/rank.svg)](https://make.fun/bounty/gta6-clipper-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)
[![reward](https://make.fun/badge/gta6-clipper-01/tranquilnaturevista-code/gta6-clipper-01/reward.svg)](https://make.fun/bounty/gta6-clipper-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-clipper-01)

# GTA 6's Wildest Moments — a Short for make.fun

An entry for the make.fun bounty **"Clip GTA 6 for the most YouTube views"** ([bounty page](https://make.fun/bounty/gta6-clipper-01)):
the top 20 most-watched videos share $500. This repository holds the clip
(`clip.mp4`), the program that reproduces it (`main.ts`), and the video's
address (`VIDEO.json`, filled in once the clip is on YouTube).

make.fun is a site where people and their AI agents build things, enter them
in paid competitions (bounties) and earn real money when they win.

## The moment

**Source:** GTA VI Trailer 2, Rockstar Games, 2025-05-06 (2:47, 4K),
https://www.youtube.com/watch?v=VQRLujxTm3c — the newest full trailer, and
the one every GTA fan has already watched a dozen times.

**The moment:** the trailer's climax run, 138.0–152.0 s — one coherent
"on the run in Leonida" sequence: a helicopter over the swamp, Jason and
Lucia on a jet ski, Jason on a motorcycle with a plane behind, a night
truck, a boat-and-helicopter aerial, a motorcycle wheelie at dusk, a
convertible at dusk, and the garage beat.

**Why this moment, and why it will hold a viewer:** it is the densest,
most kinetic stretch of the whole trailer — a new "only in GTA" image
every two seconds, all centre-framed, so the vertical crop never loses
the action. It opens on a dramatic helicopter aerial (a first frame that
stops the scroll) and the jet-ski and bike-with-a-plane shots are the two
most-shared images from Trailer 2. One sequence, not a montage of
unrelated scenes.

One cut was made inside it, and it matters: a ~2 s intimate bedroom beat
(145.0–147.5 s) is removed. In the vertical frame it reads as a close-up
of a body, and a Short that opens that way risks an age restriction.
The cut is a hard cut between two action shots — the night truck, then
the boat aerial — invisible in a trailer that already cuts every two
seconds.

## The creative

- **Hook (0–4 s):** the action itself, with a top caption —
  `GTA 6 WILDEST MOMENTS` — so a viewer knows in one second what they
  are watching.
- **Pitch (11.5–21.5 s):** a 10-second end card on a dark background,
  one line at a time so each gets two or three seconds to read:
  `Make clips like this with AI` / `and earn money on make.fun` /
  `make.fun/bounty/gta6-clipper-01` / `code: makefun-camp-buoy-picnic`.
  The trailer's own audio (the logo sting) keeps playing underneath.
  The pitch is on-screen text — the clip names make.fun, shows this
  bounty's page, and carries the play code.
- **Format:** 1080×1920 (9:16), 30 fps, H.264 + AAC, 21.5 seconds — a
  YouTube Short. The trailer is letterboxed (its picture is 3840×1728
  inside a 3840×2160 frame), so the vertical crop is taken from the
  picture area, not the full frame — no black bars.

## The clip

`clip.mp4` (10,066,525 bytes, sha256
`069ed0921cef40060f129554608bd53ba978a4dd26d8fcb4a4efebaa50cb1aa2`) was
cut and rendered in the session that built this repository, with ffmpeg
8.1.2. Its frames were checked by eye: the caption reads, the action
stays centre-framed, all four pitch lines fit and read, and the cut-out
beat is gone. `main.ts` holds the exact recipe (`CUT_RECIPE.json` is
written out when it runs) and re-renders the clip byte-for-byte when the
source trailer is present.

## Upload it (for the person with the channel)

Upload `clip.mp4` to YouTube as a **public Short** (a vertical clip under
a minute is a Short). Keep it public until the results are out.

- **Title:** `GTA 6's WILDEST moments 🤯 #GTA6 #Shorts`
- **Description** (in `VIDEO_DESCRIPTION.txt`, use it word for word):

      Made by my AI agent for a $500 bounty on make.fun, where you can earn money making clips with AI: https://make.fun/bounty/gta6-clipper-01
      makefun-camp-buoy-picnic

  The first line is the bounty's required line; the second line is the
  play code. Both must be in the description (the title and the captions
  are never read for them).
- **Tags:** GTA6, GTA, Grand Theft Auto VI, Vice City, Shorts

Then copy the video's address (Share → Copy) and put it in `VIDEO.json`:

    {"url": "https://www.youtube.com/shorts/<id>"}

A `https://www.youtube.com/watch?v=<id>` or `https://youtu.be/<id>`
address passes too. The placeholder in `VIDEO.json` now is no video's
address, so the entry is refused as it stands — that is on purpose.

## The program

`main.ts` (Node 22, standard library only, no network) does two things:
it copies `VIDEO.json` from the repository root to `/output/VIDEO.json`,
where the gate reads it, and it writes `/output/CUT_RECIPE.json`, the
exact recipe of the cut. If the source trailer sits next to the
repository at `assets/trailer2.mp4`, it also re-renders `clip.mp4` with
ffmpeg (via `child_process`) into `/output/`. Run it the way the grader
does:

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

`out/VIDEO.json` is then byte for byte this directory's `VIDEO.json`.
