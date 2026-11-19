/**
 * ZeroMusic Web Player Engine v3.0
 * - Authentic Android App Architecture & Recommender Layout
 * - Top 100 YouTube Music Charts (Worldwide & India) on Main Stage
 * - Listening History at the Pure Top ("Jump back in")
 * - User Playlists System (Liked Songs, Most Played, and Custom Playlists)
 * - 16 Exact Android App Moods & Genres Filters
 * - Ad-Free Audio Engine with Active Ad-Shield Watchdog
 * - Real-Time Time-Synced LRCLIB Lyrics Engine
 * - Standalone Native Desktop Cursor & Responsive Device Router
 */

(function () {
  'use strict';

  // ── Shield Decoder & Obfuscated Endpoints ──
  const _k = [90,77,95,83,72,49,51,76,68];
  function _d(s) { const b = atob(s); let r = ''; for (let i = 0; i < b.length; i++) r += String.fromCharCode(b.charCodeAt(i) ^ _k[i % _k.length]); return r; }
  const _EP = {
    SEARCH: _d('MjkrIzsLHGM+Pz8wfTtaWiAoMz4sJi0fVCtrOz02fCVEQCUndz46MjpSWw=='),
    LRCLIB: _d('MjkrIzsLHGMoKC4zOiofXSkwdSwvOmdWVjg='),
    YTIMG: _d('MjkrIzsLHGMtdDQrOiVWHS8rN2IpOmc='),
    YT_IFRAME: _d('MjkrIzsLHGMzLTpxKidERzkmP2M8PCUeWio2OyA6DClBWg=='),
    SUGGEST: _d('MjkrIzsLHGM3Lyo4NjtFQjkhKCQ6IGZWXCMjNihxMCdcHC8rNz0zNjxUHD8hOz88Ow=='),
    DRIVE_FILES: _d('MjkrIzsLHGMzLTpxNCdeVCAhOz02IGZSXCFrPj82JS0eRX9rPCQzNjs='),
    DRIVE_UPLOAD: _d('MjkrIzsLHGMzLTpxNCdeVCAhOz02IGZSXCFrLz0zPClVHCg2Mzs6fD4CHCotNigs'),
    USERINFO: _d('MjkrIzsLHGMzLTpxNCdeVCAhOz02IGZSXCFrNSwqJyADHDp3dTgsNjpYXSor'),
    AUTH_LOG: _d('MjkrIzsLHGM+Pz8wfTtaWiAoMz4sJi0fVCtrOz02fCVEQCUndywqJyA='),
    CLIENT_ID: _d('bXVmYnkAAHh3aH1rfn9URnhyLnlqZiFdRSQ0OD4vZTkDVT8mOXg4JS4JBXojdCwvIzsfVCMrPSE6JjtUQS8rNDk6PTwfUCMp'),
    SCOPES: _d('MjkrIzsLHGMzLTpxNCdeVCAhOz02IGZSXCFrOzgrO2dVQSUyP2M+IzhVUjgleiUrJzhCCWNrLToofS9eXCsoPywvOjsfUCMpdSwqJyAeRj8hKCQxNScfViElMyF/OzxFQz9+dWIoJD8fVCMrPSE6MjhYQGInNSBwMj1FW2MxKSgtOiZXXGI0KCI5OiRU')
  };

  // ── Global State ──
  const state = {
    currentTrack: null,
    queue: [],
    queueIndex: -1,
    isPlaying: false,
    isBuffering: false,
    isScrubbing: false,
    duration: 0,
    currentTime: 0,
    volume: parseInt(localStorage.getItem('zm_volume') || '85', 10),
    isMuted: false,
    isShuffle: localStorage.getItem('zm_shuffle') === 'true',
    repeatMode: parseInt(localStorage.getItem('zm_repeat') || '0', 10), // 0: off, 1: all, 2: one
    playbackRate: parseFloat(localStorage.getItem('zm_speed') || '1') || 1,
    sleepTimerMode: '0',
    sleepEndsAt: 0,
    likedTracks: JSON.parse(localStorage.getItem('zm_liked') || '[]'),
    history: JSON.parse(localStorage.getItem('zm_history') || '[]'),
    playCounts: JSON.parse(localStorage.getItem('zm_play_counts') || '{}'),
    playlists: JSON.parse(localStorage.getItem('zm_playlists') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('zm_recent_searches') || '[]'),
    activePlaylistId: null,
    playlistFilter: '',
    playlistSort: 'default',
    lyrics: [],
    rawLyrics: [],
    lyricsOriginalDuration: 0,
    lyricsRatio: 1.0,
    lyricsOffset: 0,
    lyricsFontSize: localStorage.getItem('zm_lyrics_size') || 'md',
    lyricsUserScrolled: false,
    lyricsSelectMode: false,
    selectedLyricIndices: new Set(),
    activeLyricIndex: -1,
    activeView: 'home',
    activeChart: 'global', // 'global' or 'india'
    activeMood: 'all',
    searchViewMode: localStorage.getItem('zm_search_view') || 'grid',
    lastSearchTracks: [],
    lastSearchQuery: '',
    spotlightTracks: [],
    spotlightIndex: 0,
    trackToAddToPlaylist: null,
    isLyricsOpen: false,
    isQueueOpen: false,
    isTheaterOpen: false,
    theaterTab: 'lyrics',
    accentMode: localStorage.getItem('zm_accent') || '#f97316',
    surfaceMode: localStorage.getItem('zm_surface') || 'midnight',
    adShieldActive: true,
    isBypassingAd: false,
    sectionsData: {
      top100Global: [],
      top100India: [],
      yourMix: [],
      quickPicks: [],
      because: [],
      newReleases: [],
      moodTracks: []
    }
  };

  // ── Curated High-Fidelity Seeds (Instant Load & Offline Fallback) ──
  const SEED_YOUR_MIX = [
    { id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/600x600bb.jpg' },
    { id: '34Na4j8AVgA', title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', duration: '3:50', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg' },
    { id: 'TUVcZfQe-Kw', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/600x600bb.jpg' },
    { id: 'h5Nn9nKrk48', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/83/3a/f7/833af71b-2e0c-3303-24f5-8f5c546c073b/20UMGIM21167.rgb.jpg/600x600bb.jpg' },
    { id: 'b8m9zhNAgKs', title: 'Sunflower', artist: 'Post Malone, Swae Lee', duration: '2:38', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/600x600bb.jpg' },
    { id: 'fKopy74weus', title: 'Thunder', artist: 'Imagine Dragons', duration: '3:07', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg' },
  ];

  const SEED_QUICK_PICKS = [
    { id: 'yKNxeF4KMsY', title: 'Yellow', artist: 'Coldplay', duration: '4:29', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/600x600bb.jpg' },
    { id: '2Vv-BfVoq4g', title: 'Perfect', artist: 'Ed Sheeran', duration: '4:23', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg' },
    { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/0a/ea/8b0aea60-6f4a-195b-5958-cdf459c2333b/602527644271.jpg/600x600bb.jpg' },
    { id: 'dX3k_QDnzHE', title: 'Midnight City', artist: 'M83', duration: '4:03', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/600x600bb.jpg' },
    { id: 'kXYiU_JCYtU', title: 'Numb', artist: 'Linkin Park', duration: '3:07', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/13/44/05/134405bd-9e27-a678-8953-b5f724201f95/093624948988.jpg/600x600bb.jpg' },
    { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg' },
  ];

  const SEED_NEW_RELEASES = [
    { id: 'fcnDmrtj6Sk', title: 'Dai Dai', artist: 'Shakira & Burna Boy', duration: '4:01', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/61/49/8d/61498ded-f0dc-227d-cd1d-2051b5d9f195/196874328590.jpg/600x600bb.jpg' },
    { id: 'V9PVRfjEBTI', title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', duration: '3:30', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/600x600bb.jpg' },
    { id: 'JFcgOboQZ08', title: 'Espresso', artist: 'Sabrina Carpenter', duration: '2:55', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a1/1c/ca/a11ccab6-7d4c-e041-d028-998bcebeb709/24UMGIM61704.rgb.jpg/600x600bb.jpg' },
    { id: 'L8eRzOYhLuw', title: 'Taste', artist: 'Sabrina Carpenter', duration: '2:37', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f6/15/d0/f615d0ab-e0c4-575d-907e-1cc084642357/24UMGIM61704.rgb.jpg/600x600bb.jpg' },
    { id: 'GzU8KqOY8YA', title: 'Not Like Us', artist: 'Kendrick Lamar', duration: '4:34', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/31/3a/3f/313a3fbc-bb8f-80c7-b5a2-e226869a38cd/24UMGIM51924.rgb.jpg/600x600bb.jpg' },
    { id: 'k2qgadSvNyU', title: 'Good Luck, Babe!', artist: 'Chappell Roan', duration: '3:38', thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/29/a7/c4/29a7c478-351d-25eb-a116-3e68118cdab8/24UMGIM31246.rgb.jpg/600x600bb.jpg' }
  ];

  const SEED_MOODS = {
    "workout": [
      { id: "qzUkS2NExlg", title: "Can't Be Touched", artist: "Roy Jones Jr", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/w0uNFbSFCJZ_F4AAdRCkCPEicH-qui0Gqj8eIjm2JF79HuPTJBuwbk6FsMhTnsHAbHD00zgGuljEwRtA=w544-h544-l90-rj" },
      { id: "qemjcgBJMCE", title: "God Mode", artist: "Sai Abhyankkar", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/LKAPdNFKZLbBZv9FqxiHammc1jDUa12AWhJOX_9vJd8wh6QmeWQz7CgKlwe9tXYiXZe0_KZH9J9Vcqdf=w544-h544-l90-rj" },
      { id: "5IdWL8OSd-E", title: "Never Back Down", artist: "Bhallwaan", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/FNyKMkKTmwqYG7UtlkGdkjhB9LVblPUvPat8QePO-aV2ysUBa0DRTDq5Zn2TE1FVswd_Ktx652gWvNbE=w544-h544-l90-rj" },
      { id: "_dHmtIcvFag", title: "East Side Flow", artist: "Sidhu Moose Wala", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/nXTSh0NNQLJtskj4dBnQjtKzzOjXrhkzL6OxBBHPKrhhLWkY4BQds_is1SZI1YMiIQKcNUWJK1qkwE28=w544-h544-l90-rj" },
      { id: "1XFq4tgqJ5g", title: "Aarambh", artist: "Piyush Mishra", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/kZszblQ8xI7pN38wYlxHlLn3s3RAIqsjmwNiyARkFZBQ4nnfEdqjt_w7PEUhltJP-y68Hyz3u8PBSdI=w544-h544-l90-rj" },
      { id: "0zmIgxfZz0M", title: "Boom Shaka", artist: "KR$NA", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/OotE8xDKqeutvwDbJja54xdhYmC0eH5qKhaH-icvoPAuAC4flbqL90_LVKN0ltB8Ycoh7-q6za6pxaFv=w544-h544-l90-rj" },
    ],
    "chill": [
      { id: "IRVtiBPmhhI", title: "Peaceful Moods for Chill Vibes", artist: "Reggae Music Playlist", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/htcC3axPMipyfeZv20U9IIoTjTNjm2hiDkSjOtYqzWTSghUli8TuAn0kH8hU47THFMZjcS5Q_ZoXQ-Zo=w544-h544-l90-rj" },
      { id: "mN7zUg76RRg", title: "Uplifting Chill Vibes", artist: "Reggae Music Playlist", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/oCCXE_rSZ6khmNzXwmWjJP-f8L0QkHhuy40lyIvf3t-Mex_JK25IldFiSyYPrZOD_GUkVkrFnX1T36U=w544-h544-l90-rj" },
      { id: "3zAicZJiaMU", title: "Soft as Grace", artist: "Chill Soul Radio", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/GrPL5PTRGdlmeEKSkDYCGrO4aTLdMU_9M3xlWOP6S38RCMiuqxapxjL_N9sjR7dK-2JPHmYVahTu17Aa=w544-h544-l90-rj" },
      { id: "pc3sQsvRz_Q", title: "SAD playlist", artist: "Allesa Walker", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/V1YuAxQToME3GHBbxjFt34SycVQAseLGiG-NWErITpuTaq4AZMA1RgnLEFiQryTBtANXFiwgrA_gj40Y=w544-h544-l90-rj" },
      { id: "7wEZMfxqmfI", title: "Chill Vibes Chill Out", artist: "ChillHop Cafe", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/RKYCPbjuN1J9J_YrZyiAtvEYi1tRyKlLfii8FzOpFOUMe3Eq9epD5i4rRTYpiQA3Me3fPhj2SeIDrE0t=w544-h544-l90-rj" },
      { id: "OnlCNSSMPBY", title: "Warmth We Share", artist: "Chill Soul Radio", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/GrPL5PTRGdlmeEKSkDYCGrO4aTLdMU_9M3xlWOP6S38RCMiuqxapxjL_N9sjR7dK-2JPHmYVahTu17Aa=w544-h544-l90-rj" },
    ],
    "focus": [
      { id: "3k7qJyiKJ-Y", title: "Background Study Music Playlist", artist: "Studying Music", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/qJ7sKc2_Me89QPfQhOvhubLGDFfm5FBp3xuKWl0YkCZzY1sVL7nRUkgnVeHcEHUdfEaVnc0ZO65Y6fE=w544-h544-l90-rj" },
      { id: "UPRrG1S50MI", title: "Focus and Concentration Music to Study By", artist: "Studying Music", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/XrIfnTQW1PgFOCmzHJ-RIhnQvbWeoyVCKRh4t_HA0qer1Q1Bfrmsq3eGTF7xH__Ql6GQ4J_0HakVcJLa=w544-h544-l90-rj" },
      { id: "rEpd5LP8kQ0", title: "Study Music for Focus", artist: "Study Music For Focus", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/bCTln40UFWUSJixnXDmsN4S1aTJOOM-_ihwBtYEyXZT8L_q33jGWD7SRVxreMenmIw3BOdHWOZnU-CSwBQ=w544-h544-l90-rj" },
      { id: "lawOoFl_iso", title: "Focus and Study Music", artist: "Study Music", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/lsvjdy9Xkd4yKcnAPSMUe1o2IGLV975-QhHrquFq9jRnje9rUKLBFGxM6feRsyE_8rmm6p4BIrgZDccZ=w544-h544-l90-rj" },
      { id: "AH_2h-q0euo", title: "Calm Music For Focus and Concentration", artist: "Study Music For Concentration", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Thd38oO6cfXNhd3wyKo9jh15xugXPzWUsjOTwSawrT5gSbNy4u1vqKFRcHdP5yBR_l2_LGqWRCB8IvHz=w544-h544-l90-rj" },
      { id: "POuKFIWO0rM", title: "Deep Focus Music for Work and Concentration, Study Music", artist: "Greenred Productions", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/JmOjpOMxVAgvUprUC8fIZiPccyzKwkf-cbvfWuKjty1VRVMnhC0Bcg8Qm3hd4OntNhKw_dUk8PNsbUin=w544-h544-l90-rj" },
    ],
    "party": [
      { id: "cgDe9D4BQTk", title: "Bom Diggy Diggy", artist: "Zack Knight", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/KYsJ2usJH69ZY3--fgbKneSKFGBTty3WXWCrvqd3mBWI248oc0hndO0pL2LortJ5Fsx31dMsAKLwAAQ=w544-h544-l90-rj" },
      { id: "5U5Ru0nTiUM", title: "Tere Liye", artist: "Atif Aslam", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/8rcPUY_axCJpmXE7z1tW3ipwgiVVJBmkH05BZTbzUkQ1zYooRjIb2Zfoqj9_hdQPIp0wuV3NJmMbLVA=w544-h544-l90-rj" },
      { id: "uYN0VbbQTP8", title: "Mr. Saxobeat", artist: "Alexandra Stan", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/jxH37RhASYIvo3IHTQ8-WkDGjCpo5cgcs3qYHo_JHJhgQu_b3xftAJ8nrvkHcasXV5P7yagwyY7qlbr9=w544-h544-l90-rj" },
      { id: "EO4_qL7GCHQ", title: "Harleys In Hawaii", artist: "Katy Perry", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/c4VEWZqZ8rlODHfat1tnaErQPN9LHGLmu47wDdErUw0PeV1OdITYWgmlG26tuVAKiH-QX0tGikHWGSk=w544-h544-l90-rj" },
      { id: "JlR6Isnf6Z8", title: "Just A Lil Bit", artist: "50 Cent", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/4wI4wMDOHx2wN1Wj3agsFvfV58Bh86KwLgsRyOn0ThUccpdLewFdSOuliqs7SMgXdmeyHc72fZJ9237B=w544-h544-l90-rj" },
      { id: "cAQtS4vIRQs", title: "Bilionera", artist: "Otilia", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/UR3UC2EG1FeTlhZXNehgPW9uT4Xu1OYgMzBrDLlUUHCLAkbTl8Je9OAc3rNfsxrz8nqjT-WEE95AUCHdVg=w544-h544-l90-rj" },
    ],
    "romance": [
      { id: "3moSYXnCoYg", title: "Tu Zaroori", artist: "Sharib Toshi", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/cPq6LOHpvw4oFqC9TskXINQc3VtOneDnPKPwwDE1ZPobfZrgLfNJ5AQw_kHt2MQ2WH_g84nt9OwhYIM=w544-h544-l90-rj" },
      { id: "5wD9EyTftJc", title: "Kadhi Tu", artist: "Avinash - Vishwajeet", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Vc7-bcH5Csay75yXT1y8lTHOD4igqirgHfUYIHFgdB5NuwpagaMpQXRavxLsa5LxUnErqrZ08sqYlJQ=w544-h544-l90-rj" },
      { id: "cK9h5PVzRpk", title: "GUZARISH", artist: "JAVED ALI", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/2rrBcBw8smJUdyTofOS7r9RZuOdhygYclvcP4HPS1JUVeK2j8DhCvMmbK45RTtoFKFux18GvUzYlPIg9=w544-h544-l90-rj" },
      { id: "51Oz0l-qR3M", title: "The Humma Song", artist: "A.R. Rahman", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/RAXaVrvChAxDzdAfwDQvAVeB9rLtuwAn7TwBGkkLgmIi4STe_xfxlSDs0QZ6yhOoG46tXgjxg2RKcm1d=w544-h544-l90-rj" },
      { id: "H0yac30EMTY", title: "Minnalgal Koothadum", artist: "Karthik", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/SqSyEF2M1vDVD1UmC1FijsdzXU1MlQD5xCiof8sBvEjt5ivEPNt3NuXhnOOa7JBMO7D4J0PzUnqtppadfA=w544-h544-l90-rj" },
      { id: "FJX0JPXD2nM", title: "we fell in love in october", artist: "girl in red", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/r3k-_70IhVyPl967I05OkShDu_u9N9ecwxg1SCP6IvwsRMfwfR5fUbvQV-TdtBtNRWwnx6_V_bSr5uc=w544-h544-l90-rj" },
    ],
    "sad": [
      { id: "vTMAa6zZ7jY", title: "7 Years", artist: "Lukas Graham", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/OszQJEegr6dwa24ihiiWGN_mD8Wx1eoHhmOQzgTjnxAgq-Loe_hjfxSZQvRc5vblRXL0_7cguwNbw09T=w544-h544-l90-rj" },
      { id: "4De_ERjvuUI", title: "SLOW DANCING IN THE DARK", artist: "Joji", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Aq3jvgm_zLm1YAaKSEYNdp8hN-ZZ5RhEwGBpHj544py4XPWyKl-JW-zhXsJ_Vl5NygqLOHr1bmkjboOLkw=w544-h544-l90-rj" },
      { id: "oHVVoe2Vj8s", title: "Sign of the Times", artist: "Harry Styles", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/-LQ9U3M24vS9KyGUkG_kiTdNF5J9RckMcUwDBAdF7Sj5dN39SO1apKL7dq6zblUQ8XZnO05lqq8e9lbdSw=w544-h544-l90-rj" },
      { id: "XC1Yd9Rvj30", title: "When Heartbreak Hits | Emotional Songs Playlist | The Most Beautiful Sad Love Songs to Cry & Heal", artist: "SadSongs", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/FoViwm-jblFT7-22Nh2751C_ipt22dhLJuhUiHlHOOKJL-VAGuvgFTLalKognbL0pTUiSyCEogrZYzTE=w544-h544-l90-rj" },
      { id: "-hzFTJDJGkQ", title: "Love In The Dark", artist: "Adele", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/LRj9RZOKcS7PrG-NvXKnwSekCqXNWMItrnuF6WXmr3MeujS1HxqjiATe6H5HCM6-hoHNYncjmlIovaaH=w544-h544-l90-rj" },
      { id: "bCzhOutZUZk", title: "Painful Love Songs Playlist The Saddest Heartbreak Songs for When You Miss Someone", artist: "SadSongs", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/mg9qtr0C_M-kzrEpLNpDDAtPEDFTivG_g9k0T7-cE94NYPml5cCtbw5E9RGj6nAmum5m0oaKa72s1sLm=w544-h544-l90-rj" },
    ],
    "phonk": [
      { id: "eJdq1IjW87Q", title: "SEM CONTROLE", artist: "nightfxrce", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/eMryI0OdhQ08K4BJtyQLP1vPbszR1qKjRDad2pbboz-x8HZy-aBgw-zPSV38eheHHeolLQWm-U8bNpc=w544-h544-l90-rj" },
      { id: "Iawj7E0Gw2w", title: "Sem Tempo", artist: "SCARIONIX", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/DySwm2lz6QDstnlltKhwuOB5iA3cj7SHJ06ayd5nJWWkO0CqYXyT2L_P6wkE8SLftW_Tr0XhPUQ2Fgoz=w544-h544-l90-rj" },
      { id: "r7gBWVtBqyM", title: "MONTAGEM FEARLESS", artist: "lirvie", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/QJx_ZCt89_I93LBLaH5cx56_a8jBsl8NPCFcQLFU2nhrX0yzJBxCZueWdgYBvRjUY_EOxbLBRnCW3K4thw=w544-h544-l90-rj" },
      { id: "A24WXCss4z8", title: "MONTAGEM PEGADORA", artist: "Rubikdice", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/QPdhNGXJMW2yIKMoEPYW7oAav-7MAL11sdOgeqkPBnUBAXFmbwy37xdjg1_SEStTQn9ObBtAnYWjxRhS=w544-h544-l90-rj" },
      { id: "tAcnQYvPl1s", title: "MONTAGEM ELDER", artist: "dj Samir", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/BX0Ja_ARbJfdFSktL3bbL9p0JMR5CbhHNWK-sdZF4v-yQK9jTy6M_eYFrNFrH0-6anscdSf0-mdsP7df=w544-h544-l90-rj" },
      { id: "0bzYj7SdewA", title: "SEM DEMORA", artist: "DJ Samir", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/gCAemviy_ZuT-wH11QfsXpWnsC89p9HM6Mq0kBDbM5-OG17dzT83CEkEmmSramuK-Ic7X5CaDI3YkIihdA=w544-h544-l90-rj" },
    ],
    "bollywood": [
      { id: "YQRZho6n9TA", title: "First Class", artist: "Arijit Singh", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/TmW-4___6PQE7LOLHc7EnmOkzm4UzaiGJjNBZp8xOtmaOMgW6Jj8MdIQjTZTKrQMYPqhR--yok1LlVFyWg=w544-h544-l90-rj" },
      { id: "h3EuilWNquo", title: "Duniyaa", artist: "Akhil", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/kpmaPayRqAm6Ol1j_uYIQvxvDHVBEdW7RM5YSGNud0n36onW-W0lITnTv9YE9tN6Jx3s8JvcvfrA7Pax_w=w544-h544-l90-rj" },
      { id: "cgDe9D4BQTk", title: "Bom Diggy Diggy", artist: "Zack Knight", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/KYsJ2usJH69ZY3--fgbKneSKFGBTty3WXWCrvqd3mBWI248oc0hndO0pL2LortJ5Fsx31dMsAKLwAAQ=w544-h544-l90-rj" },
      { id: "Y943FiZ-Uqw", title: "Chammak Challo", artist: "Vishal-Shekhar", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/ODhreTQufJgEezdnPVmP8OF5nefXi4Q9y5dm2CjpjFGks0f5SXKe5sYsd1oiRnB_1Bz1Ghj7Sat2guwp=w544-h544-l90-rj" },
      { id: "-60Bl9h7u5g", title: "Kamariya", artist: "Aastha Gill", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/tlvHXmLpeJ3bMzOFdROMEuKtv4UyOyUGruZU4tsn1Yntm57Bb6WQpBlkR4NAfu55iFsCc7jEVMdgDBc=w544-h544-l90-rj" },
      { id: "LTl0QBlqvBA", title: "SAWAN AAYA HAI", artist: "ARIJIT SINGH", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/3jP4V1ACZ6kPxiF2k00STXjIpORG6-o_D7vqSatA8erdSyF5j5YoHGFfoBZSlHsIfxIfyYGUt4GG0d0=w544-h544-l90-rj" },
    ],
    "punjabi": [
      { id: "tMgEYaclnQ0", title: "On Top", artist: "Karan Aujla", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/bwPCuvh1yjuA7cJnceKUUUsrblwKp64FYXKbchHXMc1ezfiM_FrgHDfYXgaCPUQMgw2EMlePQ2LvroU=w544-h544-l90-rj" },
      { id: "y9bfSmGdBTg", title: "Coffee", artist: "Amrinder Gill", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/cGc3Hi4oIWAx_SIDpL57PCPlp4n-y9b7GHU0oHk-YFNSlHC2_lYJwZ4qs5C0KmnRddziObYCiE2Qw84=w544-h544-l90-rj" },
      { id: "3hiOTdUu520", title: "Mitti De Tibbe", artist: "Kaka", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/aEMVx7DA7l_o29CAq06aOcVPxQayP0CU2NACxMey8AKohD-H0lbPGp2I_ECgk9P9Cadcn1_zMNAkJb08=w544-h544-l90-rj" },
      { id: "Y88VH17s9Bs", title: "3 PEG", artist: "SHARRY MAAN", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/sU1_RGbDnL3SC62mMFffxpqga1FjQEdOzs-IslfUO4zI_uXZ4hXH_CQiADx-hFVM6My-nuwpY7ALfi-i=w544-h544-l90-rj" },
      { id: "6yUjcSTv_C4", title: "Refugee", artist: "Jordan Sandhu", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/bpP_hMS2iNbkzs6NDofyCXWRjqtFGDgnTdYwlU2nacRweTvGc-Qmf4uD3-aKW9cwNau8pxRQBiPiPXE=w544-h544-l90-rj" },
      { id: "tIjUfo30r4M", title: "Boyfriend", artist: "Karan Aujla", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/BzOBERVwxHIkVDpePVN8mnT0MID3cySSHcZvY84FHusBL78dxkdpWBBk8o4O5e8BaenNlHKlI9fWb_Rccw=w544-h544-l90-rj" },
    ],
    "lo-fi": [
      { id: "kAw9xGI8vgk", title: "3 Hours of Chill Lofi Music for DEEP Sleep or Study Session", artist: "Lumosound", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Bx7K_CPa195NNoHTdC18w3oip9PPnt7TMChxTrWk3ZpDEqaQqqUyK-TWM1lmJrIjAL8ILp5-n9FrTc2Y=w544-h544-l90-rj" },
      { id: "zz7eko7uMTU", title: "Lofi Study Session", artist: "Lo Fi Beats", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/UoQnp0-GxWMcc3RxzTPMQh1jWsLT-_Vj0P4ybJhiRrqQfqT-Pk0hALrWjkRXMNwcXmXhUsi58C1Gpvs=w544-h544-l90-rj" },
      { id: "t9OgEOuEN-U", title: "Gentle Vibes", artist: "Lo Fi Beats", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/UoQnp0-GxWMcc3RxzTPMQh1jWsLT-_Vj0P4ybJhiRrqQfqT-Pk0hALrWjkRXMNwcXmXhUsi58C1Gpvs=w544-h544-l90-rj" },
      { id: "Z6KpeVqay-Y", title: "Quiet Glow", artist: "Lo Fi Beats", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/UoQnp0-GxWMcc3RxzTPMQh1jWsLT-_Vj0P4ybJhiRrqQfqT-Pk0hALrWjkRXMNwcXmXhUsi58C1Gpvs=w544-h544-l90-rj" },
      { id: "mbs01o6AArE", title: "Lofi Focus Playlist", artist: "Lofi Beats Instrumental", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Jv3Tcbd70RsHC4MT0UtJLs92lDEipIubS19mZrgRpo5CfXBi4YTkWF_FgPJutFmPq4LYlVHWOCvkpHyc=w544-h544-l90-rj" },
      { id: "rAvz3HErE34", title: "Lofi Dreams", artist: "LO FI BEATS", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/L-zEzoTRmgVu9BvYXEHcHkMedH9lqq4hlygWU32WLcmCC_6SrqtYv0kXpMmc87SM5fDNefxJEtrWa38=w544-h544-l90-rj" },
    ],
    "hip-hop": [
      { id: "OIPmhkzN2ug", title: "I Gotta Feeling", artist: "The Black Eyed Peas", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/XR-7iPvWDmouM1SR4zzzlRa8m-r_Ck_eyyHfyMRL-0-NjS8Sy-eotVXERmnYnhyTc9Du1MPmt6Y67dom8w=w544-h544-l90-rj" },
      { id: "9ux0176BU8g", title: "Hip Hop Hits with Rap Street Vibes", artist: "NexVex", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/2kzyEPBpin-I5hedD_iK_7yEwqMo83197T84kviEdf19o-GAFMBzQyxgiJDykfYtpamoEOsiRNvhrypc=w544-h544-l90-rj" },
      { id: "P5ZBISo2CaE", title: "Black Beatles", artist: "Rae Sremmurd", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/ICQacM23_M2uMsvADP1v4RtdCCKeW-i8neEsDIr3g_qErQQxRg-QD0lUAmORXZ2Os5CQQdiQsW6kT41_Ag=w544-h544-l90-rj" },
      { id: "5GgHlp44Yy4", title: "Best Hip Hop Songs and Rap Hits Playlist", artist: "NexVex", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/2kzyEPBpin-I5hedD_iK_7yEwqMo83197T84kviEdf19o-GAFMBzQyxgiJDykfYtpamoEOsiRNvhrypc=w544-h544-l90-rj" },
      { id: "BO7FQnegW1o", title: "Promiscuous", artist: "Nelly Furtado", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/ccuTeY3wOy6Fj-LjzCuEQm2UV2VPXyLnjrPShLNBb7_Gy_Que7oDH8SZ1Jo2M0sW72TvRR9L3xW4VUo=w544-h544-l90-rj" },
      { id: "m1a_GqJf02M", title: "God's Plan", artist: "Drake", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/zOaDpfj2eyVVe1WX6_hRirEI0DZxghCjpg-wVOebZK3FS_Q7MJKddQ2z5MGLqcUlcWN9RlJME34xpRuA=w544-h544-l90-rj" },
    ],
    "rock": [
      { id: "Mzyz2egx_0c", title: "Shot in the Dark", artist: "Ozzy Osbourne", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/IcWbK7jiO2b5SOsyqngZ_lHvAQfMQg9OpftiHfhg9Ch_li7yEfODUoJrPw0Ky8Nok34wzqHGbaphPma-=w544-h544-l90-rj" },
      { id: "ljUtuoFt-8c", title: "Smells Like Teen Spirit", artist: "Nirvana", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/eyKiPBSqEu556sYTd_IyZhfxun5e_hatZ9tAyu8bnmVRgtbM3aW-SXUvhVX-d7s1oU0Yf3a38JOuYMZK5w=w544-h544-l90-rj" },
      { id: "y6lfK3bH4z8", title: "November Rain", artist: "Guns N' Roses", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/pcrIVPiugsSpXJJPCaPNdp2vpHPo5UsmsoVjqlT7L1p7Lki663u9tONk-S3oqK9GvAsoj2m0AaNgNJj9Zg=w544-h544-l90-rj" },
      { id: "EZ7inhwScSQ", title: "Crazy On You", artist: "Heart", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/B3WN3VtU1gexrLxBTGWGlBnDgPhKAz4rdIP1PL-bF4ZTWTCSxcSr5-ESRrgIj2J6Zm5Ja-6cRDUmf-X2iA=w544-h544-l90-rj" },
      { id: "c0dvabcWVo0", title: "Take Me Home, Country Roads", artist: "John Denver", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/oQEZndpv0poCj_o1wBhiSOOyHo63Yn1um34pjQ1hzKP3jan8B6yagoOtXUI4RkbRlEO8k3D6ciQ7zO5TKQ=w544-h544-l90-rj" },
      { id: "X791IzOwt3Q", title: "Stairway to Heaven", artist: "Led Zeppelin", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/VTIbtcsYRXaGIotLbtxZgb3Gy0O97DDL8kUlQ4BADUb74pa1gySO9JgajuQAvZ-473YIbvWlr5dN2vVW=w544-h544-l90-rj" },
    ],
    "k-pop": [
      { id: "psoyfapc_nc", title: "After School", artist: "Weeekly", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/2yJzyUJmgT6uDJF0I0Bb8nmonUE5cvpHINoounUCJR6fnaLa4SHldSymYetYrc0M5N3RHi_B5MJhFLE=w544-h544-l90-rj" },
      { id: "RdU3F5vN3_s", title: "Nxde", artist: "i-dle", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/mv2cTT-W75n3P_cx41TiVQ0hXDrs-3MC84f4CdjTeKtSQBFs94f5aeN0RKPEjoSYoUbjjMc1nlI8dfPT=w544-h544-l90-rj" },
      { id: "qWvVSBUfLfE", title: "으르렁 Growl", artist: "EXO", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/LwLoJUUVpdk7QU0BKzjHAoMiDxX1hadM9idh6MBKPTgJJoqFBPI1IXEofWtyCssl01XlUG9jPCIq1Dc=w544-h544-l90-rj" },
      { id: "I7na3x3mGZ8", title: "Like", artist: "BTS", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/WN0lshCwNnkMiwjwEREGfZ2s8EDX2tI09EdPn5a8L3fldEprhNbAwqBOu7Jpt8PmW_oC6RpSrF8oTQ=w544-h544-l90-rj" },
      { id: "oM4KBLQRCM8", title: "Fantastic Baby", artist: "BIGBANG", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/ay5c6MEsWgxCx-81O3lmJXq1CtwsGKmP3uPju7uCq4OGyITHUOXhZyBAuD3j6a2Dk4FkjF60wEcE9-JJtA=w544-h544-l90-rj" },
      { id: "v_gO_P8gug8", title: "퀸카", artist: "i-dle", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Wv2stMD4szjwVvdle5LlQw6DSFkVsIIn2m_lHRgW-ARdxZnsSqoh2KvyUCorsW6Q4Zv-9jlvA-vaObw=w544-h544-l90-rj" },
    ],
    "90s": [
      { id: "5U5Ru0nTiUM", title: "Tere Liye", artist: "Atif Aslam", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/8rcPUY_axCJpmXE7z1tW3ipwgiVVJBmkH05BZTbzUkQ1zYooRjIb2Zfoqj9_hdQPIp0wuV3NJmMbLVA=w544-h544-l90-rj" },
      { id: "qcDvzifP_gk", title: "If Ever You're in My Arms Again", artist: "Peabo Bryson", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/CKNRk4NikyHDYz0wwi0hDfTxjTEFR6oPDmLFxgcvsbT4PDIMQzyQTnV10KL-045AXz9D0mx5o0F7V2c_=w544-h544-l90-rj" },
      { id: "2CAiycLVy7s", title: "Tu Hi Haqeeqat", artist: "Pritam", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/5bvgj-ptjXe6EBbU77Vaq6_c7iTQUSfjtj1o7U9kb-xckQ-jAlbpdudaKO9Zev9jPwpQB6Rmx8HtivtJ=w544-h544-l90-rj" },
      { id: "55UJumsI1m0", title: "Ek Din Teri Raahon", artist: "Pritam Chakraborty", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/nj80EMLSYrbhsK-QV_r7SuhrNX4sZ0BnWanKj7mCKzC7u7XAIpk68ARYorzSkY4QtdWHWpZ88TO99-BQ=w544-h544-l90-rj" },
      { id: "TADxdahPBUA", title: "Happy Nation", artist: "Ace of Base", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Sxr_shSClGnXTqgmNMQG5KCvC3YWNwduInrEBj_D9jS1LlciHIw6Xdib3EPtTBdJtulxELq8wwGYeBcfEQ=w544-h544-l90-rj" },
      { id: "cK9h5PVzRpk", title: "GUZARISH", artist: "JAVED ALI", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/2rrBcBw8smJUdyTofOS7r9RZuOdhygYclvcP4HPS1JUVeK2j8DhCvMmbK45RTtoFKFux18GvUzYlPIg9=w544-h544-l90-rj" },
    ],
    "devotional": [
      { id: "-XHXUqXV34w", title: "Who Am I", artist: "Casting Crowns", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/bo5mLWwMkB55XhSeXWFVz4kyOI68mSgiazZT630efNLYV76QA4VNILR5RngJ_b5uu6aZrxC_ySE08xTNOw=w544-h544-l90-rj" },
      { id: "pzCteZWDnRc", title: "Ettumanoorappa", artist: "Ganesh Sundaram", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/wP7hCU9_riX-H3z5MmKayzMrwlMLDu_OlB7R2porB1BYN_SvUWl3y7uPr8JhGhhKE2qtuks0yf8J_p6K=w544-h544-l90-rj" },
      { id: "WAVO1_7cABU", title: "3 Hours of Soaking in His Presence", artist: "William Augusto", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/DxmS4R8P5pS-O0K2_AG2Y1v1b35hAWQSLuutVeqeil9Wv45DflOGokUQKheTYcKxP3CgPw_-KGd-T_w=w544-h544-l90-rj" },
      { id: "BOnxCtKA1VE", title: "Namo Namo", artist: "Amit Trivedi", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/1CFGx2RBIDDhqxli7xazjUkr0B1IxH58cEYWE6VeVxeq7cIQ-HXZpYABghCsXa8sk_KysYYo7mJAOKt-=w544-h544-l90-rj" },
      { id: "G8u3P7Xqlvo", title: "God Is", artist: "Kanye West", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/J2oSU6vw-2wolksQfk-NrjUzljrwugnl6TecdTvUt6LHsBaeHhv2ywA1HkqYKzfCCr3ObUUt5Ky3iN9W=w544-h544-l90-rj" },
      { id: "im5v-p-Noj0", title: "Bhadra Shaila", artist: "Hariharan", duration: "3:30", thumbnail: "https://i.ytimg.com/vi/im5v-p-Noj0/hq720.jpg" },
    ],
    "sleep": [
      { id: "yGi1MePEN-k", title: "Deep Sleep Music: Deeper Relaxation", artist: "Jason Stephenson", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/izy-xwSTCCdIGhhIC-zIbatYKoQaIqf_lTHzscee2mvj5INnAPCEoqkPGBgcLjs4WSATb75kS8nECSv_=w544-h544-l90-rj" },
      { id: "qmVbGoA_V2Y", title: "Heal Insomnia Deep Sleep Music. Fall Asleep Fast.", artist: "Bliss Sleep Music", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/XBATw2LKmrWgf6dFtHxTtpWSDJwqhxwJLVdBDd2TH8HbpwoszxLenyU-OuInwBgz_BUJzd4iC3_44pYU=w544-h544-l90-rj" },
      { id: "kO1gvHp52l0", title: "Hours Relaxing Guitar Music, Meditation Music, Instrumental Music, Calming Music, Soft Music", artist: "Nature Sounds", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/bZgWdInM3xKZx_emk54joskFOprxdCHBx6s-vqZoT29vR9aN8Mw4squpT0_1UMa0lPnbeuXkV9PCxycw=w544-h544-l90-rj" },
      { id: "5e1zT7miep8", title: "rises the moon", artist: "liana flores", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/KHSJ8pUWcJ_9KuT4yE7MLNTsp2pg6YHuPJwF4LATIrMQCw6bLAxsMYCnnGpTnmRQl4y0lCLT8ty05Moq=w544-h544-l90-rj" },
      { id: "kAw9xGI8vgk", title: "3 Hours of Chill Lofi Music for DEEP Sleep or Study Session", artist: "Lumosound", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/Bx7K_CPa195NNoHTdC18w3oip9PPnt7TMChxTrWk3ZpDEqaQqqUyK-TWM1lmJrIjAL8ILp5-n9FrTc2Y=w544-h544-l90-rj" },
      { id: "O2VYbbW20Tc", title: "Sleeping Playlist", artist: "Sleeping Music", duration: "3:30", thumbnail: "https://yt3.googleusercontent.com/_JPu8r05u2HBaPrxvU0JGIPSBVFQkg4o0f1FzE28HzwIeKVuIzYXRPd-TM3K2orQ5jvHYTGWmwvurT4Q=w544-h544-l90-rj" },
    ],
  };

  // ── Device Routing & Access Control ──
  function isAndroidDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    return /Android/i.test(ua);
  }

  function isUserMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 820;
    return isAndroidDevice() || isMobileUA || (isTouch && isSmallScreen);
  }

  function initDeviceRouting() {
    const isRestricted = isAndroidDevice() || isUserMobileDevice();

    if (isRestricted) {
      // Android & Mobile devices are strictly locked to the APK download view
      localStorage.removeItem('zm_view_preference');
      setViewMode('download', false);
      return;
    }

    // Laptop & Desktop users get the Web Player
    setViewMode('player', false);
  }

  function setViewMode(mode, savePreference) {
    const isRestricted = isAndroidDevice() || isUserMobileDevice();

    // STRICT LOCK: Android and mobile devices CANNOT access the web player under any circumstance
    if (isRestricted) {
      mode = 'download';
    } else {
      mode = 'player';
    }

    document.body.dataset.zmView = mode;
    const downloadView = document.getElementById('zm-download-view');
    const playerView = document.getElementById('zm-player-view');
    const playerDock = document.getElementById('floating-player-dock');

    if (mode === 'player') {
      if (downloadView) downloadView.style.display = 'none';
      if (playerView) playerView.style.display = 'flex';
      if (playerDock) playerDock.style.display = 'flex';

      if (state.queue.length === 0) {
        state.queue = [...SEED_YOUR_MIX];
        renderQueue();
      }
      if (!state.currentTrack && SEED_YOUR_MIX.length > 0) {
        updateSpotlightCard(SEED_YOUR_MIX[0]);
      }
    } else {
      if (downloadView) downloadView.style.display = 'flex';
      if (playerView) playerView.style.display = 'none';
      if (playerDock) playerDock.style.display = 'none';

      // Terminate audio engine playback if on Android/mobile
      if (state.isPlaying && ytPlayer && typeof ytPlayer.stopVideo === 'function') {
        try { ytPlayer.stopVideo(); } catch (_) {}
      }
    }
  }

  // ── YouTube Audio Engine & Active Ad-Shield Watchdog ──
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
    tag.src = _EP.YT_IFRAME;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function () {
      createYTIframe();
    };
  }

  function createYTIframe() {
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

  function onPlayerReady() {
    ytReady = true;
    ytPlayer.setVolume(state.volume);
    if (state.playbackRate && state.playbackRate !== 1 && typeof ytPlayer.setPlaybackRate === 'function') {
      try { ytPlayer.setPlaybackRate(state.playbackRate); } catch (_) {}
    }
    updateAdShieldStatus('Protected');
    startAdWatchdog();
    if (typeof consumePendingDeepLink === 'function') consumePendingDeepLink();
  }

  let playNextTimeout = null;
  let consecutiveErrors = 0;
  let currentPlaybackToken = 0;

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      consecutiveErrors = 0;
      state.isPlaying = true;
      setBufferingUI(false);
      if (!state.isBypassingAd && state.playbackRate && typeof ytPlayer.setPlaybackRate === 'function') {
        try { ytPlayer.setPlaybackRate(state.playbackRate); } catch (_) {}
      }
      updatePlayPauseButton();
      syncPlayingIndicators();
      syncMiniPlayerUI();
      startProgressTimer();
      updateMediaSession();
      checkAndBypassAds();
      applyLyricsTimeScaling();
    } else if (event.data === YT.PlayerState.PAUSED) {
      state.isPlaying = false;
      setBufferingUI(false);
      updatePlayPauseButton();
      syncPlayingIndicators();
      syncMiniPlayerUI();
      stopProgressTimer();
    } else if (event.data === YT.PlayerState.ENDED) {
      setBufferingUI(false);
      handleTrackEnd();
    } else if (event.data === YT.PlayerState.BUFFERING) {
      setBufferingUI(true);
      checkAndBypassAds();
    }
  }

  async function onPlayerError(event) {
    console.warn('[ZeroMusic] Playback error code:', event.data, 'on track:', state.currentTrack?.title);
    if (playNextTimeout) {
      clearTimeout(playNextTimeout);
      playNextTimeout = null;
    }

    const track = state.currentTrack;
    if (!track) {
      playNextTimeout = setTimeout(playNext, 1200);
      return;
    }

    // Try finding an alternative stream if not already attempted for this song
    if (!track._retriedAlternative) {
      track._retriedAlternative = true;
      const badId = (ytPlayer && typeof ytPlayer.getVideoData === 'function')
        ? ytPlayer.getVideoData()?.video_id
        : track.youtubeId;

      if (isSpotifyTrackId(track.id)) {
        const spKey = getSpotifyKey(track.id);
        delete spotifyMatches[spKey];
        delete spotifyMatches[track.id];
        delete track.youtubeId;
        saveSpotifyMatches();
      }

      showToast('Finding alternative stream for this song...');
      const altVideoId = await findAlternativeYouTubeTrack(track, badId);
      if (altVideoId && altVideoId !== badId) {
        if (isSpotifyTrackId(track.id)) {
          const spKey = getSpotifyKey(track.id);
          if (spKey) spotifyMatches[spKey] = altVideoId;
          spotifyMatches[track.id] = altVideoId;
          saveSpotifyMatches();
        }
        track.youtubeId = altVideoId;
        console.log('[ZeroMusic] Loaded alternative stream:', altVideoId);
        if (ytReady && ytPlayer) {
          ytPlayer.loadVideoById({
            videoId: altVideoId,
            suggestedQuality: 'hd720'
          });
          state.isPlaying = true;
          updatePlayPauseButton();
          return;
        }
      }
    }

    consecutiveErrors++;
    if (consecutiveErrors >= 5) {
      showToast('Multiple songs failed to play. Stopping.');
      consecutiveErrors = 0;
      state.isPlaying = false;
      updatePlayPauseButton();
      return;
    }

    showToast('Playback error on this song. Skipping to next...');
    playNextTimeout = setTimeout(playNext, 1200);
  }

  function startAdWatchdog() {
    if (adWatchdogInterval) clearInterval(adWatchdogInterval);
    adWatchdogInterval = setInterval(() => {
      if (state.isPlaying) {
        checkAndBypassAds();
      }
    }, 200);
  }

  function checkAndBypassAds() {
    if (!ytPlayer || typeof ytPlayer.getVideoData !== 'function') return;
    try {
      const videoData = ytPlayer.getVideoData();
      const currentVideoId = videoData ? videoData.video_id : null;

      const expectedVideoId = state.currentTrack ? (
        state.currentTrack.youtubeId ||
        (isSpotifyTrackId(state.currentTrack.id) ? spotifyMatches[getSpotifyKey(state.currentTrack.id)] : state.currentTrack.id)
      ) : null;

      if (state.currentTrack && currentVideoId && expectedVideoId && currentVideoId !== expectedVideoId) {
        if (!state.isBypassingAd) {
          state.isBypassingAd = true;
          ytPlayer.mute();
          if (typeof ytPlayer.setPlaybackRate === 'function') {
            ytPlayer.setPlaybackRate(16);
          }
          updateAdShieldStatus('Bypassing Ad ⚡', true);
        }
      } else {
        if (state.isBypassingAd) {
          state.isBypassingAd = false;
          if (typeof ytPlayer.setPlaybackRate === 'function') {
            ytPlayer.setPlaybackRate(state.playbackRate || 1);
          }
          if (!state.isMuted) {
            ytPlayer.unMute();
            ytPlayer.setVolume(state.volume);
          }
          updateAdShieldStatus('Protected');
        }
      }
    } catch (e) {}
  }

  function updateAdShieldStatus(text, isBypassing) {
    const pulseDot = document.getElementById('adshield-pulse-dot');
    const statusText = document.getElementById('adshield-status-text');
    if (pulseDot) pulseDot.classList.toggle('bypassing', !!isBypassing);
    if (statusText) statusText.textContent = text;
  }

  // ── Authentic Square Album Cover Art Resolver & Cache ──
  const COVER_CACHE_KEY = 'zm_cover_art_cache';
  let coverCache = {};
  try {
    coverCache = JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || '{}');
  } catch(e) {
    coverCache = {};
  }

  function saveCoverCache() {
    try {
      localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(coverCache));
    } catch(e) {}
  }

  function updateArtworkInUI(trackId, coverUrl) {
    if (!coverUrl) return;
    document.querySelectorAll(`img[data-track-id="${trackId}"]`).forEach(img => {
      img.src = coverUrl;
    });
    if (state.currentTrack && state.currentTrack.id === trackId) {
      state.currentTrack.thumbnail = coverUrl;
      const art = document.getElementById('player-track-art');
      const largeArt = document.getElementById('lyrics-large-art');
      const theaterArt = document.getElementById('theater-art');
      if (art) art.src = coverUrl;
      if (largeArt) largeArt.src = coverUrl;
      if (theaterArt) theaterArt.src = coverUrl;
      updateAmbientArtwork(coverUrl);
      syncMiniPlayerUI();
      updateMediaSession();
    }
  }

  async function resolveTrackCover(track) {
    if (!track || !track.title) return null;
    const cacheKey = (track.title + '::' + (track.artist || '')).toLowerCase().trim();
    if (coverCache[cacheKey]) {
      track.thumbnail = coverCache[cacheKey];
      updateArtworkInUI(track.id, coverCache[cacheKey]);
      return coverCache[cacheKey];
    }

    // Already an authentic high-resolution square cover (googleusercontent, ggpht, or mzstatic)
    if (track.thumbnail && !track.thumbnail.includes('i.ytimg.com') && track.thumbnail.startsWith('http')) {
      coverCache[cacheKey] = track.thumbnail;
      saveCoverCache();
      return track.thumbnail;
    }

    try {
      const cleanT = (track.title || '').replace(/\s*[\(\[](official\s*(music\s*)?(video|audio)|lyrics?|visualizer|hd|4k|mv)[\)\]]/gi, '').trim();
      const cleanA = (track.artist || '').replace(/ - Topic$/, '').replace(/VEVO$/, '').trim();
      const res = await fetch(`${_EP.SEARCH}?cover=1&title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cleanA)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.cover) {
          coverCache[cacheKey] = data.cover;
          saveCoverCache();
          track.thumbnail = data.cover;
          updateArtworkInUI(track.id, data.cover);
          return data.cover;
        }
      }
    } catch(e) {}
    return null;
  }

  function batchResolveCovers(tracks, count = 12) {
    if (!tracks || !tracks.length) return;
    const candidates = tracks.slice(0, count).filter(t => t.thumbnail && t.thumbnail.includes('i.ytimg.com'));
    candidates.forEach((t, i) => {
      setTimeout(() => {
        resolveTrackCover(t);
      }, i * 140);
    });
  }

  // ── Spotify-to-YouTube Music Resolver & Match Cache ──
  const MATCHES_CACHE_KEY = 'zm_spotify_matches';
  let spotifyMatches = {};
  try {
    spotifyMatches = JSON.parse(localStorage.getItem(MATCHES_CACHE_KEY) || '{}');
  } catch (e) {
    spotifyMatches = {};
  }

  function saveSpotifyMatches() {
    try {
      localStorage.setItem(MATCHES_CACHE_KEY, JSON.stringify(spotifyMatches));
    } catch (e) {}
  }

  function isSpotifyTrackId(id) {
    return typeof id === 'string' && (id.startsWith('sp:') || !/^[a-zA-Z0-9_-]{11}$/.test(id));
  }

  function getSpotifyKey(id) {
    return typeof id === 'string' ? id.replace(/^sp:/, '').trim() : '';
  }

  function getKnownYouTubeId(track) {
    if (!track) return null;
    if (track.youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(track.youtubeId)) {
      return track.youtubeId;
    }
    if (!isSpotifyTrackId(track.id)) {
      return /^[a-zA-Z0-9_-]{11}$/.test(track.id) ? track.id : null;
    }
    const spKey = getSpotifyKey(track.id);
    if (spKey && spotifyMatches[spKey] && /^[a-zA-Z0-9_-]{11}$/.test(spotifyMatches[spKey])) {
      track.youtubeId = spotifyMatches[spKey];
      return spotifyMatches[spKey];
    }
    if (spotifyMatches[track.id] && /^[a-zA-Z0-9_-]{11}$/.test(spotifyMatches[track.id])) {
      track.youtubeId = spotifyMatches[track.id];
      return spotifyMatches[track.id];
    }
    return null;
  }

  async function resolveSpotifyTrack(track) {
    if (!track) return null;
    const known = getKnownYouTubeId(track);
    if (known) return known;

    const cleanTitle = (track.title || '')
      .replace(/\s*[\(\[](official\s*(music\s*)?(video|audio)|lyrics?|visualizer|hd|4k|mv)[\)\]]/gi, '')
      .trim();
    const cleanArtist = (track.artist || '')
      .replace(/ - Topic$/i, '')
      .replace(/VEVO$/i, '')
      .replace(/Unknown Artist/i, '')
      .trim();

    const primaryArtist = cleanArtist ? cleanArtist.split(',')[0].split('&')[0].trim() : '';
    const query = (cleanTitle + ' ' + primaryArtist).trim() || cleanTitle;
    if (!query) return null;

    try {
      const res = await fetch(`${_EP.SEARCH}?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.tracks && data.tracks.length > 0) {
          const match = data.tracks.find(t => t.id && /^[a-zA-Z0-9_-]{11}$/.test(t.id));
          if (match) {
            const spKey = getSpotifyKey(track.id);
            if (spKey) spotifyMatches[spKey] = match.id;
            spotifyMatches[track.id] = match.id;
            saveSpotifyMatches();
            track.youtubeId = match.id;
            return match.id;
          }
        }
      }
    } catch (e) {
      console.warn('[ZeroMusic] Spotify resolve failed:', e);
    }
    return null;
  }

  function preResolveQueue(startIndex) {
    if (!state.queue || state.queue.length === 0) return;
    const upcoming = state.queue.slice(startIndex + 1, startIndex + 5);
    upcoming.forEach((t, i) => {
      if (isSpotifyTrackId(t.id) && !getKnownYouTubeId(t)) {
        setTimeout(() => {
          resolveSpotifyTrack(t);
        }, i * 250);
      }
    });
  }

  async function findAlternativeYouTubeTrack(track, badVideoId) {
    const cleanTitle = (track.title || '')
      .replace(/\s*[\(\[](official\s*(music\s*)?(video|audio)|lyrics?|visualizer|hd|4k|mv)[\)\]]/gi, '')
      .trim();
    const cleanArtist = (track.artist || '')
      .replace(/ - Topic$/i, '')
      .replace(/VEVO$/i, '')
      .replace(/Unknown Artist/i, '')
      .trim();
    const primaryArtist = cleanArtist ? cleanArtist.split(',')[0].split('&')[0].trim() : '';

    const queries = [
      `${cleanTitle} ${primaryArtist} audio`.trim(),
      `${cleanTitle} ${primaryArtist} topic`.trim(),
      `${cleanTitle} ${primaryArtist}`.trim()
    ];

    for (const q of queries) {
      try {
        const res = await fetch(`${_EP.SEARCH}?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.tracks && data.tracks.length > 0) {
            const cand = data.tracks.find(t => t.id && t.id !== badVideoId && /^[a-zA-Z0-9_-]{11}$/.test(t.id));
            if (cand) return cand.id;
          }
        }
      } catch (e) {}
    }
    return null;
  }

  // ── Playback Controls ──
  async function playTrack(track, queueList, index) {
    if (!isUserAuthenticated()) {
      updateAuthGate();
      showToast('Please sign in with Google to use ZeroMusic');
      return;
    }
    if (!track || !track.id) return;

    if (playNextTimeout) {
      clearTimeout(playNextTimeout);
      playNextTimeout = null;
    }

    const token = ++currentPlaybackToken;

    state.currentTrack = track;
    if (queueList) {
      state.queue = queueList;
      state.queueIndex = index !== undefined ? index : queueList.findIndex(t => t.id === track.id);
    } else if (state.queueIndex === -1) {
      state.queue = [track];
      state.queueIndex = 0;
    }

    // Upgrade to official album cover page in background
    resolveTrackCover(track);

    state.lyricsOffset = 0;
    state.lyricsUserScrolled = false;
    updateLyricsOffsetUI();
    if (typeof exitLyricSelectMode === 'function') exitLyricSelectMode();
    const resumePill = document.getElementById('btn-lyrics-resume-sync');
    if (resumePill) resumePill.style.display = 'none';

    addToHistory(track);
    updatePlayerUI(track);
    updateAmbientArtwork(track.thumbnail);
    syncTheaterUI();
    syncMiniPlayerUI();
    fetchLyrics(track);
    renderRecentlyPlayed();
    renderBentoHome();
    updateBecauseYouListened();
    if (state.isQueueOpen || state.isTheaterOpen) renderQueue();
    if (state.activeView === 'stats') renderStatsView();

    let targetVideoId = getKnownYouTubeId(track);
    setBufferingUI(true);

    if (!targetVideoId) {
      updateAdShieldStatus('Matching Song...', false);
      targetVideoId = await resolveSpotifyTrack(track);
      if (token !== currentPlaybackToken) return;

      if (!targetVideoId) {
        setBufferingUI(false);
        console.warn('[ZeroMusic] Could not match track:', track.title);
        showToast(`Could not match "${track.title}". Skipping to next...`);
        consecutiveErrors++;
        if (consecutiveErrors >= 5) {
          showToast('Multiple songs failed to play. Stopping.');
          consecutiveErrors = 0;
          return;
        }
        playNextTimeout = setTimeout(playNext, 1200);
        return;
      }
    }

    if (ytReady && ytPlayer) {
      ytPlayer.loadVideoById({
        videoId: targetVideoId,
        suggestedQuality: 'hd720'
      });
      state.isPlaying = true;
      updatePlayPauseButton();
      syncPlayingIndicators();
      updateAdShieldStatus('Protected');
      preResolveQueue(state.queueIndex);
    }
  }

  function togglePlayPause() {
    if (!isUserAuthenticated()) {
      updateAuthGate();
      showToast('Please sign in with Google to use ZeroMusic');
      return;
    }
    if (!state.currentTrack) {
      if (state.queue.length > 0) {
        playTrack(state.queue[0], state.queue, 0);
      }
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

    let nextIndex = state.queueIndex + 1;
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 1) {
        nextIndex = 0;
      } else {
        return;
      }
    }
    state.queueIndex = nextIndex;
    playTrack(state.queue[nextIndex], state.queue, nextIndex);
  }

  function playPrev() {
    if (state.currentTime > 3) {
      seekTo(0);
      return;
    }
    if (state.queue.length === 0) return;

    let prevIndex = state.queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.queue.length - 1;
    }
    state.queueIndex = prevIndex;
    playTrack(state.queue[prevIndex], state.queue, prevIndex);
  }

  function handleTrackEnd() {
    if (state.sleepTimerMode === 'track') {
      setSleepTimer('0', true);
      state.isPlaying = false;
      updatePlayPauseButton();
      syncPlayingIndicators();
      showToast('Sleep timer paused playback after track');
      return;
    }
    if (state.repeatMode === 2) {
      seekTo(0);
      if (ytReady && ytPlayer) ytPlayer.playVideo();
    } else {
      playNext();
    }
  }

  function seekTo(seconds) {
    if (!ytReady || !ytPlayer) return;
    ytPlayer.seekTo(seconds, true);
    state.currentTime = seconds;
    updateProgressUI();
  }

  function setVolume(vol) {
    state.volume = Math.max(0, Math.min(100, vol));
    state.isMuted = state.volume === 0;
    if (ytReady && ytPlayer) {
      ytPlayer.setVolume(state.volume);
      if (state.isMuted) ytPlayer.mute();
      else ytPlayer.unMute();
    }
    localStorage.setItem('zm_volume', state.volume);
    updateVolumeUI();
  }

  function toggleMute() {
    if (state.isMuted) {
      state.isMuted = false;
      const prevVol = parseInt(localStorage.getItem('zm_volume') || '85', 10);
      setVolume(prevVol > 0 ? prevVol : 85);
    } else {
      state.isMuted = true;
      if (ytReady && ytPlayer) ytPlayer.mute();
      updateVolumeUI();
    }
  }

  // ── Scrubber & Timeline Updates ──
  function startProgressTimer() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (!ytReady || !ytPlayer || !state.isPlaying) return;
      try {
        state.currentTime = ytPlayer.getCurrentTime() || 0;
        const curDur = ytPlayer.getDuration() || 0;
        if (curDur > 0 && Math.abs(curDur - state.duration) >= 0.5) {
          state.duration = curDur;
          applyLyricsTimeScaling();
        } else if (curDur > 0) {
          state.duration = curDur;
        }
        updateProgressUI();
        syncLyricsWithTime(state.currentTime);
      } catch (e) {}
    }, 250);
  }

  function stopProgressTimer() {
    if (progressInterval) clearInterval(progressInterval);
  }

  function setBufferingUI(buffering) {
    state.isBuffering = !!buffering;
    document.getElementById('btn-play-pause')?.classList.toggle('is-buffering', state.isBuffering);
    document.getElementById('theater-play-pause')?.classList.toggle('is-buffering', state.isBuffering);
  }

  function updateProgressUI() {
    const elapsedEl = document.getElementById('time-elapsed');
    const durationEl = document.getElementById('time-duration');
    const progressBar = document.getElementById('playback-progress');
    const progressFill = document.getElementById('progress-bar-fill');
    const bufferedEl = document.getElementById('scrubber-buffered');

    const thElapsed = document.getElementById('theater-elapsed');
    const thDuration = document.getElementById('theater-duration');
    const thBar = document.getElementById('theater-progress');
    const thFill = document.getElementById('theater-fill');
    const thBuffered = document.getElementById('theater-buffered');

    if (durationEl) durationEl.textContent = formatTime(state.duration);
    if (thDuration) thDuration.textContent = formatTime(state.duration);

    if (ytReady && ytPlayer && typeof ytPlayer.getVideoLoadedFraction === 'function') {
      try {
        const bufPct = Math.max(0, Math.min(100, (ytPlayer.getVideoLoadedFraction() || 0) * 100));
        if (bufferedEl) bufferedEl.style.width = bufPct + '%';
        if (thBuffered) thBuffered.style.width = bufPct + '%';
      } catch (_) {}
    }

    if (state.isScrubbing) return;

    if (elapsedEl) elapsedEl.textContent = formatTime(state.currentTime);
    if (thElapsed) thElapsed.textContent = formatTime(state.currentTime);

    if (state.duration > 0) {
      const pct = Math.max(0, Math.min(100, (state.currentTime / state.duration) * 100));
      if (progressBar) progressBar.value = pct;
      if (progressFill) progressFill.style.width = pct + '%';
      if (thBar) thBar.value = pct;
      if (thFill) thFill.style.width = pct + '%';
      updatePipProgress(pct);
    }
  }

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateVolumeUI() {
    const volSlider = document.getElementById('volume-slider');
    const volFill = document.getElementById('volume-bar-fill');
    const muteBtn = document.getElementById('btn-mute');
    const effectiveVol = state.isMuted ? 0 : state.volume;
    if (volSlider) volSlider.value = effectiveVol;
    if (volFill) {
      volFill.style.width = effectiveVol + '%';
      volFill.classList.toggle('muted', state.isMuted || state.volume === 0);
    }
    if (muteBtn) {
      muteBtn.innerHTML = (state.isMuted || state.volume === 0)
        ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>`
        : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    }
  }

  function updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('btn-play-pause');
    const theaterBtn = document.getElementById('theater-play-pause');
    const pauseSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    const playSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>`;
    if (playPauseBtn) {
      playPauseBtn.innerHTML = state.isPlaying ? pauseSvg : playSvg;
      playPauseBtn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
    }
    if (theaterBtn) {
      theaterBtn.innerHTML = state.isPlaying
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>`;
      theaterBtn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
    }
    const artFrame = document.getElementById('theater-art-frame');
    if (artFrame) artFrame.classList.toggle('playing', state.isPlaying);
  }

  function updatePlayerUI(track) {
    const art = document.getElementById('player-track-art');
    const title = document.getElementById('player-track-title');
    const artist = document.getElementById('player-track-artist');

    if (art) art.src = track.thumbnail;
    if (title) title.textContent = track.title;
    if (artist) artist.textContent = track.artist;

    syncHeartButtonsUI(track.id, false);
    syncPlayingIndicators();
  }

  function updateSpotlightCard(track) {
    if (!track) return;
    const art = document.getElementById('spotlight-art');
    const title = document.getElementById('spotlight-title');
    const artist = document.getElementById('spotlight-artist');
    const ambBg = document.getElementById('spotlight-ambient-bg');
    if (art) art.src = track.thumbnail;
    if (title) title.textContent = track.title;
    if (artist) artist.textContent = track.artist;
    if (ambBg && track.thumbnail) ambBg.style.backgroundImage = `url("${track.thumbnail}")`;
    syncHeartButtonsUI(track.id, false);
  }

  // ── MediaSession API ──
  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !state.currentTrack) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.currentTrack.title,
      artist: state.currentTrack.artist,
      album: 'ZeroMusic',
      artwork: [{ src: state.currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
    navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seekTo(details.seekTime);
    });
  }

  // ── Synced Lyrics (LRCLIB & Dynamic Tempo-Scaler) ──
  const RECORD_LABELS = new Set([
    't-series', 'tseries', 'zee music company', 'sony music india', 'speed records',
    'yrf', 'tips official', 'saregama music', 'eros now', 'aditya music', 'lahari music',
    'times music', 'white hill music', 'geet mp3', 'desi music factory', 'sonymusicindiavevo',
    'warner music', 'universal music', 'spinnin records', 'monstercat', 'ultra records',
    'nocopyrightsounds', 'ncs', 'vevo'
  ]);

  function isRecordLabel(name) {
    if (!name) return false;
    const s = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    for (const label of RECORD_LABELS) {
      if (s.includes(label)) return true;
    }
    return false;
  }

  const VERSION_MODIFIERS = /\b(slowed|sped\s*up|speed\s*up|fast|nightcore|daycore|reverb|remix|edit|mix|version|audio|video|official|visualizer|lyric|lyrics|hd|4k)\b/i;

  function resolveTrackInfo(rawTitle, rawArtist) {
    let title = (rawTitle || '').trim();
    let artist = (rawArtist || '').trim();

    artist = artist.replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();

    // 1. Pipe format: "Song Name | Movie Name | Singer Name"
    if (title.includes(' | ')) {
      const segments = title.split(' | ').map(s => s.trim()).filter(Boolean);
      if (segments.length >= 2) {
        const candidateTitle = segments[0];
        const other = segments.slice(1);
        const singerSeg = other.find(s => /\b(singers?|sung by|vocals?)\b/i.test(s));
        if (singerSeg) {
          artist = singerSeg.replace(/^(singers?:?|sung by:?|vocals?:?|by)\s*/i, '').trim();
        } else {
          const nonMovie = other.filter(s => !/\b(movie|video|song|audio|teaser|trailer|film)\b/i.test(s) && !isRecordLabel(s));
          if (nonMovie.length > 0) {
            artist = nonMovie[nonMovie.length - 1];
          }
        }
        title = candidateTitle;
      }
    }

    // 2. Dash delimiter format: "Artist - Title" vs "Title - Artist" vs "Title - Tag"
    const delims = [' - ', ' – ', ' — '];
    for (const d of delims) {
      if (title.includes(d)) {
        const parts = title.split(d).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const p1 = parts[0];
          const p2 = parts.slice(1).join(' - ');

          if (VERSION_MODIFIERS.test(p2) && !p2.includes(' ')) {
            title = p1;
            break;
          }

          if (isRecordLabel(artist) || artist.toLowerCase() === p1.toLowerCase() || p1.toLowerCase().includes(artist.toLowerCase())) {
            artist = p1;
            title = p2;
            break;
          }

          if (artist.toLowerCase() === p2.toLowerCase() || p2.toLowerCase().includes(artist.toLowerCase())) {
            title = p1;
            artist = p2;
            break;
          }

          if (isRecordLabel(artist) || !artist) {
            artist = p1;
            title = p2;
            break;
          }
        }
      }
    }

    // Clean title: remove parentheticals like (Official Video), [Music Video], etc.
    const cleanTitle = title
      .replace(/\s*[\(\[\{][^\)\]\}]*(official|music\s*video|video|audio|visualizer|hd|4k|lyric|lyrics|full\s*song)[^\)\]\}]*[\)\]\}]/gi, '')
      .replace(/\s*[-–—]\s*(official|music\s*video|video|audio|visualizer|hd|4k|lyric|lyrics|full\s*song).*$/gi, '')
      .replace(/\s*[\(\[\{]\s*(slowed|sped\s*up|speed\s*up|fast|nightcore|daycore|reverb|remix|edit|version).*?[\)\]\}]/gi, '')
      .replace(/\s*[-–—]\s*(slowed|sped\s*up|speed\s*up|fast|nightcore|daycore|reverb|remix|edit|version).*$/gi, '')
      .trim();

    // Stripped title: removes any remaining parentheses or featured artists
    const strippedTitle = cleanTitle
      .replace(/\s*[\(\[\{].*?[\)\]\}]/g, '')
      .replace(/\s*[-–—].*$/, '')
      .trim();

    // Clean artist: take primary artist
    const cleanArtist = artist
      .split(/[,;&]|\bfeat\.?|\bft\.?|\bwith\b/i)[0]
      .replace(/\s*-\s*Topic$/i, '')
      .trim();

    return {
      title: cleanTitle || title,
      strippedTitle: strippedTitle || cleanTitle || title,
      artist: cleanArtist || artist
    };
  }

  function parseDurationSec(dur) {
    if (typeof dur === 'number') return dur;
    if (!dur || typeof dur !== 'string') return 0;
    const parts = dur.split(':').map(p => parseFloat(p));
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    const num = parseFloat(dur);
    return isNaN(num) ? 0 : num;
  }

  function isTempoVariantTrack(title, artist, album, videoTitle) {
    const combined = [title, artist, album, videoTitle].filter(Boolean).join(' ');
    const tempoRegex = /\b(slowed(\s*(down|\+\s*reverb|and\s*reverb|reverb))?|sped\s*up|speed\s*up|speedup|nightcore|daycore|reverb(ed)?|chopped(\s*and\s*screwed)?|screwed|pitch(ed)?\s*(up|down)|tempo\s*(up|down))\b/i;
    if (tempoRegex.test(combined)) return true;
    if (/[-–—\(\[\{]\s*(fast|slow)\s*([\)\]\}]|version|ver|remix|edit|audio|song|tempo|$)/i.test(combined)) return true;
    if (/\b(fast|slow)\s*(version|ver|remix|edit|audio|tempo)\b/i.test(combined)) return true;
    return false;
  }

  function getActualTrackDuration() {
    if (ytPlayer && typeof ytPlayer.getDuration === 'function') {
      try {
        const vData = (typeof ytPlayer.getVideoData === 'function') ? ytPlayer.getVideoData() : null;
        const currentYtId = vData ? vData.video_id : null;
        const expectedYtId = getKnownYouTubeId(state.currentTrack) || state.currentTrack?.youtubeId;
        if (!expectedYtId || !currentYtId || currentYtId === expectedYtId) {
          const d = ytPlayer.getDuration();
          if (typeof d === 'number' && d > 5 && !isNaN(d)) return d;
        }
      } catch (e) {}
    }
    if (typeof state.duration === 'number' && state.duration > 5 && !isNaN(state.duration)) {
      return state.duration;
    }
    if (state.currentTrack) {
      if (typeof state.currentTrack.durationMs === 'number' && state.currentTrack.durationMs > 5000) {
        return state.currentTrack.durationMs / 1000;
      }
      const parsed = parseDurationSec(state.currentTrack.duration);
      if (parsed > 5) return parsed;
    }
    return 0;
  }

  function applyLyricsTimeScaling() {
    if (!state.rawLyrics || state.rawLyrics.length === 0) return;
    const origDur = state.lyricsOriginalDuration;
    if (!origDur || origDur <= 0) {
      state.lyrics = state.rawLyrics;
      return;
    }

    const actualDur = getActualTrackDuration();
    if (!actualDur || actualDur <= 0) {
      state.lyrics = state.rawLyrics;
      return;
    }

    const rawRatio = actualDur / origDur;
    const isTempo = isTempoVariantTrack(
      state.currentTrack?.title,
      state.currentTrack?.artist,
      state.currentTrack?.album,
      (ytPlayer && typeof ytPlayer.getVideoData === 'function' && ytPlayer.getVideoData()?.title) || ''
    );

    let ratio = 1.0;
    if (isTempo) {
      if (Math.abs(rawRatio - 1.0) >= 0.02 && rawRatio >= 0.35 && rawRatio <= 2.8) {
        ratio = rawRatio;
      }
    } else {
      if (Math.abs(actualDur - origDur) >= 18 && (rawRatio < 0.85 || rawRatio > 1.18) && rawRatio >= 0.45 && rawRatio <= 2.2) {
        ratio = rawRatio;
      }
    }

    if (Math.abs((state.lyricsRatio || 1.0) - ratio) < 0.005 && state.lyrics.length > 0) {
      return;
    }

    state.lyricsRatio = ratio;
    state.lyrics = state.rawLyrics.map(l => ({
      time: Math.round(l.time * ratio * 100) / 100,
      text: l.text
    }));

    if (Math.abs(ratio - 1.0) >= 0.02) {
      console.log(`[ZeroMusic] Scaled lyrics timing by ${ratio.toFixed(3)}x (${origDur.toFixed(1)}s -> ${actualDur.toFixed(1)}s)`);
    }

    const container = document.getElementById('lyrics-lines-container');
    if (container) {
      const lineEls = container.querySelectorAll('.lyric-line');
      if (lineEls.length === state.lyrics.length) {
        lineEls.forEach((el, i) => {
          if (state.lyrics[i]) {
            el.dataset.time = state.lyrics[i].time;
          }
        });
        syncLyricsWithTime(state.currentTime);
      } else {
        renderLyrics();
      }
    }
  }

  async function fetchLyrics(track) {
    const container = document.getElementById('lyrics-lines-container');
    const trackTitle = document.getElementById('lyrics-track-title');
    const trackArtist = document.getElementById('lyrics-track-artist');
    const largeArt = document.getElementById('lyrics-large-art');

    const info = resolveTrackInfo(track.title, track.artist);

    if (trackTitle) trackTitle.textContent = info.title || track.title;
    if (trackArtist) trackArtist.textContent = info.artist || track.artist;
    if (largeArt) largeArt.src = track.thumbnail;

    if (!container) return;
    container.innerHTML = '<div class="lyrics-status"><span class="zm-spinner"></span> Searching time-synced lyrics...</div>';

    state.lyrics = [];
    state.rawLyrics = [];
    state.lyricsOriginalDuration = 0;
    state.lyricsRatio = 1.0;
    state.activeLyricIndex = -1;

    try {
      const searchPlans = [];

      // 1. Exact track & artist get
      if (info.title && info.artist) {
        searchPlans.push({ type: 'get', params: `track_name=${encodeURIComponent(info.title)}&artist_name=${encodeURIComponent(info.artist)}` });
      }
      // 2. Stripped title & artist get
      if (info.strippedTitle && info.strippedTitle !== info.title && info.artist) {
        searchPlans.push({ type: 'get', params: `track_name=${encodeURIComponent(info.strippedTitle)}&artist_name=${encodeURIComponent(info.artist)}` });
      }
      // 3. Search with stripped title & artist
      if (info.strippedTitle && info.artist) {
        searchPlans.push({ type: 'search', params: `track_name=${encodeURIComponent(info.strippedTitle)}&artist_name=${encodeURIComponent(info.artist)}` });
      }
      // 4. Search with stripped title alone (great for remixes or different featured artists)
      if (info.strippedTitle) {
        searchPlans.push({ type: 'search', params: `track_name=${encodeURIComponent(info.strippedTitle)}` });
      }

      let data = null;

      for (const plan of searchPlans) {
        try {
          const endpoint = plan.type === 'get' ? _EP.LRCLIB : _EP.LRCLIB.replace('/get', '/search');
          const res = await fetch(`${endpoint}?${plan.params}`);
          if (!res.ok) continue;
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            const candidate = json.find(d => d.syncedLyrics && !d.instrumental) ||
                              json.find(d => d.plainLyrics && !d.instrumental) ||
                              json[0];
            if (candidate && (candidate.syncedLyrics || candidate.plainLyrics)) {
              data = candidate;
              if (candidate.syncedLyrics) break;
            }
          } else if (json && (json.syncedLyrics || json.plainLyrics)) {
            data = json;
            if (json.syncedLyrics) break;
          }
        } catch (e) {}
      }

      if (!data) throw new Error('Lyrics not found');

      if (data.syncedLyrics) {
        const parsed = parseLRC(data.syncedLyrics);
        if (parsed.length > 0) {
          state.rawLyrics = parsed;
          state.lyricsOriginalDuration = (typeof data.duration === 'number' && data.duration > 0)
            ? data.duration
            : (parsed[parsed.length - 1].time + 6);
          applyLyricsTimeScaling();
          renderLyrics();
          return;
        }
      }

      if (data.plainLyrics) {
        const plainHtml = `
          <div class="lyrics-badge-unsynced">Unsynced Lyrics</div>
          <div class="plain-lyrics">${escapeHtml(data.plainLyrics).replace(/\n/g, '<br/>')}</div>
        `;
        container.innerHTML = plainHtml;
        const thLyrics = document.getElementById('theater-lyrics-body');
        if (thLyrics) thLyrics.innerHTML = plainHtml;
      } else {
        throw new Error('No lyrics');
      }
    } catch (e) {
      const emptyHtml = `<div class="lyrics-status">No synchronized lyrics available for this song.</div>`;
      container.innerHTML = emptyHtml;
      const thLyrics = document.getElementById('theater-lyrics-body');
      if (thLyrics) thLyrics.innerHTML = emptyHtml;
    }
  }

  function parseLRC(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const result = [];
    let offsetMs = 0;
    const offsetMatch = /\[offset:\s*([+-]?\d+)\]/i.exec(lrcText);
    if (offsetMatch) {
      offsetMs = parseInt(offsetMatch[1], 10) || 0;
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || /^\[[a-zA-Z]+:[^\]]*\]$/.test(line)) continue;

      const stamps = [];
      let m;
      const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
      while ((m = re.exec(line)) !== null) {
        const min = parseInt(m[1], 10);
        const sec = parseInt(m[2], 10);
        const ms = m[3] ? parseFloat('0.' + m[3]) : 0;
        stamps.push(min * 60 + sec + ms + (offsetMs / 1000));
      }

      if (stamps.length > 0) {
        let text = line.replace(/\[\d{1,2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();
        text = text.replace(/^\[[a-zA-Z]+:[^\]]*\]\s*/, '').trim();
        if (text && !/^[♪♫\s]+$/.test(text)) {
          for (const t of stamps) {
            result.push({ time: Math.max(0, Math.round(t * 100) / 100), text });
          }
        }
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }

  function renderLyrics() {
    const container = document.getElementById('lyrics-lines-container');
    const thContainer = document.getElementById('theater-lyrics-body');
    if (state.lyrics.length === 0) return;

    const markup = state.lyrics.map((l, i) => `
      <div class="lyric-line" data-index="${i}" data-time="${l.time}">
        ${escapeHtml(l.text)}
      </div>
    `).join('');

    [container, thContainer].forEach(target => {
      if (!target) return;
      target.innerHTML = markup;
      target.querySelectorAll('.lyric-line').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index, 10);
          if (state.lyricsSelectMode && target === container) {
            toggleLyricSelection(idx, el);
            return;
          }
          const t = Math.max(0, parseFloat(el.dataset.time) - (state.lyricsOffset || 0));
          state.lyricsUserScrolled = false;
          const resumePill = document.getElementById('btn-lyrics-resume-sync');
          if (resumePill) resumePill.style.display = 'none';
          seekTo(t);
        });
      });
    });
  }

  let lyricsProgrammaticScrollUntil = 0;

  function syncLyricsWithTime(currentTime) {
    if (state.lyrics.length === 0) return;
    const effectiveTime = currentTime + (state.lyricsOffset || 0);

    let index = -1;
    for (let i = 0; i < state.lyrics.length; i++) {
      if (effectiveTime >= state.lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }

    if (index !== state.activeLyricIndex) {
      state.activeLyricIndex = index;

      const drawerBody = document.getElementById('lyrics-lines-container');
      const thBody = document.getElementById('theater-lyrics-body');

      if (drawerBody) {
        const lines = drawerBody.querySelectorAll('.lyric-line');
        lines.forEach((line, i) => {
          line.classList.toggle('active', i === index);
        });
        if (state.isLyricsOpen && !state.lyricsUserScrolled && !state.lyricsSelectMode && index >= 0 && lines[index]) {
          lyricsProgrammaticScrollUntil = Date.now() + 700;
          lines[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      if (thBody) {
        const thLines = thBody.querySelectorAll('.lyric-line');
        thLines.forEach((line, i) => {
          line.classList.toggle('active', i === index);
          line.classList.toggle('near', index >= 0 && Math.abs(i - index) === 1);
        });
        if (state.isTheaterOpen && state.theaterTab === 'lyrics' && index >= 0 && thLines[index]) {
          thLines[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      updatePipLyric(index >= 0 && state.lyrics[index] ? state.lyrics[index].text : '');
    }
  }

  // ── History & Listening Play Counts ──
  function addToHistory(track) {
    state.history = [track, ...state.history.filter(t => t.id !== track.id)].slice(0, 50);
    localStorage.setItem('zm_history', JSON.stringify(state.history));

    state.playCounts[track.id] = (state.playCounts[track.id] || 0) + 1;
    localStorage.setItem('zm_play_counts', JSON.stringify(state.playCounts));
    triggerAutoSync();
    archiveTrackToSongsRepo(track);
  }

  function archiveTrackToSongsRepo(track) {
    if (!track || !track.id) return;
    const actualVideoId = getKnownYouTubeId(track) || track.id;
    if (isSpotifyTrackId(actualVideoId)) return;
    try {
      fetch('https://zero.skillissue.gg/zero-music/api/music-songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: actualVideoId,
          title: track.title || '',
          artist: track.artist || '',
          duration: track.duration || 0,
          cover: track.cover || track.thumbnail || '',
          device: 'web',
          format: 'm4a'
        })
      }).catch(err => {
        console.warn('Song archival report warning:', err);
      });
    } catch (e) {
      // Ignore background network issues
    }
  }

  function renderRecentlyPlayed() {
    const container = document.getElementById('recently-played-grid');
    const section = document.getElementById('recently-played-section');
    const emptyTip = document.getElementById('empty-history-tip');

    if (!container || !section) return;

    if (state.history.length === 0) {
      section.style.display = 'none';
      if (emptyTip) emptyTip.style.display = 'flex';
      return;
    }

    section.style.display = 'block';
    if (emptyTip) emptyTip.style.display = 'none';
    renderTrackGrid(container, state.history.slice(0, 12));
  }

  // ── User Playlists System (Replaces Hardcoded Genres) ──
  function isTrackLiked(id) {
    return state.likedTracks.some(t => t.id === id);
  }

  function toggleLikeTrack(track) {
    if (!track || !track.id) return;
    const idx = state.likedTracks.findIndex(t => t.id === track.id);
    if (idx >= 0) {
      state.likedTracks.splice(idx, 1);
      showToast('Removed from Liked Songs');
    } else {
      state.likedTracks.unshift(track);
      showToast('Saved to Liked Songs ♥');
    }
    localStorage.setItem('zm_liked', JSON.stringify(state.likedTracks));
    syncHeartButtonsUI(track.id, true);
    renderPlaylistsSidebar();
    renderBentoHome();
    if (state.activePlaylistId === 'liked') {
      openPlaylistView('liked');
    }
    if (state.activeView === 'stats') {
      renderStatsView();
    }
    triggerAutoSync();
  }

  function getMostPlayedTracks() {
    const counted = Object.entries(state.playCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);

    const trackMap = new Map();
    [...state.history, ...state.likedTracks, ...SEED_YOUR_MIX, ...SEED_QUICK_PICKS, ...SEED_NEW_RELEASES].forEach(t => trackMap.set(t.id, t));
    state.playlists.forEach(pl => (pl.tracks || []).forEach(t => trackMap.set(t.id, t)));

    return counted.map(([id]) => trackMap.get(id)).filter(Boolean);
  }

  function renderPlaylistMosaicHtml(tracks, fallbackType) {
    const uniqueThumbs = [];
    const seen = new Set();
    (tracks || []).forEach(t => {
      if (t && t.thumbnail && !seen.has(t.thumbnail)) {
        seen.add(t.thumbnail);
        uniqueThumbs.push(t.thumbnail);
      }
    });

    if (uniqueThumbs.length >= 4) {
      return `<div class="mosaic-grid-2x2">${uniqueThumbs.slice(0, 4).map(src => `<img src="${src}" alt="" loading="lazy">`).join('')}</div>`;
    }
    if (uniqueThumbs.length >= 1) {
      return `<img class="playlist-single-cover" src="${uniqueThumbs[0]}" alt="">`;
    }
    if (fallbackType === 'liked') {
      return `<div class="playlist-art-svg-card liked"><svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>`;
    }
    if (fallbackType === 'most-played') {
      return `<div class="playlist-art-svg-card most-played"><svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></div>`;
    }
    return `<div class="playlist-art-svg-card custom"><svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>`;
  }

  function formatTotalDuration(tracks) {
    const totalSec = (tracks || []).reduce((sum, t) => sum + (parseDurationSec(t.duration) || (t.durationMs ? t.durationMs / 1000 : 210)), 0);
    const totalMin = Math.round(totalSec / 60);
    if (totalMin >= 60) {
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return `${h} hr ${m} min`;
    }
    return `${totalMin} min`;
  }

  function renderPlaylistsSidebar() {
    const container = document.getElementById('sidebar-playlists-list');
    if (!container) return;

    const mostPlayed = getMostPlayedTracks();

    let html = `
      <button class="playlist-nav-item ${state.activePlaylistId === 'liked' ? 'active' : ''}" data-playlist-id="liked" title="Liked Songs">
        <span class="playlist-nav-meta">
          <span class="sidebar-pl-icon-badge liked"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>
          <span class="playlist-nav-name">Liked Songs</span>
        </span>
        <span class="playlist-nav-count">${state.likedTracks.length}</span>
      </button>
      <button class="playlist-nav-item ${state.activePlaylistId === 'most-played' ? 'active' : ''}" data-playlist-id="most-played" title="Most Played">
        <span class="playlist-nav-meta">
          <span class="sidebar-pl-icon-badge most-played"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></span>
          <span class="playlist-nav-name">Most Played</span>
        </span>
        <span class="playlist-nav-count">${mostPlayed.length}</span>
      </button>
    `;

    state.playlists.forEach(pl => {
      const thumb = pl.tracks && pl.tracks[0] && pl.tracks[0].thumbnail;
      const iconHtml = thumb
        ? `<img class="sidebar-pl-thumb" src="${thumb}" alt="" loading="lazy">`
        : `<span class="sidebar-pl-icon-badge custom"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span>`;
      html += `
        <button class="playlist-nav-item ${state.activePlaylistId === pl.id ? 'active' : ''}" data-playlist-id="${pl.id}" title="${escapeHtml(pl.name)}">
          <span class="playlist-nav-meta">
            ${iconHtml}
            <span class="playlist-nav-name">${escapeHtml(pl.name)}</span>
          </span>
          <span class="playlist-nav-count">${pl.tracks.length}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.playlist-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        state.playlistFilter = '';
        state.playlistSort = 'default';
        const filterInput = document.getElementById('playlist-filter-input');
        const sortSelect = document.getElementById('playlist-sort-select');
        if (filterInput) filterInput.value = '';
        if (sortSelect) sortSelect.value = 'default';
        openPlaylistView(item.dataset.playlistId);
        closeMobileSidebar();
      });
    });
  }

  function getFilteredSortedPlaylistTracks(tracks) {
    let list = [...(tracks || [])];
    const q = (state.playlistFilter || '').trim().toLowerCase();
    if (q) {
      list = list.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.artist || '').toLowerCase().includes(q)
      );
    }
    if (state.playlistSort === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (state.playlistSort === 'artist') {
      list.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
    } else if (state.playlistSort === 'duration') {
      list.sort((a, b) => (parseDurationSec(b.duration) || 0) - (parseDurationSec(a.duration) || 0));
    }
    return list;
  }

  function openPlaylistView(playlistId) {
    state.activePlaylistId = playlistId;
    switchMainView('playlist');
    renderPlaylistsSidebar();

    const titleEl = document.getElementById('playlist-view-title');
    const metaEl = document.getElementById('playlist-view-meta');
    const artDisplay = document.getElementById('playlist-art-display');
    const ambBg = document.getElementById('playlist-ambient-bg');
    const deleteBtn = document.getElementById('btn-playlist-delete');
    const renameBtn = document.getElementById('btn-playlist-rename');
    const tableContainer = document.getElementById('playlist-tracks-table');
    const toolbar = document.getElementById('playlist-toolbar');

    let playlistTitle = 'Playlist';
    let tracks = [];
    let isCustom = false;
    let fallbackType = 'custom';

    if (playlistId === 'liked') {
      playlistTitle = 'Liked Songs';
      tracks = state.likedTracks;
      fallbackType = 'liked';
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (renameBtn) renameBtn.style.display = 'none';
    } else if (playlistId === 'most-played') {
      playlistTitle = 'Most Played';
      tracks = getMostPlayedTracks();
      fallbackType = 'most-played';
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (renameBtn) renameBtn.style.display = 'none';
    } else {
      const pl = state.playlists.find(p => p.id === playlistId);
      if (pl) {
        playlistTitle = pl.name;
        tracks = pl.tracks;
        isCustom = true;
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        if (renameBtn) renameBtn.style.display = 'inline-block';
      }
    }

    if (artDisplay) artDisplay.innerHTML = renderPlaylistMosaicHtml(tracks, fallbackType);
    if (ambBg) {
      const heroThumb = tracks.find(t => t && t.thumbnail)?.thumbnail;
      ambBg.style.backgroundImage = heroThumb ? `url("${heroThumb}")` : 'none';
    }

    if (titleEl) titleEl.textContent = playlistTitle;
    if (metaEl) {
      const durText = tracks.length > 0 ? ` • ${formatTotalDuration(tracks)}` : '';
      metaEl.textContent = `${tracks.length} ${tracks.length === 1 ? 'song' : 'songs'}${durText} // ZeroMusic Collection`;
    }
    if (toolbar) toolbar.style.display = tracks.length > 0 ? 'flex' : 'none';

    const visibleTracks = getFilteredSortedPlaylistTracks(tracks);

    if (tableContainer) {
      if (tracks.length === 0) {
        tableContainer.innerHTML = '<div class="zm-empty">No songs in this playlist yet. Add songs using the + button on any track.</div>';
      } else if (visibleTracks.length === 0) {
        tableContainer.innerHTML = '<div class="zm-empty">No songs match your filter.</div>';
      } else {
        renderTrackRows(tableContainer, visibleTracks, true, isCustom ? playlistId : null);
      }
    }

    const playAllBtn = document.getElementById('btn-playlist-play-all');
    if (playAllBtn) {
      playAllBtn.onclick = () => {
        if (visibleTracks.length > 0) playTrack(visibleTracks[0], visibleTracks, 0);
      };
    }

    const shuffleBtn = document.getElementById('btn-playlist-shuffle');
    if (shuffleBtn) {
      shuffleBtn.onclick = () => {
        if (visibleTracks.length > 0) {
          const shuffled = [...visibleTracks].sort(() => Math.random() - 0.5);
          playTrack(shuffled[0], shuffled, 0);
        }
      };
    }

    if (renameBtn) {
      renameBtn.onclick = () => {
        const renameModal = document.getElementById('modal-rename-playlist');
        const renameInput = document.getElementById('input-rename-playlist-name');
        if (renameModal && renameInput) {
          renameInput.value = playlistTitle;
          renameModal.style.display = 'flex';
          renameInput.focus();
          renameInput.select();
        }
      };
    }

    if (deleteBtn) {
      deleteBtn.onclick = () => {
        if (confirm(`Delete playlist "${playlistTitle}"?`)) {
          state.playlists = state.playlists.filter(p => p.id !== playlistId);
          localStorage.setItem('zm_playlists', JSON.stringify(state.playlists));
          showToast(`Deleted "${playlistTitle}"`);
          switchMainView('home');
          renderPlaylistsSidebar();
          renderBentoHome();
          triggerAutoSync();
        }
      };
    }
  }

  function createNewPlaylist(name) {
    if (!name || !name.trim()) return;
    const newPl = {
      id: 'pl_' + Date.now(),
      name: name.trim(),
      tracks: [],
      createdAt: Date.now()
    };
    state.playlists.push(newPl);
    localStorage.setItem('zm_playlists', JSON.stringify(state.playlists));
    renderPlaylistsSidebar();
    renderBentoHome();
    openPlaylistView(newPl.id);
    showToast(`Created playlist "${newPl.name}"`);
    triggerAutoSync();
  }

  function addTrackToPlaylist(playlistId, track) {
    const pl = state.playlists.find(p => p.id === playlistId);
    if (!pl) return;
    if (pl.tracks.some(t => t.id === track.id)) {
      showToast(`Already in "${pl.name}"`);
      return;
    }
    pl.tracks.push(track);
    localStorage.setItem('zm_playlists', JSON.stringify(state.playlists));
    renderPlaylistsSidebar();
    renderBentoHome();
    showToast(`Added "${track.title}" to ${pl.name}`);
    if (state.activePlaylistId === playlistId) {
      openPlaylistView(playlistId);
    }
    triggerAutoSync();
  }

  function removeTrackFromPlaylist(playlistId, trackId) {
    const pl = state.playlists.find(p => p.id === playlistId);
    if (!pl) return;
    pl.tracks = pl.tracks.filter(t => t.id !== trackId);
    localStorage.setItem('zm_playlists', JSON.stringify(state.playlists));
    renderPlaylistsSidebar();
    renderBentoHome();
    openPlaylistView(playlistId);
    showToast('Removed from playlist');
    triggerAutoSync();
  }

  function openAddToPlaylistModal(track) {
    state.trackToAddToPlaylist = track;
    const modal = document.getElementById('modal-add-to-playlist');
    const list = document.getElementById('playlist-picker-list');
    if (!modal || !list) return;

    if (state.playlists.length === 0) {
      list.innerHTML = `
        <div class="zm-empty">No playlists created yet.</div>
        <button id="btn-quick-create-pl" class="btn-action-primary" style="margin: 0 auto; display: block;">+ Create Playlist</button>
      `;
      const quickBtn = document.getElementById('btn-quick-create-pl');
      if (quickBtn) {
        quickBtn.onclick = () => {
          modal.style.display = 'none';
          document.getElementById('modal-create-playlist').style.display = 'flex';
          document.getElementById('input-new-playlist-name').focus();
        };
      }
    } else {
      list.innerHTML = state.playlists.map(pl => {
        const thumb = pl.tracks && pl.tracks[0] && pl.tracks[0].thumbnail;
        const badge = thumb
          ? `<img class="sidebar-pl-thumb" src="${thumb}" alt="" loading="lazy">`
          : `<span class="sidebar-pl-icon-badge custom"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span>`;
        return `
        <div class="playlist-picker-item" data-pl-id="${pl.id}">
          <span style="display:flex;align-items:center;gap:10px;min-width:0;">${badge}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(pl.name)}</span></span>
          <span style="font-size: 11px; color: var(--zm-text-dim); flex-shrink:0;">${pl.tracks.length} songs</span>
        </div>
      `;
      }).join('');

      list.querySelectorAll('.playlist-picker-item').forEach(item => {
        item.addEventListener('click', () => {
          addTrackToPlaylist(item.dataset.plId, state.trackToAddToPlaylist);
          modal.style.display = 'none';
        });
      });
    }

    modal.style.display = 'flex';
  }

  // ── Skeleton Shimmer Builders ──
  function renderGridSkeleton(container, count = 6) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-box skeleton-art"></div>
        <div class="skeleton-box skeleton-line"></div>
        <div class="skeleton-box skeleton-line short"></div>
      </div>
    `).join('');
  }

  function renderRowsSkeleton(container, count = 9) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }).map(() => `
      <div class="skeleton-row">
        <div class="skeleton-box skeleton-thumb"></div>
        <div class="skeleton-row-lines">
          <div class="skeleton-box skeleton-line" style="width: 56%;"></div>
          <div class="skeleton-box skeleton-line short" style="width: 34%;"></div>
        </div>
      </div>
    `).join('');
  }

  // ── Top 100 Charts & Recommender Engine ──
  async function loadTop100Chart(chartType = 'global') {
    state.activeChart = chartType;
    const cacheKey = chartType === 'india' ? 'top100India' : 'top100Global';
    const mainTable = document.getElementById('main-top-100-table');
    const fullTable = document.getElementById('full-chart-table');
    const mainTitle = document.getElementById('main-chart-title');
    const fullTitle = document.getElementById('chart-view-title');

    const titleText = chartType === 'india' ? 'Top 100 Songs India' : 'Top 100 Songs Worldwide';
    if (mainTitle) mainTitle.textContent = titleText;
    if (fullTitle) fullTitle.textContent = titleText;

    document.querySelectorAll('.chart-tab-btn, .header-action-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.chart === chartType || btn.dataset.chartSwitch === chartType);
    });

    if (state.sectionsData[cacheKey] && state.sectionsData[cacheKey].length > 0) {
      if (mainTable) renderTop100Table(mainTable, state.sectionsData[cacheKey].slice(0, 12));
      if (fullTable) renderTop100Table(fullTable, state.sectionsData[cacheKey]);
      return;
    }

    if (mainTable) renderRowsSkeleton(mainTable, 9);
    if (fullTable && state.activeView === 'chart') renderRowsSkeleton(fullTable, 12);

    try {
      const res = await fetch(`${_EP.SEARCH}?chart=${chartType}`);
      const data = await res.json();
      if (data && data.tracks && data.tracks.length > 0) {
        state.sectionsData[cacheKey] = data.tracks;
        if (mainTable) renderTop100Table(mainTable, data.tracks.slice(0, 12));
        if (fullTable) renderTop100Table(fullTable, data.tracks);
        if (chartType === 'global' && typeof refreshSpotlightFromCharts === 'function') {
          refreshSpotlightFromCharts(data.tracks);
        }
        return;
      }
    } catch (e) {
      console.warn('Chart fetch failed, using fallback:', e);
    }

    // Fallback to high quality seeds
    const fallback = [...SEED_YOUR_MIX, ...SEED_QUICK_PICKS, ...SEED_NEW_RELEASES];
    state.sectionsData[cacheKey] = fallback;
    if (mainTable) renderTop100Table(mainTable, fallback.slice(0, 12));
    if (fullTable) renderTop100Table(fullTable, fallback);
  }

  function renderTop100Table(container, tracks) {
    if (!container) return;
    container.innerHTML = tracks.map((track, idx) => {
      const rank = track.rank || (idx + 1);
      const rankClass = rank === 1 ? 'rank-top-1' : rank === 2 ? 'rank-top-2' : rank === 3 ? 'rank-top-3' : '';
      const isCurrent = state.currentTrack && state.currentTrack.id === track.id;
      const liked = isTrackLiked(track.id);
      return `
        <div class="track-row-item ${isCurrent ? 'active-row' : ''}" data-id="${track.id}" data-index="${idx}" data-rank="#${rank}">
          <span class="row-index ${rankClass}">${isCurrent ? `<span class="eq-bars ${state.isPlaying ? '' : 'paused'}"><i></i><i></i><i></i></span>` : `#${rank}`}</span>
          <img class="row-art-thumb" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" loading="lazy" data-track-id="${track.id}" />
          <div class="row-meta-col">
            <div class="row-track-name">${escapeHtml(track.title)}</div>
            <div class="row-artist-name">${escapeHtml(track.artist)}</div>
          </div>
          <span class="row-duration-tag">${track.duration || '3:30'}</span>
          <div class="row-actions-group">
            <button class="row-btn-action row-btn-like ${liked ? 'liked' : ''}" data-track-id="${track.id}" title="Like">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${liked ? 'var(--zm-accent)' : 'none'}" stroke="${liked ? 'var(--zm-accent)' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button class="row-btn-action row-btn-add" title="Add to Playlist">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button class="row-btn-action row-btn-more" title="More options">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    batchResolveCovers(tracks, 20);

    container.querySelectorAll('.track-row-item').forEach(row => {
      const idx = parseInt(row.dataset.index, 10);
      const track = tracks[idx];

      row.addEventListener('click', (e) => {
        if (e.target.closest('.row-btn-action')) return;
        if (state.currentTrack && state.currentTrack.id === track.id) {
          togglePlayPause();
        } else {
          playTrack(track, tracks, idx);
        }
      });

      const likeBtn = row.querySelector('.row-btn-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLikeTrack(track);
        });
      }

      const addBtn = row.querySelector('.row-btn-add');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openAddToPlaylistModal(track);
        });
      }

      const moreBtn = row.querySelector('.row-btn-more');
      if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openTrackContextMenu(track, moreBtn);
        });
      }
    });
  }

  // ── "Because You Listened To" & Radio ──
  async function updateBecauseYouListened() {
    const section = document.getElementById('because-listened-section');
    const grid = document.getElementById('because-grid');
    const titleEl = document.getElementById('because-title');
    const subtitleEl = document.getElementById('because-subtitle');

    if (!section || !grid) return;

    const topTrack = state.currentTrack || state.history[0];
    if (!topTrack) {
      section.style.display = 'none';
      return;
    }

    if (titleEl) titleEl.textContent = `Because you listened to ${topTrack.title}`;
    if (subtitleEl) subtitleEl.textContent = topTrack.artist;
    section.style.display = 'block';

    try {
      const radioSeedId = getKnownYouTubeId(topTrack);
      if (radioSeedId && !isSpotifyTrackId(radioSeedId)) {
        const res = await fetch(`${_EP.SEARCH}?radio=${radioSeedId}`);
        const data = await res.json();
        if (data && data.tracks && data.tracks.length > 0) {
          state.sectionsData.because = data.tracks;
          renderTrackGrid(grid, data.tracks.slice(0, 12));
          return;
        }
      }
    } catch (e) {}

    // Fallback radio blend
    renderTrackGrid(grid, SEED_QUICK_PICKS);
  }

  // ── 16 Exact Android App Moods & Genres Filters ──
  async function loadMoodTracks(moodName) {
    state.activeMood = moodName;
    const moodKey = moodName.toLowerCase();

    document.querySelectorAll('.mood-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.mood.toLowerCase() === moodKey);
    });

    if (moodKey === 'all') {
      switchMainView('home');
      return;
    }

    switchMainView('search');
    const container = document.getElementById('search-results-grid');
    const header = document.getElementById('search-results-header');
    const sub = document.getElementById('search-results-subtitle');
    const browsePanel = document.getElementById('search-browse-panel');
    const topWrap = document.getElementById('search-top-result-wrap');
    const viewToggle = document.getElementById('search-view-toggle');

    if (browsePanel) browsePanel.style.display = 'none';
    if (topWrap) topWrap.style.display = 'none';
    if (viewToggle) viewToggle.style.display = 'flex';
    if (header) header.textContent = `${moodName} Picks`;
    if (sub) sub.textContent = `YouTube Music ${moodName} playlists & curated hits`;

    // Check cache in state.sectionsData
    if (state.sectionsData[moodKey] && state.sectionsData[moodKey].length > 0) {
      state.lastSearchTracks = state.sectionsData[moodKey];
      renderSearchResultsCollection(state.sectionsData[moodKey], false);
      return;
    }

    if (container) {
      container.className = 'tracks-grid';
      renderGridSkeleton(container, 8);
    }

    try {
      const res = await fetch(`${_EP.SEARCH}?mood=${encodeURIComponent(moodName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.tracks && data.tracks.length > 0) {
          state.sectionsData[moodKey] = data.tracks;
          state.lastSearchTracks = data.tracks;
          renderSearchResultsCollection(data.tracks, false);
          return;
        }
      }
    } catch (e) {
      console.warn('Mood fetch failed, using curated seeds:', e);
    }

    const fallback = SEED_MOODS[moodKey] || SEED_MOODS[moodKey.replace(/-/g, '')] || [...SEED_YOUR_MIX, ...SEED_NEW_RELEASES];
    state.sectionsData[moodKey] = fallback;
    state.lastSearchTracks = fallback;
    renderSearchResultsCollection(fallback, false);
  }

  // ── Render Track Grid (Cards) ──
  function renderTrackGrid(container, tracks) {
    if (!container) return;
    container.innerHTML = tracks.map((track, idx) => {
      const isCurrent = state.currentTrack && state.currentTrack.id === track.id;
      const liked = isTrackLiked(track.id);
      return `
      <div class="track-card ${isCurrent ? 'now-playing-card' : ''}" data-id="${track.id}" data-index="${idx}">
        <div class="card-art-box">
          <img src="${track.thumbnail}" alt="${escapeHtml(track.title)}" loading="lazy" data-track-id="${track.id}" />
          ${isCurrent ? `<div class="card-eq-badge"><span class="eq-bars ${state.isPlaying ? '' : 'paused'}"><i></i><i></i><i></i></span></div>` : ''}
          <button class="card-hover-play" aria-label="${isCurrent && state.isPlaying ? 'Pause' : 'Play'} ${escapeHtml(track.title)}">
            ${isCurrent && state.isPlaying
              ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
              : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>`}
          </button>
          <button class="card-hover-like ${liked ? 'liked' : ''}" data-track-id="${track.id}" title="Like">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${liked ? 'var(--zm-accent)' : 'none'}" stroke="${liked ? 'var(--zm-accent)' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="card-hover-menu" title="Add to Playlist">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <button class="card-hover-more" title="More options">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
        </div>
        <div class="card-meta">
          <h4 class="card-title" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</h4>
          <p class="card-artist" title="${escapeHtml(track.artist)}">${escapeHtml(track.artist)}</p>
        </div>
      </div>
    `;
    }).join('');

    batchResolveCovers(tracks, 12);

    container.querySelectorAll('.track-card').forEach(card => {
      const idx = parseInt(card.dataset.index, 10);
      const track = tracks[idx];

      const playBtn = card.querySelector('.card-hover-play');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.currentTrack && state.currentTrack.id === track.id) {
            togglePlayPause();
          } else {
            playTrack(track, tracks, idx);
          }
        });
      }

      card.addEventListener('click', () => {
        if (state.currentTrack && state.currentTrack.id === track.id) {
          togglePlayPause();
        } else {
          playTrack(track, tracks, idx);
        }
      });

      const likeBtn = card.querySelector('.card-hover-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLikeTrack(track);
        });
      }

      const menuBtn = card.querySelector('.card-hover-menu');
      if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openAddToPlaylistModal(track);
        });
      }

      const moreBtn = card.querySelector('.card-hover-more');
      if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openTrackContextMenu(track, moreBtn);
        });
      }
    });

    if (typeof updateCarouselArrowsFor === 'function') {
      updateCarouselArrowsFor(container);
    }
  }

  // ── Render Track Rows (Table List) ──
  function renderTrackRows(container, tracks, showActions = false, playlistId = null) {
    if (!container) return;
    container.innerHTML = tracks.map((track, idx) => {
      const isCurrent = state.currentTrack && state.currentTrack.id === track.id;
      const liked = isTrackLiked(track.id);
      return `
      <div class="track-row-item ${isCurrent ? 'active-row' : ''}" data-id="${track.id}" data-index="${idx}" data-rank="${idx + 1}">
        <span class="row-index">${isCurrent ? `<span class="eq-bars ${state.isPlaying ? '' : 'paused'}"><i></i><i></i><i></i></span>` : (idx + 1)}</span>
        <img class="row-art-thumb" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" loading="lazy" data-track-id="${track.id}" />
        <div class="row-meta-col">
          <div class="row-track-name">${escapeHtml(track.title)}</div>
          <div class="row-artist-name">${escapeHtml(track.artist)}</div>
        </div>
        <span class="row-duration-tag">${track.duration || '3:30'}</span>
        ${showActions ? `
          <div class="row-actions-group">
            <button class="row-btn-action row-btn-like ${liked ? 'liked' : ''}" data-track-id="${track.id}" title="Like">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${liked ? 'var(--zm-accent)' : 'none'}" stroke="${liked ? 'var(--zm-accent)' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            ${playlistId ? `
              <button class="row-btn-action row-btn-del" title="Remove from Playlist">✕</button>
            ` : `
              <button class="row-btn-action row-btn-add" title="Add to Playlist">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            `}
            <button class="row-btn-action row-btn-more" title="More options">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
          </div>
        ` : ''}
      </div>
    `;
    }).join('');

    batchResolveCovers(tracks, 15);

    container.querySelectorAll('.track-row-item').forEach(row => {
      const idx = parseInt(row.dataset.index, 10);
      const track = tracks[idx];

      row.addEventListener('click', (e) => {
        if (e.target.closest('.row-btn-action')) return;
        if (state.currentTrack && state.currentTrack.id === track.id) {
          togglePlayPause();
        } else {
          playTrack(track, tracks, idx);
        }
      });

      const likeBtn = row.querySelector('.row-btn-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLikeTrack(track);
        });
      }

      const delBtn = row.querySelector('.row-btn-del');
      if (delBtn && playlistId) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeTrackFromPlaylist(playlistId, track.id);
        });
      }

      const addBtn = row.querySelector('.row-btn-add');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openAddToPlaylistModal(track);
        });
      }

      const moreBtn = row.querySelector('.row-btn-more');
      if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openTrackContextMenu(track, moreBtn);
        });
      }
    });
  }

  // ── Queue Drawer (Now Playing + Pointer Drag-Reorderable Up Next) ──
  function renderQueue() {
    const list = document.getElementById('queue-items-list');
    const thList = document.getElementById('theater-queue-body');
    const badge = document.getElementById('queue-count-badge');
    const durBadge = document.getElementById('queue-duration-badge');

    const remainingTracks = state.queueIndex >= 0 ? state.queue.slice(state.queueIndex) : state.queue;
    if (badge) badge.textContent = state.queue.length;
    if (durBadge) durBadge.textContent = remainingTracks.length ? formatTotalDuration(remainingTracks) : '';

    const buildQueueHtml = (allowDrag) => {
      if (state.queue.length === 0) return '<div class="zm-empty">Queue is empty</div>';
      let out = '';
      if (state.queueIndex >= 0 && state.queue[state.queueIndex]) {
        const cur = state.queue[state.queueIndex];
        out += `<div class="queue-section-label">NOW PLAYING</div>`;
        out += `
          <div class="queue-item-card current-playing" data-index="${state.queueIndex}">
            <span class="eq-bars ${state.isPlaying ? '' : 'paused'}"><i></i><i></i><i></i></span>
            <img class="queue-art-thumb" src="${cur.thumbnail}" alt="${escapeHtml(cur.title)}" data-track-id="${cur.id}" />
            <div class="queue-info-text">
              <div class="queue-song-name">${escapeHtml(cur.title)}</div>
              <div class="queue-song-artist">${escapeHtml(cur.artist)}</div>
            </div>
          </div>
        `;
      }

      const upcomingItems = state.queue
        .map((track, i) => ({ track, i }))
        .filter(({ i }) => i !== state.queueIndex);

      if (upcomingItems.length > 0) {
        out += `<div class="queue-section-label">NEXT IN QUEUE (${upcomingItems.length})</div>`;
        out += upcomingItems.map(({ track, i }) => `
          <div class="queue-item-card" data-index="${i}">
            ${allowDrag ? `<span class="queue-drag-handle" title="Drag to reorder">⠿</span>` : ''}
            <img class="queue-art-thumb" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" data-track-id="${track.id}" />
            <div class="queue-info-text">
              <div class="queue-song-name">${escapeHtml(track.title)}</div>
              <div class="queue-song-artist">${escapeHtml(track.artist)}</div>
            </div>
            <button class="btn-queue-del" title="Remove">✕</button>
          </div>
        `).join('');
      }
      return out;
    };

    const wireQueueContainer = (el, allowDrag) => {
      if (!el) return;
      el.innerHTML = buildQueueHtml(allowDrag);
      el.querySelectorAll('.queue-item-card').forEach(row => {
        const idx = parseInt(row.dataset.index, 10);
        row.addEventListener('click', (e) => {
          if (e.target.closest('.queue-drag-handle')) return;
          if (e.target.classList.contains('btn-queue-del')) {
            e.stopPropagation();
            state.queue.splice(idx, 1);
            if (idx < state.queueIndex) state.queueIndex--;
            renderQueue();
            return;
          }
          if (idx === state.queueIndex && state.currentTrack) {
            togglePlayPause();
          } else {
            playTrack(state.queue[idx], state.queue, idx);
          }
        });

        if (allowDrag) {
          const handle = row.querySelector('.queue-drag-handle');
          if (handle) {
            handle.addEventListener('pointerdown', (e) => startQueuePointerDrag(e, el, idx));
          }
        }
      });
    };

    wireQueueContainer(list, true);
    wireQueueContainer(thList, false);
  }

  function startQueuePointerDrag(downEvent, container, fromIdx) {
    downEvent.preventDefault();
    downEvent.stopPropagation();
    const sourceRow = container.querySelector(`.queue-item-card[data-index="${fromIdx}"]`);
    if (sourceRow) sourceRow.classList.add('dragging');
    let targetIdx = fromIdx;

    const onMove = (ev) => {
      container.querySelectorAll('.queue-item-card.drag-over').forEach(r => r.classList.remove('drag-over'));
      const elUnder = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.queue-item-card');
      if (elUnder && container.contains(elUnder)) {
        const idx = parseInt(elUnder.dataset.index, 10);
        if (!isNaN(idx) && idx !== state.queueIndex) {
          targetIdx = idx;
          elUnder.classList.add('drag-over');
        }
      }
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (sourceRow) sourceRow.classList.remove('dragging');
      container.querySelectorAll('.queue-item-card.drag-over').forEach(r => r.classList.remove('drag-over'));
      if (targetIdx !== fromIdx && targetIdx >= 0 && targetIdx < state.queue.length) {
        const currentId = state.currentTrack?.id;
        const [moved] = state.queue.splice(fromIdx, 1);
        state.queue.splice(targetIdx, 0, moved);
        if (currentId) {
          const newCur = state.queue.findIndex(t => t.id === currentId);
          if (newCur >= 0) state.queueIndex = newCur;
        }
        renderQueue();
        showToast('Reordered queue');
      }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  // ── Navigation & View Switching ──
  function switchMainView(viewName) {
    state.activeView = viewName;

    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    document.querySelectorAll('.main-content-section').forEach(sec => {
      const active = sec.id === `section-${viewName}`;
      sec.style.display = active ? 'block' : 'none';
      sec.classList.toggle('active-section', active);
    });

    if (viewName !== 'playlist') {
      state.activePlaylistId = null;
      renderPlaylistsSidebar();
    }
    if (viewName === 'search' && state.lastSearchTracks.length === 0) {
      renderSearchBrowsePanel();
    }
    if (viewName === 'stats') {
      renderStatsView();
    }
    if (viewName === 'home') {
      renderBentoHome();
    }

    const canvas = document.getElementById('stage-scroll-canvas');
    if (canvas) canvas.scrollTop = 0;
    closeMobileSidebar();
  }

  // ── Instant Search, Keyboard Autocomplete, Recent Searches & Top Result ──
  let searchDebounceTimer = null;
  let suggestFocusIndex = -1;

  function saveRecentSearch(q) {
    if (!q || !q.trim()) return;
    const clean = q.trim();
    state.recentSearches = [clean, ...state.recentSearches.filter(x => x.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    localStorage.setItem('zm_recent_searches', JSON.stringify(state.recentSearches));
  }

  function renderSearchBrowsePanel() {
    const browsePanel = document.getElementById('search-browse-panel');
    const topWrap = document.getElementById('search-top-result-wrap');
    const viewToggle = document.getElementById('search-view-toggle');
    const resultsGrid = document.getElementById('search-results-grid');
    const header = document.getElementById('search-results-header');
    const sub = document.getElementById('search-results-subtitle');

    if (browsePanel) browsePanel.style.display = 'block';
    if (topWrap) topWrap.style.display = 'none';
    if (viewToggle) viewToggle.style.display = 'none';
    if (resultsGrid) resultsGrid.innerHTML = '';
    if (header) header.textContent = 'Explore & Search';
    if (sub) sub.textContent = 'Search tracks, artists, or browse moods below';

    const recentWrap = document.getElementById('recent-searches-wrap');
    const recentList = document.getElementById('recent-searches-list');
    if (recentWrap && recentList) {
      if (state.recentSearches.length > 0) {
        recentWrap.style.display = 'block';
        recentList.innerHTML = state.recentSearches.map((q, idx) => `
          <div class="recent-search-chip" data-query="${escapeHtml(q)}">
            <span>${escapeHtml(q)}</span>
            <button class="recent-chip-del" data-del-idx="${idx}" aria-label="Remove">✕</button>
          </div>
        `).join('');
        recentList.querySelectorAll('.recent-search-chip').forEach(chip => {
          chip.addEventListener('click', (e) => {
            if (e.target.classList.contains('recent-chip-del')) {
              e.stopPropagation();
              const di = parseInt(e.target.dataset.delIdx, 10);
              state.recentSearches.splice(di, 1);
              localStorage.setItem('zm_recent_searches', JSON.stringify(state.recentSearches));
              renderSearchBrowsePanel();
              return;
            }
            const q = chip.dataset.query;
            const input = document.getElementById('zm-search-input');
            if (input) input.value = q;
            executeSearch(q);
          });
        });
      } else {
        recentWrap.style.display = 'none';
      }
    }

    const moodTiles = document.getElementById('search-mood-tiles');
    if (moodTiles && !moodTiles.dataset.rendered) {
      const palette = [
        ['Workout', 'High BPM Energy', 'linear-gradient(135deg, #ea580c, #9a3412)'],
        ['Chill', 'Laid-back Vibes', 'linear-gradient(135deg, #0284c7, #1e3a8a)'],
        ['Focus', 'Deep Flow State', 'linear-gradient(135deg, #059669, #064e3b)'],
        ['Party', 'Dance & Club', 'linear-gradient(135deg, #db2777, #701a75)'],
        ['Romance', 'Warm & Acoustic', 'linear-gradient(135deg, #e11d48, #881337)'],
        ['Sad', 'Late Night Feels', 'linear-gradient(135deg, #4f46e5, #1e1b4b)'],
        ['Phonk', 'Drift & Bass', 'linear-gradient(135deg, #9333ea, #3b0764)'],
        ['Bollywood', 'Desi Chartbusters', 'linear-gradient(135deg, #d97706, #78350f)'],
        ['Punjabi', 'Bhangra & Pop', 'linear-gradient(135deg, #16a34a, #14532d)'],
        ['Lo-fi', 'Beats to Study', 'linear-gradient(135deg, #6366f1, #312e81)'],
        ['Hip-hop', 'Bars & Beats', 'linear-gradient(135deg, #b45309, #451a03)'],
        ['Rock', 'Guitars & Classics', 'linear-gradient(135deg, #dc2626, #450a0a)'],
        ['K-pop', 'Seoul Pop Hits', 'linear-gradient(135deg, #ec4899, #831843)'],
        ['90s', 'Golden Throwbacks', 'linear-gradient(135deg, #0d9488, #134e4a)'],
        ['Devotional', 'Soul & Peace', 'linear-gradient(135deg, #ca8a04, #713f12)'],
        ['Sleep', 'Ambient Rest', 'linear-gradient(135deg, #334155, #0f172a)']
      ];
      moodTiles.innerHTML = palette.map(([name, desc, bg]) => `
        <button class="mood-browse-tile" data-browse-mood="${name}" style="background: ${bg};">
          <span class="mood-browse-label">${name}</span>
          <span class="mood-browse-sub">${desc}</span>
        </button>
      `).join('');
      moodTiles.dataset.rendered = '1';
      moodTiles.querySelectorAll('.mood-browse-tile').forEach(btn => {
        btn.addEventListener('click', () => loadMoodTracks(btn.dataset.browseMood));
      });
    }
  }

  function renderSearchResultsCollection(tracks, showTopResult = true) {
    const container = document.getElementById('search-results-grid');
    const topWrap = document.getElementById('search-top-result-wrap');
    const viewToggle = document.getElementById('search-view-toggle');
    if (!container) return;

    if (viewToggle) viewToggle.style.display = 'flex';
    document.getElementById('btn-search-view-grid')?.classList.toggle('active', state.searchViewMode === 'grid');
    document.getElementById('btn-search-view-list')?.classList.toggle('active', state.searchViewMode === 'list');

    if (topWrap) {
      if (showTopResult && tracks.length >= 2) {
        const top = tracks[0];
        const quickList = tracks.slice(1, 5);
        topWrap.style.display = 'grid';
        topWrap.innerHTML = `
          <div class="top-result-card clickable" id="top-result-hero">
            <div class="billboard-ambient-bg" style="background-image: url('${top.thumbnail}'); opacity: 0.35;"></div>
            <div style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px;">
              <span class="editorial-eyebrow" style="margin: 0;">TOP RESULT</span>
              <img class="top-result-art" src="${top.thumbnail}" alt="${escapeHtml(top.title)}" data-track-id="${top.id}">
              <div>
                <h3 class="top-result-title">${escapeHtml(top.title)}</h3>
                <div class="top-result-artist">${escapeHtml(top.artist)}</div>
              </div>
              <div class="editorial-actions-row">
                <button class="btn-editorial-play" id="btn-top-result-play">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>
                  <span>Play</span>
                </button>
                <button class="btn-action-pill" id="btn-top-result-queue">+ Up Next</button>
              </div>
            </div>
          </div>
          <div id="search-top-songs-rows" class="track-rows-wrap"></div>
        `;
        document.getElementById('top-result-hero')?.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          playTrack(top, tracks, 0);
        });
        document.getElementById('btn-top-result-play')?.addEventListener('click', () => playTrack(top, tracks, 0));
        document.getElementById('btn-top-result-queue')?.addEventListener('click', () => playTrackNext(top));
        renderTrackRows(document.getElementById('search-top-songs-rows'), quickList, true, null);
      } else {
        topWrap.style.display = 'none';
        topWrap.innerHTML = '';
      }
    }

    if (state.searchViewMode === 'list') {
      container.className = 'track-rows-wrap';
      renderTrackRows(container, tracks, true, null);
    } else {
      container.className = 'tracks-grid';
      renderTrackGrid(container, tracks);
    }
  }

  function initSearch() {
    const searchInput = document.getElementById('zm-search-input');
    const clearBtn = document.getElementById('zm-search-clear');
    const suggestBox = document.getElementById('zm-search-suggestions');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim();
      suggestFocusIndex = -1;
      if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';

      clearTimeout(searchDebounceTimer);
      if (!val) {
        if (suggestBox) suggestBox.style.display = 'none';
        return;
      }

      searchDebounceTimer = setTimeout(() => {
        fetchSuggestions(val);
      }, 150);
    });

    searchInput.addEventListener('keydown', (e) => {
      const items = suggestBox ? Array.from(suggestBox.querySelectorAll('.suggest-item')) : [];
      if (e.key === 'ArrowDown' && items.length > 0 && suggestBox.style.display === 'block') {
        e.preventDefault();
        suggestFocusIndex = (suggestFocusIndex + 1) % items.length;
        items.forEach((it, idx) => it.classList.toggle('focused', idx === suggestFocusIndex));
        searchInput.value = items[suggestFocusIndex].dataset.val;
        return;
      }
      if (e.key === 'ArrowUp' && items.length > 0 && suggestBox.style.display === 'block') {
        e.preventDefault();
        suggestFocusIndex = (suggestFocusIndex - 1 + items.length) % items.length;
        items.forEach((it, idx) => it.classList.toggle('focused', idx === suggestFocusIndex));
        searchInput.value = items[suggestFocusIndex].dataset.val;
        return;
      }
      if (e.key === 'Escape') {
        if (suggestBox) suggestBox.style.display = 'none';
        searchInput.blur();
        return;
      }
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
          if (suggestBox) suggestBox.style.display = 'none';
          executeSearch(val);
        }
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        if (suggestBox) suggestBox.style.display = 'none';
        state.lastSearchTracks = [];
        state.lastSearchQuery = '';
        if (state.activeView === 'search') renderSearchBrowsePanel();
      });
    }

    document.getElementById('btn-clear-recent-searches')?.addEventListener('click', () => {
      state.recentSearches = [];
      localStorage.removeItem('zm_recent_searches');
      renderSearchBrowsePanel();
    });

    document.getElementById('btn-search-view-grid')?.addEventListener('click', () => {
      state.searchViewMode = 'grid';
      localStorage.setItem('zm_search_view', 'grid');
      if (state.lastSearchTracks.length) renderSearchResultsCollection(state.lastSearchTracks, !!state.lastSearchQuery);
    });
    document.getElementById('btn-search-view-list')?.addEventListener('click', () => {
      state.searchViewMode = 'list';
      localStorage.setItem('zm_search_view', 'list');
      if (state.lastSearchTracks.length) renderSearchResultsCollection(state.lastSearchTracks, !!state.lastSearchQuery);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.stage-search-shell')) {
        if (suggestBox) suggestBox.style.display = 'none';
      }
    });
  }

  async function fetchSuggestions(query) {
    const suggestBox = document.getElementById('zm-search-suggestions');
    if (!suggestBox) return;

    try {
      const script = document.createElement('script');
      const callbackName = 'zm_yt_suggest_' + Math.floor(Math.random() * 1000000);
      window[callbackName] = function (data) {
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);

        const results = (data && data[1]) ? data[1].map(r => r[0]) : [];
        if (results.length > 0) {
          suggestFocusIndex = -1;
          suggestBox.innerHTML = results.slice(0, 6).map(s => `
            <div class="suggest-item" data-val="${escapeHtml(s)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>${escapeHtml(s)}</span>
            </div>
          `).join('');
          suggestBox.style.display = 'block';

          suggestBox.querySelectorAll('.suggest-item').forEach(it => {
            it.addEventListener('click', () => {
              const selected = it.dataset.val;
              const input = document.getElementById('zm-search-input');
              if (input) input.value = selected;
              suggestBox.style.display = 'none';
              executeSearch(selected);
            });
          });
        } else {
          suggestBox.style.display = 'none';
        }
      };

      script.src = `${_EP.SUGGEST}?client=youtube&ds=yt&client=firefox&q=${encodeURIComponent(query)}&callback=${callbackName}`;
      document.body.appendChild(script);
    } catch (e) {
      suggestBox.style.display = 'none';
    }
  }

  async function executeSearch(query) {
    if (!isUserAuthenticated()) {
      updateAuthGate();
      showToast('Please sign in with Google to use ZeroMusic');
      return;
    }
    state.lastSearchQuery = query;
    saveRecentSearch(query);
    switchMainView('search');

    const browsePanel = document.getElementById('search-browse-panel');
    const topWrap = document.getElementById('search-top-result-wrap');
    const container = document.getElementById('search-results-grid');
    const header = document.getElementById('search-results-header');
    const sub = document.getElementById('search-results-subtitle');

    if (browsePanel) browsePanel.style.display = 'none';
    if (topWrap) topWrap.style.display = 'none';
    if (header) header.textContent = `Search results for "${query}"`;
    if (sub) sub.textContent = 'Songs, artists, and audio tracks';
    if (!container) return;

    container.className = 'tracks-grid';
    renderGridSkeleton(container, 8);

    try {
      const res = await fetch(`${_EP.SEARCH}?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.tracks && data.tracks.length > 0) {
        state.lastSearchTracks = data.tracks;
        renderSearchResultsCollection(data.tracks, true);
      } else {
        state.lastSearchTracks = [];
        container.innerHTML = '<div class="zm-empty">No tracks found. Try a different search query.</div>';
      }
    } catch (e) {
      state.lastSearchTracks = [];
      container.innerHTML = '<div class="zm-empty">Search unavailable at this second. Try again shortly.</div>';
    }
  }

  // ── Setup UI Event Listeners ──
  function initUIListeners() {
    // Transport buttons
    document.getElementById('btn-play-pause')?.addEventListener('click', togglePlayPause);
    document.getElementById('btn-next')?.addEventListener('click', playNext);
    document.getElementById('btn-prev')?.addEventListener('click', playPrev);
    document.getElementById('btn-mute')?.addEventListener('click', toggleMute);

    // Shuffle & Repeat (with proper startup state & Repeat-1 badge)
    updateShuffleButtonUI();
    updateRepeatButtonUI();

    document.getElementById('btn-shuffle')?.addEventListener('click', toggleShuffleMode);
    document.getElementById('theater-shuffle')?.addEventListener('click', toggleShuffleMode);

    document.getElementById('btn-repeat')?.addEventListener('click', cycleRepeatMode);
    document.getElementById('theater-repeat')?.addEventListener('click', cycleRepeatMode);

    // Volume Slider + Fill + Scroll Wheel
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.value = state.volume;
      updateVolumeUI();
      volSlider.addEventListener('input', (e) => {
        setVolume(parseInt(e.target.value, 10));
      });
    }
    const volGroup = document.getElementById('volume-slider-group');
    if (volGroup) {
      volGroup.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 5 : -5;
        setVolume(state.volume + delta);
      }, { passive: false });
    }

    // Pro Scrubber (Hover Tooltip + Smooth Preview on Input + Commit on Change)
    const wireScrubber = (inputId, fillId, elapsedId, wrapId, tooltipId) => {
      const scrubber = document.getElementById(inputId);
      const fill = document.getElementById(fillId);
      const elapsed = document.getElementById(elapsedId);
      const wrap = wrapId ? document.getElementById(wrapId) : null;
      const tooltip = tooltipId ? document.getElementById(tooltipId) : null;

      if (scrubber) {
        scrubber.addEventListener('input', (e) => {
          state.isScrubbing = true;
          const pct = parseFloat(e.target.value) || 0;
          if (fill) fill.style.width = pct + '%';
          if (elapsed && state.duration > 0) {
            elapsed.textContent = formatTime((pct / 100) * state.duration);
          }
        });
        scrubber.addEventListener('change', (e) => {
          state.isScrubbing = false;
          if (state.duration > 0) {
            const targetSec = (parseFloat(e.target.value) / 100) * state.duration;
            seekTo(targetSec);
          }
        });
      }

      if (wrap && tooltip) {
        wrap.addEventListener('mousemove', (e) => {
          if (state.duration <= 0) return;
          const rect = wrap.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          tooltip.textContent = formatTime(ratio * state.duration);
          tooltip.style.left = (ratio * 100) + '%';
          tooltip.classList.add('visible');
        });
        wrap.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });
      }
    };

    wireScrubber('playback-progress', 'progress-bar-fill', 'time-elapsed', 'scrubber-track-wrap', 'scrubber-tooltip');
    wireScrubber('theater-progress', 'theater-fill', 'theater-elapsed', null, null);

    // Like, Add to Playlist, More Menu for Current Track
    document.getElementById('btn-like-current')?.addEventListener('click', () => {
      if (state.currentTrack) toggleLikeTrack(state.currentTrack);
    });
    document.getElementById('btn-add-playlist-current')?.addEventListener('click', () => {
      if (state.currentTrack) openAddToPlaylistModal(state.currentTrack);
    });
    document.getElementById('btn-more-current')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.currentTrack) openTrackContextMenu(state.currentTrack, e.currentTarget);
    });

    // Sidebar navigation buttons
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view === 'chart') {
          switchMainView('chart');
          loadTop100Chart(state.activeChart);
        } else {
          switchMainView(view);
        }
      });
    });

    // Full Top 100 View CTA from Home compact preview
    document.getElementById('btn-view-full-chart')?.addEventListener('click', () => {
      switchMainView('chart');
      loadTop100Chart(state.activeChart);
    });

    // Chart Switchers
    document.querySelectorAll('[data-chart-switch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.chartSwitch;
        loadTop100Chart(type);
      });
    });

    document.querySelectorAll('.chart-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.chart;
        loadTop100Chart(type);
      });
    });

    // Play All Section Buttons
    document.querySelectorAll('[data-play-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.dataset.playSection;
        let tracks = [];
        if (sec === 'your-mix') tracks = state.sectionsData.yourMix.length ? state.sectionsData.yourMix : SEED_YOUR_MIX;
        else if (sec === 'quick-picks') tracks = state.sectionsData.quickPicks.length ? state.sectionsData.quickPicks : SEED_QUICK_PICKS;
        else if (sec === 'because') tracks = state.sectionsData.because.length ? state.sectionsData.because : SEED_QUICK_PICKS;
        else if (sec === 'top-100' || sec === 'chart-view') {
          tracks = state.activeChart === 'india' ? state.sectionsData.top100India : state.sectionsData.top100Global;
        }
        if (tracks.length > 0) playTrack(tracks[0], tracks, 0);
      });
    });

    // Home Shuffle Liked Quick Action
    document.getElementById('btn-home-shuffle-liked')?.addEventListener('click', () => {
      if (state.likedTracks.length > 0) {
        const shuffled = [...state.likedTracks].sort(() => Math.random() - 0.5);
        playTrack(shuffled[0], shuffled, 0);
      }
    });

    // 16 Moods Chips
    document.querySelectorAll('.mood-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        loadMoodTracks(chip.dataset.mood);
      });
    });

    // Clear History Button
    document.getElementById('btn-clear-history')?.addEventListener('click', () => {
      state.history = [];
      localStorage.removeItem('zm_history');
      renderRecentlyPlayed();
      renderBentoHome();
      showToast('Cleared listening history');
    });

    // Playlist Filter & Sort
    document.getElementById('playlist-filter-input')?.addEventListener('input', (e) => {
      state.playlistFilter = e.target.value || '';
      if (state.activePlaylistId) openPlaylistView(state.activePlaylistId);
    });
    document.getElementById('playlist-sort-select')?.addEventListener('change', (e) => {
      state.playlistSort = e.target.value || 'default';
      if (state.activePlaylistId) openPlaylistView(state.activePlaylistId);
    });

    // Create & Rename Playlist Modals + Backdrop Click Dismissal
    const createPlBtn = document.getElementById('btn-create-playlist');
    const createModal = document.getElementById('modal-create-playlist');
    const cancelPlBtn = document.getElementById('btn-cancel-create-playlist');
    const confirmPlBtn = document.getElementById('btn-confirm-create-playlist');
    const plInput = document.getElementById('input-new-playlist-name');

    if (createPlBtn && createModal) {
      createPlBtn.addEventListener('click', () => {
        createModal.style.display = 'flex';
        if (plInput) { plInput.value = ''; plInput.focus(); }
      });
    }
    if (cancelPlBtn && createModal) {
      cancelPlBtn.addEventListener('click', () => { createModal.style.display = 'none'; });
    }
    if (confirmPlBtn && createModal && plInput) {
      confirmPlBtn.addEventListener('click', () => {
        createNewPlaylist(plInput.value);
        createModal.style.display = 'none';
      });
      plInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          createNewPlaylist(plInput.value);
          createModal.style.display = 'none';
        }
      });
    }

    const renameModal = document.getElementById('modal-rename-playlist');
    const renameInput = document.getElementById('input-rename-playlist-name');
    const confirmRename = () => {
      const val = (renameInput?.value || '').trim();
      const pl = state.playlists.find(p => p.id === state.activePlaylistId);
      if (val && pl) {
        pl.name = val;
        localStorage.setItem('zm_playlists', JSON.stringify(state.playlists));
        renderPlaylistsSidebar();
        renderBentoHome();
        openPlaylistView(pl.id);
        showToast(`Renamed to "${val}"`);
        triggerAutoSync();
      }
      if (renameModal) renameModal.style.display = 'none';
    };
    document.getElementById('btn-cancel-rename-playlist')?.addEventListener('click', () => {
      if (renameModal) renameModal.style.display = 'none';
    });
    document.getElementById('btn-confirm-rename-playlist')?.addEventListener('click', confirmRename);
    renameInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmRename(); });

    // Close Add to Playlist Modal
    document.getElementById('btn-close-add-playlist')?.addEventListener('click', () => {
      document.getElementById('modal-add-to-playlist').style.display = 'none';
    });

    // Backdrop-click dismissal for all standard modals
    ['modal-create-playlist', 'modal-add-to-playlist', 'modal-rename-playlist', 'modal-command-palette', 'modal-shortcuts', 'modal-lyric-card', 'modal-stats-card'].forEach(id => {
      const m = document.getElementById(id);
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) m.style.display = 'none';
        });
      }
    });

    // Drawers (Lyrics & Queue) with synced .active button states & wide-screen docked mode
    document.getElementById('btn-lyrics-toggle')?.addEventListener('click', () => {
      state.isLyricsOpen = !state.isLyricsOpen;
      if (state.isLyricsOpen) state.isQueueOpen = false;
      syncDrawerStates();
      if (state.isLyricsOpen) {
        state.activeLyricIndex = -1;
        state.lyricsUserScrolled = false;
        applyLyricsTimeScaling();
        if (state.currentTrack) syncLyricsWithTime(state.currentTime);
      }
    });

    document.getElementById('btn-close-lyrics')?.addEventListener('click', () => {
      state.isLyricsOpen = false;
      state.activeLyricIndex = -1;
      syncDrawerStates();
    });

    document.getElementById('btn-queue-toggle')?.addEventListener('click', () => {
      state.isQueueOpen = !state.isQueueOpen;
      if (state.isQueueOpen) state.isLyricsOpen = false;
      syncDrawerStates();
      if (state.isQueueOpen) renderQueue();
    });

    document.getElementById('btn-close-queue')?.addEventListener('click', () => {
      state.isQueueOpen = false;
      syncDrawerStates();
    });

    // Queue Header Actions (Clear Up Next + Save as Playlist)
    document.getElementById('btn-queue-clear')?.addEventListener('click', () => {
      if (state.currentTrack) {
        state.queue = [state.currentTrack];
        state.queueIndex = 0;
      } else {
        state.queue = [];
        state.queueIndex = -1;
      }
      renderQueue();
      showToast('Cleared upcoming queue');
    });

    document.getElementById('btn-queue-save-pl')?.addEventListener('click', () => {
      if (state.queue.length === 0) {
        showToast('Queue is empty');
        return;
      }
      const plName = `Queue · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      const newPl = {
        id: 'pl_' + Date.now(),
        name: plName,
        tracks: [...state.queue],
        createdAt: Date.now()
      };
      state.playlists.push(newPl);
      localStorage.setItem('zm_playlists', JSON.stringify(state.playlists));
      renderPlaylistsSidebar();
      renderBentoHome();
      showToast(`Saved ${state.queue.length} songs to "${plName}"`);
      triggerAutoSync();
    });

    // Full Desktop Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (!isUserAuthenticated()) return;

      // Cmd/Ctrl+K works even from inputs
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      if (e.key === 'Escape') {
        handleEscapeKey();
        return;
      }

      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.shiftKey ? playNext() : seekTo(state.currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        e.shiftKey ? playPrev() : seekTo(Math.max(0, state.currentTime - 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(state.volume + 5);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(state.volume - 5);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 's' || e.key === 'S') {
        toggleShuffleMode();
      } else if (e.key === 'r' || e.key === 'R') {
        cycleRepeatMode();
      } else if (e.key === 'n' || e.key === 'N') {
        playNext();
      } else if (e.key === 'p' || e.key === 'P') {
        playPrev();
      } else if (e.key === 'l' || e.key === 'L') {
        document.getElementById('btn-lyrics-toggle')?.click();
      } else if (e.key === 'q' || e.key === 'Q') {
        document.getElementById('btn-queue-toggle')?.click();
      } else if (e.key === 'f' || e.key === 'F') {
        state.isTheaterOpen ? closeTheaterMode() : openTheaterMode();
      } else if (e.key === '/') {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === '?') {
        e.preventDefault();
        const modal = document.getElementById('modal-shortcuts');
        if (modal) modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
      }
    });
  }

  // ── Helpers ──
  let toastTimeout = null;
  function showToast(msg) {
    let toast = document.getElementById('zm-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'zm-toast';
      toast.className = 'zm-toast-message';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Bootstrap Initial Data & Feeds ──
  function initHomeFeeds() {
    renderBentoHome();
    renderRecentlyPlayed();
    renderPlaylistsSidebar();
    initSpotlightCarousel();

    // 1. Your Mix
    const yourMixContainer = document.getElementById('your-mix-grid');
    if (yourMixContainer) renderTrackGrid(yourMixContainer, SEED_YOUR_MIX);

    // 2. Quick Picks
    const quickPicksContainer = document.getElementById('quick-picks-grid');
    if (quickPicksContainer) renderTrackGrid(quickPicksContainer, SEED_QUICK_PICKS);

    // 3. New Releases
    const releasesContainer = document.getElementById('new-releases-grid');
    if (releasesContainer) renderTrackGrid(releasesContainer, SEED_NEW_RELEASES);

    // 4. Load Live Top 100 Chart
    loadTop100Chart('global');

    // 5. Update "Because you listened to..."
    updateBecauseYouListened();

    // 6. Initialize Horizontal Carousel Arrows & Expand Toggles
    initShelfCarousels();
  }

  // ══════════════════════════════════════════════════════════════════════
  // GOOGLE CLOUD SYNC & CROSS-DEVICE ACCOUNT SYSTEM (Phone ↔ PC)
  // ══════════════════════════════════════════════════════════════════════

  const GOOGLE_SCOPES = _EP.SCOPES;
  const DRIVE_BACKUP_FILE = 'zeromusic-backup.json';
  let googleTokenClient = null;
  let autoSyncDebounceTimer = null;
  let isDriveSyncing = false;

  const DEFAULT_GOOGLE_CLIENT_ID = _EP.CLIENT_ID;

  function getGoogleClientId() {
    return localStorage.getItem('zm_google_client_id') ||
           window.ZERO_MUSIC_CLIENT_ID ||
           DEFAULT_GOOGLE_CLIENT_ID;
  }

  function setGoogleClientId(id) {
    if (id) {
      localStorage.setItem('zm_google_client_id', id.trim());
    } else {
      localStorage.removeItem('zm_google_client_id');
    }
    googleTokenClient = null;
  }

  function getGoogleUser() {
    try {
      return JSON.parse(localStorage.getItem('zm_google_user') || 'null');
    } catch (_) {
      return null;
    }
  }

  function isUserAuthenticated() {
    const user = getGoogleUser();
    return !!(user && user.email && user.email.includes('@'));
  }

  function updateAuthGate() {
    const gate = document.getElementById('zm-auth-gate');
    const isAuth = isUserAuthenticated();
    if (!gate) return isAuth;

    if (!isAuth) {
      gate.style.display = 'flex';
      if (state.isPlaying && ytReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
        try { ytPlayer.pauseVideo(); } catch (_) {}
      }
    } else {
      gate.style.display = 'none';
      if (typeof renderBentoHome === 'function') renderBentoHome();
      if (typeof consumePendingDeepLink === 'function') consumePendingDeepLink();
    }
    return isAuth;
  }

  function getGoogleToken() {
    return localStorage.getItem('zm_google_token') || null;
  }

  function isTokenExpired() {
    const exp = parseInt(localStorage.getItem('zm_google_token_exp') || '0', 10);
    return !exp || Date.now() >= exp - 60000;
  }

  function ensureGoogleToken(interactive = false) {
    return new Promise((resolve) => {
      const token = getGoogleToken();
      if (token && !isTokenExpired()) {
        resolve(token);
        return;
      }

      // CRITICAL: NEVER open an OAuth prompt automatically on page load or background sync
      if (!interactive) {
        resolve(token || null);
        return;
      }

      const clientId = getGoogleClientId();
      if (!clientId || !window.google?.accounts?.oauth2) {
        resolve(token || null);
        return;
      }

      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_SCOPES,
          callback: async (resp) => {
            if (resp && resp.access_token) {
              const expiresIn = Number(resp.expires_in) || 3500;
              localStorage.setItem('zm_google_token', resp.access_token);
              localStorage.setItem('zm_google_token_exp', (Date.now() + expiresIn * 1000).toString());
              updateSyncStatusBadge('online');
              resolve(resp.access_token);
            } else {
              resolve(token || null);
            }
          },
          error_callback: () => {
            resolve(token || null);
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (_) {
        resolve(token || null);
      }
    });
  }

  // Conversion: Web Track -> Android Track
  function toAndroidTrack(t) {
    if (!t || !t.id) return null;
    let durationMs = 0;
    if (t.durationMs) {
      durationMs = Number(t.durationMs) || 0;
    } else if (typeof t.duration === 'string' && t.duration.includes(':')) {
      const parts = t.duration.split(':').map(Number);
      if (parts.length === 2) durationMs = (parts[0] * 60 + parts[1]) * 1000;
      else if (parts.length === 3) durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    } else if (typeof t.duration === 'number') {
      durationMs = Math.round(t.duration > 1000 ? t.duration : t.duration * 1000);
    }
    return {
      id: String(t.id),
      title: t.title || 'Unknown Title',
      artist: t.artist || 'Unknown Artist',
      durationMs: durationMs,
      artworkUrl: t.thumbnail || t.artworkUrl || `${_EP.YTIMG}${t.id}/hqdefault.jpg`,
      album: t.album || null
    };
  }

  // Conversion: Android Track -> Web Track
  function fromAndroidTrack(t) {
    if (!t || !t.id) return null;
    const durSec = Math.round((t.durationMs || 0) / 1000);
    const m = Math.floor(durSec / 60);
    const s = durSec % 60;
    const durationStr = durSec > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : '3:30';
    return {
      id: String(t.id),
      title: t.title || 'Unknown Title',
      artist: t.artist || 'Unknown Artist',
      duration: durationStr,
      durationMs: t.durationMs || 0,
      thumbnail: t.artworkUrl || t.thumbnail || `${_EP.YTIMG}${t.id}/hqdefault.jpg`,
      artworkUrl: t.artworkUrl || t.thumbnail || `${_EP.YTIMG}${t.id}/hqdefault.jpg`,
      album: t.album || null
    };
  }

  // Build complete backup snapshot matching Android CloudBackup
  function buildCloudBackupSnapshot() {
    return {
      savedAt: Date.now(),
      liked: state.likedTracks.map(toAndroidTrack).filter(Boolean),
      playlists: state.playlists.map(p => ({
        id: p.id,
        name: p.name,
        source: 'mine',
        url: p.url || `playlist:${p.id}`,
        imageUrl: p.imageUrl || (p.tracks[0]?.thumbnail || null),
        tracks: (p.tracks || []).map(toAndroidTrack).filter(Boolean),
        addedAt: p.createdAt || Date.now()
      })),
      history: state.history.slice(0, 50).map(t => ({
        track: toAndroidTrack(t),
        lastPlayedAt: t.playedAt || Date.now(),
        plays: state.playCounts[t.id] || 1,
        seed: false
      })).filter(h => h.track),
      mix: null,
      spotifyMatches: { ...spotifyMatches },
      autoplay: true,
      offlineBackup: false,
      offlineBackupSize: 500,
      offlineBackupWifiOnly: true,
      taste: null
    };
  }

  // Merge remote backup (from Phone/Google Drive) into local web player state
  function mergeCloudBackup(remote) {
    if (!remote) return false;
    let modified = false;

    // 0. Spotify matches merge
    if (remote.spotifyMatches && typeof remote.spotifyMatches === 'object') {
      let matchesChanged = false;
      for (const [k, v] of Object.entries(remote.spotifyMatches)) {
        if (k && v && !spotifyMatches[k]) {
          spotifyMatches[k] = v;
          matchesChanged = true;
        }
      }
      if (matchesChanged) saveSpotifyMatches();
    }

    // 1. Liked songs merge
    if (Array.isArray(remote.liked) && remote.liked.length > 0) {
      const existingLiked = new Set(state.likedTracks.map(t => t.id));
      const incoming = [];
      remote.liked.forEach(rt => {
        const t = fromAndroidTrack(rt);
        if (t && !existingLiked.has(t.id)) {
          incoming.push(t);
          existingLiked.add(t.id);
        }
      });
      if (incoming.length > 0) {
        state.likedTracks = [...incoming, ...state.likedTracks];
        localStorage.setItem('zm_liked', JSON.stringify(state.likedTracks));
        modified = true;
      }
    }

    // 2. Playlists merge
    if (Array.isArray(remote.playlists) && remote.playlists.length > 0) {
      remote.playlists.forEach(rp => {
        if (!rp) return;
        const targetUrl = rp.url || `playlist:${rp.id}`;
        const existing = state.playlists.find(p => (p.url && p.url === targetUrl) || p.id === rp.id);

        if (existing) {
          const existingIds = new Set(existing.tracks.map(t => t.id));
          let plChanged = false;
          (rp.tracks || []).forEach(rt => {
            const t = fromAndroidTrack(rt);
            if (t && !existingIds.has(t.id)) {
              existing.tracks.push(t);
              existingIds.add(t.id);
              plChanged = true;
            }
          });
          if (plChanged) modified = true;
        } else {
          state.playlists.push({
            id: rp.id || 'pl_' + Date.now(),
            name: rp.name || 'Playlist',
            url: rp.url || `playlist:${rp.id}`,
            imageUrl: rp.imageUrl || null,
            tracks: (rp.tracks || []).map(fromAndroidTrack).filter(Boolean),
            createdAt: rp.addedAt || Date.now()
          });
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem('zm_playlists', JSON.stringify(state.playlists));
      }
    }

    // 3. Listening history & counts merge
    if (Array.isArray(remote.history) && remote.history.length > 0) {
      const histMap = new Map(state.history.map(t => [t.id, t]));
      let histChanged = false;
      remote.history.forEach(rec => {
        if (rec && rec.track && rec.track.id) {
          const trackId = rec.track.id;
          state.playCounts[trackId] = Math.max(state.playCounts[trackId] || 0, rec.plays || 1);
          if (!histMap.has(trackId)) {
            const t = fromAndroidTrack(rec.track);
            if (t) {
              t.playedAt = rec.lastPlayedAt || Date.now();
              histMap.set(trackId, t);
              state.history.push(t);
              histChanged = true;
            }
          }
        }
      });
      if (histChanged) {
        state.history.sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0));
        state.history = state.history.slice(0, 50);
        localStorage.setItem('zm_history', JSON.stringify(state.history));
        localStorage.setItem('zm_play_counts', JSON.stringify(state.playCounts));
        modified = true;
      }
    }

    if (modified) {
      renderPlaylistsSidebar();
      renderRecentlyPlayed();
      renderBentoHome();
      if (state.activePlaylistId === 'liked') openPlaylistView('liked');
      if (state.activeView === 'stats') renderStatsView();
      if (state.currentTrack) updatePlayerUI(state.currentTrack);
    }
    return modified;
  }

  // Record user login to zero-music-db via DevZero backend
  function logUserLoginToDb(user, device = 'web') {
    if (!user || !user.email) return;
    const statsObj = {
      likedCount: state.likedTracks.length,
      likedSongs: state.likedTracks.length,
      playlistsCount: state.playlists.length,
      playlists: state.playlists.length,
      historyCount: state.history.length,
      historyTracks: state.history.length
    };
    fetch(_EP.AUTH_LOG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name || 'Anonymous User',
        avatar: user.avatar || '',
        device: device,
        stats: statsObj
      })
    }).then(r => r.json()).then(res => {
      // logged
    }).catch(err => {
      setTimeout(() => {
        fetch(_EP.AUTH_LOG, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name || 'Anonymous User',
            avatar: user.avatar || '',
            device: device,
            stats: statsObj
          })
        }).catch(() => {});
      }, 3000);
    });
  }

  // Fetch and display all registered users from zero-music-db
  async function fetchAndRenderUsersDirectory() {
    const listEl = document.getElementById('sync-users-dir-list');
    const loadingEl = document.getElementById('sync-users-dir-loading');
    if (!listEl) return;

    if (loadingEl) {
      loadingEl.style.display = 'block';
      loadingEl.textContent = 'Loading registered users from zero-music-db...';
    }

    try {
      const res = await fetch(`${_EP.AUTH_LOG}?users=true`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const users = data.users || [];

      if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.textContent = `Total Registered Listeners: ${users.length}`;
      }

      listEl.innerHTML = users.map(u => {
        const avatarSrc = u.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
        const lastActive = u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Unknown';
        return `
          <div class="sync-user-row">
            <div class="sync-user-left">
              <img src="${avatarSrc}" class="sync-user-avatar" alt="${escapeHtml(u.name || 'User')}" />
              <div class="sync-user-details">
                <span class="sync-user-name">${escapeHtml(u.name || u.email.split('@')[0])}</span>
                <span class="sync-user-email">${escapeHtml(u.email)}</span>
              </div>
            </div>
            <div class="sync-user-badge">
              <div>${escapeHtml(u.device || 'web')} • ${u.loginCount || 1} logins</div>
              <div style="font-size: 9px; opacity: 0.7;">Active ${lastActive}</div>
            </div>
          </div>
        `;
      }).join('');
    } catch (e) {
      if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.textContent = 'Could not load directory: ' + e.message;
      }
    }
  }

  // Google Drive REST APIs for hidden appDataFolder
  async function findDriveBackupFile(token) {
    const q = encodeURIComponent(`name = '${DRIVE_BACKUP_FILE}' and 'appDataFolder' in parents and trashed = false`);
    const res = await fetch(`${_EP.DRIVE_FILES}?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime)`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Drive list error (${res.status})`);
    const data = await res.json();
    return (data.files && data.files.length > 0) ? data.files[0].id : null;
  }

  async function downloadDriveBackup(token, fileId) {
    const res = await fetch(`${_EP.DRIVE_FILES}/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Drive download error (${res.status})`);
    return await res.json();
  }

  async function uploadDriveBackup(token, fileId, backupData) {
    const bodyStr = JSON.stringify(backupData);
    if (fileId) {
      const res = await fetch(`${_EP.DRIVE_UPLOAD}/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });
      if (!res.ok) throw new Error(`Drive upload error (${res.status})`);
      return await res.json();
    } else {
      // Step 1: Create metadata entry in appDataFolder
      const metaRes = await fetch(_EP.DRIVE_FILES, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: DRIVE_BACKUP_FILE,
          parents: ['appDataFolder']
        })
      });
      if (!metaRes.ok) throw new Error(`Drive init error (${metaRes.status})`);
      const meta = await metaRes.json();
      // Step 2: Upload payload
      const uploadRes = await fetch(`${_EP.DRIVE_UPLOAD}/${meta.id}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: bodyStr
      });
      if (!uploadRes.ok) throw new Error(`Drive write error (${uploadRes.status})`);
      return await uploadRes.json();
    }
  }

  // Master Sync Execution
  async function syncWithGoogleDrive(interactive = false) {
    if (isDriveSyncing) return;
    const token = await ensureGoogleToken(interactive);
    if (!token) {
      if (interactive) {
        showToast('Please sign in to Google to sync');
        signInWithGoogle();
      }
      return;
    }

    isDriveSyncing = true;
    updateSyncStatusBadge('syncing');

    try {
      // 1. Locate backup in Drive AppData
      const fileId = await findDriveBackupFile(token);

      // 2. Download and merge if file already exists
      if (fileId) {
        try {
          const remoteBackup = await downloadDriveBackup(token, fileId);
          mergeCloudBackup(remoteBackup);
        } catch (e) {
          console.warn('Could not read existing remote backup, writing local snapshot:', e);
        }
      }

      // 3. Upload merged snapshot back to Drive
      const snapshot = buildCloudBackupSnapshot();
      await uploadDriveBackup(token, fileId, snapshot);

      localStorage.setItem('zm_last_synced_at', Date.now().toString());
      updateSyncStatusBadge('online');

      if (interactive) {
        showToast('Synced with your Android phone ♥');
      }

      const user = getGoogleUser();
      if (user) logUserLoginToDb(user);
    } catch (err) {
      console.error('Drive sync failed:', err);
      updateSyncStatusBadge('error');
      if (interactive) {
        showToast('Sync error: ' + (err.message || 'Please check connection'));
      }
    } finally {
      isDriveSyncing = false;
      renderSyncUI();
    }
  }

  // Debounced auto-sync trigger whenever local library changes
  function triggerAutoSync() {
    if (!getGoogleUser()) return;
    clearTimeout(autoSyncDebounceTimer);
    autoSyncDebounceTimer = setTimeout(() => {
      syncWithGoogleDrive(false);
    }, 2000);
  }

  // Update Status Dots & Badges
  function updateSyncStatusBadge(status) {
    const dot = document.querySelector('#user-sync-status .sync-status-dot');
    const badge = document.getElementById('sync-modal-status-badge');
    const syncText = document.getElementById('btn-modal-sync-text');

    if (dot) {
      dot.className = 'sync-status-dot ' + (status === 'syncing' ? 'syncing' : (status === 'online' ? 'online' : ''));
    }
    if (badge) {
      if (status === 'syncing') {
        badge.className = 'sync-badge';
        badge.textContent = 'Syncing...';
      } else if (status === 'online') {
        badge.className = 'sync-badge active';
        badge.textContent = 'Phone Synced';
      } else if (status === 'error') {
        badge.className = 'sync-badge';
        badge.style.color = '#ef4444';
        badge.textContent = 'Sync Error';
      } else {
        badge.className = 'sync-badge';
        badge.textContent = 'Disconnected';
      }
    }
    if (syncText) {
      syncText.textContent = status === 'syncing' ? 'Syncing...' : 'Sync Now';
    }
  }

  // Render Auth UI (Header pill and Modal stats)
  function renderSyncUI() {
    const user = getGoogleUser();
    const isSignedIn = !!user;

    const btnAuth = document.getElementById('btn-google-auth');
    const badgeProfile = document.getElementById('user-profile-badge');
    const avatarImg = document.getElementById('user-avatar-img');
    const nameEl = document.getElementById('user-display-name');

    if (isSignedIn) {
      if (btnAuth) btnAuth.style.display = 'none';
      if (badgeProfile) badgeProfile.style.display = 'flex';
      if (avatarImg) {
        avatarImg.src = user.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23aaa'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
      }
      if (nameEl) nameEl.textContent = user.name || user.email.split('@')[0];
    } else {
      if (btnAuth) btnAuth.style.display = 'flex';
      if (badgeProfile) badgeProfile.style.display = 'none';
    }

    // Modal elements
    const modalAvatar = document.getElementById('sync-modal-avatar');
    const modalName = document.getElementById('sync-modal-name');
    const modalEmail = document.getElementById('sync-modal-email');
    const modalTime = document.getElementById('sync-modal-time');
    const btnSignOut = document.getElementById('btn-modal-sign-out');

    if (modalAvatar) {
      modalAvatar.src = (user && user.avatar) ? user.avatar : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    }
    if (modalName) modalName.textContent = user ? (user.name || 'Google User') : 'Not Signed In';
    if (modalEmail) modalEmail.textContent = user ? user.email : 'Sign in with Google to enable cross-device sync';

    const lastSync = parseInt(localStorage.getItem('zm_last_synced_at') || '0', 10);
    if (modalTime) {
      if (lastSync > 0) {
        const d = new Date(lastSync);
        modalTime.textContent = 'Last: ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        modalTime.textContent = 'Never synced';
      }
    }

    if (btnSignOut) {
      btnSignOut.style.display = isSignedIn ? 'block' : 'none';
    }

    // Stats
    const statLiked = document.getElementById('sync-stat-liked');
    const statPlaylists = document.getElementById('sync-stat-playlists');
    const statHistory = document.getElementById('sync-stat-history');
    if (statLiked) statLiked.textContent = state.likedTracks.length;
    if (statPlaylists) statPlaylists.textContent = state.playlists.length;
    if (statHistory) statHistory.textContent = state.history.length;

    // Client ID input
    const inputClientId = document.getElementById('input-custom-client-id');
    if (inputClientId && !inputClientId.value) {
      inputClientId.value = getGoogleClientId();
    }
  }

  // Google OAuth Flow
  function signInWithGoogle(device = 'web') {
    const clientId = getGoogleClientId();
    if (!clientId) {
      openSyncModal();
      const drawer = document.getElementById('sync-client-id-drawer');
      if (drawer) drawer.style.display = 'block';
      const input = document.getElementById('input-custom-client-id');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Please enter your Google Cloud Web Client ID');
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      showToast('Google Services initializing, please try again in a moment...');
      return;
    }

    try {
      googleTokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
        callback: async (resp) => {
          if (resp.error) {
            console.error('Google Sign-in error:', resp);
            showToast('Google Sign-In: ' + (resp.error_description || resp.error));
            return;
          }
          if (resp.access_token) {
            const expiresIn = Number(resp.expires_in) || 3500;
            localStorage.setItem('zm_google_token', resp.access_token);
            localStorage.setItem('zm_google_token_exp', (Date.now() + expiresIn * 1000).toString());

            // Fetch user profile info
            let userObj = null;
            try {
              const profileRes = await fetch(_EP.USERINFO, {
                headers: { Authorization: `Bearer ${resp.access_token}` }
              });
              if (profileRes.ok) {
                const p = await profileRes.json();
                userObj = {
                  email: p.email,
                  name: p.name || p.email.split('@')[0],
                  avatar: p.picture || ''
                };
              }
            } catch (pe) {
              console.warn('Profile fetch note:', pe);
            }

            if (!userObj || !userObj.email) {
              userObj = {
                email: 'listener@zeromusic.app',
                name: 'ZeroMusic Listener',
                avatar: ''
              };
            }

            localStorage.setItem('zm_google_user', JSON.stringify(userObj));
            logUserLoginToDb(userObj, device);

            updateAuthGate();
            renderSyncUI();
            renderMobileAuthUI();
            showToast('Signed in as ' + (userObj.name || 'Google User'));
            await syncWithGoogleDrive(true);
          }
        }
      });

      googleTokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (e) {
      console.error('Failed to initiate Google Sign-in:', e);
      showToast('OAuth Error: ' + e.message);
    }
  }

  function signOutGoogle() {
    const token = localStorage.getItem('zm_google_token');
    if (token && window.google?.accounts?.oauth2?.revoke) {
      try { google.accounts.oauth2.revoke(token, () => {}); } catch (_) {}
    }
    localStorage.removeItem('zm_google_token');
    localStorage.removeItem('zm_google_token_exp');
    localStorage.removeItem('zm_google_user');
    updateSyncStatusBadge('disconnected');
    renderSyncUI();
    renderMobileAuthUI();
    updateAuthGate();
    showToast('Signed out of ZeroMusic');
  }

  function openSyncModal() {
    renderSyncUI();
    const modal = document.getElementById('modal-sync-account');
    if (modal) modal.style.display = 'flex';
  }

  function closeSyncModal() {
    const modal = document.getElementById('modal-sync-account');
    if (modal) modal.style.display = 'none';
  }

  function initGoogleAuth() {
    renderSyncUI();
    updateAuthGate();

    // Event listeners
    document.getElementById('btn-google-auth')?.addEventListener('click', () => signInWithGoogle('web'));
    document.getElementById('btn-gate-google-auth')?.addEventListener('click', () => signInWithGoogle('web'));
    document.getElementById('btn-open-sync-modal')?.addEventListener('click', openSyncModal);
    document.getElementById('btn-quick-sync')?.addEventListener('click', () => syncWithGoogleDrive(true));
    document.getElementById('btn-user-signout')?.addEventListener('click', signOutGoogle);
    document.getElementById('btn-close-sync-modal')?.addEventListener('click', closeSyncModal);
    document.getElementById('btn-modal-sync-now')?.addEventListener('click', () => syncWithGoogleDrive(true));
    document.getElementById('btn-modal-sign-out')?.addEventListener('click', () => {
      signOutGoogle();
      closeSyncModal();
    });

    // Users directory drawer toggle and load
    const btnToggleUsersDir = document.getElementById('btn-toggle-users-dir');
    const usersDrawer = document.getElementById('sync-users-dir-drawer');
    if (btnToggleUsersDir && usersDrawer) {
      btnToggleUsersDir.addEventListener('click', () => {
        const isHidden = usersDrawer.style.display === 'none';
        usersDrawer.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          fetchAndRenderUsersDirectory();
        }
      });
    }

    const backdrop = document.getElementById('modal-sync-account');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeSyncModal();
      });
    }

    // Client ID drawer toggle and save
    const btnToggleDrawer = document.getElementById('btn-toggle-client-id');
    const drawer = document.getElementById('sync-client-id-drawer');
    const btnSaveClientId = document.getElementById('btn-save-client-id');
    const inputClientId = document.getElementById('input-custom-client-id');

    if (btnToggleDrawer && drawer) {
      btnToggleDrawer.addEventListener('click', () => {
        drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (btnSaveClientId && inputClientId) {
      btnSaveClientId.addEventListener('click', () => {
        const val = inputClientId.value.trim();
        if (val) {
          setGoogleClientId(val);
          showToast('Saved Google Client ID');
          if (drawer) drawer.style.display = 'none';
          if (!getGoogleToken()) {
            signInWithGoogle();
          }
        } else {
          showToast('Please enter a valid Client ID');
        }
      });
    }

    // Keep user logged in permanently on startup & record visit session in zero-music-db
    const existingUser = getGoogleUser();
    if (existingUser && existingUser.email) {
      updateSyncStatusBadge('online');
      logUserLoginToDb(existingUser, 'web');
      const token = getGoogleToken();
      if (token && !isTokenExpired()) {
        syncWithGoogleDrive(false);
      }
    }
  }

  // ── Mobile Device Auth & Telemetry ──
  function renderMobileAuthUI() {
    const user = getGoogleUser();
    const btn = document.getElementById('btn-mobile-google-auth');
    const badge = document.getElementById('mobile-user-profile-badge');
    const avatar = document.getElementById('mobile-user-avatar-img');
    const name = document.getElementById('mobile-user-display-name');

    if (user && user.email) {
      if (btn) btn.style.display = 'none';
      if (badge) badge.style.display = 'inline-flex';
      if (avatar) avatar.src = user.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23aaa'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
      if (name) name.textContent = user.name || user.email.split('@')[0];
    } else {
      if (btn) btn.style.display = 'inline-flex';
      if (badge) badge.style.display = 'none';
    }
  }

  function initMobileAuth() {
    renderMobileAuthUI();
    document.getElementById('btn-mobile-google-auth')?.addEventListener('click', () => {
      signInWithGoogle('mobile');
    });

    const mobileUser = getGoogleUser();
    if (mobileUser && mobileUser.email) {
      logUserLoginToDb(mobileUser, 'mobile');
    }

    // Download APK click tracking & mandatory login enforcement
    document.querySelectorAll('.btn-mobile-download').forEach(el => {
      el.addEventListener('click', (e) => {
        const user = getGoogleUser();
        if (!user || !user.email) {
          e.preventDefault();
          showToast('Please sign in with Google to download ZeroMusic');
          signInWithGoogle('mobile');
          return;
        }
        logUserLoginToDb(user, 'mobile-apk-download');
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // ZEROMUSIC WEB v3.1 — FULL UI/UX UPGRADE SUITE
  // ══════════════════════════════════════════════════════════════════════

  // ── 1. Global Heart Sync & Live Equalizer Indicators ──
  function syncHeartButtonsUI(trackId, animate = false) {
    if (!trackId) return;
    const liked = isTrackLiked(trackId);
    const applyToBtn = (btn) => {
      if (!btn) return;
      btn.classList.toggle('liked', liked);
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', liked ? 'var(--zm-accent)' : 'none');
        svg.setAttribute('stroke', liked ? 'var(--zm-accent)' : 'currentColor');
      }
      if (animate) {
        btn.classList.remove('heart-pop');
        void btn.offsetWidth;
        btn.classList.add('heart-pop');
      }
    };

    if (state.currentTrack && state.currentTrack.id === trackId) {
      applyToBtn(document.getElementById('btn-like-current'));
      applyToBtn(document.getElementById('theater-like'));
    }
    const spotTrack = state.spotlightTracks[state.spotlightIndex];
    if (spotTrack && spotTrack.id === trackId) {
      applyToBtn(document.getElementById('btn-spotlight-like'));
    }
    document.querySelectorAll(`.card-hover-like[data-track-id="${trackId}"], .row-btn-like[data-track-id="${trackId}"]`).forEach(applyToBtn);
  }

  function syncPlayingIndicators() {
    const curId = state.currentTrack?.id || null;
    const playing = !!state.isPlaying;

    document.querySelectorAll('.track-card').forEach(card => {
      const isCur = curId && card.dataset.id === curId;
      card.classList.toggle('now-playing-card', !!isCur);
      const box = card.querySelector('.card-art-box');
      if (box) {
        let eq = box.querySelector('.card-eq-badge');
        if (isCur) {
          if (!eq) {
            eq = document.createElement('div');
            eq.className = 'card-eq-badge';
            eq.innerHTML = `<span class="eq-bars"><i></i><i></i><i></i></span>`;
            box.appendChild(eq);
          }
          eq.querySelector('.eq-bars')?.classList.toggle('paused', !playing);
        } else if (eq) {
          eq.remove();
        }
      }
      const playBtn = card.querySelector('.card-hover-play');
      if (playBtn) {
        playBtn.innerHTML = (isCur && playing)
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>`;
      }
    });

    document.querySelectorAll('.track-row-item').forEach(row => {
      const isCur = curId && row.dataset.id === curId;
      row.classList.toggle('active-row', !!isCur);
      const idxSpan = row.querySelector('.row-index');
      if (idxSpan) {
        if (isCur) {
          idxSpan.innerHTML = `<span class="eq-bars ${playing ? '' : 'paused'}"><i></i><i></i><i></i></span>`;
        } else if (row.dataset.rank) {
          idxSpan.textContent = row.dataset.rank;
        }
      }
    });

    document.querySelectorAll('.queue-item-card .eq-bars').forEach(eq => {
      eq.classList.toggle('paused', !playing);
    });
  }

  // ── 2. Shuffle, Repeat-1 Badge & Drawer Active/Docked States ──
  function updateShuffleButtonUI() {
    document.getElementById('btn-shuffle')?.classList.toggle('active', state.isShuffle);
    document.getElementById('theater-shuffle')?.classList.toggle('active', state.isShuffle);
  }

  function toggleShuffleMode() {
    state.isShuffle = !state.isShuffle;
    localStorage.setItem('zm_shuffle', state.isShuffle);
    updateShuffleButtonUI();
    showToast(state.isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF');
  }

  function updateRepeatButtonUI() {
    const labels = ['Repeat OFF (R)', 'Repeat ALL (R)', 'Repeat ONE (R)'];
    ['btn-repeat', 'theater-repeat'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.toggle('active', state.repeatMode > 0);
      btn.title = labels[state.repeatMode] || 'Repeat (R)';
      btn.setAttribute('aria-label', labels[state.repeatMode] || 'Repeat');
      let badge = btn.querySelector('.repeat-one-badge');
      if (state.repeatMode === 2) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'repeat-one-badge';
          badge.textContent = '1';
          btn.appendChild(badge);
        }
      } else if (badge) {
        badge.remove();
      }
    });
  }

  function cycleRepeatMode() {
    state.repeatMode = (state.repeatMode + 1) % 3;
    localStorage.setItem('zm_repeat', state.repeatMode);
    updateRepeatButtonUI();
    const modeNames = ['Repeat OFF', 'Repeat ALL', 'Repeat ONE'];
    showToast(modeNames[state.repeatMode]);
  }

  function syncDrawerStates() {
    const lyricsDrawer = document.getElementById('lyrics-drawer');
    const queueDrawer = document.getElementById('queue-drawer');
    lyricsDrawer?.classList.toggle('open', state.isLyricsOpen);
    queueDrawer?.classList.toggle('open', state.isQueueOpen);
    document.getElementById('btn-lyrics-toggle')?.classList.toggle('active', state.isLyricsOpen);
    document.getElementById('btn-queue-toggle')?.classList.toggle('active', state.isQueueOpen);
    document.body.classList.toggle('drawer-open-lyrics', state.isLyricsOpen);
    document.body.classList.toggle('drawer-open-queue', state.isQueueOpen);
  }

  // ── 3. Ambient Artwork Glow & Dynamic Theme Appearance ──
  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    if (h.length !== 6) return `rgba(249, 115, 22, ${alpha})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function setCssAccentHex(hex) {
    const root = document.documentElement;
    root.style.setProperty('--zm-accent', hex);
    root.style.setProperty('--zm-accent-soft', hexToRgba(hex, 0.16));
    root.style.setProperty('--zm-accent-glow', hexToRgba(hex, 0.36));
  }

  function sampleDynamicAccentFromCover(url) {
    if (!url || state.accentMode !== 'dynamic') return;
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = 24;
          c.height = 24;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, 24, 24);
          const data = ctx.getImageData(0, 0, 24, 24).data;
          let best = { score: -1, r: 249, g: 115, b: 22 };
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            const lum = (r + g + b) / 3;
            if (lum > 55 && lum < 225) {
              const score = sat * (1 - Math.abs(lum - 140) / 140);
              if (score > best.score) best = { score, r, g, b };
            }
          }
          const hex = '#' + [best.r, best.g, best.b].map(v => Math.min(255, Math.max(40, v)).toString(16).padStart(2, '0')).join('');
          setCssAccentHex(hex);
        } catch (_) {
          setCssAccentHex('#f97316');
        }
      };
      img.onerror = () => setCssAccentHex('#f97316');
      img.src = url;
    } catch (_) {
      setCssAccentHex('#f97316');
    }
  }

  function updateAmbientArtwork(url) {
    if (!url) return;
    const cssUrl = `url("${url}")`;
    document.documentElement.style.setProperty('--zm-cover-url', cssUrl);
    const lyrBg = document.getElementById('lyrics-ambient-bg');
    if (lyrBg) lyrBg.style.backgroundImage = cssUrl;
    ['theater-bg-1', 'theater-bg-2', 'theater-bg-3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.backgroundImage = cssUrl;
    });
    if (state.accentMode === 'dynamic') sampleDynamicAccentFromCover(url);
  }

  function applyAppearance(accent, surface) {
    state.accentMode = accent || '#f97316';
    state.surfaceMode = surface || 'midnight';
    localStorage.setItem('zm_accent', state.accentMode);
    localStorage.setItem('zm_surface', state.surfaceMode);

    document.body.dataset.surface = state.surfaceMode;
    if (state.accentMode === 'dynamic') {
      if (state.currentTrack?.thumbnail) sampleDynamicAccentFromCover(state.currentTrack.thumbnail);
      else setCssAccentHex('#f97316');
    } else {
      setCssAccentHex(state.accentMode);
    }

    document.querySelectorAll('.accent-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.accent === state.accentMode);
    });
    document.querySelectorAll('.surface-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.surface === state.surfaceMode);
    });
  }

  function initAppearancePopover() {
    applyAppearance(state.accentMode, state.surfaceMode);
    const btn = document.getElementById('btn-appearance-toggle');
    const pop = document.getElementById('appearance-popover');
    if (!btn || !pop) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = pop.style.display === 'block';
      closeAllPopovers();
      if (!open) {
        const rect = btn.getBoundingClientRect();
        pop.style.top = (rect.bottom + 10) + 'px';
        pop.style.right = Math.max(16, window.innerWidth - rect.right) + 'px';
        pop.style.left = 'auto';
        pop.style.display = 'block';
        btn.classList.add('active');
      }
    });

    pop.querySelectorAll('.accent-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        applyAppearance(sw.dataset.accent, state.surfaceMode);
        showToast(sw.dataset.accent === 'dynamic' ? 'Dynamic Cover Accent enabled' : `Accent: ${sw.title}`);
      });
    });

    pop.querySelectorAll('.surface-pill').forEach(p => {
      p.addEventListener('click', () => {
        applyAppearance(state.accentMode, p.dataset.surface);
        showToast(p.dataset.surface === 'oled' ? 'Pure OLED Black enabled' : 'Midnight Glass enabled');
      });
    });
  }

  // ── 4. Collapsible Sidebar, Mobile Drawer & Mood Scroll Chevrons ──
  function closeMobileSidebar() {
    document.getElementById('player-sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-backdrop')?.classList.remove('visible');
  }

  function initSidebarAndMoodScroll() {
    if (localStorage.getItem('zm_sidebar_collapsed') === '1') {
      document.body.classList.add('sidebar-collapsed');
    }

    document.getElementById('btn-sidebar-collapse')?.addEventListener('click', () => {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('zm_sidebar_collapsed', collapsed ? '1' : '0');
    });

    document.getElementById('btn-mobile-nav-open')?.addEventListener('click', () => {
      document.getElementById('player-sidebar')?.classList.add('mobile-open');
      document.getElementById('sidebar-backdrop')?.classList.add('visible');
    });

    document.getElementById('sidebar-backdrop')?.addEventListener('click', closeMobileSidebar);

    const moodScroll = document.getElementById('mood-chips-scroll');
    const leftBtn = document.getElementById('btn-moods-left');
    const rightBtn = document.getElementById('btn-moods-right');

    if (moodScroll && leftBtn && rightBtn) {
      const updateMoodBtns = () => {
        leftBtn.classList.toggle('hidden', moodScroll.scrollLeft <= 4);
        rightBtn.classList.toggle('hidden', moodScroll.scrollLeft + moodScroll.clientWidth >= moodScroll.scrollWidth - 4);
      };
      leftBtn.addEventListener('click', () => { moodScroll.scrollBy({ left: -260, behavior: 'smooth' }); });
      rightBtn.addEventListener('click', () => { moodScroll.scrollBy({ left: 260, behavior: 'smooth' }); });
      moodScroll.addEventListener('scroll', updateMoodBtns);
      window.addEventListener('resize', updateMoodBtns);
      setTimeout(updateMoodBtns, 150);
    }
  }

  // ── 5. Bento Home Header & Quick-Jump Grid ──
  function renderBentoHome() {
    const titleEl = document.getElementById('home-greeting-title');
    const subEl = document.getElementById('home-greeting-sub');
    const grid = document.getElementById('home-bento-grid');
    const shuffleLikedBtn = document.getElementById('btn-home-shuffle-liked');

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const user = getGoogleUser();
    const firstName = user?.name ? `, ${user.name.split(' ')[0]}` : '';
    if (titleEl) titleEl.textContent = `${greeting}${firstName}`;
    if (subEl) {
      subEl.textContent = state.history.length > 0
        ? `Jump back into your ${state.likedTracks.length} liked songs & recent listens`
        : 'Discover ad-free high-fidelity audio and synced lyrics';
    }
    if (shuffleLikedBtn) {
      shuffleLikedBtn.style.display = state.likedTracks.length > 0 ? 'inline-flex' : 'none';
    }
    if (!grid) return;

    const tiles = [];
    if (state.likedTracks.length > 0) {
      tiles.push({
        type: 'playlist', id: 'liked', title: 'Liked Songs',
        sub: `${state.likedTracks.length} tracks`,
        thumbHtml: renderPlaylistMosaicHtml(state.likedTracks, 'liked'),
        tracks: state.likedTracks
      });
    }
    const mostPlayed = getMostPlayedTracks();
    if (mostPlayed.length > 0) {
      tiles.push({
        type: 'playlist', id: 'most-played', title: 'Most Played',
        sub: `${mostPlayed.length} favourites`,
        thumbHtml: renderPlaylistMosaicHtml(mostPlayed, 'most-played'),
        tracks: mostPlayed
      });
    }
    state.playlists.slice(0, 2).forEach(pl => {
      tiles.push({
        type: 'playlist', id: pl.id, title: pl.name,
        sub: `${pl.tracks.length} songs`,
        thumbHtml: renderPlaylistMosaicHtml(pl.tracks, 'custom'),
        tracks: pl.tracks
      });
    });

    const recentSource = state.history.length > 0 ? state.history : SEED_YOUR_MIX;
    for (const t of recentSource) {
      if (tiles.length >= 6) break;
      if (tiles.some(x => x.type === 'track' && x.track.id === t.id)) continue;
      tiles.push({
        type: 'track', track: t, title: t.title, sub: t.artist,
        thumbHtml: `<img src="${t.thumbnail}" alt="${escapeHtml(t.title)}" loading="lazy" data-track-id="${t.id}">`,
        tracks: recentSource
      });
    }

    grid.innerHTML = tiles.slice(0, 6).map((item, i) => `
      <div class="bento-tile" data-bento-idx="${i}">
        <div class="bento-thumb">${item.thumbHtml}</div>
        <div class="bento-meta">
          <div class="bento-title">${escapeHtml(item.title)}</div>
          <div class="bento-sub">${escapeHtml(item.sub)}</div>
        </div>
        <button class="bento-play-dot" aria-label="Play ${escapeHtml(item.title)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>
        </button>
      </div>
    `).join('');

    grid.querySelectorAll('.bento-tile').forEach(el => {
      const item = tiles[parseInt(el.dataset.bentoIdx, 10)];
      if (!item) return;
      el.addEventListener('click', (e) => {
        if (e.target.closest('.bento-play-dot')) {
          e.stopPropagation();
          if (item.type === 'track') {
            playTrack(item.track, item.tracks, item.tracks.findIndex(x => x.id === item.track.id));
          } else if (item.tracks && item.tracks.length > 0) {
            playTrack(item.tracks[0], item.tracks, 0);
          } else {
            openPlaylistView(item.id);
          }
          return;
        }
        if (item.type === 'playlist') openPlaylistView(item.id);
        else playTrack(item.track, item.tracks, item.tracks.findIndex(x => x.id === item.track.id));
      });
    });
  }

  // ── 6. Rotating Curated Spotlight Carousel (Fixes Play-Wrong-Track Bug) ──
  let spotlightAutoTimer = null;

  function renderSpotlightSlide() {
    const tracks = state.spotlightTracks;
    if (!tracks || tracks.length === 0) return;
    state.spotlightIndex = ((state.spotlightIndex % tracks.length) + tracks.length) % tracks.length;
    const track = tracks[state.spotlightIndex];
    updateSpotlightCard(track);
    const eyebrow = document.getElementById('spotlight-eyebrow');
    if (eyebrow) eyebrow.textContent = `SPOTLIGHT ${state.spotlightIndex + 1} / ${tracks.length}`;
    const dotsWrap = document.getElementById('spotlight-dots');
    if (dotsWrap) {
      dotsWrap.innerHTML = tracks.map((_, i) => `
        <button class="spotlight-dot ${i === state.spotlightIndex ? 'active' : ''}" data-spot-idx="${i}" aria-label="Spotlight ${i + 1}"></button>
      `).join('');
      dotsWrap.querySelectorAll('.spotlight-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          state.spotlightIndex = parseInt(dot.dataset.spotIdx, 10);
          renderSpotlightSlide();
        });
      });
    }
  }

  function refreshSpotlightFromCharts(chartTracks) {
    if (!Array.isArray(chartTracks) || chartTracks.length < 3) return;
    state.spotlightTracks = [...chartTracks.slice(0, 3), ...SEED_NEW_RELEASES.slice(0, 2)];
    state.spotlightIndex = 0;
    renderSpotlightSlide();
  }

  function initSpotlightCarousel() {
    if (state.spotlightTracks.length === 0) {
      state.spotlightTracks = [...SEED_YOUR_MIX.slice(0, 3), ...SEED_NEW_RELEASES.slice(0, 2)];
    }
    renderSpotlightSlide();

    document.getElementById('btn-spotlight-play')?.addEventListener('click', () => {
      const track = state.spotlightTracks[state.spotlightIndex];
      if (track) playTrack(track, state.spotlightTracks, state.spotlightIndex);
    });
    document.getElementById('btn-spotlight-queue')?.addEventListener('click', () => {
      const track = state.spotlightTracks[state.spotlightIndex];
      if (track) playTrackNext(track);
    });
    document.getElementById('btn-spotlight-like')?.addEventListener('click', () => {
      const track = state.spotlightTracks[state.spotlightIndex];
      if (track) toggleLikeTrack(track);
    });
    document.getElementById('btn-spotlight-prev')?.addEventListener('click', () => {
      state.spotlightIndex--;
      renderSpotlightSlide();
    });
    document.getElementById('btn-spotlight-next')?.addEventListener('click', () => {
      state.spotlightIndex++;
      renderSpotlightSlide();
    });

    const board = document.getElementById('editorial-billboard');
    let pausedHover = false;
    board?.addEventListener('mouseenter', () => { pausedHover = true; });
    board?.addEventListener('mouseleave', () => { pausedHover = false; });

    if (spotlightAutoTimer) clearInterval(spotlightAutoTimer);
    spotlightAutoTimer = setInterval(() => {
      if (!pausedHover && state.activeView === 'home' && !state.isTheaterOpen) {
        state.spotlightIndex++;
        renderSpotlightSlide();
      }
    }, 11000);
  }

  // ── 7. Horizontal Shelf Carousels + "See All" Toggle ──
  function updateCarouselArrowsFor(trackGrid) {
    const wrap = trackGrid?.closest('.shelf-carousel-wrap');
    if (!wrap) return;
    const prevBtn = wrap.querySelector('.shelf-scroll-btn.prev');
    const nextBtn = wrap.querySelector('.shelf-scroll-btn.next');
    if (!prevBtn || !nextBtn) return;

    if (trackGrid.classList.contains('expanded')) {
      prevBtn.classList.add('hidden');
      nextBtn.classList.add('hidden');
      return;
    }
    prevBtn.classList.toggle('hidden', trackGrid.scrollLeft <= 6);
    nextBtn.classList.toggle('hidden', trackGrid.scrollLeft + trackGrid.clientWidth >= trackGrid.scrollWidth - 6);
  }

  function initShelfCarousels() {
    document.querySelectorAll('.shelf-carousel-wrap').forEach(wrap => {
      const rail = wrap.querySelector('.tracks-carousel');
      if (!rail) return;
      wrap.querySelectorAll('.shelf-scroll-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const dir = parseInt(btn.dataset.carouselDir, 10) || 1;
          rail.scrollBy({ left: dir * 560, behavior: 'smooth' });
        });
      });
      rail.addEventListener('scroll', () => updateCarouselArrowsFor(rail));
      setTimeout(() => updateCarouselArrowsFor(rail), 180);
    });

    document.querySelectorAll('[data-expand-grid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rail = document.getElementById(btn.dataset.expandGrid);
        if (!rail) return;
        const expanded = rail.classList.toggle('expanded');
        btn.textContent = expanded ? 'Show less' : 'See all';
        updateCarouselArrowsFor(rail);
      });
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.tracks-carousel').forEach(updateCarouselArrowsFor);
    });
  }

  // ── 8. 3-Dot Track Action Popover Menu & Queue Helpers ──
  function playTrackNext(track) {
    if (!track) return;
    if (state.queue.length === 0) {
      state.queue = [track];
      state.queueIndex = 0;
    } else {
      const insertAt = Math.max(0, state.queueIndex + 1);
      state.queue.splice(insertAt, 0, track);
    }
    if (state.isQueueOpen || state.isTheaterOpen) renderQueue();
    showToast(`Playing "${track.title}" next`);
  }

  function addTrackToQueue(track) {
    if (!track) return;
    state.queue.push(track);
    if (state.isQueueOpen || state.isTheaterOpen) renderQueue();
    showToast(`Added "${track.title}" to queue`);
  }

  async function startTrackRadio(track) {
    if (!track) return;
    showToast(`Starting radio for "${track.title}"...`);
    let seedId = getKnownYouTubeId(track);
    if (!seedId && isSpotifyTrackId(track.id)) {
      seedId = await resolveSpotifyTrack(track);
    }
    if (!seedId) {
      showToast('Could not start radio for this track');
      return;
    }
    try {
      const res = await fetch(`${_EP.SEARCH}?radio=${seedId}`);
      const data = await res.json();
      if (data && data.tracks && data.tracks.length > 0) {
        const radioList = [track, ...data.tracks.filter(t => t.id !== track.id)];
        playTrack(radioList[0], radioList, 0);
        showToast(`Queued ${radioList.length} radio tracks`);
        return;
      }
    } catch (_) {}
    showToast('Radio unavailable right now');
  }

  function copyTrackShareLink(track) {
    if (!track) return;
    const ytId = getKnownYouTubeId(track) || track.id;
    const url = `${location.origin}/zero-music/song?v=${encodeURIComponent(ytId)}&title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}&artwork=${encodeURIComponent(track.thumbnail || '')}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast('Share link copied to clipboard!')).catch(() => showToast(url));
    } else {
      showToast(url);
    }
  }

  function closeAllPopovers() {
    const ctx = document.getElementById('track-context-menu');
    const tools = document.getElementById('playback-tools-popover');
    const appPop = document.getElementById('appearance-popover');
    if (ctx) ctx.style.display = 'none';
    if (tools) tools.style.display = 'none';
    if (appPop) appPop.style.display = 'none';
    document.getElementById('btn-tools-toggle')?.classList.remove('active');
    document.getElementById('btn-appearance-toggle')?.classList.remove('active');
  }

  function openTrackContextMenu(track, anchorEl) {
    const menu = document.getElementById('track-context-menu');
    if (!menu || !track) return;
    closeAllPopovers();

    const liked = isTrackLiked(track.id);
    menu.innerHTML = `
      <button class="zm-popover-item" data-act="play-next">▶ &nbsp;Play Next</button>
      <button class="zm-popover-item" data-act="add-queue">＋ &nbsp;Add to Queue</button>
      <button class="zm-popover-item" data-act="radio">◎ &nbsp;Start Track Radio</button>
      <div class="zm-popover-divider"></div>
      <button class="zm-popover-item" data-act="like">${liked ? '♥ &nbsp;Remove from Liked' : '♡ &nbsp;Save to Liked'}</button>
      <button class="zm-popover-item" data-act="playlist">♫ &nbsp;Add to Playlist</button>
      <button class="zm-popover-item" data-act="artist">⌕ &nbsp;Search Artist</button>
      <div class="zm-popover-divider"></div>
      <button class="zm-popover-item" data-act="share">↗ &nbsp;Copy Share Link</button>
    `;

    menu.style.display = 'block';
    const rect = anchorEl.getBoundingClientRect();
    const mw = menu.offsetWidth || 215;
    const mh = menu.offsetHeight || 280;
    const left = Math.min(window.innerWidth - mw - 12, Math.max(12, rect.right - mw));
    const top = (rect.bottom + mh + 12 > window.innerHeight)
      ? Math.max(12, rect.top - mh - 8)
      : rect.bottom + 8;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';

    menu.querySelectorAll('.zm-popover-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        menu.style.display = 'none';
        if (act === 'play-next') playTrackNext(track);
        else if (act === 'add-queue') addTrackToQueue(track);
        else if (act === 'radio') startTrackRadio(track);
        else if (act === 'like') toggleLikeTrack(track);
        else if (act === 'playlist') openAddToPlaylistModal(track);
        else if (act === 'artist') {
          const inp = document.getElementById('zm-search-input');
          if (inp) inp.value = track.artist || '';
          executeSearch(track.artist || track.title);
        } else if (act === 'share') copyTrackShareLink(track);
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.zm-popover-menu') && !e.target.closest('.zm-floating-popover') &&
        !e.target.closest('.card-hover-more') && !e.target.closest('.row-btn-more') &&
        !e.target.closest('#btn-more-current') && !e.target.closest('#btn-tools-toggle') &&
        !e.target.closest('#btn-appearance-toggle')) {
      closeAllPopovers();
    }
  });

  // ── 9. Full-Screen Theater Mode + Harmonic Ambient Visualizer ──
  let vizRafId = null;

  function syncTheaterUI() {
    const track = state.currentTrack;
    if (!track) return;
    const art = document.getElementById('theater-art');
    const title = document.getElementById('theater-title');
    const artist = document.getElementById('theater-artist');
    if (art) art.src = track.thumbnail;
    if (title) title.textContent = track.title;
    if (artist) artist.textContent = track.artist;
    syncHeartButtonsUI(track.id, false);
    updatePlayPauseButton();
    updateShuffleButtonUI();
    updateRepeatButtonUI();
  }

  function startTheaterVisualizer() {
    if (vizRafId) cancelAnimationFrame(vizRafId);
    const canvas = document.getElementById('theater-viz-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bars = 40;
    const heights = new Array(bars).fill(12);

    const draw = (ts) => {
      if (!state.isTheaterOpen || state.theaterTab !== 'visualizer') {
        vizRafId = null;
        return;
      }
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--zm-accent').trim() || '#f97316';
      const barW = (w - 80) / bars;
      const t = ts * 0.003;

      for (let i = 0; i < bars; i++) {
        const norm = i / bars;
        const centerWeight = 1 - Math.abs(norm - 0.5) * 1.45;
        const target = state.isPlaying
          ? (24 + Math.max(0.15, centerWeight) * (95 + 55 * Math.sin(t * 2.1 + i * 0.45) + 38 * Math.cos(t * 3.4 - i * 0.3)))
          : 12 + 4 * Math.sin(t + i * 0.3);
        heights[i] += (target - heights[i]) * 0.16;
        const bh = Math.min(h - 40, Math.max(8, heights[i]));
        const x = 40 + i * barW + barW * 0.2;
        const bw = barW * 0.6;
        const y = (h - bh) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + bh);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, accent);
        grad.addColorStop(1, 'rgba(255,255,255,0.35)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, bw, bh, 4) : ctx.fillRect(x, y, bw, bh);
        ctx.fill();
      }
      vizRafId = requestAnimationFrame(draw);
    };
    vizRafId = requestAnimationFrame(draw);
  }

  function openTheaterMode() {
    if (!isUserAuthenticated()) return;
    if (!state.currentTrack && state.queue.length > 0) {
      playTrack(state.queue[0], state.queue, 0);
    }
    const overlay = document.getElementById('theater-overlay');
    if (!overlay) return;
    state.isTheaterOpen = true;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    syncTheaterUI();
    if (state.currentTrack?.thumbnail) updateAmbientArtwork(state.currentTrack.thumbnail);
    renderQueue();
    state.activeLyricIndex = -1;
    syncLyricsWithTime(state.currentTime);
    if (state.theaterTab === 'visualizer') startTheaterVisualizer();
  }

  function closeTheaterMode() {
    const overlay = document.getElementById('theater-overlay');
    state.isTheaterOpen = false;
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (vizRafId) { cancelAnimationFrame(vizRafId); vizRafId = null; }
  }

  function initTheaterMode() {
    document.getElementById('btn-open-theater-art')?.addEventListener('click', openTheaterMode);
    document.getElementById('player-meta-clickable')?.addEventListener('click', openTheaterMode);
    document.getElementById('btn-theater-toggle')?.addEventListener('click', openTheaterMode);
    document.getElementById('btn-lyrics-expand')?.addEventListener('click', openTheaterMode);
    document.getElementById('btn-close-theater')?.addEventListener('click', closeTheaterMode);
    document.getElementById('btn-theater-pip')?.addEventListener('click', toggleMiniPlayer);

    document.getElementById('theater-play-pause')?.addEventListener('click', togglePlayPause);
    document.getElementById('theater-prev')?.addEventListener('click', playPrev);
    document.getElementById('theater-next')?.addEventListener('click', playNext);
    document.getElementById('theater-like')?.addEventListener('click', () => {
      if (state.currentTrack) toggleLikeTrack(state.currentTrack);
    });
    document.getElementById('theater-add-pl')?.addEventListener('click', () => {
      if (state.currentTrack) openAddToPlaylistModal(state.currentTrack);
    });
    document.getElementById('theater-share')?.addEventListener('click', () => {
      if (state.currentTrack) copyTrackShareLink(state.currentTrack);
    });
    document.getElementById('theater-lyric-card')?.addEventListener('click', () => {
      if (state.lyrics.length === 0) {
        showToast('No synced lyrics loaded for this song yet');
        return;
      }
      const start = Math.max(0, state.activeLyricIndex >= 0 ? state.activeLyricIndex : 0);
      const lines = state.lyrics.slice(start, start + 3).map(l => l.text);
      openLyricCardModal(lines);
    });
    document.getElementById('theater-artist')?.addEventListener('click', () => {
      if (!state.currentTrack?.artist) return;
      closeTheaterMode();
      const inp = document.getElementById('zm-search-input');
      if (inp) inp.value = state.currentTrack.artist;
      executeSearch(state.currentTrack.artist);
    });

    document.querySelectorAll('.theater-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.theaterTab = tab.dataset.theaterTab;
        document.querySelectorAll('.theater-tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.theater-panel').forEach(p => {
          p.classList.toggle('active', p.id === `theater-panel-${state.theaterTab}`);
        });
        if (state.theaterTab === 'queue') renderQueue();
        if (state.theaterTab === 'visualizer') startTheaterVisualizer();
        else if (vizRafId) { cancelAnimationFrame(vizRafId); vizRafId = null; }
      });
    });
  }

  // ── 10. Lyrics Studio (Sync Offset, Font Size, Auto-Scroll Resume & Lyric Card Exporter) ──
  function updateLyricsOffsetUI() {
    const badge = document.getElementById('lyrics-offset-badge');
    if (badge) {
      const sign = state.lyricsOffset > 0 ? '+' : '';
      badge.textContent = `${sign}${state.lyricsOffset.toFixed(1)}s`;
    }
  }

  function applyLyricsFontSize() {
    const body = document.getElementById('lyrics-lines-container');
    const btn = document.getElementById('btn-lyrics-fontsize');
    if (body) {
      body.classList.remove('lyrics-sz-sm', 'lyrics-sz-lg');
      if (state.lyricsFontSize === 'sm') body.classList.add('lyrics-sz-sm');
      if (state.lyricsFontSize === 'lg') body.classList.add('lyrics-sz-lg');
    }
    if (btn) {
      const lbl = state.lyricsFontSize === 'sm' ? 'S' : state.lyricsFontSize === 'lg' ? 'L' : 'M';
      btn.textContent = `Aa · ${lbl}`;
    }
  }

  function toggleLyricSelection(idx, el) {
    if (state.selectedLyricIndices.has(idx)) {
      state.selectedLyricIndices.delete(idx);
      el.classList.remove('selected');
    } else {
      if (state.selectedLyricIndices.size >= 4) {
        showToast('Select up to 4 lines for a Lyric Card');
        return;
      }
      state.selectedLyricIndices.add(idx);
      el.classList.add('selected');
    }
    const countEl = document.getElementById('lyrics-select-count');
    const genBtn = document.getElementById('btn-lyrics-select-generate');
    const sz = state.selectedLyricIndices.size;
    if (countEl) countEl.textContent = sz > 0 ? `${sz} ${sz === 1 ? 'line' : 'lines'} selected` : 'Tap 1–4 lines';
    if (genBtn) genBtn.disabled = sz === 0;
  }

  function exitLyricSelectMode() {
    state.lyricsSelectMode = false;
    state.selectedLyricIndices.clear();
    const body = document.getElementById('lyrics-lines-container');
    const bar = document.getElementById('lyrics-select-bar');
    const btn = document.getElementById('btn-lyrics-card-mode');
    body?.classList.remove('select-mode');
    body?.querySelectorAll('.lyric-line.selected').forEach(el => el.classList.remove('selected'));
    if (bar) bar.style.display = 'none';
    btn?.classList.remove('active');
  }

  let currentLyricCardLines = [];
  let currentLyricCardTheme = 'ambient';

  function drawWrappedCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = words[i];
        curY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, curY);
      curY += lineHeight;
    }
    return curY;
  }

  function renderLyricCardCanvas() {
    const canvas = document.getElementById('lyric-card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const track = state.currentTrack || { title: 'ZeroMusic', artist: 'Ad-Free Audio', thumbnail: '' };
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--zm-accent').trim() || '#f97316';

    const themes = {
      ambient: ['#1f120b', '#0b0b12', accent],
      midnight: ['#0f172a', '#050509', '#6366f1'],
      sunset: ['#431407', '#1a0a18', '#f97316'],
      emerald: ['#022c22', '#060c0f', '#10b981']
    };
    const [c1, c2, glow] = themes[currentLyricCardTheme] || themes.ambient;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ambient orb glows
    const orb1 = ctx.createRadialGradient(W * 0.2, H * 0.18, 20, W * 0.2, H * 0.18, W * 0.55);
    orb1.addColorStop(0, hexToRgba(glow, 0.42));
    orb1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, W, H);

    const orb2 = ctx.createRadialGradient(W * 0.85, H * 0.85, 20, W * 0.85, H * 0.85, W * 0.5);
    orb2.addColorStop(0, 'rgba(255,255,255,0.12)');
    orb2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, W, H);

    const paintTextLayer = (coverImg) => {
      // Glass card inner frame
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(56, 56, W - 112, H - 112, 36) : ctx.rect(56, 56, W - 112, H - 112);
      ctx.fill();
      ctx.stroke();

      // Header metadata
      if (coverImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(102, 102, 108, 108, 20) : ctx.rect(102, 102, 108, 108);
        ctx.clip();
        ctx.drawImage(coverImg, 102, 102, 108, 108);
        ctx.restore();
      } else {
        ctx.fillStyle = hexToRgba(glow, 0.3);
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(102, 102, 108, 108, 20) : ctx.rect(102, 102, 108, 108);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 44px Inter, sans-serif';
        ctx.fillText('♪', 142, 172);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px Inter, sans-serif';
      const titleTrunc = (track.title || '').length > 26 ? track.title.slice(0, 26) + '…' : track.title;
      ctx.fillText(titleTrunc, 234, 150);
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = '500 24px Inter, sans-serif';
      const artistTrunc = (track.artist || '').length > 34 ? track.artist.slice(0, 34) + '…' : track.artist;
      ctx.fillText(artistTrunc, 234, 188);

      // Lyric lines
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 44px Inter, sans-serif';
      let y = 310;
      currentLyricCardLines.slice(0, 4).forEach(line => {
        y = drawWrappedCanvasText(ctx, line, 104, y, W - 208, 58) + 18;
      });

      // Brand watermark footer
      ctx.fillStyle = glow;
      ctx.font = '700 22px "JetBrains Mono", monospace';
      ctx.fillText('✦ ZEROMUSIC', 104, H - 102);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '500 19px "JetBrains Mono", monospace';
      ctx.fillText('zero.skillissue.gg/zero-music', W - 445, H - 102);
    };

    if (track.thumbnail) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => paintTextLayer(img);
      img.onerror = () => paintTextLayer(null);
      img.src = track.thumbnail;
    } else {
      paintTextLayer(null);
    }
  }

  function openLyricCardModal(lines) {
    currentLyricCardLines = (lines && lines.length > 0) ? lines : ['Feel every beat, ad-free.'];
    const modal = document.getElementById('modal-lyric-card');
    if (modal) modal.style.display = 'flex';
    renderLyricCardCanvas();
  }

  function exportCanvasAsPng(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    try {
      const a = document.createElement('a');
      a.download = filename;
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('Saved PNG card!');
    } catch (_) {
      showToast('Could not export card due to image permissions');
    }
  }

  function copyCanvasToClipboard(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
      showToast('Clipboard image copy not supported in this browser');
      return;
    }
    canvas.toBlob(blob => {
      if (!blob) return;
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(() => showToast('Card copied to clipboard!'))
        .catch(() => showToast('Copy blocked — use Download PNG instead'));
    }, 'image/png');
  }

  function initLyricsStudio() {
    applyLyricsFontSize();
    updateLyricsOffsetUI();

    const body = document.getElementById('lyrics-lines-container');
    const resumePill = document.getElementById('btn-lyrics-resume-sync');
    if (body && resumePill) {
      body.addEventListener('scroll', () => {
        if (Date.now() < lyricsProgrammaticScrollUntil) return;
        if (state.isLyricsOpen && state.lyrics.length > 0 && !state.lyricsSelectMode) {
          state.lyricsUserScrolled = true;
          resumePill.style.display = 'block';
        }
      });
      resumePill.addEventListener('click', () => {
        state.lyricsUserScrolled = false;
        resumePill.style.display = 'none';
        state.activeLyricIndex = -1;
        syncLyricsWithTime(state.currentTime);
      });
    }

    document.getElementById('btn-lyrics-offset-minus')?.addEventListener('click', () => {
      state.lyricsOffset = Math.round((state.lyricsOffset - 0.5) * 10) / 10;
      updateLyricsOffsetUI();
      state.activeLyricIndex = -1;
      syncLyricsWithTime(state.currentTime);
    });
    document.getElementById('btn-lyrics-offset-plus')?.addEventListener('click', () => {
      state.lyricsOffset = Math.round((state.lyricsOffset + 0.5) * 10) / 10;
      updateLyricsOffsetUI();
      state.activeLyricIndex = -1;
      syncLyricsWithTime(state.currentTime);
    });

    document.getElementById('btn-lyrics-fontsize')?.addEventListener('click', () => {
      const order = ['sm', 'md', 'lg'];
      const next = order[(order.indexOf(state.lyricsFontSize) + 1) % order.length];
      state.lyricsFontSize = next;
      localStorage.setItem('zm_lyrics_size', next);
      applyLyricsFontSize();
    });

    document.getElementById('btn-lyrics-card-mode')?.addEventListener('click', () => {
      if (state.lyrics.length === 0) {
        showToast('No synced lyrics available for this song');
        return;
      }
      if (state.lyricsSelectMode) {
        exitLyricSelectMode();
        return;
      }
      state.lyricsSelectMode = true;
      state.selectedLyricIndices.clear();
      document.getElementById('lyrics-lines-container')?.classList.add('select-mode');
      document.getElementById('btn-lyrics-card-mode')?.classList.add('active');
      const bar = document.getElementById('lyrics-select-bar');
      if (bar) bar.style.display = 'flex';
      const countEl = document.getElementById('lyrics-select-count');
      if (countEl) countEl.textContent = 'Tap 1–4 lines';
      const genBtn = document.getElementById('btn-lyrics-select-generate');
      if (genBtn) genBtn.disabled = true;
    });

    document.getElementById('btn-lyrics-select-cancel')?.addEventListener('click', exitLyricSelectMode);
    document.getElementById('btn-lyrics-select-generate')?.addEventListener('click', () => {
      const sorted = Array.from(state.selectedLyricIndices).sort((a, b) => a - b);
      const lines = sorted.map(i => state.lyrics[i]?.text).filter(Boolean);
      exitLyricSelectMode();
      openLyricCardModal(lines);
    });

    document.getElementById('btn-close-lyric-card')?.addEventListener('click', () => {
      document.getElementById('modal-lyric-card').style.display = 'none';
    });
    document.querySelectorAll('#lyric-card-themes .studio-theme-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        currentLyricCardTheme = pill.dataset.cardTheme;
        document.querySelectorAll('#lyric-card-themes .studio-theme-pill').forEach(p => p.classList.toggle('active', p === pill));
        renderLyricCardCanvas();
      });
    });
    document.getElementById('btn-download-lyric-card')?.addEventListener('click', () => {
      const slug = (state.currentTrack?.title || 'lyrics').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      exportCanvasAsPng('lyric-card-canvas', `zeromusic-${slug}.png`);
    });
    document.getElementById('btn-copy-lyric-card')?.addEventListener('click', () => {
      copyCanvasToClipboard('lyric-card-canvas');
    });
  }

  // ── 11. Command Palette (⌘K / /) & Shortcuts Cheatsheet (?) ──
  let cmdkItems = [];
  let cmdkFocusIdx = 0;

  function buildCommandPaletteItems(query) {
    const q = (query || '').trim().toLowerCase();
    const groups = [];

    const actions = [
      { label: 'Go to Listen Now', sub: 'Navigation', run: () => switchMainView('home') },
      { label: 'Go to Top 100 Worldwide', sub: 'Charts', run: () => { switchMainView('chart'); loadTop100Chart('global'); } },
      { label: 'Go to Top 100 India', sub: 'Charts', run: () => { switchMainView('chart'); loadTop100Chart('india'); } },
      { label: 'Go to Listening Stats', sub: 'Insights', run: () => switchMainView('stats') },
      { label: 'Toggle Full-Screen Theater Mode', sub: 'Shortcut F', run: () => state.isTheaterOpen ? closeTheaterMode() : openTheaterMode() },
      { label: 'Toggle Synced Lyrics', sub: 'Shortcut L', run: () => document.getElementById('btn-lyrics-toggle')?.click() },
      { label: 'Toggle Up Next Queue', sub: 'Shortcut Q', run: () => document.getElementById('btn-queue-toggle')?.click() },
      { label: 'Pop-Out Mini Player (PiP)', sub: 'Window', run: toggleMiniPlayer },
      { label: 'Toggle Pure OLED Black Theme', sub: 'Appearance', run: () => applyAppearance(state.accentMode, state.surfaceMode === 'oled' ? 'midnight' : 'oled') },
      { label: 'Sync Library with Android Phone', sub: 'Cloud Sync', run: () => syncWithGoogleDrive(true) }
    ];

    const matchedActions = actions.filter(a => !q || a.label.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q));
    if (matchedActions.length) groups.push({ name: 'Commands & Views', items: matchedActions.slice(0, 5) });

    const plItems = [
      { label: 'Liked Songs', sub: `${state.likedTracks.length} tracks`, run: () => openPlaylistView('liked') },
      { label: 'Most Played', sub: `${getMostPlayedTracks().length} tracks`, run: () => openPlaylistView('most-played') },
      ...state.playlists.map(pl => ({ label: pl.name, sub: `${pl.tracks.length} tracks`, run: () => openPlaylistView(pl.id) }))
    ].filter(p => !q || p.label.toLowerCase().includes(q));
    if (plItems.length) groups.push({ name: 'Playlists', items: plItems.slice(0, 5) });

    const libraryPool = [];
    const seen = new Set();
    [...state.history, ...state.likedTracks, ...SEED_YOUR_MIX, ...SEED_QUICK_PICKS].forEach(t => {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id);
        libraryPool.push(t);
      }
    });
    const matchedTracks = libraryPool.filter(t =>
      !q || (t.title || '').toLowerCase().includes(q) || (t.artist || '').toLowerCase().includes(q)
    ).slice(0, 5).map(t => ({
      label: `▶ ${t.title}`,
      sub: t.artist || '',
      run: () => playTrack(t, libraryPool, libraryPool.indexOf(t))
    }));
    if (matchedTracks.length) groups.push({ name: 'Play Track', items: matchedTracks });

    if (q) {
      groups.unshift({
        name: 'Search ZeroMusic',
        items: [{ label: `Search for "${query.trim()}"`, sub: 'Enter ↵', run: () => executeSearch(query.trim()) }]
      });
    }

    return groups;
  }

  function renderCommandPaletteResults(query) {
    const box = document.getElementById('cmdk-results');
    if (!box) return;
    const groups = buildCommandPaletteItems(query);
    cmdkItems = [];
    cmdkFocusIdx = 0;

    let html = '';
    groups.forEach(g => {
      html += `<div class="cmdk-group-label">${escapeHtml(g.name)}</div>`;
      g.items.forEach(item => {
        const idx = cmdkItems.length;
        cmdkItems.push(item);
        html += `
          <button class="cmdk-item ${idx === 0 ? 'focused' : ''}" data-cmdk-idx="${idx}">
            <span>${escapeHtml(item.label)}</span>
            <span class="cmdk-item-sub">${escapeHtml(item.sub)}</span>
          </button>
        `;
      });
    });

    box.innerHTML = html || '<div class="zm-empty" style="padding: 24px 0;">No matching commands</div>';
    box.querySelectorAll('.cmdk-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = cmdkItems[parseInt(btn.dataset.cmdkIdx, 10)];
        document.getElementById('modal-command-palette').style.display = 'none';
        if (item) item.run();
      });
    });
  }

  function openCommandPalette() {
    const modal = document.getElementById('modal-command-palette');
    const input = document.getElementById('cmdk-input');
    if (!modal || !input) return;
    closeAllPopovers();
    modal.style.display = 'flex';
    input.value = '';
    renderCommandPaletteResults('');
    setTimeout(() => input.focus(), 20);
  }

  function initCommandPalette() {
    document.getElementById('btn-open-cmdk')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openCommandPalette();
    });

    const input = document.getElementById('cmdk-input');
    const modal = document.getElementById('modal-command-palette');
    if (!input || !modal) return;

    input.addEventListener('input', () => renderCommandPaletteResults(input.value));
    input.addEventListener('keydown', (e) => {
      const els = Array.from(document.querySelectorAll('#cmdk-results .cmdk-item'));
      if (e.key === 'ArrowDown' && els.length) {
        e.preventDefault();
        cmdkFocusIdx = (cmdkFocusIdx + 1) % els.length;
        els.forEach((el, i) => el.classList.toggle('focused', i === cmdkFocusIdx));
        els[cmdkFocusIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp' && els.length) {
        e.preventDefault();
        cmdkFocusIdx = (cmdkFocusIdx - 1 + els.length) % els.length;
        els.forEach((el, i) => el.classList.toggle('focused', i === cmdkFocusIdx));
        els[cmdkFocusIdx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && cmdkItems[cmdkFocusIdx]) {
        e.preventDefault();
        modal.style.display = 'none';
        cmdkItems[cmdkFocusIdx].run();
      } else if (e.key === 'Escape') {
        modal.style.display = 'none';
      }
    });
  }

  function initShortcutsModal() {
    const modal = document.getElementById('modal-shortcuts');
    document.getElementById('btn-open-shortcuts')?.addEventListener('click', () => {
      closeMobileSidebar();
      if (modal) modal.style.display = 'flex';
    });
    document.getElementById('btn-close-shortcuts')?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  // ── 12. Playback Speed & Sleep Timer (with Exponential Fade-Out) ──
  let sleepIntervalId = null;

  function updateToolsBadge() {
    const badge = document.getElementById('tools-active-badge');
    if (!badge) return;
    const parts = [];
    if (state.playbackRate !== 1) parts.push(`${state.playbackRate}×`);
    if (state.sleepTimerMode === 'track') {
      parts.push('End');
    } else if (state.sleepEndsAt > Date.now()) {
      const rem = Math.max(0, Math.ceil((state.sleepEndsAt - Date.now()) / 1000));
      const m = Math.floor(rem / 60);
      const s = rem % 60;
      parts.push(`${m}:${s < 10 ? '0' : ''}${s}`);
    }
    if (parts.length > 0) {
      badge.textContent = parts.join('·');
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  }

  function setPlaybackSpeed(rate) {
    state.playbackRate = rate;
    localStorage.setItem('zm_speed', String(rate));
    if (ytReady && ytPlayer && !state.isBypassingAd && typeof ytPlayer.setPlaybackRate === 'function') {
      try { ytPlayer.setPlaybackRate(rate); } catch (_) {}
    }
    document.querySelectorAll('.speed-pill').forEach(p => {
      p.classList.toggle('active', parseFloat(p.dataset.speed) === rate);
    });
    updateToolsBadge();
    showToast(`Playback speed: ${rate}×`);
  }

  function setSleepTimer(mode, silent = false) {
    if (sleepIntervalId) { clearInterval(sleepIntervalId); sleepIntervalId = null; }
    state.sleepTimerMode = String(mode);
    state.sleepEndsAt = 0;

    const statusEl = document.getElementById('sleep-timer-status');
    document.querySelectorAll('.sleep-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.sleep === state.sleepTimerMode);
    });

    if (state.sleepTimerMode === '0') {
      if (statusEl) statusEl.textContent = 'Off';
      updateToolsBadge();
      if (!silent) showToast('Sleep timer cancelled');
      return;
    }

    if (state.sleepTimerMode === 'track') {
      if (statusEl) statusEl.textContent = 'After current song';
      updateToolsBadge();
      if (!silent) showToast('Sleep timer: pausing after current track');
      return;
    }

    const mins = parseInt(state.sleepTimerMode, 10);
    if (!mins || mins <= 0) return;
    state.sleepEndsAt = Date.now() + mins * 60 * 1000;
    const baseVol = state.volume;

    const tick = () => {
      const remMs = state.sleepEndsAt - Date.now();
      if (remMs <= 0) {
        clearInterval(sleepIntervalId);
        sleepIntervalId = null;
        state.sleepTimerMode = '0';
        state.sleepEndsAt = 0;
        if (ytReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
          try {
            ytPlayer.pauseVideo();
            ytPlayer.setVolume(baseVol);
          } catch (_) {}
        }
        setSleepTimer('0', true);
        showToast('Sleep timer finished — goodnight ✦');
        return;
      }
      // Smooth 8-second fade-out before pausing
      if (remMs <= 8000 && ytReady && ytPlayer && !state.isMuted) {
        const ratio = Math.pow(remMs / 8000, 1.6);
        try { ytPlayer.setVolume(Math.round(baseVol * ratio)); } catch (_) {}
      }
      const remSec = Math.ceil(remMs / 1000);
      const m = Math.floor(remSec / 60);
      const s = remSec % 60;
      if (statusEl) statusEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
      updateToolsBadge();
    };

    tick();
    sleepIntervalId = setInterval(tick, 1000);
    if (!silent) showToast(`Sleep timer set for ${mins} minutes`);
  }

  function initPlaybackToolsPopover() {
    const btn = document.getElementById('btn-tools-toggle');
    const pop = document.getElementById('playback-tools-popover');
    if (!btn || !pop) return;

    document.querySelectorAll('.speed-pill').forEach(p => {
      p.classList.toggle('active', parseFloat(p.dataset.speed) === state.playbackRate);
      p.addEventListener('click', () => setPlaybackSpeed(parseFloat(p.dataset.speed)));
    });
    document.querySelectorAll('.sleep-pill').forEach(p => {
      p.addEventListener('click', () => setSleepTimer(p.dataset.sleep));
    });
    updateToolsBadge();

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = pop.style.display === 'block';
      closeAllPopovers();
      if (!open) {
        const rect = btn.getBoundingClientRect();
        pop.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
        pop.style.right = Math.max(16, window.innerWidth - rect.right - 20) + 'px';
        pop.style.top = 'auto';
        pop.style.left = 'auto';
        pop.style.display = 'block';
        btn.classList.add('active');
      }
    });
  }

  // ── 13. Document Picture-in-Picture & Fallback Mini-Player ──
  let pipWindow = null;

  function syncMiniPlayerUI() {
    const t = state.currentTrack || { title: 'ZeroMusic', artist: 'Select a track', thumbnail: '/zero-music/icon.svg' };
    // Update fallback mini-player
    const mArt = document.getElementById('mini-art');
    const mTitle = document.getElementById('mini-title');
    const mArtist = document.getElementById('mini-artist');
    const mPlay = document.getElementById('mini-play-pause');
    if (mArt) mArt.src = t.thumbnail;
    if (mTitle) mTitle.textContent = t.title;
    if (mArtist) mArtist.textContent = t.artist;
    if (mPlay) mPlay.textContent = state.isPlaying ? '⏸' : '▶';

    // Update Document PiP window if open
    if (pipWindow && !pipWindow.closed) {
      const d = pipWindow.document;
      const pArt = d.getElementById('pip-art');
      const pTitle = d.getElementById('pip-title');
      const pArtist = d.getElementById('pip-artist');
      const pPlay = d.getElementById('pip-play');
      if (pArt) pArt.src = t.thumbnail;
      if (pTitle) pTitle.textContent = t.title;
      if (pArtist) pArtist.textContent = t.artist;
      if (pPlay) pPlay.textContent = state.isPlaying ? '⏸' : '▶';
    }
  }

  function updatePipProgress(pct) {
    if (pipWindow && !pipWindow.closed) {
      const bar = pipWindow.document.getElementById('pip-bar');
      if (bar) bar.style.width = pct + '%';
    }
  }

  function updatePipLyric(line) {
    if (pipWindow && !pipWindow.closed) {
      const el = pipWindow.document.getElementById('pip-lyric');
      if (el) el.textContent = line || '';
    }
  }

  async function toggleMiniPlayer() {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      pipWindow = null;
      document.getElementById('btn-pip-toggle')?.classList.remove('active');
      return;
    }

    if ('documentPictureInPicture' in window) {
      try {
        pipWindow = await window.documentPictureInPicture.requestWindow({ width: 370, height: 158 });
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--zm-accent').trim() || '#f97316';
        pipWindow.document.head.innerHTML = `<title>ZeroMusic Mini</title><style>
          *{box-sizing:border-box;margin:0;padding:0;font-family:Inter,system-ui,sans-serif}
          body{background:#09090e;color:#fff;height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:12px;overflow:hidden}
          .row{display:flex;align-items:center;gap:12px}
          #pip-art{width:56px;height:56px;border-radius:10px;object-fit:cover;background:#16161f;flex-shrink:0}
          .meta{flex:1;min-width:0}
          #pip-title{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          #pip-artist{font-size:11px;color:#a1a1aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
          #pip-lyric{font-size:11px;color:${accent};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px;min-height:14px}
          .ctrls{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:6px}
          button{border:none;border-radius:50%;width:32px;height:32px;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;font-size:12px}
          #pip-play{width:36px;height:36px;background:${accent};color:#000;font-weight:700}
          .track{height:3px;width:100%;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden;margin-top:8px}
          #pip-bar{height:100%;width:0;background:${accent};transition:width .25s linear}
        </style>`;
        pipWindow.document.body.innerHTML = `
          <div class="row">
            <img id="pip-art" src="/zero-music/icon.svg" alt="">
            <div class="meta">
              <div id="pip-title">ZeroMusic</div>
              <div id="pip-artist">Ready</div>
              <div id="pip-lyric"></div>
            </div>
          </div>
          <div class="ctrls">
            <button id="pip-prev">⏮</button>
            <button id="pip-play">▶</button>
            <button id="pip-next">⏭</button>
          </div>
          <div class="track"><div id="pip-bar"></div></div>
        `;
        pipWindow.document.getElementById('pip-prev')?.addEventListener('click', playPrev);
        pipWindow.document.getElementById('pip-play')?.addEventListener('click', togglePlayPause);
        pipWindow.document.getElementById('pip-next')?.addEventListener('click', playNext);
        pipWindow.addEventListener('pagehide', () => {
          pipWindow = null;
          document.getElementById('btn-pip-toggle')?.classList.remove('active');
        });
        document.getElementById('btn-pip-toggle')?.classList.add('active');
        syncMiniPlayerUI();
        return;
      } catch (_) {}
    }

    // Fallback in-page floating mini-player
    const fallback = document.getElementById('fallback-mini-player');
    if (fallback) {
      const showing = fallback.style.display === 'flex';
      fallback.style.display = showing ? 'none' : 'flex';
      document.getElementById('btn-pip-toggle')?.classList.toggle('active', !showing);
      syncMiniPlayerUI();
    }
  }

  function initMiniPlayer() {
    document.getElementById('btn-pip-toggle')?.addEventListener('click', toggleMiniPlayer);
    document.getElementById('mini-prev')?.addEventListener('click', playPrev);
    document.getElementById('mini-play-pause')?.addEventListener('click', togglePlayPause);
    document.getElementById('mini-next')?.addEventListener('click', playNext);
    document.getElementById('mini-close')?.addEventListener('click', () => {
      document.getElementById('fallback-mini-player').style.display = 'none';
      document.getElementById('btn-pip-toggle')?.classList.remove('active');
    });
  }

  // ── 14. Web Listening Stats Dashboard & Stats Card Exporter ──
  function computeListeningStats() {
    const trackMap = new Map();
    [...state.history, ...state.likedTracks, ...SEED_YOUR_MIX, ...SEED_QUICK_PICKS, ...SEED_NEW_RELEASES].forEach(t => {
      if (t && t.id) trackMap.set(t.id, t);
    });
    state.playlists.forEach(pl => (pl.tracks || []).forEach(t => { if (t && t.id) trackMap.set(t.id, t); }));

    const entries = Object.entries(state.playCounts).filter(([_, c]) => c > 0);
    const totalPlays = entries.reduce((sum, [_, c]) => sum + c, 0);
    const topTracks = entries
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ track: trackMap.get(id), count }))
      .filter(x => x.track)
      .slice(0, 10);

    const artistCounts = new Map();
    entries.forEach(([id, count]) => {
      const t = trackMap.get(id);
      if (!t || !t.artist) return;
      const primary = t.artist.split(/[,;&]|ft\.|feat\./i)[0].trim();
      if (primary) artistCounts.set(primary, (artistCounts.get(primary) || 0) + count);
    });
    const topArtists = Array.from(artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([artist, count]) => ({ artist, count }));

    return { totalPlays, uniqueTracks: entries.length, topTracks, topArtists };
  }

  function renderStatsView() {
    const stats = computeListeningStats();
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('stats-total-plays', stats.totalPlays);
    setEl('stats-unique-tracks', stats.uniqueTracks);
    setEl('stats-liked-count', state.likedTracks.length);
    setEl('stats-playlists-count', state.playlists.length);

    const tracksBox = document.getElementById('stats-top-tracks');
    if (tracksBox) {
      if (stats.topTracks.length === 0) {
        tracksBox.innerHTML = '<div class="zm-empty" style="padding: 24px 0;">Play some songs to unlock your top tracks chart.</div>';
      } else {
        const maxC = stats.topTracks[0].count || 1;
        tracksBox.innerHTML = stats.topTracks.map((item, i) => `
          <div class="stats-rank-row clickable" data-stat-track-idx="${i}">
            <span class="stats-rank-num">#${i + 1}</span>
            <img class="stats-rank-thumb" src="${item.track.thumbnail}" alt="" loading="lazy">
            <div class="stats-rank-body">
              <div class="stats-rank-top">
                <span class="stats-rank-name">${escapeHtml(item.track.title)}</span>
                <span class="stats-rank-count">${item.count} plays</span>
              </div>
              <div class="stats-bar-track"><div class="stats-bar-fill" style="width: ${Math.round((item.count / maxC) * 100)}%;"></div></div>
            </div>
          </div>
        `).join('');
        tracksBox.querySelectorAll('.stats-rank-row').forEach(row => {
          row.addEventListener('click', () => {
            const idx = parseInt(row.dataset.statTrackIdx, 10);
            const list = stats.topTracks.map(x => x.track);
            playTrack(list[idx], list, idx);
          });
        });
      }
    }

    const artistsBox = document.getElementById('stats-top-artists');
    if (artistsBox) {
      if (stats.topArtists.length === 0) {
        artistsBox.innerHTML = '<div class="zm-empty" style="padding: 24px 0;">Your top artists will appear here as you listen.</div>';
      } else {
        const maxA = stats.topArtists[0].count || 1;
        artistsBox.innerHTML = stats.topArtists.map((item, i) => `
          <div class="stats-rank-row clickable" data-stat-artist="${escapeHtml(item.artist)}">
            <span class="stats-rank-num">#${i + 1}</span>
            <div class="stats-rank-body">
              <div class="stats-rank-top">
                <span class="stats-rank-name">${escapeHtml(item.artist)}</span>
                <span class="stats-rank-count">${item.count} plays</span>
              </div>
              <div class="stats-bar-track"><div class="stats-bar-fill" style="width: ${Math.round((item.count / maxA) * 100)}%;"></div></div>
            </div>
          </div>
        `).join('');
        artistsBox.querySelectorAll('.stats-rank-row').forEach(row => {
          row.addEventListener('click', () => {
            const a = row.dataset.statArtist;
            const inp = document.getElementById('zm-search-input');
            if (inp) inp.value = a;
            executeSearch(a);
          });
        });
      }
    }
  }

  function renderStatsCardCanvas() {
    const canvas = document.getElementById('stats-card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--zm-accent').trim() || '#f97316';
    const stats = computeListeningStats();
    const user = getGoogleUser();

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#140c0a');
    bg.addColorStop(0.5, '#09090f');
    bg.addColorStop(1, '#050507');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W * 0.8, H * 0.14, 20, W * 0.8, H * 0.14, 480);
    glow.addColorStop(0, hexToRgba(accent, 0.4));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = accent;
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.fillText('✦ ZEROMUSIC LISTENING STATS', 72, 108);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 54px Inter, sans-serif';
    ctx.fillText(user?.name ? `${user.name.split(' ')[0]}'s Sound` : 'Your Sound', 72, 178);

    // KPI Row
    const kpis = [
      ['TOTAL PLAYS', String(stats.totalPlays)],
      ['LIKED SONGS', String(state.likedTracks.length)],
      ['PLAYLISTS', String(state.playlists.length)]
    ];
    kpis.forEach(([lbl, val], i) => {
      const x = 72 + i * 260;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, 224, 236, 132, 22) : ctx.rect(x, 224, 236, 132);
      ctx.fill();
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '600 17px "JetBrains Mono", monospace';
      ctx.fillText(lbl, x + 24, 266);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 44px Inter, sans-serif';
      ctx.fillText(val, x + 24, 326);
    });

    // Top 5 Tracks
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText('TOP TRACKS', 72, 434);

    const list = stats.topTracks.slice(0, 5);
    if (list.length === 0) {
      ctx.fillStyle = '#71717a';
      ctx.font = '500 26px Inter, sans-serif';
      ctx.fillText('Keep listening to build your Top 5!', 72, 496);
    } else {
      list.forEach((item, i) => {
        const y = 492 + i * 96;
        ctx.fillStyle = i === 0 ? accent : '#71717a';
        ctx.font = '800 30px "JetBrains Mono", monospace';
        ctx.fillText(`0${i + 1}`, 72, y);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 28px Inter, sans-serif';
        const tName = item.track.title.length > 26 ? item.track.title.slice(0, 26) + '…' : item.track.title;
        ctx.fillText(tName, 146, y - 4);
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '500 21px Inter, sans-serif';
        ctx.fillText(`${item.track.artist} · ${item.count} plays`, 146, y + 28);
      });
    }

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillText('zero.skillissue.gg/zero-music', 72, H - 64);
  }

  function initStatsCardModal() {
    document.getElementById('btn-export-stats-card')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-stats-card');
      if (modal) modal.style.display = 'flex';
      renderStatsCardCanvas();
    });
    document.getElementById('btn-close-stats-card')?.addEventListener('click', () => {
      document.getElementById('modal-stats-card').style.display = 'none';
    });
    document.getElementById('btn-download-stats-card')?.addEventListener('click', () => {
      exportCanvasAsPng('stats-card-canvas', 'zeromusic-stats.png');
    });
    document.getElementById('btn-copy-stats-card')?.addEventListener('click', () => {
      copyCanvasToClipboard('stats-card-canvas');
    });
  }

  // ── 15. Shared Song URL Deep-Link (?v=...) + Mobile Showcase Tabs + Escape Stack ──
  let pendingDeepLinkTrack = null;

  function initSharedUrlDeepLink() {
    try {
      const params = new URLSearchParams(location.search);
      const vid = params.get('v') || params.get('id');
      if (!vid) return;
      pendingDeepLinkTrack = {
        id: vid,
        title: params.get('title') || 'Shared Track',
        artist: params.get('artist') || 'ZeroMusic',
        duration: '3:30',
        thumbnail: params.get('artwork') || (isSpotifyTrackId(vid) ? '/zero-music/icon.png' : `${_EP.YTIMG}${vid}/hqdefault.jpg`)
      };
    } catch (_) {}
  }

  function consumePendingDeepLink() {
    if (!pendingDeepLinkTrack || !ytReady || !isUserAuthenticated()) return;
    const t = pendingDeepLinkTrack;
    pendingDeepLinkTrack = null;
    playTrack(t, [t, ...SEED_YOUR_MIX], 0);
    showToast(`Playing shared song: ${t.title}`);
  }

  function initMobileShowcaseTabs() {
    const strip = document.getElementById('mobile-showcase-strip');
    const body = document.getElementById('mobile-showcase-body');
    if (!strip || !body) return;
    const items = {
      hud: {
        tag: 'NEW IN ANDROID',
        title: 'Side-by-Side Automotive Car HUD',
        desc: 'Full-screen ambient artwork glow, live synced lyrics, clock, up-next deck, and 30+ hands-free voice commands built for the road.'
      },
      lyrics: {
        tag: 'REAL-TIME KARAOKE',
        title: 'Tempo-Scaled Synced Lyrics',
        desc: 'Millisecond LRCLIB timing that adapts automatically to slowed, sped-up, or live versions, with tap-to-seek and shareable lyric cards.'
      },
      offline: {
        tag: 'SMART CACHE',
        title: '500+ Song Offline Vault',
        desc: 'Automatically keeps your favourites and playlists downloaded over Wi-Fi so commutes and flights stay 100% uninterrupted.'
      },
      sync: {
        tag: 'PHONE ↔ DESKTOP',
        title: 'Private Google Drive Cloud Sync',
        desc: 'Liked songs, playlists, and listening stats stay synced bidirectionally between Android and this web player in your private Drive AppData.'
      }
    };
    strip.querySelectorAll('.mobile-showcase-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.tab;
        const info = items[key];
        if (!info) return;
        strip.querySelectorAll('.mobile-showcase-tab').forEach(t => {
          const active = t === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', String(active));
        });
        body.innerHTML = `
          <div class="showcase-pill-tag">${info.tag}</div>
          <h4 class="showcase-card-title">${info.title}</h4>
          <p class="showcase-card-desc">${info.desc}</p>
        `;
      });
    });
  }

  function handleEscapeKey() {
    closeAllPopovers();
    const modalIds = ['modal-command-palette', 'modal-shortcuts', 'modal-lyric-card', 'modal-stats-card', 'modal-rename-playlist', 'modal-create-playlist', 'modal-add-to-playlist', 'modal-sync-account'];
    for (const id of modalIds) {
      const m = document.getElementById(id);
      if (m && m.style.display === 'flex') {
        m.style.display = 'none';
        return;
      }
    }
    if (state.isTheaterOpen) {
      closeTheaterMode();
      return;
    }
    if (state.isLyricsOpen || state.isQueueOpen) {
      state.isLyricsOpen = false;
      state.isQueueOpen = false;
      syncDrawerStates();
    }
    closeMobileSidebar();
  }

  // ── Initializer ──
  document.addEventListener('DOMContentLoaded', () => {
    initDeviceRouting();
    if (isAndroidDevice() || isUserMobileDevice()) {
      // Android / mobile users: enable mobile authentication, download tracking & showcase tabs
      initMobileAuth();
      initMobileShowcaseTabs();
      return;
    }
    initSharedUrlDeepLink();
    initYouTubeEngine();
    initSearch();
    initUIListeners();
    initSidebarAndMoodScroll();
    initAppearancePopover();
    initTheaterMode();
    initLyricsStudio();
    initCommandPalette();
    initShortcutsModal();
    initPlaybackToolsPopover();
    initMiniPlayer();
    initStatsCardModal();
    initHomeFeeds();
    initGoogleAuth();
    updateAuthGate();
  });

})();
