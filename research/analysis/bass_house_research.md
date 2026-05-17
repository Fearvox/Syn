# Bass House Music Structure & Arrangement: Comprehensive Research Summary

> Compiled for Strudel (JavaScript TidalCycles port) code pattern generation.
> Sources: Wikipedia, BSP Production Guides, industry tutorials, production forums.

---

## 1. BPM Range

| Genre | BPM Range | Typical BPM |
|-------|-----------|-------------|
| **Bass House** | **124–130** | **128** |
| Regular House | 118–128 | 124–126 |
| Deep House | 118–124 | 120–122 |
| Tech House | 124–132 | 126–128 |
| Electro House | 125–132 | 128–130 |

**Bass House sits at 126–130 BPM**, with 128 BPM being the most common. This is slightly faster than traditional house (124–126) but not as aggressive as electro house (130+).

---

## 2. Typical Arrangement Structure

### Full Track Map (5-minute DJ-friendly version, ~128 BPM)

| Section | Bars | Time (approx) | Energy (1–10) |
|---------|------|---------------|---------------|
| Intro A | 1–16 (16 bars) | 0:00–0:30 | 2–3 |
| Intro B | 17–32 (16 bars) | 0:30–1:00 | 4 |
| Build 1 | 33–48 (16 bars) | 1:00–1:30 | 5→8 |
| Drop 1 | 49–80 (32 bars) | 1:30–2:30 | 10 |
| Breakdown | 81–96 (16 bars) | 2:30–3:00 | 5→3 |
| Build 2 | 97–112 (16 bars) | 3:00–3:30 | 5→9 |
| Drop 2 | 113–144 (32 bars) | 3:30–4:30 | 10 |
| Outro | 145–160 (16 bars) | 4:30–5:00 | 10→2 |

**Key structural notes for Bass House specifically:**
- **Shorter intros than traditional house** — often 16 bars (not 32) for streaming
- **32-bar drops are standard** — the "full arrangement" hits with bass, leads, percussion
- **Second drop often adds a variation** — new lead melody, extra percussion layer, or vocal hook
- **Streaming version**: 3.5–4.5 min total. **DJ version**: 5–7 min with extended intro/outro.
- **Phrase length**: 8-bar phrases for every structural boundary (standard house convention)

### Strudel-Compatible Section Structure (in beats)

```
// 128 BPM = ~0.469s per beat
// 8 bars = 32 beats
// 16 bars = 64 beats
// 32 bars = 128 beats

// Energy curve over track:
// Intro:  . . . . | . . . . | . . . . | . . . .
// Build:  . . . . | . . x x | x x x x | x x !!
// Drop:   X X X X | X X X X | X X X X | X X X X
// Brkdn:  . . . . | . . . . | . . . . | . . . .
// Build2: . . x x | x x x x | x x x x | x x !!
// Drop2:  X X X X | X X X X | X X X X | X X X X
// Outro:  X X X . | . . . . | . . . . | . . . .
```

---

## 3. Section Characteristics — Element Grid

| Element | Intro A | Intro B | Build 1 | Drop 1 | Breakdown | Build 2 | Drop 2 | Outro |
|---------|---------|---------|---------|--------|-----------|---------|--------|-------|
| Kick (4-on-floor) | ✅ (lo-fi) | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ → fade |
| Hi-hats (8th/16th) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Clap/Snare (2&4) | ❌ | ♻️ (muted) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Shaker / Perc | ❌ | ♻️ | ✅ | ✅ | ❌ | ✅ | ✅ | ♻️ |
| Bass (sub/growl) | ❌ | ♻️ (filtered) | ♻️ | ✅ | ❌ | ♻️ | ✅ | ❌ |
| Chord Pads | ❌ | ❌ | ♻️ (filtered) | ✅ | ✅ (stripped) | ♻️ | ✅ | ❌ |
| Lead Synth | ❌ | ❌ | ❌ | ✅ | ♻️ (melody) | ❌ | ✅ (var) | ❌ |
| FX / Risers | ❌ | ❌ | ✅ (build) | ✅ (hit) | ♻️ (ambient) | ✅ (build) | ✅ (hit) | ❌ |
| Vocal | ❌ | ❌ | ♻️ (pre) | ✅ | ♻️ (chops) | ♻️ | ✅ (var) | ❌ |

