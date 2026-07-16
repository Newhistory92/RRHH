import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    button: {
      setButton: (attrs: { href: string; label: string }) => ReturnType;
    };
  }
}

export const ButtonNode = Node.create({
  name: 'button',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      href: { default: '#' },
      label: { default: 'Ver más' },
    };
  },

  parseHTML() {
    return [{ tag: 'a.pub-cta' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        class: 'pub-cta',
        href: node.attrs.href,
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
      node.attrs.label,
    ];
  },

  addCommands() {
    return {
      setButton:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
