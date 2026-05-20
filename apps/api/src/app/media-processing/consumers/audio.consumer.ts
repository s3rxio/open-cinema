import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { AudioProcessorService } from "../services/audio-processor.service";
import { ProcessingJobData } from "../types";

export const AUDIO_PROCESSOR_KEY = "audio-processing";

@Processor(AUDIO_PROCESSOR_KEY)
export class AudioProcessor {
  constructor(private audioProcessorService: AudioProcessorService) {}

  @Process()
  async handle(job: Job<ProcessingJobData>): Promise<void> {
    const { inputPath, outputPath, metaId } = job.data;

    if (!metaId) {
      throw new Error("No metaId");
    }

    await job.progress(10);
    await this.audioProcessorService.processAudio(
      inputPath,
      outputPath,
      metaId
    );
    return await job.progress(100);
  }
}
