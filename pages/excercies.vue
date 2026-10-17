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
      class="camera-card mb-4 position-relative rounded-xl overflow-hidden"
    >
      <!-- Live Camera Badge -->
      <div class="live-badge text-caption white--text px-3 py-1 font-weight-bold">
        Live camera
      </div>

      <!-- Picture-in-Picture 3D Guide -->
      <v-card
        color="#E2EDEA"
        flat
        class="guide-3d-box pa-2 text-center d-flex flex-column align-center justify-center rounded-lg"
        @click="enlargeGuide"
      >
        <div class="text-caption font-weight-bold brand-text line-height-tight">
          3D guide<br />tap to<br />enlarge
        </div>
      </v-card>

      <!-- Pose Tracking overlay placeholder (Mock Visual Points) -->
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
    <v-card flat class="feedback-card pa-4 mb-4 border-card-alert rounded-xl overflow-hidden">
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

    <!-- Metrics Bars (Muscle & Pressure) -->
    <v-row dense class="metrics-row mb-3">
      <v-col cols="6">
        <v-card color="#EEF2F6" flat class="pa-3 rounded-xl overflow-hidden">
          <div class="d-flex justify-space-between text-caption font-weight-bold mb-2">
            <span class="grey--text text--darken-2">Muscle</span>
            <span class="brand-text">Good</span>
          </div>
          <!-- Custom Pill Track for Progress Bar -->
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
        <v-card color="#EEF2F6" flat class="pa-3 rounded-xl overflow-hidden">
          <div class="d-flex justify-space-between text-caption font-weight-bold mb-2">
            <span class="grey--text text--darken-2">Pressure</span>
            <span class="brand-text">Uneven</span>
          </div>
          <!-- Custom Pill Track for Progress Bar -->
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
    <v-card flat class="score-card pa-4 mb-6 last-rep-card rounded-xl d-flex justify-space-between align-center overflow-hidden">
      <div class="text-subtitle-2 font-weight-bold green--text text--darken-3">
        Last rep: Correct
      </div>
      <div class="text-h4 font-weight-bold green--text text--darken-3">
        92%
      </div>
    </v-card>

    <!-- Bottom Action Buttons -->
    <v-row dense class="action-row">
      <v-col cols="6">
        <!-- <v-btn
          block
          outlined
          color="#064D8D"
          x-large
          class="text-none font-weight-bold custom-outline-btn rounded-xl py-4"
          @click="togglePause"
        >
          {{ isPaused ? 'Resume' : 'Pause' }}
        </v-btn> -->
      </v-col>
      <v-col cols="6">
        <!-- <v-btn
          block
          color="#064D8D"
          dark
          x-large
          class="text-none font-weight-bold action-btn-fill rounded-xl py-4"
          elevation="0"
          @click="nextExercise"
        >
          Next exercise
        </v-btn> -->
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'ExercisePage',
  data() {
    return {
      isPaused: false
    }
  },
  methods: {
    exitExercise() {
      this.$router.push('/')
    },
    enlargeGuide() {
      console.log('Enlarge 3D guide clicked')
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
  max-width: 1440px;
  margin: 0 auto;
}

@media (min-width: 960px) {
  .exercise-page {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.8fr);
    grid-template-rows: auto auto auto auto auto;
    gap: 20px 24px;
    align-items: stretch;
  }

  .exercise-header {
    grid-column: 1 / -1;
    grid-row: 1;
    margin-bottom: 0 !important;
  }

  .camera-card {
    grid-column: 1;
    grid-row: 2 / span 4;
    height: min(68vh, 680px);
    min-height: 440px;
    margin-bottom: 0 !important;
  }

  .feedback-card {
    grid-column: 2;
    grid-row: 2;
    margin-bottom: 0 !important;
    align-self: start;
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

  .action-row {
    grid-column: 2;
    grid-row: 5;
    align-self: end;
  }

  .pose-point.head { top: 12.5%; }
  .pose-point.shoulder-left,
  .pose-point.shoulder-right { top: 23.5%; }
  .pose-point.hip-left,
  .pose-point.hip-right { top: 42%; }
  .pose-point.knee-bottom { top: 73.5%; }

  .knee-target-circle {
    top: 58%;
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

.guide-3d-box {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 85px;
  height: 110px;
  border-radius: 14px !important;
  cursor: pointer;
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

/* 2. Needs Adjusting Card */
.border-card-alert {
  border: 1.5px solid #FCA5A5 !important;
  background-color: #FFFFFF !important;
  border-radius: 20px !important;
  box-shadow: 0px 4px 15px rgba(220, 38, 38, 0.05) !important;
}

/* 3. Progress Bar Track Fix */
.progress-track {
  width: 100%;
  background-color: #E2E8F0;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

/* 4. Last Rep Box */
.last-rep-card {
  background-color: #E6F4EA !important;
  border: 1.5px solid #34A853 !important;
  border-radius: 20px !important;
}

/* 5. Action Buttons */
.custom-outline-btn {
  border: 2px solid #064D8D !important;
  border-radius: 16px !important;
}

.action-btn-fill {
  border-radius: 16px !important;
}
</style>