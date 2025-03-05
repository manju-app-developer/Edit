const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearBtn = document.getElementById("clear");
const eraseBtn = document.getElementById("erase");
const downloadBtn = document.getElementById("download");

let painting = false;

// Upload and display image
upload.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
        };
    }
});

// Drawing mask on image
canvas.addEventListener("mousedown", () => painting = true);
canvas.addEventListener("mouseup", () => painting = false);
canvas.addEventListener("mousemove", draw);

function draw(event) {
    if (!painting) return;
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red mask
    ctx.beginPath();
    ctx.arc(event.offsetX, event.offsetY, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Send image & mask to backend
eraseBtn.addEventListener("click", async () => {
    const originalImage = canvas.toDataURL("image/png");
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext("2d");
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.globalCompositeOperation = "source-over";
    maskCtx.fillStyle = "white";
    maskCtx.drawImage(canvas, 0, 0);  // Copy mask

    const maskImage = maskCanvas.toDataURL("image/png");

    const formData = new FormData();
    formData.append("image", dataURLtoFile(originalImage, "image.png"));
    formData.append("mask", dataURLtoFile(maskImage, "mask.png"));

    const response = await fetch("http://127.0.0.1:5000/erase", {
        method: "POST",
        body: formData
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
});

// Convert base64 to File object
function dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}

// Clear the drawn mask
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Download the final image
downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL();
    link.click();
});
