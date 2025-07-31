# Converting Videos To H264 AAC MP4
This is the stardard format used for all my movies and tv
It is vastly futerproof and cross platform compatable.
It uses the industry standard codecs for compatability at super high quality settings for almost lossless audio and video.

ffmpeg -i "{sourceFilePath}" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -map 0:v:0 -map 0:a:0 -map -0:s -map -0:d -map -0:t -map_chapters -1 -metadata comment="Encoded With BackupService.cs" -movflags +faststart -y "{destinationFilePath}.mp4"

ffmpeg = A command line video and audio encoding tool
-i = Input file path
-c:v = Codec for video
libx264 = H264 video codec
-preset slow = H264 codec speed
-crf 18 = H264 codec CRF
-c:a = Codec for audio
aac = AAC audio codec
-b:a 192k = Audio bitrate
-map 0:v:0 = Maps the first video stream from the input to the output but ignores all other video streams
-map 0:a:0 = Maps the first audio stream from the input to the output but ignores all other audio streams
-map -0:s = Ignores all subtitle streams
-map -0:d = Ignores all data streams like closed captions
-map -0:t = Ignores all attachment streams like fonts or images
-map_chapters -1 = Ignores all chapter and section information
-metadata comment="Encoded With BackupService.cs" = Adds a comment to the output file marking that it has been touched by BackupService.cs
-movflags +faststart = Move all video metadata to the start of the file to ensure it is ready immediately
-y = Automatically confirms confirmation to overwrite an existing file

Adendum H264 Speed:
Faster options will take less time to render however the compression may not be as optimal and therefore might have a worse data to quality ratio
Slower options allow the codec to spend more time renderring and therefore come up with better methods of compression which lead to higher quality and smaller files
Your choices for speed settings are: ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, and placebo

Adendum H264 CRF:
CRF stands for constant rate factor and loosely represents the quality level of the output file
Values range from 0 = lossless to 51 = garbage quality
A typical video will be in the 18 to 23 range

Adendum Audio Bitrate:
Highest quality = 320 kbps
Very high quality = 256 kbps
High quality = 192 kbps
Medium quality = 128 kbps
Lower quality = 96 kbps
Lowest quality = 64 kbps

# Getting One Frame
ffmpeg -i "{sourceFilePath}" -ss 00:00:03 -frames:v 1 -v:q 0 -y "{destinationFilePath}"

ffmpeg = A command line video and audio encoding tool
-i = Input file path
-ss = Seek to the given number of hours, minutes, and seconds from the start of the video
-frames:v = The number of frames to extract. In this case just one
-q:v = The quality of the output image
-y = Automatically says yes to overwriting existing output files

Adendum JPEG Quality:
The -q:v flag set the quality of an output JPEG
This option does not apply to PNG files
Values range from 0 = basically lossless to 31 = garbage quality

# Making Scrub Sheet
First we need the length of the video in seconds which can be exctracted with:
ffprobe "{inputFilePath}"
Next we calculate an intager {SIZE}:
{SIZE} = ciel(sqrt(length_in_seconds))
Finally we run this command with our value of {SIZE}:
ffmpeg -i "{inputFilePath}" -filter:v "fps=1,scale=144:-1,tile={SIZE}x{SIZE}" -q:v 5 -y "scrub.jpg"

ffmpeg = A command line video and audio encoding tool
-i = Input file path
-filter:v = Specifies a filter on the input video
fps=1 = Means we want one frame from the source every second
scale=144:-1 = Means the frames should be scaled to a width of 144px and a height that maintains the aspect ratio
tile={SIZE}x{SIZE} = Means the output frames should be tiled together onto a {SIZE} by {SIZE} grid and then saved as a single image
-q:v = The quality of the output image
-y = Automatically says yes to overwriting existing output files

Adendum Scale:
-1 means auto so a scale of 144:-1 means width = 144px and height is automatically calculated based upon aspect ratio

Adendum JPEG Quality:
The -q:v flag set the quality of an output JPEG
This option does not apply to PNG files
Values range from 0 = basically lossless to 31 = garbage quality

# Settings For Streaming
ffmpeg -i "{sourceFilePath}" -g 30 -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -map 0:v:0 -map 0:a:0 -map -0:s -map -0:d -map -0:t -map_chapters -1 -metadata comment="Encoded With BackupService.cs" -movflags +faststart -y "{destinationFilePath}.mp4"

