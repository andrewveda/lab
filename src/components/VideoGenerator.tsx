import { useEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';

interface VideoGeneratorProps {
  userData: {
    name: string;
    stats: { activity: string; percent: number; emoji: string }[];
  };
  onClose: () => void;
}

export default function VideoGenerator({ userData, onClose }: VideoGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    generateVideo();
  }, []);

  const generateVideo = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 720;
    canvas.height = 1280;

    const fps = 30;
    const duration = 18;
    const totalFrames = fps * duration;

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setIsGenerating(false);
    };

    mediaRecorder.start();

    if (audioRef.current) {
      audioRef.current.play();
    }

    const beatTiming = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
    const beatsPerSecond = 2;

    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / fps;
      const progress = frame / totalFrames;

      const beatPhase = (time * beatsPerSecond) % 1;
      const bounce = Math.abs(Math.sin(beatPhase * Math.PI)) * 20;

      ctx.fillStyle = '#1B1B2F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGradientBackground(ctx, canvas.width, canvas.height, time);

      ctx.save();
      ctx.translate(0, -bounce);

      if (progress < 0.15) {
        drawIntro(ctx, canvas.width, canvas.height, userData.name, progress / 0.15);
      } else if (progress < 0.85) {
        const statsProgress = (progress - 0.15) / 0.7;
        drawStats(ctx, canvas.width, canvas.height, userData.stats, statsProgress, time);
      } else {
        drawOutro(ctx, canvas.width, canvas.height, userData.stats, (progress - 0.85) / 0.15);
      }

      ctx.restore();

      await new Promise(resolve => setTimeout(resolve, 1000 / fps));
    }

    mediaRecorder.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const drawGradientBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    const offset = (time * 50) % 360;
    gradient.addColorStop(0, `hsl(${offset}, 30%, 12%)`);
    gradient.addColorStop(1, `hsl(${offset + 60}, 30%, 18%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  const drawIntro = (ctx: CanvasRenderingContext2D, w: number, h: number, name: string, progress: number) => {
    const scale = Math.min(1, progress * 1.5);
    const alpha = Math.min(1, progress * 2);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 72px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎓', 0, -100);

    ctx.font = 'bold 56px "Playfair Display", serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(name, 0, 20);

    ctx.font = '36px "Merriweather", serif';
    ctx.fillStyle = '#D4AF37';
    ctx.fillText('ELLL Progress Report', 0, 80);

    ctx.restore();
  };

  const drawStats = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    stats: { activity: string; percent: number; emoji: string }[],
    progress: number,
    time: number
  ) => {
    const itemsToShow = Math.min(stats.length, Math.floor(progress * stats.length * 1.2));

    ctx.font = 'bold 48px "Playfair Display", serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('Your Achievements', w / 2, 100);

    const startY = 200;
    const itemHeight = 110;

    for (let i = 0; i < itemsToShow && i < stats.length; i++) {
      const stat = stats[i];
      const itemProgress = Math.min(1, (progress * stats.length - i) * 1.5);
      const y = startY + i * itemHeight;

      const wobble = Math.sin(time * 4 + i) * 5;

      ctx.save();
      ctx.translate(wobble, 0);
      ctx.globalAlpha = itemProgress;

      ctx.fillStyle = 'rgba(43, 43, 68, 0.8)';
      ctx.fillRect(40, y, w - 80, 90);

      ctx.font = '48px serif';
      ctx.textAlign = 'left';
      ctx.fillText(stat.emoji, 60, y + 55);

      ctx.font = 'bold 28px "Merriweather", serif';
      ctx.fillStyle = '#EDEDED';
      ctx.fillText(stat.activity, 130, y + 35);

      const barWidth = (w - 180) * (stat.percent / 100) * itemProgress;
      const gradient = ctx.createLinearGradient(130, 0, 130 + barWidth, 0);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(1, '#FFA500');
      ctx.fillStyle = gradient;
      ctx.fillRect(130, y + 50, barWidth, 25);

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.strokeRect(130, y + 50, w - 180, 25);

      ctx.font = 'bold 24px "Merriweather", serif';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'right';
      ctx.fillText(`${stat.percent}%`, w - 60, y + 70);

      ctx.restore();
    }
  };

  const drawOutro = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    stats: { percent: number }[],
    progress: number
  ) => {
    const scale = 1 + progress * 0.3;
    const alpha = 1 - progress * 0.3;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);

    const completed = stats.filter(s => s.percent === 100).length;
    const total = stats.length;

    ctx.font = 'bold 64px "Playfair Display", serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆', 0, -150);

    ctx.font = 'bold 56px "Playfair Display", serif';
    ctx.fillText(`${completed}/${total}`, 0, -50);

    ctx.font = '40px "Merriweather", serif';
    ctx.fillStyle = '#D4AF37';
    ctx.fillText('Gems Collected!', 0, 20);

    ctx.font = 'italic 32px "Merriweather", serif';
    ctx.fillText('Keep Learning! 📜', 0, 100);

    ctx.restore();
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `elll-stats-${userData.name}.webm`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2B2B44] rounded-xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#FFD700] hover:text-[#D4AF37] transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-[#FFD700] mb-4 text-center font-serif">
          Video Stats Generator
        </h2>

        <canvas
          ref={canvasRef}
          className="w-full aspect-[9/16] bg-[#1B1B2F] rounded-lg mb-4"
        />

        <audio
          ref={audioRef}
          src="https://raw.githubusercontent.com/andrewveda/stats/4fbf88d85eeb781dc5717a5c23f8a39c2911fc71/can.mp3"
          preload="auto"
        />

        {isGenerating && (
          <div className="text-center text-[#D4AF37] mb-4">
            Generating your video... 🎬
          </div>
        )}

        {videoUrl && (
          <div className="flex gap-3">
            <button
              onClick={downloadVideo}
              className="flex-1 px-4 py-3 bg-[#4B3E8C] text-[#FFD700] rounded-lg border border-[#D4AF37]
                         font-bold hover:bg-[#3C2F70] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
