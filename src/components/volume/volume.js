import { Browser, Events, Styler, Utils, template } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import volumeOnIcon from './public/volume_on_icon.svg'
import volumeOffIcon from './public/volume_off_icon.svg'

import pluginStyle from './public/style.scss'
import templateHTML from './public/template.html'

export default class VolumePlugin extends MediaControlComponentPlugin {
  get name() { return 'volume' }

  get layer() { return 1 }

  get section() { return 1 }

  get position() { return 2 }

  get separator() { return true }

  get attributes() { return { class: 'volume media-control__button' } }

  get template() { return template(templateHTML) }

  get currentValue() { return this._currentValue }

  set currentValue(value) { this._currentValue = value }

  get events() {
    const touchOnlyEvents = { 'click .volume__icon-container': this.toggle }
    const events = {
      mouseenter: this.showSlider,
      mouseleave: this.hideSlider,
      'input .volume__slider': this.setValueFromInputSlider,
      'click .volume__slider': this.clearHideTimeout,
    }
    return Browser.isMobile ? touchOnlyEvents : { ...events, ...touchOnlyEvents }
  }

  constructor(core) {
    super(core)
    this.persistConfig = this.options.persistConfig
  }

  bindEvents() {
    const coreEventListenerData = [{ object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged }]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.container = this.core.activeContainer
    this.setInitialValue()
  }

  setInitialValue() {
    const value = this.getInitialValue()
    this.setValue(value)
  }

  getInitialValue() {
    let initialValue = this.persistConfig && !isNaN(Utils.Config.restore('volume')) ? Utils.Config.restore('volume') : 100
    this.core.options.mute && (initialValue = 0)
    return initialValue
  }

  setValue(value) {
    this._lastValue = this.currentValue || value
    this.updateIcon(value)
    this.currentValue = value
    this.persistConfig && Utils.Config.persist('volume', value)
    this.$slider.value = value
    this.container.setVolume(value)
  }

  updateIcon(volume) {
    if (volume === this.currentValue || (volume > 0 && this.currentValue > 0)) return
    this.$iconContainer.innerHTML = ''
    volume > 0
      ? this.$iconContainer.append(volumeOnIcon)
      : this.$iconContainer.append(volumeOffIcon)
  }

  showSlider() {
    this.$sliderContainer.classList.remove('volume__slider-container--hide')
  }

  hideSlider() {
    clearTimeout(this._hideTimeoutId)
    this._hideTimeoutId = setTimeout(() => {
      this._isDragging
        ? setTimeout(() => this.hideSlider, 100)
        : this.$sliderContainer.classList.add('volume__slider-container--hide')
    }, 100)
  }

  setValueFromInputSlider(ev) {
    this._isDragging = true
    this.$slider.style.setProperty('--volume-before-width', `${ev.target.value}%`)
    this.setValue(ev.target.value)
  }

  clearHideTimeout() {
    this._isDragging = false
  }

  toggle() {
    this.currentValue > 0
      ? this.setValueFromClickIcon(0)
      : this._lastValue === 0 ? this.setValueFromClickIcon(100) : this.setValueFromClickIcon(this._lastValue)
  }

  setValueFromClickIcon(value) {
    this.$slider.style.setProperty('--volume-before-width', `${value}%`)
    this.setValue(value)
  }

  render() {
    if (this.isRendered) return
    this.el.innerHTML = ''
    this.$el.html(this.template({ options: this.options }))
    this.cacheElements()
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.isRendered = true
    return this
  }

  cacheElements() {
    this.$sliderContainer = this.$el[0].querySelector('.volume__slider-container')
    this.$slider = this.$el[0].querySelector('.volume__slider')
    this.$iconContainer = this.$el[0].querySelector('.volume__icon-container')
  }
}
