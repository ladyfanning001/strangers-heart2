<template>
  <div class="exercise-page px-4 py-2">
    <!-- Header: Exercise Step & Exit Button -->
    <div class="exercise-header d-flex justify-space-between align-center mb-3">
      <div>
        <div class="text-caption grey--text text--darken-1 font-weight-bold">
          Exercise 1 of 4 · Rep 6 / 10
        </div>
        <h1 class="exercise-title font-weight-bold brand-text">
          Seated knee lift
        </h1>
      </div>
      <v-btn
        color="#EEF2F6"
        depressed
        class="text-none font-weight-bold brand-text px-5 rounded-lg"
        @click="exitExercise"
      >
        Exit
      </v-btn>
    </div>

    <!-- Computer Vision Camera View Card -->
    <v-card
      color="#0B1A2C"
      flat
      class="camera-card position-relative rounded-xl overflow-hidden"
    >
      <!-- Live Camera Badge -->
      <div class="live-badge text-caption white--text px-3 py-1 font-weight-bold">
        Live camera
      </div>

      <!-- Pose Tracking overlay placeholder -->
      <div class="pose-overlay">
        <div class="pose-point head"></div>
        <div class="pose-point shoulder-left"></div>
        <div class="pose-point shoulder-right"></div>
        <div class="pose-point hip-left"></div>
        <div class="pose-point hip-right"></div>
        
        <!-- Target Knee Circle -->
        <div class="knee-target-circle">
          <div class="inner-dot"></div>
        </div>
        <div class="pose-point knee-bottom"></div>
      </div>

      <!-- Real-time Alert Badge -->
      <div class="alert-badge text-caption white--text px-4 py-2 font-weight-bold">
        Right knee: lift higher
      </div>
    </v-card>

    <!-- Feedback / Needs Adjusting Card -->
    <v-card flat class="feedback-card pa-4 border-card-alert rounded-xl overflow-hidden">
      <div class="text-caption font-weight-bold red--text text--darken-2 text-uppercase mb-1">
        NEEDS ADJUSTING
      </div>
      <h2 class="text-h6 font-weight-bold brand-text mb-1">
        Lift your knee a little higher
      </h2>
      <p class="text-body-2 grey--text text--darken-2 mb-0">
        Raise about 15° more. Keep your back straight.
      </p>
    </v-card>

    <!-- 3D Avatar Animation Section -->
    <v-card
      flat
      class="avatar-3d-card pa-4 rounded-xl overflow-hidden d-flex flex-column"
      :class="{ 'avatar-3d-card--maximized': isAvatarMaximized }"
    >
      <!-- 3D Canvas Viewport -->
      <div
        class="avatar-stage position-relative d-flex justify-center align-center flex-grow-1"
        :class="{ 'avatar-stage--maximized': isAvatarMaximized }"
      >
        <div class="avatar-badge text-caption font-weight-medium">
          RehabCoach 3D
        </div>

        <v-btn
          icon
          class="avatar-maximize-btn"
          :aria-label="isAvatarMaximized ? 'Restore avatar panel' : 'Maximize avatar panel'"
          :title="isAvatarMaximized ? 'Restore avatar panel' : 'Maximize avatar panel'"
          @click.stop="isAvatarMaximized = !isAvatarMaximized"
        >
          <v-icon size="28">{{ isAvatarMaximized ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
        </v-btn>

        <!-- Animated 3D Avatar (CSS/SVG Animation) -->
        <div class="avatar-model" :class="{ 'animating': isPlaying }">
          <div class="avatar-head"></div>
          <div class="avatar-torso"></div>
          <div class="avatar-limbs">
            <div class="avatar-arm arm-left"></div>
            <div class="avatar-arm arm-right"></div>
            <div class="avatar-leg leg-left"></div>
            <!-- Target Leg -->
            <div class="avatar-leg leg-right target-leg">
              <div class="leg-upper"></div>
              <div class="leg-joint"></div>
              <div class="leg-lower"></div>
            </div>
          </div>
        </div>

        <!-- Perspective Grid -->
        <div class="perspective-grid"></div>
      </div>

      <!-- Playback Controls -->
      <div class="d-flex align-center justify-start ga-2 my-3">
        <v-btn
          color="#0D9488"
          dark
          depressed
          rounded="pill"
          class="text-none font-weight-bold px-4"
          @click="isPlaying = !isPlaying"
        >
          {{ isPlaying ? 'Jeda' : 'Putar' }}
        </v-btn>

        <v-btn
          v-for="speed in speedOptions"
          :key="speed"
          :color="currentSpeed === speed ? '#0D9488' : 'white'"
          :class="currentSpeed === speed ? 'white--text' : 'grey--text text--darken-3 custom-speed-border'"
          depressed
          rounded="pill"
          small
          class="text-none font-weight-bold px-3"
          @click="currentSpeed = speed"
        >
          {{ speed }}x
        </v-btn>
      </div>

      <!-- Live Metrics & Instructions -->
      <div class="avatar-metrics text-caption grey--text text--darken-2">
        <div class="mb-1">
          Fase: <strong class="black--text">{{ phaseText }}</strong> &nbsp;
          Sudut: <strong class="black--text">{{ currentAngle }}°</strong> / target <strong class="black--text">50°</strong> &nbsp;
          Pengulangan: <strong class="black--text">{{ repCount }}</strong>
        </div>
        <div class="grey--text text--darken-1 font-weight-medium">
          Seret avatar untuk memutar. Kaki yang dilatih ditandai warna hijau toska.
        </div>
      </div>
    </v-card>

    <!-- Metrics Bars (Muscle & Pressure) -->
    <v-row dense class="metrics-row">
      <v-col cols="6">
        <v-card color="#EEF2F6" flat class="pa-3 rounded-xl overflow-hidden h-100">
          <div class="d-flex justify-space-between text-caption font-weight-bold mb-2">
            <span class="grey--text text--darken-2">Muscle</span>
            <span class="brand-text">Good</span>
          </div>
          <div class="progress-track">
            <v-progress-linear
              value="70"
              color="#2E7D32"
              background-opacity="0"
              height="8"
              rounded
            ></v-progress-linear>
          </div>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card color="#EEF2F6" flat class="pa-3 rounded-xl overflow-hidden h-100">
          <div class="d-flex justify-space-between text-caption font-weight-bold mb-2">
            <span class="grey--text text--darken-2">Pressure</span>
            <span class="brand-text">Uneven</span>
          </div>
          <div class="progress-track">
            <v-progress-linear
              value="45"
              color="#C05621"
              background-opacity="0"
              height="8"
              rounded
            ></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Last Rep Score Banner -->
    <v-card flat class="score-card pa-4 last-rep-card rounded-xl d-flex justify-space-between align-center overflow-hidden">
      <div class="text-subtitle-2 font-weight-bold green--text text--darken-3">
        Last rep: Correct
      </div>
      <div class="text-h4 font-weight-bold green--text text--darken-3">
        92%
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'ExercisePage',
  data() {
    return {
      isPaused: false,
      isPlaying: true,
      isAvatarMaximized: false,
      currentSpeed: 1,
      speedOptions: [0.5, 1, 1.5],
      currentAngle: 2,
      phaseText: 'Turun',
      repCount: 39
    }
  },
  methods: {
    exitExercise() {
      this.$router.push('/')
    },
    togglePause() {
      this.isPaused = !this.isPaused
    },
    nextExercise() {
      console.log('Moving to next exercise...')
    }
  }
}
</script>

<style scoped>
.exercise-page {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* Mobile Gap Defaults */
.camera-card,
.feedback-card,
.avatar-3d-card,
.metrics-row {
  margin-bottom: 16px;
}

/* ✅ Desktop Grid Layout - Removes vertical right-side gap */
@media (min-width: 960px) {
  .exercise-page {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 16px 24px;
    align-items: stretch;
  }

  .exercise-header {
    grid-column: 1 / -1;
    grid-row: 1;
    margin-bottom: 0 !important;
  }

  .camera-card {
    grid-column: 1;
    grid-row: 2;
    height: 480px !important;
    margin-bottom: 0 !important;
  }

  .feedback-card {
    grid-column: 1;
    grid-row: 3 / span 2;
    margin-bottom: 0 !important;
  }

  .avatar-3d-card {
    grid-column: 2;
    grid-row: 2;
    height: 480px !important; /* Matches Camera card height exactly */
    margin-bottom: 0 !important;
  }

  .avatar-stage {
    min-height: 220px;
  }

  .metrics-row {
    grid-column: 2;
    grid-row: 3;
    margin-bottom: 0 !important;
  }

  .score-card {
    grid-column: 2;
    grid-row: 4;
    margin-bottom: 0 !important;
  }
}

.brand-text {
  color: #064D8D !important;
}

.exercise-title {
  font-size: 1.75rem;
  line-height: 1.2;
}

.line-height-tight {
  line-height: 1.2;
}

/* 1. Camera Card */
.camera-card {
  height: 320px;
  border: 3.5px solid #DC2626 !important;
  border-radius: 24px !important;
  overflow: hidden !important;
  position: relative;
}

.live-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px !important;
  z-index: 2;
}

.alert-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background-color: #DC2626;
  border-radius: 12px !important;
  z-index: 2;
}

