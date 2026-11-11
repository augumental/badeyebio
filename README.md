# badeye

Personal bio site: enter gate with music, profile hero, stack, synced lyrics player and a Mods tab that pulls the latest GitHub release of each mod.

Vite + React + Tailwind. Started from [radium](https://github.com/ZeroCodeZeroBug/radium), stripped down to a single static page.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

## Make it yours

Everything personal is in `src/config.js`: name, bio lines, socials, skills, tracks and mods.

Media lives in `public/`:

| Path | What |
|------|------|
| `public/img/avatar.png` | profile picture (also the favicon) |
| `public/img/cover.jpg` | album art for the player |
| `public/music/jane-doe.mp3` | the track |
| `public/lyrics/jane-doe.lrc` | optional synced lyrics; without it the player looks the song up on lrclib.net |

## Mods tab

Each entry in `config.mods.items` points at a repo under `config.mods.githubUser`. The site lists every published GitHub release of that repo in a version dropdown (newest stable selected and marked Latest, pre-releases labelled), and Download grabs the `.jar` attached to the chosen version. Publish a release with the jar attached and it appears automatically; until a repo has one, the button links to its releases page.

## Deploy

Import the repo on vercel.com/new. Vercel detects Vite; the defaults (`npm run build`, output `dist`) work as is.