**Legend**: ✅ Full/active | ♻️ Partial/filtered/subtle | ❌ Absent

### Element Entry Timeline (16-bar phrases)

```
Bar 1:  Kick (dirty, lo-fi) + hi-hat closed (8th notes)
Bar 9:  + Open hi-hat (off-beats)
Bar 17: + Clap (on 2 & 4) + Bass (filtered low-pass ~300Hz)
Bar 25: + Shaker + Percussion (toms/congas)
Bar 33: + Chord stab/pad (filtered) + Riser begins (white noise HPF sweep)
Bar 41: + Build-up FX + hi-hat acceleration (16th→32nd)
Bar 49: DROP — Full arrangement: kick, bass full, leads, all percussion, sidechain pumping
```

---

## 4. Sound Design Characteristics

### Bass Sound Design (THE defining element of Bass House)

| Bass Type | Oscillator | Filter | Character | Used By |
|-----------|-----------|--------|-----------|---------|
| **FM Bass** | Sine → FM modulation | Low-pass 200–400Hz | Metallic, punchy, aggressive | JAUZ, JOYRYDE, Ephwurd |
| **Reese Bass** | Multiple detuned saws | Low-pass, band-reject | Wide, thick, evolving | Matroda, Tchami |
| **Growl Bass** | Wavetable (Serum) | Band-pass with envelope | Aggressive mid-range bite | Habstrakt, Ghastly |
| **Sub Bass** | Pure sine + triangle | Low-pass 120Hz | Felt, not heard; club weight | All artists |
| **Distorted Bass** | Square + saw, overdriven | Low-pass + distortion | Dubstep-influenced, gritty | AC Slater, Jack Beats |

**FM Bass Construction (typical Serum patch):**
```
OSC A: Sine → FM from B (routing A>B)
OSC B: Sine, envelope pitch bend: start +5 semitones, decay to 0 over 200ms
Filter: Low-pass 24dB, cutoff 3kHz, envelope decay 300ms
Distortion: Amp > Tube, drive 2.0–4.0, mix 30–50%
```

**Bass Pattern Rhythms for Strudel (128 BPM):**

```
// Root-note bass (simplest): kick-bass sync
"0 [0] [0] [0]"  // Root on beat 1, off-beat hits

// Walking bass (melodic)
"0 3 7 5"  // Root → minor 3rd → 5th → 4th

// Tech house skip pattern
"0 0 0 [0 7]"  // 3 hits then octave leap

// Bass House typical (syncopated 16th groove)
"0 [@3 7] 5 [@3 3]"  // Off-beat emphasis
```

### Drum Pattern Design

| Element | Sample Type | Pattern (16th grid) | Velocity |
|---------|------------|---------------------|----------|
| Kick | Distorted 808/909 layer, sub 60–80Hz + click 3kHz | 1 . . . | 5 . . . | 1 . . . | 5 . . . | 100% |
| Clap | Layered clap + snare, HPF 120Hz | . . . . | 1 . . . | . . . . | 1 . . . | 90–100% |
| Hi-hat (closed) | 909 closed hat, HPF 800Hz | x x x x | x x x x | x x x x | x x x x | 60–80% |
| Hi-hat (open) | 909 open hat, HPF 800Hz | . . . . | . x . . | . . . . | . x . . | 70–80% |
| Shaker | White noise shaker | x x x x | x x x x | x x x x | x x x x | 40–60% |
| Perc 1 (conga) | Mid-range conga hit | . . . . | . . x . | . x . . | . . x . | 60–80% |
| Perc 2 (tambourine) | High, jangly | x . x . | x . x . | x . x . | x . x . | 40–50% |

**Groove swing**: 15–25% swing applied to off-beat 16th hi-hats.

