import { Events, Core, Container, Playback } from '@clappr/core'
import TimeIndicatorPlugin from './time_indicator'
import templateHTML from './public/template.html'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

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
    expect(this.plugin.position).toEqual(2)
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
    expect(this.plugin.template()).toEqual(templateHTML)
  })

  test('have a getter called defaultTime', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'defaultTime').get).toBeTruthy()
  })

  test('defaultTime getter returns the default string that will be added on the plugin DOM element', () => {
    expect(this.plugin.template()).toEqual(templateHTML)
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

    test('register onContainerDestroyed method as callback for CONTAINER_DESTROYED event', () => {
      jest.spyOn(this.plugin, 'onContainerDestroyed')
      this.core.activeContainer = this.container
      this.container.trigger(Events.CONTAINER_DESTROYED)

      expect(this.plugin.onContainerDestroyed).toHaveBeenCalledTimes(1)
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

  describe('onContainerDestroyed method', () => {
    test('calls setPosition method with defaultTime getter value', () => {
      jest.spyOn(this.plugin, 'setPosition')
      this.plugin.onContainerDestroyed()

      expect(this.plugin.setPosition).toHaveBeenCalledWith(this.plugin.defaultTime)
    })
    test('calls setDuration method with defaultTime getter value', () => {
      jest.spyOn(this.plugin, 'setDuration')
      this.plugin.onContainerDestroyed()

      expect(this.plugin.setDuration).toHaveBeenCalledWith(this.plugin.defaultTime)
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

    test('insert template getter response inside plugin DOM element', () => {
      expect(this.plugin.$el[0].innerHTML.includes(this.plugin.template())).toBeTruthy()
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
