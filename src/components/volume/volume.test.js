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

  test('have a getter called events', () => {
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.plugin), 'events').get).toBeTruthy()
  })

  describe('events getter', () => {
    test('returns specific events/callbacks dictionary for mobile devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = true
      expect(this.plugin.events).toEqual({ 'click .volume__icon-container': this.plugin.toggle })
      Browser.isMobile = oldValue
    })

    test('returns specific events/callbacks dictionary for desktop devices', () => {
      const oldValue = Browser.isMobile
      Browser.isMobile = false
      expect(this.plugin.events).toEqual({
        'click .volume__icon-container': this.plugin.toggle,
        mouseenter: this.plugin.showSlider,
        mouseleave: this.plugin.hideSlider,
        'input .volume__slider': this.plugin.setValueFromInputSlider,
        'click .volume__slider': this.plugin.clearHideTimeout,
      })
      Browser.isMobile = oldValue
    })
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

    test('calls setInitialValue method', () => {
      jest.spyOn(this.plugin, 'setInitialValue')
      this.plugin.onContainerChanged()

      expect(this.plugin.setInitialValue).toHaveBeenCalledTimes(1)
    })
  })

  describe('setInitialValue method', () => {
    test('calls getInitialValue method', () => {
      jest.spyOn(this.plugin, 'getInitialValue')
      this.plugin.setInitialValue()

      expect(this.plugin.getInitialValue).toHaveBeenCalledTimes(1)
    })

    test('calls updateSliderPercentage method with getInitialValue return value', () => {
      jest.spyOn(this.plugin, 'getInitialValue')
      jest.spyOn(this.plugin, 'updateSliderPercentage')
      this.plugin.setInitialValue()

      expect(this.plugin.getInitialValue).toHaveReturnedWith(100)
      expect(this.plugin.updateSliderPercentage).toHaveBeenCalledWith(100)
    })

    test('calls setValue method with getInitialValue return value', () => {
      jest.spyOn(this.plugin, 'getInitialValue')
      jest.spyOn(this.plugin, 'setValue')
      this.plugin.setInitialValue()

      expect(this.plugin.getInitialValue).toHaveReturnedWith(100)
      expect(this.plugin.setValue).toHaveBeenCalledWith(100)
    })
  })

  describe('getInitialValue method', () => {
    test('uses a valid volume value saved on local storage if options.persistConfig is true', () => {
      const { plugin } = setupTest({ persistConfig: true })
      let initialValue = plugin.getInitialValue()

      expect(initialValue).toEqual(100)

      Utils.Config.persist('volume', NaN)
      const { plugin: plugin1 } = setupTest({ persistConfig: true })
      initialValue = plugin1.getInitialValue()

      expect(initialValue).toEqual(100)

      Utils.Config.persist('volume', 50)
      const { plugin: plugin2 } = setupTest({ persistConfig: true })
      initialValue = plugin2.getInitialValue()

      expect(initialValue).toEqual(50)

      Utils.Config.persist('volume', null)
    })

    test('returns 0 if options.mute is true', () => {
      const { plugin } = setupTest({ mute: true })
      let initialValue = plugin.getInitialValue()

      expect(initialValue).toEqual(0)

      Utils.Config.persist('volume', 50)
      const { plugin: plugin1 } = setupTest({ persistConfig: true, mute: true })
      initialValue = plugin1.getInitialValue()

      expect(initialValue).toEqual(0)

      Utils.Config.persist('volume', null)
    })
  })

  describe('updateSliderPercentage method', () => {
    test('adds received value as --volume-before-width style property of slider DOM element', () => {
      this.plugin.setValueFromClickIcon(50)

      expect(getComputedStyle(this.plugin.$slider).getPropertyValue('--volume-before-width')).toEqual('50%')
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

    test('calls updateIcon method', () => {
      jest.spyOn(this.plugin, 'updateIcon')
      this.plugin.setValue(100)

      expect(this.plugin.updateIcon).toHaveBeenCalledTimes(1)
    })

    test('saves received value on currentValue', () => {
      this.plugin.currentValue = null
      this.plugin.setValue(50)

      expect(this.plugin.currentValue).toEqual(50)
    })

    test('saves received value on LocalStorage if options.persistConfig is true', () => {
      const { core, container, plugin } = setupTest({ persistConfig: true }, true)
      core.activeContainer = container
      plugin.setValue(50)

      expect(Utils.Config.restore('volume')).toEqual(50)
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

  describe('showSlider method', () => {
    test('removes .volume__slider-container--hide class from slider container DOM element', () => {
      this.plugin.showSlider()

      expect(this.plugin.$sliderContainer.classList.contains('volume__slider-container--hide')).toBeFalsy()
    })
  })

  describe('hideSlider method', () => {
    test('adds .volume__slider-container--hide to sliderContainer DOM element after 100 milliseconds if _isDragging flag is false', () => {
      jest.useFakeTimers()
      this.plugin._isDragging = false
      this.plugin.showSlider()
      this.plugin.hideSlider()

      expect(this.plugin.$sliderContainer.classList.contains('volume__slider-container--hide')).toBeFalsy()

      jest.advanceTimersByTime(100)

      expect(this.plugin.$sliderContainer.classList.contains('volume__slider-container--hide')).toBeTruthy()
    })

    test('calls hiderSlider again after 200 milliseconds if _isDragging flag is true', () => {
      jest.useFakeTimers()
      jest.spyOn(this.plugin, 'hideSlider')
      this.plugin.showSlider()
      this.plugin._isDragging = true
      this.plugin.hideSlider()

      expect(this.plugin.hideSlider).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(200)

      expect(this.plugin.hideSlider).toHaveBeenCalledTimes(1)
    })
  })

  describe('setValueFromInputSlider method', () => {
    test('sets _isDragging flag to true', () => {
      this.plugin._isDragging = false
      this.plugin.setValueFromInputSlider({ target: { value: 0 } })

      expect(this.plugin._isDragging).toBeTruthy()
    })

    test('calls updateSliderPercentage method with event.target.value', () => {
      jest.spyOn(this.plugin, 'updateSliderPercentage')
      this.plugin.setValueFromInputSlider({ target: { value: 50 } })

      expect(this.plugin.updateSliderPercentage).toHaveBeenCalledWith(50)
    })

    test('calls setValue method with event.target.value', () => {
      jest.spyOn(this.plugin, 'setValue')
      this.plugin.setValueFromInputSlider({ target: { value: 50 } })

      expect(this.plugin.setValue).toHaveBeenCalledWith(50)
    })
  })

  describe('clearHideTimeout method', () => {
    test('sets _isDragging flag to false', () => {
      this.plugin._isDragging = true
      this.plugin.clearHideTimeout()

      expect(this.plugin._isDragging).toBeFalsy()
    })
  })

  describe('toggle method', () => {
    test('calls setValue method with 0 if currentValue is greater than 0', () => {
      jest.spyOn(this.plugin, 'setValue')
      this.plugin.currentValue = 100
      this.plugin.toggle()

      expect(this.plugin.setValue).toHaveBeenCalledWith(0)
    })

    test('calls setValue method with 100 if _lastValue is equal 0 and currentValue is smaller or equal 0', () => {
      jest.spyOn(this.plugin, 'setValue')
      this.plugin.currentValue = 0
      this.plugin._lastValue = 0
      this.plugin.toggle()

      expect(this.plugin.setValue).toHaveBeenCalledWith(100)
    })

    test('calls setValue method with _lastValue if _lastValue is not equal 0 and currentValue is smaller or equal 0', () => {
      jest.spyOn(this.plugin, 'setValue')
      this.plugin.currentValue = 0
      this.plugin._lastValue = 50
      this.plugin.toggle()

      expect(this.plugin.setValue).toHaveBeenCalledWith(50)
    })
  })

  describe('setValueFromClickIcon method', () => {
    test('calls updateSliderPercentage method with value', () => {
      jest.spyOn(this.plugin, 'updateSliderPercentage')
      this.plugin.setValueFromClickIcon(50)

      expect(this.plugin.updateSliderPercentage).toHaveBeenCalledWith(50)
    })

    test('calls setValue method with value', () => {
      jest.spyOn(this.plugin, 'setValue')
      this.plugin.setValueFromClickIcon(50)

      expect(this.plugin.setValue).toHaveBeenCalledWith(50)
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