**Kick layer construction for Bass House:**
```
Layer 1: Sub sine (40–80Hz) — pitch envelope 200Hz→50Hz, 100ms decay
Layer 2: 909/body (80–200Hz) — punch, thump
Layer 3: Click (2–8kHz) — transient for small speakers, -15dB relative to body
→ All layers phase-aligned at sample level
```

---

## 5. Mix Characteristics

### Frequency Distribution (Strudel-friendly reference)

| Range | Hz Band | Content | Notes |
|-------|---------|---------|-------|
| **Sub** | 20–60 Hz | Kick sub, sub bass | **Mono only** — crucial for club translation |
| **Low bass** | 60–120 Hz | Bass fundamental, kick body | Kick peaks ~60–80Hz, bass fundamental ~80–120Hz |
| **Low mids** | 120–350 Hz | Kick mud zone, bass harmonics | Heavily EQ'd: cut kick -3 to -6dB @ 200–400Hz |
| **Mids** | 350–2 kHz | Pads, leads, chord stabs, clap body | Vocal presence ~1–4kHz, lead cuts through here |
| **High mids** | 2–6 kHz | Clap snap, lead presence, transient click | Clap crack: boost +2–4dB @ 2–4kHz |
| **Air** | 6–20 kHz | Hi-hats, shaker, reverb tails | HPF hats at 600–800Hz, boost air @ 10–16kHz |

### Gain Staging Targets

| Stage | Target Level |
|-------|-------------|
| Individual instrument peaks | -18 to -12 dBFS |
| Bus/group outputs | -10 to -6 dBFS |
| Pre-master bus | -6 to -3 dBFS |
| Master output (before limiter) | -6 dBFS |

### Sidechain Compression Settings

The **defining rhythmic element** of Bass House. The kick triggers sidechain compression on bass and pads.

| Effect | Threshold | Ratio | Attack | Release | Notes |
|--------|-----------|-------|--------|---------|-------|
| Subtle groove | -15 dB | 3:1 | 5ms | 300ms | Minimal pump |
| Standard house pump | -20 dB | 6:1 | 0.5–1ms | 150–200ms | Classic sound |
| Hard Bass House pump | -25 to -30 dB | 8:1–10:1 | 0.1–0.5ms | 100–150ms | Aggressive ducking |
| DJ tool (extreme) | -30 dB | 20:1 | 0.1ms | 80ms | Max pump |

**LFO-based alternative** (more predictable, Strudel-friendly):
```
// Example: volume curve modulation
// Kick hits on 0, bass volume ducks then recovers
// Volume envelope per quarter note:
1: 0% (kick hit), 0.2: 30%, 0.5: 70%, 0.9: 100%, 1: 0% (next kick)

// Strudel approximation:
shape sawtooth(1/4) * bass_pattern
```

### Stereo Width Rules

| Element | Width | Notes |
|---------|-------|-------|
| Kick | **Mono** | Always. Essential for club systems. |
| Bass | **Mono** (< 200Hz), narrow above | Sub-bass mono; harmonics can be stereo |
| Clap/Snare | Mono or narrow (±15%) | Reverb return can be wide |
| Hi-hats | Slightly panned L/R (±15–25%) | Different samples L and R |
| Shaker | Narrow stereo (±15%) | Sits in center |
| Pads/Chords | **Wide** (100% stereo) | Stereo widener on mid-high content |
| Lead | Slightly wide (±30%) | Keep focused |
| FX/Risers | Wide | Use for space and sweep |
| Reverb returns | Wide | This is where width lives |

### Reverb & Delay Settings

| Effect | Type | Pre-delay | Decay | Wet Mix | Used On |
|--------|------|-----------|-------|---------|---------|
| Short Room | Room reverb | 10ms | 0.5–0.8s | 20–40% | Drums, claps, snare |
| Plate | Plate reverb | 20–30ms | 1–2s | 25–40% | Vocals, leads |
| Large Hall | Hall reverb | 0–20ms | 3–6s | 30–50% | Pads, atmosphere |
| Ping-pong | Delay (1/8D) | — | Feedback 20–30% | 15–25% | Lead stabs, vocal chops |
| Short delay | Delay (1/16) | — | Feedback 10–15% | 10–20% | Percussion |

