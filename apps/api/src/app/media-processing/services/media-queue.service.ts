import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { ProcessingJobData, ProcessingType } from "../types";
import { VIDEO_PROCESSOR_KEY } from "../consumers/video.consumer";
import { AUDIO_PROCESSOR_KEY } from "../consumers/audio.consumer";
import { SUBTITLE_PROCESSOR_KEY } from "../consumers/subtitle.consumer";

@Injectable()
export class MediaQueueService {
  constructor(
    @InjectQueue(VIDEO_PROCESSOR_KEY)
    private videoQueue: Queue<ProcessingJobData>,
    @InjectQueue(AUDIO_PROCESSOR_KEY)
    private audioQueue: Queue<ProcessingJobData>,
    @InjectQueue(SUBTITLE_PROCESSOR_KEY)
    private subtitleQueue: Queue<ProcessingJobData>
  ) {}

  async enqueueVideoProcessing(data: ProcessingJobData): Promise<void> {
    await this.videoQueue.add(data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: true
    });
  }

  async enqueueAudioProcessing(data: ProcessingJobData): Promise<void> {
    await this.audioQueue.add(data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: true
    });
  }

  async enqueueSubtitleProcessing(data: ProcessingJobData): Promise<void> {
    await this.subtitleQueue.add(data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: true
    });
  }

  async getQueueStatus(type: ProcessingType) {
    const queue =
      type === ProcessingType.VIDEO
        ? this.videoQueue
        : type === ProcessingType.AUDIO
          ? this.audioQueue
          : this.subtitleQueue;

    const counts = await queue.getJobCounts();
    return {
      type,
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed
    };
  }
}
