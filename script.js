const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const maskCanvas = document.getElementById("maskCanvas");
const ctx = canvas.getContext("2d");
const maskCtx = maskCanvas.getContext("2d");
const clearBtn = document.getElementById("clear");
const eraseBtn = document.getElementById("erase");
const downloadBtn = document.getElementById("download");
const preview = document.getElementById("preview");
const brushTool = document.getElementById("brushTool");
const rectTool = document.getElementById("rectTool");

let painting = false;
let tool = "brush";
let startX, startY;

// Load and display image
upload.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            maskCtx.fillStyle = "black";
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        };
    }
});

// Handle drawing mask
canvas.addEventListener("mousedown", (e) => {
    painting = true;
    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener("mouseup", (e) => {
    painting = false;
    if (tool === "rect") {
        let width = e.offsetX - startX;
        let height = e.offsetY - startY;
        maskCtx.fillStyle = "white";
        maskCtx.fillRect(startX, startY, width, height);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!painting || tool !== "brush") return;
    maskCtx.fillStyle = "white";
    maskCtx.beginPath();
    maskCtx.arc(e.offsetX, e.offsetY, 10, 0, Math.PI * 2);
    maskCtx.fill();
});

// Tool selection
brushTool.addEventListener("click", () => tool = "brush");
rectTool.addEventListener("click", () => tool = "rect");

// Clear mask
clearBtn.addEventListener("click", () => {
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
});

// Send image & mask to backend
eraseBtn.addEventListener("click", async () => {
    const image = canvas.toDataURL("image/png");
    const mask = maskCanvas.toDataURL("image/png");

    const formData = new FormData();
    formData.append("image", dataURLtoFile(image, "image.png"));
    formData.append("mask", dataURLtoFile(mask, "mask.png"));

    const response = await fetch("http://127.0.0.1:5000/erase", {
        method: "POST",
        body: formData
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    preview.innerHTML = `<img src="${url}" alt="Erased Image">`;
});

// Convert base64 to File
function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}

// Download final image
downloadBtn.addEventListener("click", () => {
    const img = preview.querySelector("img");
    if (img) {
        const link = document.createElement("a");
        link.download = "smart-erased.png";
        link.href = img.src;
        link.click();
    }
});
