// ============================================================
// BINARY RAIN — Full Arrangement
// Genre: Breakbeat / Liquid DnB / Bass House hybrid
// Key: C minor | BPM: 140 | Duration: ~7 minutes
//
// Structure: Intro → Build → Drop A → Breakdown → Drop B → Outro
// Inspired by: Calibre, Four Tet, Bicep, Spectrasoul
// ============================================================

setcpm(140/4)

// ─── SECTION DEFINITIONS ───────────────────────────────────
// Each section is a pattern function that returns silence or sound
// arrange() sequences them over specified cycle counts

// Total: 256 cycles at 35 cpm ≈ 7m20s

// ─── TRACK 1: SUB BASS ─────────────────────────────────────
// Deep, clean sub — the foundation. DnB/bass house essential.
$: arrange(
  [32, silence],                                                    // Intro: no sub
  [32, note("c1 ~ ~ ~").sound("sine").lpf(120).gain(.5)],          // Build: sparse sub pulses
  [64, note("[c1 ~ c1 ~] [~ c1] [c1 ~ c1 ~] [~ c1 c1 ~]")        // Drop A: driving sub pattern
       .sound("sine").lpf(120).gain(.6)
       .sometimes(x => x.note("eb1"))],
  [32, note("c1 ~ ~ ~ ~ ~ ~ ~").sound("sine").lpf(100)            // Breakdown: minimal sub
       .gain(sine.range(.2, .5).slow(8))],
  [64, note("[c1 ~ c1 c1] [~ c1 ~ c1] [c1 c1 ~ c1] [~ c1 c1 ~]") // Drop B: busier sub
       .sound("sine").lpf(130).gain(.6)
       .sometimes(x => x.note("bb1"))
       .sometimesBy(.2, x => x.note("g1"))],
  [32, note("c1 ~ ~ ~").sound("sine").lpf(100)                     // Outro: fading sub
       .gain(sine.range(.1, .4).slow(16))]
)

// ─── TRACK 2: REESE BASS (the "Binary Rain" character) ──────
// Detuned saws with Perlin filter — dark, evolving, cinematic
$: arrange(
  [32, note("<[c2 ~](3,8)*2, eb, g, bb, d>")                      // Intro: filtered, distant
       .sound("sawtooth").noise(0.3)
       .lpf(perlin.range(300, 600).mul(0.4))
       .lpenv(perlin.range(1, 3)).lpa(.25).lpd(.1).lps(0)
       .vib("4:.15").room(1.2).roomsize(6)
       .gain(.25).slow(4)],
  [32, note("<[c2 ~](3,8)*2, eb, g, bb, d>")                      // Build: filter opens
       .sound("sawtooth").noise(0.3)
       .lpf(perlin.range(600, 1400).mul(0.6))
       .lpenv(perlin.range(1, 5)).lpa(.25).lpd(.1).lps(0)
       .vib("4:.2").room(1).roomsize(4)
       .gain(.4).slow(4)],
  [64, note("<[c2 ~](3,8)*2, eb, g, bb, d>")                      // Drop A: FULL — original Binary Rain bass
       .sound("sawtooth").noise(0.3)
       .lpf(perlin.range(800, 2000).mul(0.6))
       .lpenv(perlin.range(1, 5)).lpa(.25).lpd(.1).lps(0)
       .vib("4:.2").room(1).roomsize(4)
       .gain(.55).slow(4)],
  [32, note("c2 ~ bb1 ~ g1 ~ eb2 ~")                               // Breakdown: sustained notes
       .sound("sawtooth").noise(0.15)
       .lpf(600).lpa(.5).lps(.6).lpd(.3)
       .room(1.5).roomsize(8).vib("2:.3")
       .gain(sine.range(.2, .45).slow(8))
       .slow(2)],
  [64, note("<[c2 ~](3,8)*2, eb, g, bb, d>")                      // Drop B: evolved — add octave layer
       .sound("sawtooth").noise(0.3)
       .lpf(perlin.range(600, 1800).mul(0.7))
       .lpenv(perlin.range(2, 6)).lpa(.2).lpd(.08).lps(0)
       .vib("4:.25").room(.8).roomsize(3)
       .superimpose(x => x.add(note(12)).gain(.2).lpf(3000))
       .gain(.5).slow(4)],
  [32, note("<[c2 ~](3,8)*2, eb, g, bb, d>")                      // Outro: closing filter
       .sound("sawtooth").noise(0.3)
       .lpf(perlin.range(200, 500).mul(0.3))
       .lpenv(perlin.range(1, 2)).lpa(.3).lpd(.15).lps(0)
       .vib("4:.15").room(1.5).roomsize(8)
       .gain(sine.range(.15, .35).slow(16)).slow(4)]
)

