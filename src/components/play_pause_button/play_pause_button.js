import { Events, Playback, Styler } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

import playIcon from './public/play_icon.svg'
import pauseIcon from './public/pause_icon.svg'
import stopIcon from './public/stop_icon.svg'
import pluginStyle from './public/style.scss'

export default class PlayPauseButtonPlugin extends MediaControlComponentPlugin {
  get name() { return 'play_pause_button' }

  get config() { return this.options.mediaControl && this.options.mediaControl.playPauseComponent }

  get layer() { return this.config && this.config.layer || 1 }

  get section() { return this.config && this.config.section || 1 }

  get position() { return this.config && this.config.position || 1 }

  get separator() { return this.config && typeof this.config.separator !== 'undefined' ? this.config.separator : null }

  get tagName() { return 'button' }

  get attributes() { return { class: 'play-pause-button media-control__button' } }

  get events() {
    const events = { click: this.toggle }
    return events
  }

  get isLiveMedia() { return this.playback.getPlaybackType() === Playback.LIVE }

  get shouldStopMedia() { return this.isLiveMedia && !this.container.isDvrEnabled() }

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
  }

  bindContainerEvents() {
    const containerEventListenerData = [
      { object: this.container, event: Events.CONTAINER_PLAY, callback: this.changeIcon },
      { object: this.container, event: Events.CONTAINER_PAUSE, callback: this.changeIcon },
      { object: this.container, event: Events.CONTAINER_STOP, callback: this.changeIcon },
      { object: this.container, event: Events.CONTAINER_ENDED, callback: this.changeIcon },
      { object: this.container, event: Events.CONTAINER_DESTROYED, callback: this.onContainerDestroyed },
    ]
    this.container && containerEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  changeIcon() {
    this.$el[0].innerHTML = ''
    if (this.container && this.container.isPlaying()) {
      this.shouldStopMedia ? this.$el.append(stopIcon) : this.$el.append(pauseIcon)
      this.core.trigger(Events.MEDIACONTROL_PLAYING)
    } else {
      this.$el.append(playIcon)
      this.core.trigger(Events.MEDIACONTROL_NOTPLAYING)
    }
  }

  onContainerDestroyed() {
    this.$el[0].innerHTML = ''
    this.$el.append(playIcon)
  }

  toggle() {
    this.container.isPlaying()
      ? this.shouldStopMedia ? this.container.stop() : this.container.pause()
      : this.container.play()
  }

  render() {
    if (this.isRendered) return
    this.$el[0].innerHTML = ''
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.changeIcon()
    this.isRendered = true
    super.render()
  }
}
