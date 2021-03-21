/* eslint-disable */
const playerElement = document.getElementById('player-wrapper')

class Test1 extends window.MediaControl.BaseComponentPlugin {
  get name() { return 'test1' }
  get layer() { return 1 }
  get section() { return 1 }
  get position() { return 1 }
}
class Test2 extends window.MediaControl.BaseComponentPlugin {
  get name() { return 'test2' }
  get layer() { return 1 }
  get section() { return 1 }
  get position() { return 2 }

}
class Test3 extends window.MediaControl.BaseComponentPlugin {
  get name() { return 'test3' }
  get layer() { return 1 }
  get section() { return 1 }
  get position() { return 3 }
  get separator() { return true }
}
class Test4 extends window.MediaControl.BaseComponentPlugin {
  get name() { return 'test4' }
  get layer() { return 1 }
  get section() { return 1 }
  get position() { return 4 }
}

const player = new Clappr.Player({
  source: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  poster: 'http://clappr.io/poster.png',
  playback: { controls: false },
  includeResetStyle: false,
  plugins: [
    window.MediaControl.MainPlugin,
    Test1,
    Test2,
    Test3,
    Test4,
  ],
  mediaControl: {
    disableBeforeVideoStarts: false,
    layersQuantity: 1,
    layersConfig: [{
      id: 1,
      sectionsQuantity: 1,
      sectionsConfig: [{ id: 1, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }]
    }],
  },
})

player.attachTo(playerElement)

const randomRGBA = () => {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + 0.5 + ')';
}

player.core.mediaControl.$layers.forEach((layer, index) => {
  layer.style.backgroundColor = randomRGBA()
  
  layer.style.fontSize = '20px'
  layer.style.fontHeight = 'bolder'
  layer.style.lineHeight = index * 2.5

  const sections = layer.querySelectorAll('.media-control__sections')

  sections.forEach((section, index) => {
    section.style.backgroundColor = randomRGBA()
    section.style.fontSize = '20px'
    section.style.fontHeight = 'bolder'
    section.style.lineHeight = index * 2.5

    const items = layer.querySelectorAll('.media-control__elements')

    items.forEach((item, index) => {
      item.style.backgroundColor = randomRGBA()
      item.style.height = '40px'
      item.style.width = '40px'
      item.style.fontSize = '20px'
      item.style.fontHeight = 'bolder'
      item.style.lineHeight = index * 2.5
    })
  })
})
