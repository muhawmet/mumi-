window.generateABTestBrief = function(scenes, modelA, modelB) {
  let markdown = `# A/B Test Brief: ${modelA} vs ${modelB}\n\n`;

  scenes.forEach((scene, index) => {
    markdown += `## Scene ${index + 1}: ${scene.topic || scene.title || 'Untitled'}\n\n`;
    
    markdown += `| Model | Prompt |\n`;
    markdown += `| :--- | :--- |\n`;
    
    const promptA = scene[`prompt_${modelA}`] || scene.imagePrompt || scene.draftPrompt || `Optimized prompt for ${modelA}`;
    const promptB = scene[`prompt_${modelB}`] || scene.imagePrompt || scene.draftPrompt || `Optimized prompt for ${modelB}`;
    
    markdown += `| **${modelA}** | ${promptA} |\n`;
    markdown += `| **${modelB}** | ${promptB} |\n\n`;
  });

  return markdown;
};
