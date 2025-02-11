export async function uploadImage(file: File, controlMethod: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('controlMethod', controlMethod);

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    const { url } = await uploadResponse.json();
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function analyzeImage(imageUrl: string, controlMethod: string) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl, controlMethod }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
      }
    }

    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}
