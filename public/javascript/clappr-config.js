const playerElement = document.getElementById('player-wrapper')

const player = new Clappr.Player({
  source: 'http://clappr.io/highline.mp4',
  poster: 'http://clappr.io/poster.png',
  playback: { controls: false },
  includeResetStyle: false,
  plugins: [
    window.MediaControl.PlayPauseButtonPlugin,
    window.MediaControl.VolumePlugin,
    window.MediaControl.FullscreenButtonPlugin,
    window.MediaControl.SeekBarPlugin,
    window.MediaControl.TimeIndicatorPlugin,
    window.MediaControl.MainPlugin,
  ],
})

player.attachTo(playerElement)
