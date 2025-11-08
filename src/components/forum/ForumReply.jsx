import { useState, useCallback } from 'react';
import { ArrowUp, MessageSquare, MoreVertical, Check } from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

const ForumReply = ({ reply, postAuthorId, onReply, formatDate, depth = 0 }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const maxDepth = 3; // Maximum nesting level
  const isMaxDepth = depth >= maxDepth;
  const isAuthor = reply.author.id === postAuthorId;

  const handleUpvote = useCallback(() => {
    setUpvoted(!upvoted);
  }, [upvoted]);

  const handleReply = useCallback(() => {
    if (!replyContent.trim()) return;
    
    onReply(reply.id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  }, [replyContent, reply.id, onReply]);

  return (
    <div
      className={`
        ${depth > 0 ? 'ml-6 sm:ml-12 pl-4 border-l border-white/10' : ''}
        ${collapsed ? 'opacity-50' : ''}
      `}
    >
      <div className="bg-surface-float rounded-lg border border-white/10 overflow-hidden hover:border-white/20 transition-all">
        {/* Reply Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar - Menor que o post principal */}
            <img
              src={reply.author.avatarUrl || '/default-avatar.png'}
              alt={reply.author.displayName || reply.author.username}
              className="w-9 h-9 rounded-full shrink-0 ring-1 ring-white/10"
              loading="lazy"
              onError={handleImageError('avatar')}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Author Info - Mais compacto */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-medium text-sm text-text-primary">
                  {reply.author.displayName}
                </span>
                
                {/* Author Badge */}
                {isAuthor && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    AUTOR
                  </span>
                )}
                
                {/* Other Badges - Menores */}
                {reply.author.badges?.map((badge, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-surface-float2 text-text-tertiary border border-white/10"
                  >
                    {badge}
                  </span>
                ))}
                
                {/* Best Answer Badge - Destacado mas menor que post principal */}
                {reply.isBestAnswer && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-green-500/15 text-green-400 border border-green-500/20">
                    <Check size={11} />
                    MELHOR RESPOSTA
                  </span>
                )}
                
                {/* Timestamp */}
                <span className="text-[11px] text-text-tertiary">
                  {formatDate(reply.createdAt)}
                </span>
              </div>

              {/* Reply Content */}
              {!collapsed && (
                <>
                  <div
                    className="text-[13px] text-text-secondary leading-relaxed mb-3 prose prose-invert prose-sm max-w-none
                      prose-p:text-text-secondary prose-p:text-[13px]
                      prose-strong:text-text-primary prose-strong:font-semibold
                      prose-code:text-theme-active prose-code:bg-surface-float prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                      prose-pre:bg-surface-float prose-pre:border prose-pre:border-white/5
                      prose-a:text-theme-active prose-a:no-underline hover:prose-a:underline prose-a:text-[13px]"
                    dangerouslySetInnerHTML={{ __html: reply.content.replace(/\n/g, '<br />') }}
                  />

                  {/* Actions - Mais discretos */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Upvote */}
                    <button
                      onClick={handleUpvote}
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                        ${upvoted
                          ? 'bg-theme-active/20 text-theme-active border border-theme-active/40'
                          : 'bg-surface-float2 text-text-tertiary hover:text-text-primary hover:bg-surface-base border border-white/10'}
                      `}
                    >
                      <ArrowUp size={13} />
                      <span>{reply.upvotes + (upvoted ? 1 : 0)}</span>
                    </button>

                    {/* Reply Button */}
                    {!isMaxDepth && (
                      <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-float2 text-text-tertiary hover:text-text-primary hover:bg-surface-base transition-all border border-white/10"
                      >
                        <MessageSquare size={13} />
                        <span className="text-[11px]">Responder</span>
                      </button>
                    )}

                    {/* Reply Count (if has replies) */}
                    {reply.replies && reply.replies.length > 0 && (
                      <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors font-medium"
                      >
                        {collapsed ? '↓ Mostrar' : '↑ Ocultar'} {reply.replies.length}{' '}
                        {reply.replies.length === 1 ? 'resposta' : 'respostas'}
                      </button>
                    )}

                    {/* More Options */}
                    <button className="ml-auto p-1 text-text-tertiary hover:text-text-primary hover:bg-surface-float rounded transition-all">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </>
              )}

              {/* Collapsed State */}
              {collapsed && (
                <button
                  onClick={() => setCollapsed(false)}
                  className="text-xs text-text-tertiary hover:text-text-primary transition-colors font-medium"
                >
                  ↓ Clique para expandir {reply.replies?.length || 0} respostas...
                </button>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {showReplyForm && !collapsed && (
            <div className="mt-3 ml-12 pt-3 border-t border-white/10">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="w-full min-h-[100px] p-3 bg-surface-base rounded-lg text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-theme-active/30 resize-y transition-all border border-white/10"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-surface-float2 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1.5 text-xs font-medium bg-surface-float2 text-text-primary rounded-lg hover:bg-surface-base transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Responder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {!collapsed && reply.replies && reply.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {reply.replies.map((nestedReply) => (
            <ForumReply
              key={nestedReply.id}
              reply={nestedReply}
              postAuthorId={postAuthorId}
              onReply={onReply}
              formatDate={formatDate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumReply;
