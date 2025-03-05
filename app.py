from flask import Flask, request, send_file
import cv2
import numpy as np
import torch
from torchvision import transforms
from PIL import Image
import io

app = Flask(__name__)

# Load the AI model (Use LaMa or Stable Diffusion Inpainting)
def inpaint_image(image, mask):
    # Convert images to NumPy arrays
    img = np.array(image)
    msk = np.array(mask)

    # Use OpenCV's Telea Inpainting as a placeholder (replace with AI later)
    inpainted = cv2.inpaint(img, msk[:, :, 0], inpaintRadius=3, flags=cv2.INPAINT_TELEA)

    return Image.fromarray(inpainted)

@app.route('/erase', methods=['POST'])
def erase():
    if 'image' not in request.files or 'mask' not in request.files:
        return {"error": "No image or mask uploaded"}, 400

    # Read the uploaded files
    image = Image.open(request.files['image']).convert("RGB")
    mask = Image.open(request.files['mask']).convert("L")  # Convert mask to grayscale

    # Apply AI-powered inpainting
    result = inpaint_image(image, mask)

    # Convert result to byte stream and send as response
    img_io = io.BytesIO()
    result.save(img_io, format="PNG")
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
