import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieName: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerUrl,
  movieName
}) => {
  if (!isOpen) return null;

  // Extract YouTube ID
  let videoId = '';
  if (trailerUrl.includes('v=')) {
    videoId = trailerUrl.split('v=')[1]?.split('&')[0];
  } else if (trailerUrl.includes('youtu.be/')) {
    videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
  }

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#111827] border border-[#2a3449] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3449]">
          <h3 className="text-base font-semibold text-white truncate pr-4">
            Official Trailer: <span className="text-[#d62839]">{movieName}</span>
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Open on YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movieName} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-300 text-sm mb-4">Trailer preview unavailable in player.</p>
              <a
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#d62839] text-white rounded-full text-xs font-semibold hover:bg-[#b52230] transition-colors"
              >
                Watch Trailer on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
