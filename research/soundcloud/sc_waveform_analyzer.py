#!/usr/bin/env python3
"""SoundCloud Waveform Analyzer — extract structural data from waveform JSONs"""
import json, subprocess, sys, re
from collections import Counter

CID = "gxPRNsEq7CDD7Wvem4iymWOq3YfU7KS8"

def fetch_waveform(track, save_dir='/root/waveforms/'):
    """Download and analyze a track's waveform"""
    import os
    os.makedirs(save_dir, exist_ok=True)
    
    wf_url = track.get('waveform_url', '')
    if not wf_url:
        return None
    
    try:
        result = subprocess.run(['curl', '-s', wf_url], capture_output=True, text=True, timeout=10)
        wf_data = json.loads(result.stdout)
    except:
        return None
    
    samples = wf_data.get('samples', [])
    if not samples:
        return None
    
    # Structural analysis from waveform
    n = len(samples)
    duration_ms = track.get('duration', 0) or 222000
    
    # Section detection based on energy levels
    def section_energy(start_pct, end_pct):
        si = int(start_pct * n)
        ei = int(end_pct * n)
        section = samples[si:ei]
        if not section:
            return 0, 0
        avg = sum(section) / len(section)
        peak = max(section)
        return avg, peak
    
    # Divide into 16 sections (each ~16 bars at 128 BPM)
    num_sections = 16
    section_size = n // num_sections
    section_energies = []
    for i in range(num_sections):
        s = samples[i*section_size:(i+1)*section_size]
        if s:
            section_energies.append({
                'section': i,
                'start_ms': (i * section_size / n) * duration_ms,
                'end_ms': ((i+1) * section_size / n) * duration_ms,
                'avg_energy': sum(s) / len(s),
                'peak_energy': max(s),
                'is_loud': max(s) > 80,
                'is_quiet': max(s) < 30,
            })
    
    # Detect structural sections
    energy_profile = [e['avg_energy'] for e in section_energies]
    
    # Find transitions (where energy changes significantly)
    transitions = []
    for i in range(1, len(section_energies)):
        prev_e = section_energies[i-1]['avg_energy']
        curr_e = section_energies[i]['avg_energy']
        if abs(curr_e - prev_e) > 15:
            transitions.append({
                'position': section_energies[i]['start_ms'] / 1000,
                'section': i,
                'direction': 'up' if curr_e > prev_e else 'down',
                'magnitude': abs(curr_e - prev_e),
            })
    
    # Classify overall structure
    loud_count = sum(1 for e in section_energies if e['is_loud'])
    quiet_count = sum(1 for e in section_energies if e['is_quiet'])
    
    analysis = {
        'track_id': track['id'],
        'title': track['title'],
        'user': track['user'],
        'duration_ms': duration_ms,
        'duration_sec': duration_ms / 1000,
        'num_samples': n,
        'transitions': transitions,
        'section_energies': section_energies,
        'energy_profile': energy_profile,
        'profile_type': 'bass_house' if loud_count > 8 and transitions else 'other',
        'has_drop_sections': loud_count >= 4,
        'structure_summary': 'drop_focused' if loud_count > 8 else 'building' if quiet_count > 4 else 'flat',
    }
    
    return analysis

def extract_bpm_from_text(track):
    """Extract BPM from track text fields"""
    text = ' '.join(filter(None, [
        track.get('title', ''),
        track.get('description', '') or '',
        track.get('tag_list', '') or '',
        str(track.get('bpm', '')),
    ])).lower()
    
    # Look for BPM patterns like "128bpm", "128 BPM", "bpm:128"
    patterns = [
        r'(\d{2,3})\s*bpm',
        r'bpm\s*[:=]?\s*(\d{2,3})',
        r'(\d{2,3})\s*beats\s*per\s*minute',
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            bpm = int(m.group(1))
            if 60 <= bpm <= 200:
                return bpm
    
    return None

def extract_key_from_text(track):
    """Extract musical key from text"""
    text = ' '.join(filter(None, [
        track.get('title', ''),
        track.get('description', '') or '',
        track.get('tag_list', '') or '',
    ])).lower()
    
    # Key patterns: Cm, C#m, Eb, Fmaj, G minor, etc.
    key_pattern = r'\b([A-G][#b]?\s*(?:m(?:in(?:or)?)?|maj(?:or)?|M))\b'
    m = re.search(key_pattern, text)
    if m:
        return m.group(1).upper()
    
    return None

# Load tracks
with open('/root/bass_house_tracks.json') as f:
    data = json.load(f)

tracks = data if isinstance(data, list) else data.get('tracks', data)

print(f"Analyzing {len(tracks)} tracks...", file=sys.stderr)

results = []
bpm_found = 0
key_found = 0
structure_types = Counter()

for i, track in enumerate(tracks[:50]):  # Top 50 for now
    # Extract BPM/key from text
    bpm = extract_bpm_from_text(track)
    key = extract_key_from_text(track)
    
    track['extracted_bpm'] = bpm
    track['extracted_key'] = key
    if bpm:
        bpm_found += 1
    if key:
        key_found += 1
    
    # Get waveform analysis
    waveform = fetch_waveform(track)
    if waveform:
        if waveform['structure_summary']:
            structure_types[waveform['structure_summary']] += 1
        track['waveform_analysis'] = waveform
    
    results.append(track)
    
    if (i+1) % 20 == 0:
        print(f"  Processed {i+1}/{len(tracks)}...", file=sys.stderr)

print(f"\n=== ANALYSIS RESULTS ===", file=sys.stderr)
print(f"Tracks with BPM (from text): {bpm_found} ({bpm_found/len(results)*100:.1f}%)", file=sys.stderr)
print(f"Tracks with Key (from text): {key_found} ({key_found/len(results)*100:.1f}%)", file=sys.stderr)
print(f"Structure types: {dict(structure_types)}", file=sys.stderr)

# BPM distribution
bpms = [t['extracted_bpm'] for t in results if t['extracted_bpm']]
if bpms:
    bpm_counter = Counter(bpms)
    print(f"\nBPM Distribution:", file=sys.stderr)
    for bpm, count in bpm_counter.most_common(10):
        print(f"  {bpm} BPM: {count} tracks", file=sys.stderr)

# Keys
keys = [t['extracted_key'] for t in results if t['extracted_key']]
if keys:
    key_counter = Counter(keys)
    print(f"\nKey Distribution:", file=sys.stderr)
    for key, count in key_counter.most_common(10):
        print(f"  {key}: {count} tracks", file=sys.stderr)

# Export results
output = {
    'total': len(results),
    'with_bpm': bpm_found,
    'with_key': key_found,
    'structure_types': dict(structure_types),
    'bpm_distribution': dict(Counter(bpms).most_common(20)) if bpms else {},
    'key_distribution': dict(Counter(keys).most_common(20)) if keys else {},
    'tracks': results,
}

with open('/root/bass_house_analyzed.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\nSaved to /root/bass_house_analyzed.json", file=sys.stderr)

# Print summary
print(json.dumps({
    'total': len(results),
    'with_bpm': bpm_found,
    'with_key': key_found,
    'bpm_distribution': dict(Counter(bpms).most_common(15)) if bpms else {},
    'key_distribution': dict(Counter(keys).most_common(15)) if keys else {},
}, indent=2))
