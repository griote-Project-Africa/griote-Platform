import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, Code2, Minus, Link as LinkIcon, Heading2, Heading3,
  Undo2, Redo2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import '../../styles/editor.css';

export type EditorVariant = 'article' | 'announcement';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: EditorVariant;
  minHeight?: number;
  maxLength?: number;
  className?: string;
}

// ── Toolbar button ────────────────────────────────────────────────────────────

interface TBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function TBtn({ onClick, active, disabled, title, children }: TBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded text-sm transition-colors',
        'hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Commencez à écrire…',
  variant = 'article',
  minHeight = 280,
  maxLength,
  className,
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      // StarterKit v3 already includes Link and Underline — configure them here
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: variant === 'article' ? {} : false,
        blockquote: variant === 'article' ? {} : false,
        horizontalRule: variant === 'article' ? {} : false,
        // Link is included in StarterKit v3 — configure it directly
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
        // underline is included in StarterKit v3 — keep default config
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px`,
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL du lien :', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className={cn('flex flex-col border rounded-lg overflow-hidden bg-background', className)}>

      {/* ── Fixed toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40">

        {/* History */}
        <TBtn title="Annuler (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn title="Rétablir (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-3.5 w-3.5" />
        </TBtn>

        <Divider />

        {/* Headings — article only */}
        {variant === 'article' && (
          <>
            <TBtn
              title="Titre H2"
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-3.5 w-3.5" />
            </TBtn>
            <TBtn
              title="Titre H3"
              active={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="h-3.5 w-3.5" />
            </TBtn>
            <Divider />
          </>
        )}

        {/* Inline formatting */}
        <TBtn title="Gras (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn title="Italique (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn title="Souligné (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </TBtn>

        <Divider />

        {/* Lists */}
        <TBtn title="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </TBtn>

        {/* Article-only blocks */}
        {variant === 'article' && (
          <>
            <Divider />
            <TBtn title="Citation" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote className="h-3.5 w-3.5" />
            </TBtn>
            <TBtn title="Bloc de code" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <Code2 className="h-3.5 w-3.5" />
            </TBtn>
            <TBtn title="Séparateur horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="h-3.5 w-3.5" />
            </TBtn>
          </>
        )}

        <Divider />

        {/* Link */}
        <TBtn title="Lien (Ctrl+K)" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="h-3.5 w-3.5" />
        </TBtn>
      </div>

      {/* ── Editor content area ──────────────────────────────────────────────── */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto cursor-text"
        onClick={() => editor.commands.focus()}
      />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>{wordCount} mot{wordCount !== 1 ? 's' : ''}</span>
        <span className={cn(maxLength && charCount > maxLength * 0.9 ? 'text-destructive' : '')}>
          {charCount}{maxLength ? ` / ${maxLength}` : ''} caractères
        </span>
      </div>
    </div>
  );
}
