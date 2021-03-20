import { Browser, Events, Core, Container, Playback } from '@clappr/core'
import SeekBarPlugin from './seek_bar'
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

  test('overrides MediaControlComponentPlugin layer getter to return a valid value', () => {
    expect(this.plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
    expect(this.plugin.layer).toEqual(1)
  })

  test('overrides MediaControlComponentPlugin section getter to return a valid value', () => {
    expect(this.plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
    expect(this.plugin.section).toEqual(2)
  })

  test('overrides MediaControlComponentPlugin position getter to return a valid value', () => {
    expect(this.plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
    expect(this.plugin.position).toEqual(1)
  })

  test('overrides MediaControlComponentPlugin tagName getter to define DOM plugin element as a button tag ', () => {
    expect(this.plugin.tagName).not.toEqual(MediaControlComponentPlugin.prototype.tagName)
    expect(this.plugin.el.tagName).toEqual('INPUT')
  })

  test('have a getter called attributes', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'attributes').get).toBeTruthy()
  })

  test('attributes getter returns all attributes that will be added on the plugin DOM element', () => {
    expect(this.plugin.$el[0].className).toEqual('seek-bar media-control__elements')
    expect(this.plugin.$el[0].type).toEqual('range')
    expect(this.plugin.$el[0].value).toEqual('0')
    expect(this.plugin.$el[0].max).toEqual('100')
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
    test('removes all listeners from old container reference', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.onContainerChanged()

      expect(this.plugin.stopListening).toHaveBeenCalledWith(this.container)
    })

    test('saves core.activeContainer reference locally', () => {
      this.plugin.onContainerChanged()

      expect(this.plugin.container).toEqual(this.core.activeContainer)
    })

    test('calls bindContainerEvents method', () => {
      jest.spyOn(this.plugin, 'bindContainerEvents')
      this.plugin.onContainerChanged()

      expect(this.plugin.bindContainerEvents).toHaveBeenCalledTimes(1)
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
      jest.spyOn(this.plugin, 'onTimeUpdate')
      this.container.trigger(Events.CONTAINER_TIMEUPDATE)

      expect(this.plugin.onTimeUpdate).not.toHaveBeenCalled()
    })

    test('register onTimeUpdate method as callback for CONTAINER_TIMEUPDATE event', () => {
      jest.spyOn(this.plugin, 'onTimeUpdate')
      this.core.activeContainer = this.container
      this.container.trigger(Events.CONTAINER_TIMEUPDATE)

      expect(this.plugin.onTimeUpdate).toHaveBeenCalledTimes(1)
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
})
