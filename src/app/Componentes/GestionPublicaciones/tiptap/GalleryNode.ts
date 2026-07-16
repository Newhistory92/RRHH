import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gallery: {
      setGallery: (attrs: { srcs: string[] }) => ReturnType;
    };
  }
}

export const GalleryNode = Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      srcs: {
        default: [] as string[],
        parseHTML: (element) =>
          Array.from(element.querySelectorAll('img')).map((img) => img.getAttribute('src') || ''),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.pub-gallery' }];
  },

  renderHTML({ node }) {
    const imgs = (node.attrs.srcs as string[]).map((src) => [
      'img',
      { src, class: 'pub-gallery-img', alt: '' },
    ]);
    return ['div', mergeAttributes({ class: 'pub-gallery' }), ...imgs];
  },

  addCommands() {
    return {
      setGallery:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
