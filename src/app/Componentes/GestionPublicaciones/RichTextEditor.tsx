'use client';

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Link2, Image as ImageIcon, Table as TableIcon, MousePointerClick,
  Images, Video as VideoIcon,
} from 'lucide-react';
import { ButtonNode } from './tiptap/ButtonNode';
import { GalleryNode } from './tiptap/GalleryNode';
import { VideoNode } from './tiptap/VideoNode';
import { uploadAttachment, resolveAttachmentUrl, resolveUploadsInHtml } from '@/app/util/uploadClient';
import { validarArchivo } from './attachmentValidation';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onInlineUploaded: (id: number) => void;
}

function pickFile(accept: string, multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = () => resolve(input.files ? Array.from(input.files) : []);
    input.click();
  });
}

export function RichTextEditor({ value, onChange, onInlineUploaded }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      ButtonNode,
      GalleryNode,
      VideoNode,
    ],
    content: resolveUploadsInHtml(value || ''),
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const subirEInsertarImagen = useCallback(async () => {
    if (!editor) return;
    const [file] = await pickFile('image/*', false);
    if (!file) return;
    const error = validarArchivo(file);
    if (error) {
      alert(error);
      return;
    }
    try {
      const att = await uploadAttachment(file, 'inline');
      editor.chain().focus().setImage({ src: resolveAttachmentUrl(att.url) }).run();
      onInlineUploaded(att.id);
    } catch (e) {
      alert((e as Error).message);
    }
  }, [editor, onInlineUploaded]);

  const subirEInsertarVideo = useCallback(async () => {
    if (!editor) return;
    const [file] = await pickFile('video/mp4,video/webm', false);
    if (!file) return;
    const error = validarArchivo(file);
    if (error) {
      alert(error);
      return;
    }
    try {
      const att = await uploadAttachment(file, 'inline');
      editor.chain().focus().setVideo({ src: resolveAttachmentUrl(att.url) }).run();
      onInlineUploaded(att.id);
    } catch (e) {
      alert((e as Error).message);
    }
  }, [editor, onInlineUploaded]);

  const subirEInsertarGaleria = useCallback(async () => {
    if (!editor) return;
    const files = await pickFile('image/*', true);
    if (files.length === 0) return;
    const validos: File[] = [];
    for (const file of files) {
      const error = validarArchivo(file);
      if (error) {
        alert(error);
        continue;
      }
      validos.push(file);
    }
    if (validos.length === 0) return;
    try {
      const subidas = await Promise.all(validos.map((f) => uploadAttachment(f, 'inline')));
      editor.chain().focus().setGallery({ srcs: subidas.map((a) => resolveAttachmentUrl(a.url)) }).run();
      subidas.forEach((a) => onInlineUploaded(a.id));
    } catch (e) {
      alert((e as Error).message);
    }
  }, [editor, onInlineUploaded]);

  const insertarLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL del enlace:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const insertarBoton = useCallback(() => {
    if (!editor) return;
    const label = window.prompt('Texto del botón:');
    const href = window.prompt('URL del botón:');
    if (label && href) editor.chain().focus().setButton({ href, label }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = 'p-2 rounded-lg hover:bg-muted text-foreground transition-colors duration-150';

  return (
    <div className="border border-border rounded-xl bg-card shadow-soft overflow-hidden">
      <div className="flex flex-wrap gap-1 border-b border-border p-2 bg-background">
        <button type="button" title="Negrita" className={btn} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></button>
        <button type="button" title="Itálica" className={btn} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></button>
        <button type="button" title="Título 1" className={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></button>
        <button type="button" title="Título 2" className={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></button>
        <button type="button" title="Lista" className={btn} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></button>
        <button type="button" title="Lista numerada" className={btn} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></button>
        <button type="button" title="Enlace" className={btn} onClick={insertarLink}><Link2 size={16} /></button>
        <button type="button" title="Imagen" className={btn} onClick={subirEInsertarImagen}><ImageIcon size={16} /></button>
        <button type="button" title="Galería" className={btn} onClick={subirEInsertarGaleria}><Images size={16} /></button>
        <button type="button" title="Video" className={btn} onClick={subirEInsertarVideo}><VideoIcon size={16} /></button>
        <button type="button" title="Tabla" className={btn} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={16} /></button>
        <button type="button" title="Botón/CTA" className={btn} onClick={insertarBoton}><MousePointerClick size={16} /></button>
      </div>
      <EditorContent editor={editor} className="pub-content p-4 min-h-[240px] text-foreground focus:outline-none" />
    </div>
  );
}
