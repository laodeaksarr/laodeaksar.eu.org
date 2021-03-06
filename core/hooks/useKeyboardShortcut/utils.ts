import type { Config } from './types';
import { specialKeys } from './constants';

export const extractRegulerKeys = (
  string: string,
  config: Config
): string[] => {
  return string
    .replace(/ /g, '')
    .split(config.separator as string)
    .filter((o) => !Object.values(specialKeys).includes(o));
};
