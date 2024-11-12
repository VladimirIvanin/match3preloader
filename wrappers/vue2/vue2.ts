import Vue from 'vue';
import Match3Preloader from '../../src/game-manager';

export default Vue.extend({
  name: 'Match3PreloaderVue2',
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    callbacks: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      match3: null as Match3Preloader | null,
    };
  },
  mounted() {
    this.initMatch3();
  },
  methods: {
    initMatch3() {
      const canvasId = `match3-canvas-${(this as any)._uid}`;
      (this.$el as HTMLCanvasElement).id = canvasId;

      // Передаем селектор вместо элемента
      this.match3 = new Match3Preloader(`#${canvasId}`, this.options, this.callbacks);
    },
    start() {
      if (this.match3) {
        this.match3.start();
      }
    },
    stop() {
      if (this.match3) {
        this.match3.stop();
      }
    },
    pause() {
      if (this.match3) {
        this.match3.pause();
      }
    },
    resume() {
      if (this.match3) {
        this.match3.resume();
      }
    },
  },
  beforeDestroy() {
    if (this.match3) {
      this.match3.stop();
    }
  },
  render(h) {
    return h('canvas', {
      attrs: {
        width: this.options.width || 500,
        height: this.options.height || 500,
      },
    });
  },
});