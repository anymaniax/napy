import fs from 'fs-extra';
import path from 'upath';

export const findRootLock = () => {
  let isPackage = false;
  let relativePath = '';

  while (!isPackage) {
    isPackage = fs.existsSync(relativePath + 'package.json');

    if (!isPackage) {
      relativePath = `../${relativePath}`;
    }
  }

  const isYarn = fs.existsSync(relativePath + 'yarn.lock');
  const isNpm = fs.existsSync(relativePath + 'package-lock.json');

  const root = path.resolve(process.cwd(), relativePath);

  return { root, isNpm, isYarn };
};
