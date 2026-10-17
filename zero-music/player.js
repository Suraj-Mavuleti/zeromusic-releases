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
    duration: 0,
    currentTime: 0,
    volume: parseInt(localStorage.getItem('zm_volume') || '85', 10),
    isMuted: false,
    isShuffle: localStorage.getItem('zm_shuffle') === 'true',
    repeatMode: parseInt(localStorage.getItem('zm_repeat') || '0', 10), // 0: off, 1: all, 2: one
    likedTracks: JSON.parse(localStorage.getItem('zm_liked') || '[]'),
    history: JSON.parse(localStorage.getItem('zm_history') || '[]'),
    playCounts: JSON.parse(localStorage.getItem('zm_play_counts') || '{}'),
    playlists: JSON.parse(localStorage.getItem('zm_playlists') || '[]'),
    activePlaylistId: null,
    lyrics: [],
    activeLyricIndex: -1,
    activeView: 'home',
    activeChart: 'global', // 'global' or 'india'
    activeMood: 'all',
    trackToAddToPlaylist: null,
    isLyricsOpen: false,
    isQueueOpen: false,
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
    updateAdShieldStatus('Protected');
    startAdWatchdog();
  }

  let playNextTimeout = null;
  let consecutiveErrors = 0;
  let currentPlaybackToken = 0;

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      consecutiveErrors = 0;
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
            ytPlayer.setPlaybackRate(1);
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
      if (art) art.src = coverUrl;
      if (largeArt) largeArt.src = coverUrl;
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

    addToHistory(track);
    updatePlayerUI(track);
    updateSpotlightCard(track);
    fetchLyrics(track);
    renderRecentlyPlayed();
    updateBecauseYouListened();

    let targetVideoId = getKnownYouTubeId(track);

    if (!targetVideoId) {
      updateAdShieldStatus('Matching Song...', false);
      targetVideoId = await resolveSpotifyTrack(track);
      if (token !== currentPlaybackToken) return;

      if (!targetVideoId) {
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
        state.duration = ytPlayer.getDuration() || 0;
        updateProgressUI();
        syncLyricsWithTime(state.currentTime);
      } catch (e) {}
    }, 250);
  }

  function stopProgressTimer() {
    if (progressInterval) clearInterval(progressInterval);
  }

  function updateProgressUI() {
    const elapsedEl = document.getElementById('time-elapsed');
    const durationEl = document.getElementById('time-duration');
    const progressBar = document.getElementById('playback-progress');
    const progressFill = document.getElementById('progress-bar-fill');

    if (elapsedEl) elapsedEl.textContent = formatTime(state.currentTime);
    if (durationEl) durationEl.textContent = formatTime(state.duration);

    if (progressBar && state.duration > 0) {
      const pct = (state.currentTime / state.duration) * 100;
      progressBar.value = pct;
      if (progressFill) progressFill.style.width = pct + '%';
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
    const muteBtn = document.getElementById('btn-mute');
    if (volSlider) volSlider.value = state.isMuted ? 0 : state.volume;
    if (muteBtn) {
      muteBtn.innerHTML = (state.isMuted || state.volume === 0)
        ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>`
        : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    }
  }

  function updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('btn-play-pause');
    if (!playPauseBtn) return;
    playPauseBtn.innerHTML = state.isPlaying
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>`;
    playPauseBtn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
  }

  function updatePlayerUI(track) {
    const art = document.getElementById('player-track-art');
    const title = document.getElementById('player-track-title');
    const artist = document.getElementById('player-track-artist');
    const likeBtn = document.getElementById('btn-like-current');

    if (art) art.src = track.thumbnail;
    if (title) title.textContent = track.title;
    if (artist) artist.textContent = track.artist;

    if (likeBtn) {
      const isLiked = isTrackLiked(track.id);
      likeBtn.classList.toggle('liked', isLiked);
      const svg = likeBtn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', isLiked ? '#f97316' : 'none');
        svg.setAttribute('stroke', isLiked ? '#f97316' : 'currentColor');
      }
    }

    document.querySelectorAll('.track-card, .track-row-item').forEach(el => {
      el.classList.toggle('now-playing-card', el.dataset.id === track.id);
      el.classList.toggle('active-row', el.dataset.id === track.id);
    });
  }

  function updateSpotlightCard(track) {
    const art = document.getElementById('spotlight-art');
    const title = document.getElementById('spotlight-title');
    const artist = document.getElementById('spotlight-artist');
    if (art) art.src = track.thumbnail;
    if (title) title.textContent = track.title;
    if (artist) artist.textContent = track.artist;
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

  // ── Synced Lyrics (LRCLIB) ──
  async function fetchLyrics(track) {
    const container = document.getElementById('lyrics-lines-container');
    const trackTitle = document.getElementById('lyrics-track-title');
    const trackArtist = document.getElementById('lyrics-track-artist');
    const largeArt = document.getElementById('lyrics-large-art');

    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    if (largeArt) largeArt.src = track.thumbnail;

    if (!container) return;
    container.innerHTML = '<div class="lyrics-status"><span class="zm-spinner"></span> Searching time-synced lyrics...</div>';

    state.lyrics = [];
    state.activeLyricIndex = -1;

    try {
      const cleanSong = encodeURIComponent(track.title.split('-')[0].split('(')[0].trim());
      const cleanArt = encodeURIComponent(track.artist.split(',')[0].split('&')[0].trim());
      const url = `${_EP.LRCLIB}?track_name=${cleanSong}&artist_name=${cleanArt}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Lyrics not found');
      const data = await res.json();

      if (data.syncedLyrics) {
        state.lyrics = parseLRC(data.syncedLyrics);
        renderLyrics();
      } else if (data.plainLyrics) {
        container.innerHTML = `<div class="plain-lyrics">${escapeHtml(data.plainLyrics).replace(/\n/g, '<br/>')}</div>`;
      } else {
        throw new Error('No lyrics');
      }
    } catch (e) {
      container.innerHTML = '<div class="lyrics-status">No synchronized lyrics available for this song.</div>';
    }
  }

  function parseLRC(lrcText) {
    const lines = lrcText.split('\n');
    const result = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = timeReg.exec(line);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = parseFloat('0.' + match[3]);
        const time = min * 60 + sec + ms;
        const text = line.replace(timeReg, '').trim();
        if (text) {
          result.push({ time, text });
        }
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }

  function renderLyrics() {
    const container = document.getElementById('lyrics-lines-container');
    if (!container || state.lyrics.length === 0) return;

    container.innerHTML = state.lyrics.map((l, i) => `
      <div class="lyric-line" data-index="${i}" data-time="${l.time}">
        ${escapeHtml(l.text)}
      </div>
    `).join('');

    container.querySelectorAll('.lyric-line').forEach(el => {
      el.addEventListener('click', () => {
        const t = parseFloat(el.dataset.time);
        seekTo(t);
      });
    });
  }

  function syncLyricsWithTime(currentTime) {
    if (!state.isLyricsOpen || state.lyrics.length === 0) return;

    let index = -1;
    for (let i = 0; i < state.lyrics.length; i++) {
      if (currentTime >= state.lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }

    if (index !== state.activeLyricIndex) {
      state.activeLyricIndex = index;
      const lines = document.querySelectorAll('.lyric-line');
      lines.forEach((line, i) => {
        line.classList.toggle('active', i === index);
      });

      if (index >= 0 && lines[index]) {
        lines[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
      fetch('https://zero.skillissue.gg/api/music-songs', {
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
    renderPlaylistsSidebar();
    if (state.activePlaylistId === 'liked') {
      openPlaylistView('liked');
    }
    triggerAutoSync();
  }

  function getMostPlayedTracks() {
    const counted = Object.entries(state.playCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);

    const trackMap = new Map();
    [...state.history, ...state.likedTracks, ...SEED_YOUR_MIX, ...SEED_QUICK_PICKS].forEach(t => trackMap.set(t.id, t));

    return counted.map(([id]) => trackMap.get(id)).filter(Boolean);
  }

  function renderPlaylistsSidebar() {
    const container = document.getElementById('sidebar-playlists-list');
    if (!container) return;

    const mostPlayed = getMostPlayedTracks();

    let html = `
      <button class="playlist-nav-item ${state.activePlaylistId === 'liked' ? 'active' : ''}" data-playlist-id="liked">
        <span class="playlist-nav-meta">
          <span class="pl-icon">💜</span>
          <span class="playlist-nav-name">Liked Songs</span>
        </span>
        <span class="playlist-nav-count">${state.likedTracks.length}</span>
      </button>
      <button class="playlist-nav-item ${state.activePlaylistId === 'most-played' ? 'active' : ''}" data-playlist-id="most-played">
        <span class="playlist-nav-meta">
          <span class="pl-icon">🔥</span>
          <span class="playlist-nav-name">Most Played</span>
        </span>
        <span class="playlist-nav-count">${mostPlayed.length}</span>
      </button>
    `;

    state.playlists.forEach(pl => {
      html += `
        <button class="playlist-nav-item ${state.activePlaylistId === pl.id ? 'active' : ''}" data-playlist-id="${pl.id}">
          <span class="playlist-nav-meta">
            <span class="pl-icon">🎵</span>
            <span class="playlist-nav-name">${escapeHtml(pl.name)}</span>
          </span>
          <span class="playlist-nav-count">${pl.tracks.length}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.playlist-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        openPlaylistView(item.dataset.playlistId);
      });
    });
  }

  function openPlaylistView(playlistId) {
    state.activePlaylistId = playlistId;
    switchMainView('playlist');
    renderPlaylistsSidebar();

    const titleEl = document.getElementById('playlist-view-title');
    const metaEl = document.getElementById('playlist-view-meta');
    const artDisplay = document.getElementById('playlist-art-display');
    const deleteBtn = document.getElementById('btn-playlist-delete');
    const tableContainer = document.getElementById('playlist-tracks-table');

    let playlistTitle = 'Playlist';
    let tracks = [];
    let isCustom = false;

    if (playlistId === 'liked') {
      playlistTitle = 'Liked Songs';
      tracks = state.likedTracks;
      if (artDisplay) artDisplay.innerHTML = '💜';
      if (deleteBtn) deleteBtn.style.display = 'none';
    } else if (playlistId === 'most-played') {
      playlistTitle = 'Most Played';
      tracks = getMostPlayedTracks();
      if (artDisplay) artDisplay.innerHTML = '🔥';
      if (deleteBtn) deleteBtn.style.display = 'none';
    } else {
      const pl = state.playlists.find(p => p.id === playlistId);
      if (pl) {
        playlistTitle = pl.name;
        tracks = pl.tracks;
        isCustom = true;
        if (artDisplay) artDisplay.innerHTML = '🎵';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
      }
    }

    if (titleEl) titleEl.textContent = playlistTitle;
    if (metaEl) metaEl.textContent = `${tracks.length} songs // ZeroMusic Local Collection`;

    if (tableContainer) {
      if (tracks.length === 0) {
        tableContainer.innerHTML = '<div class="zm-empty">No songs in this playlist yet. Add songs using the + button on any track.</div>';
      } else {
        renderTrackRows(tableContainer, tracks, true, isCustom ? playlistId : null);
      }
    }

    const playAllBtn = document.getElementById('btn-playlist-play-all');
    if (playAllBtn) {
      playAllBtn.onclick = () => {
        if (tracks.length > 0) playTrack(tracks[0], tracks, 0);
      };
    }

    const shuffleBtn = document.getElementById('btn-playlist-shuffle');
    if (shuffleBtn) {
      shuffleBtn.onclick = () => {
        if (tracks.length > 0) {
          const shuffled = [...tracks].sort(() => Math.random() - 0.5);
          playTrack(shuffled[0], shuffled, 0);
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
      list.innerHTML = state.playlists.map(pl => `
        <div class="playlist-picker-item" data-pl-id="${pl.id}">
          <span>🎵 ${escapeHtml(pl.name)}</span>
          <span style="font-size: 11px; color: var(--zm-text-dim);">${pl.tracks.length} songs</span>
        </div>
      `).join('');

      list.querySelectorAll('.playlist-picker-item').forEach(item => {
        item.addEventListener('click', () => {
          addTrackToPlaylist(item.dataset.plId, state.trackToAddToPlaylist);
          modal.style.display = 'none';
        });
      });
    }

    modal.style.display = 'flex';
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
      if (mainTable) renderTop100Table(mainTable, state.sectionsData[cacheKey].slice(0, 30));
      if (fullTable) renderTop100Table(fullTable, state.sectionsData[cacheKey]);
      return;
    }

    if (mainTable) mainTable.innerHTML = '<div class="zm-loading"><span class="zm-spinner"></span> Loading YouTube Music Top 100 Charts...</div>';

    try {
      const res = await fetch(`${_EP.SEARCH}?chart=${chartType}`);
      const data = await res.json();
      if (data && data.tracks && data.tracks.length > 0) {
        state.sectionsData[cacheKey] = data.tracks;
        if (mainTable) renderTop100Table(mainTable, data.tracks.slice(0, 30));
        if (fullTable) renderTop100Table(fullTable, data.tracks);
        return;
      }
    } catch (e) {
      console.warn('Chart fetch failed, using fallback:', e);
    }

    // Fallback to high quality seeds
    const fallback = [...SEED_YOUR_MIX, ...SEED_QUICK_PICKS, ...SEED_NEW_RELEASES];
    state.sectionsData[cacheKey] = fallback;
    if (mainTable) renderTop100Table(mainTable, fallback);
    if (fullTable) renderTop100Table(fullTable, fallback);
  }

  function renderTop100Table(container, tracks) {
    if (!container) return;
    container.innerHTML = tracks.map((track, idx) => {
      const rank = track.rank || (idx + 1);
      const rankClass = rank === 1 ? 'rank-top-1' : rank === 2 ? 'rank-top-2' : rank === 3 ? 'rank-top-3' : '';
      return `
        <div class="track-row-item ${state.currentTrack && state.currentTrack.id === track.id ? 'active-row' : ''}" data-id="${track.id}" data-index="${idx}">
          <span class="row-index ${rankClass}">#${rank}</span>
          <img class="row-art-thumb" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" loading="lazy" data-track-id="${track.id}" />
          <div class="row-meta-col">
            <div class="row-track-name">${escapeHtml(track.title)}</div>
            <div class="row-artist-name">${escapeHtml(track.artist)}</div>
          </div>
          <span class="row-duration-tag">${track.duration || '3:30'}</span>
          <div class="row-actions-group">
            <button class="row-btn-action row-btn-like ${isTrackLiked(track.id) ? 'liked' : ''}" title="Like">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isTrackLiked(track.id) ? '#f97316' : 'none'}" stroke="${isTrackLiked(track.id) ? '#f97316' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button class="row-btn-action row-btn-add" title="Add to Playlist">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
        playTrack(track, tracks, idx);
      });

      const likeBtn = row.querySelector('.row-btn-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLikeTrack(track);
          likeBtn.classList.toggle('liked', isTrackLiked(track.id));
        });
      }

      const addBtn = row.querySelector('.row-btn-add');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openAddToPlaylistModal(track);
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

    if (header) header.textContent = `${moodName} Picks`;
    if (sub) sub.textContent = `YouTube Music ${moodName} playlists & curated hits`;

    // Check cache in state.sectionsData
    if (state.sectionsData[moodKey] && state.sectionsData[moodKey].length > 0) {
      renderTrackGrid(container, state.sectionsData[moodKey]);
      return;
    }

    if (container) container.innerHTML = `<div class="zm-loading"><span class="zm-spinner"></span> Loading ${moodName} tracks...</div>`;

    try {
      const res = await fetch(`${_EP.SEARCH}?mood=${encodeURIComponent(moodName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.tracks && data.tracks.length > 0) {
          state.sectionsData[moodKey] = data.tracks;
          renderTrackGrid(container, data.tracks);
          return;
        }
      }
    } catch (e) {
      console.warn('Mood fetch failed, using curated seeds:', e);
    }

    const fallback = SEED_MOODS[moodKey] || SEED_MOODS[moodKey.replace(/-/g, '')] || [...SEED_YOUR_MIX, ...SEED_NEW_RELEASES];
    state.sectionsData[moodKey] = fallback;
    renderTrackGrid(container, fallback);
  }

  // ── Render Track Grid (Cards) ──
  function renderTrackGrid(container, tracks) {
    if (!container) return;
    container.innerHTML = tracks.map((track, idx) => `
      <div class="track-card ${state.currentTrack && state.currentTrack.id === track.id ? 'now-playing-card' : ''}" data-id="${track.id}" data-index="${idx}">
        <div class="card-art-box">
          <img src="${track.thumbnail}" alt="${escapeHtml(track.title)}" loading="lazy" data-track-id="${track.id}" />
          <button class="card-hover-play" aria-label="Play ${escapeHtml(track.title)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 18 12 6 20 6 4"/></svg>
          </button>
          <button class="card-hover-like ${isTrackLiked(track.id) ? 'liked' : ''}" title="Like">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${isTrackLiked(track.id) ? '#f97316' : 'none'}" stroke="${isTrackLiked(track.id) ? '#f97316' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="card-hover-menu" title="Add to Playlist">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
        <div class="card-meta">
          <h4 class="card-title" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</h4>
          <p class="card-artist" title="${escapeHtml(track.artist)}">${escapeHtml(track.artist)}</p>
        </div>
      </div>
    `).join('');

    batchResolveCovers(tracks, 12);

    container.querySelectorAll('.track-card').forEach(card => {
      const idx = parseInt(card.dataset.index, 10);
      const track = tracks[idx];

      const playBtn = card.querySelector('.card-hover-play');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          playTrack(track, tracks, idx);
        });
      }

      card.addEventListener('click', () => {
        playTrack(track, tracks, idx);
      });

      const likeBtn = card.querySelector('.card-hover-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLikeTrack(track);
          likeBtn.classList.toggle('liked', isTrackLiked(track.id));
        });
      }

      const menuBtn = card.querySelector('.card-hover-menu');
      if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openAddToPlaylistModal(track);
        });
      }
    });
  }

  // ── Render Track Rows (Table List) ──
  function renderTrackRows(container, tracks, showActions = false, playlistId = null) {
    if (!container) return;
    container.innerHTML = tracks.map((track, idx) => `
      <div class="track-row-item ${state.currentTrack && state.currentTrack.id === track.id ? 'active-row' : ''}" data-id="${track.id}" data-index="${idx}">
        <span class="row-index">${idx + 1}</span>
        <img class="row-art-thumb" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" loading="lazy" data-track-id="${track.id}" />
        <div class="row-meta-col">
          <div class="row-track-name">${escapeHtml(track.title)}</div>
          <div class="row-artist-name">${escapeHtml(track.artist)}</div>
        </div>
        <span class="row-duration-tag">${track.duration || '3:30'}</span>
        ${showActions ? `
          <div class="row-actions-group">
            <button class="row-btn-action row-btn-like ${isTrackLiked(track.id) ? 'liked' : ''}" title="Like">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isTrackLiked(track.id) ? '#f97316' : 'none'}" stroke="${isTrackLiked(track.id) ? '#f97316' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            ${playlistId ? `
              <button class="row-btn-action row-btn-del" title="Remove from Playlist">✕</button>
            ` : `
              <button class="row-btn-action row-btn-add" title="Add to Playlist">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            `}
          </div>
        ` : ''}
      </div>
    `).join('');

    batchResolveCovers(tracks, 15);

    container.querySelectorAll('.track-row-item').forEach(row => {
      const idx = parseInt(row.dataset.index, 10);
      const track = tracks[idx];

      row.addEventListener('click', (e) => {
        if (e.target.closest('.row-btn-action')) return;
        playTrack(track, tracks, idx);
      });

      const likeBtn = row.querySelector('.row-btn-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLikeTrack(track);
          likeBtn.classList.toggle('liked', isTrackLiked(track.id));
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
    });
  }

  // ── Queue Drawer ──
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
      <div class="queue-item-card ${i === state.queueIndex ? 'current-playing' : ''}" data-index="${i}">
        <img class="queue-art-thumb" src="${track.thumbnail}" alt="${escapeHtml(track.title)}" data-track-id="${track.id}" />
        <div class="queue-info-text">
          <div class="queue-song-name">${escapeHtml(track.title)}</div>
          <div class="queue-song-artist">${escapeHtml(track.artist)}</div>
        </div>
        <button class="btn-queue-del" title="Remove">✕</button>
      </div>
    `).join('');

    list.querySelectorAll('.queue-item-card').forEach(row => {
      const idx = parseInt(row.dataset.index, 10);
      row.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-queue-del')) {
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

    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    document.querySelectorAll('.main-content-section').forEach(sec => {
      sec.style.display = sec.id === `section-${viewName}` ? 'block' : 'none';
    });

    if (viewName !== 'playlist') {
      state.activePlaylistId = null;
      renderPlaylistsSidebar();
    }
  }

  // ── Instant Search & Autocomplete ──
  let searchDebounceTimer = null;

  function initSearch() {
    const searchInput = document.getElementById('zm-search-input');
    const clearBtn = document.getElementById('zm-search-clear');
    const suggestBox = document.getElementById('zm-search-suggestions');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim();
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
      });
    }

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
    switchMainView('search');
    const container = document.getElementById('search-results-grid');
    const header = document.getElementById('search-results-header');
    const sub = document.getElementById('search-results-subtitle');

    if (header) header.textContent = `Search results for "${query}"`;
    if (sub) sub.textContent = 'Songs, artists, and audio tracks';
    if (!container) return;

    container.innerHTML = '<div class="zm-loading"><span class="zm-spinner"></span> Searching high-fidelity audio...</div>';

    try {
      const res = await fetch(`${_EP.SEARCH}?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.tracks && data.tracks.length > 0) {
        renderTrackGrid(container, data.tracks);
      } else {
        container.innerHTML = '<div class="zm-empty">No tracks found. Try a different search query.</div>';
      }
    } catch (e) {
      container.innerHTML = '<div class="zm-empty">Search unavailable at this second. Try again shortly.</div>';
    }
  }

  // ── Setup UI Event Listeners ──
  function initUIListeners() {
    // Spotlight Play Now Button
    const spotlightPlay = document.getElementById('btn-spotlight-play');
    if (spotlightPlay) {
      spotlightPlay.addEventListener('click', () => {
        playTrack(SEED_YOUR_MIX[0], SEED_YOUR_MIX, 0);
      });
    }

    // Transport buttons
    document.getElementById('btn-play-pause')?.addEventListener('click', togglePlayPause);
    document.getElementById('btn-next')?.addEventListener('click', playNext);
    document.getElementById('btn-prev')?.addEventListener('click', playPrev);
    document.getElementById('btn-mute')?.addEventListener('click', toggleMute);

    // Shuffle & Repeat
    const shuffleBtn = document.getElementById('btn-shuffle');
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('active', state.isShuffle);
      shuffleBtn.addEventListener('click', () => {
        state.isShuffle = !state.isShuffle;
        shuffleBtn.classList.toggle('active', state.isShuffle);
        localStorage.setItem('zm_shuffle', state.isShuffle);
        showToast(state.isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF');
      });
    }

    const repeatBtn = document.getElementById('btn-repeat');
    if (repeatBtn) {
      repeatBtn.addEventListener('click', () => {
        state.repeatMode = (state.repeatMode + 1) % 3;
        localStorage.setItem('zm_repeat', state.repeatMode);
        repeatBtn.classList.toggle('active', state.repeatMode > 0);
        const modeNames = ['Repeat OFF', 'Repeat ALL', 'Repeat ONE'];
        showToast(modeNames[state.repeatMode]);
      });
    }

    // Volume Slider
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.value = state.volume;
      volSlider.addEventListener('input', (e) => {
        setVolume(parseInt(e.target.value, 10));
      });
    }

    // Scrubber
    const scrubber = document.getElementById('playback-progress');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        if (state.duration > 0) {
          const targetSec = (parseFloat(e.target.value) / 100) * state.duration;
          seekTo(targetSec);
        }
      });
    }

    // Like Current Track in Bottom Bar
    document.getElementById('btn-like-current')?.addEventListener('click', () => {
      if (state.currentTrack) toggleLikeTrack(state.currentTrack);
    });

    // Add Current Track to Playlist
    document.getElementById('btn-add-playlist-current')?.addEventListener('click', () => {
      if (state.currentTrack) openAddToPlaylistModal(state.currentTrack);
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

        if (tracks.length > 0) {
          playTrack(tracks[0], tracks, 0);
        }
      });
    });

    // 16 Moods Chips
    document.querySelectorAll('.mood-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const mood = chip.dataset.mood;
        loadMoodTracks(mood);
      });
    });

    // Clear History Button
    document.getElementById('btn-clear-history')?.addEventListener('click', () => {
      state.history = [];
      localStorage.removeItem('zm_history');
      renderRecentlyPlayed();
      showToast('Cleared listening history');
    });

    // Create Playlist Modal
    const createPlBtn = document.getElementById('btn-create-playlist');
    const createModal = document.getElementById('modal-create-playlist');
    const cancelPlBtn = document.getElementById('btn-cancel-create-playlist');
    const confirmPlBtn = document.getElementById('btn-confirm-create-playlist');
    const plInput = document.getElementById('input-new-playlist-name');

    if (createPlBtn && createModal) {
      createPlBtn.addEventListener('click', () => {
        createModal.style.display = 'flex';
        if (plInput) {
          plInput.value = '';
          plInput.focus();
        }
      });
    }

    if (cancelPlBtn && createModal) {
      cancelPlBtn.addEventListener('click', () => {
        createModal.style.display = 'none';
      });
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

    // Close Add to Playlist Modal
    document.getElementById('btn-close-add-playlist')?.addEventListener('click', () => {
      document.getElementById('modal-add-to-playlist').style.display = 'none';
    });

    // Drawers (Lyrics & Queue)
    const lyricsDrawer = document.getElementById('lyrics-drawer');
    const queueDrawer = document.getElementById('queue-drawer');

    document.getElementById('btn-lyrics-toggle')?.addEventListener('click', () => {
      state.isLyricsOpen = !state.isLyricsOpen;
      if (lyricsDrawer) lyricsDrawer.classList.toggle('open', state.isLyricsOpen);
      if (state.isLyricsOpen && queueDrawer) {
        queueDrawer.classList.remove('open');
        state.isQueueOpen = false;
      }
      if (state.isLyricsOpen && state.currentTrack) {
        syncLyricsWithTime(state.currentTime);
      }
    });

    document.getElementById('btn-close-lyrics')?.addEventListener('click', () => {
      state.isLyricsOpen = false;
      if (lyricsDrawer) lyricsDrawer.classList.remove('open');
    });

    document.getElementById('btn-queue-toggle')?.addEventListener('click', () => {
      state.isQueueOpen = !state.isQueueOpen;
      if (queueDrawer) queueDrawer.classList.toggle('open', state.isQueueOpen);
      if (state.isQueueOpen && lyricsDrawer) {
        lyricsDrawer.classList.remove('open');
        state.isLyricsOpen = false;
      }
      if (state.isQueueOpen) renderQueue();
    });

    document.getElementById('btn-close-queue')?.addEventListener('click', () => {
      state.isQueueOpen = false;
      if (queueDrawer) queueDrawer.classList.remove('open');
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (!isUserAuthenticated()) return;
      if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        seekTo(state.currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        seekTo(state.currentTime - 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(state.volume + 5);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(state.volume - 5);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        document.getElementById('btn-lyrics-toggle')?.click();
      } else if (e.key === 'q' || e.key === 'Q') {
        document.getElementById('btn-queue-toggle')?.click();
      }
    });
  }

  // ── Helpers ──
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
    setTimeout(() => {
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
    renderRecentlyPlayed();
    renderPlaylistsSidebar();

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
      if (state.isPlaying && typeof pauseTrack === 'function') {
        pauseTrack();
      }
    } else {
      gate.style.display = 'none';
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
      if (state.activePlaylistId === 'liked') openPlaylistView('liked');
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

  // ── Initializer ──
  document.addEventListener('DOMContentLoaded', () => {
    initDeviceRouting();
    if (isAndroidDevice() || isUserMobileDevice()) {
      // Android / mobile users: enable mobile authentication & download tracking
      initMobileAuth();
      return;
    }
    initYouTubeEngine();
    initSearch();
    initUIListeners();
    initHomeFeeds();
    initGoogleAuth();
    updateAuthGate();
  });

})();
