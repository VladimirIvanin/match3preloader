# Match 3 game to use as preloader for long loading screens

## Usage:

```
import Match3Preloader from 'Match3Preloader'

let match3 = new Match3Preloader(
  '#canvas',
  {
    scoreUpdate: (newValue: number) => {
        console.log(newValue)
    }
  }
);
match3.start();
```
