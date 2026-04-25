"use client";
import React from "react";

export default function HeroVideo() {
  // Play/pause state for icon
  const [playing, setPlaying] = React.useState(true);

  React.useEffect(() => {
    // Autoplay on mount
    const vid = document.getElementById("hero-video");
    if (vid && vid.paused) {
      // @ts-ignore
      vid.play();
      setPlaying(true);
    }
  }, []);

  const handlePlayPause = () => {
    const vid = document.getElementById("hero-video");
    if (vid) {
      // @ts-ignore
      if (vid.paused) {
        // @ts-ignore
        vid.play();
        setPlaying(true);
      } else {
        // @ts-ignore
        vid.pause();
        setPlaying(false);
      }
    }
  };

  return (
    <div className="relative w-full max-w-5xl group">
      {/* Animated gradient border */}
      <div className="absolute -inset-1 rounded-[2.5rem] z-0 bg-gradient-to-tr from-[#F85B00] via-[#a33900] to-[#ffb599] animate-gradient-x blur-sm opacity-70" />
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 rounded-[2rem] bg-white/10 backdrop-blur-md z-10 pointer-events-none" />
      <video
        id="hero-video"
        className="relative z-20 rounded-[2.5rem] shadow-2xl object-cover w-full h-[540px] border border-white/20"
        autoPlay
        loop
        muted
        playsInline
        poster="/video-poster.jpg"
        style={{ background: "#000" }}
      >
        <source src="/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Play/Pause Button */}
      <button
        type="button"
        aria-label="Play/Pause video"
        className="absolute bottom-6 right-6 z-30 bg-white/80 hover:bg-[#a33900] hover:text-white text-[#a33900] rounded-full p-3 shadow-lg transition-colors backdrop-blur-md border border-[#e3bfb1]"
        onClick={handlePlayPause}
      >
        <span className="material-symbols-outlined text-2xl">
          {playing ? "pause" : "play_arrow"}
        </span>
      </button>
    </div>
  );
}
