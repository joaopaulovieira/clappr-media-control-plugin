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
