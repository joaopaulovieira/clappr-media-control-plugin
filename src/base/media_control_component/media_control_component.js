import { UICorePlugin, version } from '@clappr/core'

export default class MediaControlComponentPlugin extends UICorePlugin {
  get supportedVersion() { return { min: version } }

  get layer() { return null }

  get section() { return null }

  get position() { return null }

  get separator() { return false }

  get mediaControl() { return this._mediaControl || (this._mediaControl = this.core.getPlugin('media_control')) }

  constructor(core) {
    super(core)
    this.$el[0].addEventListener('click', e => { e.stopPropagation() })
  }
}
