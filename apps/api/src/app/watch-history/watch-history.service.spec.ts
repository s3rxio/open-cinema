import { Test, TestingModule } from "@nestjs/testing";
import { WatchHistoryService } from "./watch-history.service";

describe("WatchHistoryService", () => {
  let service: WatchHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchHistoryService]
    }).compile();

    service = module.get<WatchHistoryService>(WatchHistoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
