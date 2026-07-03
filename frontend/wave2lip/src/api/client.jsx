export const BACKEND_URL = "https://8000-gpu-t4-s-ffccmwldx6b6-c.us-east1-2.prod.colab.dev";  // put real URL

// START JOB — TEXT
export async function generateFromText(imageFile, text) {
  const form = new FormData();
  form.append("image", imageFile);
  form.append("text", text);

  const res = await fetch(`${BACKEND_URL}/api/generate`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Failed to create text job");
  return await res.json();
}

// START JOB — AUDIO
export async function generateFromAudio(imageFile, audioFile) {
  const form = new FormData();
  form.append("image", imageFile);
  form.append("audio", audioFile);

  const res = await fetch(`${BACKEND_URL}/api/generate-audio`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Failed to create audio job");
  return await res.json();
}

// STATUS
export async function getJobStatus(jobId) {
  const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/status`);
  return await res.json();
}

// LOGS
export async function getJobLogs(jobId, start = 0) {
  const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/logs?start=${start}`);
  return await res.json();
}

// RESULT
export async function getJobResult(jobId) {
  const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/result`);
  if (!res.ok) throw new Error("Result not ready");

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
