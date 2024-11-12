# Match 3 Preloader

A customizable Match 3 game designed to be used as an engaging preloader for long loading screens in web applications.

## Features

- Lightweight and easy to integrate
- Customizable game settings
- Callback functions for game events
- Compatible with modern web browsers
- Vue 2 wrapper included

## Installation

You can install the Match 3 Preloader using npm:

```bash
npm install match3preloader
```

## Usage

### Basic Usage

```javascript
import Match3Preloader from 'match3preloader'

const match3 = new Match3Preloader(
  '#canvas',
  {
    width: 8,
    height: 8,
    gemTypes: 5
  },
  {
    scoreUpdate: (score) => {
      console.log('Current score:', score)
    }
  }
);

match3.start();
```

### Vue 2 Usage

If you're using Vue 2, you can use the provided wrapper:

```javascript
import Match3PreloaderVue2 from 'match3preloader/vue2'

export default {
  components: {
    Match3PreloaderVue2
  },
  template: `
    <Match3PreloaderVue2
      :width="500"
      :height="500"
      :gemTypes="5"
      :callbacks="{ scoreUpdate: onScoreUpdate }"
    />
  `,
  methods: {
    onScoreUpdate(score) {
      console.log('Current score:', score)
    }
  }
}
```

## API Reference

### Constructor

```javascript
new Match3Preloader(canvasSelector, gameOptions, callbacks)
```

- `canvasSelector`: String - CSS selector for the canvas element
- `gameOptions`: Object - Game configuration options
- `callbacks`: Object - Callback functions for game events

### Callbacks

| Callback | Parameters | Description |
|----------|------------|-------------|
| scoreUpdate | (score: number) | Called when the score changes |
| gameOver | () | Called when the game ends |
| gemMatch | (matchedGems: Gem[]) | Called when gems are matched |

### Methods

| Method | Description |
|--------|-------------|
| start() | Starts the game |
| pause() | Pauses the game |
| resume() | Resumes a paused game |
| reset() | Resets the game to its initial state |

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build the project: `npm run build`
