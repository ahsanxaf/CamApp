from flask import Flask, request, jsonify
import cv2
import numpy as np
import io
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/upload-image', methods=['POST'])
def upload_image():
    try:
        # Receive image data from the request
        image_data = request.get_json()
        image_uri = image_data['uri']
        image_base64 = image_data['base64']

        # Convert base64 to numpy array
        image_bytes = base64.b64decode(image_base64)
        image_np = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Apply scanning filter (example: canny edge detection)
        scanned_image = cv2.Canny(image, 100, 200)

        # Save the scanned image on the server (optional)
        cv2.imwrite('scanned_image.jpg', scanned_image)

        # Convert the scanned image to base64
        _, scanned_image_base64 = cv2.imencode('.jpg', scanned_image)
        scanned_image_base64 = base64.b64encode(scanned_image_base64).decode('utf-8')

        # Send the processed image back to the client
        return jsonify({'scannedImageBase64': scanned_image_base64})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
