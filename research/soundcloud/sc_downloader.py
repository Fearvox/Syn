#!/usr/bin/env python3
"""SoundCloud Audio Downloader — using HLS/progressive API"""
import json, subprocess, sys, time, os, urllib.parse, re

CID = "gxPRNsEq7CDD7Wvem4iymWOq3YfU7KS8"
BASE = "https://api-v2.soundcloud.com"

def fetch_json(url):
    try:
        r = subprocess.run(['curl', '-s', url], capture_output=True, text=True, timeout=15)
        if r.stdout.strip():
            return json.loads(r.stdout)
    except Exception as e:
        print(f"  [fetch error] {e}", file=sys.stderr)
    return None

def get_media_urls(track_id):
    """Get media transcodings for a track"""
    url = f"{BASE}/tracks/{track_id}?client_id={CID}&app_version=1778677443"
    data = fetch_json(url)
    if not data:
        return None
    
    transcodings = []
    for trans in (data.get('media') or {}).get('transcodings', []):
        transcodings.append({
            'preset': trans.get('preset'),
            'url': trans.get('url'),
            'format': trans.get('format', {}).get('protocol'),
        })
    
    track_auth = data.get('track_authorization', '')
    return transcodings, track_auth

def resolve_stream_url(transcoding_url, track_auth):
    """Resolve a transcoding URL to get the actual stream URL"""
    url = f"{transcoding_url}?client_id={CID}&track_authorization={track_auth}"
    data = fetch_json(url)
    if data:
        return data.get('url')  # This is either an m3u8 or mp3 URL
    return None

def download_track(track_id, output_path=None):
    """Download a track as WAV for analysis"""
    result = get_media_urls(track_id)
    if not result:
        print(f"  Failed to get media URLs for track {track_id}", file=sys.stderr)
        return None
    
    transcodings, track_auth = result
    
    # Prefer progressive MP3 (simplest), then aac_160k HLS
    preferred = ['mp3_0_0', 'aac_160k', 'abr_sq', 'aac_96k']
    
    stream_url = None
    used_preset = None
    for preset in preferred:
        for t in transcodings:
            if t['preset'] == preset:
                resolved = resolve_stream_url(t['url'], track_auth)
                if resolved:
                    stream_url = resolved
                    used_preset = preset
                    print(f"  Using {preset}: {resolved[:80]}...", file=sys.stderr)
                    break
        if stream_url:
            break
    
    if not stream_url:
        print(f"  No playable stream found", file=sys.stderr)
        return None
    
    # Download with ffmpeg (handles both HLS and progressive)
    if not output_path:
        output_path = f"/tmp/sc_track_{track_id}.wav"
    
    cmd = ['ffmpeg', '-y', '-i', stream_url, '-ac', '1', '-ar', '22050', '-f', 'wav', output_path]
    print(f"  Downloading: {' '.join(cmd)}", file=sys.stderr)
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        print(f"  ffmpeg error: {result.stderr[:200]}", file=sys.stderr)
        return None
    
    if os.path.exists(output_path):
        size = os.path.getsize(output_path)
        print(f"  Downloaded {size/1024:.0f} KB to {output_path}", file=sys.stderr)
        return output_path
    
    return None

def get_sample_description(track_id):
    """Get a text sample of the track description for analysis context"""
    url = f"{BASE}/tracks/{track_id}?client_id={CID}"
    data = fetch_json(url)
    if data:
        return {
            'title': data.get('title'),
            'user': data.get('user', {}).get('username'),
            'genre': data.get('genre'),
            'duration': data.get('duration'),
            'plays': data.get('playback_count'),
            'tags': data.get('tag_list'),
            'description': (data.get('description') or '')[:300],
            'waveform': data.get('waveform_url'),
            'bpm': data.get('bpm'),
            'key': data.get('key_signature'),
        }
    return None

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('track_id', help='SoundCloud track ID')
    parser.add_argument('--output', '-o', help='Output WAV path', default=None)
    args = parser.parse_args()
    
    # First get metadata
    print(f"Track {args.track_id}:", file=sys.stderr)
    meta = get_sample_description(args.track_id)
    if meta:
        print(f"  {meta['title']} by {meta['user']}", file=sys.stderr)
        print(f"  {meta.get('genre','?')} | {meta.get('duration',0)/1000:.0f}s | {meta.get('plays',0):,} plays", file=sys.stderr)
    
    # Download
    path = download_track(args.track_id, args.output)
    if path:
        print(path)  # stdout for piping
