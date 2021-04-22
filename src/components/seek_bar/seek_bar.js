import { Browser, Events, Playback, Styler } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import pluginStyle from './public/style.scss'

export default class SeekBarPlugin extends MediaControlComponentPlugin {
  get name() { return 'seek_bar' }

  get config() { return this.options.mediaControl && this.options.mediaControl.seekBarComponent }

  get layer() { return this.config && this.config.layer || 1 }

  get section() { return this.config && this.config.section || 2 }

  get position() { return this.config && this.config.position || 1 }

  get separator() { return this.config && typeof this.config.separator !== 'undefined' ? this.config.separator : null }

  get tagName() { return 'input' }

  get attributes() {
    return {
      class: 'seek-bar',
      type: 'range',
      value: 0,
      max: 100,
    }
  }

  get events() {
    const touchOnlyEvents = {
      touchend: this.seek,
      touchmove: this.updateProgressBarViaInteraction,
    }
    const mouseOnlyEvents = {
      click: this.seek,
      input: this.updateProgressBarViaInteraction,
    }
    return Browser.isMobile ? touchOnlyEvents : mouseOnlyEvents
  }

  get isLiveMedia() { return this.playback.getPlaybackType() === Playback.LIVE }

  get shouldDisableInteraction() { return this.isLiveMedia && !this.container.isDvrEnabled() }

  constructor(core) {
    Events.register('MEDIA_CONTROL_SEEK_BAR_START_DRAGGING')
    Events.register('MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING')
    super(core)
    this._isDragging = false
  }

  bindEvents() {
    const coreEventListenerData = [{ object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged }]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.container = this.core.activeContainer
    this.playback = this.core.activePlayback
    if (!this.container) return
    this.bindContainerEvents()
    this.bindPlaybackEvents()
  }

  bindContainerEvents() {
    const containerEventListenerData = [
      { object: this.container, event: Events.CONTAINER_TIMEUPDATE, callback: this.onTimeUpdate },
      { object: this.container, event: Events.CONTAINER_PROGRESS, callback: this.onContainerProgress },
      { object: this.container, event: Events.CONTAINER_DESTROYED, callback: this.onContainerDestroyed },
    ]
    this.container && containerEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onTimeUpdate(time) {
    if (this._isDragging) return

    const position = Math.floor(time.current)
    const duration = Math.floor(time.total)

    position !== parseInt(this.$el[0].value, 10) && this.updatePosition(position, duration)
    duration !== parseInt(this.$el[0].max, 10) && this.updateDuration(duration)
  }

  updatePosition(position, duration) {
    if (this._isDragging) return
    this.$el[0].value = position
    this.$el[0].style.setProperty('--seek-before-width', `${position / duration * 100}%`)
  }

  updateDuration(duration) {
    if (this._isDragging) return
    this.$el[0].max = duration
  }

  onContainerProgress(progress) {
    const buffered = Math.floor(progress.current)
    const duration = Math.floor(progress.total)

    this.updateBufferedBar(buffered, duration)
  }

  updateBufferedBar(buffered, duration) {
    this.$el[0].style.setProperty('--buffered-width', `${buffered / duration * 100}%`)
  }

  onContainerDestroyed() {
    this.$el[0].classList.remove('seek-bar--disable-interaction')
  }

  bindPlaybackEvents() {
    const playbackEventListenerData = [{ object: this.playback, event: Events.PLAYBACK_PLAY, callback: this.updateStyles }]
    this.playback && playbackEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  updateStyles() {
    this.shouldDisableInteraction
      ? this.$el[0].classList.add('seek-bar--disable-interaction')
      : this.$el[0].classList.remove('seek-bar--disable-interaction')
  }

  updateProgressBarViaInteraction(rangeInput) {
    if (this.shouldDisableInteraction) return
    !this._isDragging && (this._isDragging = true)
    this.$el[0].style.setProperty('--seek-before-width', `${rangeInput.target.value / rangeInput.target.max * 100}%`)
    this.core.trigger(Events.Custom.MEDIA_CONTROL_SEEK_BAR_START_DRAGGING, { event: rangeInput })
  }

  seek(rangeInput) {
    if (this.shouldDisableInteraction) return
    const percentage = rangeInput.target.value / rangeInput.target.max * 100
    this.container.seekPercentage(percentage)
    this._isDragging = false
    this.core.trigger(Events.Custom.MEDIA_CONTROL_SEEK_BAR_STOP_DRAGGING, { event: rangeInput })
  }

  render() {
    if (this.isRendered) return
    this.el.innerHTML = ''
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.isRendered = true
    super.render()
  }
}
