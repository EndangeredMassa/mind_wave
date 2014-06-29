This project connects to a MindWave device to read your brain waves. The brain wave data is used to modify the difficulty of a simple falling platform game.

If you lose focus while playing the game, the gaps that allow you to fall through will widen. If you fail to stay calm during the game, the speed at which the platforms scroll up increases.

MindWave Headset: http://store.neurosky.com/products/mindwave-1

To get this running, you have to start up the fake data server (or connect to an actual MindWave device), then the main node.js process.

1. coffee fake_data
2. coffee web
3. http://localhost:3000

Note that this is all hackathon code. Don't look to it as examples of great code.

You can find a demo here: http://www.youtube.com/watch?v=LNf2e8Z6QgM