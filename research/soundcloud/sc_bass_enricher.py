#!/usr/bin/env python3
"""SoundCloud Track Detail Enricher — Phase 2
Fetches full track details for BPM/key/tags and stream URLs"""
import json, time, sys, subprocess, urllib.parse
from collections import Counter

CID = "gxPRNsEq7CDD7Wvem4iymWOq3YfU7KS8"
BASE = "https://api-v2.soundcloud.com"

def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            result = subprocess.run(
                ["curl", "-s", url],
                capture_output=True, text=True, timeout=15
            )
            if result.returncode == 0 and result.stdout:
                data = json.loads(result.stdout)
                if data:  # not empty
                    return data
        except Exception as e:
            print(f"    [retry {attempt+1}] {e}", file=sys.stderr)
        time.sleep(1)
    return None

# Load Phase 1 data
infile = sys.argv[1] if len(sys.argv) > 1 else '/root/bass_house_tracks.json'
outfile = sys.argv[2] if len(sys.argv) > 2 else '/root/bass_house_tracks_enriched.json'

try:
    with open(infile) as f:
        data = json.load(f)
except FileNotFoundError:
    # Try loading from stdin
    data = json.loads(sys.stdin.read())

if isinstance(data, dict) and 'tracks' in data:
    tracks = data['tracks']
else:
    tracks = data

print(f"Enriching {len(tracks)} tracks...", file=sys.stderr)

# Fetch batch details
batch_size = 50
enriched = []

for i in range(0, len(tracks), batch_size):
    batch = tracks[i:i+batch_size]
    ids = [str(t['id']) for t in batch]
    ids_param = urllib.parse.quote(','.join(ids))
    
    print(f"  Batch {i//batch_size + 1}: tracks {ids[0]}..{ids[-1]}", file=sys.stderr)
    
    url = f"{BASE}/tracks?ids={ids_param}&client_id={CID}&app_version=1778677443&app_locale=en"
    detail_data = fetch_json(url)
    
    if detail_data and isinstance(detail_data, list):
        detail_map = {d['id']: d for d in detail_data}
        
        for track in batch:
            tid = track['id']
            detail = detail_map.get(tid, {})
            
            track['bpm'] = detail.get('bpm') or track.get('bpm')
            track['key_signature'] = detail.get('key_signature') or track.get('key_signature')
            track['genre'] = detail.get('genre') or track.get('genre')
            track['tag_list'] = detail.get('tag_list', '')
            track['description'] = (detail.get('description', '') or '')[:500]
            track['duration'] = detail.get('duration', 0) or track.get('duration', 0)
            track['full_duration_ms'] = detail.get('full_duration', 0)
            track['license'] = detail.get('license', '')
            track['policy'] = detail.get('policy', '')
            track['downloadable'] = detail.get('downloadable', False)
            track['streamable'] = detail.get('streamable', True)
            track['has_downloads_left'] = detail.get('has_downloads_left', False)
            track['state'] = detail.get('state', '')
            track['label_name'] = detail.get('label_name') or track.get('label_name')
            track['release_year'] = detail.get('release_year') or track.get('release_year')
            track['release_month'] = detail.get('release_month') or track.get('release_month')
            track['release_day'] = detail.get('release_day')
            track['track_format'] = detail.get('track_format', '')
            track['purchase_title'] = detail.get('purchase_title', '')
            
            # Get waveform data shape (for structure analysis)
            if track.get('waveform_url'):
                wf_result = subprocess.run(
                    ["curl", "-s", track['waveform_url']],
                    capture_output=True, text=True, timeout=10
                )
                if wf_result.stdout:
                    try:
                        wf_data = json.loads(wf_result.stdout)
                        track['waveform_samples'] = wf_data.get('samples', [])[:500]  # Trimmed
                    except:
                        pass
            
            enriched.append(track)
    else:
        print(f"  Failed to get details for batch {i//batch_size + 1}", file=sys.stderr)
        enriched.extend(batch)
    
    time.sleep(0.3)

# Analysis
tracks_with_bpm = [t for t in enriched if t.get('bpm') and t['bpm'] > 60 and t['bpm'] < 200]
tracks_with_key = [t for t in enriched if t.get('key_signature')]
tracks_with_tags = [t for t in enriched if t.get('tag_list')]
tracks_genre = [t for t in enriched if t.get('genre')]

