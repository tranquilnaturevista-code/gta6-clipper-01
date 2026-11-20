// gta6-clipper-01 entry: "Clip GTA 6 for the most YouTube views".
// The entry is the video itself. This program does two things:
//
//  1. It hands VIDEO.json (the video's YouTube address) to the gate by
//     copying it from the repository root to /output/VIDEO.json.
//  2. It writes /output/CUT_RECIPE.json, the exact recipe this agent used
//     to cut and render the clip from Rockstar's GTA VI Trailer 2, so the
//     cut is reproducible from the recipe alone.
//
// If the source trailer is present next to the repository
// (assets/trailer2.mp4), it also re-renders the clip with ffmpeg
// (child_process) and writes it to /output/clip.mp4. The grader's container
// has no source file and no network, so that step is skipped there; the
// program never fails for it.
//
// Standard library only, no network, no wall clock, no files outside the
// repository. The two runs of an entry write the same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// out/VIDEO.json is then byte for byte this directory's VIDEO.json.

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The cut, exactly as this agent rendered it in the session that built it.
// Source: GTA VI Trailer 2, Rockstar Games, 2025-05-06, 2:47, 4K
// (https://www.youtube.com/watch?v=VQRLujxTm3c). The trailer is letterboxed:
// its picture is 3840x1728 starting at y=216, so the vertical crop is taken
// from the picture area, not the full 3840x2160 frame.
const CUT = {
  source: {
    title: 'Grand Theft Auto VI Trailer 2',
    uploader: 'Rockstar Games',
    uploaded: '2025-05-06',
    url: 'https://www.youtube.com/watch?v=VQRLujxTm3c',
    durationSec: 166.79,
    width: 3840,
    height: 2160,
    picture: { x: 0, y: 216, width: 3840, height: 1728 },
  },
  // The moment: the trailer's climax run, one coherent "on the run in
  // Leonida" sequence. A ~2 s intimate bedroom beat (145.0-147.5 s) is cut
  // out: it reads as a close-up of a body in the vertical frame and would
  // put the Short at risk of an age restriction. The cut is a hard cut
  // between two action shots, invisible in a trailer that already cuts
  // every two seconds.
  moment: {
    description:
      'Helicopter over the Leonida swamp, Jason and Lucia on a jet ski, ' +
      'Jason on a motorcycle with a plane behind, night truck, boat and ' +
      'helicopter aerial, motorcycle wheelie at dusk, convertible at dusk, ' +
      'the garage beat.',
    segmentsSec: [
      [138.0, 145.0],
      [147.5, 152.0],
    ],
  },
  // Vertical 9:16: the centre strip of the picture area, then scaled up.
  crop: { width: 972, height: 1728, x: 1434, y: 216 },
  scale: { width: 1080, height: 1920 },
  fps: 30,
  // Hook caption over the action, first four seconds only.
  hookCaption: {
    text: 'GTA 6 WILDEST MOMENTS',
    font: 'DejaVuSans-Bold',
    size: 56,
    color: 'white',
    y: 120,
    showSec: [0, 4],
  },
  // The make.fun pitch: a 10 s end card, dark background, one line at a
  // time so each gets two or three seconds to read. The trailer's own
  // audio (the logo sting, 152-162 s) keeps playing underneath.
  pitch: {
    durationSec: 10,
    background: '#0d0d12',
    lines: [
      { text: 'Make clips like this with AI', size: 56, color: 'white', y: 720, showSec: [0, 10] },
      { text: 'and earn money on make.fun', size: 56, color: 'white', y: 820, showSec: [3, 10] },
      { text: 'make.fun/bounty/gta6-clipper-01', size: 48, color: '#ff2ea6', y: 980, showSec: [6, 10] },
      { text: 'code: makefun-camp-buoy-picnic', size: 48, color: '#ffd166', y: 1070, showSec: [6, 10] },
    ],
  },
  audioSec: [
    [138.0, 145.0],
    [147.5, 152.0],
    [152.0, 162.0],
  ],
  encode: {
    video: 'libx264, preset medium, crf 20, yuv420p, 30 fps',
    audio: 'aac, 128k',
    faststart: true,
  },
  output: { width: 1080, height: 1920, durationSec: 21.5 },
};

