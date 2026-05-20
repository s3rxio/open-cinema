import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { VideoProcessorService } from "../services/video-processor.service";
import { ProcessingJobData } from "../types";

export const VIDEO_PROCESSOR_KEY = "video-processing";

@Processor(VIDEO_PROCESSOR_KEY)
export class VideoProcessor {
  constructor(private videoProcessorService: VideoProcessorService) {}

  @Process()
  async handle(job: Job<ProcessingJobData>): Promise<void> {
    const { inputPath, outputPath, streamId } = job.data;

    if (!streamId) {
      throw new Error("No streamId");
    }

    await job.progress(10);
    await this.videoProcessorService.processVideo(
      inputPath,
      outputPath,
      streamId
    );
    await job.progress(100);
  }
}
