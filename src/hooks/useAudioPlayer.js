import { useCallback, useEffect, useRef, useState } from 'react'

/** Owns a single <audio> element and a playlist. */
export default function useAudioPlayer(tracks, initialVolume = 0.5) {
  const audioRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)
  const track = tracks[index] || null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    audio.volume = Math.min(Math.max(initialVolume, 0), 1)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onError = () => {
      const msg = `Could not load audio: ${audio.currentSrc || track?.src}`
      console.error('[audio]', msg, audio.error)
      setError(msg)
      setPlaying(false)
    }
    const onEnded = () => setIndex((i) => (i + 1) % Math.max(tracks.length, 1))
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('ended', onEnded)
    }
  }, [tracks.length, initialVolume, track?.src])

  // Track change: swap source, keep playing if we were.
  const wasPlaying = useRef(false)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    setError(null)
    setDuration(0)
    audio.src = track.src
    audio.load()
    if (wasPlaying.current) audio.play().catch((e) => console.warn('[audio] autoplay blocked', e))
  }, [track])

  useEffect(() => {
    wasPlaying.current = playing
  }, [playing])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return false
    try {
      await audio.play()
      return true
    } catch (e) {
      console.warn('[audio] play() rejected', e)
      return false
    }
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) play()
    else audio.pause()
  }, [play])

  const seek = useCallback((t) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(t)) return
    audio.currentTime = Math.max(0, Math.min(t, audio.duration || t))
  }, [])

  const next = useCallback(() => {
    if (tracks.length <= 1) return seek(0)
    setIndex((i) => (i + 1) % tracks.length)
  }, [tracks.length, seek])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (tracks.length <= 1 || (audio && audio.currentTime > 3)) return seek(0)
    setIndex((i) => (i - 1 + tracks.length) % tracks.length)
  }, [tracks.length, seek])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }, [])

  return { audioRef, track, index, playing, muted, duration, error, play, toggle, seek, next, prev, toggleMute }
}
