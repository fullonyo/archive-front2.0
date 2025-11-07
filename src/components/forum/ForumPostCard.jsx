import { MessageSquare, ThumbsUp, Eye, Clock, TrendingUp, Pin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ForumPostCard = ({ post }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [upvoted, setUpvoted] = useState(post.isUpvoted || false);
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (upvoted) {
      setUpvotes(upvotes - 1);
    } else {
      setUpvotes(upvotes + 1);
    }
    setUpvoted(!upvoted);
  };

  const handleCardClick = () => {
    // Salvar a categoria atual antes de navegar
    if (location.pathname.startsWith('/forum/')) {
      sessionStorage.setItem('forumCategory', location.pathname);
    }
    navigate(`/forum/post/${post.id}`);
  };

  const getTagColor = (tag) => {
    const colors = {
      'Avatar': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'World': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Shader': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Help': 'bg-red-500/10 text-red-400 border-red-500/20',
      'Question': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'Solved': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Discussion': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };
    return colors[tag] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <article 
      className="group bg-surface-float border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all duration-300 cursor-pointer hover:shadow-card-hover"
      onClick={handleCardClick}
    >
      {/* Header - Author Info */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {post.author.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-10 h-10 rounded-full ring-2 ring-surface-float2"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Author Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-text-primary hover:text-theme-active transition-colors">
              {post.author.name}
            </span>
            
            {/* Badges */}
            {post.author.badges?.map((badge, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 bg-theme-active/10 text-theme-active text-xs rounded-full border border-theme-active/20"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary mt-0.5">
            <Clock size={12} />
            <span>{post.createdAt}</span>
            
            {/* Status Badges */}
            {post.isHot && (
              <span className="flex items-center gap-1 text-orange-400">
                <TrendingUp size={12} />
                Hot
              </span>
            )}
            {post.isPinned && (
              <span className="flex items-center gap-1 text-purple-400">
                <Pin size={12} />
                Pinned
              </span>
            )}
            {post.isSolved && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle size={12} />
                Solved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-theme-active transition-colors">
        {post.title}
      </h3>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getTagColor(tag)}`}
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Filter by tag
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer - Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-4 text-sm">
          {/* Upvotes */}
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 transition-colors ${
              upvoted 
                ? 'text-theme-active' 
                : 'text-text-tertiary hover:text-theme-active'
            }`}
          >
            <ThumbsUp 
              size={16} 
              fill={upvoted ? 'currentColor' : 'none'}
            />
            <span className="font-medium">{upvotes}</span>
          </button>

          {/* Replies */}
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <MessageSquare size={16} />
            <span>{post.replies || 0}</span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <Eye size={16} />
            <span>{post.views || 0}</span>
          </div>
        </div>

        {/* Last Activity */}
        {post.lastActivity && (
          <div className="text-xs text-text-tertiary hidden sm:block">
            Last activity: {post.lastActivity}
          </div>
        )}
      </div>
    </article>
  );
};

export default ForumPostCard;