ffmpeg = A command line video and audio encoding tool
-i = Input file path
-g = KeyFrame interval. This specifies every 30th frame should be a keyframe.
-c:v = Codec for video
libx264 = H264 video codec
-preset slow = H264 codec speed
-crf 23 = H264 codec CRF
-c:a = Codec for audio
aac = AAC audio codec
-b:a 128k = Audio bitrate
-map 0:v:0 = Maps the first video stream from the input to the output but ignores all other video streams
-map 0:a:0 = Maps the first audio stream from the input to the output but ignores all other audio streams
-map -0:s = Ignores all subtitle streams
-map -0:d = Ignores all data streams like closed captions
-map -0:t = Ignores all attachment streams like fonts or images
-map_chapters -1 = Ignores all chapter and section information
-metadata comment="Encoded With BackupService.cs" = Adds a comment to the output file marking that it has been touched by BackupService.cs
-movflags +faststart = Move all video metadata to the start of the file to ensure it is ready immediately
-y = Automatically confirms confirmation to overwrite an existing file

Adendum H264 Speed:
Faster options will take less time to render however the compression may not be as optimal and therefore might have a worse data to quality ratio
Slower options allow the codec to spend more time renderring and therefore come up with better methods of compression which lead to higher quality and smaller files
Your choices for speed settings are: ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow, and placebo

Adendum H264 CRF:
CRF stands for constant rate factor and loosely represents the quality level of the output file
Values range from 0 = lossless to 51 = garbage quality
A typical video will be in the 18 to 23 range

Adendum Audio Bitrate:
Highest quality = 320 kbps
Very high quality = 256 kbps
High quality = 192 kbps
Medium quality = 128 kbps
Lower quality = 96 kbps
Lowest quality = 64 kbps

# Segmenting And Creating m3u8 Playlist
ffmpeg -i "{sourceFilePath}" -c copy -f hls -hls_time 10 -hls_playlist_type vod -hls_segment_filename "{SegmentBaseName}_%03d.ts" "{destinationFilePath}.m3u8" -y

ffmpeg = A command line video and audio encoding tool
-i = Input file path
-c copy = Copy original data in original codec instead of reencoding
-f hls = Output format should be hls
-hls_time 10 = Specifies each segment should be 10 seconds long
-hls_playlist_type vod = Specifies this playlist is suitable for video on demand streaming
-hls_segment_filename = Sets the file naming convention for the segments of this video
-y = Automatically confirms confirmation to overwrite an existing file

# Comparing And Contrasting
There is a lot of competition for different audio codecs, video codecs, and wrappers.
Selecting the best one for you is a difficult choice.
I feel strongly that AAC audio with H264/AVC video in an MP4 container is the best way to store media.
Here is why:

Why Is AAC Great:
AAC is widely supported on almost all operating systems, browsers, and architectures.
AAC has hardware accelleration on almost all architectures!
AAC offers great quality at good compression ratios.
AAC has been an industry standard for years and is tried and true.

Why Not Other Audio Codecs:
Opus is very similar in quality and compression ratio to AAC
Opus lacks hardware support and is less widely supported by operating systems and browsers.
Opus has faster encode times but that wasn't important to my use case.
Flac is a lossless compressed codec so it offers much larger file sizes.
Flac is also less widely supported.
Flac is basically wav but worse.
Wav is an awesome audio codec because it is lossless and uncompressed.
Wav is ideal for editing but offers massive files sizes way too large for archival or streaming purposes.
Mp3 is the same as AAC they are both MPEG codecs but mp3 is the older and worse version.
Mp3 also has unacceptably crap audio quality in 2025.
Vorbis is very similar to mp3. It is often packed with the ogg container and is not relevant anymore.
Vorbis has similar quality to mp3 and is much worse compared to opus or aac.

Why Is H264/AVC Great:
H264/AVC is widely supported on almost all operating systems, browsers, and architectures.
H264/AVC has hardware accelleration on almost all architectures!
H264/AVC offers pretty good compression and pretty good quality.
H264/AVC has been an industry standard for years and is tried and true.

Why Not Other Video Codecs:
H265/HEVC offers better compression vs H264/AVC but at the cost of less support and less hardware acceleration
H265/HEVC really accells at high resolution content such as 4k which is not my use case.
H265/HEVC didn't decrease file size enough to justify it's lack of hardware accelleration and software support.
AV1 largely the same issues as H265/HEVC in that it is designed for 4k video and is less widely supported and didn't decrease file size enough to justify it's use.
AV1 additionaly the lack of hardware accelleration really throttles AV1 making encoding at even low quality take 5x realtime speed which is just too long to wait.
VVC same as AV1 just optimized for 8k and takes even longer to encode.
VP9 pretty cool codec ngl but it is not widely supported enough nor hardware accelerated enough for me. Still the coolest alternative to H264/AVC though.