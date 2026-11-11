// Everything personal lives here. Edit this file, drop your assets in /public, done.
export const config = {
  siteTitle: 'badeye',

  enter: {
    title: 'click to enter <3',
    subtitle: 'badeye on top',
  },

  profile: {
    name: 'Badeye',
    avatar: '/img/avatar.png',
    bio: ['i aint never heard of yo', 'badeye on top', 'opsec drive'],
    badges: ['gem', 'star', 'circle', 'rocket', 'heart'],
    socials: [
      { type: 'tiktok', url: 'https://tiktok.com/@yourname' },
      { type: 'namemc', url: 'https://namemc.com/profile/yourname' },
      { type: 'github', url: 'https://github.com/yourname' },
      { type: 'youtube', url: 'https://youtube.com/@yourname' },
      { type: 'twitch', url: 'https://twitch.tv/yourname' },
      { type: 'litecoin', url: 'litecoin:YOUR_LTC_ADDRESS' },
      { type: 'cashapp', url: 'https://cash.app/$yourname' },
    ],
  },

  footer: {
    views: 142,
    location: 'opsec drive',
  },

  skills: {
    title: 'Skills & Stack',
    subtitle: 'An experienced developer in multiple languages.',
    groups: [
      { name: 'Frontend', items: ['javascript', 'react', 'nextjs', 'tailwind'] },
      { name: 'Backend', items: ['python', 'java', 'mysql', 'supabase', 'php', 'cpp', 'lua', 'rust'] },
      { name: 'Tools', items: ['openai'] },
      { name: 'Platforms', items: ['vercel'] },
    ],
  },

  // Playlist. Lyrics resolve in order: `lrc` file -> lrclib.net lookup by artist/title.
  tracks: [
    {
      title: 'JANE DOE',
      artist: 'Kenshi Yonezu & Hikaru Utada',
      src: '/music/jane-doe.mp3',
      cover: '/img/cover.jpg',
      lrc: '/lyrics/jane-doe.lrc',
    },
  ],

  volume: 0.5,

  // Mods tab. Download buttons resolve the latest GitHub release of each repo at runtime.
  mods: {
    githubUser: 'augumental',
    note: 'Built for Minecraft 1.21.11. Drop the jar into .minecraft/mods next to Fabric API.',
    items: [
      {
        repo: 'TierTaggerPlus',
        name: 'TierTagger+',
        icon: null,
        description: "Shows players' PvP tiers next to their nametag. Press K to look anyone up across 8 tierlists side by side.",
        tags: ['Fabric', '1.21.11', 'PvP'],
      },
      {
        repo: 'playerpingdisplay',
        name: 'Player Ping Display',
        icon: '/mods/playerpingdisplay.png',
        description: "Shows a player's live ping for five seconds after you hit them.",
        tags: ['Fabric', '1.21.11', 'HUD'],
      },
      {
        repo: 'Liquid-Overlay',
        name: 'Liquid Input Overlay',
        icon: '/mods/liquid-overlay.png',
        description: 'Keystroke and mouse overlay with a liquid-glass settings menu. Tap Left Ctrl in game to customise it.',
        tags: ['Fabric', '1.21.11', 'Overlay'],
      },
    ],
  },
}
