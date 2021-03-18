import { UICorePlugin, Events, Styler, template, version } from '@clappr/core'
import MediaControlComponentPlugin from '../media_control_component/media_control_component'

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

  get cll() {
    if (this._cll) return this._cll
    const { compare } = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
    this._cll = compare
    return this._cll
  }

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
    this.initMediaControlComponents()

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
      const config = layerConfig.sectionsConfig && layerConfig.sectionsConfig.find(config => config.id === index)

      section.classList.add('media-control__sections', `media-control__section-${index}`)

      if (config) {
        config.separator && section.classList.add(`media-control__sections--push-${sectionsDirection}`)
        config.height && (section.style.height = config.height)
        config.width && (section.style.width = config.width)
        config.alignItems && (section.style.alignItems = config.alignItems)
        config.justifyContent && (section.style.justifyContent = config.justifyContent)
        config.flexGrow && (section.style.flexGrow = config.flexGrow)
      }

      layerElement.appendChild(section)
    }
  }

  cacheElements() {
    this.$layers = this.$el[0].querySelectorAll('.media-control__layers')
  }

  initMediaControlComponents() {
    const isMediaControlComponent = plugin => plugin instanceof MediaControlComponentPlugin
    const renderMediaControlComponent = plugin => this.renderMediaControlComponent(plugin)
    this.core.plugins.filter(isMediaControlComponent).forEach(renderMediaControlComponent)
  }

  renderMediaControlComponent(plugin) {
    const { layer, section, position, el } = plugin
    const parentLayer = this.$el[0].querySelector(`.media-control__layer-${layer}`)
    const parentSelector = `.media-control__layer-${layer} .media-control__section-${section}`
    const sectionElement = this.$el[0].querySelector(parentSelector)

    if (position) {
      el.setAttribute('id', position)
      el.classList.add(`media-control__element-${position}`)
    }

    if (sectionElement) {
      const sectionsDirection = parentLayer.style.flexDirection
      const renderedItems = sectionElement.querySelectorAll('.media-control__elements')

      plugin.separator && plugin.$el[0].classList.add(`media-control__elements--push-${sectionsDirection === 'column' ? 'row' : 'column'}`)

      renderedItems.length > 0 && position
        ? this.appendMediaControlComponent(renderedItems, el, sectionElement)
        : sectionElement.append(el)

      plugin.render()
    }
  }

  appendMediaControlComponent(items, item, sectionElement) {
    let firstID = 0
    let lastID = items.length

    while (firstID < lastID) {
      const middleID = (firstID + lastID) >> 1
      this.cll(parseInt(items[middleID].id, 10), parseInt(item.id, 10)) > 0
        ? lastID = middleID
        : firstID = middleID + 1
    }
    if (firstID === 0) return sectionElement.insertAdjacentElement('afterbegin', item)
    const sibling = sectionElement.querySelectorAll('.media-control__elements')[firstID - 1]
    sibling.insertAdjacentElement('afterend', item)
  }

  destroy() {
    this.isRendered = false
    super.destroy()
  }
}
