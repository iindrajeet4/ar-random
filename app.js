/* บังคับให้วิดีโอสตรีมของกล้องแสดงผลเต็มจอและอยู่ด้านหลังสุด */
body {
    margin: 0;
    overflow: hidden;
}

#mindar-video {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    z-index: 0 !important;
}

a-scene {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background: transparent !important;
}
