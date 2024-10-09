function fadeIn(material, duration) {
    let opacity = 0;
    const start = performance.now();

    function fadeInAnimation(time) {
    opacity = (time - start) / duration;
    if (opacity >= 1) {
      opacity = 1;
      material.opacity = 1; // Set material opacity explicitly
      return;
    }
    material.opacity = opacity;
    requestAnimationFrame(fadeInAnimation);
    }

    requestAnimationFrame(fadeInAnimation);
}

function fadeOutOverlay(overlayId, delay) {
    setTimeout(() => {
        const overlay = document.getElementById(overlayId);
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none'; // Allow interaction with elements beneath the overlay
    }, delay);
}