
from moviepy import ColorClip
from moviepy.video.fx import Resize

try:
    print("Testing Resize with function...")
    clip = ColorClip(size=(100, 100), color=(255, 0, 0), duration=1)
    # Try using Resize effect with a function
    # Syntax guess: clip.with_effects([Resize(lambda t: 1 + 0.1 * t)])
    
    fx = Resize(lambda t: 1 + 0.1 * t)
    print("Resize initialized with function")
    
    clip = clip.with_effects([fx])
    print("Effect application success")
except Exception as e:
    print(f"FAIL: {e}")

try:
    print("Testing clip.resized(lambda t: ...)")
    clip = ColorClip(size=(100, 100), color=(255, 0, 0), duration=1)
    if hasattr(clip, 'resized'):
        clip = clip.resized(lambda t: 1 + 0.1 * t)
        print("clip.resized success")
    else:
        print("clip.resized does not exist")
except Exception as e:
    print(f"FAIL clip.resized: {e}")