**Critical**: HPF all reverb returns at 200–300Hz to prevent mud buildup. LPFs at 8kHz to prevent harshness.

---

## 6. Key Structural Markers & Transitions

### Build-Up Techniques

**1. The Filter Sweep** (most common)
- Low-pass filter on master/return bus
- Start: cutoff at 300–500Hz (8 bars before drop)
- End: cutoff at 16kHz (last beat of build)
- Resonance boost: 10–15% for "wobble" buildup effect
- Strudel: `cutoff = 300 → 16000 over 32 beats`

**2. Hi-Hat Acceleration**
```
Bars 33–36: 1/8 note hi-hats (straight)
Bars 37–40: 1/16 note hi-hats
Bars 41–43: 1/16 note with 32nd grace notes
Bar 44:     1/32 note roll → crash on drop
```

**3. Strip-Back Build** (removing kick)
- Last 4–8 bars before drop: remove kick entirely
- Leaves bass + filtered pads + riser
- Drop hits harder after silence/absence

**4. Noise Riser**
- White noise source, HPF automated from 200Hz → 16kHz
- Volume: -∞ dB → 0 dB over 8 bars
- Optional: pitch +1 octave over 4 bars

**5. Suspended Chord Tension**
- End of build (last 2 beats before drop): play sus4 chord (e.g., Asus4)
- No resolution until drop hits full chord

### Drop Energy Checklist (first beat of drop):

```
✅ Kick returns (loud, clean transient)
✅ Bass at full level with sidechain pump engaged
✅ All drums: kick, clap, hi-hats, shaker, percussion
✅ Main chord/stab arrives
✅ Lead melody or hook begins
✅ Sidechain compression fully engaged
✅ Filter fully open
✅ Reverb tails cleared (not bleeding from build)
```

### Transition Markers (for Strudel event patterns)

```
// Build start (32 beats before drop):
signal "riser_start"   // white noise begins, volume -∞→0

// 16 beats before drop:
signal "hats_accel"    // 1/8 → 1/16 → 1/32 hats

// 8 beats before drop:
signal "kick_cut"      // kick removed, tension builds

// 2 beats before drop:
signal "snare_roll"    // or cymbal crash, sus chord

// Drop (beat 0):
signal "drop"          // all elements in, full energy

// 16 beats into drop:
signal "drop_var"      // variation at bar 8 boundary

// 32 beats before breakdown:
signal "breakdown_in"  // filter close, elements strip

// Breakdown start:
signal "breakdown"     // pads only, no drums

// Build 2 start (faster, 8 bars instead of 16):
signal "build2"        // drums return quickly

// Drop 2:
signal "drop2"         // similar but with variation

// Outro:
signal "outro"         // strip to drums, fade
```

---

## 7. Comparison with Related Genres

