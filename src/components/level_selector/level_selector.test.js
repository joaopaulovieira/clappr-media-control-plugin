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

const levelsMock = [{ id: 0, label: 'low' }, { id: 1, label: 'medium' }, { id: 2, label: 'high' }]

const mp4Levels = [
  { id: 0, label: 'low', source: 'http://xpto.com/videos/low/media.mp4' },
  { id: 1, label: 'medium', source: 'http://xpto.com/videos/medium/media.mp4' },
  { id: 2, label: 'high', source: 'http://xpto.com/videos/high/media.mp4', default: true },
]

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

  test('have a getter called hasMP4Levels', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'hasMP4Levels').get).toBeTruthy()
  })

  test('hasMP4Levels getter checks if a valid mediaControl.levelSelectorComponent.mp4Levels config exists', () => {
    const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { mp4Levels: [{ id: 0, source: 'http://xpto.com/videos/media.mp4' }] } } })
    expect(plugin.hasMP4Levels).toBeTruthy()
  })

  test('have a getter called events', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'events').get).toBeTruthy()
  })

  describe('events getter', () => {
    test('returns specific events/callbacks dictionary for mobile devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = true
      expect(this.plugin.events).toEqual({ 'click .level-selector__list-item': this.plugin.onLevelSelect, click: this.plugin.showList })
      Browser.isMobile = oldValue
    })

    test('returns specific events/callbacks dictionary for desktop devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = false
      expect(this.plugin.events).toEqual({
        'click .level-selector__list-item': this.plugin.onLevelSelect,
        mouseenter: this.plugin.showList,
        mouseleave: this.plugin.hideList,
      })
      Browser.isMobile = oldValue
    })

    test('returns specific events/callbacks dictionary if mediaControl.levelSelectorComponent.onlyShowWithClick config is true', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { onlyShowWithClick: true } } })

      expect(plugin.events).toEqual({ 'click .level-selector__list-item': plugin.onLevelSelect, click: plugin.showList })
    })
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.bindEvents()

      expect(this.plugin.stopListening).toHaveBeenCalled()
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(LevelSelectorPlugin.prototype, 'onContainerChanged')
      const { core, plugin } = setupTest()
      core.trigger(Events.CORE_ACTIVE_CONTAINER_CHANGED)

      expect(plugin.onContainerChanged).toHaveBeenCalledTimes(1)
    })

    test('calls bindCustomEvents method', () => {
      jest.spyOn(this.plugin, 'bindCustomEvents')
      this.plugin.bindEvents()

      expect(this.plugin.bindCustomEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('onContainerChanged method', () => {
    test('removes all listeners from old playback reference', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.onContainerChanged()

      expect(this.plugin.stopListening).toHaveBeenCalledWith(this.playback)
    })

    test('saves core.activePlayback reference locally', () => {
      this.plugin.onContainerChanged()

      expect(this.plugin.playback).toEqual(this.core.activePlayback)
    })

    test('calls fillLevels with mediaControl.levelSelectorComponent.mp4Levels if hasMP4Levels getter returns true', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { mp4Levels: [{ id: 0, source: 'http://xpto.com/videos/media.mp4' }] } } })
      jest.spyOn(plugin, 'fillLevels').mockImplementationOnce(() => {})
      plugin.onContainerChanged()

      expect(plugin.fillLevels).toHaveBeenCalledTimes(1)
      expect(plugin.fillLevels).toHaveBeenCalledWith(plugin.config.mp4Levels)
    })

    test('calls bindPlaybackEvents with plugin.playback.levels if hasMP4Levels getter returns false', () => {
      jest.spyOn(this.plugin, 'bindPlaybackEvents').mockImplementationOnce(() => {})
      this.plugin.onContainerChanged()

      expect(this.plugin.bindPlaybackEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('bindPlaybackEvents method', () => {
    test('avoid register callback for events on playback scope without a valid reference', () => {
      jest.spyOn(this.plugin, 'fillLevels')
      this.playback.trigger(Events.PLAYBACK_LEVELS_AVAILABLE)

      expect(this.plugin.fillLevels).not.toHaveBeenCalled()
    })

    test('register fillLevels method as callback for PLAYBACK_LEVELS_AVAILABLE event', () => {
      jest.spyOn(this.plugin, 'fillLevels').mockImplementationOnce(() => {})
      this.core.activeContainer = this.container
      this.playback.trigger(Events.PLAYBACK_LEVELS_AVAILABLE)

      expect(this.plugin.fillLevels).toHaveBeenCalledTimes(1)
    })

    test('calls fillLevels with plugin.playback.levels if plugin.playback.levels array length is greater than 0', () => {
      const { plugin, core, container } = setupTest({}, true)
      core.activeContainer = container
      core.activePlayback.levels = [{ id: 0, label: 'low' }]
      jest.spyOn(plugin, 'fillLevels').mockImplementationOnce(() => {})
      plugin.onContainerChanged()

      expect(plugin.fillLevels).toHaveBeenCalledTimes(1)
      expect(plugin.fillLevels).toHaveBeenCalledWith([{ id: 0, label: 'low' }])
    })
  })

  describe('fillLevels function', () => {
    test('stores received levels on internal reference', () => {
      this.plugin.fillLevels(levelsMock)

      expect(this.plugin.levels).toEqual(levelsMock)
    })

    test('calls mediaControl.levelSelectorComponent.onLevelsAvailable method with plugin.levels if is configured', () => {
      const {
        plugin,
        core,
        container,
      } = setupTest({ mediaControl: { levelSelectorComponent: { onLevelsAvailable: levels => levels.reverse() } } }, true)
      core.activeContainer = container
      core.activePlayback.levels = levelsMock

      plugin.fillLevels(levelsMock)

      expect(plugin.levels).toEqual(levelsMock.reverse())
    })

    test('calls setCustomLabels with plugin.levels', () => {
      jest.spyOn(this.plugin, 'setCustomLabels').mockImplementationOnce(() => {})
      this.plugin.fillLevels(levelsMock)

      expect(this.plugin.setCustomLabels).toHaveBeenCalledTimes(1)
      expect(this.plugin.setCustomLabels).toHaveBeenCalledWith(this.plugin.levels)
    })

    test('calls render method', () => {
      jest.spyOn(this.plugin, 'render').mockImplementationOnce(() => {})
      this.plugin.fillLevels(levelsMock)

      expect(this.plugin.render).toHaveBeenCalledTimes(1)
    })

    test('stores updateMP4CurrentLevel method response on _currentLevel if hasMP4Levels returns true', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { mp4Levels: [{ id: 0, source: 'http://xpto.com/videos/media.mp4' }] } } })
      jest.spyOn(plugin, 'updateMP4CurrentLevel').mockReturnValueOnce([])
      plugin.fillLevels(levelsMock)

      expect(plugin._currentLevel).toEqual([])
    })

    test('stores on _currentLevel the list item with id property equals to plugin.playback.currentLevel if hasMP4Levels returns false', () => {
      const expectTemplate = '<li id="1" class="level-selector__list-item level-selector__list-item--current">medium</li>'
      this.plugin.playback.currentLevel = 1
      this.plugin.fillLevels(levelsMock)

      expect(this.plugin._currentLevel.outerHTML).toEqual(expectTemplate)
    })

    test('adds CSS class thats apply style for current level on _currentLevel element if exits', () => {
      this.plugin.playback.currentLevel = 2
      this.plugin.fillLevels(levelsMock)

      expect(this.plugin._currentLevel.classList.contains('level-selector__list-item--current')).toBeTruthy()
    })
  })

  describe('setCustomLabels method', () => {
    test('customizes level label if mediaControl.levelSelectorComponent.labels is configured', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { labels: { 0: '120kbps', 1: '240kbps', 2: '500kbps' } } } })
      const levelsWithCustomizedLabels = [...levelsMock]
      plugin.setCustomLabels(levelsWithCustomizedLabels)

      expect(levelsWithCustomizedLabels).toEqual([{ id: 0, label: '120kbps' }, { id: 1, label: '240kbps' }, { id: 2, label: '500kbps' }])
    })
  })

  describe('updateMP4CurrentLevel method', () => {
    test('returns the list item with id equals to level configured on mp4Levels config with the default property', () => {
      const { plugin } = setupTest({ mediaControl: { levelSelectorComponent: { mp4Levels } } })
      const expectTemplate = '<li id="2" class="level-selector__list-item level-selector__list-item--current">high</li>'
      plugin.fillLevels(mp4Levels)

      expect(plugin._currentLevel.outerHTML).toEqual(expectTemplate)
    })
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

  describe('onLevelSelect callback', () => {
    beforeEach(() => {
      this.plugin.playback.currentLevel = 1
      this.plugin.fillLevels(levelsMock)
    })

    test('returns a delayed call of hideList method if the target of the click event has the same id as the current level', () => {
      jest.useFakeTimers()
      const { plugin, core, container } = setupTest({}, true)
      core.activeContainer = container
      jest.spyOn(plugin, 'hideList')
      plugin.playback.currentLevel = 1
      plugin.fillLevels(levelsMock)
      plugin.onLevelSelect({ target: { id: '1' } })
      jest.advanceTimersByTime(1)

      expect(plugin.hideList).toHaveBeenCalledTimes(1)
    })

    test('updates _currentLevel reference', () => {
      expect(this.plugin._currentLevel.id).toEqual('1')

      this.plugin.onLevelSelect({ target: this.plugin.$levelsList.childNodes[7], stopPropagation: () => {} })

      expect(this.plugin._currentLevel.id).toEqual('2')
    })

    test('updates style for current level element', () => {
      expect(this.plugin._currentLevel.classList.contains('level-selector__list-item--current')).toBeTruthy()
      expect(this.plugin._currentLevel.id).toEqual('1')

      this.plugin.onLevelSelect({ target: this.plugin.$levelsList.childNodes[7], stopPropagation: () => {} })

      expect(this.plugin._currentLevel.classList.contains('level-selector__list-item--current')).toBeTruthy()
      expect(this.plugin._currentLevel.id).toEqual('2')
    })

    test('updates plugin.playback.currentLevel value', () => {
      this.plugin.onLevelSelect({ target: this.plugin.$levelsList.childNodes[7], stopPropagation: () => {} })

      expect(this.plugin.playback.currentLevel).toEqual(2)
    })

    test('calls updateMP4Source method if hasMP4Levels getter returns true', () => {
      const { plugin, core, container } = setupTest({ mediaControl: { levelSelectorComponent: { mp4Levels } } }, true)
      jest.spyOn(plugin, 'updateMP4Source').mockImplementation(() => {})
      core.activeContainer = container
      plugin.onLevelSelect({ target: plugin.$levelsList.childNodes[3], stopPropagation: () => {} })

      expect(plugin.updateMP4Source).toHaveBeenCalledTimes(1)
    })

    test('returns a delayed call of hideList method', () => {
      jest.useFakeTimers()
      const { plugin, core, container } = setupTest({}, true)
      core.activeContainer = container
      jest.spyOn(plugin, 'hideList')
      plugin.playback.currentLevel = 1
      plugin.fillLevels(levelsMock)
      plugin.onLevelSelect({ target: plugin.$levelsList.childNodes[7], stopPropagation: () => {} })

      expect(plugin.hideList).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1)

      expect(plugin.hideList).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateMP4Source method', () => {
    test('updates video source with selected level', () => {
      const { plugin, core, container } = setupTest({ source: 'http://xpto.com/videos/high/media.mp4', mediaControl: { levelSelectorComponent: { mp4Levels } } }, true)
      core.activeContainer = container
      plugin.playback.$el[0].load = source => { plugin.playback.$el[0].src = source }
      plugin.onLevelSelect({ target: plugin.$levelsList.childNodes[3], stopPropagation: () => {} })

      expect(plugin.playback.$el[0].src).toEqual('http://xpto.com/videos/medium/media.mp4')
    })

    test('plays the media after the PLAYBACK_LOADEDMETADATA event is triggered', () => {
      const { plugin, core, container } = setupTest({ source: 'http://xpto.com/videos/high/media.mp4', mediaControl: { levelSelectorComponent: { mp4Levels } } }, true)
      core.activeContainer = container
      plugin.playback.$el[0].load = source => { plugin.playback.$el[0].src = source }
      jest.spyOn(plugin.playback, 'play')
      plugin.playback._setupSrc = () => {} // mock HTML5Playback implementation
      plugin.onLevelSelect({ target: plugin.$levelsList.childNodes[3], stopPropagation: () => {} })

      plugin.playback.trigger(Events.PLAYBACK_LOADEDMETADATA)

      expect(plugin.playback.play).toHaveBeenCalledTimes(1)
    })
  })

  describe('render method', () => {
    test('insert template getter response inside plugin DOM element', () => {
      this.plugin.render()
      expect(this.plugin.$el[0].firstElementChild.outerHTML).toEqual(this.plugin.template({ levels: [], hasMP4Levels: false }))

      const { plugin, core, container } = setupTest({ source: 'http://xpto.com/videos/high/media.mp4', mediaControl: { levelSelectorComponent: { mp4Levels } } }, true)
      core.activeContainer = container
      plugin.render()

      expect(plugin.$el[0].firstElementChild.outerHTML).toEqual(plugin.template({ levels: mp4Levels, hasMP4Levels: true }))

      const { plugin: plugin1, core: core1, container: container1 } = setupTest({}, true)

      core1.activeContainer = container1
      plugin1.fillLevels(levelsMock)

      expect(plugin1.$el[0].firstElementChild.outerHTML).toEqual(plugin1.template({ levels: levelsMock, hasMP4Levels: false }))
    })

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

  describe('destroy method', () => {
    test('removes click listener on document', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      jest.spyOn(plugin, 'hideList').mockImplementation(() => cb)
      plugin.destroy()
      document.dispatchEvent(new Event('click'))

      expect(cb).not.toHaveBeenCalled()
    })
  })
})
