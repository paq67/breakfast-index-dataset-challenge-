// ============================================================
// PARTICLE BACKGROUND — Interactive Canvas Animation
// Soft glowing particles in layered red hues with mouse interaction
// ============================================================

(function () {
    const canvas = document.getElementById("particleBg");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Configuration
    const CONFIG = {
        particleCount: 120,
        colors: [
            { r: 247, g: 20, b: 20 },   // #f71414 — primary glow
            { r: 143, g: 13, b: 13 },   // #8f0d0d — mid tone
            { r: 56, g: 3, b: 3 },      // #380303 — shadow tone
        ],
        minSize: 1,
        maxSize: 4,
        minOpacity: 0.08,
        maxOpacity: 0.55,
        minSpeed: 0.08,
        maxSpeed: 0.35,
        mouseRadius: 150,
        mouseForce: 0.012,
        disperseForce: 0.003,
        damping: 0.97,
    };

    let width, height;
    let mouseX = -1000, mouseY = -1000;
    let particles = [];
    let animationId;
    let lastTime = 0;

    // ---- Resize ----
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // ---- Particle class ----
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;

            // Depth layer: 0 = far background, 1 = mid, 2 = foreground
            this.layer = Math.floor(Math.random() * 3);
            const depthFactor = [0.3, 0.6, 1.0][this.layer];

            // Color based on layer
            const colorIdx = this.layer;
            const c = CONFIG.colors[colorIdx];
            this.r = c.r;
            this.g = c.g;
            this.b = c.b;

            // Size — bigger in foreground
            const sizeRange = CONFIG.maxSize - CONFIG.minSize;
            this.size = CONFIG.minSize + sizeRange * depthFactor * (0.5 + Math.random() * 0.5);

            // Opacity — brighter in foreground
            const opRange = CONFIG.maxOpacity - CONFIG.minOpacity;
            this.baseOpacity = CONFIG.minOpacity + opRange * depthFactor * (0.4 + Math.random() * 0.6);
            this.opacity = this.baseOpacity;

            // Speed — slower in background (parallax)
            const speedRange = CONFIG.maxSpeed - CONFIG.minSpeed;
            this.baseSpeedX = (CONFIG.minSpeed + speedRange * depthFactor) * (Math.random() > 0.5 ? 1 : -1);
            this.baseSpeedY = (CONFIG.minSpeed + speedRange * depthFactor * 0.3) * (Math.random() > 0.5 ? 1 : -1);

            this.vx = this.baseSpeedX;
            this.vy = this.baseSpeedY;

            // Sine wave offset for organic movement
            this.phase = Math.random() * Math.PI * 2;
            this.waveAmplitude = 0.15 + Math.random() * 0.25;
            this.waveFrequency = 0.0005 + Math.random() * 0.001;

            // Glow pulse
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.0003 + Math.random() * 0.0006;
        }

        update(dt, time) {
            // Sine wave oscillation
            const wave = Math.sin(time * this.waveFrequency + this.phase) * this.waveAmplitude;

            // Apply base movement + wave
            this.x += (this.vx + wave * 0.3) * dt * 0.06;
            this.y += (this.vy + wave * 0.15) * dt * 0.06;

            // Mouse interaction — gentle gravity then disperse
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.mouseRadius && dist > 0) {
                const force = (1 - dist / CONFIG.mouseRadius);
                const angle = Math.atan2(dy, dx);

                // Gravitate toward mouse (closer = stronger)
                const gravForce = CONFIG.mouseForce * force * force;
                this.vx += Math.cos(angle) * gravForce * dt;
                this.vy += Math.sin(angle) * gravForce * dt;

                // Subtle opacity pulse near mouse
                this.opacity = this.baseOpacity + force * 0.2;
            } else {
                this.opacity = this.baseOpacity;
            }

            // Damping — gradually return to base speed
            this.vx = this.vx * CONFIG.damping + this.baseSpeedX * (1 - CONFIG.damping);
            this.vy = this.vy * CONFIG.damping + this.baseSpeedY * (1 - CONFIG.damping);

            // Glow pulse
            const pulse = Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.15;
            this.opacity = Math.max(0.02, Math.min(0.7, this.opacity + pulse));

            // Wrap around edges
            if (this.x < -this.size * 2) this.x = width + this.size;
            if (this.x > width + this.size * 2) this.x = -this.size;
            if (this.y < -this.size * 2) this.y = height + this.size;
            if (this.y > height + this.size * 2) this.y = -this.size;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
            ctx.fill();

            // Soft glow for larger / brighter particles
            if (this.size > 2 && this.opacity > 0.2) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity * 0.08})`;
                ctx.fill();
            }
        }
    }

    // ---- Initialize ----
    function init() {
        resize();
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // ---- Animation loop ----
    function animate(time) {
        const dt = Math.min(time - lastTime, 50); // Cap delta to prevent jumps
        lastTime = time;

        ctx.clearRect(0, 0, width, height);

        // Sort by layer so background draws first
        particles.sort((a, b) => a.layer - b.layer);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(dt, time);
            particles[i].draw();
        }

        animationId = requestAnimationFrame(animate);
    }

    // ---- Event listeners ----
    window.addEventListener("resize", () => {
        resize();
    }, { passive: true });

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
        mouseX = -1000;
        mouseY = -1000;
    }, { passive: true });

    // Touch support
    window.addEventListener("touchmove", (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener("touchend", () => {
        mouseX = -1000;
        mouseY = -1000;
    }, { passive: true });

    // ---- Start ----
    init();
    animationId = requestAnimationFrame(animate);
})();
