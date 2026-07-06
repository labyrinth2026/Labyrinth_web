'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface HomeVideoPlayerProps {
  src: string;
  type?: string;
}

const HomeVideoPlayer: React.FC<HomeVideoPlayerProps> = ({ src, type = 'video/webm' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── helpers ── */
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  /* ── video events ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;

    const onLoaded = () => setLoaded(true);
    const onTime = () => {
      setCurrentTime(v.currentTime);
      setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    };
    const onDuration = () => setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);

    v.addEventListener('loadedmetadata', onDuration);
    v.addEventListener('canplay', onLoaded);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      v.removeEventListener('loadedmetadata', onDuration);
      v.removeEventListener('canplay', onLoaded);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      document.removeEventListener('fullscreenchange', onFsChange);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  /* ── actions ── */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); } else { v.pause(); }
    scheduleHide();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setMuted(val === 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full group bg-slate-950 rounded-3xl overflow-hidden"
      onMouseMove={scheduleHide}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => { if (playing) setShowControls(false); setShowVolumeSlider(false); }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        preload="auto"
        playsInline
      >
        <source src={src} type={type} />
      </video>

      {/* Loading spinner */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Click to play/pause overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />

      {/* Big play button when paused */}
      {!playing && loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${showControls || !playing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
      >
        {/* Progress bar */}
        <div
          className="mx-3 mt-3 h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2.5 transition-all duration-150 group/bar relative"
          onClick={handleSeek}
        >
          <div
            className="absolute inset-y-0 left-0 bg-[#CD0000] rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Button row */}
        <div className="flex items-center justify-between px-3 py-2.5 gap-2">
          {/* Left: play + time */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-colors text-white"
            >
              {playing
                ? <Pause size={15} fill="white" />
                : <Play size={15} fill="white" className="ml-0.5" />}
            </button>

            <span className="text-white text-[10px] font-mono select-none tabular-nums">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>

          {/* Right: volume + fullscreen */}
          <div className="flex items-center gap-2">
            {/* Volume */}
            <div
              className="flex items-center gap-1.5 relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-colors text-white"
              >
                {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              {/* Slider */}
              <div className={`overflow-hidden transition-all duration-200 ${showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-20 h-1 accent-[#CD0000] cursor-pointer"
                  style={{ appearance: 'auto' }}
                />
              </div>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-colors text-white"
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeVideoPlayer;
