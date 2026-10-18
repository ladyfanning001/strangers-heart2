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
      :color="feedbackState === 'correct' ? '#0B342E' : '#0B1A2C'"
      flat
      class="camera-card position-relative rounded-xl overflow-hidden"
      :class="feedbackState === 'correct' ? 'camera-card--correct' : 'camera-card--adjust'"
    >
      <video ref="camera" class="camera-video" autoplay muted playsinline></video>
      <canvas ref="poseCanvas" class="pose-canvas"></canvas>
      <!-- Live Camera Badge -->
      <div class="live-badge text-caption white--text px-3 py-1 font-weight-bold">
        <span class="live-dot"></span> Live camera
      </div>

      <div class="tracking-hud white--text">
        <div class="tracking-hud__label">POSE TRACKING</div>
        <div class="tracking-hud__value">{{ currentAngle }}° <span>/ 50° target</span></div>
        <div class="tracking-hud__meter"><span :style="{ width: `${Math.min(currentAngle / 0.72, 100)}%` }"></span></div>
      </div>

      <div class="landmark-legend white--text text-caption">
        <span class="legend-line"></span> body landmark
        <span class="legend-ring"></span> knee target
      </div>

      <div v-if="!cameraActive" class="camera-placeholder">
        <span class="camera-symbol">⌾</span>
        <span class="white--text text-body-2 mt-2">{{ cameraError || 'Camera ready for tracking' }}</span>
        <v-btn
          v-if="cameraError"
          small
          outlined
          color="white"
          class="mt-3 text-none"
          @click="startPoseTracking"
        >
          Enable camera
        </v-btn>
      </div>

      <!-- Real-time Alert Badge -->
      <div class="alert-badge text-caption white--text px-4 py-2 font-weight-bold" :class="feedbackState === 'correct' ? 'alert-badge--correct' : ''">
        {{ feedbackMessage }}
      </div>
    </v-card>

    <!-- Feedback / Needs Adjusting Card -->
    <v-card flat class="feedback-card pa-4 rounded-xl overflow-hidden" :class="feedbackState === 'correct' ? 'border-card-success' : 'border-card-alert'">
      <div class="text-caption font-weight-bold text-uppercase mb-1" :class="feedbackState === 'correct' ? 'green--text text--darken-2' : 'red--text text--darken-2'">
        {{ feedbackState === 'correct' ? 'MOVEMENT CORRECT' : 'NEEDS ADJUSTING' }}
      </div>
      <h2 class="text-h6 font-weight-bold brand-text mb-1">
        {{ feedbackState === 'correct' ? 'Great control. Hold this position.' : 'Lift your knee a little higher' }}
      </h2>
      <p class="text-body-2 grey--text text--darken-2 mb-0">
        {{ feedbackState === 'correct' ? 'Your knee angle and foot pressure are balanced.' : 'Raise about 15° more. Keep your back straight.' }}
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
          <span class="fullscreen-symbol">{{ isAvatarMaximized ? '↙' : '↗' }}</span>
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
          {{ isPlaying ? 'Pause' : 'Play' }}
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
          Phase: <strong class="black--text">{{ phaseText }}</strong> &nbsp;
          Angle: <strong class="black--text">{{ currentAngle }}°</strong> / target <strong class="black--text">50°</strong> &nbsp;
          Repetitions: <strong class="black--text">{{ repCount }}</strong>
        </div>
        <div class="grey--text text--darken-1 font-weight-medium">
          Drag the avatar to rotate. The trained leg is highlighted in teal.
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
            <span class="grey--text text--darken-2">Foot sensor</span>
            <span class="brand-text">{{ sensorStatus }}</span>
          </div>
          <div class="progress-track">
            <v-progress-linear
              :value="footPressure"
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
        {{ lastRepLabel }}
      </div>
      <div class="text-h4 font-weight-bold green--text text--darken-3">
        {{ accuracy }}%
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
      phaseText: 'Waiting for pose',
      repCount: 6,
      accuracy: 92,
      landmarkCount: 0,
      cameraActive: false,
      cameraError: '',
      feedbackState: 'adjust',
      feedbackMessage: 'Right knee: lift higher',
      footPressure: 45,
      sensorStatus: 'Uneven',
      pose: null,
      poseModel: null,
      cameraStream: null,
      sensorTimer: null,
      lastRepLabel: 'Last rep: Correct'
    }
  },
  mounted() {
    this.startSensorSimulator()
    this.startPoseTracking()
  },
  beforeDestroy() {
    if (this.sensorTimer) clearInterval(this.sensorTimer)
    if (this.cameraStream) this.cameraStream.getTracks().forEach(track => track.stop())
    if (this.poseModel) this.poseModel.close()
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
    },
    startSensorSimulator() {
      this.sensorTimer = setInterval(() => {
        const simulatedPressure = 48 + Math.round(Math.sin(Date.now() / 900) * 17)
        this.footPressure = Math.max(15, Math.min(95, simulatedPressure))
        this.sensorStatus = this.footPressure > 55 && this.footPressure < 78 ? 'Balanced' : 'Uneven'
        this.evaluateMovement()
      }, 450)
    },
    async startPoseTracking() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return
      this.cameraError = ''
      try {
        const [{ Pose }, { Camera }] = await Promise.all([
          import('@mediapipe/pose/pose'),
          import('@mediapipe/camera_utils/camera_utils')
        ])
        this.poseModel = new Pose({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` })
        this.poseModel.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 })
        this.poseModel.onResults(this.onPoseResults)
        this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
        this.$refs.camera.srcObject = this.cameraStream
        await this.$refs.camera.play()
        this.cameraActive = true
        this.camera = new Camera(this.$refs.camera, { onFrame: async () => this.poseModel.send({ image: this.$refs.camera }), width: 640, height: 480 })
        this.camera.start()
      } catch (error) {
        this.cameraActive = false
        this.cameraError = error.name === 'NotAllowedError'
          ? 'Camera permission is blocked'
          : 'Camera could not start'
      }
    },
    onPoseResults(results) {
      const canvas = this.$refs.poseCanvas
      if (!canvas || !results.poseLandmarks) return
      canvas.width = this.$refs.camera.videoWidth || 640
      canvas.height = this.$refs.camera.videoHeight || 480
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)
      const accent = this.feedbackState === 'correct' ? '#6EE7B7' : '#FFB4A8'
      const glow = this.feedbackState === 'correct' ? 'rgba(110, 231, 183, 0.8)' : 'rgba(255, 180, 168, 0.8)'
      const connections = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32]]
      this.landmarkCount = results.poseLandmarks.filter(point => point.visibility === undefined || point.visibility > 0.55).length
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.shadowBlur = 14
      context.shadowColor = glow
      context.strokeStyle = accent
      context.lineWidth = 4
      connections.forEach(([from, to]) => {
        const first = results.poseLandmarks[from]
        const last = results.poseLandmarks[to]
        if (!first || !last) return
        context.beginPath()
        context.moveTo(first.x * canvas.width, first.y * canvas.height)
        context.lineTo(last.x * canvas.width, last.y * canvas.height)
        context.stroke()
      })
      context.shadowBlur = 18
      context.fillStyle = accent
      const visibleBodyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 31, 32]
      results.poseLandmarks.forEach((point, index) => {
        if (!visibleBodyPoints.includes(index)) return
        context.beginPath()
        context.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2)
        context.fill()
      })
      const hip = results.poseLandmarks[23]
      const knee = results.poseLandmarks[25]
      const ankle = results.poseLandmarks[27]
      if (hip && knee && ankle) {
        const kneeX = knee.x * canvas.width
        const kneeY = knee.y * canvas.height
        context.shadowBlur = 0
        context.strokeStyle = accent
        context.lineWidth = 2
        context.beginPath()
        context.arc(kneeX, kneeY, 24, 0, Math.PI * 2)
        context.stroke()
        context.beginPath()
        context.arc(kneeX, kneeY, 31, -Math.PI * 0.8, Math.PI * 0.1)
        context.stroke()
        const angle = this.angleBetween(hip, knee, ankle)
        this.currentAngle = Math.round(angle)
        this.pose = { angle }
        this.evaluateMovement()
      }
    },
    angleBetween(first, vertex, last) {
      const a = Math.atan2(first.y - vertex.y, first.x - vertex.x)
      const b = Math.atan2(last.y - vertex.y, last.x - vertex.x)
      const angle = Math.abs((a - b) * 180 / Math.PI)
      return angle > 180 ? 360 - angle : angle
    },
    evaluateMovement() {
      const kneeInTarget = this.pose ? this.pose.angle >= 38 && this.pose.angle <= 72 : false
      const pressureBalanced = this.footPressure >= 55 && this.footPressure <= 78
      this.feedbackState = kneeInTarget && pressureBalanced ? 'correct' : 'adjust'
      this.feedbackMessage = kneeInTarget ? (pressureBalanced ? 'Excellent: movement stable' : 'Distribute pressure evenly') : 'Right knee: lift higher'
      this.lastRepLabel = this.feedbackState === 'correct' ? 'Last rep: Correct' : 'Last rep: Needs correction'
      if (this.feedbackState === 'correct') this.accuracy = Math.min(99, this.accuracy + 1)
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
    height: auto !important;
    aspect-ratio: 4 / 3;
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

@media (max-width: 959px) {
  .exercise-page {
    padding: 16px !important;
  }

  .exercise-header {
    min-height: 52px;
  }

  .exercise-title {
    font-size: 1.45rem;
  }

  .camera-card {
    min-height: 0;
    height: auto;
    aspect-ratio: 4 / 3;
    width: 100%;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }

  .metrics-row {
    margin-left: -4px;
    margin-right: -4px;
  }

  .avatar-metrics {
    line-height: 1.7;
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
  display: block !important;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  min-height: 240px;
  border: 2px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 24px !important;
  overflow: hidden !important;
  position: relative;
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
}

.camera-card--adjust {
  border-color: #ff8b7d !important;
  box-shadow: 0 0 0 4px rgba(255, 139, 125, 0.12), 0 18px 45px rgba(30, 15, 25, 0.2) !important;
}

.camera-card--correct {
  border-color: #6ee7b7 !important;
  box-shadow: 0 0 0 4px rgba(110, 231, 183, 0.12), 0 18px 45px rgba(10, 65, 55, 0.24) !important;
}

.camera-video,
.pose-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #071522;
}

.camera-video {
  transform: scaleX(-1);
  opacity: 0.82;
}

.pose-canvas {
  z-index: 1;
  transform: scaleX(-1);
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #183b58 0%, #0b1a2c 70%);
}

.camera-symbol {
  color: #ffffff;
  font-size: 46px;
  line-height: 1;
}

.live-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px !important;
  z-index: 2;
  color: #ffffff !important;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 7px;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff7e72;
  box-shadow: 0 0 0 4px rgba(255, 126, 114, 0.18);
  animation: livePulse 1.6s ease-in-out infinite;
}

.tracking-hud {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  min-width: 132px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  background: rgba(6, 20, 34, 0.68);
  backdrop-filter: blur(12px);
  color: #ffffff !important;
}

.tracking-hud__label {
  color: rgba(255, 255, 255, 0.64);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.tracking-hud__value {
  margin-top: 3px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.tracking-hud__value span {
  color: rgba(255, 255, 255, 0.62);
  font-size: 10px;
  font-weight: 500;
}

.tracking-hud__meter {
  height: 3px;
  margin-top: 9px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.2);
}

.tracking-hud__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #6ee7b7;
  transition: width 0.25s ease;
}

.landmark-legend {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 9px;
  background: rgba(6, 20, 34, 0.55);
  font-size: 10px;
  color: #ffffff !important;
}

.legend-line {
  width: 16px;
  height: 3px;
  border-radius: 99px;
  background: #6ee7b7;
}

.legend-ring {
  width: 10px;
  height: 10px;
  margin-left: 5px;
  border: 2px solid #ffb4a8;
  border-radius: 50%;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.75); }
}

.alert-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background-color: #DC2626;
  border-radius: 12px !important;
  z-index: 2;
  color: #ffffff !important;
}

.alert-badge--correct {
  background-color: #0d9488;
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

.fullscreen-symbol {
  color: #475569;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
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

/* Local layout safeguards for browsers where Vuetify utility CSS is delayed. */
.exercise-header {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.exercise-header .v-btn {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  background: #eef2f6;
  color: #064d8d;
  font-size: 14px;
  font-weight: 700;
}

.feedback-card,
.avatar-3d-card,
.score-card {
  display: block !important;
  width: 100%;
  box-sizing: border-box;
}

.metrics-row {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  gap: 12px;
}

.metrics-row .v-col {
  width: auto !important;
  max-width: none !important;
  padding: 0 !important;
}

.metrics-row .v-card {
  display: block;
  width: 100%;
  min-height: 76px;
  box-sizing: border-box;
}

.avatar-stage {
  width: 100%;
  box-sizing: border-box;
}

.avatar-3d-card .v-btn {
  border: 0;
}

@media (min-width: 960px) {
  .camera-card {
    height: auto !important;
    min-height: 0;
  }

  .avatar-3d-card {
    height: 480px !important;
  }
}

@media (max-width: 560px) {
  .exercise-header {
    align-items: flex-start;
  }

  .exercise-header .v-btn {
    padding: 0 12px;
  }

  .metrics-row {
    gap: 8px;
  }

  .metrics-row .v-card {
    padding: 10px !important;
  }
}
</style>