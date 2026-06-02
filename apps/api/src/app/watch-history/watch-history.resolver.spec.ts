import { Test, TestingModule } from "@nestjs/testing";
import { WatchHistoryResolver } from "./watch-history.resolver";
import { WatchHistoryService } from "./watch-history.service";

describe("WatchHistoryResolver", () => {
  let resolver: WatchHistoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchHistoryResolver, WatchHistoryService]
    }).compile();

    resolver = module.get<WatchHistoryResolver>(WatchHistoryResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });
});