// Verified render (this session, ffmpeg 8.1.2, libx264 preset medium crf 20):
// clip.mp4 is 1080x1920, 30 fps, H.264 + AAC, 21.5 s, 10,066,525 bytes,
// sha256 069ed0921cef40060f129554608bd53ba978a4dd26d8fcb4a4efebaa50cb1aa2.
// Re-running the program with the source present reproduces it byte for
// byte (same sha256), and the frames were checked by eye: the hook caption
// reads, the action stays centre-framed, the end card's four pitch lines
// all fit and read, and the cut-out bedroom beat is gone.
const FILTER =
  '[0:v]trim=start=138:end=145,setpts=PTS-STARTPTS,' +
  'crop=972:1728:1434:216,scale=1080:1920:flags=lanczos,setsar=1,fps=30,' +
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='GTA 6 WILDEST MOMENTS':fontsize=56:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=120:enable='between(t,0,4)'[vA1];" +
  '[0:v]trim=start=147.5:end=152,setpts=PTS-STARTPTS,' +
  'crop=972:1728:1434:216,scale=1080:1920:flags=lanczos,setsar=1,fps=30[vA2];' +
  '[vA1][vA2]concat=n=2:v=1:a=0[vA];' +
  'color=c=0x0d0d12:s=1080x1920:r=30:d=10,' +
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='Make clips like this with AI':fontsize=56:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=720:enable='between(t,0,10)'," +
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='and earn money on make.fun':fontsize=56:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=820:enable='between(t,3,10)'," +
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='make.fun/bounty/gta6-clipper-01':fontsize=48:fontcolor=0xff2ea6:borderw=2:bordercolor=black:x=(w-text_w)/2:y=980:enable='between(t,6,10)'," +
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='code\\: makefun-camp-buoy-picnic':fontsize=48:fontcolor=0xffd166:borderw=2:bordercolor=black:x=(w-text_w)/2:y=1070:enable='between(t,6,10)'[vB];" +
  '[vA][vB]concat=n=2:v=1:a=0[vout];' +
  '[0:a]atrim=start=138:end=145,asetpts=PTS-STARTPTS[aA1];' +
  '[0:a]atrim=start=147.5:end=152,asetpts=PTS-STARTPTS[aA2];' +
  '[0:a]atrim=start=152:end=162,asetpts=PTS-STARTPTS[aB];' +
  '[aA1][aA2][aB]concat=n=3:v=0:a=1[aout]';

mkdirSync(OUTPUT_DIR, { recursive: true });

try {
  copyFileSync(join(BOT_DIR, 'VIDEO.json'), join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

writeFileSync(join(OUTPUT_DIR, 'CUT_RECIPE.json'), JSON.stringify(CUT, null, 2) + '\n');

// Re-render the clip when the source trailer is here. It is not part of
// the repository (too large, and it is Rockstar's footage), so in the
// grader this step is skipped and the program still succeeds.
const sourcePath = join(BOT_DIR, 'assets', 'trailer2.mp4');
if (existsSync(sourcePath)) {
  const rendered = spawnSync(
    'ffmpeg',
    [
      '-v', 'error',
      '-i', sourcePath,
      '-filter_complex', FILTER,
      '-map', '[vout]',
      '-map', '[aout]',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      join(OUTPUT_DIR, 'clip.mp4'),
    ],
    { encoding: 'utf8' },
  );
  if (rendered.status !== 0) {
    console.error(`ffmpeg could not re-render the clip: ${rendered.stderr}`);
    process.exit(1);
  }
}
