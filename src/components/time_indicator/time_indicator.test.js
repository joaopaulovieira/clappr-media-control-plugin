import { Events, Core, Container, Playback, template } from '@clappr/core'
import TimeIndicatorPlugin, { DEFAULT_TIME } from './time_indicator'
import templateHTML from './public/template.html'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

Events.register('MEDIA_CONTROL_SEEK_BAR_START_DRAGGING')
Events.register('MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING')

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new TimeIndicatorPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('TimeIndicatorPlugin', function() {
  beforeEach(() => {
    jest.clearAllMocks()
    const response = setupTest({}, true)
    this.core = response.core
    this.container = response.container
    this.core.activeContainer = this.container
    this.plugin = response.plugin
  })

  test('is loaded on core plugins array', () => {
    expect(this.core.getPlugin(this.plugin.name).name).toEqual('time_indicator')
  })

  describe('layer getter', () => {
    test('overrides MediaControlComponentPlugin layer getter to return a valid value', () => {
      expect(this.plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(this.plugin.layer).toEqual(1)
    })

    test('is configurable via mediaControl.timeIndicatorComponent.layer config', () => {
      const { plugin } = setupTest({ mediaControl: { timeIndicatorComponent: { layer: 2 } } })

      expect(plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(plugin.layer).toEqual(2)
    })
  })

  describe('section getter', () => {
    test('overrides MediaControlComponentPlugin section getter to return a valid value', () => {
      expect(this.plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(this.plugin.section).toEqual(2)
    })

    test('is configurable via mediaControl.timeIndicatorComponent.section config', () => {
      const { plugin } = setupTest({ mediaControl: { timeIndicatorComponent: { section: 1 } } })

      expect(plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(plugin.section).toEqual(1)
    })
  })

  describe('position getter', () => {
    test('overrides MediaControlComponentPlugin position getter to return a valid value', () => {
      expect(this.plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(this.plugin.position).toEqual(2)
    })

    test('is configurable via mediaControl.timeIndicatorComponent.position config', () => {
      const { plugin } = setupTest({ mediaControl: { timeIndicatorComponent: { position: 3 } } })

      expect(plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(plugin.position).toEqual(3)
    })
  })

  describe('separator getter', () => {
    test('is configurable via mediaControl.timeIndicatorComponent.separator config', () => {
      const { plugin } = setupTest({ mediaControl: { timeIndicatorComponent: { separator: true } } })

      expect(plugin.separator).not.toEqual(MediaControlComponentPlugin.prototype.separator)
      expect(plugin.separator).toBeTruthy()
    })

    test('returns null value if is not configured with a valid value', () => {
      expect(this.plugin.separator).not.toEqual(MediaControlComponentPlugin.prototype.separator)
      expect(this.plugin.separator).toBeNull()
    })
  })

  test('have a getter called attributes', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'attributes').get).toBeTruthy()
  })

  test('attributes getter returns all attributes that will be added on the plugin DOM element', () => {
    expect(this.plugin.$el[0].className).toEqual('time-indicator media-control__elements')
  })

  test('have a getter called template', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'template').get).toBeTruthy()
  })

  test('template getter returns on template that will be added on the plugin DOM element', () => {
    expect(this.plugin.template({ defaultValue: DEFAULT_TIME })).toEqual(template(templateHTML)({ defaultValue: DEFAULT_TIME }))
  })

  test('have a getter called isLiveMedia', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'isLiveMedia').get).toBeTruthy()
  })

  test('isLiveMedia getter informs if the media is of the LIVE type', () => {
    expect(this.plugin.isLiveMedia).toBeFalsy()

    jest.spyOn(Playback.prototype, 'getPlaybackType').mockReturnValueOnce(Playback.LIVE)
    const { core, container, plugin } = setupTest({}, true)
    core.activeContainer = container

    expect(plugin.isLiveMedia).toBeTruthy()
  })

  test('have a getter called shouldDisableInteraction', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'shouldDisableInteraction').get).toBeTruthy()
  })

  test('shouldDisableInteraction getter informs if the plugin needs to be hide', () => {
    expect(this.plugin.shouldDisableInteraction).toBeFalsy()

    jest.spyOn(Playback.prototype, 'getPlaybackType').mockReturnValueOnce(Playback.LIVE)
    const { core, container, plugin } = setupTest({}, true)
    jest.spyOn(container, 'isDvrEnabled').mockReturnValueOnce(true)
    core.activeContainer = container

    expect(plugin.shouldDisableInteraction).toBeFalsy()

    jest.spyOn(Playback.prototype, 'getPlaybackType').mockReturnValueOnce(Playback.LIVE)
    jest.spyOn(container, 'isDvrEnabled').mockReturnValueOnce(false)

    expect(plugin.shouldDisableInteraction).toBeTruthy()
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.bindEvents()

      expect(this.plugin.stopListening).toHaveBeenCalled()
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(TimeIndicatorPlugin.prototype, 'onContainerChanged')
      const { core, plugin } = setupTest()
      core.trigger(Events.CORE_ACTIVE_CONTAINER_CHANGED)

      expect(plugin.onContainerChanged).toHaveBeenCalledTimes(1)
    })

    test('register onStartDraggingSeekBar method as callback for MEDIA_CONTROL_SEEK_BAR_START_DRAGGING custom event', () => {
      jest.spyOn(TimeIndicatorPlugin.prototype, 'onStartDraggingSeekBar')
      const { core, plugin } = setupTest()
      core.trigger(Events.Custom.MEDIA_CONTROL_SEEK_BAR_START_DRAGGING)

      expect(plugin.onStartDraggingSeekBar).toHaveBeenCalledTimes(1)
    })

    test('register onStopDraggingSeekBar method as callback for MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING custom event', () => {
      jest.spyOn(TimeIndicatorPlugin.prototype, 'onStopDraggingSeekBar')
      const { core, plugin } = setupTest()
      core.trigger(Events.Custom.MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING)

      expect(plugin.onStopDraggingSeekBar).toHaveBeenCalledTimes(1)
    })
  })

  describe('onContainerChanged method', () => {
    test('calls setInitialState method', () => {
      jest.spyOn(this.plugin, 'setInitialState')
      this.plugin.onContainerChanged()

      expect(this.plugin.setInitialState).toHaveBeenCalledTimes(1)
    })

    test('removes all listeners from old container reference', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.onContainerChanged()

      expect(this.plugin.stopListening).toHaveBeenCalledWith(this.container)
    })

    test('removes all listeners from old playback reference', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.onContainerChanged()

      expect(this.plugin.stopListening).toHaveBeenCalledWith(this.plugin.playback)
    })

    test('saves core.activeContainer reference locally', () => {
      this.plugin.onContainerChanged()

      expect(this.plugin.container).toEqual(this.core.activeContainer)
    })

    test('saves core.activePlayback reference locally', () => {
      this.plugin.onContainerChanged()

      expect(this.plugin.playback).toEqual(this.core.activePlayback)
    })

    test('calls bindPlaybackEvents method', () => {
      jest.spyOn(this.plugin, 'bindPlaybackEvents')
      this.plugin.onContainerChanged()

      expect(this.plugin.bindPlaybackEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('bindPlaybackEvents method', () => {
    test('avoid register callback for events on playback scope without a valid reference', () => {
      jest.spyOn(this.plugin, 'onFirstPlay')
      this.plugin.playback.trigger(Events.PLAYBACK_PLAY)

      expect(this.plugin.onFirstPlay).not.toHaveBeenCalled()
    })

    test('register onFirstPlay method as callback for PLAYBACK_PLAY event', () => {
      jest.spyOn(this.plugin, 'onFirstPlay')
      this.core.activeContainer = this.container
      this.plugin.playback.trigger(Events.PLAYBACK_PLAY)

      expect(this.plugin.onFirstPlay).toHaveBeenCalledTimes(1)
    })
  })

  describe('onFirstPlay callback', () => {
    test('adds time-indicator--disabled css class to DOM element plugin if shouldDisableInteraction getter returns true', () => {
      jest.spyOn(this.plugin, 'shouldDisableInteraction', 'get').mockReturnValueOnce(true)
      this.plugin.onFirstPlay()

      expect(this.plugin.$el[0].classList.contains('time-indicator--disabled')).toBeTruthy()
    })

    test('register onFirstPlay method as callback for CONTAINER_TIMEUPDATE event if shouldDisableInteraction getter returns false', () => {
      jest.spyOn(this.plugin, 'shouldDisableInteraction', 'get').mockReturnValueOnce(false)
      jest.spyOn(this.plugin, 'onTimeUpdate')
      this.core.activeContainer = this.container

      this.plugin.onFirstPlay()
      this.container.trigger(Events.CONTAINER_TIMEUPDATE)

      expect(this.plugin.onTimeUpdate).toHaveBeenCalledTimes(1)
    })
  })

  describe('onTimeUpdate callback', () => {
    beforeEach(() => {
      jest.spyOn(this.plugin, 'setPosition')
      jest.spyOn(this.plugin, 'setDuration')
    })

    test('avoids null returned values', () => {
      this.plugin.onTimeUpdate({ current: null, total: 100 })

      expect(this.plugin.setPosition).not.toHaveBeenCalled()
      expect(this.plugin.setDuration).not.toHaveBeenCalled()

      this.plugin.onTimeUpdate({ current: 100, total: null })

      expect(this.plugin.setPosition).not.toHaveBeenCalled()
      expect(this.plugin.setDuration).not.toHaveBeenCalled()
    })

    test('avoids update any data if _isDragging flag is truthy', () => {
      this.plugin._isDragging = true
      this.plugin.onTimeUpdate({ current: null, total: 100 })

      expect(this.plugin.setPosition).not.toHaveBeenCalled()
      expect(this.plugin.setDuration).not.toHaveBeenCalled()

      this.plugin._isDragging = false
    })

    test('generates time text based on callback response to add on DOM elements', () => {
      this.plugin.onTimeUpdate({ current: 1, total: 100 })

      expect(this.plugin.setPosition).toHaveBeenCalledWith('00:01')
      expect(this.plugin.setDuration).toHaveBeenCalledWith('01:40')
    })

    test('uses Math.floor to only set integer values', () => {
      this.plugin.onTimeUpdate({ current: 1.1111, total: 100.9134234 })

      expect(this.plugin.setPosition).toHaveBeenCalledWith('00:01')
      expect(this.plugin.setDuration).toHaveBeenCalledWith('01:40')
    })

    test('only updates position and duration time text if differs from current DOM element text value', () => {
      this.plugin.onTimeUpdate({ current: 0, total: 0 })

      expect(this.plugin.setPosition).not.toHaveBeenCalled()
      expect(this.plugin.setDuration).not.toHaveBeenCalled()

      this.plugin.onTimeUpdate({ current: 1, total: 100 })

      expect(this.plugin.setPosition).toHaveBeenCalledWith('00:01')
      expect(this.plugin.setDuration).toHaveBeenCalledWith('01:40')
      expect(this.plugin.setPosition).toHaveBeenCalledTimes(1)
      expect(this.plugin.setDuration).toHaveBeenCalledTimes(1)
    })
  })

  test('setPosition method inserts received position time text as textContent of position DOM element plugin', () => {
    const positionTimeText = '00:05'
    this.plugin.setPosition(positionTimeText)

    expect(this.plugin.$position.textContent).toEqual(positionTimeText)
  })

  test('setDuration method inserts received duration time text as textContent of duration DOM element plugin', () => {
    const durationTimeText = '00:05'
    this.plugin.setDuration(durationTimeText)

    expect(this.plugin.$duration.textContent).toEqual(durationTimeText)
  })

  describe('setInitialState method', () => {
    test('calls setPosition method with default time value', () => {
      jest.spyOn(this.plugin, 'setPosition')
      this.plugin.setInitialState()

      expect(this.plugin.setPosition).toHaveBeenCalledWith(DEFAULT_TIME)
    })

    test('calls setDuration method with default time value', () => {
      jest.spyOn(this.plugin, 'setDuration')
      this.plugin.setInitialState()

      expect(this.plugin.setDuration).toHaveBeenCalledWith(DEFAULT_TIME)
    })

    test('removes time-indicator--disabled css class to DOM element plugin', () => {
      this.plugin.setInitialState()

      expect(this.plugin.$el[0].classList.contains('time-indicator--disabled')).toBeFalsy()
    })
  })

  describe('onStartDraggingSeekBar method', () => {
    beforeEach(() => jest.spyOn(this.plugin, 'setPosition'))

    test('sets _isDragging flag to true', () => {
      expect(this.plugin._isDragging).toBeFalsy()

      this.plugin.onStartDraggingSeekBar({ event: { target: { value: 0 } } })

      expect(this.plugin._isDragging).toBeTruthy()
    })

    test('generates time text based on callback response to add on DOM elements', () => {
      this.plugin.onStartDraggingSeekBar({ event: { target: { value: 10 } } })

      expect(this.plugin.setPosition).toHaveBeenCalledWith('00:10')
    })

    test('uses Math.floor to only set integer values', () => {
      this.plugin.onStartDraggingSeekBar({ event: { target: { value: 10.234234235 } } })

      expect(this.plugin.setPosition).toHaveBeenCalledWith('00:10')
    })

    test('only updates position time text if differs from current DOM element text value', () => {
      this.plugin.onStartDraggingSeekBar({ event: { target: { value: 0 } } })

      expect(this.plugin.setPosition).not.toHaveBeenCalled()

      this.plugin.onStartDraggingSeekBar({ event: { target: { value: 10 } } })

      expect(this.plugin.setPosition).toHaveBeenCalledWith('00:10')
      expect(this.plugin.setPosition).toHaveBeenCalledTimes(1)
    })
  })

  describe('onStopDraggingSeekBar method', () => {
    test('sets _isDragging flag to false', () => {
      this.plugin.onStartDraggingSeekBar({ event: { target: { value: 0 } } })

      expect(this.plugin._isDragging).toBeTruthy()

      this.plugin.onStopDraggingSeekBar()

      expect(this.plugin._isDragging).toBeFalsy()
    })
  })

  describe('render method', () => {
    beforeEach(() => {
      jest.spyOn(this.plugin, 'render')
      jest.spyOn(this.plugin, 'cacheElements')

      this.plugin.isRendered = false
      this.plugin.render()
    })

    test('sets isRendered flag to true', () => {
      expect(this.plugin.isRendered).toBeTruthy()
    })

    test('creates cache elements to not have unnecessary re-render cycles', () => {
      expect(this.plugin.render).toHaveBeenCalledTimes(1)
      expect(this.plugin.cacheElements).toHaveBeenCalledTimes(1)

      this.plugin.render()

      expect(this.plugin.render).toHaveBeenCalledTimes(2)
      expect(this.plugin.cacheElements).toHaveBeenCalledTimes(1)
    })

    test('insert template getter response inside plugin DOM element', () => {
      expect(this.plugin.$el[0].innerHTML.includes(this.plugin.template({ defaultValue: DEFAULT_TIME }))).toBeTruthy()
    })

    test('calls cacheElements method', () => {
      expect(this.plugin.cacheElements).toHaveBeenCalledTimes(1)
    })
  })

  test('cacheElements method saves important DOM elements locally', () => {
    this.plugin.isRendered = false
    this.plugin.render()

    expect(this.plugin.$position).toEqual(this.plugin.el.querySelector('.time-indicator__position'))
    expect(this.plugin.$separator).toEqual(this.plugin.el.querySelector('.time-indicator__separator'))
    expect(this.plugin.$duration).toEqual(this.plugin.el.querySelector('.time-indicator__duration'))
  })
})
