import { Events, Core, Container, Playback } from '@clappr/core'
import TimeIndicatorPlugin from './time_indicator'
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
