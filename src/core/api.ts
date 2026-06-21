/**
 * API methods for the frontend
 */

window.saveProjectToDisk = async function(data) {
  try {
    const id = data.id || `project-${Date.now()}`;
    const dataToSave = { ...data, id };
    
    const response = await fetch(`/api/projects/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSave)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save project: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Project saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in window.saveProjectToDisk:', error);
    throw error;
  }
};

window.loadProjectFromDisk = async function(id) {
  try {
    const response = await fetch(`/api/projects/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error(`Failed to load project: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Project loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in window.loadProjectFromDisk:', error);
    throw error;
  }
};
