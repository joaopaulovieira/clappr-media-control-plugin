import { Browser, Events, Core, Container, Playback, Utils } from '@clappr/core'
import VolumePlugin from './volume'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import volumeOnIcon from './public/volume_on_icon.svg'
import volumeOffIcon from './public/volume_off_icon.svg'

import templateHTML from './public/template.html'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new VolumePlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

const htmlEntities = str => String(str)
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')

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
    expect(this.core.getPlugin(this.plugin.name).name).toEqual('volume')
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
    expect(this.plugin.position).toEqual(2)
  })

  test('overrides MediaControlComponentPlugin separator getter to return a truthy value', () => {
    expect(this.plugin.separator).not.toEqual(MediaControlComponentPlugin.prototype.separator)
    expect(this.plugin.separator).toBeTruthy()
  })

  test('have a getter called attributes', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'attributes').get).toBeTruthy()
  })

  test('attributes getter returns all attributes that will be added on the plugin DOM element', () => {
    expect(this.plugin.$el[0].className).toEqual('volume media-control__button media-control__elements')
  })

  test('have a getter called template', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'template').get).toBeTruthy()
  })

  test('template getter returns on template that will be added on the plugin DOM element', () => {
    expect(this.plugin.template()).toEqual(templateHTML)
  })

  test('have a getter and setter called currentValue', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'currentValue').get).toBeTruthy()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'currentValue').set).toBeTruthy()
  })

  describe('constructor', () => {
    test('saves options.persistConfig value on plugin reference', () => {
      const { plugin } = setupTest({ persistConfig: true })
      expect(plugin.persistConfig).toEqual(plugin.options.persistConfig)
    })
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      jest.spyOn(this.plugin, 'stopListening')
      this.plugin.bindEvents()

      expect(this.plugin.stopListening).toHaveBeenCalled()
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(VolumePlugin.prototype, 'onContainerChanged')
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

  })

  describe('setValue method', () => {
    test('saves currentValue on _lastValue', () => {
      this.plugin.currentValue = 100
      this.plugin.setValue(50)

      expect(this.plugin._lastValue).toEqual(100)
    })

    test('saves received value on _lastValue if don\'t exists a valid currentValue', () => {
      this.plugin.currentValue = null
      this.plugin.setValue(50)

      expect(this.plugin._lastValue).toEqual(50)
    })

    test('saves received value on currentValue', () => {
      this.plugin.currentValue = null
      this.plugin.setValue(50)

      expect(this.plugin.currentValue).toEqual(50)
    })

    test('sets received value as slider.value input DOM element', () => {
      this.plugin.setValue(50)

      expect(this.plugin.$slider.value).toEqual('50')
    })

    test('calls container.setVolume with received value', () => {
      jest.spyOn(this.container, 'setVolume')
      this.plugin.setValue(50)

      expect(this.container.setVolume).toHaveBeenCalledWith(50)
    })
  })

  describe('updateIcon method', () => {
    test('avoids execute internal code if received value is equal currentValue or if received value and currentValue are grater than 0', () => {
      jest.spyOn(this.plugin.$iconContainer, 'append')
      this.plugin.currentValue = 100
      this.plugin.updateIcon(100)

      expect(this.plugin.$iconContainer.append).not.toHaveBeenCalled()

      this.plugin.currentValue = 100
      this.plugin.updateIcon(50)

      expect(this.plugin.$iconContainer.append).not.toHaveBeenCalled()
    })

    test('appends volumeOffIcon on iconContainer DOM element if received volume is smaller or equal 0', () => {
      this.plugin.currentValue = 100
      this.plugin.updateIcon(0)

      expect(htmlEntities(this.plugin.$iconContainer.innerHTML)).not.toEqual(volumeOnIcon)
      expect(htmlEntities(this.plugin.$iconContainer.innerHTML)).toEqual(volumeOffIcon)
    })

    test('appends volumeOnIcon on iconContainer DOM element if received volume is greater than 0', () => {
      this.plugin.currentValue = 0
      this.plugin.updateIcon(100)

      expect(htmlEntities(this.plugin.$iconContainer.innerHTML)).not.toEqual(volumeOffIcon)
      expect(htmlEntities(this.plugin.$iconContainer.innerHTML)).toEqual(volumeOnIcon)
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

    test('creates cache elements to not have unnecessary re-render cycles', () => {
      expect(this.plugin.render).toHaveBeenCalledTimes(1)
      expect(this.plugin.cacheElements).toHaveBeenCalledTimes(1)

      this.plugin.render()

      expect(this.plugin.render).toHaveBeenCalledTimes(2)
      expect(this.plugin.cacheElements).toHaveBeenCalledTimes(1)
    })

    test('insert template getter response inside plugin DOM element', () => {
      expect(this.plugin.el.innerHTML.includes(this.plugin.template())).toBeTruthy()
    })

    test('calls cacheElements method', () => {
      expect(this.plugin.cacheElements).toHaveBeenCalledTimes(1)
    })
  })

  test('cacheElements method saves important DOM elements locally', () => {
    this.plugin.isRendered = false
    this.plugin.render()

    expect(this.plugin.$sliderContainer).toEqual(this.plugin.el.querySelector('.volume__slider-container'))
    expect(this.plugin.$slider).toEqual(this.plugin.el.querySelector('.volume__slider'))
    expect(this.plugin.$iconContainer).toEqual(this.plugin.el.querySelector('.volume__icon-container'))
  })
})
