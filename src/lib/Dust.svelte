<script lang="ts">
  import { onMount } from "svelte";

  const TARGET_FRAME_TIME = 1000 / 24;
  const MAX_PIXEL_RATIO = 1.25;
  const MIN_PARTICLES = 48;
  const MAX_PARTICLES = 160;
  const LOW_POWER_MAX_PARTICLES = 80;
  const PARTICLE_AREA = 12_000;
  const OPACITY_BUCKETS = [0.12, 0.2, 0.3, 0.44] as const;

  type NavigatorWithConnection = Navigator & {
    connection?: {
      saveData?: boolean;
    };
  };

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const isLowPowerDevice =
      navigatorWithConnection.connection?.saveData === true || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let resizeFrame = 0;
    let lastPaintTime = 0;

    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let radius = new Float32Array(0);
    let velocityX = new Float32Array(0);
    let velocityY = new Float32Array(0);
    let brightness = new Float32Array(0);
    let brightnessVelocity = new Float32Array(0);

    const createParticles = (count: number) => {
      x = new Float32Array(count);
      y = new Float32Array(count);
      radius = new Float32Array(count);
      velocityX = new Float32Array(count);
      velocityY = new Float32Array(count);
      brightness = new Float32Array(count);
      brightnessVelocity = new Float32Array(count);

      for (let index = 0; index < count; index += 1) {
        x[index] = Math.random() * width;
        y[index] = Math.random() * height;
        radius[index] = Math.random() < 0.86 ? 0.6 + Math.random() * 0.65 : 1.35 + Math.random() * 0.75;

        const speed = 0.0015 + Math.random() * 0.004;
        const angle = Math.random() * Math.PI * 2;
        velocityX[index] = Math.cos(angle) * speed;
        velocityY[index] = Math.sin(angle) * speed;
        brightness[index] = Math.random();
        brightnessVelocity[index] = (0.00004 + Math.random() * 0.00012) * (Math.random() < 0.5 ? -1 : 1);
      }
    };

    const updateParticles = (elapsed: number) => {
      for (let index = 0; index < x.length; index += 1) {
        x[index] += velocityX[index] * elapsed;
        y[index] += velocityY[index] * elapsed;

        if (x[index] < -2) x[index] = width + 2;
        else if (x[index] > width + 2) x[index] = -2;
        if (y[index] < -2) y[index] = height + 2;
        else if (y[index] > height + 2) y[index] = -2;

        brightness[index] += brightnessVelocity[index] * elapsed;
        if (brightness[index] <= 0) {
          brightness[index] = 0;
          brightnessVelocity[index] = Math.abs(brightnessVelocity[index]);
        } else if (brightness[index] >= 1) {
          brightness[index] = 1;
          brightnessVelocity[index] = -Math.abs(brightnessVelocity[index]);
        }
      }
    };

    const paint = () => {
      context.clearRect(0, 0, width, height);

      // Four batched paths keep draw calls stable as the particle count grows.
      for (let bucket = 0; bucket < OPACITY_BUCKETS.length; bucket += 1) {
        context.beginPath();

        for (let index = 0; index < x.length; index += 1) {
          const particleBucket = Math.min(OPACITY_BUCKETS.length - 1, Math.floor(brightness[index] * OPACITY_BUCKETS.length));
          if (particleBucket !== bucket) continue;

          const size = radius[index] * 2;
          context.rect(x[index] - radius[index], y[index] - radius[index], size, size);
        }

        context.fillStyle = `rgba(226, 235, 255, ${OPACITY_BUCKETS[bucket]})`;
        context.fill();
      }
    };

    const animate = (now: number) => {
      if (document.hidden || reducedMotion.matches || isLowPowerDevice) return;

      const elapsedSincePaint = now - lastPaintTime;
      if (elapsedSincePaint >= TARGET_FRAME_TIME) {
        updateParticles(Math.min(elapsedSincePaint, 100));
        paint();
        lastPaintTime = now - (elapsedSincePaint % TARGET_FRAME_TIME);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const startAnimation = () => {
      stopAnimation();
      lastPaintTime = performance.now();

      if (reducedMotion.matches || isLowPowerDevice || document.hidden) {
        paint();
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.ceil(width * pixelRatio);
      canvas.height = Math.ceil(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const particleLimit = isLowPowerDevice ? LOW_POWER_MAX_PARTICLES : MAX_PARTICLES;
      const particleCount = Math.min(particleLimit, Math.max(MIN_PARTICLES, Math.round((width * height) / PARTICLE_AREA)));
      createParticles(particleCount);
      paint();
      startAnimation();
    };

    const scheduleResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(resize);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    resize();
    window.addEventListener("resize", scheduleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", startAnimation);

    return () => {
      stopAnimation();
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", scheduleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", startAnimation);
    };
  });
</script>

<div class="dust" aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .dust {
    position: fixed;
    z-index: 0;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    background:
      radial-gradient(circle at 50% -10%, rgb(34 53 78 / 18%), transparent 52%),
      radial-gradient(circle at 80% 65%, rgb(24 39 61 / 10%), transparent 46%), #000;
    contain: strict;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
