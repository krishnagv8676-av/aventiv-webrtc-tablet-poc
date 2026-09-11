<template>
  <div class="player-view">
    <!-- Top bar -->
    <div class="player-topbar">
      <button class="back-btn" @click="$emit('close')">
        ← Back to Videos
      </button>
      <span class="now-playing">▶ Now Playing</span>
    </div>

    <div class="player-layout">
      <!-- Main video area -->
      <div class="main-panel">
        <div class="video-wrapper">
          <iframe
            :src="`https://www.youtube.com/embed/${video.embedId}?autoplay=1&rel=0`"
            allow="autoplay; fullscreen"
            allowfullscreen
            frameborder="0"
          ></iframe>
        </div>
        <div class="video-info">
          <span class="tag">{{ video.tag }}</span>
          <h2>{{ video.title }}</h2>
          <p class="author">by {{ video.author }}</p>
          <div class="quote-box">
            <span class="quote-icon">"</span>
            <p>{{ currentQuote }}</p>
          </div>
        </div>
      </div>

      <!-- Sidebar playlist -->
      <div class="sidebar">
        <h3 class="sidebar-title">Up Next</h3>
        <div
          v-for="v in videos"
          :key="v.id"
          class="playlist-item"
          :class="{ active: v.id === video.id }"
          @click="$emit('play', v)"
        >
          <div class="pl-thumb" :style="{ background: v.color }">
            <span>▶</span>
          </div>
          <div class="pl-info">
            <p class="pl-title">{{ v.title }}</p>
            <span class="pl-author">{{ v.author }} · {{ v.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({ video: Object, videos: Array });
defineEmits(["close", "play"]);

const quotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you will feel when you achieve it.",
  "Don't stop when you are tired. Stop when you are done.",
];

const currentQuote = computed(() => quotes[props.video.id % quotes.length]);
</script>

<style scoped>
.player-view { min-height: 100vh; background: #0b0d17; display: flex; flex-direction: column; }

.player-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: #0f1120;
  border-bottom: 1px solid #1e2236;
}
.back-btn {
  background: none;
  border: 1px solid #2a2f45;
  color: #8892a4;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.back-btn:hover { border-color: #ffa032; color: #ffa032; }
.now-playing {
  color: #ffa032;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.player-layout {
  display: flex;
  flex: 1;
  gap: 0;
}

.main-panel { flex: 1; padding: 32px; }

.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.video-info { margin-top: 24px; }
.tag {
  display: inline-block;
  background: rgba(255,160,50,0.1);
  color: #ffa032;
  border: 1px solid rgba(255,160,50,0.25);
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}
.video-info h2 { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 4px; }
.author { color: #8892a4; font-size: 14px; margin-bottom: 20px; }

.quote-box {
  background: linear-gradient(135deg, #141829, #1a1f35);
  border-left: 3px solid #ffa032;
  border-radius: 0 12px 12px 0;
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.quote-icon { font-size: 36px; color: #ffa032; line-height: 1; font-family: Georgia, serif; flex-shrink: 0; }
.quote-box p { color: #c5ccd8; font-size: 15px; line-height: 1.6; font-style: italic; }

/* Sidebar */
.sidebar {
  width: 320px;
  background: #0f1120;
  border-left: 1px solid #1e2236;
  padding: 24px 16px;
  overflow-y: auto;
  max-height: calc(100vh - 60px);
}
.sidebar-title { font-size: 13px; font-weight: 700; color: #8892a4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; padding: 0 8px; }

.playlist-item {
  display: flex;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}
.playlist-item:hover { background: #1a1f35; }
.playlist-item.active { background: rgba(255,160,50,0.1); border: 1px solid rgba(255,160,50,0.2); }

.pl-thumb {
  width: 56px;
  height: 40px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(255,255,255,0.9);
}
.pl-info { overflow: hidden; }
.pl-title { font-size: 12px; font-weight: 600; color: #e8ecf0; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pl-author { font-size: 11px; color: #8892a4; }

@media (max-width: 768px) {
  .player-layout { flex-direction: column; }
  .sidebar { width: 100%; max-height: none; border-left: none; border-top: 1px solid #1e2236; }
  .main-panel { padding: 16px; }
}
</style>
