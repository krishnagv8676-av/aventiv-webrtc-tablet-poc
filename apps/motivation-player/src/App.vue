<template>
  <div class="app">
    <header class="hero">
      <div class="hero-content">
        <span class="badge">🔥 Daily Motivation</span>
        <h1>Fuel Your <span class="highlight">Drive</span></h1>
        <p class="subtitle">Watch inspiring videos that push you to achieve more every day.</p>
        <button class="watch-btn" @click="openPlayer">
          <span class="btn-icon">▶</span>
          Watch Motivational Videos
        </button>
      </div>
      <div class="hero-visual">
        <div class="glow-ring"></div>
        <div class="play-icon-large">▶</div>
      </div>
    </header>

    <section class="video-grid" v-if="!playerOpen">
      <h2 class="section-title">Featured Videos</h2>
      <div class="grid">
        <div
          v-for="video in videos"
          :key="video.id"
          class="card"
          @click="playVideo(video)"
        >
          <div class="thumb" :style="{ background: video.color }">
            <span class="thumb-play">▶</span>
            <span class="thumb-duration">{{ video.duration }}</span>
          </div>
          <div class="card-body">
            <span class="tag">{{ video.tag }}</span>
            <h3>{{ video.title }}</h3>
            <p>{{ video.author }}</p>
          </div>
        </div>
      </div>
    </section>

    <VideoPlayer
      v-if="playerOpen"
      :video="currentVideo"
      :videos="videos"
      @close="playerOpen = false"
      @play="playVideo"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import VideoPlayer from "./components/VideoPlayer.vue";

const playerOpen = ref(false);
const currentVideo = ref(null);

const videos = [
  {
    id: 1,
    title: "Start Before You Are Ready",
    author: "Eric Thomas",
    tag: "Mindset",
    duration: "6:12",
    color: "linear-gradient(135deg,#f7971e,#ffd200)",
    embedId: "wnHW6o8WMas",
  },
  {
    id: 2,
    title: "How Bad Do You Want It?",
    author: "Eric Thomas",
    tag: "Discipline",
    duration: "8:42",
    color: "linear-gradient(135deg,#ee0979,#ff6a00)",
    embedId: "lsSC2vx7zFQ",
  },
  {
    id: 3,
    title: "Be Legendary",
    author: "Tom Bilyeu",
    tag: "Growth",
    duration: "11:05",
    color: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",
    embedId: "3GRd8gKwlgE",
  },
  {
    id: 4,
    title: "Change Your Mind, Change Your Life",
    author: "Les Brown",
    tag: "Success",
    duration: "9:30",
    color: "linear-gradient(135deg,#134e5e,#71b280)",
    embedId: "6oTNr2OGQac",
  },
  {
    id: 5,
    title: "The Power of Self-Discipline",
    author: "David Goggins",
    tag: "Discipline",
    duration: "7:15",
    color: "linear-gradient(135deg,#373b44,#4286f4)",
    embedId: "D1t4o_UVGOA",
  },
  {
    id: 6,
    title: "You Are Enough",
    author: "Mel Robbins",
    tag: "Confidence",
    duration: "5:48",
    color: "linear-gradient(135deg,#c94b4b,#4b134f)",
    embedId: "ZXsQAXx_ao0",
  },
];

function openPlayer() {
  currentVideo.value = videos[0];
  playerOpen.value = true;
}

function playVideo(video) {
  currentVideo.value = video;
  playerOpen.value = true;
}
</script>

<style scoped>
.app { min-height: 100vh; background: #0b0d17; }

/* HERO */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 64px 80px;
  background: linear-gradient(135deg, #0b0d17 0%, #141829 100%);
  border-bottom: 1px solid #1e2236;
  gap: 40px;
}
.hero-content { max-width: 560px; }
.badge {
  display: inline-block;
  background: rgba(255,160,50,0.15);
  color: #ffa032;
  border: 1px solid rgba(255,160,50,0.3);
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}
h1 {
  font-size: 52px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  color: #fff;
}
.highlight {
  background: linear-gradient(90deg, #ffa032, #ff6a00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle {
  color: #8892a4;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 36px;
}
.watch-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(90deg, #ffa032, #ff6a00);
  color: #fff;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 24px rgba(255,106,0,0.4);
}
.watch-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,106,0,0.55); }
.btn-icon {
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* Hero visual */
.hero-visual {
  position: relative;
  width: 220px;
  height: 220px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.glow-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255,160,50,0.3);
  animation: pulse 2.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 1; }
}
.play-icon-large {
  font-size: 80px;
  color: rgba(255,160,50,0.8);
  text-shadow: 0 0 40px rgba(255,160,50,0.5);
}

/* GRID */
.video-grid { padding: 48px 80px; }
.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 28px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.card {
  background: #141829;
  border: 1px solid #1e2236;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.card:hover { transform: translateY(-4px); border-color: #ffa032; box-shadow: 0 8px 24px rgba(255,160,50,0.15); }
.thumb {
  position: relative;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-play {
  font-size: 40px;
  color: rgba(255,255,255,0.9);
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: transform 0.2s;
}
.card:hover .thumb-play { transform: scale(1.1); }
.thumb-duration {
  position: absolute;
  bottom: 10px;
  right: 12px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}
.card-body { padding: 16px; }
.tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #ffa032;
  background: rgba(255,160,50,0.1);
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}
.card-body h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; line-height: 1.4; }
.card-body p { font-size: 12px; color: #8892a4; }

@media (max-width: 768px) {
  .hero { flex-direction: column; padding: 40px 24px; text-align: center; }
  h1 { font-size: 36px; }
  .hero-visual { display: none; }
  .video-grid { padding: 32px 24px; }
}
</style>
