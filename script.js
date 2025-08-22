import { supabase } from "./supabase.js";

const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const generateBtn = document.getElementById("generateLinkBtn");

let uploadedFiles = [];

// Handle file selection
fileInput.addEventListener("change", () => {
  uploadedFiles = Array.from(fileInput.files);
  fileList.innerHTML = "";
  uploadedFiles.forEach(file => {
    const li = document.createElement("li");
    li.textContent = file.name;
    fileList.appendChild(li);
  });
});

// Handle upload + generate link
generateBtn.addEventListener("click", async () => {
  if (uploadedFiles.length === 0) {
    alert("Please import files first!");
    return;
  }

  let links = [];

  for (let file of uploadedFiles) {
    const { data, error } = await supabase.storage
      .from("files") // Make sure you created a bucket called "files" in Supabase
      .upload(`${Date.now()}-${file.name}`, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      alert("Error uploading: " + file.name);
    } else {
      const { data: publicUrl } = supabase.storage
        .from("files")
        .getPublicUrl(data.path);

      links.push(publicUrl.publicUrl);
    }
  }

  if (links.length > 0) {
    const linkPage = `
      <html>
        <head><title>Your Files</title></head>
        <body style="font-family:sans-serif; background:#111; color:white; padding:20px;">
          <h2>Your Uploaded Files</h2>
          <ul>
            ${links.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join("")}
          </ul>
        </body>
      </html>
    `;

    const blob = new Blob([linkPage], { type: "text/html" });
    const link = URL.createObjectURL(blob);
    window.open(link, "_blank");
  }
});
