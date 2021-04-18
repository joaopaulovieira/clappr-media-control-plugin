const playerElement = document.getElementById('player-wrapper')

const player = new Clappr.Player({
  source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
  mediaControl: {
    disableBeforeVideoStarts: false,
    layersQuantity: 1,
    layersConfig: [
      {
        id: 1,
        sectionsQuantity: 2,
        flexDirection: 'column',
        sectionsConfig: [{ id: 1, separator: true }],
      },
    ],
  },
})

player.attachTo(playerElement)
