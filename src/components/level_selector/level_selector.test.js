import { Browser, Events, Core, Container, Playback } from '@clappr/core'
import LevelSelectorPlugin from './level_selector'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new LevelSelectorPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('LevelSelectorPlugin', function() {
  beforeEach(() => {
    jest.clearAllMocks()
    const response = setupTest({}, true)
    this.core = response.core
    this.container = response.container
    this.core.activeContainer = this.container
    this.playback = this.core.activePlayback
    this.plugin = response.plugin
  })

  test('is loaded on core plugins array', () => {
    expect(this.core.getPlugin(this.plugin.name).name).toEqual('level_selector')
  })

  describe('layer getter', () => {
    test('overrides MediaControlComponentPlugin layer getter to return a valid value', () => {
      expect(this.plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(this.plugin.layer).toEqual(1)
    })

    test('is configurable via mediaControl.levelSelectorComponent.layer config', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { layer: 2 } } })

      expect(plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(plugin.layer).toEqual(2)
    })
  })

  describe('section getter', () => {
    test('overrides MediaControlComponentPlugin section getter to return a valid value', () => {
      expect(this.plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(this.plugin.section).toEqual(1)
    })

    test('is configurable via mediaControl.levelSelectorComponent.section config', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { section: 2 } } })

      expect(plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(plugin.section).toEqual(2)
    })
  })

  describe('position getter', () => {
    test('overrides MediaControlComponentPlugin position getter to return a valid value', () => {
      expect(this.plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(this.plugin.position).toEqual(2)
    })

    test('is configurable via mediaControl.levelSelectorComponent.position config', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { position: 3 } } })

      expect(plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(plugin.position).toEqual(3)
    })
  })

  describe('separator getter', () => {
    test('is configurable via mediaControl.levelSelectorComponent.separator config', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { separator: true } } })

      expect(plugin.separator).not.toEqual(MediaControlComponentPlugin.prototype.separator)
      expect(plugin.separator).toBeTruthy()
    })

    test('returns true value if is not configured with a valid value', () => {
      expect(this.plugin.separator).not.toEqual(MediaControlComponentPlugin.prototype.separator)
      expect(this.plugin.separator).toBeTruthy()
    })
  })

  test('have a getter called attributes', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'attributes').get).toBeTruthy()
  })

  test('attributes getter returns all attributes that will be added on the plugin DOM element', () => {
    expect(this.plugin.$el[0].className).toEqual('level-selector media-control__button media-control__elements')
  })

  test('have a getter called template', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'template').get).toBeTruthy()
  })

  describe('showList method', () => {
    test('removes level-selector__container--hidden CSS class from list element', () => {
      expect(this.plugin.$menu.classList.contains('level-selector__container--hidden')).toBeTruthy()

      this.plugin.showList()

      expect(this.plugin.$menu.classList.contains('level-selector__container--hidden')).toBeFalsy()
    })
  })

  describe('hideList method', () => {
    test('adds level-selector__container--hidden CSS class from list element', () => {
      this.plugin.showList()

      expect(this.plugin.$menu.classList.contains('level-selector__container--hidden')).toBeFalsy()

      this.plugin.hideList()

      expect(this.plugin.$menu.classList.contains('level-selector__container--hidden')).toBeTruthy()
    })
  })

  describe('render method', () => {
    test('calls cacheElements method', () => {
      jest.spyOn(this.plugin, 'cacheElements')
      this.plugin.render()

      expect(this.plugin.cacheElements).toHaveBeenCalledTimes(1)
    })
  })

  describe('cacheElements method', () => {
    test('saves important DOM elements locally', () => {
      this.plugin.render()

      expect(this.plugin.$menu).toEqual(this.plugin.el.querySelector('.level-selector__container'))
      expect(this.plugin.$levelsList).toEqual(this.plugin.el.querySelector('.level-selector__list'))
    })
  })
