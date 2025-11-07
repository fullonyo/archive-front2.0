import { useState, useCallback, useRef } from 'react';
import { 
  Bold, Italic, Code, Link, Image, List, ListOrdered,
  Quote, Heading1, Heading2, Heading3, Eye, Edit3
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ForumEditor = ({ value, onChange, isPreview = false, placeholder, error }) => {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Toolbar actions
  const insertMarkdown = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = before + (selectedText || placeholder) + after;
    
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newStart = start + before.length;
      const newEnd = newStart + (selectedText || placeholder).length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  }, [value, onChange]);

  const toolbarActions = [
    {
      icon: Bold,
      label: 'Negrito',
      action: () => insertMarkdown('**', '**', 'texto em negrito')
    },
    {
      icon: Italic,
      label: 'Itálico', 
      action: () => insertMarkdown('*', '*', 'texto em itálico')
    },
    {
      icon: Code,
      label: 'Código',
      action: () => insertMarkdown('`', '`', 'código')
    },
    { type: 'separator' },
    {
      icon: Heading1,
      label: 'Título 1',
      action: () => insertMarkdown('# ', '', 'Título principal')
    },
    {
      icon: Heading2,
      label: 'Título 2',
      action: () => insertMarkdown('## ', '', 'Subtítulo')
    },
    {
      icon: Heading3,
      label: 'Título 3',
      action: () => insertMarkdown('### ', '', 'Título menor')
    },
    { type: 'separator' },
    {
      icon: Link,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)', 'texto do link')
    },
    {
      icon: Image,
      label: 'Imagem',
      action: () => insertMarkdown('![', '](url)', 'descrição da imagem')
    },
    { type: 'separator' },
    {
      icon: List,
      label: 'Lista',
      action: () => insertMarkdown('- ', '', 'item da lista')
    },
    {
      icon: ListOrdered,
      label: 'Lista numerada',
      action: () => insertMarkdown('1. ', '', 'primeiro item')
    },
    {
      icon: Quote,
      label: 'Citação',
      action: () => insertMarkdown('> ', '', 'texto da citação')
    }
  ];

  // Simple markdown to HTML conversion for preview
  const renderMarkdown = useCallback((text) => {
    let html = text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mb-3 mt-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-3 mt-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-surface-float2 px-1.5 py-0.5 rounded text-xs font-mono border border-white/10">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-theme-active hover:underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg border border-white/10 my-2" />')
      // Lists
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>')
      // Quotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-theme-active/50 pl-4 italic text-text-secondary bg-surface-float2 py-2 my-2 rounded-r">$1</blockquote>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return html;
  }, []);

  // Handle drag and drop for images
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        // TODO: Upload image to server
        const placeholder = `![${file.name}](uploading...)`;
        insertMarkdown('', '', placeholder);
        console.log('Would upload image:', file);
      }
    }
  }, [insertMarkdown]);

  if (isPreview) {
    return (
      <div className="border border-white/5 rounded-lg bg-surface-float">
        {/* Preview Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-surface-float2 rounded-t-lg">
          <Eye size={16} className="text-theme-active" />
          <span className="text-sm font-medium text-theme-active">Preview</span>
        </div>
        
        {/* Preview Content */}
        <div className="p-4 min-h-[300px]">
          {value.trim() ? (
            <div 
              className="prose prose-invert max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <div className="text-text-tertiary text-sm italic">
              {t('forum.noPreviewYet')}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg bg-surface-float ${
      error ? 'border-red-400' : 'border-white/5'
    } ${dragActive ? 'border-theme-active bg-theme-active/5' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-surface-float2 rounded-t-lg">
        <div className="flex items-center gap-2 text-text-tertiary">
          <Edit3 size={14} />
          <span className="text-xs font-medium">Markdown</span>
        </div>
        
        <div className="flex items-center gap-0.5 ml-3">
          {toolbarActions.map((action, index) => {
            if (action.type === 'separator') {
              return <div key={index} className="w-px h-5 bg-white/10 mx-1" />;
            }
            
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                title={action.label}
                className="p-1.5 hover:bg-surface-float rounded text-text-tertiary hover:text-text-primary transition-colors"
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>

        <div className="ml-auto text-xs text-text-tertiary">
          {value.length} {t('forum.charactersCount')}
        </div>
      </div>

      {/* Editor */}
      <div 
        className="relative"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[300px] p-4 bg-transparent text-sm text-text-primary 
            placeholder:text-text-tertiary focus:outline-none resize-y font-mono leading-relaxed"
        />
        
        {dragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-theme-active/10 border-2 border-dashed border-theme-active rounded-b-lg">
            <div className="text-center">
              <Image size={32} className="mx-auto mb-2 text-theme-active" />
              <div className="text-sm font-medium text-theme-active">
                {t('forum.dropImageHere')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with tips */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-surface-float2 rounded-b-lg">
        <div className="text-xs text-text-tertiary">
          {t('forum.markdownSupported')}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <span>{t('forum.tabToIndent')}</span>
          <span>{t('forum.ctrlEnterSubmit')}</span>
        </div>
      </div>
      
      {error && (
        <p className="text-red-400 text-xs mt-1 px-4">{error}</p>
      )}
    </div>
  );
};

export default ForumEditor;