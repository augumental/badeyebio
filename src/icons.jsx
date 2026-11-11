import {
  SiJavascript, SiReact, SiNextdotjs, SiTailwindcss, SiPython, SiMysql, SiSupabase,
  SiPhp, SiCplusplus, SiLua, SiRust, SiVercel, SiTiktok, SiNamemc, SiGithub,
  SiYoutube, SiTwitch, SiLitecoin, SiCashapp,
} from 'react-icons/si'
import { FaJava } from 'react-icons/fa'
import { Gem, Star, Circle, Rocket, Heart, Link } from 'lucide-react'

const Dot = (props) => (
  <svg viewBox="0 0 10 10" {...props}><circle cx="5" cy="5" r="4" fill="currentColor" /></svg>
)

export const SKILLS = {
  javascript: { label: 'JavaScript', Icon: SiJavascript },
  react: { label: 'React', Icon: SiReact },
  nextjs: { label: 'Next.js', Icon: SiNextdotjs },
  tailwind: { label: 'Tailwind CSS', Icon: SiTailwindcss },
  python: { label: 'Python', Icon: SiPython },
  java: { label: 'Java', Icon: FaJava },
  mysql: { label: 'MySQL', Icon: SiMysql },
  supabase: { label: 'Supabase', Icon: SiSupabase },
  php: { label: 'PHP', Icon: SiPhp },
  cpp: { label: 'C++', Icon: SiCplusplus },
  lua: { label: 'Lua', Icon: SiLua },
  rust: { label: 'Rust', Icon: SiRust },
  openai: { label: 'OpenAI', Icon: Dot },
  vercel: { label: 'Vercel', Icon: SiVercel },
}

export const SOCIALS = {
  tiktok: { label: 'TikTok', Icon: SiTiktok },
  namemc: { label: 'NameMC', Icon: SiNamemc },
  github: { label: 'GitHub', Icon: SiGithub },
  youtube: { label: 'YouTube', Icon: SiYoutube },
  twitch: { label: 'Twitch', Icon: SiTwitch },
  litecoin: { label: 'Litecoin', Icon: SiLitecoin },
  cashapp: { label: 'Cash App', Icon: SiCashapp },
}

export const BADGES = { gem: Gem, star: Star, circle: Circle, rocket: Rocket, heart: Heart }

export const lookup = (table, key) => table[key] || { label: key, Icon: Link }
