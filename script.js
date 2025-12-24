/*
  Mouse-controlled video scrubber

  Behavior notes:
  - Horizontal mouse movement scrubs the video.
  - Moving mouse left -> video plays forward.
  - Moving mouse right -> video rewinds backward.
  - We convert pixel delta into seconds using a sensitivity constant.
  - Use rAF to batch updates and stop updating when the mouse stops (no inertia).
  - Touch events are supported as a mobile fallback.
*/

(function(){
  const video = document.getElementById('scrubVideo');
  const message = document.getElementById('message');
  if (message){
    const showMessage = (text)=>{ message.textContent = text; message.style.display = 'flex'; };
    const hideMessage = ()=>{ message.style.display = 'none'; };
    message.style.display = 'flex';
    video.addEventListener('loadedmetadata', hideMessage);
    video.addEventListener('error', ()=>{
      const err = video.error;
      let text = 'Video failed to load.';
      if (err){
        // Map MediaError codes to messages
        const codeMap = {
          1: 'MEDIA_ERR_ABORTED',
          2: 'MEDIA_ERR_NETWORK',
          3: 'MEDIA_ERR_DECODE',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
        };
        text = `Video error: ${codeMap[err.code] || 'UNKNOWN'} (code ${err.code})`;
      }
      showMessage(text + ' — check console for details.');
      console.error('Video error event', err);
    });
    if (video.readyState >= 1 && video.duration) hideMessage();
  }

  // Scrubbing mode: map a fraction of the screen width to the full video duration.
  // `RANGE_FRACTION` is the fraction of screen width that maps to the entire video.
  // For half-screen -> full duration, use 0.5.
  const RANGE_FRACTION = 0.5; // 0.5 = half the screen maps to full duration
  // If duration isn't available yet, fall back to a per-pixel sensitivity.
  const SENSITIVITY = 0.025; // seconds per pixel (fallback)

  let prevX = null;
  let pendingDelta = 0; // accumulated pixel delta since last rAF
  let rafId = null;
  let lastMoveTs = 0;

  function clamp(t){
    if (!isFinite(t)) return 0;
    return Math.max(0, Math.min(video.duration || 0, t));
  }

  function scheduleRaf(){
    if (rafId == null) rafId = requestAnimationFrame(frame);
  }

  function frame(now){
    rafId = null;
    const timeSinceLastMove = performance.now() - lastMoveTs;

    if (pendingDelta === 0 || timeSinceLastMove > 40){
      // No input recently — do nothing and stop rAF.
      pendingDelta = 0;
      return;
    }

    // Convert accumulated horizontal pixel delta to seconds.
    // We map a full-screen horizontal swipe (window.innerWidth) to the full video duration.
    // frac = -pendingDelta / window.innerWidth
    // timeDelta = frac * video.duration
    // Negative pendingDelta (swiping left) should advance the video, so we negate pendingDelta.
    let timeDelta = 0;
    if (video.duration && isFinite(video.duration) && video.duration > 0){
      const screenW = Math.max(1, window.innerWidth || document.documentElement.clientWidth);
      const effectiveRange = Math.max(1, screenW * (RANGE_FRACTION || 1));
      const frac = -pendingDelta / effectiveRange; // fraction of effectiveRange swiped
      timeDelta = frac * video.duration;
    } else {
      // Fallback before metadata is loaded: use per-pixel sensitivity
      timeDelta = -pendingDelta * SENSITIVITY;
    }

    // Update currentTime manually (do not call play/pause)
    if (video.duration){
      video.currentTime = clamp(video.currentTime + timeDelta);
    }

    pendingDelta = 0;
    // Continue loop if more input arrives shortly.
    // scheduleRaf will be called by event handler when new input arrives.
  }

  function onMouseMove(e){
    if (prevX === null) prevX = e.clientX;
    const dx = e.clientX - prevX;
    prevX = e.clientX;
    pendingDelta += dx;
    lastMoveTs = performance.now();
    scheduleRaf();
    // Prevent text selection drag side-effects
    e.preventDefault();
  }

  function onMouseLeave(){
    prevX = null;
  }

  // Touch support: map single-finger horizontal drag to scrubbing.
  function onTouchStart(e){
    if (e.touches.length !== 1) return;
    prevX = e.touches[0].clientX;
    lastMoveTs = performance.now();
    e.preventDefault();
  }

  function onTouchMove(e){
    if (e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    if (prevX === null) prevX = x;
    const dx = x - prevX;
    prevX = x;
    pendingDelta += dx;
    lastMoveTs = performance.now();
    scheduleRaf();
    e.preventDefault();
  }

  function onTouchEnd(){
    prevX = null;
  }

  // Prevent spacebar scrolling while focused on page
  window.addEventListener('keydown', (e)=>{
    if (e.code === 'Space') e.preventDefault();
  });

  // Attach events to the player container (if present) so scrubbing is constrained
  const container = document.getElementById('player');
  const target = container || document;
  target.addEventListener('mousemove', onMouseMove, {passive:false});
  target.addEventListener('mouseleave', onMouseLeave);

  target.addEventListener('touchstart', onTouchStart, {passive:false});
  target.addEventListener('touchmove', onTouchMove, {passive:false});
  target.addEventListener('touchend', onTouchEnd);

  // If the user clicks or drags, prevent default drag behavior on the container or document
  (container || document).addEventListener('dragstart', (e)=>e.preventDefault());

  // Safety: if the video metadata isn't loaded yet, clamp will handle it.
  video.addEventListener('loadedmetadata', ()=>{
    // Ensure currentTime is within bounds on load
    video.currentTime = clamp(video.currentTime);
  });

})();
