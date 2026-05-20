import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";

// Services
import { VideoProcessorService } from "./services/video-processor.service";
import { AudioProcessorService } from "./services/audio-processor.service";
import { SubtitleProcessorService } from "./services/subtitle-processor.service";
import { MediaQueueService } from "./services/media-queue.service";
import { FfmpegService } from "./services/ffmpeg.service";
import { FfprobeService } from "./services/ffprobe.service";

// Consumers
import {
  VIDEO_PROCESSOR_KEY,
  VideoProcessor
} from "./consumers/video.consumer";
import {
  AUDIO_PROCESSOR_KEY,
  AudioProcessor
} from "./consumers/audio.consumer";
import {
  SUBTITLE_PROCESSOR_KEY,
  SubtitleProcessor
} from "./consumers/subtitle.consumer";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    ConfigModule,
    BullModule.registerQueue(
      { name: VIDEO_PROCESSOR_KEY },
      { name: AUDIO_PROCESSOR_KEY },
      { name: SUBTITLE_PROCESSOR_KEY }
    )
  ],
  providers: [
    VideoProcessorService,
    AudioProcessorService,
    SubtitleProcessorService,
    MediaQueueService,
    FfmpegService,
    FfprobeService,
    VideoProcessor,
    AudioProcessor,
    SubtitleProcessor
  ],
  exports: [MediaQueueService]
})
export class MediaProcessingModule {}