| Attribute | **Bass House** | Regular House | Deep House | Electro House |
|-----------|---------------|---------------|------------|---------------|
| **BPM** | **124–130** (128) | 118–128 (124–126) | 118–124 (120–122) | 125–132 (128–130) |
| **Kick** | Distorted, aggressive, heavy sub + click | Clean 909, warm, round | Soft attack, sub-heavy, warm | Punchy, metallic, high click |
| **Bass** | **Growling FM bass, Reese, distorted** — the focus | Walking sub bass, melodic | Syncopated sub, muted | Saw/square leads, mid-range heavy |
| **Bass style** | Aggressive, rhythmic, distorted | Smooth, melodic | Warm, deep, minimal | Lead-driven, screeching |
| **Drop** | **Bass-focused drop**, heavy rhythm | Full arrangement, rolling | Subtle, groove-based | Big room synths, massive |
| **Lead synths** | Minimal — bass IS the lead | Piano, pads, strings | Pads, atmospheric | Saw leads, complextro |
| **Chord complexity** | Simple (i–VI–III–VII) | 7th chords, extended | Jazz chords, 9ths/13ths | Simple power chords |
| **Sidechain** | **Aggressive** (8:1–10:1, 100ms release) | Moderate (4:1–6:1) | Subtle (2:1–3:1) | Heavy (6:1–8:1) |
| **Sound design** | Bass distortion is key; dubstep influence | Clean, classic synth tones | Warm analog, lo-fi character | Digital, aggressive, glitchy |
| **Hi-hats** | Tight 16th notes, slightly swung | 8th notes, open hats | Laid-back swing, polyrhythm | Fast 16th/32nd, mechanical |
| **Percussion** | Layered, driving shakers, toms | Minimal, backbone | Congas, organic | Minimal, focused on drop |
| **Reverb** | Controlled, gated on drums | Long tails on snare | Lush, long decay | Short, roomy |
| **Typical length** | 3:30–5:00 | 3:30–6:00 | 5:00–8:00 | 3:00–5:00 |
| **Energy arc** | **Peak/drop driven**, explosive | Rolling, steady groove | Lush, emotional journey | Build/drop, festival energy |
| **Influences** | Dubstep, UK Bass, Riddim | Disco, Soul, Funk | Jazz, Soul, R&B | Dutch House, Techno |
| **Reference artists** | JAUZ, JOYRYDE, Habstrakt, Matroda, AC Slater, Tchami | Frankie Knuckles, Kerri Chandler | Black Coffee, Larry Heard | Martin Garrix, Wolfgang Gartner |

### Key Differentiator Summary

**Bass House vs Regular House:**
- Bass House: 2–6 BPM faster, distorted FM/Reese bass replaces melodic walking bass, aggressive sidechain pump, dubstep-influenced drops, shorter intro/outro for streaming

**Bass House vs Deep House:**
- Bass House: 6–10 BPM faster, no jazz chords, aggressive bass as lead element vs lush pads, much harder sidechain (10:1 vs 2:1), drop-focused vs groove-focused

**Bass House vs Electro House:**
- Bass House: Bass is the main melodic element (not lead synths), less "complex" in arrangement, less focus on lead synths/melodic hooks, stronger dubstep/riddim influence, more sub-bass weight

---

## 8. Strudel Code Pattern Cheat Sheet

### Tempo & Time

```javascript
// 128 BPM
setTempo(128);

// One bar = 4 beats
// One beat = 4 sixteenth notes (default)
```

### Drum Patterns

```javascript
// Kick: 4-on-the-floor
$: n("0 0 0 0").s("bd808").gain(1.0);

// Clap: on 2 & 4
$: n("0 2").s("clap").gain(0.9);

// Closed hi-hat: 8th notes
$: n("0 0 0 0 0 0 0 0").s("hhc").gain(0.7);

// Open hi-hat: off-beat 8ths
$: n("0 2 0 2").s("hho").gain(0.4);

// Shaker: 16th notes
$: n("[0 0 0 0]*4").s("shaker").gain(0.3);
```

### Bass (FM-style pattern)

```javascript
// Root-note bass with off-beat accent
$: n("[0 0 0 0]*2").s("fmbass").gain(0.8);

// Syncopated groove bass (typical Bass House)
$: n("0 0 [0 7] 5").s("fm_bass").gain(0.8);

// Walking sub
$: n("0 3 7 5").s("subbass").gain(0.7);
```

### Sidechain Simulation

```javascript
// Sidechain ducking: volume curve following kick pattern
// Kick hits on 0, bass ducks
$: n("0 3 [7 5] 0 5 7 8").s("fm_bass")
  .gain(0.8)
  .shape("sawtooth"); // or use an LFO shape
```

### Arrangement Sections (using patterns)

```javascript
// INTRO (bars 1-16): Kick + hats only
// BUILD (bars 33-48): Add parts incrementally
// DROP (bars 49-80): Full arrangement
// BREAKDOWN (bars 81-96): Pads only
// BUILD 2 (bars 97-112): Faster re-entry
// DROP 2 (bars 113-144): Variation on drop
// OUTRO (bars 145-160): Strip back
```
