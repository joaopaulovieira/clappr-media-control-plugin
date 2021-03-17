import { UICorePlugin, Events, Styler, template, version } from '@clappr/core'

import pluginStyle from './public/media_control.scss'
import defaultTemplateHtml from './public/default_template.html'

export default class MediaControlPlugin extends UICorePlugin {
  get name() { return 'media_control' }

  get supportedVersion() { return { min: version } }

  get attributes() { return { class: 'media-control' } }

  get defaultTemplate() { return template(defaultTemplateHtml) }

  bindEvents() {
    const coreEventListenerData = [
      { object: this.core, event: Events.CORE_ACTIVE_CONTAINER_CHANGED, callback: this.onContainerChanged },
      { object: this.core, event: Events.CORE_MOUSE_MOVE, callback: this.show },
      { object: this.core, event: Events.CORE_MOUSE_LEAVE, callback: this.hide },
    ]
    coreEventListenerData.forEach(item => this.stopListening(item.object, item.event, item.callback))
    coreEventListenerData.forEach(item => this.listenTo(item.object, item.event, item.callback))
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)

    this.container = this.core.activeContainer

  }

  show() {
    this.$el[0].classList.remove('media-control--hide')
    this.core.trigger(Events.MEDIACONTROL_SHOW)
  }

  hide() {
    this.$el[0].classList.add('media-control--hide')
    this.core.trigger(Events.MEDIACONTROL_HIDE)
  }

  render() {
    if (this.isRendered) return
    this.$el.html(this.defaultTemplate({ options: this.options }))
    this.cacheElements()
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this.core.$el[0].append(this.$el[0])
    this.isRendered = true
    return this
  }

  cacheElements() {
    this.$layers = this.$el[0].querySelectorAll('.media-control__layers')
  }

  destroy() {
    this.isRendered = false
    super.destroy()
  }
}
