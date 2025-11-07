import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowUp, 
  MessageSquare, 
  Share2, 
  Bookmark,
  MoreVertical,
  ThumbsUp,
  Heart,
  PartyPopper,
  Lightbulb,
  Check,
  Pin,
  Lock,
  Calendar,
  Eye
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Container from '../components/layout/Container';
import ForumReply from '../components/forum/ForumReply';

const ForumPostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState('best'); // best, newest, oldest

  // Reactions
  const reactions = [
    { id: 'like', icon: ThumbsUp, label: 'Útil', count: 0 },
    { id: 'love', icon: Heart, label: 'Amei', count: 0 },
    { id: 'celebrate', icon: PartyPopper, label: 'Genial', count: 0 },
    { id: 'insightful', icon: Lightbulb, label: 'Interessante', count: 0 },
  ];

  // Mock data - replace with API call
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPost({
        id,
        title: 'Como implementar autenticação JWT no Node.js com Express?',
        content: `# Contexto

Estou desenvolvendo uma API RESTful com Node.js e Express e preciso implementar autenticação segura usando JWT (JSON Web Tokens).

## O que já tentei

1. Instalei os pacotes necessários:
\`\`\`bash
npm install jsonwebtoken bcryptjs
\`\`\`

2. Criei um middleware de autenticação básico:
\`\`\`javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
\`\`\`

## Problema

Estou tendo dificuldades com o refresh token e gerenciamento de sessões. Como posso implementar um sistema robusto que:

- Renove tokens automaticamente
- Gerencie múltiplos dispositivos
- Permita logout remoto
- Seja seguro contra ataques CSRF

Alguém pode me ajudar com exemplos práticos?`,
        author: {
          id: 1,
          username: 'TechDev',
          displayName: 'Tech Developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechDev',
          badges: ['Colaborador', 'Top Contributor'],
          reputation: 2450
        },
        category: 'support',
        tags: ['javascript', 'nodejs', 'jwt', 'authentication', 'security'],
        status: null, // 'solved', 'pinned', 'locked'
        upvotes: 42,
        views: 1234,
        replyCount: 8,
        createdAt: '2024-11-05T14:30:00Z',
        updatedAt: '2024-11-06T10:15:00Z',
        isPinned: false,
        isLocked: false,
        reactions: {
          like: 15,
          love: 8,
          celebrate: 3,
          insightful: 12
        }
      });

      setReplies([
        {
          id: 1,
          content: `Ótima pergunta! Aqui está uma solução completa usando refresh tokens:

## Implementação de Refresh Token

\`\`\`javascript
// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Token de acesso expira em 15 minutos
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Refresh token expira em 7 dias
  );
  
  return { accessToken, refreshToken };
};

// Refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.id);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Refresh token inválido' });
  }
});
\`\`\`

Para múltiplos dispositivos, você pode armazenar os refresh tokens no banco de dados com informações do dispositivo.`,
          author: {
            id: 2,
            username: 'SecurityPro',
            displayName: 'Security Professional',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SecurityPro',
            badges: ['Especialista', 'Moderador'],
            reputation: 5890
          },
          upvotes: 28,
          createdAt: '2024-11-05T15:20:00Z',
          isBestAnswer: true,
          replies: [
            {
              id: 11,
              content: 'Perfeito! Mas como você recomenda armazenar os refresh tokens? Redis ou banco de dados relacional?',
              author: {
                id: 1,
                username: 'TechDev',
                displayName: 'Tech Developer',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechDev',
                badges: ['Colaborador'],
                reputation: 2450
              },
              upvotes: 5,
              createdAt: '2024-11-05T15:45:00Z',
              replies: [
                {
                  id: 111,
                  content: 'Redis é melhor para performance, mas PostgreSQL funciona bem se você já está usando. O importante é ter TTL automático e limpeza de tokens expirados.',
                  author: {
                    id: 2,
                    username: 'SecurityPro',
                    displayName: 'Security Professional',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SecurityPro',
                    badges: ['Especialista', 'Moderador'],
                    reputation: 5890
                  },
                  upvotes: 12,
                  createdAt: '2024-11-05T16:00:00Z',
                  replies: []
                }
              ]
            }
          ]
        },
        {
          id: 2,
          content: `Para proteção CSRF, você deve usar tokens CSRF junto com JWT:

\`\`\`javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Incluir CSRF token nas respostas
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
\`\`\`

No frontend, inclua o token em todas as requisições de mutação.`,
          author: {
            id: 3,
            username: 'FullStackNinja',
            displayName: 'FullStack Ninja',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FullStackNinja',
            badges: ['Contribuidor'],
            reputation: 1250
          },
          upvotes: 15,
          createdAt: '2024-11-05T16:30:00Z',
          isBestAnswer: false,
          replies: []
        }
      ]);

      setLoading(false);
    }, 600);
  }, [id]);

  const handleUpvote = useCallback(() => {
    setUpvoted(!upvoted);
    setPost(prev => ({
      ...prev,
      upvotes: upvoted ? prev.upvotes - 1 : prev.upvotes + 1
    }));
  }, [upvoted]);

  const handleReaction = useCallback((reactionId) => {
    setSelectedReaction(selectedReaction === reactionId ? null : reactionId);
  }, [selectedReaction]);

  const handleBookmark = useCallback(() => {
    setBookmarked(!bookmarked);
  }, [bookmarked]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    // TODO: Show toast notification
  }, []);

  const handleReply = useCallback(() => {
    if (!replyContent.trim()) return;
    
    // TODO: Call API to create reply
    console.log('Reply:', replyContent);
    setReplyContent('');
    setShowReplyEditor(false);
  }, [replyContent]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Modern Skeleton Component
  const PostDetailSkeleton = () => (
    <div className="max-w-4xl mx-auto py-6">
      {/* Back button skeleton */}
      <div className="h-5 bg-surface-float2 rounded w-24 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Post container skeleton */}
      <div className="bg-surface-float rounded-xl border border-white/5 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          {/* Author info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-surface-float2 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-float2 rounded w-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
              <div className="h-3 bg-surface-float2 rounded w-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3 mb-4">
            <div className="h-8 bg-surface-float2 rounded w-3/4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
            <div className="h-8 bg-surface-float2 rounded w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-surface-float2 rounded-full w-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 border-b border-white/5 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 bg-surface-float2 rounded w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          ))}
          <div className="h-4 bg-surface-float2 rounded w-2/3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-surface-base/50">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-surface-float2 rounded-lg w-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Container>
        {/* Loading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress-bar"
            style={{
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }}
          />
        </div>
        <PostDetailSkeleton />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-text-secondary">Post não encontrado</p>
          <button 
            onClick={() => navigate('/forum')}
            className="btn btn-secondary mt-4"
          >
            Voltar ao Fórum
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar</span>
        </button>

        {/* Post Container - Destaque Visual */}
        <div className="bg-surface-float rounded-2xl border-2 border-white/10 overflow-hidden shadow-xl shadow-black/20">
          {/* Post Header */}
          <div className="p-8 border-b border-white/10 bg-gradient-to-br from-surface-float via-surface-float to-surface-float2">
            {/* Author Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <img
                  src={post.author.avatar}
                  alt={post.author.displayName}
                  className="w-14 h-14 rounded-full ring-2 ring-theme-active/30"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-theme-active rounded-full border-2 border-surface-float flex items-center justify-center">
                  <span className="text-[10px] font-bold">OP</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-base font-semibold text-text-primary">
                    {post.author.displayName}
                  </span>
                  {post.author.badges?.map((badge, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-theme-active to-purple-500 text-white shadow-md"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={15} />
                    Publicado {formatDate(post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Eye size={15} />
                    {post.views.toLocaleString()} visualizações
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-theme-active/10 text-theme-active font-semibold">
                    {post.author.reputation} pts
                  </span>
                </div>
              </div>
              <button className="p-2 text-text-tertiary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2.5 mb-5">
              {post.isPinned && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <Pin size={15} />
                  Fixado
                </span>
              )}
              {post.isLocked && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                  <Lock size={15} />
                  Bloqueado
                </span>
              )}
              {post.status === 'solved' && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
                  <Check size={15} />
                  Resolvido
                </span>
              )}
            </div>

            {/* Title - Destaque maior */}
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-5 leading-tight">
              {post.title}
            </h1>

            {/* Tags - Mais destaque */}
            <div className="flex flex-wrap gap-2.5">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-surface-base border border-white/10 text-text-secondary hover:text-theme-active hover:bg-theme-active/10 hover:border-theme-active/30 transition-all cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Post Content - Maior espaçamento */}
          <div className="p-8 border-b border-white/10 bg-surface-float">
            <div 
              className="prose prose-invert prose-base sm:prose-lg max-w-none
                prose-headings:text-text-primary prose-headings:font-bold
                prose-p:text-text-secondary prose-p:leading-relaxed
                prose-strong:text-text-primary prose-strong:font-semibold
                prose-code:text-theme-active prose-code:bg-surface-base prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm
                prose-pre:bg-surface-base prose-pre:border-2 prose-pre:border-white/10 prose-pre:shadow-lg
                prose-a:text-theme-active prose-a:font-medium prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </div>

          {/* Actions Bar - Mais destaque */}
          <div className="p-6 bg-gradient-to-br from-surface-base/80 to-surface-base border-t-2 border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Left Actions */}
              <div className="flex items-center gap-3">
                {/* Upvote - Maior */}
                <button
                  onClick={handleUpvote}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${upvoted 
                      ? 'bg-gradient-to-r from-theme-active to-purple-500 text-white shadow-xl shadow-theme-active/30 scale-105' 
                      : 'bg-surface-float text-text-secondary hover:text-text-primary hover:bg-surface-float2 hover:scale-105 border border-white/10'}
                  `}
                >
                  <ArrowUp size={18} className={upvoted ? 'animate-bounce' : ''} />
                  <span className="text-base">{post.upvotes}</span>
                </button>

                {/* Reply Count */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-float rounded-xl text-text-tertiary text-sm font-medium border border-white/10">
                  <MessageSquare size={18} />
                  <span>{post.replyCount} respostas</span>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleBookmark}
                  className={`
                    p-2.5 rounded-xl transition-all border
                    ${bookmarked
                      ? 'bg-gradient-to-r from-theme-active to-purple-500 text-white shadow-xl shadow-theme-active/30 border-transparent'
                      : 'bg-surface-float text-text-tertiary hover:text-text-primary hover:bg-surface-float2 border-white/10 hover:border-white/20'}
                  `}
                  title="Salvar"
                >
                  <Bookmark size={18} className={bookmarked ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-surface-float text-text-tertiary hover:text-text-primary hover:bg-surface-float2 transition-all border border-white/10 hover:border-white/20"
                  title="Compartilhar"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Reactions - Linha separada */}
            <div className="flex items-center gap-2.5 mt-5 pt-5 border-t border-white/10">
              <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider mr-2">Reações</span>
              {reactions.map((reaction) => {
                const ReactionIcon = reaction.icon;
                const count = post.reactions[reaction.id] || 0;
                const isSelected = selectedReaction === reaction.id;
                
                return (
                  <button
                    key={reaction.id}
                    onClick={() => handleReaction(reaction.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                      ${isSelected
                        ? 'bg-gradient-to-r from-theme-active to-purple-500 text-white shadow-xl shadow-theme-active/30 scale-110'
                        : 'bg-surface-float text-text-tertiary hover:text-text-primary hover:bg-surface-float2 hover:scale-105 border border-white/10'}
                    `}
                    title={reaction.label}
                  >
                    <ReactionIcon size={15} />
                    <span>{count + (isSelected ? 1 : 0)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Replies Section - Visual separator */}
        <div className="mt-12">
          {/* Separator with label */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Discussão
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Replies Header */}
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <MessageSquare size={20} className="text-theme-active" />
              {replies.length} {replies.length === 1 ? 'Resposta' : 'Respostas'}
            </h2>
            
            {/* Sort Options - Mais discretos */}
            <div className="flex gap-1">
              {[
                { value: 'best', label: 'Melhores' },
                { value: 'newest', label: 'Recentes' },
                { value: 'oldest', label: 'Antigas' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${sortBy === option.value
                      ? 'bg-surface-float text-text-primary border border-white/10'
                      : 'text-text-tertiary hover:text-text-primary hover:bg-surface-float/50'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Reply Button - Menos destaque que o post principal */}
          {!showReplyEditor && !post.isLocked && (
            <button
              onClick={() => setShowReplyEditor(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-float text-text-primary rounded-lg hover:bg-surface-float2 transition-all border border-white/10 hover:border-white/20 mb-6 font-medium text-sm"
            >
              <MessageSquare size={16} />
              <span>Adicionar Resposta</span>
            </button>
          )}

          {/* Reply Editor */}
          {showReplyEditor && (
            <div className="bg-surface-float rounded-lg border border-white/10 p-4 mb-6">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta aqui... (Markdown suportado)"
                className="w-full min-h-[150px] p-4 bg-surface-base rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-theme-active/30 resize-y transition-all border border-white/5"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-text-tertiary">
                  Markdown: **negrito**, *itálico*, `código`
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReplyEditor(false);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-text-tertiary hover:text-text-primary hover:bg-surface-float2 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="px-4 py-2 text-sm font-medium bg-surface-float2 text-text-primary rounded-lg hover:bg-surface-float border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publicar Resposta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Replies List */}
          <div className="space-y-4">
            {replies.map((reply) => (
              <ForumReply
                key={reply.id}
                reply={reply}
                postAuthorId={post.author.id}
                onReply={(replyId) => console.log('Reply to:', replyId)}
                formatDate={formatDate}
              />
            ))}
          </div>

          {/* No Replies */}
          {replies.length === 0 && (
            <div className="text-center py-12 bg-surface-float rounded-xl border border-white/5">
              <MessageSquare size={40} className="mx-auto text-text-tertiary mb-3 opacity-50" />
              <p className="text-text-secondary text-sm">Nenhuma resposta ainda</p>
              <p className="text-text-tertiary text-xs mt-1">
                Seja o primeiro a responder!
              </p>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ForumPostDetailPage;
