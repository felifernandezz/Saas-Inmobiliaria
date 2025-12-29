
from moviepy import TextClip, AudioFileClip, ColorClip
# Try Audio imports
try:
    from moviepy.audio.fx import AudioFadeIn, AudioFadeOut
    print("SUCCESS: AudioFX imports")
except ImportError:
    print("FAIL: AudioFX imports")
    # Try alternate:
    try:
        from moviepy.audio.fx.AudioFadeIn import AudioFadeIn
        print("Alternat AudioFX import worked")
    except:
        pass

# Try TextClip
try:
    # Try old params
    # txt = TextClip("Hello", fontsize=70, color='white')
    # Or new params?
    print("Testing TextClip...")
    # New TextClip often requires font path or system font
    # And 'font_size' instead of 'fontsize??
    # Let's try to inspect arguments if possible? No.
    # Just try instantiation.
    try:
        txt = TextClip(text="Hello", font_size=70, color=(255,255,255))
        print("SUCCESS: TextClip(text=..., font_size=...)")
    except TypeError:
        print("FAIL: font_size param. Trying fontsize...")
        try:
            txt = TextClip(text="Hello", fontsize=70, color=(255,255,255))
            print("SUCCESS: TextClip(text=..., fontsize=...)")
        except Exception as e:
            print(f"FAIL: TextClip instantiation: {e}")
    except Exception as e:
        print(f"FAIL: TextClip general: {e}")
        
except Exception as main_e:
    print(f"FAIL Main: {main_e}")
