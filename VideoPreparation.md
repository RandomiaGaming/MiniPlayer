To prepare a video for playback in YTOffline there are a few steps to help playback be more efficient and smooth.

First we should download the video if it's from YouTube using:
yt-dlp http://www.youtube.com/watch?v={VIDEOID}

Next we need to convert the video into a streaming friendly format and decrease the resolution if it is too high:
ffmpeg -i "rawvideo.webm" -vf scale=1920:-1 -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -map 0:v:0 -map 0:a:0 -map -0:s -map -0:d -map -0:t -map_chapters -1 -metadata comment="Encoded With BackupService.cs" -movflags +faststart -y "video.mp4"

Next we need to extract the scrub file.
First we need the length in seconds which can be exctracted with:
ffprobe "rawvideo.webm"
Next we calculate an intager {SIZE}:
{SIZE} = ciel(sqrt(length_in_seconds))
Finally we run this command with our value of {SIZE}:
ffmpeg -i "rawvideo.webm" -vf "fps=1,scale=320:-1,tile={SIZE}x{SIZE}" -qscale:v 5 "scrub.jpg"