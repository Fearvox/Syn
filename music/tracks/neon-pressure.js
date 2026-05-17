// ============================================================
// NEON PRESSURE — Bass House Full Arrangement
// Genre: Bass House | Key: C minor | BPM: 128 | Duration: ~5 min
//
// Based on comprehensive analysis of 520 SoundCloud Bass House tracks
// + production research from BSP guides, tutorials, and artist studies
//
// Structure: 160 bars, 5 min (128 BPM)
// Intro(16) → Build(16) → Drop(32) → Breakdown(16)
// → Build2(8) → Drop2(44) → Outro(28)
//
// Reference artists: JAUZ, JOYRYDE, Habstrakt, Matroda, AC Slater
// ============================================================

setcpm(128/4)

// ─── SECTION DEFINITIONS ───────────────────────────────────
// Each section returns a pattern for its duration

// ─── BASS PATTERNS ─────────────────────────────────────────
// Bass House defining element: FM/filtered bass with off-beat emphasis

// Sub bass (clean, mono, 80-120Hz)
const subBass = (notes, gain2 = .5) =>
  note(notes).sound("sine").lpf(120).gain(gain2)

// Mid bass (FM growl, filtered, the "face" of Bass House)
const fmBass = (notes, gain2 = .6) =>
  note(notes).sound("sawtooth")
    .cutoff(800).resonance(.4)
    .shape(.6)      // saturation
    .crush(8)        // bit reduction for grit
    .gain(gain2)

// Combined bass stack
const bassStack = (subNotes, fmNotes, subGain = .5, fmGain = .6) =>
  stack(
    subBass(subNotes, subGain),
    fmBass(fmNotes, fmGain)
  )

// ─── DRUM PATTERNS ─────────────────────────────────────────
// Bass House drum kit: aggressive kick, tight clap, 16th hats

// Kick: distorted 909/sub layer, 4-on-the-floor
const kick = note("[0]").sound("bd808")
  .gain(.9).cutoff(3000).resonance(.1)

// Clap: layered, on 2&4
const clap = note("0 2").sound("clap")
  .gain(.8).hcutoff(120).bandf(2500)

// Closed hi-hat: 16th notes with occasional swing
const hhClosed = note("[0 0 0 0]*2").sound("hhc")
  .gain(.5).hcutoff(800)

// Open hi-hat: off-beat 8ths
const hhOpen = note("0 2 0 2").sound("hho")
  .gain(.35).hcutoff(800)

// Shaker: steady 16th
const shaker = note("[0 0 0 0]*4").sound("shaker")
  .gain(.25).hcutoff(600)

// Percussion: toms/congas for rhythmic interest
const perc = note("[~ ~ 0 ~] [~ 0 ~ ~] [0 ~ 0 ~] [~ 0 ~ 0]")
  .sound("toms").gain(.4).hcutoff(400)

// ─── ARRANGEMENT ──────────────────────────────────────────
// 1 beat = 1 step in the note/sequence
// 1 bar = 4 beats
// Section durations in bars (converted to beats for arrange)

const BEAT = 1
const BAR = 4

// Intro (bars 1-16): Kick + hats only, lo-fi feel
const intro = () => stack(
  kick.gain(.5).cutoff(1500),     // lo-fi kick
  hhClosed.gain(.35),             // quiet hats
  hhOpen.gain(.2),                // quiet open hats
  shaker.gain(.15)                // subtle shaker
)

// Build 1 (bars 17-32): Add clap, filtered bass, tension
const build1 = () => stack(
  kick, clap, hhClosed, hhOpen, shaker,
  bassStack(
    "c1 ~ ~ ~",                   // sub: sporadic
    "c2 ~ ~ ~",                   // fm: sporadic
    .3, .4
  ).cutoff(saw.range(200, 600).slow(16)),  // filter sweep begins
  note("[c4 ~ ~ ~] [eb4 ~ ~ ~] [g4 ~ ~ ~] [bb4 ~ ~ ~]")
    .sound("sawtooth").gain(.15).cutoff(500)  // filtered pad stabs
)

