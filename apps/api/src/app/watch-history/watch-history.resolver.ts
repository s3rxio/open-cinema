import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { RecordWatchHistoryInput } from "./dto/record-watch-history.input";
import { UpdateWatchHistoryInput } from "./dto/update-watch-history.input";
import { WatchHistory } from "./entities/watch-history.entity";
import { WatchHistoryService } from "./watch-history.service";

@Resolver(() => WatchHistory)
export class WatchHistoryResolver {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Mutation(() => WatchHistory)
  recordWatchHistory(
    @Args("recordWatchHistoryInput") recordWatchHistoryInput: RecordWatchHistoryInput
  ) {
    return this.watchHistoryService.record(recordWatchHistoryInput);
  }

  @Query(() => [WatchHistory], { name: "watchHistory" })
  findAll() {
    return this.watchHistoryService.findAll();
  }

  @Query(() => WatchHistory, { name: "watchHistoryEntry" })
  findOne(@Args("id") id: string) {
    return this.watchHistoryService.findOne(id);
  }

  @Mutation(() => WatchHistory)
  updateWatchHistory(
    @Args("updateWatchHistoryInput") updateWatchHistoryInput: UpdateWatchHistoryInput
  ) {
    return this.watchHistoryService.update(
      updateWatchHistoryInput.id,
      updateWatchHistoryInput
    );
  }

  @Mutation(() => Boolean)
  removeWatchHistory(@Args("id") id: string) {
    return this.watchHistoryService.remove(id);
  }
}
