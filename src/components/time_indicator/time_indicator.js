import { Events, Playback, Styler, Utils, template } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import pluginStyle from './public/style.scss'
import templateHTML from './public/template.html'

export const DEFAULT_TIME = '00:00'

export default class TimeIndicatorPlugin extends MediaControlComponentPlugin {
  get name() { return 'time_indicator' }

  get config() { return this.options.mediaControl && this.options.mediaControl.timeIndicatorComponent }

  get layer() { return this.config && this.config.layer || 1 }

  get section() { return this.config && this.config.section || 2 }

  get position() { return this.config && this.config.position || 2 }

  get separator() { return this.config && typeof this.config.separator !== 'undefined' ? this.config.separator : null }

  get attributes() { return { class: 'time-indicator' } }

  get template() { return template(templateHTML) }

  get isLiveMedia() { return this.playback.getPlaybackType() === Playback.LIVE }

  get shouldDisableInteraction() { return this.isLiveMedia && !this.container.isDvrEnabled() }

  bindEvents() {
    const coreEventListenerData = [
      { object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged },
      { object: this.core, event: Events.Custom.MEDIA_CONTROL_SEEK_BAR_START_DRAGGING, callback: this.onStartDraggingSeekBar },
      { object: this.core, event: Events.Custom.MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING, callback: this.onStopDraggingSeekBar },
    ]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  setInitialState() {
    this.setPosition(DEFAULT_TIME)
    this.setDuration(DEFAULT_TIME)
    this.$el[0].classList.remove('time-indicator--disabled')
  }

  onContainerChanged() {
    this.setInitialState()

    this.container && this.stopListening(this.container)
    this.playback && this.stopListening(this.playback)

    this.container = this.core.activeContainer
    this.playback = this.core.activePlayback

    if (!this.container) return
    this.bindPlaybackEvents()
  }

  bindPlaybackEvents() {
    this.listenToOnce(this.playback, Events.PLAYBACK_PLAY, this.onFirstPlay)
  }

  onFirstPlay() {
    this.shouldDisableInteraction
      ? this.$el[0].classList.add('time-indicator--disabled')
      : this.listenTo(this.container, Events.CONTAINER_TIMEUPDATE, this.onTimeUpdate)
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
    this.$el.html(this.template({ defaultValue: DEFAULT_TIME }))
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