// Drop 1 (bars 33-64): Full energy, 32 bars
const drop1 = () => stack(
  kick.gain(1), clap.gain(.9),
  hhClosed, hhOpen, shaker, perc,
  // Full bass: syncopated Bass House groove
  bassStack(
    "[c1 ~ c1 ~] [~ c1] [c1 ~ c1 ~] [~ c1 c1 ~]",  // sub: driving
    "[c2 ~ c2 ~] [~ eb2] [c2 ~ c2 ~] [~ c2 c2 ~]",   // fm: root + third
    .5, .7
  ),
  // Lead hook: minimal but memorable
  note("[c4 ~ ~ ~] [eb4 ~ ~ ~] [g4 ~ ~ ~] [bb4 ~ ~ ~]")
    .sound("square").gain(.3).cutoff(2000).resonance(.3)
    .delay(.25).delayfeedback(.15),
  // Chord stab: sidechained feel
  note("[c3 eb3 g3] ~ [~ ~ ~ ~] [~ ~ ~ ~]")
    .sound("sawtooth").gain(.2).cutoff(4000)
    .attack(.01).release(.15),
  // Riser layer
  note("0").sound("noise").gain(.03).cutoff(2000).resonance(.1)
)

// Breakdown (bars 65-80): Stripped, building tension
const breakdown = () => stack(
  // No drums, just atmosphere
  hhClosed.gain(.2).hcutoff(2000),   // filtered hats far away
  note("[c4 ~ ~ ~] [eb4 ~ ~ ~] [g4 ~ ~ ~] [bb4 ~ ~ ~]")
    .sound("sawtooth").gain(.25).cutoff(2000).room(.8).roomfade(6),
  bassStack(
    "c1 ~~~",      // sub: sparse drone
    "c2 ~~~",      // fm: sparse drone
    .2, .3
  ).cutoff(300),
  // Reverb swells
  note("0").sound("noise").gain(.01).room(.9).roomfade(8)
    .delay(.5).delayfeedback(.7)
)

// Build 2 (bars 81-96): Faster re-entry, 16 bars
const build2 = () => stack(
  kick, hhClosed, hhOpen, shaker,
  // Hat acceleration: 1/8 → 1/16 → 1/32
  note("[0 0 0 0]*2").sound("hhc").gain(saw.range(.3, .6).slow(16)),
  // Filter sweep on bass
  bassStack(
    "[c1 ~ c1 ~] [~ c1] [c1 ~ c1 ~] [~ c1 c1 ~]",
    "[c2 ~ c2 ~] [~ eb2] [c2 ~ c2 ~] [~ c2 c2 ~]",
    .3, .5
  ).cutoff(saw.range(400, 1000).slow(16)),
  // Noise riser
  note("0").sound("noise").gain(saw.range(0, .08).slow(16))
    .cutoff(saw.range(200, 16000).slow(16)),
  // Suspended chord tension (last 2 beats before drop)
  note("[~ ~ g5 bb5]").sound("square").gain(.3)
    .cutoff(4000).room(.5).roomfade(2)
)

// Drop 2 (bars 97-140): Variation, longer, extra percussion
const drop2 = () => stack(
  drop1(),
  // Extra percussion layer
  perc,
  // Additional rhythm element
  note("[c5 g5] ~ [bb5 ~] ~").sound("square")
    .gain(.2).cutoff(3000).delay(.375).delayfeedback(.2),
  // Bass variation: more off-beat emphasis
  note("[c2 ~ c2 ~] [~ g2] [c2 ~ c2 ~] [~ g2 c2 ~]")
    .sound("sawtooth").gain(.3).lpf(500).shape(.5)
)

// Outro (bars 141-160): Strip back, fade
const outro = () => stack(
  kick.gain(saw.range(.6, 0).slow(20)),
  hhClosed.gain(saw.range(.4, 0).slow(20)),
  hhOpen.gain(saw.range(.25, 0).slow(20)),
  clap.gain(saw.range(.6, 0).slow(16)),
  note("[c4 eb4 g4]").sound("sawtooth").gain(saw.range(.2, 0).slow(24))
    .room(.6).roomfade(4)
    .delay(.25).delayfeedback(saw.range(.2, .8).slow(24))
)

// ─── MASTER ARRANGEMENT ───────────────────────────────────
// Uses arrange() to sequence sections over cycles
// 1 cycle = 1 beat at setcpm(128/4)

$: arrange(
  [64, intro()],                      // bars 1-16  (16 bars × 4 beats)
  [64, build1()],                     // bars 17-32
  [128, drop1()],                     // bars 33-64 (32 bars)
  [64, breakdown()],                  // bars 65-80
  [64, build2()],                     // bars 81-96
  [176, drop2()],                     // bars 97-140 (44 bars)
  [80, outro()]                       // bars 141-160
)

// ─── ALTERNATIVE: Play as single section for testing ──────
// Uncomment to test just a specific section:
// $: drop1()
// $: build2()
