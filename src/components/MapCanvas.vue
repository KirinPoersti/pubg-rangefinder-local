<script lang = 'ts'>
import markerSvg from '@/assets/svg/map-marker.svg';
import gridBg from '@/assets/svg/microgrid.svg';
import type { ICoords } from '@/libs/types';
import { calcDistance, getMiddlePoint } from '@/libs/distance';
import { getMapParams } from '@/libs/mapsParams';

import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

declare interface BaseComponentData {
  currentMap: string;
  currentZoom: number;
  wrapper: HTMLDivElement | null;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  image: HTMLImageElement | null;
  backgroundImg: HTMLImageElement | null;
  markerImg: HTMLImageElement | null;
  gridImage: HTMLImageElement | null;
  dragging: boolean;
  movingMarker: number | null;
  touchStart: ICoords;
  pointerDown: ICoords;
  pointerMoved: boolean;
  lastTapTime: number;
  lastTapCoords: ICoords;
  activePointers: Map<number, ICoords>;
  pinching: boolean;
  pinchGesture: boolean;
  pinchStartDistance: number;
  pinchStartZoom: number;
  pinchAnchor: ICoords;
  currentOffset: ICoords;
  coordsStart: ICoords;
  dots: Array<ICoords>;
  maploading: boolean;
}

const emptyCoords: ICoords = { x: 0, y: 0 };

const [MIN_ZOOM, MAX_ZOOM, ZOOM_STEP] = [0.2, 1.5, 0.1];

