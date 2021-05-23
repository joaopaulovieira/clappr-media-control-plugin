import { Browser, Events, Core, Container, Playback } from '@clappr/core'
import SeekBarPlugin, { INITIAL_POSITION, INITIAL_DURATION } from './seek_bar'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new SeekBarPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('SeekBarPlugin', function() {
  beforeEach(() => {
    jest.clearAllMocks()
    const response = setupTest({}, true)
    this.core = response.core
    this.container = response.container
    this.core.activeContainer = this.container
    this.playback = this.container.playback
    this.plugin = response.plugin
  })

  test('is loaded on core plugins array', () => {
    expect(this.core.getPlugin(this.plugin.name).name).toEqual('seek_bar')
  })

  describe('layer getter', () => {
    test('overrides MediaControlComponentPlugin layer getter to return a valid value', () => {
      expect(this.plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(this.plugin.layer).toEqual(1)
    })

    test('is configurable via mediaControl.seekBarComponent.layer config', () => {
      const { plugin } = setupTest({ mediaControl: { seekBarComponent: { layer: 2 } } })

      expect(plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(plugin.layer).toEqual(2)
    })
  })

  describe('section getter', () => {
    test('overrides MediaControlComponentPlugin section getter to return a valid value', () => {
      expect(this.plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(this.plugin.section).toEqual(2)
    })

    test('is configurable via mediaControl.seekBarComponent.section config', () => {
      const { plugin } = setupTest({ mediaControl: { seekBarComponent: { section: 1 } } })

      expect(plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(plugin.section).toEqual(1)
    })
  })

  describe('position getter', () => {
    test('overrides MediaControlComponentPlugin position getter to return a valid value', () => {
      expect(this.plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(this.plugin.position).toEqual(1)
    })

    test('is configurable via mediaControl.seekBarComponent.position config', () => {
      const { plugin } = setupTest({ mediaControl: { seekBarComponent: { position: 3 } } })

      expect(plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(plugin.position).toEqual(3)
    })
  })

  describe('separator getter', () => {
    test('is configurable via mediaControl.seekBarComponent.separator config', () => {
      const { plugin } = setupTest({ mediaControl: { seekBarComponent: { separator: true } } })

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
    expect(this.plugin.$el[0].className).toEqual('seek-bar seek-bar--disable-interaction media-control__elements')
    expect(this.plugin.$el[0].type).toEqual('range')
    expect(this.plugin.$el[0].value).toEqual(`${INITIAL_POSITION}`)
    expect(this.plugin.$el[0].max).toEqual(`${INITIAL_DURATION}`)
  })

  test('have a getter called events', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'events').get).toBeTruthy()
  })

  describe('events getter', () => {
    test('returns specific events/callbacks dictionary for mobile devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = true
      expect(this.plugin.events).toEqual({
        touchend: this.plugin.seek,
        touchmove: this.plugin.updateProgressBarViaInteraction,
      })
      Browser.isMobile = oldValue
    })

    test('returns specific events/callbacks dictionary for desktop devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = false
      expect(this.plugin.events).toEqual({
        click: this.plugin.seek,
        input: this.plugin.updateProgressBarViaInteraction,
      })
      Browser.isMobile = oldValue
    })
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

  test('shouldDisableInteraction getter informs if the plugin needs to be static', () => {
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

  describe('constructor', () => {
    test('register MEDIA_CONTROL_SEEK_BAR_START_DRAGGING custom event to trigger on core scope', () => {
      expect(Events.Custom.MEDIA_CONTROL_SEEK_BAR_START_DRAGGING).toBeDefined()
    })

    test('register MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING custom event to trigger on core scope', () => {
      expect(Events.Custom.MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING).toBeDefined()
    })

    test('sets _isDragging internal flag as falsy', () => {
      expect(this.plugin._isDragging).toBeFalsy()
    })
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.bindEvents()

      expect(this.plugin.stopListening).toHaveBeenCalled()
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(SeekBarPlugin.prototype, 'onContainerChanged')
      const { core, plugin } = setupTest()
      core.trigger(Events.CORE_ACTIVE_CONTAINER_CHANGED)

      expect(plugin.onContainerChanged).toHaveBeenCalledTimes(1)
    })
  })

  describe('onContainerChanged method', () => {
    test('calls setDefaultProperties method', () => {
      jest.spyOn(this.plugin, 'setDefaultProperties')
      this.plugin.onContainerChanged()

      expect(this.plugin.setDefaultProperties).toHaveBeenCalledTimes(1)
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

    test('calls bindContainerEvents method', () => {
      jest.spyOn(this.plugin, 'bindContainerEvents')
      this.plugin.onContainerChanged()

      expect(this.plugin.bindContainerEvents).toHaveBeenCalledTimes(1)
    })

    test('calls bindPlaybackEvents method', () => {
      jest.spyOn(this.plugin, 'bindPlaybackEvents')
      this.plugin.onContainerChanged()

      expect(this.plugin.bindPlaybackEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('bindContainerEvents method', () => {
    test('only unbind events when is necessary', () => {
      jest.spyOn(this.plugin, 'stopListening')

      this.plugin.container = null
      this.core.activeContainer = this.container
      const oldContainer = { ...this.container }

      expect(this.plugin.stopListening).not.toHaveBeenCalledWith(this.container)

      this.core.activeContainer = this.container

      expect(this.plugin.stopListening).toHaveBeenCalledWith(oldContainer)
    })

    test('avoid register callback for events on container scope without a valid reference', () => {
      jest.spyOn(this.plugin, 'onContainerProgress')
      this.container.trigger(Events.CONTAINER_PROGRESS)

      expect(this.plugin.onContainerProgress).not.toHaveBeenCalled()
    })

    test('register onContainerProgress method as callback for CONTAINER_PROGRESS event', () => {
      jest.spyOn(this.plugin, 'onContainerProgress')
      this.core.activeContainer = this.container
      this.container.trigger(Events.CONTAINER_PROGRESS)

      expect(this.plugin.onContainerProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('onTimeUpdate callback', () => {
    beforeEach(() => {
      jest.spyOn(this.plugin, 'updatePosition')
      jest.spyOn(this.plugin, 'updateDuration')
    })

    test('avoids execute internal code if _isDragging flag is truthy', () => {
      this.plugin._isDragging = true
      this.plugin.onTimeUpdate({ current: 1, total: 50 })

      expect(this.plugin.updatePosition).not.toHaveBeenCalled()
      expect(this.plugin.updateDuration).not.toHaveBeenCalled()
    })

    test('uses Math.floor to only set integer values', () => {
      this.plugin.onTimeUpdate({ current: 1.1111, total: 50.9134234 })

      expect(this.plugin.updatePosition).toHaveBeenCalledWith(1, 50)
      expect(this.plugin.updateDuration).toHaveBeenCalledWith(50)
    })

    test('only updates position and duration value if differs from current DOM element value', () => {
      this.plugin.onTimeUpdate({ current: 0, total: 100 })

      expect(this.plugin.updatePosition).not.toHaveBeenCalled()
      expect(this.plugin.updateDuration).not.toHaveBeenCalled()

      this.plugin.onTimeUpdate({ current: 1, total: 50 })

      expect(this.plugin.updatePosition).toHaveBeenCalledWith(1, 50)
      expect(this.plugin.updateDuration).toHaveBeenCalledWith(50)
      expect(this.plugin.updatePosition).toHaveBeenCalledTimes(1)
      expect(this.plugin.updateDuration).toHaveBeenCalledTimes(1)
    })
  })

  describe('updatePosition method', () => {
    test('avoids execute internal code if _isDragging flag is truthy', () => {
      this.plugin._isDragging = true
      this.plugin.updatePosition(1, 50)

      expect(this.plugin.$el[0].value).not.toEqual('1')
    })

    test('adds received position value as value property of DOM element plugin', () => {
      this.plugin.updatePosition(1, 50)

      expect(this.plugin.$el[0].value).toEqual('1')
    })

    test('adds the ratio of received position and duration values as --seek-before-width style property of DOM element plugin', () => {
      this.plugin.updatePosition(20, 200)

      expect(getComputedStyle(this.plugin.$el[0]).getPropertyValue('--seek-before-width')).toEqual('10%')
    })
  })

  describe('updateDuration method', () => {
    test('avoids execute internal code if _isDragging flag is truthy', () => {
      this.plugin._isDragging = true
      this.plugin.updateDuration(50)

      expect(this.plugin.$el[0].max).not.toEqual('50')
    })

    test('adds received duration value as max property of DOM element plugin', () => {
      this.plugin.updateDuration(50)

      expect(this.plugin.$el[0].max).toEqual('50')
    })
  })

  describe('onContainerProgress callback', () => {
    test('uses Math.floor to only set integer values', () => {
      jest.spyOn(this.plugin, 'updateBufferedBar')
      this.plugin.onContainerProgress({ current: 1.1111, total: 50.9134234 })

      expect(this.plugin.updateBufferedBar).toHaveBeenCalledWith(1, 50)
    })
  })

  describe('updateBufferedBar method', () => {
    test('adds the ratio of progress.current and progress.total values as --buffered-width style property of DOM element plugin', () => {
      this.plugin.updateBufferedBar(20, 200)

      expect(getComputedStyle(this.plugin.$el[0]).getPropertyValue('--buffered-width')).toEqual('10%')
    })
  })

  describe('bindPlaybackEvents method', () => {
    test('avoid register callback for events on playback scope without a valid reference', () => {
      jest.spyOn(this.plugin, 'onFirstPlay')
      this.playback.trigger(Events.PLAYBACK_PLAY)

      expect(this.plugin.onFirstPlay).not.toHaveBeenCalled()
    })

    test('register onFirstPlay method as callback for PLAYBACK_PLAY event', () => {
      jest.spyOn(this.plugin, 'onFirstPlay')
      this.core.activeContainer = this.container
      this.playback.trigger(Events.PLAYBACK_PLAY)

      expect(this.plugin.onFirstPlay).toHaveBeenCalledTimes(1)
    })
  })

  describe('onFirstPlay callback', () => {
    test('removes seek-bar--disable-interaction css class to DOM element plugin if shouldDisableInteraction getter returns false', () => {
      jest.spyOn(this.plugin, 'shouldDisableInteraction', 'get').mockReturnValueOnce(true)
      this.plugin.onFirstPlay()

      expect(this.plugin.$el[0].classList.contains('seek-bar--disable-interaction')).toBeTruthy()
    })

    test('register onFirstPlay method as callback for CONTAINER_TIMEUPDATE event if shouldDisableInteraction getter returns false', () => {
      jest.spyOn(this.plugin, 'shouldDisableInteraction', 'get').mockReturnValueOnce(false)
      jest.spyOn(this.plugin, 'onTimeUpdate')
      this.core.activeContainer = this.container

      this.plugin.onFirstPlay()
      this.container.trigger(Events.CONTAINER_TIMEUPDATE)

      expect(this.plugin.onTimeUpdate).toHaveBeenCalledTimes(1)
    })

    test('sets full filled seek bar if shouldDisableInteraction getter returns true', () => {
      jest.spyOn(this.plugin, 'shouldDisableInteraction', 'get').mockReturnValueOnce(true)
      this.core.activeContainer = this.container
      this.plugin.onFirstPlay()

      expect(this.plugin.$el[0].value).toEqual(this.plugin.$el[0].max)
      expect(getComputedStyle(this.plugin.$el[0]).getPropertyValue('--seek-before-width')).toEqual(`${this.plugin.$el[0].value}%`)
    })
  })

  describe('updateProgressBarViaInteraction method', () => {
    test('avoids execute internal code if shouldDisableInteraction getter returns true', () => {
      this.plugin._isDragging = false
      jest.spyOn(this.plugin, 'shouldDisableInteraction', 'get').mockReturnValueOnce(true)
      this.plugin.updateProgressBarViaInteraction({ target: { value: 20, max: 200 } })

      expect(this.plugin._isDragging).toBeFalsy()
    })

    test('sets true value if _isDragging flag is falsy', () => {
      this.plugin._isDragging = false
      this.plugin.updateProgressBarViaInteraction({ target: { value: 20, max: 200 } })

      expect(this.plugin._isDragging).toBeTruthy()
    })

    test('adds the ratio of event.target.value and event.target.max values as --seek-before-width style property of DOM element plugin', () => {
      this.plugin.updateProgressBarViaInteraction({ target: { value: 20, max: 200 } })

      expect(getComputedStyle(this.plugin.$el[0]).getPropertyValue('--seek-before-width')).toEqual('10%')
    })

    test('triggers MEDIA_CONTROL_SEEK_BAR_START_DRAGGING custom event', () => {
      const cb = jest.fn()
      this.plugin.listenToOnce(this.core, Events.Custom.MEDIA_CONTROL_SEEK_BAR_START_DRAGGING, cb)
      this.plugin.updateProgressBarViaInteraction({ target: { value: 20, max: 200 } })

      expect(cb).toHaveBeenCalledWith({ event: { target: { value: 20, max: 200 } } })
    })
  })

  describe('seek method', () => {
    test('avoids execute internal code if shouldDisableInteraction getter returns true', () => {
      jest.spyOn(this.container, 'seekPercentage')
      jest.spyOn(this.plugin, 'shouldDisableInteraction', 'get').mockReturnValueOnce(true)
      this.plugin.seek({ target: { value: 20, max: 200 } })

      expect(this.container.seekPercentage).not.toHaveBeenCalled()
    })

    test('adds the ratio of event.target.value and event.target.max values as --seek-before-width style property of DOM element plugin', () => {
      this.plugin.seek({ target: { value: 20, max: 200 } })

      expect(getComputedStyle(this.plugin.$el[0]).getPropertyValue('--seek-before-width')).toEqual('10%')
    })

    test('calls container.seekPercentage with the ratio of event.target.value and event.target.max values', () => {
      jest.spyOn(this.container, 'seekPercentage')
      this.plugin.seek({ target: { value: 20, max: 200 } })

      expect(this.container.seekPercentage).toHaveBeenCalledWith(10)
    })

    test('sets false value if _isDragging flag', () => {
      this.plugin._isDragging = true
      this.plugin.seek({ target: { value: 20, max: 200 } })

      expect(this.plugin._isDragging).toBeFalsy()
    })

    test('triggers MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING custom event', () => {
      const cb = jest.fn()
      this.plugin.listenToOnce(this.core, Events.Custom.MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING, cb)
      this.plugin.seek({ target: { value: 20, max: 200 } })

      expect(cb).toHaveBeenCalledWith({ event: { target: { value: 20, max: 200 } } })
    })
  })

  describe('render method', () => {
    beforeEach(() => {
      jest.spyOn(this.plugin, 'render')
      jest.spyOn(this.plugin.$el, 'append')

      this.plugin.isRendered = false
      this.plugin.render()
    })

    test('avoid unnecessary re-render cycles', () => {
      expect(this.plugin.render).toHaveBeenCalledTimes(1)
      expect(this.plugin.$el.append).toHaveBeenCalledTimes(1)

      this.plugin.render()

      expect(this.plugin.render).toHaveBeenCalledTimes(2)
      expect(this.plugin.$el.append).toHaveBeenCalledTimes(1)
    })

    test('sets isRendered flag to true', () => {
      expect(this.plugin.isRendered).toBeTruthy()
    })
  })

  describe('setDefaultProperties method', () => {
    test('sets INITIAL_POSITION as seek bar current position', () => {
      this.plugin.setDefaultProperties()

      expect(this.plugin.$el[0].value).toEqual(`${INITIAL_POSITION}`)
    })

    test('sets INITIAL_DURATION as seek bar max value', () => {
      this.plugin.setDefaultProperties()

      expect(this.plugin.$el[0].max).toEqual(`${INITIAL_DURATION}`)
    })

    test('adds seek-bar--disable-interaction css class to DOM element plugin', () => {
      this.plugin.setDefaultProperties()

      expect(this.plugin.$el[0].classList.contains('seek-bar--disable-interaction')).toBeTruthy()
    })
  })
})
