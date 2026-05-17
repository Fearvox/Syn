#!/usr/bin/env python3
"""Bass House Track Analyzer — librosa-based audio analysis
Usage: nix-shell -p python3Packages.librosa python3Packages.matplotlib ffmpeg --run 'python3 sc_analyzer.py /tmp/sc_*.wav'"""
import json, sys, os, subprocess
from collections import Counter

# Try importing librosa (might be in nix-shell)
try:
    import librosa
    import numpy as np
    HAVE_LIBSA = True
except ImportError:
    HAVE_LIBSA = False
    print("WARNING: librosa not available. Install via: nix-shell -p python3Packages.librosa", file=sys.stderr)

def analyze_track(wav_path):
    """Full audio analysis of a Bass House track"""
    if not HAVE_LIBSA or not os.path.exists(wav_path):
        return None
    
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"Analyzing: {os.path.basename(wav_path)}", file=sys.stderr)
    
    # Load audio
    y, sr = librosa.load(wav_path, sr=22050, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"  Duration: {duration:.1f}s | Sample rate: {sr}Hz | Samples: {len(y):,}", file=sys.stderr)
    
    results = {'file': os.path.basename(wav_path), 'duration_s': duration}
    
    # 1. BPM Detection
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
    if isinstance(tempo, np.ndarray):
        tempo = float(tempo[0])
    results['bpm'] = float(round(tempo, 1)) if tempo else None
    results['beat_count'] = len(beats)
    results['beat_times'] = beats.tolist()[:50]  # First 50 beats
    
    # Beat confidence
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    beat_frames = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr, units='frames')[1]
    results['beat_regularity'] = float(np.std(np.diff(beat_frames))) if len(beat_frames) > 1 else 0
    
    print(f"  BPM: {results['bpm']} ({results['beat_count']} beats)", file=sys.stderr)
    
    # 2. Spectral Analysis
    spec_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spec_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85)
    spec_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    zero_crossing = librosa.feature.zero_crossing_rate(y)
    
    results['spectral'] = {
        'centroid_mean': float(np.mean(spec_centroid)),
        'centroid_std': float(np.std(spec_centroid)),
        'rolloff_mean': float(np.mean(spec_rolloff)),
        'bandwidth_mean': float(np.mean(spec_bandwidth)),
        'zcr_mean': float(np.mean(zero_crossing)),
        'spectral_energy': float(np.mean(y ** 2)),
    }
    
    print(f"  Spectral centroid: {results['spectral']['centroid_mean']:.0f}Hz ±{results['spectral']['centroid_std']:.0f}", file=sys.stderr)
    print(f"  Spectral rolloff: {results['spectral']['rolloff_mean']:.0f}Hz", file=sys.stderr)
    
    # 3. Energy Profile (for structural segmentation)
    hop_length = 512
    frame_rate = sr / hop_length
    energy = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    
    # Smooth energy for section detection
    from scipy.ndimage import uniform_filter1d
    energy_smooth = uniform_filter1d(energy, size=int(frame_rate * 0.5))  # 0.5s smoothing
    
    # Detect section boundaries based on energy changes
    energy_diff = np.diff(energy_smooth)
    threshold = np.std(energy_diff) * 2.5
    
    # Find large energy transitions
    transitions = []
    for i in range(1, len(energy_diff)):
        if abs(energy_diff[i]) > threshold:
            trans_time = i / frame_rate
            trans_direction = 'up' if energy_diff[i] > 0 else 'down'
            trans_magnitude = float(abs(energy_diff[i]))
            transitions.append({
                'time_s': round(trans_time, 1),
                'direction': trans_direction,
                'magnitude': round(trans_magnitude, 4),
            })
    
    results['transitions'] = transitions
    
    # Divide track into sections and classify
    num_sections = 16
    section_size = len(energy_smooth) // num_sections
    sections = []
    for i in range(min(num_sections, len(energy_smooth) // section_size)):
        start = i * section_size
        if i == num_sections - 1:
            end = len(energy_smooth)
        else:
            end = (i + 1) * section_size
        section = energy_smooth[start:end]
        avg_energy = float(np.mean(section))
        peak_energy = float(np.max(section))
        sections.append({
            'section': i,
            'start_s': round(i * section_size / frame_rate, 1),
            'end_s': round(end / frame_rate, 1),
            'avg_energy': avg_energy,
            'peak_energy': peak_energy,
        'is_loud': bool(peak_energy > np.median(energy_smooth) * 2),
        'is_quiet': bool(peak_energy < np.median(energy_smooth) * 0.5),
        })
    
    results['sections'] = sections
    
    loud_sections = sum(1 for s in sections if s['is_loud'])
    quiet_sections = sum(1 for s in sections if s['is_quiet'])
    
    results['structural_type'] = (
        'drop_focused' if loud_sections >= 4 else
        'building' if quiet_sections >= 4 else
        'flat'
    )
    
    print(f"  Structure: {results['structural_type']} ({loud_sections} loud / {quiet_sections} quiet sections)", file=sys.stderr)
    print(f"  Energy transitions detected: {len(transitions)}", file=sys.stderr)
    
    # 4. Chroma (harmonic) features for key detection
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    
    # Map chroma bins to note names
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    chroma_distribution = {notes[i]: float(chroma_mean[i]) for i in range(12)}
    results['chroma'] = chroma_distribution
    
    # Estimate key (most prominent chroma)
    max_chroma_idx = int(np.argmax(chroma_mean))
    results['estimated_key'] = notes[max_chroma_idx]
    
    print(f"  Estimated key center: {results['estimated_key']}", file=sys.stderr)
    
    # 5. MFCC for timbre analysis
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfcc, axis=1).tolist()
    results['mfcc'] = mfcc_mean
    
    # 6. Frequency band energy distribution
    # Define bands: sub(20-60), bass(60-200), lowmid(200-500), mid(500-2000), highmid(2000-6000), air(6000-10000)
    bands = {'sub': (20, 60), 'bass': (60, 200), 'lowmid': (200, 500), 
             'mid': (500, 2000), 'highmid': (2000, 6000), 'air': (6000, 10000)}
    
    stft = np.abs(librosa.stft(y))
    freqs = librosa.fft_frequencies(sr=sr)
    
    freq_energy = {}
    for name, (low, high) in bands.items():
        mask = (freqs >= low) & (freqs < high)
        if np.any(mask):
            energy_band = np.sum(stft[mask]) / np.sum(stft)
            freq_energy[name] = float(energy_band * 100)
    
    results['frequency_bands'] = freq_energy
    print(f"  Frequency distribution: {json.dumps({k: f'{v:.1f}%' for k, v in freq_energy.items()})}", file=sys.stderr)
    
    return results

if __name__ == '__main__':
    files = sys.argv[1:]
    if not files:
        print(__doc__)
        sys.exit(1)
    
    all_results = []
    for path in files:
        if not os.path.exists(path):
            print(f"File not found: {path}", file=sys.stderr)
            continue
        result = analyze_track(path)
        if result:
            all_results.append(result)
    
    # Summary
    if all_results:
        print(f"\n{'='*60}", file=sys.stderr)
        print(f"SUMMARY: {len(all_results)} tracks analyzed", file=sys.stderr)
        
        bpms = [r['bpm'] for r in all_results]
        if bpms:
            print(f"  BPM range: {min(bpms):.0f} - {max(bpms):.0f} (avg: {sum(bpms)/len(bpms):.0f})", file=sys.stderr)
        
        for r in all_results:
            print(f"\n  {r['file']}: {r['bpm']}BPM | key≈{r['estimated_key']} | {r['structural_type']}", file=sys.stderr)
            print(f"     Freq: {json.dumps({k: f'{v:.1f}%' for k, v in r['frequency_bands'].items()})}", file=sys.stderr)
    
    # Output full JSON
    output = {
        'tracks_analyzed': len(all_results),
        'results': all_results,
    }
    print(json.dumps(output, indent=2))
