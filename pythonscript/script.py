import cv2
import sys

def apply_filter(input_image_path, output_image_path):
    try:
        # Load the image using OpenCV
        image = cv2.imread(input_image_path)

        # Apply your desired filter (e.g., grayscale)
        filtered_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Save the filtered image
        cv2.imwrite(output_image_path, filtered_image)
    except Exception as e:
        print(f"Error applying filter: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python apply_filter.py input_image_path output_image_path", file=sys.stderr)
        sys.exit(1)

    input_image_path = sys.argv[1]
    output_image_path = sys.argv[2]
    apply_filter(input_image_path, output_image_path)