export default {
  props: {
    mapName: {
      type: String,
      required: true,
    }
  },
  data(): BaseComponentData {
    return {
      currentMap: this.mapName,
      currentZoom: 0,
      wrapper: null,
      canvas: null,
      context: null,
      image: null,
      backgroundImg: null,
      markerImg: null,
      gridImage: null,
      dragging: false,
      movingMarker: null,
      touchStart: { ...emptyCoords },
      pointerDown: { ...emptyCoords },
      pointerMoved: false,
      lastTapTime: 0,
      lastTapCoords: { ...emptyCoords },
      activePointers: new Map<number, ICoords>(),
      pinching: false,
      pinchGesture: false,
      pinchStartDistance: 0,
      pinchStartZoom: 0,
      pinchAnchor: { ...emptyCoords },
      currentOffset: { ...emptyCoords },
      coordsStart: { ...emptyCoords },
      dots: [],
      maploading: true
    }
  },
  mounted() {
    const mapParams = getMapParams(this.mapName);
    if (!mapParams) return;

    this.currentZoom = mapParams.defaultZoom;

    this.wrapper = this.$refs.canvaWrapperRef as HTMLDivElement;
    this.canvas = this.$refs.canvaRef as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');

    this.image = new Image();
    this.image.src = mapParams.layout;

    this.markerImg = new Image();
    this.markerImg.src = markerSvg;

    this.backgroundImg = new Image();
    this.backgroundImg.src = gridBg;

    window.addEventListener('resize', this.handleResize);

    this.image.onload = () => {
      if (this.image !== null) {
        this.canvas!.width = this.wrapper!.offsetWidth;
        this.canvas!.height = this.wrapper!.offsetHeight;

        this.gridImage = new Image();
        this.gridImage.src = mapParams.grid;

        this.gridImage.onload = () => {
          this.setZoom();
          this.draw();

          this.maploading = false;
        }
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    drawBackground() {
      const context = this.canvas?.getContext("2d");
      context!.clearRect(0, 0, this.canvas!.width / this.currentZoom, this.canvas!.height / this.currentZoom);
      context!.drawImage(this.backgroundImg!, 0, 0, this.canvas!.width / this.currentZoom, this.canvas!.height / this.currentZoom);
    },

    setZoom() {
      const context = this.canvas?.getContext("2d");
      context!.setTransform(1, 0, 0, 1, 0, 0);
      context!.scale(this.currentZoom, this.currentZoom);
    },

    draw() {
      this.drawBackground();

      const canvas = this.$refs.canvaRef as HTMLCanvasElement;
      const context = canvas?.getContext("2d");

      this.currentOffset = this.clampPanOffset(this.currentOffset);

      const x = (canvas!.width / this.currentZoom - this.image!.width) / 2;
      const y = (canvas!.height / this.currentZoom - this.image!.height) / 2;

      this.coordsStart = {
        x: x - this.currentOffset.x,
        y: y - this.currentOffset.y,
      };

      context!.drawImage(
        this.image!,
        this.coordsStart.x,
        this.coordsStart.y,
      );

      context!.drawImage(
        this.gridImage!,
        this.coordsStart.x,
        this.coordsStart.y,
      );

      this.drawMarks();
    },

    getPanLimits(): ICoords {
      if (!this.canvas || !this.image || this.currentZoom <= 0) {
        return { ...emptyCoords };
      }

      return {
        x: Math.max(0, (this.image.width - this.canvas.width / this.currentZoom) / 2),
        y: Math.max(0, (this.image.height - this.canvas.height / this.currentZoom) / 2),
      };
    },

    clampPanOffset(offset: ICoords): ICoords {
      const limits = this.getPanLimits();

      return {
        x: Math.max(-limits.x, Math.min(limits.x, offset.x)),
        y: Math.max(-limits.y, Math.min(limits.y, offset.y)),
      };
    },

    handleResize() {
      if (!this.wrapper || !this.canvas || this.maploading) return;

      this.canvas.width = this.wrapper.offsetWidth;
      this.canvas.height = this.wrapper.offsetHeight;
      this.currentOffset = this.clampPanOffset(this.currentOffset);
      this.setZoom();
      this.draw();
    },

    drawMarks() {
      for (const dot of this.dots) {
        this.context!.drawImage(
          this.markerImg!,
          this.coordsStart.x + dot.x - this.markerImg!.width / this.currentZoom / 2,
          this.coordsStart.y + dot.y - this.markerImg!.height / this.currentZoom,

          this.markerImg!.width / this.currentZoom,
          this.markerImg!.height / this.currentZoom
        );
      }

      if (this.dots.length === 2) {
        const range = calcDistance(this.dots);
        this.drawLine();
        this.drawRangeValue(range);
      }
    },

    drawLine() {
      this.context!.beginPath();
      this.context!.moveTo(this.coordsStart.x + this.dots[0].x, this.coordsStart.y + this.dots[0].y);
      this.context!.lineTo(this.coordsStart.x + this.dots[1].x, this.coordsStart.y + this.dots[1].y);
      this.context!.strokeStyle = "yellow";
      this.context!.lineWidth = 1.5 / this.currentZoom;
      this.context!.stroke();
    },

    drawRangeValue(distance: number) {
      const middlePoint = getMiddlePoint(this.dots);
      if (!middlePoint) return;

      const labelPos: ICoords = {
        x: this.coordsStart.x + middlePoint.x - 30 / this.currentZoom,
        y: this.coordsStart.y + middlePoint.y + 10 / this.currentZoom
      }

      const labelWidth = distance > 999 ? 80 : 65;

      const path = new Path2D();
      path.rect(
        labelPos.x - 5 / this.currentZoom,
        labelPos.y - 25 / this.currentZoom,
        labelWidth / this.currentZoom,
        30 / this.currentZoom
      );

      this.context!.fillStyle = "gray";
      this.context!.shadowBlur = 20;
      this.context!.shadowColor = "black";
      this.context!.fill(path);
      this.context!.shadowBlur = 0;

      const textSize = (28 / this.currentZoom).toFixed(0);

      this.context!.font = `${textSize}px Verdana`;
      this.context!.fillStyle = "yellow";
      this.context!.fillText(distance.toFixed(0), labelPos.x, labelPos.y);
    },

    placeMarks(coords: ICoords) {
      if (this.dots.length < 2) {
        this.dots.push(coords);
        this.drawMarks();
      }
      else {
        this.dots = [coords];
        this.draw();
      }
    },

    moveMarker(index: number, coords: ICoords) {
      // TODO: need optimizations
      this.dots[index] = coords;
      this.draw();
    },

    handleZoom(direction: 'inc' | 'dec') {
      const limit = direction === "inc" ? MAX_ZOOM : MIN_ZOOM;
      if (this.currentZoom === limit) return;

      const delta = direction === "inc" ? ZOOM_STEP : -ZOOM_STEP;
      this.currentZoom = +(this.currentZoom + delta).toFixed(2);
      this.currentOffset = this.clampPanOffset(this.currentOffset);

      this.setZoom();
      this.draw();
    },

    incZoom() {
      this.handleZoom('inc');
    },

    decZoom() {
      this.handleZoom('dec');
    },

    getClickCoordsOverCanvas(coords: ICoords) {
      const boundingRect = this.canvas!.getBoundingClientRect();

      const clickCoords: ICoords = {
        x: -this.coordsStart.x + (coords.x - boundingRect.x) / this.currentZoom,
        y: -this.coordsStart.y + (coords.y - boundingRect.y) / this.currentZoom
      }

      return clickCoords;
    },

    getMarkerUnderCursor(coords: ICoords): number | null {

      const clickCoords = this.getClickCoordsOverCanvas(coords);

      for (const [index, dot] of this.dots.entries()) {
        if (
          clickCoords.x >= dot.x - this.markerImg!.width / this.currentZoom / 2
          &&
          clickCoords.x <= dot.x + this.markerImg!.width / this.currentZoom / 2
          &&
          clickCoords.y >= dot.y - this.markerImg!.height / this.currentZoom
          &&
          clickCoords.y <= dot.y

        ) return index;
      }

      return null;
    },


    handleWheel(event: WheelEvent) {
      if (this.dragging) return;
      const { deltaY } = event;
      (deltaY > 0) ? this.decZoom() : this.incZoom();
    },

    handleMouseDown(event: PointerEvent) {
      if (event.button == 0) {

        this.canvas?.setPointerCapture(event.pointerId);

        this.pointerDown = { x: event.clientX, y: event.clientY };
        this.pointerMoved = false;

        if (event.pointerType !== 'mouse') {
          if (this.activePointers.size < 2) {
            this.activePointers.set(event.pointerId, {
              x: event.clientX,
              y: event.clientY
            });
          }

          if (this.activePointers.size === 2) {
            if (!this.pinching) this.startPinch();
            return;
          }

          if (this.pinchGesture) return;
        }

        if (this.dots.length > 0) {

          const markerUnderCursor = this.getMarkerUnderCursor({ x: event.clientX, y: event.clientY });

          if (markerUnderCursor !== null) {
            this.movingMarker = markerUnderCursor;
            return;
          }

        }

        this.touchStart.x = event.clientX;
        this.touchStart.y = event.clientY;
        this.dragging = true;

      }
      else if (event.button == 2) {
        const boundingRect = this.canvas!.getBoundingClientRect();

        const dotCoords: ICoords = {
          x: -this.coordsStart.x + (event.clientX - boundingRect.x) / this.currentZoom,
          y: -this.coordsStart.y + (event.clientY - boundingRect.y) / this.currentZoom
        }

        this.placeMarks(dotCoords);
      }
    },

    handleMouseUp(event: PointerEvent) {
      const wasMovingMarker = this.movingMarker !== null;
      const wasPinchGesture = this.pinchGesture;

      if (event.pointerType !== 'mouse') {
        this.activePointers.delete(event.pointerId);
      }

      if (
        event.type !== 'pointercancel'
        && event.pointerType !== 'mouse'
        && !this.pointerMoved
        && !wasMovingMarker
        && !wasPinchGesture
      ) {
        this.handleTouchTap({ x: event.clientX, y: event.clientY });
      }

      this.dragging = false;
      this.movingMarker = null;

      if (this.canvas?.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }

      if (this.activePointers.size < 2) {
        this.pinching = false;
        this.pinchStartDistance = 0;
      }

      if (this.activePointers.size === 0) {
        this.pinchGesture = false;
      }
    },

    disableContextMenu(event: MouseEvent) {
      event.preventDefault();
    },

    handleMouseMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' && this.activePointers.has(event.pointerId)) {
        this.activePointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        });
      }

      if (this.pinching && this.activePointers.size >= 2) {
        this.handlePinchMove();
        return;
      }

      if (this.dragging) {

        const movement = Math.hypot(
          event.clientX - this.pointerDown.x,
          event.clientY - this.pointerDown.y
        );
        if (movement > 8) this.pointerMoved = true;

        const currentOffset: ICoords = {
          x: this.currentOffset.x + (this.touchStart.x - event.clientX) / this.currentZoom,
          y: this.currentOffset.y + (this.touchStart.y - event.clientY) / this.currentZoom
        }

        this.currentOffset = this.clampPanOffset(currentOffset);
        this.touchStart = { x: event.clientX, y: event.clientY };
        this.draw();

      } else if (this.movingMarker !== null) {
        const coordsUnderCursor = this.getClickCoordsOverCanvas({ x: event.clientX, y: event.clientY });
        this.moveMarker(this.movingMarker, coordsUnderCursor);
      }

    },

    getPinchPoints(): [ICoords, ICoords] | null {
      const points = Array.from(this.activePointers.values());
      if (points.length < 2) return null;
      return [points[0], points[1]];
    },

    getPinchMidpoint(points: [ICoords, ICoords]): ICoords {
      return {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
    },

    getPinchDistance(points: [ICoords, ICoords]): number {
      return Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );
    },

    startPinch() {
      const points = this.getPinchPoints();
      if (!points) return;

      this.pinching = true;
      this.pinchGesture = true;
      this.pointerMoved = true;
      this.dragging = false;
      this.movingMarker = null;
      this.pinchStartDistance = this.getPinchDistance(points);
      this.pinchStartZoom = this.currentZoom;
      this.pinchAnchor = this.getClickCoordsOverCanvas(this.getPinchMidpoint(points));
    },

    handlePinchMove() {
      const points = this.getPinchPoints();
      if (!points || this.pinchStartDistance <= 0 || !this.canvas || !this.image) return;

      const distance = this.getPinchDistance(points);
      const zoomRatio = distance / this.pinchStartDistance;
      const nextZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, this.pinchStartZoom * zoomRatio)
      );
      const midpoint = this.getPinchMidpoint(points);
      const canvasRect = this.canvas.getBoundingClientRect();
      const midpointOnCanvas = {
        x: midpoint.x - canvasRect.x,
        y: midpoint.y - canvasRect.y
      };

      this.currentZoom = +nextZoom.toFixed(3);
      this.currentOffset = this.clampPanOffset({
        x: this.pinchAnchor.x
          - this.image.width / 2
          - (midpointOnCanvas.x - this.canvas.width / 2) / this.currentZoom,
        y: this.pinchAnchor.y
          - this.image.height / 2
          - (midpointOnCanvas.y - this.canvas.height / 2) / this.currentZoom
      });

      this.setZoom();
      this.draw();
    },

    handleTouchTap(coords: ICoords) {
      const now = Date.now();
      const elapsed = now - this.lastTapTime;
      const separation = Math.hypot(
        coords.x - this.lastTapCoords.x,
        coords.y - this.lastTapCoords.y
      );

      if (elapsed > 0 && elapsed <= 360 && separation <= 32) {
        this.placeMarks(this.getClickCoordsOverCanvas(coords));
        this.lastTapTime = 0;
        this.lastTapCoords = { ...emptyCoords };
        return;
      }

      this.lastTapTime = now;
      this.lastTapCoords = { ...coords };
    },
  },
  components: {
    PulseLoader
  }
}
</script>

