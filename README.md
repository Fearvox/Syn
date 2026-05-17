# Syn

**Syn** is a live-coding music environment for the browser. Write patterns, hear them instantly. Based on the TidalCycles pattern language, running entirely in your browser via Web Audio.

```
$: s("bd808, hhc*4, sd(3,8), hho*2").bank("RolandTR808")
  .room(0.4).delay(0.25).gain(0.8)
```

## Origin

Syn's engine is forked from **[Strudel](https://strudel.cc)** ([codeberg.org/uzu/strudel](https://codeberg.org/uzu/strudel)), a brilliant project by Alex McLean and the TidalCycles community. All core packages (`packages/`) are upstream code — licensed under AGPL-3.0-or-later.

Beyond the engine, Syn adds our own:

- **Music research** — genre analysis via SoundCloud deep data collection
- **Analysis pipeline** — BPM/spectrum/structure extraction with librosa
- **Original tracks** — compositions built from research-informed patterns

## What's Ours

| Directory | Content | Author |
|---|---|---|
| `music/` | Original tracks + music page (`index.html`) | Own work |
| `music/tracks/` | "Neon Pressure" (Bass House), "Photon Pulse" (DnB), "Binary Rain" | Own work |
| `research/soundcloud/` | Collectors, waveform analyzers, audio downloaders | Own work |
| `research/analysis/` | Genre research docs + audio analysis JSONs | Own work |

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
├── packages/         # ← From Strudel upstream (AGPL-3.0)
│   ├── core/         #   Pattern engine, mini-notation, event scheduling
│   ├── webaudio/     #   Web Audio synthesis + sample playback
│   ├── mini/         #   Mini-notation parser
│   ├── tonal/        #   Music theory helpers (scales, chords)
│   ├── transpiler/   #   AST-based code transforms
│   ├── repl/         #   Interactive REPL component
│   ├── superdough/   #   Audio engine backend
│   └── ...
├── music/            # ← Our original compositions
│   ├── index.html    #   Music page (self-hosted)
│   └── tracks/       #   Individual track files
└── research/         # ← Our analysis pipeline
    ├── soundcloud/   #   SC collectors, downloaders, waveform analyzers
    └── analysis/     #   Genre reports + audio analysis data
```

## License

- Engine (`packages/`): **AGPL-3.0-or-later** — inherited from [Strudel](https://codeberg.org/uzu/strudel)
- Music + Research (`music/`, `research/`): Our original work

## Acknowledgements

Syn would not exist without the incredible work of:

- **[Strudel](https://strudel.cc)** by Alex McLean & contributors — the engine that makes this possible
- **[TidalCycles](https://tidalcycles.org)** — the live-coding pattern language that started it all
- **SoundCloud** community — artists whose music informed our genre research
