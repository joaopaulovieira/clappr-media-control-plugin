import { Events, Styler, Utils, template } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import pluginStyle from './public/style.scss'
import templateHTML from './public/template.html'

export default class TimeIndicatorPlugin extends MediaControlComponentPlugin {
  get name() { return 'time_indicator' }

  get layer() { return 1 }

  get section() { return 2 }

  get position() { return 2 }

  get attributes() { return { class: 'time-indicator' } }

  get template() { return template(templateHTML) }

  bindEvents() {
    const coreEventListenerData = [{ object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged }]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.container = this.core.activeContainer
    if (!this.container) return
    this.bindContainerEvents()
  }

  bindContainerEvents() {
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
    this.$position = this.$el[0].querySelector('.time-indicator__position')
    this.$separator = this.$el[0].querySelector('.time-indicator__separator')
    this.$duration = this.$el[0].querySelector('.time-indicator__duration')
  }
}
