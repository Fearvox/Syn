#!/usr/bin/env python3
"""SoundCloud Bass House Data Collector — Phase 1"""
import json, time, sys, subprocess, urllib.parse

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
                return json.loads(result.stdout)
        except Exception as e:
            print(f"  [retry {attempt+1}] {e}", file=sys.stderr)
        time.sleep(1)
    return None

# Phase 1: Search Bass House tracks with multiple query angles
queries = [
    "bass house",
    "bass house 2024",
    "bass house 128 bpm",
    "JAUZ bass house",
    "JOYRYDE bass house",
    "Habstrakt bass house",
    "Matroda bass house",
    "AC Slater bass house",
    "Tchami bass house",
    "bass house drop",
    "bass house bass music",
    "house bass drop",
    "bassline house",
    "night bass",
    "confession bass house",
]

all_tracks = []
seen_ids = set()

for q in queries:
    print(f"\n=== Searching: {q} ===", file=sys.stderr)
    encoded_q = urllib.parse.quote(q)
    url = f"{BASE}/search/tracks?q={encoded_q}&client_id={CID}&limit=50&offset=0&linked_partitioning=1"
    
    data = fetch_json(url)
    if not data or 'collection' not in data:
        print(f"  No results or error", file=sys.stderr)
        continue
    
    tracks = data.get('collection', [])
    print(f"  Found {len(tracks)} raw tracks", file=sys.stderr)
    
    for t in tracks:
        track_id = t.get('id')
        if track_id in seen_ids:
            continue
        seen_ids.add(track_id)
        
        # Extract track info
        track_info = {
            'id': track_id,
            'title': t.get('title', ''),
            'user': t.get('user', {}).get('username', ''),
            'user_permalink': t.get('user', {}).get('permalink', ''),
            'permalink': t.get('permalink', ''),
            'duration': t.get('duration', 0),
            'bpm': t.get('bpm'),
            'key_signature': t.get('key_signature'),
            'genre': t.get('genre', ''),
            'plays': t.get('playback_count', 0),
            'likes': t.get('likes_count', 0) or 0,
            'reposts': t.get('reposts_count', 0) or 0,
            'comments': t.get('comment_count', 0) or 0,
            'tags': t.get('tag_list', ''),
            'description': (t.get('description', '') or '')[:300],
            'purchase_title': t.get('purchase_title', ''),
            'label_name': t.get('label_name', ''),
            'track_format': t.get('track_format', ''),
            'url': f"https://soundcloud.com/{t['user']['permalink']}/{t['permalink']}",
            'waveform_url': t.get('waveform_url', ''),
            'artwork_url': t.get('artwork_url', ''),
            'release_year': t.get('release_year'),
            'release_month': t.get('release_month'),
            'policy': t.get('policy', ''),
        }
        all_tracks.append(track_info)
    
    print(f"  Total unique: {len(all_tracks)}", file=sys.stderr)
    time.sleep(0.5)

print(f"\n{'='*60}", file=sys.stderr)
print(f"COLLECTED {len(all_tracks)} UNIQUE BASS HOUSE TRACKS", file=sys.stderr)
print(f"{'='*60}", file=sys.stderr)

# Output as JSON
output = {
    'total_tracks': len(all_tracks),
    'queries_used': len(queries),
    'tracks': all_tracks,
}

# Save to file
import re
def sanitize(obj):
    if isinstance(obj, str):
        return re.sub(r'[\x00-\x1f\x7f]', '', obj)
    elif isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize(i) for i in obj]
    return obj

output = sanitize(output)
outpath = '/root/bass_house_tracks.json'
with open(outpath, 'w') as f:
    json.dump(output, f, indent=2)
print(f"SAVED:{outpath}", file=sys.stderr)
print(f"TRACKS:{len(all_tracks)}", file=sys.stderr)
