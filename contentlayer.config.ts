import type { ComputedFields, FieldDefs } from 'contentlayer/source-files';
import {
  defineDocumentType,
  defineNestedType,
  makeSource
} from 'contentlayer/source-files';
import { pick } from 'contentlayer/client';
import { omit } from 'contentlayer/utils';

import { remarkFigure } from './lib/remark/remark-figure';
import { remarkSectionize } from './lib/remark/remark-sectionize-fork';

import readingTime from 'reading-time';
import remarkSlug from 'remark-slug';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import remarkAutolinkHeadings from 'remark-autolink-headings';

const Image = defineNestedType(() => ({
  name: 'Image',
  fields: {
    url: { type: 'string', required: true },
    title: { type: 'string', required: true },
    alt: { type: 'string', required: true },
    caption: { type: 'string', required: true }
  }
}));

const Tag = defineNestedType(() => ({
  name: 'Tag',
  fields: {
    name: { type: 'string', required: true },
    path: { type: 'string', required: true }
  }
}));

const fields: FieldDefs = {
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  date: { type: 'date', required: true },
  updated: { type: 'date', required: true },
  tags: { type: 'list', required: true, of: { type: 'string' }, default: [] },
  image: { type: 'string' },
  colorFeatured: { type: 'string' },
  fontFeatured: { type: 'string' },
  language: { type: 'string' },
  featured: { type: 'boolean' }
};

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  wordCount: {
    type: 'number',
    resolve: (doc) => doc.body.raw.split(/\s+/gu).length
  },
  tweetIds: {
    type: 'json',
    resolve: (doc) => {
      const tweetMatches = doc.body.raw.match(
        /<StaticTweet\sid="[0-9]+"\s\/>/g
      );
      const tweetIDs = tweetMatches?.map(
        (tweet: any) => tweet.match(/[0-9]+/g)[0]
      );
      return tweetIDs ?? [];
    }
  },
  url: {
    type: 'string',
    resolve: (doc) => '/' + doc._raw.flattenedPath
  },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, '')
  }
};

const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/*.mdx',
  contentType: 'mdx',
  fields: omit(fields, ['language']),
  computedFields
}));

const Snippet = defineDocumentType(() => ({
  name: 'Snippet',
  filePathPattern: 'snippets/*.mdx',
  contentType: 'mdx',
  fields: pick(fields, ['title', 'description', 'date', 'image', 'language']),
  computedFields: pick(computedFields, ['slug', 'url'])
}));

const OtherPage = defineDocumentType(() => ({
  name: 'OtherPage',
  filePathPattern: '*.mdx',
  contentType: 'mdx',
  fields: pick(fields, ['title']),
  computedFields: pick(computedFields, ['slug'])
}));

const contentLayerConfig = makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Snippet, OtherPage],
  mdx: {
    remarkPlugins: [
      remarkSlug,
      remarkAutolinkHeadings,
      remarkSectionize,
      remarkFigure,
      remarkGfm
    ],
    rehypePlugins: [[rehypePrism, { ignoreMissing: true }]]
  }
});

export default contentLayerConfig;
