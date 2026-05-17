# Syn

**Syn** is a live-coding music environment for the browser. Write patterns, hear them instantly. Based on the TidalCycles pattern language, running entirely in your browser via Web Audio.

```
$: s("bd808, hhc*4, sd(3,8), hho*2").bank("RolandTR808")
  .room(0.4).delay(0.25).gain(0.8)
```

## Features

- **Live coding** — type patterns, hear them change in real-time
- **Browser-native** — no install required, runs on Web Audio
- **Pattern language** — full TidalCycles-style mini-notation with euclidean rhythms, polymeters, and more
- **Synthesis** — built-in synths plus sample playback
- **Effects** — reverb, delay, distortion, filter, compressor, and more
- **MIDI / OSC** — control external gear

## Quick Start

```bash
git clone https://github.com/Fearvox/Syn.git
cd Syn
pnpm install
pnpm dev
```

Open `http://localhost:4321` in your browser and start coding.

## Structure

```
packages/
├── core/         # Pattern engine, mini-notation, event scheduling
├── webaudio/     # Web Audio synthesis + sample playback
├── mini/         # Mini-notation parser
├── tonal/        # Music theory helpers (scales, chords)
├── transpiler/   # AST-based code transforms
├── repl/         # Interactive REPL component
├── web/          # Bundled distribution for `<script>` use
├── website/      # strudel.cc website (Astro)
├── midi/         # MIDI output
├── osc/          # OSC output
├── superdough/   # Audio engine backend
├── xen/          # Microtonal / xenharmonic support
├── csound/       # Csound integration
├── tidal/        # TidalLink bridge
└── ...
```

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).

## Acknowledgements

Syn is built on the incredible work of the [Strudel](https://strudel.cc) and [TidalCycles](https://tidalcycles.org) communities.

- Original Strudel: [codeberg.org/uzu/strudel](https://codeberg.org/uzu/strudel)
- TidalCycles: [tidalcycles.org](https://tidalcycles.org)
