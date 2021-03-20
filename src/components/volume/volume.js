import { Browser, Events, Styler, Utils, template } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

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
