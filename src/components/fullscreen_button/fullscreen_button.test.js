import { Events, Core, Container, Playback, Utils } from '@clappr/core'
import FullscreenButtonPlugin from './fullscreen_button'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import enterFullscreenIcon from './public/enter_fullscreen_icon.svg'
import exitFullscreenIcon from './public/exit_fullscreen_icon.svg'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new FullscreenButtonPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('FullscreenButtonPlugin', function() {
  beforeEach(() => {
    jest.clearAllMocks()
    const response = setupTest({}, true)
    this.core = response.core
    this.container = response.container
    this.core.activeContainer = this.container
    this.plugin = response.plugin
  })

  test('is loaded on core plugins array', () => {
    expect(this.core.getPlugin(this.plugin.name).name).toEqual('fullscreen_button')
  })

  describe('layer getter', () => {
    test('overrides MediaControlComponentPlugin layer getter to return a valid value', () => {
      expect(this.plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(this.plugin.layer).toEqual(1)
    })

    test('is configurable via mediaControl.fullscreenComponent.layer config', () => {
      const { plugin } = setupTest({ mediaControl: { fullscreenComponent: { layer: 2 } } })

      expect(plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
      expect(plugin.layer).toEqual(2)
    })
  })

  describe('section getter', () => {
    test('overrides MediaControlComponentPlugin section getter to return a valid value', () => {
      expect(this.plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(this.plugin.section).toEqual(1)
    })

    test('is configurable via mediaControl.fullscreenComponent.section config', () => {
      const { plugin } = setupTest({ mediaControl: { fullscreenComponent: { section: 2 } } })

      expect(plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
      expect(plugin.section).toEqual(2)
    })
  })

  describe('position getter', () => {
    test('overrides MediaControlComponentPlugin position getter to return a valid value', () => {
      expect(this.plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(this.plugin.position).toEqual(3)
    })

    test('is configurable via mediaControl.fullscreenComponent.position config', () => {
      const { plugin } = setupTest({ mediaControl: { fullscreenComponent: { position: 1 } } })

      expect(plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
      expect(plugin.position).toEqual(1)
    })
  })

  describe('separator getter', () => {
    test('is configurable via mediaControl.fullscreenComponent.separator config', () => {
      const { plugin } = setupTest({ mediaControl: { fullscreenComponent: { separator: true } } })

      expect(plugin.separator).not.toEqual(MediaControlComponentPlugin.prototype.separator)
      expect(plugin.separator).toBeTruthy()
    })

    test('returns null value if is not configured with a valid value', () => {
      expect(this.plugin.separator).not.toEqual(MediaControlComponentPlugin.prototype.separator)
      expect(this.plugin.separator).toBeNull()
    })
  })

  test('overrides MediaControlComponentPlugin tagName getter to define DOM plugin element as a button tag ', () => {
    expect(this.plugin.tagName).not.toEqual(MediaControlComponentPlugin.prototype.tagName)
    expect(this.plugin.el.tagName).toEqual('BUTTON')
  })

  test('have a getter called attributes', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'attributes').get).toBeTruthy()
  })

  test('attributes getter returns all attributes that will be added on the plugin DOM element', () => {
    expect(this.plugin.$el[0].className).toEqual('fullscreen-button media-control__button media-control__elements')
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.bindEvents()

      expect(this.plugin.stopListening).toHaveBeenCalled()
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(FullscreenButtonPlugin.prototype, 'onContainerChanged')
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
      jest.spyOn(this.plugin, 'toggle')
      this.container.trigger(Events.CONTAINER_DBLCLICK)

      expect(this.plugin.toggle).not.toHaveBeenCalled()
    })

    test('register toggle method as callback for CONTAINER_DBLCLICK event', () => {
      jest.spyOn(this.plugin, 'toggle')
      this.core.activeContainer = this.container
      this.container.trigger(Events.CONTAINER_DBLCLICK)

      expect(this.plugin.toggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('toggle method', () => {
    beforeEach(() => {
      jest.spyOn(this.container, 'fullscreen')
      jest.spyOn(this.core, 'toggleFullscreen').mockImplementation(() => {})
      jest.spyOn(this.plugin, 'changeIcon').mockImplementation(() => {})
    })

    test('calls container.fullscreen method', () => {
      this.plugin.toggle()
      expect(this.container.fullscreen).toHaveBeenCalledTimes(1)
    })

    test('calls core.toggleFullscreen method', () => {
      this.plugin.toggle()
      expect(this.core.toggleFullscreen).toHaveBeenCalledTimes(1)
    })

    test('calls changeIcon method', () => {
      this.plugin.toggle()
      expect(this.plugin.changeIcon).toHaveBeenCalledTimes(1)
    })
  })

  describe('changeIcon method', () => {
    test('only run internal logic after 600 milliseconds', () => {
      jest.useFakeTimers()
      jest.spyOn(Utils.Fullscreen, 'fullscreenElement')
      this.plugin.changeIcon()

      expect(Utils.Fullscreen.fullscreenElement).not.toHaveBeenCalled()

      jest.advanceTimersByTime(600)

      expect(Utils.Fullscreen.fullscreenElement).toHaveBeenCalledTimes(1)
    })

    test('appends exitFullscreenIcon if Utils.Fullscreen.fullscreenElement is truthy', () => {
      jest.spyOn(Utils.Fullscreen, 'fullscreenElement').mockReturnValueOnce(true)
      this.plugin.changeIcon()
      jest.advanceTimersByTime(600)

      expect(this.plugin.$el[0].innerHTML.includes(exitFullscreenIcon)).toBeTruthy()
    })

    test('appends enterFullscreenIcon if Utils.Fullscreen.fullscreenElement is falsy', () => {
      jest.spyOn(Utils.Fullscreen, 'fullscreenElement').mockReturnValueOnce(true)
      this.plugin.changeIcon()
      jest.advanceTimersByTime(600)

      expect(this.plugin.$el[0].innerHTML.includes(enterFullscreenIcon)).toBeFalsy()
    })
  })

  describe('render method', () => {
    beforeEach(() => {
      jest.spyOn(Utils.Fullscreen, 'fullscreenEnabled').mockImplementation(() => true)
      jest.spyOn(this.plugin, 'render')
      jest.spyOn(this.plugin, 'changeIcon')
    })

    test('avoid unnecessary re-render cycles', () => {
      this.plugin.render()

      expect(this.plugin.render).toHaveBeenCalledTimes(1)
      expect(this.plugin.changeIcon).toHaveBeenCalledTimes(1)

      this.plugin.render()

      expect(this.plugin.render).toHaveBeenCalledTimes(2)
      expect(this.plugin.changeIcon).toHaveBeenCalledTimes(1)
    })

    test('sets isRendered flag to true', () => {
      this.plugin.isRendered = false
      this.plugin.render()

      expect(this.plugin.isRendered).toBeTruthy()
    })

    test('calls changeIcon method', () => {
      this.plugin.isRendered = false
      this.plugin.render()

      expect(this.plugin.changeIcon).toHaveBeenCalledTimes(1)
    })
  })
})