// ─── TRACK 3: DRUMS ─────────────────────────────────────────
// Breakbeat core + kick layers — DnB meets breakbeat
$: arrange(
  [32, silence],                                                    // Intro: no drums
  [32, stack(                                                       // Build: kick enters, simple
    s("bd ~ ~ ~ bd ~ ~ ~").gain(.4),
    s("hh*4").degradeBy(.6).gain(.15).hpf(8000)
  ).bank('RolandTR909')],
  [64, stack(                                                       // Drop A: FULL drums — original Binary Rain
    s("bd").late("<0.01 .251>"),
    s("breaks165:1/2").fit().chop(4)
      .sometimesBy(.4, ply("2"))
      .sometimesBy(.1, ply("4"))
      .release(.01).gain(1.5)
      .sometimes(mul(speed("1.05"))).cut(1),
    s("<whirl attack>?").delay(".8:.1:.8").room(2).slow(8).cut(2)
  ).reset("<x@30 [x*[8 [8 [16 32]]]]@2>".late(2))],
  [32, stack(                                                       // Breakdown: sparse, distant
    s("~ rim ~ <rim rim:1>").room(1.2).gain(.2),
    s("hh*2").degradeBy(.7).gain(.1).hpf(9000)
  )],
  [64, stack(                                                       // Drop B: evolved — add hi-hat layer
    s("bd").late("<0.01 .251>"),
    s("breaks165:1/2").fit().chop(4)
      .sometimesBy(.5, ply("2"))
      .sometimesBy(.15, ply("4"))
      .release(.01).gain(1.6)
      .sometimes(mul(speed("1.05"))).cut(1),
    s("<whirl attack>?").delay(".8:.1:.8").room(2).slow(8).cut(2),
    s("hh*8").gain(sine.range(.1, .35)).clip(.5)                   // NEW: hi-hats
      .sometimes(x => x.speed("2"))
      .mask("<0 1 1 0>/16"),
    s("sd ~ sd ~").bank('RolandTR909').gain(.3).room(.5)           // NEW: snare backbeat
  ).reset("<x@30 [x*[8 [8 [16 32]]]]@2>".late(2))],
  [32, stack(                                                       // Outro: fading drums
    s("bd ~ ~ ~ ~ ~ ~ ~").gain(sine.range(.1, .3).slow(8)),
    s("hh*4").degradeBy(.8).gain(.08).hpf(9000)
  )]
)

// ─── TRACK 4: MELODY ────────────────────────────────────────
// CmMaj7 arpeggio — the "rain" character
$: arrange(
  [32, n("<0 4 7 11>".slow(2))                                     // Intro: melody present, soft
       .scale("C4:minor").sound("triangle")
       .degradeBy(.5).room(.9)
       .gain(sine.range(.05, .2).slow(6))],
  [32, n("<0 4 7 11>".slow(2))                                     // Build: melody gains presence
       .scale("C4:minor").sound("triangle")
       .degradeBy(.4).room(.9)
       .gain(sine.range(.1, .3).slow(4))],
  [64, n("<0 4 7 11>".slow(2))                                     // Drop A: original melody
       .scale("C4:minor").sound("triangle")
       .degradeBy(.3).room(.9)
       .gain(sine.range(.1, .4).slow(4))],
  [32, n("<0 4 7 11 14 11 7 4>".slow(2))                           // Breakdown: extended melody, no degrade
       .scale("C4:minor").sound("triangle")
       .room(1.2).delay(.375).delayt(.3).delayfb(.5)
       .gain(sine.range(.15, .45).slow(8))],
  [64, n("<0 4 7 11>".slow(2))                                     // Drop B: melody with octave doubling
       .scale("C4:minor").sound("triangle")
       .degradeBy(.2).room(.9)
       .superimpose(x => x.n(12).gain(.15).sound("sine"))
       .gain(sine.range(.1, .45).slow(4))],
  [32, n("<0 4 7 11>".slow(2))                                     // Outro: degrading melody
       .scale("C4:minor").sound("triangle")
       .degradeBy(.6).room(1.2).roomsize(8)
       .gain(sine.range(.03, .15).slow(12))]
)

