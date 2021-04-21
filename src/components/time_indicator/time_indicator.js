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

  get defaultTime() { return '00:00' }

  bindEvents() {
    const coreEventListenerData = [
      { object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged },
      { object: this.core, event: Events.Custom.MEDIA_CONTROL_SEEK_BAR_START_DRAGGING, callback: this.onStartDraggingSeekBar },
      { object: this.core, event: Events.Custom.MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING, callback: this.onStopDraggingSeekBar },
    ]
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
    const containerEventListenerData = [
      { object: this.container, event: Events.CONTAINER_TIMEUPDATE, callback: this.onTimeUpdate },
      { object: this.container, event: Events.CONTAINER_DESTROYED, callback: this.onContainerDestroyed },
    ]
    this.container && containerEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onTimeUpdate(time) {
    if (time.current === null || time.total === null || this._isDragging) return

    const position = Utils.formatTime(Math.floor(time.current))
    const duration = Utils.formatTime(Math.floor(time.total))

    position !== this.$position.textContent && this.setPosition(position)
    duration !== this.$duration.textContent && this.setDuration(duration)
  }

  setPosition(position) {
    this.$position.textContent = position
  }

  setDuration(duration) {
    this.$duration.textContent = duration
  }

  onContainerDestroyed() {
    this.setPosition(this.defaultTime)
    this.setDuration(this.defaultTime)
  }

  onStartDraggingSeekBar(data) {
    this._isDragging = true
    const position = Utils.formatTime(Math.floor(data.event.target.value))
    position !== this.$position.textContent && this.setPosition(position)
  }

  onStopDraggingSeekBar() {
    this._isDragging = false
  }

  render() {
    if (this.isRendered) return
    this.el.innerHTML = ''
    this.$el.html(this.template({ options: this.options }))
    this.cacheElements()
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.isRendered = true
    super.render()
  }

  cacheElements() {
    this.$position = this.$el[0].querySelector('.time-indicator__position')
    this.$separator = this.$el[0].querySelector('.time-indicator__separator')
    this.$duration = this.$el[0].querySelector('.time-indicator__duration')
  }
}
