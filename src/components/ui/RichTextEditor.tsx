'use client';

/**
 * 📝 Éditeur WYSIWYG avec Tiptap
 * Éditeur de texte riche pour descriptions de produits
 */

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Heading2,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Commencez à écrire...',
  className
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline'
        }
      })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-3 py-2'
      }
    }
  });

  // Mettre à jour le contenu si la valeur externe change
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleHeading = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const setLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={cn('border border-gray-300 rounded-md overflow-hidden', className)}>
      {/* Barre d'outils */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBold}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bold') && 'bg-gray-200'
          )}
          title="Gras (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleItalic}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('italic') && 'bg-gray-200'
          )}
          title="Italique (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleHeading}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('heading', { level: 2 }) && 'bg-gray-200'
          )}
          title="Titre (Ctrl+Alt+2)"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBulletList}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bulletList') && 'bg-gray-200'
          )}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleOrderedList}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('orderedList') && 'bg-gray-200'
          )}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('link') && 'bg-gray-200'
          )}
          title="Insérer un lien"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
          title="Refaire (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Zone d'édition */}
      <EditorContent 
        editor={editor} 
        className="bg-white min-h-[200px] max-h-[400px] overflow-y-auto"
      />
    </div>
  );
}

