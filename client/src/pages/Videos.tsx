import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Play, X, Filter } from "lucide-react";
import Header from "@/components/Header";

const categories = [
  { value: "all", label: "Alle Videos" },
  { value: "about_us", label: "Über uns" },
  { value: "properties", label: "Immobilien" },
  { value: "georgia", label: "Georgien" },
  { value: "testimonials", label: "Kundenstimmen" },
  { value: "projects", label: "Projekte" },
  { value: "other", label: "Sonstiges" },
];

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const { data: videos, isLoading } = trpc.videos.list.useQuery({
    published: true,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Extract Vimeo video ID from URL
  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  // Get thumbnail URL
  const getThumbnail = (video: any) => {
    if (video.thumbnailUrl) return video.thumbnailUrl;
    const youtubeId = getYouTubeId(video.videoUrl);
    if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    return null;
  };

  // Get embed URL for video player
  const getEmbedUrl = (url: string) => {
    const youtubeId = getYouTubeId(url);
    if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
    
    const vimeoId = getVimeoId(url);
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    
    return url;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Video-<span className="text-[#C4A052]">Galerie</span>
            </h1>
            <p className="text-lg text-gray-300">
              Entdecken Sie unsere Videos über Immobilieninvestments in Georgien, 
              Projektvorstellungen und Einblicke in den georgischen Immobilienmarkt.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? "bg-[#C4A052] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C4A052] mx-auto mb-4"></div>
              <p className="text-gray-600">Videos werden geladen...</p>
            </div>
          ) : !videos || videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Noch keine Videos verfügbar
              </h3>
              <p className="text-gray-600">
                Bald finden Sie hier interessante Videos zu unseren Projekten.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video: any) => {
                const thumbnail = getThumbnail(video);
                return (
                  <div
                    key={video.id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative aspect-video bg-gray-100">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <Play className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#C4A052] rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                          <Play className="h-8 w-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                        {categories.find(c => c.value === video.category)?.label || video.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-[#C4A052] transition-colors">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal/Lightbox */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-[#C4A052] transition-colors"
            onClick={() => setSelectedVideo(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <div
            className="w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={getEmbedUrl(selectedVideo.videoUrl)}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h3 className="text-white text-xl font-semibold">{selectedVideo.title}</h3>
            {selectedVideo.description && (
              <p className="text-gray-400 mt-2 max-w-2xl mx-auto">{selectedVideo.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