print(f"\n{'='*60}", file=sys.stderr)
print(f"ANALYSIS SUMMARY:", file=sys.stderr)
print(f"  Total tracks: {len(enriched)}", file=sys.stderr)
print(f"  With BPM: {len(tracks_with_bpm)} ({len(tracks_with_bpm)/len(enriched)*100:.1f}%)", file=sys.stderr)
print(f"  With Key: {len(tracks_with_key)} ({len(tracks_with_key)/len(enriched)*100:.1f}%)", file=sys.stderr)
print(f"  With Genre: {len(tracks_genre)} ({len(tracks_genre)/len(enriched)*100:.1f}%)", file=sys.stderr)

if tracks_with_bpm:
    bpms = [t['bpm'] for t in tracks_with_bpm]
    from collections import Counter
    bpm_counter = Counter(bpms)
    print(f"\n  BPM Distribution:", file=sys.stderr)
    for bpm, count in bpm_counter.most_common(10):
        print(f"    {bpm} BPM: {count} tracks", file=sys.stderr)
    avg_bpm = sum(bpms) / len(bpms)
    print(f"  Average BPM: {avg_bpm:.1f}", file=sys.stderr)
    print(f"  BPM Range: {min(bpms)}-{max(bpms)}", file=sys.stderr)

if tracks_with_key:
    keys = [t['key_signature'] for t in tracks_with_key]
    key_counter = Counter(keys)
    print(f"\n  Key Distribution:", file=sys.stderr)
    for key, count in key_counter.most_common(10):
        print(f"    {key}: {count} tracks", file=sys.stderr)

# Genre tags
all_tags = []
for t in enriched:
    tag_list = t.get('tag_list', '') or t.get('tags', '')
    if tag_list:
        for tag in tag_list.split(' '):
            tag = tag.strip('"').lower()
            if tag and len(tag) > 1:
                all_tags.append(tag)

if all_tags:
    tag_counter = Counter(all_tags)
    print(f"\n  Top Tags:", file=sys.stderr)
    for tag, count in tag_counter.most_common(20):
        print(f"    \"{tag}\": {count}", file=sys.stderr)

# Top tracks by plays
top_by_plays = sorted(enriched, key=lambda t: t.get('plays', 0), reverse=True)[:20]
print(f"\n  Top 20 Most Played Tracks:", file=sys.stderr)
for t in top_by_plays:
    bpm_str = f"{t.get('bpm')}BPM" if t.get('bpm') else "?BPM"
    key_str = f" {t.get('key_signature')}" if t.get('key_signature') else ""
    print(f"    [{t.get('plays', 0):>8,}] {t['title']} — {t.get('user','')} ({bpm_str}{key_str})", file=sys.stderr)

# Save enriched data
output = {
    'total_tracks': len(enriched),
    'analysis': {
        'avg_bpm': round(sum(t['bpm'] for t in tracks_with_bpm) / len(tracks_with_bpm), 1) if tracks_with_bpm else None,
        'bpm_min': min(t['bpm'] for t in tracks_with_bpm) if tracks_with_bpm else None,
        'bpm_max': max(t['bpm'] for t in tracks_with_bpm) if tracks_with_bpm else None,
        'tracks_with_bpm': len(tracks_with_bpm),
        'tracks_with_key': len(tracks_with_key),
        'bpm_distribution': dict(Counter(t['bpm'] for t in tracks_with_bpm).most_common(20)) if tracks_with_bpm else {},
        'key_distribution': dict(Counter(t['key_signature'] for t in tracks_with_key).most_common(20)) if tracks_with_key else {},
        'top_tags': dict(tag_counter.most_common(30)) if all_tags else {},
    },
    'top_plays': [{'title': t['title'], 'user': t['user'], 'plays': t.get('plays',0), 'bpm': t.get('bpm'), 'key': t.get('key_signature'), 'url': t.get('url','')} for t in top_by_plays],
    'tracks': enriched,
}

with open(outfile, 'w') as f:
    json.dump(output, f, indent=2)

print(f"\nSaved to {outfile}", file=sys.stderr)
print(json.dumps(output['analysis'], indent=2))
