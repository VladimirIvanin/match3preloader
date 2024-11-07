# Match 3 game to use as preloader for long loading screens

## Usage:

```
import Match3Preloader from 'match3preloader'

let match3 = new Match3Preloader(
  '#canvas',
  {},
  {
    scoreUpdate: (score) => {
        console.log(score)
    }
  }
);
match3.start();
```
