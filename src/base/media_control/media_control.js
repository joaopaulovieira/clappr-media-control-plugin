import { UICorePlugin, Events, Styler, template, version } from '@clappr/core'

import pluginStyle from './public/media_control.scss'
import defaultTemplateHtml from './public/default_template.html'

export default class MediaControlPlugin extends UICorePlugin {
  get name() { return 'media_control' }

  get supportedVersion() { return { min: version } }

  get attributes() { return { class: 'media-control' } }

  get defaultTemplate() { return template(defaultTemplateHtml) }

  get config() { return this.options.mediaControl }

  get layersQuantity() { return this.config && this.config.layersQuantity }

  get layersSettings() { return this.config && this.config.layersConfig }

  get disableBeforeVideoStarts() { return this.config && this.config.disableBeforeVideoStarts }

  constructor(core) {
    super(core)
    this.disableBeforeVideoStarts && this.$el[0].classList.add('media-control--hide')
  }

  bindEvents() {
    const coreEventListenerData = [
      { object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged },
      { object: this.core, event: Events.CORE_MOUSE_MOVE, callback: this.show },
      { object: this.core, event: Events.CORE_MOUSE_LEAVE, callback: this.hide },
    ]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.playback && this.stopListening(this.playback)

    this.container = this.core.activeContainer
    this.playback = this.core.activePlayback

    this.bindContainerEvents()
    this.bindPlaybackEvents()
  }

  bindContainerEvents() {
    const containerEventListenerData = [
      { object: this.container, event: Events.CONTAINER_STOP, callback: this.resetVideoStartedStatus },
      { object: this.container, event: Events.CONTAINER_ENDED, callback: this.resetVideoStartedStatus },
    ]
    this.container && containerEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  bindPlaybackEvents() {
    const playbackEventListenerData = [{ object: this.playback, event: Events.PLAYBACK_PLAY_INTENT, callback: this.setVideoStartedStatus }]
    this.playback && playbackEventListenerData.forEach(item => this.listenToOnce(item.object, item.event, item.callback))
  }

  show() {
    if (!this.isVideoStarted) return
    clearTimeout(this._hideId)
    this._hideId = setTimeout(() => this.hide(), 2000)
    this.$el[0].classList.remove('media-control--hide')
    this.core.trigger(Events.MEDIACONTROL_SHOW)
  }

  hide() {
    if (!this.isVideoStarted) return
    this.$el[0].classList.add('media-control--hide')
    this.core.trigger(Events.MEDIACONTROL_HIDE)
  }

  setVideoStartedStatus() {
    this.isVideoStarted = true
    !this.disableBeforeVideoStarts && this.hide()
  }

  resetVideoStartedStatus() {
    this.disableBeforeVideoStarts ? this.hide() : this.show()
    this.isVideoStarted = false
    this.bindPlaybackEvents()
  }

  render() {
    if (this.isRendered) return
    this.buildTemplate()
    this.cacheElements()
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.core.$el[0].append(this.$el[0])
    this.isRendered = true
    return this
  }

  buildTemplate() {
    !this.layersQuantity || this.layersQuantity <= 0
      ? this.$el.html(this.defaultTemplate({ options: this.options }))
      : this.buildLayers()
  }

  buildLayers() {
    for (let index = 1; index <= this.layersQuantity; index++) {
      const layerElement = document.createElement('div')
      const config = this.layersSettings && this.layersSettings.find(config => config.id === index)
      const sectionsDirection = !config || typeof config.flexDirection === 'undefined' ? 'column' : config.flexDirection

      layerElement.style.flexDirection = sectionsDirection
      layerElement.classList.add('media-control__layers', `media-control__layer-${index}`)

      config && config.sectionsQuantity && config.sectionsQuantity > 0 && this.buildSections(layerElement, config, sectionsDirection)

      this.$el[0].appendChild(layerElement)
    }
  }

  buildSections(layerElement, layerConfig, sectionsDirection) {
    for (let index = 1; index <= layerConfig.sectionsQuantity; index++) {
      const section = document.createElement('div')

      section.classList.add('media-control__sections', `media-control__section-${index}`)

      layerElement.appendChild(section)
    }
  }

  cacheElements() {
    this.$layers = this.$el[0].querySelectorAll('.media-control__layers')
  }

  destroy() {
    this.isRendered = false
    super.destroy()
  }
}
