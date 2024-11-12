<template>
  <div class="game-container">
    <Match3PreloaderVue2 ref="match3" :options="{}" :callbacks="{ scoreUpdate: updateScore }" />
    <div class="controls">
      <button id="startButton" @click="startGame" :disabled="isGameRunning">Start</button>
      <button id="stopButton" @click="stopGame" :disabled="!isGameRunning">Stop</button>
      <button id="pauseButton" @click="pauseGame" :disabled="!isGameRunning || isPaused">Pause</button>
      <button id="resumeButton" @click="resumeGame" :disabled="!isGameRunning || !isPaused">Resume</button>
    </div>
    <div id="score">Score: {{ score }}</div>
  </div>
</template>

<script>
import Match3PreloaderVue2 from '../wrappers/vue2/vue2'

export default {
  name: 'App',
  components: {
    Match3PreloaderVue2
  },
  data() {
    return {
      score: 0,
      isGameRunning: false,
      isPaused: false
    }
  },
  methods: {
    updateScore(newValue) {
      this.score = newValue
    },
    startGame() {
      this.$refs.match3.start()
      this.isGameRunning = true
      this.isPaused = false
    },
    stopGame() {
      this.$refs.match3.stop()
      this.isGameRunning = false
      this.isPaused = false
    },
    pauseGame() {
      this.$refs.match3.pause()
      this.isPaused = true
    },
    resumeGame() {
      this.$refs.match3.resume()
      this.isPaused = false
    }
  }
}
</script>

<style scoped>
.game-container {
  text-align: center;
  background-color: var(--container-background);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 20px var(--shadow-color);
  transition: all 0.3s ease;
  width: 540px;
}

.controls {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

button:hover:not(:disabled) {
  background-color: var(--primary-color-hover);
  transform: translateY(-2px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#stopButton {
  background-color: var(--stop-color);
}

#stopButton:hover:not(:disabled) {
  background-color: var(--stop-color-hover);
}

#score {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}
</style>