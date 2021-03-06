import { Browser, Events, Core, Container, Playback, version } from '@clappr/core'
import MediaControlPlugin from './media_control'
import MediaControlComponentPlugin from '../media_control_component/media_control_component'
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
    jest.clearAllTimers()
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

  test('have a getter called layersQuantity', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'layersQuantity').get).toBeTruthy()
  })

  test('layersQuantity getter returns the options.mediaControl.layersQuantity config', () => {
    const { plugin } = setupTest({ mediaControl: { layersConfig: [{ sections: [] }, { sections: [] }] } })
    expect(plugin.layersQuantity).toEqual(plugin.options.mediaControl.layersQuantity)
  })

  test('have a getter called layersSettings', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'layersSettings').get).toBeTruthy()
  })

  test('layerSettings getter returns the options.mediaControl.layersConfig config', () => {
    const { plugin } = setupTest({ mediaControl: { layersConfig: [{ sections: [] }, { sections: [] }] } })
    expect(plugin.layersSettings).toEqual(plugin.options.mediaControl.layersConfig)
  })

  test('have a getter called disableBeforeVideoStarts', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'disableBeforeVideoStarts').get).toBeTruthy()
  })

  test('disableBeforeVideoStarts getter returns the options.mediaControl.disableBeforeVideoStarts config', () => {
    const { plugin } = setupTest({ mediaControl: { disableBeforeVideoStarts: true } })
    expect(plugin.disableBeforeVideoStarts).toEqual(plugin.options.mediaControl.disableBeforeVideoStarts)
  })

  test('have a getter called events', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'events').get).toBeTruthy()
  })

  describe('events getter', () => {
    test('returns specific events/callbacks dictionary for mobile devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = true
      const { plugin } = setupTest()

      expect(plugin.events).toEqual({
        'touchstart .media-control__elements': 'onTouchStart',
        'touchend .media-control__elements': 'removeKeepVisible',
      })
      Browser.isMobile = oldValue
    })

    test('returns specific events/callbacks dictionary for desktop devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = false
      const { plugin } = setupTest()

      expect(plugin.events).toEqual({
        'mouseenter .media-control__elements': 'setKeepVisible',
        'mouseleave .media-control__elements': 'removeKeepVisible',
      })
      Browser.isMobile = oldValue
    })
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

    test('removes all listeners from old playback reference', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'stopListening')
      core.activeContainer = container
      const oldPlayback = plugin.playback
      plugin.onContainerChanged()

      expect(plugin.stopListening).toHaveBeenCalledWith(oldPlayback)
    })

    test('saves core.activeContainer reference locally', () => {
      const { core, container, plugin } = setupTest({}, true)
      core.activeContainer = container
      plugin.onContainerChanged()

      expect(plugin.container).toEqual(core.activeContainer)
    })

    test('saves core.activePlayback reference locally', () => {
      const { core, container, plugin } = setupTest({}, true)
      core.activeContainer = container
      plugin.onContainerChanged()

      expect(plugin.playback).toEqual(core.activePlayback)
    })

    test('calls bindContainerEvents method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'bindContainerEvents')
      plugin.onContainerChanged()

      expect(plugin.bindContainerEvents).toHaveBeenCalledTimes(1)
    })

    test('calls bindPlaybackEvents method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'bindPlaybackEvents')
      plugin.onContainerChanged()

      expect(plugin.bindPlaybackEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('bindContainerEvents method', () => {
    test('only unbind events when is necessary', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'stopListening')

      core.activeContainer = container
      const oldContainer = { ...container }

      expect(plugin.stopListening).not.toHaveBeenCalledWith(container)

      core.activeContainer = container

      expect(plugin.stopListening).toHaveBeenCalledWith(oldContainer)
    })

    test('avoid register callback for events on container scope without a valid reference', () => {
      const { container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'resetVideoStartedStatus')
      container.trigger(Events.CONTAINER_STOP)

      expect(plugin.resetVideoStartedStatus).not.toHaveBeenCalled()
    })

    test('register resetVideoStartedStatus method as callback for CONTAINER_STOP event', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'resetVideoStartedStatus')
      core.activeContainer = container
      container.trigger(Events.CONTAINER_STOP)

      expect(plugin.resetVideoStartedStatus).toHaveBeenCalledTimes(1)
    })

    test('register resetVideoStartedStatus method as callback for CONTAINER_ENDED event', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'resetVideoStartedStatus')
      core.activeContainer = container
      container.trigger(Events.CONTAINER_ENDED)

      expect(plugin.resetVideoStartedStatus).toHaveBeenCalledTimes(1)
    })
  })

  describe('bindPlaybackEvents callback', () => {
    test('only unbind events when is necessary', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'stopListening')

      core.activeContainer = container

      expect(plugin.stopListening).not.toHaveBeenCalledWith(plugin.playback)

      core.activeContainer = container

      expect(plugin.stopListening).toHaveBeenCalledWith(plugin.playback)
    })

    test('avoid register callback for events on container scope without a valid reference', () => {
      const { container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'setVideoStartedStatus')
      container.playback.trigger(Events.PLAYBACK_PLAY_INTENT)

      expect(plugin.setVideoStartedStatus).not.toHaveBeenCalled()
    })

    test('register setVideoStartedStatus method as callback for PLAYBACK_PLAY_INTENT event', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'setVideoStartedStatus')
      core.activeContainer = container
      plugin.playback.trigger(Events.PLAYBACK_PLAY_INTENT)

      expect(plugin.setVideoStartedStatus).toHaveBeenCalledTimes(1)
    })
  })

  describe('onTouchStart callback', () => {
    test('calls setKeepVisible method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'setKeepVisible')
      plugin.onTouchStart()

      expect(plugin.setKeepVisible).toHaveBeenCalledTimes(1)
    })
  })

  describe('setKeepVisible method', () => {
    test('ignores the invocation if _isVisible internal flag is false', () => {
      const { plugin } = setupTest()
      plugin._keepVisible = false
      plugin.setKeepVisible()

      expect(plugin._keepVisible).toBeFalsy()
    })

    test('sets _keepVisible internal flag with true value if _isVisible internal flag is true', () => {
      const { plugin } = setupTest()
      plugin._isVisible = true
      plugin._keepVisible = false
      plugin.setKeepVisible()

      expect(plugin._keepVisible).toBeTruthy()
    })
  })

  describe('removeKeepVisible method', () => {
    test('ignores the invocation if _isVisible internal flag is false', () => {
      const { plugin } = setupTest()
      plugin._keepVisible = true
      plugin.removeKeepVisible()

      expect(plugin._keepVisible).toBeTruthy()
    })

    test('sets _keepVisible internal flag with false value if _isVisible internal flag is true', () => {
      const { plugin } = setupTest()
      plugin._isVisible = true
      plugin._keepVisible = true
      plugin.removeKeepVisible()

      expect(plugin._keepVisible).toBeFalsy()
    })

    test('calls delayedHide method if _isVisible internal flag is true', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'delayedHide')
      plugin._isVisible = true
      plugin.removeKeepVisible()

      expect(plugin.delayedHide).toHaveBeenCalledTimes(1)
    })
  })

  describe('show method', () => {
    test('calls checkMouseActivity method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'checkMouseActivity')
      plugin.show()

      expect(plugin.checkMouseActivity).toHaveBeenCalledTimes(1)
    })

    test('ignores the invocation if isVideoStarted flag is false', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_SHOW, cb)
      plugin.show()

      expect(cb).not.toHaveBeenCalledTimes(1)
    })

    test('ignores the invocation if _isVisible internal flag is true', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_SHOW, cb)
      plugin.isVideoStarted = true
      plugin._isVisible = true
      plugin.show()

      expect(cb).not.toHaveBeenCalledTimes(1)
    })

    test('sets _isVisible internal flag with true value', () => {
      const { plugin } = setupTest()
      plugin.isVideoStarted = true
      plugin._isVisible = false
      plugin.show()

      expect(plugin._isVisible).toBeTruthy()
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

  describe('checkMouseActivity method', () => {
    test('resets mouse stop timer if new call occurs', () => {
      jest.useFakeTimers()

      const { plugin } = setupTest()
      jest.spyOn(plugin, 'delayedHide')

      plugin.checkMouseActivity()
      jest.advanceTimersByTime(100)
      plugin.checkMouseActivity()
      jest.advanceTimersByTime(200)

      expect(plugin.delayedHide).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(plugin.delayedHide).toHaveBeenCalledTimes(1)
    })

    test('resets hide timer if new call occurs', () => {
      jest.useFakeTimers()

      const { plugin } = setupTest()
      jest.spyOn(plugin, 'hide')

      plugin.checkMouseActivity()
      jest.advanceTimersByTime(1000)
      plugin.checkMouseActivity()
      jest.advanceTimersByTime(2000)

      expect(plugin.hide).not.toHaveBeenCalled()

      jest.advanceTimersByTime(2000)

      expect(plugin.hide).toHaveBeenCalledTimes(1)
    })
  })

  describe('delayedHide method', () => {
    test('calls hide method after 2 seconds for desktop devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = false

      jest.useFakeTimers()

      const { plugin } = setupTest()
      jest.spyOn(plugin, 'hide')
      plugin.isVideoStarted = true
      plugin.delayedHide()

      expect(plugin.hide).not.toHaveBeenCalled()

      jest.advanceTimersByTime(2000)

      expect(plugin.hide).toHaveBeenCalledTimes(1)

      Browser.isMobile = oldValue
    })

    test('calls hide method after 3 seconds for desktop devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = true

      jest.useFakeTimers()

      const { plugin } = setupTest()
      jest.spyOn(plugin, 'hide')
      plugin.isVideoStarted = true
      plugin.delayedHide()

      expect(plugin.hide).not.toHaveBeenCalled()

      jest.advanceTimersByTime(2000)

      expect(plugin.hide).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)

      expect(plugin.hide).toHaveBeenCalledTimes(1)

      Browser.isMobile = oldValue
    })
  })

  describe('hide method', () => {
    test('ignores the invocation if isVideoStarted flag is false', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_HIDE, cb)
      plugin.hide()

      expect(cb).not.toHaveBeenCalledTimes(1)
    })

    test('ignores the invocation if _isVisible internal flag is false', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_HIDE, cb)
      plugin.isVideoStarted = true
      plugin.hide()

      expect(cb).not.toHaveBeenCalledTimes(1)
    })

    test('ignores the invocation if _keepVisible internal flag is true', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_HIDE, cb)
      plugin.isVideoStarted = true
      plugin._isVisible = true
      plugin._keepVisible = true
      plugin.hide()

      expect(cb).not.toHaveBeenCalledTimes(1)
    })

    test('adds \'.media-control--hide\' css class from plugin DOM element', () => {
      const { plugin } = setupTest()

      expect(plugin.$el[0].classList.contains('media-control--hide')).toBeFalsy()

      plugin.isVideoStarted = true
      plugin._isVisible = true
      plugin.hide()

      expect(plugin.$el[0].classList.contains('media-control--hide')).toBeTruthy()
    })

    test('triggers MEDIACONTROL_HIDE event at core scope', () => {
      const { plugin } = setupTest()
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.MEDIACONTROL_HIDE, cb)
      plugin.isVideoStarted = true
      plugin._isVisible = true
      plugin.hide()

      expect(cb).toHaveBeenCalledTimes(1)
    })

    test('sets _isVisible internal flag with false value', () => {
      const { plugin } = setupTest()
      plugin.isVideoStarted = true
      plugin._isVisible = true
      plugin.hide()

      expect(plugin._isVisible).toBeFalsy()
    })
  })

  describe('setVideoStartedStatus method', () => {
    test('sets isVideoStarted flag to true', () => {
      const { plugin } = setupTest()

      expect(plugin.isVideoStarted).toBeUndefined()

      plugin.setVideoStartedStatus()

      expect(plugin.isVideoStarted).toBeTruthy()
    })

    test('calls hide method if options.mediaControl.disableBeforeVideoStarts is falsy', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'disableBeforeVideoStarts', 'get').mockReturnValueOnce(true)
      jest.spyOn(plugin, 'hide')
      plugin.setVideoStartedStatus()

      expect(plugin.hide).not.toHaveBeenCalled()

      jest.spyOn(plugin, 'disableBeforeVideoStarts', 'get').mockReturnValueOnce(false)

      plugin.setVideoStartedStatus()

      expect(plugin.hide).toHaveBeenCalledTimes(1)
    })
  })

  describe('resetVideoStartedStatus method', () => {
    test('calls show method if options.mediaControl.disableBeforeVideoStarts is falsy', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'show')
      plugin.resetVideoStartedStatus()

      expect(plugin.show).toHaveBeenCalledTimes(1)
    })

    test('calls hide method if options.mediaControl.disableBeforeVideoStarts is truthy', () => {
      const { plugin } = setupTest({ mediaControl: { disableBeforeVideoStarts: true } })
      jest.spyOn(plugin, 'hide')
      plugin.resetVideoStartedStatus()

      expect(plugin.hide).toHaveBeenCalledTimes(1)
    })

    test('sets isVideoStarted flag to false', () => {
      const { plugin } = setupTest()

      expect(plugin.isVideoStarted).toBeUndefined()

      plugin.resetVideoStartedStatus()

      expect(plugin.isVideoStarted).toBeFalsy()
    })

    test('calls bindPlaybackEvents method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'bindPlaybackEvents')
      plugin.resetVideoStartedStatus()

      expect(plugin.bindPlaybackEvents).toHaveBeenCalledTimes(1)
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

    test('calls initMediaControlComponents method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'initMediaControlComponents')
      plugin.isRendered = false
      plugin.render()

      expect(plugin.initMediaControlComponents).toHaveBeenCalledTimes(1)
    })
  })

  describe('buildTemplate method', () => {
    test('adds default template at plugin DOM element if options.mediaControl.layersQuantity doesn\'t exists', () => {
      const { plugin } = setupTest()
      plugin.buildTemplate()

      expect(plugin.el.innerHTML).toEqual(defaultTemplate)
    })

    test('calls buildLayers method if receives a valid options.mediaControl.layersQuantity config', () => {
      const { plugin } = setupTest({ mediaControl: { layersQuantity: 1 } })
      jest.spyOn(plugin, 'buildLayers')
      plugin.buildTemplate()

      expect(plugin.buildLayers).toHaveBeenCalled()
    })
  })

  describe('buildLayer method', () => {
    test('adds custom layers DOM elements defined at options.mediaControl.layersQuantity as a child of plugin DOM element', () => {
      const { plugin } = setupTest({ mediaControl: { layersQuantity: 1 } })
      const expectedTemplate = '<div style="flex-direction: column;" class="media-control__layers media-control__layer-1"></div>'
      plugin.el.innerHTML = ''
      plugin.buildLayers()

      expect(plugin.el.innerHTML).toEqual(expectedTemplate)
    })

    test('uses options.mediaControl.layersConfig[n].flexDirection to define sections direction if this config exists', () => {
      const { plugin } = setupTest({ mediaControl: { layersQuantity: 1, layersConfig: [{ id: 1, flexDirection: 'row' }] } })
      const expectedTemplate = '<div style="flex-direction: row;" class="media-control__layers media-control__layer-1"></div>'
      plugin.el.innerHTML = ''
      plugin.buildLayers()

      expect(plugin.el.innerHTML).toEqual(expectedTemplate)
    })

    test('calls buildSections method for each custom layer element with options.mediaControl.layersConfig[n].sectionsQuantity defined', () => {
      const options = {
        mediaControl: {
          layersQuantity: 5,
          layersConfig: [
            { id: 1, sectionsQuantity: 2, flexDirection: 'row' },
            { id: 4, sectionsQuantity: 1 },
            { id: 3 },
            { id: 5, flexDirection: 'row' },
          ],
        },
      }
      const { plugin } = setupTest({ ...options })
      plugin.el.innerHTML = ''
      jest.spyOn(plugin, 'buildSections')
      plugin.buildLayers()

      expect(plugin.buildSections).toHaveBeenNthCalledWith(
        1,
        plugin.el.querySelector('.media-control__layer-1'),
        options.mediaControl.layersConfig.find(config => config.id === 1),
        'row',
      )
      expect(plugin.buildSections).toHaveBeenNthCalledWith(
        2,
        plugin.el.querySelector('.media-control__layer-4'),
        options.mediaControl.layersConfig.find(config => config.id === 4),
        'column',
      )
    })
  })

  describe('buildSections method', () => {
    const baseOptions = { mediaControl: { layersQuantity: 1, layersConfig: [{ id: 1, sectionsQuantity: 1, sectionsConfig: [] }] } }

    test('adds custom sections DOM elements defined at layersConfig[n].sectionsQuantity as a child of parent layer DOM element', () => {
      const { plugin } = setupTest({ ...baseOptions })
      const layerExample = plugin.el.querySelector('.media-control__layer-1')
      const expectedTemplate = layerExample.outerHTML
      layerExample.innerHTML = ''
      plugin.buildSections(layerExample, plugin.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.outerHTML).toEqual(expectedTemplate)
    })

    test('sets flexDirection with opposite value of layer flexDirection', () => {
      const options1 = { ...baseOptions }
      options1.mediaControl.layersConfig[0].flexDirection = 'row'
      const { plugin: plugin1 } = setupTest(options1)
      let layerExample = plugin1.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin1.buildSections(layerExample, plugin1.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').style.flexDirection).toEqual('column')

      const options2 = { ...baseOptions }
      options2.mediaControl.layersConfig[0].flexDirection = 'column'
      const { plugin: plugin2 } = setupTest(options2)
      layerExample = plugin2.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin1.buildSections(layerExample, plugin2.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').style.flexDirection).toEqual('row')
    })

    test('adds css class on section DOM element to push in the opposite direction if sectionsConfig[n].separator exists', () => {
      const options = { ...baseOptions }
      options.mediaControl.layersConfig[0].sectionsConfig[0] = { id: 1, separator: true }
      const { plugin } = setupTest(options)
      const layerExample = plugin.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin.buildSections(layerExample, plugin.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').classList.contains('media-control__sections--push-column')).toBeTruthy()
    })

    test('adds height style on section DOM element if sectionsConfig[n].height exists', () => {
      const options = { ...baseOptions }
      options.mediaControl.layersConfig[0].sectionsConfig[0] = { id: 1, height: '100%' }
      const { plugin } = setupTest(options)
      const layerExample = plugin.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin.buildSections(layerExample, plugin.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').style.height).toEqual('100%')
    })

    test('adds width style on section DOM element if sectionsConfig[n].width exists', () => {
      const options = { ...baseOptions }
      options.mediaControl.layersConfig[0].sectionsConfig[0] = { id: 1, width: '100%' }
      const { plugin } = setupTest(options)
      const layerExample = plugin.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin.buildSections(layerExample, plugin.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').style.width).toEqual('100%')
    })

    test('adds alignItems style on section DOM element if sectionsConfig[n].alignItems exists', () => {
      const options = { ...baseOptions }
      options.mediaControl.layersConfig[0].sectionsConfig[0] = { id: 1, alignItems: 'center' }
      const { plugin } = setupTest(options)
      const layerExample = plugin.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin.buildSections(layerExample, plugin.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').style.alignItems).toEqual('center')
    })

    test('adds justifyContent style on section DOM element sectionsConfig[n].justifyContent exists', () => {
      const options = { ...baseOptions }
      options.mediaControl.layersConfig[0].sectionsConfig[0] = { id: 1, justifyContent: 'center' }
      const { plugin } = setupTest(options)
      const layerExample = plugin.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin.buildSections(layerExample, plugin.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').style.justifyContent).toEqual('center')
    })

    test('adds flexGrow style on section DOM element if sectionsConfig[n].flexGrow exists', () => {
      const options = { ...baseOptions }
      options.mediaControl.layersConfig[0].sectionsConfig[0] = { id: 1, flexGrow: 1 }
      const { plugin } = setupTest(options)
      const layerExample = plugin.el.querySelector('.media-control__layer-1')
      layerExample.innerHTML = ''
      plugin.buildSections(layerExample, plugin.layersSettings[0], layerExample.style.flexDirection)

      expect(layerExample.querySelector('.media-control__section-1').style.flexGrow).toEqual('1')
    })
  })

  test('cacheElements method saves all layers DOM element locally', () => {
    const { plugin } = setupTest({ mediaControl: { layersQuantity: 2 } })
    plugin.cacheElements()

    expect(plugin.$layers[0]).toEqual(plugin.el.querySelector('.media-control__layer-1'))
    expect(plugin.$layers[1]).toEqual(plugin.el.querySelector('.media-control__layer-2'))
    expect(plugin.$layers.length).toEqual(2)
  })

  describe('initMediaControlComponents method', () => {
    test('calls renderMediaControlComponent method for each loaded MediaControlComponentPlugin', () => {
      const { core, plugin } = setupTest()
      core.plugins.push(new MediaControlComponentPlugin(core))
      jest.spyOn(plugin, 'renderMediaControlComponent')
      plugin.initMediaControlComponents()

      expect(plugin.renderMediaControlComponent).toHaveBeenCalledTimes(1)
    })
  })

  describe('renderMediaControlComponent method', () => {
    test('adds media control component plugin DOM element into the configured section DOM element', () => {
      const { core, plugin } = setupTest()
      const mediaControlComponentPlugin = new MediaControlComponentPlugin(core)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'layer', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'section', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'attributes', 'get').mockReturnValueOnce({ class: 'test' })
      jest.spyOn(mediaControlComponentPlugin, 'render')
      plugin.renderMediaControlComponent(mediaControlComponentPlugin)

      expect(plugin.el.querySelector('.media-control__section-1').contains(mediaControlComponentPlugin.el)).toBeTruthy()
      expect(mediaControlComponentPlugin.render).toHaveBeenCalledTimes(1)
    })

    test('don\'t add media control component plugin if don\'t have valid layer and section getters', () => {
      const { core, plugin } = setupTest()
      const mediaControlComponentPlugin = new MediaControlComponentPlugin(core)
      jest.spyOn(mediaControlComponentPlugin, 'render')
      plugin.renderMediaControlComponent(mediaControlComponentPlugin)

      expect(plugin.el.querySelector('.media-control__section-1').contains(mediaControlComponentPlugin.el)).toBeFalsy()
      expect(mediaControlComponentPlugin.render).not.toHaveBeenCalled()
    })

    test('adds position getter value of media control component plugin as id and class of your DOM element', () => {
      jest.spyOn(MediaControlComponentPlugin.prototype, 'layer', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'section', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'position', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'attributes', 'get').mockReturnValueOnce({ class: 'test' })
      const { core, plugin } = setupTest()
      const mediaControlComponentPlugin = new MediaControlComponentPlugin(core)
      plugin.renderMediaControlComponent(mediaControlComponentPlugin)

      expect(mediaControlComponentPlugin.el.id).toEqual('1')
      expect(mediaControlComponentPlugin.el.classList.contains('media-control__element-1')).toBeTruthy()
    })

    test('adds css class on plugin DOM element to push in the opposite direction if plugin.separator getter returns true', () => {
      jest.spyOn(MediaControlComponentPlugin.prototype, 'layer', 'get').mockReturnValue(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'section', 'get').mockReturnValue(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'position', 'get').mockReturnValue(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'attributes', 'get').mockReturnValue({ class: 'test' })
      jest.spyOn(MediaControlComponentPlugin.prototype, 'separator', 'get').mockReturnValue(true)
      const { core: core1, plugin: plugin1 } = setupTest()
      const mediaControlComponentPlugin1 = new MediaControlComponentPlugin(core1)
      plugin1.renderMediaControlComponent(mediaControlComponentPlugin1)

      expect(mediaControlComponentPlugin1.el.classList.contains('media-control__elements--push-row')).toBeTruthy()

      const { core: core2, plugin: plugin2 } = setupTest({
        mediaControl: {
          layersQuantity: 1,
          layersConfig: [{ id: 1, sectionsQuantity: 2, flexDirection: 'row' }],
        },
      })
      const mediaControlComponentPlugin2 = new MediaControlComponentPlugin(core2)
      plugin2.renderMediaControlComponent(mediaControlComponentPlugin2)

      expect(mediaControlComponentPlugin2.el.classList.contains('media-control__elements--push-column')).toBeTruthy()
    })

    test('calls appendMediaControlComponent method only if already have at least one plugin rendered', () => {
      jest.spyOn(MediaControlComponentPlugin.prototype, 'layer', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'section', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'position', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'attributes', 'get').mockReturnValueOnce({ class: 'test' })
      const mediaControlComponentPlugin1 = new MediaControlComponentPlugin(new Core({}))
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'appendMediaControlComponent')
      plugin.renderMediaControlComponent(mediaControlComponentPlugin1)

      expect(plugin.appendMediaControlComponent).not.toHaveBeenCalled()

      jest.spyOn(MediaControlComponentPlugin.prototype, 'layer', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'section', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'position', 'get').mockReturnValueOnce(1)
      jest.spyOn(MediaControlComponentPlugin.prototype, 'attributes', 'get').mockReturnValueOnce({ class: 'test' })
      const mediaControlComponentPlugin2 = new MediaControlComponentPlugin(new Core({}))
      plugin.renderMediaControlComponent(mediaControlComponentPlugin2)

      expect(plugin.appendMediaControlComponent).toHaveBeenCalledTimes(1)
    })
  })

  describe('appendMediaControlComponent method', () => {
    const testContainer = document.createElement('div')
    const itemsList = []
    for (let index = 1; index <= 25; index++) {
      const item = document.createElement('div')
      item.setAttribute('id', index)
      item.classList.add('media-control__elements', `media-control__element-${index}`)
      itemsList.push(item)
    }
    itemsList.sort(() => Math.random() - 0.5)

    test('ensures appending element in the correct position of all components', () => {
      const { plugin } = setupTest()
      testContainer.appendChild(itemsList.shift())
      itemsList.forEach(item => {
        const renderedItems = testContainer.querySelectorAll('.media-control__elements')
        plugin.appendMediaControlComponent(renderedItems, item, testContainer)
      })
      const renderedItems = testContainer.querySelectorAll('.media-control__elements')

      expect(renderedItems[0]).toEqual(testContainer.querySelector('.media-control__element-1'))
      expect(renderedItems[12]).toEqual(testContainer.querySelector('.media-control__element-13'))
      expect(renderedItems[18]).toEqual(testContainer.querySelector('.media-control__element-19'))
      expect(renderedItems[22]).toEqual(testContainer.querySelector('.media-control__element-23'))
      expect(renderedItems[24]).toEqual(testContainer.querySelector('.media-control__element-25'))
    })
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
