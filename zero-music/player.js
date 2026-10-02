/**
 * ZeroMusic Web Player Engine
 * - Ad-Free YouTube Playback via Privacy Sandbox + Active Ad-Shield Watchdog
 * - Real-Time As-You-Type Search & Suggestions
 * - Time-Synced Karaoke Lyrics powered by LRCLIB
 * - LocalStorage Library (Liked Songs, History, Playlists)
 * - MediaSession API & Keyboard Shortcuts
 * - Device Detection & View Switcher (Desktop Web Player vs Mobile Download Pane)
 */

(function () {
  'use strict';

  // ── Global State ──
  const state = {
    currentTrack: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: parseInt(localStorage.getItem('zm_volume') || '85', 10),
    isMuted: false,
    isShuffle: localStorage.getItem('zm_shuffle') === 'true',
    repeatMode: parseInt(localStorage.getItem('zm_repeat') || '0', 10), // 0: off, 1: all, 2: one
    likedTracks: JSON.parse(localStorage.getItem('zm_liked') || '[]'),
    history: JSON.parse(localStorage.getItem('zm_history') || '[]'),
    playlists: JSON.parse(localStorage.getItem('zm_playlists') || '[]'),
    lyrics: [],
    activeLyricIndex: -1,
    activeView: 'home', // 'home', 'search', 'library', 'lyrics'
    isLyricsOpen: false,
    isQueueOpen: false,
    adShieldActive: true,
    isBypassingAd: false,
  };

  // ── Curated Starter Tracks (Home / Trending Hits) ──
  const TRENDING_TRACKS = [
    { id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg' },
    { id: '34Na4j8AVgA', title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', duration: '3:50', thumbnail: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg' },
    { id: 'yKNxeF4KMsY', title: 'Yellow', artist: 'Coldplay', duration: '4:29', thumbnail: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg' },
    { id: 'TUVcZfQe-Kw', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', thumbnail: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg' },
    { id: 'h5Nn9nKrk48', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', thumbnail: 'https://i.ytimg.com/vi/h5Nn9nKrk48/hqdefault.jpg' },
    { id: '2Vv-BfVoq4g', title: 'Perfect', artist: 'Ed Sheeran', duration: '4:23', thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg' },
    { id: 'b8m9zhNAgKs', title: 'Sunflower', artist: 'Post Malone, Swae Lee', duration: '2:38', thumbnail: 'https://i.ytimg.com/vi/b8m9zhNAgKs/hqdefault.jpg' },
    { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
    { id: 'fKopy74weus', title: 'Thunder', artist: 'Imagine Dragons', duration: '3:07', thumbnail: 'https://i.ytimg.com/vi/fKopy74weus/hqdefault.jpg' },
    { id: '0VjIjW4GlUZAMYd2vXMi3b', title: 'Midnight City', artist: 'M83', duration: '4:03', thumbnail: 'https://i.ytimg.com/vi/dX3k_QDnzHE/hqdefault.jpg', id: 'dX3k_QDnzHE' },
    { id: 'kXYiU_JCYtU', title: 'Numb', artist: 'Linkin Park', duration: '3:07', thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg' },
    { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
  ];

  // ── Device Routing & View Switcher ──
  function initDeviceRouting() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 820;
    const isMobileDevice = isMobileUA || (isTouch && isSmallScreen);

    // Stored preference
    const storedPref = localStorage.getItem('zm_view_preference');
    const defaultMode = isMobileDevice ? 'download' : 'player';
    const activeMode = storedPref || defaultMode;

    setViewMode(activeMode, false);

    // Toggle button in header
    const toggleBtn = document.getElementById('btn-toggle-view');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentMode = document.body.dataset.zmView || defaultMode;
        const newMode = currentMode === 'player' ? 'download' : 'player';
        setViewMode(newMode, true);
      });
    }

    // Direct links inside panes to switch mode
    document.querySelectorAll('[data-switch-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = btn.dataset.switchView;
        setViewMode(targetView, true);
      });
    });
  }

  function setViewMode(mode, savePreference) {
    document.body.dataset.zmView = mode;
    const downloadView = document.getElementById('zm-download-view');
    const playerView = document.getElementById('zm-player-view');
    const toggleIcon = document.getElementById('toggle-icon');
    const toggleText = document.getElementById('toggle-text');

    if (mode === 'player') {
      if (downloadView) downloadView.style.display = 'none';
      if (playerView) playerView.style.display = 'flex';
      if (toggleIcon) toggleIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
      if (toggleText) toggleText.textContent = 'Android APK';
      // If no track loaded yet, set initial queue to trending tracks
      if (state.queue.length === 0) {
        state.queue = [...TRENDING_TRACKS];
        renderQueue();
      }
    } else {
      if (downloadView) downloadView.style.display = 'block';
      if (playerView) playerView.style.display = 'none';
      if (toggleIcon) toggleIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
      if (toggleText) toggleText.textContent = 'Web Player';
    }

    if (savePreference) {
      localStorage.setItem('zm_view_preference', mode);
      showToast(mode === 'player' ? 'Switched to ZeroMusic Web Player' : 'Switched to Android Download View');
    }
  }

  // ── YouTube Audio Engine & Ad-Shield ──
  let ytPlayer = null;
  let ytReady = false;
  let progressInterval = null;
  let adWatchdogInterval = null;

  function initYouTubeEngine() {
    if (window.YT && window.YT.Player) {
      createYTIframe();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function () {
      createYTIframe();
    };
  }

  function createYTIframe() {
    const container = document.getElementById('yt-audio-container');
    if (!container) return;

    ytPlayer = new YT.Player('yt-audio-player', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        playsinline: 1,
        enablejsapi: 1,
        origin: location.origin,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      }
    });
  }

  function onPlayerReady(event) {
    ytReady = true;
    ytPlayer.setVolume(state.volume);
    updateAdShieldStatus('Protected');
    startAdWatchdog();
  }

  function onPlayerStateChange(event) {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === YT.PlayerState.PLAYING) {
      state.isPlaying = true;
      updatePlayPauseButton();
      startProgressTimer();
      updateMediaSession();
      checkAndBypassAds();
    } else if (event.data === YT.PlayerState.PAUSED) {
      state.isPlaying = false;
      updatePlayPauseButton();
      stopProgressTimer();
    } else if (event.data === YT.PlayerState.ENDED) {
      handleTrackEnd();
    } else if (event.data === YT.PlayerState.BUFFERING) {
      checkAndBypassAds();
    }
  }

  function onPlayerError(event) {
    console.warn('[ZeroMusic] Playback error code:', event.data);
    showToast('Playback error on this song. Skipping to next...');
    setTimeout(playNext, 1200);
  }

  // ── Active Ad-Shield Watchdog ──
  function startAdWatchdog() {
    if (adWatchdogInterval) clearInterval(adWatchdogInterval);
    adWatchdogInterval = setInterval(() => {
      if (state.isPlaying) {
        checkAndBypassAds();
      }
    }, 250);
  }

  function checkAndBypassAds() {
    if (!ytPlayer || typeof ytPlayer.getVideoData !== 'function') return;

    try {
      const videoData = ytPlayer.getVideoData();
      const currentVideoId = videoData ? videoData.video_id : null;

      // If video_id does not match our current requested track id, an ad is playing!
      if (state.currentTrack && currentVideoId && currentVideoId !== state.currentTrack.id) {
        if (!state.isBypassingAd) {
          state.isBypassingAd = true;
          ytPlayer.mute();
          // Fast-forward through ad at maximum rate
          if (typeof ytPlayer.setPlaybackRate === 'function') {
            ytPlayer.setPlaybackRate(16);
          }
          updateAdShieldStatus('Bypassing Ad ⚡', true);
        }
      } else {
        // Real track is playing
        if (state.isBypassingAd) {
          state.isBypassingAd = false;
          if (typeof ytPlayer.setPlaybackRate === 'function') {
            ytPlayer.setPlaybackRate(1);
          }
          if (!state.isMuted) {
            ytPlayer.unMute();
            ytPlayer.setVolume(state.volume);
          }
          updateAdShieldStatus('Protected');
        }
      }
    } catch (e) {
      // Ignore cross-origin security glitches
    }
  }

  function updateAdShieldStatus(text, isBypassing) {
    const badge = document.getElementById('ad-shield-badge');
    if (!badge) return;
    badge.innerHTML = `<span class="ad-pulse ${isBypassing ? 'active-bypass' : ''}"></span> Ad-Shield: ${text}`;
  }

  // ── Playback Controls ──
  function playTrack(track, queueList, index) {
    if (!track || !track.id) return;

    state.currentTrack = track;
    if (queueList) {
      state.queue = queueList;
      state.queueIndex = index !== undefined ? index : queueList.findIndex(t => t.id === track.id);
    } else if (state.queueIndex === -1) {
      state.queue = [track];
      state.queueIndex = 0;
    }

    // Save to history
    addToHistory(track);

    // Update bottom player UI
    updatePlayerUI(track);

    // Fetch synced lyrics
    fetchLyrics(track);

    // Load in YouTube player
    if (ytReady && ytPlayer) {
      ytPlayer.loadVideoById({
        videoId: track.id,
        suggestedQuality: 'hd720'
      });
      state.isPlaying = true;
      updatePlayPauseButton();
    } else {
      // If player not yet ready, retry shortly
      setTimeout(() => playTrack(track), 400);
    }

    renderQueue();
  }

  function togglePlay() {
    if (!state.currentTrack && state.queue.length > 0) {
      playTrack(state.queue[0], state.queue, 0);
      return;
    }
    if (!ytReady || !ytPlayer) return;

    if (state.isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }

  function playNext() {
    if (state.queue.length === 0) return;

    let nextIndex;
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      nextIndex = state.queueIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeatMode === 1) { // Repeat All
          nextIndex = 0;
        } else {
          return; // Stop at end of queue
        }
      }
    }
    playTrack(state.queue[nextIndex], state.queue, nextIndex);
  }

  function playPrevious() {
    if (state.currentTime > 4) {
      seekTo(0);
      return;
    }
    if (state.queue.length === 0) return;

    let prevIndex = state.queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.queue.length - 1;
    }
    playTrack(state.queue[prevIndex], state.queue, prevIndex);
  }

  function handleTrackEnd() {
    if (state.repeatMode === 2) { // Repeat One
      seekTo(0);
      ytPlayer.playVideo();
      return;
    }
    playNext();
  }

  function seekTo(seconds) {
    if (!ytReady || !ytPlayer) return;
    ytPlayer.seekTo(seconds, true);
    state.currentTime = seconds;
    updateProgressUI();
  }

  function setVolume(val) {
    state.volume = Math.max(0, Math.min(100, val));
    localStorage.setItem('zm_volume', state.volume);
    if (ytReady && ytPlayer && !state.isMuted) {
      ytPlayer.setVolume(state.volume);
    }
    updateVolumeUI();
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    if (ytReady && ytPlayer) {
      if (state.isMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
        ytPlayer.setVolume(state.volume);
      }
    }
    updateVolumeUI();
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    localStorage.setItem('zm_shuffle', state.isShuffle);
    const btn = document.getElementById('btn-shuffle');
    if (btn) btn.classList.toggle('active', state.isShuffle);
    showToast(state.isShuffle ? 'Shuffle enabled' : 'Shuffle disabled');
  }

  function toggleRepeat() {
    state.repeatMode = (state.repeatMode + 1) % 3;
    localStorage.setItem('zm_repeat', state.repeatMode);
    const btn = document.getElementById('btn-repeat');
    if (btn) {
      btn.classList.remove('repeat-one', 'repeat-all');
      if (state.repeatMode === 1) {
        btn.classList.add('repeat-all');
        showToast('Repeat all');
      } else if (state.repeatMode === 2) {
        btn.classList.add('repeat-one');
        showToast('Repeat current track');
      } else {
        showToast('Repeat off');
      }
    }
  }

  // ── Progress & Timeline ──
  function startProgressTimer() {
    stopProgressTimer();
    progressInterval = setInterval(() => {
      if (!ytReady || !ytPlayer || !state.isPlaying) return;
      try {
        const cur = ytPlayer.getCurrentTime() || 0;
        const dur = ytPlayer.getDuration() || 0;
        state.currentTime = cur;
        state.duration = dur;
        updateProgressUI();
        syncLyricsWithTime(cur);
      } catch (e) {}
    }, 200);
  }

  function stopProgressTimer() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function formatTime(secs) {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateProgressUI() {
    const elapsedEl = document.getElementById('time-elapsed');
    const durationEl = document.getElementById('time-duration');
    const progressBar = document.getElementById('playback-progress');
    const progressFill = document.getElementById('progress-bar-fill');

    if (elapsedEl) elapsedEl.textContent = formatTime(state.currentTime);
    if (durationEl) durationEl.textContent = formatTime(state.duration);

    if (state.duration > 0) {
      const pct = (state.currentTime / state.duration) * 100;
      if (progressBar) progressBar.value = pct;
      if (progressFill) progressFill.style.width = `${pct}%`;
    }
  }

  function updateVolumeUI() {
    const slider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('btn-mute');
    if (slider) slider.value = state.isMuted ? 0 : state.volume;
    if (muteBtn) {
      muteBtn.innerHTML = state.isMuted || state.volume === 0
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    }
  }

  function updatePlayPauseButton() {
    const btn = document.getElementById('btn-play-pause');
    if (!btn) return;
    btn.innerHTML = state.isPlaying
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    btn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
  }

  function updatePlayerUI(track) {
    const titleEl = document.getElementById('player-track-title');
    const artistEl = document.getElementById('player-track-artist');
    const artEl = document.getElementById('player-track-art');
    const likeBtn = document.getElementById('btn-like-current');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (artEl) {
      artEl.src = track.thumbnail || 'https://via.placeholder.com/60/1a1a1a/f97316?text=ZM';
      artEl.alt = track.title;
    }
    if (likeBtn) {
      const isLiked = isTrackLiked(track.id);
      likeBtn.classList.toggle('liked', isLiked);
      likeBtn.innerHTML = isLiked
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    }

    // Now playing drawer artwork
    const lyricsArt = document.getElementById('lyrics-large-art');
    const lyricsTitle = document.getElementById('lyrics-track-title');
    const lyricsArtist = document.getElementById('lyrics-track-artist');
    if (lyricsArt) lyricsArt.src = track.thumbnail;
    if (lyricsTitle) lyricsTitle.textContent = track.title;
    if (lyricsArtist) lyricsArtist.textContent = track.artist;
  }

  // ── MediaSession API ──
  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !state.currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.currentTrack.title,
      artist: state.currentTrack.artist,
      album: 'ZeroMusic',
      artwork: [
        { src: state.currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', togglePlay);
    navigator.mediaSession.setActionHandler('pause', togglePlay);
    navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seekTo(details.seekTime);
    });
  }

  // ── Synced Lyrics (LRCLIB) ──
  async function fetchLyrics(track) {
    const container = document.getElementById('lyrics-lines-container');
    if (!container) return;

    container.innerHTML = '<div class="lyrics-status"><span class="zm-spinner"></span> Syncing lyrics from LRCLIB...</div>';
    state.lyrics = [];
    state.activeLyricIndex = -1;

    try {
      // 1. Direct match with trackName + artistName
      let url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(track.artist)}&track_name=${encodeURIComponent(track.title)}`;
      let res = await fetch(url);
      let data = null;

      if (res.ok) {
        data = await res.json();
      }

      // 2. Fallback to search if exact match empty
      if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
        const cleanQuery = (track.title + ' ' + track.artist).replace(/[^\w\s]/gi, ' ').trim();
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanQuery)}`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const list = await searchRes.json();
          if (Array.isArray(list) && list.length > 0) {
            data = list.find(item => item.syncedLyrics) || list[0];
          }
        }
      }

      if (data && data.syncedLyrics) {
        state.lyrics = parseLRC(data.syncedLyrics);
        renderSyncedLyrics(state.lyrics);
      } else if (data && data.plainLyrics) {
        state.lyrics = [];
        renderPlainLyrics(data.plainLyrics);
      } else {
        container.innerHTML = '<div class="lyrics-status">No lyrics found for this track.</div>';
      }
    } catch (e) {
      console.warn('[ZeroMusic] Lyrics fetch failed:', e);
      container.innerHTML = '<div class="lyrics-status">Couldn\'t load lyrics at this moment.</div>';
    }
  }

  function parseLRC(lrcText) {
    const lines = lrcText.split('\n');
    const result = [];
    const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

    for (const line of lines) {
      const match = timeReg.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const millis = match[3] ? parseFloat('0.' + match[3]) : 0;
        const totalSec = minutes * 60 + seconds + millis;
        const text = line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();
        if (text) {
          result.push({ time: totalSec, text: text });
        }
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }

  function renderSyncedLyrics(lyrics) {
    const container = document.getElementById('lyrics-lines-container');
    if (!container) return;

    if (lyrics.length === 0) {
      container.innerHTML = '<div class="lyrics-status">Instrumental or empty lyrics</div>';
      return;
    }

    container.innerHTML = lyrics.map((item, i) => `
      <div class="lyric-line" data-index="${i}" data-time="${item.time}">
        ${escapeHtml(item.text)}
      </div>
    `).join('');

    // Clicking a line seeks directly to that line!
    container.querySelectorAll('.lyric-line').forEach(el => {
      el.addEventListener('click', () => {
        const time = parseFloat(el.dataset.time);
        seekTo(time);
      });
    });
  }

  function renderPlainLyrics(plainText) {
    const container = document.getElementById('lyrics-lines-container');
    if (!container) return;
    container.innerHTML = `<div class="plain-lyrics">${escapeHtml(plainText).replace(/\n/g, '<br/>')}</div>`;
  }

  function syncLyricsWithTime(currentTime) {
    if (state.lyrics.length === 0) return;

    let activeIdx = -1;
    for (let i = 0; i < state.lyrics.length; i++) {
      if (currentTime >= state.lyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }

    if (activeIdx !== state.activeLyricIndex) {
      state.activeLyricIndex = activeIdx;
      const container = document.getElementById('lyrics-lines-container');
      if (!container) return;

      container.querySelectorAll('.lyric-line').forEach((el, idx) => {
        if (idx === activeIdx) {
          el.classList.add('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          el.classList.remove('active');
        }
      });
    }
  }

  // ── Search & Instant Suggestions ──
  let searchTimeout = null;

  function initSearch() {
    const input = document.getElementById('zm-search-input');
    const suggestDropdown = document.getElementById('zm-search-suggestions');
    const clearBtn = document.getElementById('zm-search-clear');

    if (!input) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      clearTimeout(searchTimeout);
      if (!q) {
        if (suggestDropdown) suggestDropdown.style.display = 'none';
        return;
      }

      // Fast typing suggestions
      searchTimeout = setTimeout(() => {
        fetchSuggestions(q);
      }, 180);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) {
          if (suggestDropdown) suggestDropdown.style.display = 'none';
          executeSearch(q);
        }
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        if (suggestDropdown) suggestDropdown.style.display = 'none';
        input.focus();
      });
    }

    // Genre / Mood tags
    document.querySelectorAll('.genre-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const genre = tag.dataset.genre;
        if (genre === 'all') {
          switchMainView('home');
        } else {
          if (input) input.value = genre;
          executeSearch(genre);
        }
      });
    });
  }

  function fetchSuggestions(query) {
    const suggestDropdown = document.getElementById('zm-search-suggestions');
    if (!suggestDropdown) return;

    // Use JSONP with Google's public YouTube suggest endpoint
    const scriptId = 'yt-suggest-script';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    window.handleSuggestCallback = function (data) {
      const suggestions = (data && data[1]) ? data[1].map(item => item[0]) : [];
      renderSuggestions(suggestions);
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&jsonp=handleSuggestCallback`;
    document.body.appendChild(script);
  }

  function renderSuggestions(list) {
    const dropdown = document.getElementById('zm-search-suggestions');
    if (!dropdown) return;

    if (!list || list.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = list.slice(0, 6).map(text => `
      <div class="suggest-item" data-query="${escapeHtml(text)}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>${escapeHtml(text)}</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.suggest-item').forEach(item => {
      item.addEventListener('click', () => {
        const q = item.dataset.query;
        const input = document.getElementById('zm-search-input');
        if (input) input.value = q;
        dropdown.style.display = 'none';
        executeSearch(q);
      });
    });
  }

  // ── Full Search Execution ──
  async function executeSearch(query) {
    switchMainView('search');
    const container = document.getElementById('search-results-grid');
    const searchHeader = document.getElementById('search-results-header');

    if (searchHeader) searchHeader.textContent = `Results for "${query}"`;
    if (container) container.innerHTML = '<div class="zm-loading"><span class="zm-spinner"></span> Searching ZeroMusic catalog...</div>';

    try {
      // 1. Try our serverless API endpoint on zero.skillissue.gg
      let res = await fetch(`/api/music-search?q=${encodeURIComponent(query)}`);
      let tracks = [];

      if (res.ok) {
        const data = await res.json();
        tracks = data.tracks || [];
      }

      // 2. Client-side fallback if API is not deployed on current host
      if (!tracks || tracks.length === 0) {
        tracks = await fallbackSearch(query);
      }

      if (tracks.length > 0) {
        renderTrackGrid(container, tracks);
      } else {
        container.innerHTML = '<div class="zm-empty">No tracks found. Try a different search term.</div>';
      }
    } catch (e) {
      console.warn('[ZeroMusic] Search API failed, trying fallback:', e);
      const fallbackTracks = await fallbackSearch(query);
      if (fallbackTracks.length > 0) {
        renderTrackGrid(container, fallbackTracks);
      } else {
        container.innerHTML = '<div class="zm-empty">Unable to fetch search results right now.</div>';
      }
    }
  }

  async function fallbackSearch(query) {
    // Curated matching or filter against popular songs
    const qLower = query.toLowerCase();
    const matches = TRENDING_TRACKS.filter(t =>
      t.title.toLowerCase().includes(qLower) || t.artist.toLowerCase().includes(qLower)
    );
    return matches.length > 0 ? matches : TRENDING_TRACKS.slice(0, 6);
  }

  function renderTrackGrid(container, tracks) {
    if (!container) return;
    container.innerHTML = tracks.map((track, idx) => `
      <div class="track-card ${state.currentTrack && state.currentTrack.id === track.id ? 'now-playing-card' : ''}" data-id="${track.id}" data-index="${idx}">
        <div class="card-art-wrap">
          <img src="${track.thumbnail}" alt="${escapeHtml(track.title)}" loading="lazy" />
          <button class="card-play-btn" aria-label="Play ${escapeHtml(track.title)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>
        <div class="card-info">
          <h4 class="card-title" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</h4>
          <p class="card-artist" title="${escapeHtml(track.artist)}">${escapeHtml(track.artist)}</p>
        </div>
        <div class="card-actions">
          <span class="card-duration">${track.duration || '3:30'}</span>
          <button class="btn-icon btn-card-queue" title="Add to Queue" aria-label="Add to Queue">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="btn-icon btn-card-like ${isTrackLiked(track.id) ? 'liked' : ''}" title="Like" aria-label="Like">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isTrackLiked(track.id) ? '#f97316' : 'none'}" stroke="${isTrackLiked(track.id) ? '#f97316' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Attach click events
    container.querySelectorAll('.track-card').forEach(card => {
      const idx = parseInt(card.dataset.index, 10);
      const track = tracks[idx];

      card.querySelector('.card-play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        playTrack(track, tracks, idx);
      });

      card.addEventListener('click', () => {
        playTrack(track, tracks, idx);
      });

      card.querySelector('.btn-card-queue').addEventListener('click', (e) => {
        e.stopPropagation();
        addToQueue(track);
      });

      card.querySelector('.btn-card-like').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLikeTrack(track);
        e.currentTarget.classList.toggle('liked', isTrackLiked(track.id));
        e.currentTarget.querySelector('svg').setAttribute('fill', isTrackLiked(track.id) ? '#f97316' : 'none');
        e.currentTarget.querySelector('svg').setAttribute('stroke', isTrackLiked(track.id) ? '#f97316' : 'currentColor');
      });
    });
  }

  // ── Library & Local Persistence ──
  function isTrackLiked(id) {
    return state.likedTracks.some(t => t.id === id);
  }

  function toggleLikeTrack(track) {
    const idx = state.likedTracks.findIndex(t => t.id === track.id);
    if (idx >= 0) {
      state.likedTracks.splice(idx, 1);
      showToast('Removed from Liked Songs');
    } else {
      state.likedTracks.unshift(track);
      showToast('Saved to Liked Songs ♥');
    }
    localStorage.setItem('zm_liked', JSON.stringify(state.likedTracks));
    if (state.currentTrack && state.currentTrack.id === track.id) {
      updatePlayerUI(track);
    }
    renderLibrary();
  }

  function addToHistory(track) {
    state.history = [track, ...state.history.filter(t => t.id !== track.id)].slice(0, 50);
    localStorage.setItem('zm_history', JSON.stringify(state.history));
  }

  function addToQueue(track) {
    state.queue.push(track);
    renderQueue();
    showToast(`Added "${track.title}" to Queue`);
  }

  function renderLibrary() {
    const likedContainer = document.getElementById('liked-songs-list');
    const historyContainer = document.getElementById('history-songs-list');

    if (likedContainer) {
      if (state.likedTracks.length === 0) {
        likedContainer.innerHTML = '<div class="zm-empty">No liked songs yet. Click ♥ on any track to save it here.</div>';
      } else {
        renderTrackRows(likedContainer, state.likedTracks);
      }
    }

    if (historyContainer) {
      if (state.history.length === 0) {
        historyContainer.innerHTML = '<div class="zm-empty">Your listening history will appear here.</div>';
      } else {
        renderTrackRows(historyContainer, state.history);
      }
    }
  }

  function renderTrackRows(container, tracks) {
    container.innerHTML = tracks.map((track, idx) => `
      <div class="track-row ${state.currentTrack && state.currentTrack.id === track.id ? 'active-row' : ''}" data-id="${track.id}" data-index="${idx}">
        <span class="row-num">${idx + 1}</span>
        <img class="row-art" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" />
        <div class="row-info">
          <div class="row-title">${escapeHtml(track.title)}</div>
          <div class="row-artist">${escapeHtml(track.artist)}</div>
        </div>
        <span class="row-duration">${track.duration || '3:30'}</span>
        <button class="btn-icon btn-row-play" title="Play">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.track-row').forEach(row => {
      const idx = parseInt(row.dataset.index, 10);
      const track = tracks[idx];
      row.addEventListener('click', () => {
        playTrack(track, tracks, idx);
      });
    });
  }

  function renderQueue() {
    const list = document.getElementById('queue-items-list');
    const badge = document.getElementById('queue-count-badge');
    if (badge) badge.textContent = state.queue.length;

    if (!list) return;
    if (state.queue.length === 0) {
      list.innerHTML = '<div class="zm-empty">Queue is empty</div>';
      return;
    }

    list.innerHTML = state.queue.map((track, i) => `
      <div class="queue-row ${i === state.queueIndex ? 'current-queue-item' : ''}" data-index="${i}">
        <span class="queue-num">${i === state.queueIndex ? '▶' : i + 1}</span>
        <img class="queue-art" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" />
        <div class="queue-info">
          <div class="queue-title">${escapeHtml(track.title)}</div>
          <div class="queue-artist">${escapeHtml(track.artist)}</div>
        </div>
        <button class="queue-remove" title="Remove" aria-label="Remove">✕</button>
      </div>
    `).join('');

    list.querySelectorAll('.queue-row').forEach(row => {
      const idx = parseInt(row.dataset.index, 10);
      row.addEventListener('click', (e) => {
        if (e.target.classList.contains('queue-remove')) {
          e.stopPropagation();
          state.queue.splice(idx, 1);
          if (idx < state.queueIndex) state.queueIndex--;
          renderQueue();
          return;
        }
        playTrack(state.queue[idx], state.queue, idx);
      });
    });
  }

  // ── Navigation & View Switching ──
  function switchMainView(viewName) {
    state.activeView = viewName;

    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    document.querySelectorAll('.main-content-section').forEach(sec => {
      sec.style.display = sec.id === `section-${viewName}` ? 'block' : 'none';
    });

    if (viewName === 'library') {
      renderLibrary();
    }
  }

  function initNavigation() {
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        switchMainView(item.dataset.view);
      });
    });

    // Lyrics drawer toggle
    const lyricsBtn = document.getElementById('btn-lyrics-toggle');
    const lyricsDrawer = document.getElementById('lyrics-drawer');
    const closeLyricsBtn = document.getElementById('btn-close-lyrics');

    if (lyricsBtn && lyricsDrawer) {
      lyricsBtn.addEventListener('click', () => {
        state.isLyricsOpen = !state.isLyricsOpen;
        lyricsDrawer.classList.toggle('open', state.isLyricsOpen);
        lyricsBtn.classList.toggle('active', state.isLyricsOpen);
      });
    }

    if (closeLyricsBtn && lyricsDrawer) {
      closeLyricsBtn.addEventListener('click', () => {
        state.isLyricsOpen = false;
        lyricsDrawer.classList.remove('open');
        if (lyricsBtn) lyricsBtn.classList.remove('active');
      });
    }

    // Queue drawer toggle
    const queueBtn = document.getElementById('btn-queue-toggle');
    const queueDrawer = document.getElementById('queue-drawer');
    const closeQueueBtn = document.getElementById('btn-close-queue');

    if (queueBtn && queueDrawer) {
      queueBtn.addEventListener('click', () => {
        state.isQueueOpen = !state.isQueueOpen;
        queueDrawer.classList.toggle('open', state.isQueueOpen);
        queueBtn.classList.toggle('active', state.isQueueOpen);
      });
    }

    if (closeQueueBtn && queueDrawer) {
      closeQueueBtn.addEventListener('click', () => {
        state.isQueueOpen = false;
        queueDrawer.classList.remove('open');
        if (queueBtn) queueBtn.classList.remove('active');
      });
    }

    // Play/Pause, Next, Prev, Shuffle, Repeat buttons
    const playPauseBtn = document.getElementById('btn-play-pause');
    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    const shuffleBtn = document.getElementById('btn-shuffle');
    const repeatBtn = document.getElementById('btn-repeat');
    const likeCurrentBtn = document.getElementById('btn-like-current');

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (prevBtn) prevBtn.addEventListener('click', playPrevious);
    if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);
    if (likeCurrentBtn) {
      likeCurrentBtn.addEventListener('click', () => {
        if (state.currentTrack) toggleLikeTrack(state.currentTrack);
      });
    }

    // Progress bar dragging/clicking
    const progressBar = document.getElementById('playback-progress');
    if (progressBar) {
      progressBar.addEventListener('input', (e) => {
        const pct = parseFloat(e.target.value);
        if (state.duration > 0) {
          const targetSec = (pct / 100) * state.duration;
          seekTo(targetSec);
        }
      });
    }

    // Volume slider & mute
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('btn-mute');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        setVolume(parseInt(e.target.value, 10));
      });
    }
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
  }

  // ── Keyboard Shortcuts ──
  function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(state.currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, state.currentTime - 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(state.volume + 5);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(state.volume - 5);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyL':
          e.preventDefault();
          const lyricsBtn = document.getElementById('btn-lyrics-toggle');
          if (lyricsBtn) lyricsBtn.click();
          break;
        case 'KeyQ':
          e.preventDefault();
          const queueBtn = document.getElementById('btn-queue-toggle');
          if (queueBtn) queueBtn.click();
          break;
      }
    });
  }

  // ── Toast Notifications ──
  function showToast(msg) {
    let toast = document.getElementById('zm-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'zm-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  // ── Initialize App ──
  document.addEventListener('DOMContentLoaded', () => {
    initDeviceRouting();
    initYouTubeEngine();
    initSearch();
    initNavigation();
    initKeyboardShortcuts();

    // Initial render of trending tracks on Home
    const trendingGrid = document.getElementById('trending-tracks-grid');
    if (trendingGrid) {
      renderTrackGrid(trendingGrid, TRENDING_TRACKS);
    }

    // Set initial volume UI
    updateVolumeUI();
  });

})();
