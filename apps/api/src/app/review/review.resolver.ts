import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { BypassAuth } from "../auth/bypass-auth.decorator";
import { Permission, RequiredPermission } from "../rbac";
import { CreateReviewInput } from "./dto/create-review.input";
import { UpdateReviewInput } from "./dto/update-review.input";
import { Review } from "./entities/review.entity";
import { ReviewService } from "./review.service";

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @BypassAuth()
  @Query(() => [Review], { name: "movieReviews" })
  movieReviews(@Args("movieId") movieId: string) {
    return this.reviewService.findByMovieId(movieId);
  }

  @BypassAuth()
  @Query(() => [Review], { name: "seriesReviews" })
  seriesReviews(@Args("seriesId") seriesId: string) {
    return this.reviewService.findBySeriesId(seriesId);
  }

  @RequiredPermission(Permission.ReviewsCreate)
  @Mutation(() => Review)
  createReview(
    @Args("createReviewInput") createReviewInput: CreateReviewInput
  ) {
    return this.reviewService.create(createReviewInput);
  }

  @RequiredPermission(Permission.ReviewsUpdate)
  @Mutation(() => Review)
  updateReview(
    @Args("updateReviewInput") updateReviewInput: UpdateReviewInput
  ) {
    return this.reviewService.update(updateReviewInput);
  }

  @RequiredPermission(Permission.ReviewsDelete)
  @Mutation(() => Boolean)
  removeReview(
    @Args("id") id: string,
    @Args("userId") userId: string
  ) {
    return this.reviewService.remove(id, userId);
  }
}
