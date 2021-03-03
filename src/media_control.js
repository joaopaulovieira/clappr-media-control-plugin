import { UICorePlugin, Events, Styler, template, version } from '@clappr/core'

import pluginStyle from './public/media_control.scss'
import templateHtml from './public/media_control.html'

export default class MediaControlPlugin extends UICorePlugin {
  get name() { return 'media_control' }

  get supportedVersion() { return { min: version } }

  get attributes() { return { class: 'media-control' } }

  get template() { return template(templateHtml) }

  get events() {
    const events = { click: 'onClick' }
    return events
  }

  constructor(core) {
    super(core)
    this.init()
  }

  init() {
    this.bindEvents()
  }

  bindEvents() {
    const coreEventListenerData = [
      { object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged },
      { object: this.core, event: Events.CORE_RESIZE, callback: this.registerPlayerResize },
    ]

    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  bindContainerEvents() {
    const containerEventListenerData = [
      { object: this.container, event: Events.CONTAINER_PAUSE, callback: this.hide },
      { object: this.container, event: Events.CONTAINER_PLAY, callback: this.show },
    ]
    this.container && containerEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  registerPlayerResize(size) {
    if (!size.width || typeof size.width !== 'number') return
    this.playerSize = size
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.container = this.core.activeContainer
    this.bindContainerEvents()
  }

  destroy() {
    this.isRendered = false
    super.destroy()
  }

  onClick() {
    console.log('test') // eslint-disable-line no-console
  }

  show() {
    this.$container.removeClass('layer--disabled')
  }

  hide() {
    this.$container.addClass('layer--disabled')
  }

  cacheElements() {
    this.$container = this.$el.find('.layer')
  }

  render() {
    if (this.isRendered) return
    this.$el.html(this.template({ options: this.options }))
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.core.$el[0].append(this.$el[0])
    this.cacheElements()
    this.isRendered = true
    return this
  }
}
