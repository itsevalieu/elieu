'use client';

import { useMemo, useCallback } from 'react';
import type { Value } from 'platejs';
import {
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
  type PlateElementProps,
  type PlateLeafProps,
} from 'platejs/react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  CodePlugin,
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  CodeBlockPlugin,
} from '@platejs/basic-nodes/react';
import { MarkdownPlugin, deserializeMd, serializeMd } from '@platejs/markdown';

function H1Element(props: PlateElementProps) {
  return <PlateElement as="h1" style={{ fontSize: '2em', fontWeight: 700, margin: '0.5em 0' }} {...props} />;
}
function H2Element(props: PlateElementProps) {
  return <PlateElement as="h2" style={{ fontSize: '1.5em', fontWeight: 600, margin: '0.4em 0' }} {...props} />;
}
function H3Element(props: PlateElementProps) {
  return <PlateElement as="h3" style={{ fontSize: '1.25em', fontWeight: 600, margin: '0.3em 0' }} {...props} />;
}
function BlockquoteEl(props: PlateElementProps) {
  return (
    <PlateElement
      as="blockquote"
      style={{ borderLeft: '3px solid #d4d4d8', paddingLeft: '1rem', color: '#71717a', fontStyle: 'italic', margin: '0.5em 0' }}
      {...props}
    />
  );
}
function CodeBlockEl(props: PlateElementProps) {
  return (
    <PlateElement
      as="pre"
      style={{ background: '#f4f4f5', borderRadius: 6, padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.875rem', overflow: 'auto', margin: '0.5em 0' }}
      {...props}
    />
  );
}
function CodeLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf
      as="code"
      style={{ background: '#f4f4f5', borderRadius: 3, padding: '0.1em 0.3em', fontFamily: 'monospace', fontSize: '0.875em' }}
      {...props}
    />
  );
}

type RichTextEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  label?: string;
  error?: string;
};

export function RichTextEditor({ value, onChange, label, error }: RichTextEditorProps) {
  const plugins = useMemo(() => [
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    CodePlugin.withComponent(CodeLeaf),
    H1Plugin.withComponent(H1Element),
    H2Plugin.withComponent(H2Element),
    H3Plugin.withComponent(H3Element),
    BlockquotePlugin.withComponent(BlockquoteEl),
    CodeBlockPlugin.withComponent(CodeBlockEl),
    MarkdownPlugin,
  ], []);

  const editor = usePlateEditor({
    plugins,
    value: () => {
      if (!value) return [{ type: 'p', children: [{ text: '' }] }] as Value;
      try {
        return deserializeMd(editor, value);
      } catch {
        return [{ type: 'p', children: [{ text: value }] }] as Value;
      }
    },
  });

  const handleChange = useCallback(
    ({ value: val }: { value: Value }) => {
      try {
        const md = serializeMd(editor);
        onChange(md);
      } catch {
        // serialization failed — skip
      }
    },
    [editor, onChange],
  );

  return (
    <div className="space-y-1">
      {label && <p className="text-sm font-medium text-zinc-800">{label}</p>}
      <Plate editor={editor} onChange={handleChange}>
        <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-zinc-200 bg-zinc-50 px-2 py-1.5">
          <ToolbarBtn onClick={() => editor.tf.bold.toggle()} title="Bold (Ctrl+B)"><b>B</b></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.tf.italic.toggle()} title="Italic (Ctrl+I)"><i>I</i></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.tf.underline.toggle()} title="Underline (Ctrl+U)"><u>U</u></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.tf.code.toggle()} title="Code">&lt;/&gt;</ToolbarBtn>
          <span className="mx-1 border-l border-zinc-300" />
          <ToolbarBtn onClick={() => editor.tf.h1.toggle()} title="Heading 1">H1</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.tf.h2.toggle()} title="Heading 2">H2</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.tf.h3.toggle()} title="Heading 3">H3</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.tf.blockquote.toggle()} title="Blockquote">&#8221;</ToolbarBtn>
        </div>
        <PlateContent
          style={{ minHeight: '14rem', padding: '0.75rem 1rem', fontFamily: 'inherit', lineHeight: 1.6 }}
          className="rounded-b-lg border border-zinc-200 bg-white text-sm focus-within:ring-2 focus-within:ring-zinc-900/10"
          placeholder="Write your post content here..."
        />
      </Plate>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function ToolbarBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded px-2 py-0.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
    >
      {children}
    </button>
  );
}
