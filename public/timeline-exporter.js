window.exportTimelineXML = function(scenes) {
  if (!scenes || !Array.isArray(scenes)) {
    scenes = [];
  }
  
  const fps = 24;
  const width = 1920;
  const height = 1080;
  
  let totalDuration = 0;
  
  const clipNodes = scenes.map((scene, index) => {
    const durationSec = scene.duration || 4;
    const durationFrames = Math.round(durationSec * fps);
    const startFrame = totalDuration;
    totalDuration += durationFrames;
    
    return `
                <clipitem id="clipitem-${index + 1}">
                  <name>Scene ${index + 1}</name>
                  <duration>${durationFrames}</duration>
                  <rate>
                    <timebase>${fps}</timebase>
                    <ntsc>FALSE</ntsc>
                  </rate>
                  <start>${startFrame}</start>
                  <end>${startFrame + durationFrames}</end>
                  <in>0</in>
                  <out>${durationFrames}</out>
                  <file id="file-${index + 1}">
                    <name>Placeholder ${index + 1}</name>
                    <pathurl>file://localhost/placeholder.mp4</pathurl>
                    <rate>
                      <timebase>${fps}</timebase>
                      <ntsc>FALSE</ntsc>
                    </rate>
                    <duration>${durationFrames}</duration>
                    <media>
                      <video>
                        <samplecharacteristics>
                          <rate>
                            <timebase>${fps}</timebase>
                            <ntsc>FALSE</ntsc>
                          </rate>
                          <width>${width}</width>
                          <height>${height}</height>
                        </samplecharacteristics>
                      </video>
                    </media>
                  </file>
                </clipitem>`;
  }).join('');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence id="sequence-1">
    <name>MAMILAS Timeline</name>
    <duration>${totalDuration}</duration>
    <rate>
      <timebase>${fps}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <media>
      <video>
        <format>
          <samplecharacteristics>
            <rate>
              <timebase>${fps}</timebase>
              <ntsc>FALSE</ntsc>
            </rate>
            <width>${width}</width>
            <height>${height}</height>
            <anamorphic>FALSE</anamorphic>
            <pixelaspectratio>square</pixelaspectratio>
            <fielddominance>none</fielddominance>
            <colordepth>24</colordepth>
          </samplecharacteristics>
        </format>
        <track>
${clipNodes}
        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mamilas_timeline.xml';
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