<template>
<div class="map__wrapper">
  <div class="map__loader" v-if="maploading">
    <pulse-loader :loading="maploading"></pulse-loader>
  </div>
  <div class="map__canvas" ref = "canvaWrapperRef" >
    <div class="map_buttons" >
      <button @click="incZoom" class="map_bttn">+</button>
      <button @click="decZoom" class="map_bttn">-</button>
    </div>
    <div class="map_hint" aria-live="polite">
      <span class="desktop_hint">Right-click to place markers · Drag to move</span>
      <span class="mobile_hint">Double-tap markers · Pinch to zoom · Drag to move</span>
    </div>
    <canvas 
      @contextmenu="disableContextMenu"
      @pointerdown="handleMouseDown"
      @pointerup="handleMouseUp"
      @pointercancel="handleMouseUp"
      @pointermove="handleMouseMove"
      @wheel.prevent="handleWheel"
      ref = "canvaRef"
    ></canvas>
  </div>
</div>
</template>

<style scoped>
.map__loader{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: absolute;
}
.map__canvas{
  position: relative;
  height: 100%;
  width: 100%;
  flex: 1 0 auto;
}
.map__canvas canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;
}
.map__canvas canvas:active {
  cursor: grabbing;
}
.map__wrapper {
  flex: 1 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}
.map_buttons{
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.map_bttn{
  background-color: #151515;
  color: #ffd24a;
  font-size: xx-large;
  cursor: pointer;
  height: 40px;
  width: 40px;
  border: 1px solid #ffd24a;
  border-radius: 4px;
}
.map_hint {
  position: absolute;
  left: 50%;
  bottom: 14px;
  z-index: 1;
  transform: translateX(-50%);
  padding: 6px 10px;
  border: 1px solid rgb(255 210 74 / 45%);
  border-radius: 4px;
  background: rgb(21 21 21 / 85%);
  color: #ffd24a;
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
}
.mobile_hint {
  display: none;
}

@media (max-width: 700px) {
  .map_buttons {
    top: max(10px, env(safe-area-inset-top));
    right: max(10px, env(safe-area-inset-right));
    gap: 10px;
  }
  .map_bttn {
    width: 48px;
    height: 48px;
    font-size: 2rem;
  }
  .map_hint {
    bottom: max(10px, env(safe-area-inset-bottom));
    max-width: calc(100% - 20px);
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.72rem;
  }
  .desktop_hint {
    display: none;
  }
  .mobile_hint {
    display: inline;
  }
}

</style>
