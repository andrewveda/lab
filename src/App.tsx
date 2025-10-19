import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import DirectoryView from './components/DirectoryView';
import VideoGenerator from './components/VideoGenerator';

function App() {
  const [userData, setUserData] = useState<{
    name: string;
    challenges: string[];
    stats: { activity: string; percent: number; emoji: string }[];
  } | null>(null);

  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-[#1B1B2F] text-[#EDEDED] flex flex-col items-center p-4">
      <div className="text-center mb-4">
        <div className="text-xs text-[#C9B037] mb-3">
          English Language Learning Laboratory<br />Virtual Record
        </div>
      </div>

      <DirectoryView onUserDataLoaded={setUserData} />

      {userData && (
        <button
          onClick={() => setShowVideo(true)}
          className="mt-6 px-6 py-3 bg-[#4B3E8C] text-[#FFD700] rounded-lg border border-[#D4AF37] font-bold
                     hover:bg-[#3C2F70] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
        >
          <Sparkles size={18} />
          Share Video Stats
        </button>
      )}

      {showVideo && userData && (
        <VideoGenerator
          userData={userData}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
}

export default App;