// ─── TRACK 5: ATMOSPHERIC PAD ───────────────────────────────
// Warm Cm pad — adds harmonic body (deep house influence)
$: arrange(
  [32, note("<c3 eb3 g3 bb3>/4")                                    // Intro: pad enters first
       .sound("sawtooth").lpf(500).lpa(1.5).adsr(1.5,.5,.7,2)
       .room(1).roomsize(6).gain(.12)],
  [32, note("<c3 eb3 g3 bb3>/4")                                    // Build: pad opens
       .sound("sawtooth").lpf(700).lpa(1).adsr(1,.5,.8,2)
       .room(.8).roomsize(4).gain(.18)],
  [64, note("<c3 eb3 g3 bb3>/4")                                    // Drop A: pad in background
       .sound("sawtooth").lpf(600).lpa(1).adsr(1,.3,.6,1.5)
       .room(.6).roomsize(3).gain(.1)
       .lpf(sine.range(400, 800).slow(16))],
  [32, note("<c3 eb3 g3 bb3>/4")                                    // Breakdown: pad prominent
       .sound("sawtooth").lpf(900).lpa(2).adsr(2,.5,.8,3)
       .room(1.2).roomsize(8).gain(.25)
       .lpf(sine.range(300, 1000).slow(12))],
  [64, note("<c3 eb3 g3 bb3>/4")                                    // Drop B: pad with movement
       .sound("sawtooth").lpf(700).lpa(1).adsr(1,.3,.7,1.5)
       .room(.6).roomsize(3).gain(.12)
       .lpf(sine.range(400, 900).slow(8))
       .pan(sine.range(.3, .7).slow(6))],
  [32, note("<c3 eb3 g3 bb3>/4")                                    // Outro: pad fades slowly
       .sound("sawtooth").lpf(400).lpa(2).adsr(2,1,.5,4)
       .room(1.5).roomsize(10).gain(sine.range(.05, .15).slow(16))]
)

// ─── TRACK 6: TEXTURE / FX ──────────────────────────────────
// Risers, impacts, atmospheric sweeps — production polish
$: arrange(
  [32, silence],                                                    // Intro: clean
  [32, sound("wind").slow(16)                                       // Build: rising tension
       .lpf(sine.range(400, 3000).slow(16))
       .gain(sine.range(0, .15).slow(16))
       .room(1)],
  [64, stack(                                                       // Drop A: occasional texture hits
    s("<whirl attack>?").delay(".8:.1:.8").room(2).slow(16).cut(3),
    s("wind").slow(32).lpf(2000).gain(.05).room(1)
  )],
  [32, stack(                                                       // Breakdown: heavy atmosphere
    s("wind").slow(8).lpf(sine.range(800, 4000).slow(8))
      .gain(sine.range(.05, .2).slow(4)).room(1.5),
    note("c5").sound("sine").gain(sine.range(0, .06).slow(16))
      .pan(saw.slow(8)).room(1)
  )],
  [64, stack(                                                       // Drop B: sparse texture
    s("<whirl attack>?").delay(".8:.1:.8").room(2).slow(16).cut(3),
    s("wind").slow(32).lpf(1500).gain(.04).room(1)
  )],
  [32, stack(                                                       // Outro: long tail
    s("wind").slow(4).lpf(sine.range(200, 1500).slow(16))
      .gain(sine.range(.1, .3).slow(8)).room(2).roomsize(10),
    s("<whirl attack>").delay(".9:.2:.9").room(3).slow(4).cut(3)
      .gain(.15)
  )]
)
