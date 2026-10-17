<template>
  <div class="page-container px-4 py-2">
    <!-- Today's Session Card -->
    <v-card
      color="#064D8D"
      dark
      rounded="xl"
      elevation="0"
      class="pa-6 mb-4 card-session"
    >
      <div class="text-caption font-weight-bold text-uppercase opacity-80 mb-2 letter-spacing-1">
        TODAY'S SESSION
      </div>
      <h1 class="session-title font-weight-bold mb-3">
        Leg strength and<br />balance
      </h1>
      <p class="text-body-2 mb-8 opacity-90">
        4 exercises · about 20 min
      </p>
      <v-btn
        color="white"
        light
        large
        rounded="lg"
        class="start-session-btn brand-btn-text font-weight-bold text-none"
        elevation="0"
        @click="startSession"
      >
        Start session
      </v-btn>
    </v-card>

    <!-- Connection Status Bar -->
    <v-card
      color="#EEF2F6"
      flat
      rounded="xl"
      class="pa-4 mb-4 d-flex align-center justify-space-between card-connection"
    >
      <div>
        <div class="text-subtitle-2 font-weight-bold grey--text text--darken-3">Leg band connected</div>
        <div class="text-caption grey--text text--darken-1">Battery 82% · Signal strong</div>
      </div>
      <v-btn
        outlined
        color="#8B9AAB"
        small
        rounded="lg"
        class="text-none font-weight-bold white grey--text text--darken-3 custom-border"
        elevation="0"
        @click="reconnect"
      >
        Reconnect
      </v-btn>
    </v-card>

    <!-- Weekly Progress Card -->
    <v-card flat rounded="xl" class="pa-5 white border-card card-progress">
      <div class="d-flex justify-space-between align-center mb-6">
        <span class="text-subtitle-1 font-weight-bold grey--text text--darken-3">This week</span>
        <span class="text-caption grey--text text--darken-1">4 of 6 sessions</span>
      </div>

      <!-- Weekly Chart -->
      <div class="d-flex justify-space-between align-end mb-4 px-1" style="height: 110px;">
        <div
          v-for="day in weekDays"
          :key="day.name"
          class="d-flex flex-column align-center"
          style="width: 36px;"
        >
          <div
            class="chart-bar mb-2"
            :class="day.completed ? 'completed-bar' : 'grey lighten-3'"
            :style="{
              height: day.completed ? `${day.height}px` : '12px'
            }"
          ></div>
          <span class="text-caption grey--text text--darken-2 font-weight-bold">{{ day.name }}</span>
        </div>
      </div>

      <!-- Stats Footer -->
      <div class="d-flex justify-space-between text-caption pt-2">
        <span class="grey--text text--darken-1">Last accuracy <strong class="black--text font-weight-bold">86%</strong></span>
        <span class="grey--text text--darken-1">Muscle activity <strong class="black--text font-weight-bold">Improving</strong></span>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      weekDays: [
        { name: 'M', completed: true, height: 60 },
        { name: 'T', completed: true, height: 75 },
        { name: 'W', completed: true, height: 50 },
        { name: 'T', completed: true, height: 70 },
        { name: 'F', completed: false, height: 0 },
        { name: 'S', completed: false, height: 0 },
        { name: 'S', completed: false, height: 0 }
      ]
    }
  },
  methods: {
    startSession() {
      this.$router.push('/excercies')
    },
    reconnect() {
      console.log('Reconnecting...')
    }
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

@media (min-width: 960px) {
  .page-container {
    display: grid;
    grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.4fr);
    grid-template-rows: auto 1fr;
    gap: 24px;
    align-items: stretch;
  }

  .page-container > .v-card {
    margin-bottom: 0 !important;
  }

  .card-session {
    grid-column: 1;
    grid-row: 1 / span 2;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .card-session .v-btn {
    margin-top: auto;
  }

  .start-session-btn {
    width: 220px;
  }

  .card-connection {
    grid-column: 2;
    grid-row: 1;
    min-height: 104px;
  }

  .card-progress {
    grid-column: 2;
    grid-row: 2;
    min-height: 292px;
  }
}

.session-title {
  font-size: 1.85rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.brand-btn-text {
  color: #064D8D !important;
}

.start-session-btn {
  width: 100%;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-90 {
  opacity: 0.9;
}

.custom-border {
  border: 1.5px solid #D1D5DB !important;
}

.border-card {
  border: 1px solid #F1F5F9 !important;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.03) !important;
}

.chart-bar {
  width: 100%;
  border-radius: 10px;
  transition: height 0.3s ease;
}

.completed-bar {
  background-color: #064D8D;
}
</style>