import { Core, Container, Playback, version } from '@clappr/core'
import MediaControlComponentPlugin from './media_control_component'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new MediaControlComponentPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('MediaControlComponentPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('is compatible with the latest Clappr core version', () => {
    const { core, plugin } = setupTest()
    expect(core.getPlugin(plugin.name).supportedVersion).toEqual({ min: version })
  })

  test('have a getter called layer', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'layer').get).toBeTruthy()
  })

  test('layer getter returns null', () => {
    const { plugin } = setupTest()
    expect(plugin.layer).toBeNull()
  })

  test('have a getter called section', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'section').get).toBeTruthy()
  })

  test('section getter returns null', () => {
    const { plugin } = setupTest()
    expect(plugin.section).toBeNull()
  })

  test('have a getter called position', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'position').get).toBeTruthy()
  })

  test('position getter returns null', () => {
    const { plugin } = setupTest()
    expect(plugin.position).toBeNull()
  })

  test('have a getter called separator', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'separator').get).toBeTruthy()
  })

  test('separator getter returns false', () => {
    const { plugin } = setupTest()
    expect(plugin.separator).toBeFalsy()
  })

  describe('constructor', () => {
    test('adds listener to plugin DOM element to avoid propagate click events', () => {
      const { plugin } = setupTest()
      const parentExample = document.createElement('div')
      const cb = jest.fn()
      parentExample.addEventListener('click', () => cb)
      parentExample.appendChild(plugin.el)
      plugin.el.dispatchEvent(new Event('click'))

      expect(cb).not.toHaveBeenCalled()
    })
})
