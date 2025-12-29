import os
import sys
from PIL import Image, ImageDraw
# Add app path to sys.path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.video_generator import create_real_estate_video

def create_dummy_images(count=3):
    paths = []
    if not os.path.exists("test_images"):
        os.makedirs("test_images")
        
    for i in range(count):
        # Create different colored images
        color = [(255, 0, 0), (0, 255, 0), (0, 0, 255)][i % 3]
        img = Image.new('RGB', (1920, 1080), color=color) # Horizontal logic to test resize
        d = ImageDraw.Draw(img)
        d.text((100, 100), f"Test Image {i+1}", fill=(255, 255, 255))
        
        path = f"test_images/img_{i}.jpg"
        img.save(path)
        paths.append(path)
    return paths

def main():
    print("Generating dummy images...")
    image_paths = create_dummy_images()
    
    output_file = "test_output.mp4"
    if os.path.exists(output_file):
        os.remove(output_file)
        
    print("Starting video generation...")
    try:
        result = create_real_estate_video(
            image_paths=image_paths,
            text_info="Precio: $500,000\nCalle Falsa 123",
            output_filename=output_file
            # No audio for this simple test
        )
        print(f"Success! Video generated at: {result}")
    except Exception as e:
        print(f"Failed to generate video: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
