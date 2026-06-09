import L from 'leaflet'

/**
 * 平滑滚轮缩放
 * 改编自 Leaflet.SmoothWheelZoom（Mutsuyuki Tanaka, MIT）
 * https://github.com/Mutsuyuki/Leaflet.SmoothWheelZoom
 *
 * Leaflet 自带的滚轮缩放是「攒一下→跳一级」的离散动画，滚起来一顿一顿。
 * 这个 handler 用 requestAnimationFrame 每帧朝目标缩放级缓动，过渡连续顺滑。
 *
 * 用法：side-effect 引入本文件，建图时传 { scrollWheelZoom:false, smoothWheelZoom:true }。
 */

declare module 'leaflet' {
  interface MapOptions {
    smoothWheelZoom?: boolean | 'center'
    /** 灵敏度，越大滚得越快，默认 1 */
    smoothSensitivity?: number
  }
}

// Leaflet 的 Handler/内部方法没有类型，这里整体按 any 操作
const LL = L as unknown as Record<string, any>

LL.Map.mergeOptions({
  smoothWheelZoom: true,
  smoothSensitivity: 1,
})

LL.Map.SmoothWheelZoom = LL.Handler.extend({
  addHooks(this: any) {
    LL.DomEvent.on(this._map._container, 'wheel', this._onWheelScroll, this)
  },

  removeHooks(this: any) {
    LL.DomEvent.off(this._map._container, 'wheel', this._onWheelScroll, this)
  },

  _onWheelScroll(this: any, e: WheelEvent) {
    if (!this._isWheeling) this._onWheelStart(e)
    this._onWheeling(e)
  },

  _onWheelStart(this: any, e: WheelEvent) {
    const map = this._map
    this._isWheeling = true
    this._wheelMousePosition = map.mouseEventToContainerPoint(e)
    this._centerPoint = map.getSize()._divideBy(2)
    this._startLatLng = map.containerPointToLatLng(this._centerPoint)
    this._wheelStartLatLng = map.containerPointToLatLng(this._wheelMousePosition)
    this._startZoom = map.getZoom()
    this._moved = false
    this._zooming = true

    map._stop()
    if (map._panAnim) map._panAnim.stop()

    this._goalZoom = map.getZoom()
    this._prevCenter = map.getCenter()
    this._prevZoom = map.getZoom()

    this._zoomAnimationId = requestAnimationFrame(this._updateWheelZoom.bind(this))
  },

  _onWheeling(this: any, e: WheelEvent) {
    const map = this._map
    this._goalZoom += LL.DomEvent.getWheelDelta(e) * 0.003 * map.options.smoothSensitivity
    if (this._goalZoom < map.getMinZoom() || this._goalZoom > map.getMaxZoom()) {
      this._goalZoom = map._limitZoom(this._goalZoom)
    }
    this._wheelMousePosition = map.mouseEventToContainerPoint(e)

    clearTimeout(this._timeoutId)
    this._timeoutId = setTimeout(this._onWheelEnd.bind(this), 200)

    LL.DomEvent.preventDefault(e)
    LL.DomEvent.stopPropagation(e)
  },

  _onWheelEnd(this: any) {
    this._isWheeling = false
    cancelAnimationFrame(this._zoomAnimationId)
    this._map._moveEnd(true)
  },

  _updateWheelZoom(this: any) {
    const map = this._map
    if (!map.getCenter().equals(this._prevCenter) || map.getZoom() !== this._prevZoom) return

    this._zoom = map.getZoom() + (this._goalZoom - map.getZoom()) * 0.3
    this._zoom = Math.floor(this._zoom * 100) / 100

    const delta = this._wheelMousePosition.subtract(this._centerPoint)
    if (delta.x === 0 && delta.y === 0) return

    if (map.options.smoothWheelZoom === 'center') {
      this._center = this._startLatLng
    } else {
      this._center = map.unproject(
        map.project(this._wheelStartLatLng, this._zoom).subtract(delta),
        this._zoom,
      )
    }

    if (!this._moved) {
      map._moveStart(true, false)
      this._moved = true
    }

    map._move(this._center, this._zoom)
    this._prevCenter = map.getCenter()
    this._prevZoom = map.getZoom()

    this._zoomAnimationId = requestAnimationFrame(this._updateWheelZoom.bind(this))
  },
})

LL.Map.addInitHook('addHandler', 'smoothWheelZoom', LL.Map.SmoothWheelZoom)
