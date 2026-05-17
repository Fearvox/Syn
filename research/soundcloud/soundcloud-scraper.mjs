#!/usr/bin/env node
/**
 * SoundCloud Scraper — headless Playwright browser
 * Extracts track metadata, client_id, and stream URLs
 * Usage: node soundcloud-scraper.mjs <command> [args]
 *
 * Commands:
 *   search <query>        Search SoundCloud tracks
 *   track <url>           Get track metadata + stream info
 *   user <url>            Get user/artist tracks
 *   extract-client        Extract API client_id
 */

import { chromium } from 'playwright';

const BASE = 'https://soundcloud.com';
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || '/nix/store/zqg7sy2ig8xzybxd14jd5hxx39mh5jzw-chromium-147.0.7727.137/bin/chromium';

async function launchBrowser() {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: CHROMIUM_PATH,
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  // Block images and fonts for speed
  await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf}', (route) => route.abort());
  return { browser, page };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Navigate to a page and wait for it to settle
 */
async function navigateAndWait(page, url, waitMs = 5000) {
  console.error(`[nav] ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  // Give JS time to render additional content
  await sleep(3000);
}

/**
 * Extract SoundCloud client_id from network intercept
 */
export async function extractClientId(page) {
  return await page.evaluate(() => {
    // Method 1: Look in window.__SC_CLIENT_ID or similar
    if (window.__SC_CLIENT_ID) return window.__SC_CLIENT_ID;
    
    // Method 2: Check all script tags for client_id pattern
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const text = script.textContent || '';
      const match = text.match(/client_id["'\s:=]+"([^"']+)"/);
      if (match) return match[1];
    }
    
    // Method 3: Check __NEXT_DATA__
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
      try {
        const data = JSON.parse(nextData.textContent);
        return JSON.stringify(data).match(/client_id["'\s:=]+"([^"']+)"/)?.[1];
      } catch {}
    }
    
    return null;
  });
}

/**
 * Extract client_id by intercepting API requests
 */
export async function extractClientIdFromNetwork(page) {
  let clientId = null;
  
  // Listen for API requests
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('api-v2.soundcloud.com') && url.includes('client_id=')) {
      const match = url.match(/client_id=([a-f0-9]+)/);
      if (match) {
        clientId = match[1];
        console.error(`[intercept] Found client_id: ${clientId}`);
      }
    }
  });
  
  // Navigate to search to trigger API calls
  await navigateAndWait(page, `${BASE}/search/sounds?q=bass+house`);
  
  // Wait for API calls to happen
  await sleep(5000);
  
  return clientId;
}

/**
 * Search for tracks
 */
export async function searchTracks(page, query, limit = 10) {
  await navigateAndWait(page, `${BASE}/search/sounds?q=${encodeURIComponent(query)}`);
  
  // Wait for track lisings to appear
  await sleep(3000);
  
  const tracks = await page.evaluate((lim) => {
    const items = [];
    // SoundCloud renders track items in specific DOM structure
    const containers = document.querySelectorAll('article, div[class*="soundList"] li, div[class*="search"] section');
    
    document.querySelectorAll('a[href*="/"]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href === '/' || href.startsWith('#')) return;
      if (href.split('/').length === 3 && !href.includes('search')) {
        // Likely a track: /username/title
        const title = a.querySelector('span, div[class*="title"], h2, h3');
        items.push({
          url: href.startsWith('http') ? href : `https://soundcloud.com${href}`,
          title: title ? title.textContent.trim() : a.textContent.trim(),
        });
      }
    });
    
    return [...new Map(items.map(item => [item.url, item])).values()];
  }, limit);
  
  return tracks.slice(0, limit);
}

/**
 * Get detailed track info from its page
 */
export async function getTrackInfo(page, url) {
  await navigateAndWait(page, url);
  await sleep(2000);
  
  const info = await page.evaluate(() => {
    const data = {};
    
    // Get title
    const titleEl = document.querySelector('meta[property="og:title"]');
    if (titleEl) data.title = titleEl.getAttribute('content');
    
    // Get description
    const descEl = document.querySelector('meta[property="og:description"]');
    if (descEl) data.description = descEl.getAttribute('content');
    
    // Get BPM and key from description (often tagged by SoundCloud)
    const fullText = document.body.innerText || '';
    
    // Look for BPM in description
    const bpmMatch = fullText.match(/(\d+)\s*BPM/i);
    if (bpmMatch) data.bpm = parseInt(bpmMatch[1]);
    
    // Look for key
    const keyMatch = fullText.match(/([A-G][#b]?\s*(?:maj|minor|m|min)?)/g);
    if (keyMatch) data.key = keyMatch[0];
    
    // Get play count
    const playEl = document.querySelector('span[class*="playCount"], span[class*="sc-ministats"]');
    
    // Get genre from tags
    const tags = [...document.querySelectorAll('a[class*="tag"], a[href*="/tags/"], a[href*="?filter.genre"]')]
      .map(el => el.textContent.trim());
    data.tags = [...new Set(tags)];
    
    // Get waveform data URL
    const waveformEl = document.querySelector('meta[property="twitter:image"]');
    if (waveformEl) data.waveform = waveformEl.getAttribute('content');
    
    // Get user
    const userEl = document.querySelector('meta[property="og:article:author"]');
    if (userEl) data.user = userEl.getAttribute('content');
    
    return data;
  });
  
  // Try to get client_id and stream URL
  const clientId = await extractClientId(page);
  if (clientId) info.client_id = clientId;
  
  return info;
}

/**
 * Main CLI
 */
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  if (!command) {
    console.log(`Usage: node soundcloud-scraper.mjs <command> [args]
    
Commands:
  search <query>               Search tracks
  track <url>                  Get track info
  extract-client               Extract API client_id from SoundCloud
  user <url>                   Get user tracks
`);
    process.exit(1);
  }
  
  const { browser, page } = await launchBrowser();
  
  try {
    switch (command) {
      case 'search': {
        const tracks = await searchTracks(page, arg || 'bass house');
        console.log(JSON.stringify(tracks, null, 2));
        console.error(`Found ${tracks.length} tracks`);
        break;
      }
      
      case 'track': {
        if (!arg) throw new Error('URL required');
        const info = await getTrackInfo(page, arg);
        console.log(JSON.stringify(info, null, 2));
        break;
      }
      
      case 'extract-client': {
        await navigateAndWait(page, `${BASE}/search/sounds?q=test`);
        let clientId = await extractClientId(page);
        if (!clientId) {
          clientId = await extractClientIdFromNetwork(page);
        }
        console.log(JSON.stringify({ client_id: clientId }));
        break;
      }
      
      case 'user': {
        await navigateAndWait(page, arg);
        await sleep(3000);
        const tracks = await page.evaluate(() => {
          const items = [];
          document.querySelectorAll('a[href*="/"][href*="/"]').forEach(a => {
            const href = a.getAttribute('href');
            if (!href || href.split('/').length !== 3) return;
            const segments = href.split('/');
            if (segments[0] || segments[2].length < 5) return;
            items.push({
              url: `https://soundcloud.com${href}`,
              title: a.querySelector('span, div[class*="title"], h2, h3')?.textContent?.trim() || a.textContent.trim(),
            });
          });
          return items.slice(0, 30);
        });
        console.log(JSON.stringify(tracks, null, 2));
        break;
      }
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.log(JSON.stringify({ error: err.message }));
  } finally {
    await browser.close();
  }
}

main();
