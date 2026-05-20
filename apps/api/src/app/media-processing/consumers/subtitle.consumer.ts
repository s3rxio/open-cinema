import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { SubtitleProcessorService } from "../services/subtitle-processor.service";
import { ProcessingJobData } from "../types";

export const SUBTITLE_PROCESSOR_KEY = "subtitle-processing";

@Processor(SUBTITLE_PROCESSOR_KEY)
export class SubtitleProcessor {
  constructor(private subtitleProcessorService: SubtitleProcessorService) {}

  @Process()
  async handle(job: Job<ProcessingJobData>): Promise<void> {
    const { inputPath, outputPath, metaId } = job.data;

    if (!metaId) {
      throw new Error("No metaId");
    }

    await job.progress(10);
    await this.subtitleProcessorService.processSubtitle(
      inputPath,
      outputPath,
      metaId
    );
    await job.progress(100);
  }
}
