// ============================================================
// PHOTON PULSE — Drum & Bass Full Arrangement
// Genre: DnB (Dancefloor / Swanky) | Key: E minor | BPM: 174
// Duration: ~4:30 | Structure: 192 bars
//
// Reference artists:
//   Sub Focus — clean reese bass, anthemic leads, filtered builds
//   Cesco/Hamdi — heavy sub, minimal arrangement, swung 2-step
//   "Swing King" — dub-influenced reverb, syncopated bass
//
// Based on audio analysis of real DnB tracks:
//   Sub: 13.6% | Bass: 12.5% | Low-mid: 9.6%
//   Mid: 18% | High-mid: 24.1% | Air: 19.7%
//
// Structure: Intro(32) → Build(16) → Drop(32) → Brkdn(24)
//            → Build2(8) → Drop2(40) → Outro(40)
// ============================================================

setcpm(174/4)
// 1 cycle = 1 beat at 174 BPM
// 1 bar = 4 cycles
// 8 bars = 32 cycles

// ─── SECTION HELPERS ───────────────────────────────────────

// DnB 2-Step Kick (on 1)
const dnbKick = (gain_val = 1) =>
  note("0").sound("bd808").gain(gain_val)

// DnB Snare (on 3, with reverb for that Cesco dub feel)
const dnbSnare = (gain_val = .8, room_val = .3) =>
  note("0 2").sound("sd").gain(gain_val).room(room_val)

// Hi-hats 8th notes (constant pulse)
const dnbHH = (gain_val = .4) =>
  note("[0 0 0 0]*2").sound("hhc").gain(gain_val).hcutoff(8000)

// Open hat / ride off-beats
const dnbOH = (gain_val = .25) =>
  note("0 2 0 2").sound("hho").gain(gain_val)

// Ghost snares (Sub Focus style — fills the gaps)
const ghostSnare = (gain_val = .25) =>
  note("0 2 ~ ~ 2 2 0 ~").sound("sd").gain(gain_val)

// ─── BASS — The defining element ───────────────────────────

// Reese Bass (Sub Focus style): detuned saws, LFO filter
const reeseBass = (notes, gain_val = .5) =>
  note(notes).scale("E3:minor")
    .sound("sawtooth").noise(.15)
    .cutoff(saw.range(400, 1200).slow(4))
    .resonance(.4).lpenv(3).lpd(.15).lpa(.02)
    .shape(.3).room(.3).gain(gain_val)

// Heavy Sub (Cesco/Hamdi style): pure sine, minimal
const heavySub = (notes, gain_val = .55) =>
  note(notes).scale("E2:minor")
    .sound("sine").lpf(120)
    .gain(gain_val)

// Swanky Bass (syncopated, Cesco/Hamdi style)
const swankyBass = (notes, gain_val = .6) =>
  note(notes).scale("E3:minor")
    .sound("sawtooth").shape(.6).crush(6)
    .cutoff(600).resonance(.6).room(.5)
    .gain(gain_val)

// ─── PADS & LEADS ─────────────────────────────────────────

// Atmospheric pad (breakdowns)
const pad = (gain_val = .2) =>
  note("[e3 g3 b3 d4]/4")
    .sound("sawtooth").lpf(800).lpa(1.5)
    .adsr(2, .5, .7, 3).room(1).roomsize(6)
    .gain(gain_val)

// Sub Focus anthemic lead
const lead = (notes, gain_val = .3) =>
  note(notes).scale("E4:minor")
    .sound("square").cutoff(3000).resonance(.3)
    .delay(.375).delayfeedback(.2).room(.4)
    .gain(gain_val)

// ─── FX ───────────────────────────────────────────────────

// Filtered noise riser
const riser = (gain_val_start = 0, gain_val_end = .08) =>
  note("0").sound("noise")
    .gain(saw.range(gain_val_start, gain_val_end).slow(16))
    .cutoff(saw.range(200, 16000).slow(16))

// ─── ARRANGEMENT ──────────────────────────────────────────

// INTRO (bars 1-32): Drums alone, filtered, minimal
$: arrange(
  [128, stack(  // 32 bars × 4 beats
    dnbKick(.6).hcutoff(2000),          // filtered kick
    dnbSnare(.5).hcutoff(3000),         // filtered snare
    dnbHH(.25).hcutoff(6000),           // quiet hats
    // Sub Focus classic: intro with just drums
    note("~ ~ ~ ~ ~ ~ ~ ~").sound("noise")
      .gain(.02).cutoff(1000).resonance(.2)
  )]
)

