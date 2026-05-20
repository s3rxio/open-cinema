import { PathLike } from "fs";

import * as fs from "fs/promises";

export const deleteFolderRecursive = async (path: PathLike) => {
  let files: PathLike[] = [];
  try {
    await fs.access(path, fs.constants.F_OK);
    files = await fs.readdir(path);
    files.forEach(async file => {
      const curPath = path + "/" + file;
      if (await fs.lstat(curPath).then(s => s.isDirectory())) {
        deleteFolderRecursive(curPath);
      } else {
        await fs.unlink(curPath);
      }
    });
    await fs.rmdir(path);
  } catch (error) {
    console.log(error);
  }
};