/* Pose Tracking Overlay */
.pose-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.pose-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #6EE7B7;
  border-radius: 50%;
}

.pose-point.head { top: 40px; left: 49%; }
.pose-point.shoulder-left { top: 75px; left: 39%; }
.pose-point.shoulder-right { top: 75px; left: 59%; }
.pose-point.hip-left { top: 135px; left: 44%; }
.pose-point.hip-right { top: 135px; left: 54%; }
.pose-point.knee-bottom { top: 235px; left: 45%; }

.knee-target-circle {
  position: absolute;
  top: 185px;
  right: 32%;
  width: 44px;
  height: 44px;
  border: 3px solid #FCA5A5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner-dot {
  width: 10px;
  height: 10px;
  background-color: #FCA5A5;
  border-radius: 50%;
}

/* 2. 3D Avatar Section Styles */
.avatar-3d-card {
  border: 1px solid #E2E8F0 !important;
  border-radius: 20px !important;
  background-color: #FFFFFF !important;
}

.avatar-stage {
  height: 220px;
  background: radial-gradient(circle at center, #FFFFFF 40%, #F8FAFC 100%);
  border-radius: 16px;
  overflow: hidden;
}

.avatar-maximize-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 4;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.92);
}

.avatar-3d-card--maximized {
  position: fixed !important;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  margin: 0 !important;
  border-radius: 0 !important;
  overflow-y: auto !important;
}

