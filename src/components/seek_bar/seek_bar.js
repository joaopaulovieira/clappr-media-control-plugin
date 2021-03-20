import { Browser, Events, Playback, Styler } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

export default class SeekBarPlugin extends MediaControlComponentPlugin {
  get name() { return 'seek_bar' }

  get layer() { return 1 }

  get section() { return 2 }

  get position() { return 1 }

  get tagName() { return 'input' }

  get attributes() {
    return {
      class: 'seek-bar',
      type: 'range',
      value: 0,
      max: 100,
    }
  }
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
    const containerEventListenerData = [
      { object: this.container, event: Events.CONTAINER_TIMEUPDATE, callback: this.onTimeUpdate },
      { object: this.container, event: Events.CONTAINER_PROGRESS, callback: this.onContainerProgress },
    ]
    this.container && containerEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onTimeUpdate(time) {
    const position = Math.floor(time.current)
    const duration = Math.floor(time.total)

    position !== parseInt(this.$el[0].value, 10) && this.updatePosition(position, duration)
    duration !== parseInt(this.$el[0].max, 10) && this.updateDuration(duration)
  }

  updatePosition(position, duration) {
    this.$el[0].value = position
    this.$el[0].style.setProperty('--seek-before-width', `${position / duration * 100}%`)
  }

  updateDuration(duration) {
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

  render() {
    if (this.isRendered) return
    this.el.innerHTML = ''
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.isRendered = true
    return this
  }
}
