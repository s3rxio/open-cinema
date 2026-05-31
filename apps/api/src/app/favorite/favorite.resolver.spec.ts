import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteResolver } from "./favorite.resolver";
import { FavoriteService } from "./favorite.service";

describe("FavoriteResolver", () => {
  let resolver: FavoriteResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteResolver, FavoriteService]
    }).compile();

    resolver = module.get<FavoriteResolver>(FavoriteResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });
});
