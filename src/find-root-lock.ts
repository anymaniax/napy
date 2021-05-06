import fs from 'fs-extra';
import path from 'upath';

export const findRootLock = () => {
  let isPackage = false;
  let relativePath = '';
  const max = process.cwd().split('/').length;
  let count = 0;

  while (max === count || isPackage) {
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
