
try:
    import moviepy.editor
    print("SUCCESS: import moviepy.editor")
except ImportError:
    print("FAIL: import moviepy.editor")

try:
    from moviepy import VideoFileClip
    print("SUCCESS: from moviepy import VideoFileClip")
except ImportError:
    print("FAIL: from moviepy import VideoFileClip")

try:
    from moviepy.video.io.VideoFileClip import VideoFileClip
    print("SUCCESS: from moviepy.video.io.VideoFileClip import VideoFileClip")
except ImportError:
    print("FAIL: from moviepy.video.io.VideoFileClip import VideoFileClip")

try:
    import moviepy.video.fx.all as vfx
    print("SUCCESS: import moviepy.video.fx.all as vfx")
except ImportError:
    print("FAIL: import moviepy.video.fx.all as vfx")

try:
    from moviepy.video.fx import Resize
    print("SUCCESS: from moviepy.video.fx import Resize")
except ImportError:
    print("FAIL: from moviepy.video.fx import Resize")

try:
    import moviepy.video.fx as fx
    print(f"FX DIR: {dir(fx)}")
except:
    pass
