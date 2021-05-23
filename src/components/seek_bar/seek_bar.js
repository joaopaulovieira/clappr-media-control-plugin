import { Browser, Events, Playback, Styler } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import pluginStyle from './public/style.scss'

export const INITIAL_POSITION = 0
export const INITIAL_DURATION = 100

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
      class: 'seek-bar seek-bar--disable-interaction',
      type: 'range',
      value: INITIAL_POSITION,
      max: INITIAL_DURATION,
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
    this.setDefaultProperties()
    this.container && this.stopListening(this.container)
    this.playback && this.stopListening(this.playback)
    this.container = this.core.activeContainer
    this.playback = this.core.activePlayback
    if (!this.container) return
    this.bindContainerEvents()
    this.bindPlaybackEvents()
  }

  bindContainerEvents() {
    this.listenTo(this.container, Events.CONTAINER_PROGRESS, this.onContainerProgress)
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

  bindPlaybackEvents() {
    this.listenToOnce(this.playback, Events.PLAYBACK_PLAY, this.onFirstPlay)
  }

  onFirstPlay() {
    if (!this.shouldDisableInteraction) {
      this.$el[0].classList.remove('seek-bar--disable-interaction')
      return this.listenTo(this.container, Events.CONTAINER_TIMEUPDATE, this.onTimeUpdate)
    }
    this.$el[0].value = this.$el[0].max // Fix bar at end for Live medias without DVR
    this.$el[0].style.setProperty('--seek-before-width', `${this.$el[0].value}%`)
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
    this.$el[0].style.setProperty('--seek-before-width', `${percentage}%`)
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

  setDefaultProperties() {
    this.$el[0].value = INITIAL_POSITION
    this.$el[0].max = INITIAL_DURATION
    this.$el[0].classList.add('seek-bar--disable-interaction')
  }
}
