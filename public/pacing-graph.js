window.drawPacingGraph = function(scenes) {
  const container = document.getElementById('pacing-graph');
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  // Container styling for 2026 Tactile Brutalism
  container.style.display = 'flex';
  container.style.width = '100%';
  container.style.height = '64px';
  container.style.backgroundColor = '#020617';
  container.style.borderRadius = '0px';
  container.style.overflow = 'visible'; // allow tooltips to overflow
  container.style.boxShadow = '6px 6px 0px #3b82f6';
  container.style.border = '2px solid #ffffff';
  container.style.position = 'relative';
  container.style.marginTop = '8px';
  container.style.marginBottom = '16px';

  // Inner wrapper for clipping bars but not tooltips
  const barsWrapper = document.createElement('div');
  barsWrapper.style.display = 'flex';
  barsWrapper.style.width = '100%';
  barsWrapper.style.height = '100%';
  barsWrapper.style.overflow = 'hidden';
  container.appendChild(barsWrapper);

  if (!scenes || scenes.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.style.width = '100%';
    emptyState.style.height = '100%';
    emptyState.style.display = 'flex';
    emptyState.style.alignItems = 'center';
    emptyState.style.justifyContent = 'center';
    emptyState.style.color = '#ffffff';
    emptyState.style.fontSize = '14px';
    emptyState.style.fontFamily = 'var(--font-mono, monospace)';
    emptyState.style.fontWeight = '700';
    emptyState.style.textTransform = 'uppercase';
    emptyState.innerText = '[ NO SCENES GENERATED ]';
    barsWrapper.appendChild(emptyState);
    return;
  }

  // Calculate total duration using dynamic defaults / pacing info
  const durations = scenes.map(s => {
    let d = parseFloat(s.duration);
    if (isNaN(d) || d <= 0) {
      if (s.pacing && s.pacing.phaseName) {
        if (s.pacing.phaseName === 'Intro') d = 3;
        else if (s.pacing.phaseName === 'Build-up') d = 4;
        else if (s.pacing.phaseName === 'Climax') d = 6;
        else d = 5;
      } else {
        d = s.text ? Math.max(2, s.text.length / 15) : 4 + (Math.random() * 2 - 1);
      }
    }
    return d;
  });
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);

  // Bold raw colors for Tactile Brutalism
  const rawColors = [
    '#ef4444', // Red
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#eab308', // Yellow
    '#d946ef', // Fuchsia
    '#06b6d4', // Cyan
    '#f97316'  // Orange
  ];

  scenes.forEach((scene, index) => {
    const duration = durations[index];
    const percentage = (duration / totalDuration) * 100;

    const barContainer = document.createElement('div');
    barContainer.style.width = `${percentage}%`;
    barContainer.style.height = '100%';
    barContainer.style.position = 'relative';
    barContainer.style.boxSizing = 'border-box';

    const bar = document.createElement('div');
    bar.className = 'pacing-bar';
    bar.style.width = '100%';
    bar.style.height = '100%';
    bar.style.background = rawColors[index % rawColors.length];
    bar.style.boxSizing = 'border-box';
    bar.style.borderRight = index < scenes.length - 1 ? '2px solid #ffffff' : 'none';
    bar.style.cursor = 'pointer';
    bar.style.transition = 'transform 0.1s ease';
    
    // Hover interactions (Tactile pop-out)
    bar.onmouseenter = () => {
      bar.style.transform = 'scaleY(1.1)';
      bar.style.border = '2px solid #ffffff';
      bar.style.zIndex = '10';
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateX(-50%) translateY(-10px)';
      tooltip.style.visibility = 'visible';
    };
    bar.onmouseleave = () => {
      bar.style.transform = 'scaleY(1)';
      bar.style.border = 'none';
      bar.style.borderRight = index < scenes.length - 1 ? '2px solid #ffffff' : 'none';
      bar.style.zIndex = '1';
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateX(-50%) translateY(0)';
      tooltip.style.visibility = 'hidden';
    };

    // Brutalist Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'pacing-tooltip';
    tooltip.innerHTML = `
      <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 4px;">SCENE ${index + 1}</div>
      <div style="font-size: 16px; font-weight: 900;">${duration.toFixed(1)}s</div>
    `;
    tooltip.style.position = 'absolute';
    tooltip.style.bottom = 'calc(100% + 15px)';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%) translateY(0)';
    tooltip.style.background = '#ffffff';
    tooltip.style.color = '#000000';
    tooltip.style.padding = '8px 12px';
    tooltip.style.border = '3px solid #000000';
    tooltip.style.boxShadow = '4px 4px 0px #000000';
    tooltip.style.fontFamily = 'var(--font-mono, monospace)';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.transition = 'all 0.15s cubic-bezier(0, 0, 0.2, 1)';
    tooltip.style.zIndex = '100';

    barContainer.appendChild(bar);
    barContainer.appendChild(tooltip);
    barsWrapper.appendChild(barContainer);
  });
};
