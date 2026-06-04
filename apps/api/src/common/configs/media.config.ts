import { registerAs } from "@nestjs/config";
import { tmpdir } from "os";

export type MediaConfig = {
  tmpDir: string;
};

const mediaConfig = registerAs(
  "media",
  (): MediaConfig => ({
    tmpDir: process.env.API_MEDIA_TMP_DIR || tmpdir()
  })
);

export default mediaConfig;