.avatar-stage--maximized {
  flex: 1;
  min-height: 60vh;
}

.avatar-stage--maximized .avatar-model {
  transform: scale(2.5);
}

.avatar-badge {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 4px 10px;
  color: #475569;
  z-index: 3;
}

.avatar-model {
  position: relative;
  width: 40px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.avatar-head {
  width: 24px;
  height: 24px;
  background-color: #B0C4DE;
  border-radius: 50%;
  margin-bottom: 2px;
}

.avatar-torso {
  width: 14px;
  height: 50px;
  background-color: #CBD5E1;
  border-radius: 6px;
}

.avatar-limbs {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
}

.avatar-arm {
  position: absolute;
  width: 8px;
  height: 38px;
  background-color: #94A3B8;
  border-radius: 4px;
  top: 28px;
}

.arm-left { left: -2px; }
.arm-right { right: -2px; }

.avatar-leg {
  position: absolute;
  width: 12px;
  height: 60px;
  top: 74px;
  border-radius: 6px;
}

.leg-left {
  left: 6px;
  background-color: #CBD5E1;
}

.target-leg {
  right: 4px;
  background-color: #14B8A6;
  transform-origin: top center;
}

.animating .target-leg {
  animation: legLift 2.2s infinite ease-in-out;
}

@keyframes legLift {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-45deg);
  }
}

.perspective-grid {
  position: absolute;
  bottom: 10px;
  width: 260px;
  height: 100px;
  background-image: 
    linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px);
  background-size: 20px 20px;
  transform: rotateX(65deg) rotateZ(-10deg);
  transform-style: preserve-3d;
}

.custom-speed-border {
  border: 1px solid #E2E8F0 !important;
}

/* 3. Needs Adjusting Card */
.border-card-alert {
  border: 1.5px solid #FCA5A5 !important;
  background-color: #FFFFFF !important;
  border-radius: 20px !important;
  box-shadow: 0px 4px 15px rgba(220, 38, 38, 0.05) !important;
}

/* 4. Progress Track */
.progress-track {
  width: 100%;
  background-color: #E2E8F0;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

/* 5. Last Rep Box */
.last-rep-card {
  background-color: #E6F4EA !important;
  border: 1.5px solid #34A853 !important;
  border-radius: 20px !important;
}

/* 6. Action Buttons */
.custom-outline-btn {
  border: 2px solid #064D8D !important;
  border-radius: 16px !important;
}

.action-btn-fill {
  border-radius: 16px !important;
}
</style>