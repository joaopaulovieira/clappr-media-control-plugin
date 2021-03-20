import { Events, Styler, Utils, template } from '@clappr/core'
import MediaControlComponentPlugin from '../../base/media_control_component/media_control_component'

export default class TimeIndicatorPlugin extends MediaControlComponentPlugin {
  get name() { return 'time_indicator' }

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
    this.isRendered = true
    return this
  }
}
