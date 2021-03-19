import { Events, Core, Container, Playback } from '@clappr/core'
import PlayPauseButtonPlugin from './play_pause_button'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import playIcon from './public/play_icon.svg'
import pauseIcon from './public/pause_icon.svg'
import stopIcon from './public/stop_icon.svg'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new PlayPauseButtonPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('PlayPauseButtonPlugin', function() {
  beforeEach(() => {
    jest.clearAllMocks()
    const response = setupTest({}, true)
    this.core = response.core
    this.container = response.container
    this.core.activeContainer = this.container
    this.plugin = response.plugin
  })

  test('is loaded on core plugins array', () => {
    expect(this.core.getPlugin(this.plugin.name).name).toEqual('play_pause_button')
  })

  test('overrides MediaControlComponentPlugin layer getter to return a valid value', () => {
    expect(this.plugin.layer).not.toEqual(MediaControlComponentPlugin.prototype.layer)
    expect(this.plugin.layer).toEqual(1)
  })

  test('overrides MediaControlComponentPlugin section getter to return a valid value', () => {
    expect(this.plugin.section).not.toEqual(MediaControlComponentPlugin.prototype.section)
    expect(this.plugin.section).toEqual(1)
  })

  test('overrides MediaControlComponentPlugin position getter to return a valid value', () => {
    expect(this.plugin.position).not.toEqual(MediaControlComponentPlugin.prototype.position)
    expect(this.plugin.position).toEqual(1)
  })

  test('overrides MediaControlComponentPlugin tagName getter to define DOM plugin element as a button tag ', () => {
    expect(this.plugin.tagName).not.toEqual(MediaControlComponentPlugin.prototype.tagName)
    expect(this.plugin.el.tagName).toEqual('BUTTON')
  })

  test('have a getter called attributes', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'attributes').get).toBeTruthy()
  })

  test('attributes getter returns all attributes that will be added on the plugin DOM element', () => {
    expect(this.plugin.$el[0].className).toEqual('play-pause-button media-control__button media-control__elements')
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

  test('have a getter called shouldStopMedia', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'shouldStopMedia').get).toBeTruthy()
  })

  test('shouldStopMedia getter informs if the media needs to be stopped instead paused', () => {
    expect(this.plugin.shouldStopMedia).toBeFalsy()

    jest.spyOn(Playback.prototype, 'getPlaybackType').mockReturnValue(Playback.LIVE)
    const { core, container, plugin } = setupTest({}, true)
    jest.spyOn(container, 'isDvrEnabled').mockReturnValueOnce(true)
    core.activeContainer = container

    expect(plugin.shouldStopMedia).toBeFalsy()

    jest.spyOn(container, 'isDvrEnabled').mockReturnValueOnce(false)

    expect(plugin.shouldStopMedia).toBeTruthy()
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'stopListening')
      plugin.bindEvents()

      expect(plugin.stopListening).toHaveBeenCalled()
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(PlayPauseButtonPlugin.prototype, 'onContainerChanged')
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

    test('saves core.activePlayback reference locally', () => {
      this.plugin.onContainerChanged()

      expect(this.plugin.playback).toEqual(this.core.activePlayback)
    })

    test('calls bindContainerEvents method', () => {
      jest.spyOn(this.plugin, 'bindContainerEvents')
      this.plugin.onContainerChanged()

      expect(this.plugin.bindContainerEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('changeIcon method', () => {
    test('appends playIcon on plugin DOM element if container.isPlaying is falsy', () => {
      jest.spyOn(this.container, 'isPlaying').mockReturnValueOnce(false)
      this.plugin.changeIcon()

      expect(this.plugin.$el[0].innerHTML.includes(pauseIcon)).toBeFalsy()
      expect(this.plugin.$el[0].innerHTML.includes(stopIcon)).toBeFalsy()
      expect(this.plugin.$el[0].innerHTML.includes(playIcon)).toBeTruthy()
    })

    test('appends pauseIcon on plugin DOM element if container.isPlaying is truthy and shouldStopMedia getter returns false', () => {
      jest.spyOn(this.container, 'isPlaying').mockReturnValueOnce(true)
      jest.spyOn(this.plugin, 'shouldStopMedia', 'get').mockReturnValueOnce(false)
      this.plugin.changeIcon()

      expect(this.plugin.$el[0].innerHTML.includes(playIcon)).toBeFalsy()
      expect(this.plugin.$el[0].innerHTML.includes(stopIcon)).toBeFalsy()
      expect(this.plugin.$el[0].innerHTML.includes(pauseIcon)).toBeTruthy()
    })

    test('appends stopIcon on plugin DOM element if container.isPlaying is truthy and shouldStopMedia getter returns true', () => {
      jest.spyOn(this.container, 'isPlaying').mockReturnValueOnce(true)
      jest.spyOn(this.plugin, 'shouldStopMedia', 'get').mockReturnValueOnce(true)
      this.plugin.changeIcon()

      expect(this.plugin.$el[0].innerHTML.includes(playIcon)).toBeFalsy()
      expect(this.plugin.$el[0].innerHTML.includes(pauseIcon)).toBeFalsy()
      expect(this.plugin.$el[0].innerHTML.includes(stopIcon)).toBeTruthy()
    })

    test('triggers MEDIACONTROL_NOTPLAYING event after append playIcon on plugin DOM element', () => {
      jest.spyOn(this.container, 'isPlaying').mockReturnValueOnce(false)
      const cb = jest.fn()
      this.plugin.listenToOnce(this.core, Events.MEDIACONTROL_NOTPLAYING, cb)
      this.plugin.changeIcon()

      expect(cb).toHaveBeenCalledTimes(1)
    })
  })

  describe('render method', () => {
    beforeEach(() => {
      jest.spyOn(this.plugin, 'render')

      this.plugin.isRendered = false
      this.plugin.render()
    })

    test('sets isRendered flag to true', () => {
      expect(this.plugin.isRendered).toBeTruthy()
    })
  })
})
