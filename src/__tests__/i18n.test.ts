import { resources } from '@/lib/i18n/resources';

type Tree = { [key: string]: string | Tree };

const keys = (tree: Tree, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([k, v]) =>
    typeof v === 'string' ? [`${prefix}${k}`] : keys(v, `${prefix}${k}.`),
  );

describe('translations', () => {
  const reference = keys(resources.en.translation).sort();

  it.each(Object.keys(resources).filter((l) => l !== 'en'))(
    '%s has the same keys as en',
    (lang) => {
      const translation = resources[lang as keyof typeof resources].translation;
      expect(keys(translation).sort()).toEqual(reference);
    },
  );
});
