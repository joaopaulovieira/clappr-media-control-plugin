import { Events, Core, Container, Playback, version } from '@clappr/core'
import MediaControlPlugin from './media_control'
import defaultTemplate from './public/default_template.html'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new MediaControlPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('MediaControl Plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('is loaded on core plugins array', () => {
    const { core, plugin } = setupTest()
    expect(core.getPlugin(plugin.name).name).toEqual('media_control')
  })

  test('is compatible with the latest Clappr core version', () => {
    const { core, plugin } = setupTest()
    expect(core.getPlugin(plugin.name).supportedVersion).toEqual({ min: version })
  })

  test('have a getter called attributes', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'attributes').get).toBeTruthy()
  })

  test('attributes getter returns all attributes that will be added on the plugin DOM element', () => {
    const { plugin } = setupTest()
    expect(plugin.$el[0].className).toEqual('media-control')
  })

  test('have a getter called defaultTemplate', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'defaultTemplate').get).toBeTruthy()
  })

  test('defaultTemplate getter returns on template that will be added on the plugin DOM element', () => {
    const { plugin } = setupTest()
    expect(plugin.defaultTemplate()).toEqual(defaultTemplate)
  })

  test('have a getter called config', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'config').get).toBeTruthy()
  })

  test('config getter returns the options.mediaControl', () => {
    const { plugin } = setupTest({ mediaControl: { disableBeforeVideoStarts: true } })
    expect(plugin.config).toEqual(plugin.options.mediaControl)
  })

  test('have a getter called disableBeforeVideoStarts', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'disableBeforeVideoStarts').get).toBeTruthy()
  })

  test('disableBeforeVideoStarts getter returns the options.mediaControl.disableBeforeVideoStarts config', () => {
    const { plugin } = setupTest({ mediaControl: { disableBeforeVideoStarts: true } })
    expect(plugin.disableBeforeVideoStarts).toEqual(plugin.options.mediaControl.disableBeforeVideoStarts)
  })

  test('constructor hides plugin adding CSS class if options.mediaControl.disableBeforeVideoStarts config is true', () => {
    const { plugin } = setupTest({ mediaControl: { disableBeforeVideoStarts: true } })
    expect(plugin.$el[0].className).toEqual('media-control media-control--hide')
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'stopListening')
      plugin.bindEvents()

      expect(plugin.stopListening).toHaveBeenCalled()
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(MediaControlPlugin.prototype, 'onContainerChanged')
      const { core, plugin } = setupTest()
      core.trigger(Events.CORE_ACTIVE_CONTAINER_CHANGED)

      expect(plugin.onContainerChanged).toHaveBeenCalledTimes(1)
    })

    test('register show method as callback for CORE_MOUSE_MOVE event', () => {
      jest.spyOn(MediaControlPlugin.prototype, 'show')
      const { core, plugin } = setupTest()
      core.trigger(Events.CORE_MOUSE_MOVE)

      expect(plugin.show).toHaveBeenCalledTimes(1)
    })

    test('register hide method as callback for CORE_MOUSE_LEAVE event', () => {
      jest.spyOn(MediaControlPlugin.prototype, 'hide')
      const { core, plugin } = setupTest()
      core.trigger(Events.CORE_MOUSE_LEAVE)

      expect(plugin.hide).toHaveBeenCalledTimes(1)
    })
  })

  describe('onContainerChanged method', () => {
    test('removes all listeners from old container reference', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'stopListening')
      core.activeContainer = container
      const oldContainer = plugin.container
      plugin.onContainerChanged()

      expect(plugin.stopListening).toHaveBeenCalledWith(oldContainer)
    })

    test('saves core.activeContainer reference locally', () => {
      const { core, container, plugin } = setupTest({}, true)
      core.activeContainer = container
      plugin.onContainerChanged()

      expect(plugin.container).toEqual(core.activeContainer)
    })
  })

  describe('show method', () => {
    test('calls hide method after 2 seconds', () => {
      jest.useFakeTimers()

      const { plugin } = setupTest()
      jest.spyOn(plugin, 'hide')
      plugin.isVideoStarted = true
      plugin.show()

      expect(plugin.hide).not.toHaveBeenCalled()

      jest.advanceTimersByTime(2000)

      expect(plugin.hide).toHaveBeenCalledTimes(1)
    })

    test('resets hide timer if new call occurs', () => {
      jest.useFakeTimers()

      const { plugin } = setupTest()
      jest.spyOn(plugin, 'hide')
      plugin.isVideoStarted = true
      plugin.show()
      jest.advanceTimersByTime(1000)
      plugin.show()
      jest.advanceTimersByTime(1000)

      expect(plugin.hide).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)

      expect(plugin.hide).toHaveBeenCalledTimes(1)
    })

    test('removes \'.media-control--hide\' css class from plugin DOM element', () => {
      const { plugin } = setupTest({ mediaControl: { disableBeforeVideoStarts: true } })

      expect(plugin.$el[0].classList.contains('media-control--hide')).toBeTruthy()

      plugin.isVideoStarted = true
      plugin.show()

      expect(plugin.$el[0].classList.contains('media-control--hide')).toBeFalsy()
    })

    test('triggers MEDIACONTROL_SHOW event at core scope', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_SHOW, cb)
      plugin.isVideoStarted = true
      plugin.show()

      expect(cb).toHaveBeenCalledTimes(1)
    })
  })

  describe('hide method', () => {
    test('adds \'.media-control--hide\' css class from plugin DOM element', () => {
      const { plugin } = setupTest()

      expect(plugin.$el[0].classList.contains('media-control--hide')).toBeFalsy()

      plugin.isVideoStarted = true
      plugin.hide()

      expect(plugin.$el[0].classList.contains('media-control--hide')).toBeTruthy()
    })

    test('triggers MEDIACONTROL_HIDE event at core scope', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_HIDE, cb)
      plugin.isVideoStarted = true
      plugin.hide()

      expect(cb).toHaveBeenCalledTimes(1)
    })
  })

  describe('render method', () => {
    test('sets isRendered flag to true', () => {
      const { plugin } = setupTest()
      plugin.isRendered = false
      plugin.render()

      expect(plugin.isRendered).toBeTruthy()
    })

    test('creates cache elements to not have unnecessary re-render cycles', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'render')
      jest.spyOn(plugin, 'cacheElements')
      plugin.render()

      expect(plugin.render).toHaveBeenCalledTimes(1)
      expect(plugin.cacheElements).not.toHaveBeenCalled()

      plugin.render()

      expect(plugin.render).toHaveBeenCalledTimes(2)
      expect(plugin.cacheElements).not.toHaveBeenCalled()
    })

    test('calls buildTemplate method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'buildTemplate')
      plugin.isRendered = false
      plugin.render()

      expect(plugin.buildTemplate).toHaveBeenCalledTimes(1)
    })

    test('calls cacheElements method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'cacheElements')
      plugin.isRendered = false
      plugin.render()

      expect(plugin.cacheElements).toHaveBeenCalledTimes(1)
    })

    test('adds plugin DOM element as a child of core DOM element', () => {
      const { core, plugin } = setupTest()
      core.el.removeChild(plugin.el)

      expect(core.el.contains(plugin.el)).toBeFalsy()

      plugin.isRendered = false
      plugin.render()

      expect(core.el.contains(plugin.el)).toBeTruthy()
    })

  test('cacheElements method saves all layers DOM element locally', () => {
    const { plugin } = setupTest({ mediaControl: { layersQuantity: 2 } })
    plugin.cacheElements()

    expect(plugin.$layers[0]).toEqual(plugin.el.querySelector('.media-control__layer-1'))
    expect(plugin.$layers[1]).toEqual(plugin.el.querySelector('.media-control__layer-2'))
    expect(plugin.$layers.length).toEqual(2)
  })

  describe('destroy method', () => {
    test('destroys plugin DOM element when Core is destroyed too', () => {
      const { core, plugin } = setupTest()
      jest.spyOn(plugin, 'destroy')
      core.destroy()

      expect(plugin.destroy).toHaveBeenCalled()
    })

    test('resets isRendered flag if is destroyed', () => {
      const { plugin } = setupTest()
      plugin.destroy()

      expect(plugin.isRendered).toBeFalsy()
    })
  })
})
