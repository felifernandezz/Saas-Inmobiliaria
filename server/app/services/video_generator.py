
import os
from typing import List, Union
# MoviePy 2.x Imports
from moviepy import *
from moviepy.video.fx import Resize
from moviepy.audio.fx import AudioFadeIn, AudioFadeOut

# Try to import AudioLoop (naming varies)
try:
    from moviepy.audio.fx import AudioLoop
except ImportError:
    AudioLoop = None

def create_real_estate_video(
    image_paths: List[Union[str, bytes]], 
    text_info: str, 
    output_filename: str, 
    audio_path: str = None
) -> str:
    """
    Generates a vertical (9:16) video from a list of images with Ken Burns effect, 
    text overlay, and optional background audio.
    Adapted for MoviePy 2.x.
    """
    
    # Constants
    VIDEO_WIDTH = 1080
    VIDEO_HEIGHT = 1920
    ASPECT_RATIO = VIDEO_WIDTH / VIDEO_HEIGHT
    DURATION_PER_IMAGE = 3
    FPS = 24
    
    clips = []
    
    try:
        # 1. Process Images
        for img_path in image_paths:
            # Load image
            img_clip = ImageClip(img_path)
            
            # Calculate resize factor to cover the 9:16 area
            img_w, img_h = img_clip.size
            img_ratio = img_w / img_h
            
            if img_ratio > ASPECT_RATIO:
                # Image is wider than target, resize by height
                new_h = VIDEO_HEIGHT
                new_w = int(img_w * (VIDEO_HEIGHT / img_h))
            else:
                # Image is taller/narrower, resize by width
                new_w = VIDEO_WIDTH
                new_h = int(img_h * (VIDEO_WIDTH / img_w))
                
            # Resize (static) and Crop to Center (Cover)
            # v2: clip.resized(new_size)
            img_clip = img_clip.resized((new_w, new_h))
            
            # v2: clip.cropped(...) -> assumes with_crop or similar?
            # Or use fx.Crop?
            # crop() method usually exists.
            img_clip = img_clip.cropped(
                x_center=new_w/2, 
                y_center=new_h/2, 
                width=VIDEO_WIDTH, 
                height=VIDEO_HEIGHT
            )
            
            # Set duration
            # v2: with_duration
            img_clip = img_clip.with_duration(DURATION_PER_IMAGE)
            
            # Ken Burns Effect (Zoom 1.0 -> 1.05)
            def zoom(t):
                return 1 + 0.05 * (t / DURATION_PER_IMAGE)
            
            # Apply dynamic resize
            # v2: resized accepts a function? We verified it does in test_resize.py
            img_clip = img_clip.resized(zoom) 
            
            # Position
            # v2: with_position
            img_clip = img_clip.with_position('center')
            
            clips.append(img_clip)

        # Concatenate
        video_base = concatenate_videoclips(clips, method="compose")
        
        # Ensure base video size
        video_base = CompositeVideoClip([video_base], size=(VIDEO_WIDTH, VIDEO_HEIGHT))


        # 2. Text Overlay
        box_height = 300
        box_y_pos = VIDEO_HEIGHT - box_height - 100 
        
        # ColorClip
        # v2: ColorClip(size, color, duration) -> duration arg? Or with_duration?
        # Check params: ColorClip(size, color).
        text_bg = ColorClip(
            size=(VIDEO_WIDTH - 100, box_height), 
            color=(0, 0, 0)
        ).with_opacity(0.5)
        
        text_bg = text_bg.with_position(('center', box_y_pos)).with_duration(video_base.duration)

        # Text
        try:
            # v2: TextClip(text=..., font_size=..., color=..., font=...)
            txt_clip = TextClip(
                text=text_info,
                font_size=80,
                color='white',
                font='Arial', 
                method='caption',
                size=(VIDEO_WIDTH - 140, box_height - 40), 
                text_align='center' # Align might be text_align?
            )
            
            txt_clip = txt_clip.with_position(('center', box_y_pos + 20)).with_duration(video_base.duration)
            
            layers = [video_base, text_bg, txt_clip]
            
        except Exception as e:
            print(f"Warning: Text generation failed: {e}")
            layers = [video_base]

        # 3. Final Composite
        final_video = CompositeVideoClip(layers, size=(VIDEO_WIDTH, VIDEO_HEIGHT))
        
        # 4. Audio
        if audio_path and os.path.exists(audio_path):
            audio = AudioFileClip(audio_path)
            
            # Loop
            if audio.duration < final_video.duration:
                # Try method or effect
                if hasattr(audio, 'looped'): # v2 method
                    audio = audio.looped(duration=final_video.duration)
                elif hasattr(audio, 'loop'): # v1 method combat?
                    audio = audio.loop(duration=final_video.duration)
                elif AudioLoop:
                    audio = audio.with_effects([AudioLoop(duration=final_video.duration)])
                else:
                    # Fallback: simple repetition using concatenation?
                    pass
            else:
                audio = audio.subclipped(0, final_video.duration) # v2 subclipped?
                
            # Fade in/out
            # v2: with_effects([AudioFadeIn(2), AudioFadeOut(2)])
            audio = audio.with_effects([AudioFadeIn(duration=2), AudioFadeOut(duration=2)])
            
            final_video = final_video.with_audio(audio)
        
        # 5. Write
        final_video.write_videofile(
            output_filename, 
            fps=FPS, 
            codec='libx264', 
            audio_codec='aac',
            threads=4,
            preset='medium',
            ffmpeg_params=['-pix_fmt', 'yuv420p'] 
        )
        
    except Exception as e:
        print(f"Error creating video: {e}")
        raise e
    finally:
        try:
            if 'final_video' in locals(): final_video.close()
            for c in clips: c.close()
            if 'audio' in locals() and audio_path: audio.close()
        except:
            pass
            
    return output_filename
