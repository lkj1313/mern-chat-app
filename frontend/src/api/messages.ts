// api/messages.ts
const serverUrl = import.meta.env.VITE_SERVER_URL;

export const uploadImageMessage = async (file: File) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${serverUrl}/api/messages/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return { ok: response.ok, imageUrl: data.imageUrl };
};