// BUILD 1 (bars 33-48): Elements enter gradually
$: arrange(
  [64, stack(  // 16 bars
    dnbKick(.8), dnbSnare(.65), dnbHH(.35), dnbOH(.2),
    // Reese enters, filtered low
    reeseBass("<0 ~ ~ ~ 3 ~ 7 ~ 5 ~ 3 ~ 0 ~ -3 ~ 5>", .35)
      .lpf(saw.range(300, 600).slow(16)),
    // Snare rolls (Sub Focus build signature)
    note("[~ ~ ~ ~] [~ ~ ~ ~] [~ ~ ~ ~] [0 0 0 0]")
      .sound("sd").gain(.3).room(.3),
    // Riser begins
    riser(0, .05)
  )]
)

// DROP 1 (bars 49-80): Full energy — 32 bars
$: arrange(
  [128, stack(  // 32 bars
    dnbKick(1), dnbSnare(.85, .35), dnbHH(.45),
    dnbOH(.28), ghostSnare(.3),
    // Sub Focus style: walking reese
    reeseBass("<0 ~ ~ ~ 3 ~ 7 ~ 5 ~ 3 ~ 0 ~ -3 ~ 5>", .6),
    // Cesco style: heavy sub on root
    heavySub("<0 0 0 0 0 0 0 0 3 3 3 3 3 3 3 3 7 7 7 7 7 7 7 7 5 5 5 5 5 5 5 5>".slow(2), .5),
    // Lead hook (Sub Focus anthemic)
    lead("<0 ~ 7 ~ 3 ~ 10 ~ 0 ~ 5 ~ 7 ~ 5 ~>".slow(2), .25),
    // Pad stab
    note("[e3 g3 b3] ~ [~ ~] [~ ~]")
      .sound("sawtooth").gain(.15).cutoff(4000).attack(.01).release(.15)
  )]
)

// BREAKDOWN (bars 81-104): Emotional, stripped — 24 bars
$: arrange(
  [96, stack(  // 24 bars
    // No drums — just atmosphere
    pad(.25),
    // Heavily filtered bass drone
    reeseBass("0 ~~~ 3 ~~~ 7 ~~~ 5 ~~~", .2)
      .lpf(300).room(.9).roomfade(6),
    // Subtle hi-hats swirling
    note("[0 0 0 0]*2").sound("hhc").gain(.1).hcutoff(2000)
      .delay(.5).delayfeedback(.4).room(.8),
    // Ambient noise
    note("0").sound("noise").gain(.02).room(.9).roomfade(8)
      .delay(.5).delayfeedback(.6)
  )]
)

// BUILD 2 (bars 105-112): Quick, 8 bars — tension
$: arrange(
  [32, stack(  // 8 bars
    dnbKick(.7).hcutoff(4000),
    dnbHH(.3).hcutoff(8000),
    // Fast filter sweep
    reeseBass("<0 ~ 3 ~ 7 ~ 5 ~>", .4)
      .cutoff(saw.range(400, 1600).fast(2).slow(16)),
    // Aggressive riser
    riser(.03, .1),
    // Snare acceleration (Sub Focus classic)
    note("[~ ~ ~ ~] [~ ~ ~ ~] [0 0 ~ ~] [0 0 0 0]")
      .sound("sd").gain(.4).room(.3)
  )]
)

// DROP 2 (bars 113-152): Extended, with Cesco/Hamdi swing — 40 bars
$: arrange(
  [160, stack(  // 40 bars
    dnbKick(1), dnbSnare(.9, .4), dnbHH(.45), dnbOH(.3),
    ghostSnare(.35),
    // Main reese continues
    reeseBass("<0 ~ ~ ~ 3 ~ 7 ~ 5 ~ 3 ~ 0 ~ -3 ~ 5>", .6),
    // Swanky bass variation — syncopated, heavier
    swankyBass("<[0 ~ 0 ~ ~ ~ 0 ~] [3 ~ ~ ~ 0 ~ 7 ~]>".slow(2), .5),
    // Lead variation
    lead("<0 ~ 10 ~ 7 ~ 5 ~ 3 ~ 0 ~ 10 ~ 7 ~ 5>".slow(2), .3),
    // Pad
    pad(.15),
    // Extra percussion layer (Cesco style)
    note("[~ ~ 0 ~] [0 ~ ~ ~] [~ 0 0 ~] [~ ~ 0 0]")
      .sound("toms").gain(.3).hcutoff(400)
  )]
)

// OUTRO (bars 153-192): Strip back, fade — 40 bars
$: arrange(
  [160, stack(  // 40 bars
    dnbKick(saw.range(.7, 0).slow(40)),
    dnbHH(saw.range(.35, 0).slow(40)),
    dnbSnare(saw.range(.6, 0).slow(32)),
    // Bass fades with increasing delay
    reeseBass("<0 ~ 3 ~ 7 ~ 5 ~>", saw.range(.4, 0).slow(48))
      .delay(saw.range(.25, .75).slow(48))
      .delayfeedback(saw.range(.2, .8).slow(48)),
    pad(saw.range(.2, 0).slow(40))
  )]
)

// ─── ALTERNATIVE: Test just a section ─────────────────────
// $: drop2()
