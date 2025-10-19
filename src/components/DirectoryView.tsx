import { useState } from 'react';

const ACTIVITY_NAMES = [
  "SWOC", "Phonics", "Listening", "Something Close to My Heart",
  "Song Decode", "Headline Hunt", "Creative Rendezvous", "Letter", "Self Reflection"
];

const EMOJIS_INCOMPLETE = ["🗝️", "📚", "🎧", "💖", "🎼", "📰", "🎨", "✉️", "🪞"];
const EMOJIS_COMPLETE = ["🏆", "📖", "🎶", "💎", "🎹", "🏅", "🌟", "🏵️", "🔮"];

const ELLL_LINKS: Record<number, string> = {
  1: "https://sites.google.com/view/cys-english/copy-of-swoc",
  2: "https://andrewveda.github.io/voicequests/",
  3: "https://andrewveda.github.io/3/",
  4: "https://sites.google.com/view/cys-english/sctmh",
  5: "https://sites.google.com/view/cys-english/video-quests",
  6: "https://andrewveda.github.io/6/",
  7: "https://andrewveda.github.io/play/",
  8: "https://andrewveda.github.io/letter/",
  9: "https://andrewveda.github.io/10/"
};

const SHEET_URL = "https://script.google.com/macros/s/AKfycbzPmoVR2sfZFgrh7YGxag018JF3HtIkDq3AG65Tt_psWgWLGvbERINZw7lP9wuupbVd/exec";

interface DirectoryViewProps {
  onUserDataLoaded: (data: {
    name: string;
    challenges: string[];
    stats: { activity: string; percent: number; emoji: string }[];
  }) => void;
}

export default function DirectoryView({ onUserDataLoaded }: DirectoryViewProps) {
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [records, setRecords] = useState<Array<{
    activity: string;
    percent: number;
    emoji: string;
    link: string;
  }>>([]);
  const [gemsCollected, setGemsCollected] = useState(0);
  const [showInput, setShowInput] = useState(true);

  const fetchDirectory = async () => {
    const name = nameInput.trim();
    if (!name) {
      alert("Please enter your name!");
      return;
    }

    setShowInput(false);
    setLoading(true);

    try {
      const res = await fetch(SHEET_URL);
      const data = await res.json();
      const user = data.find((u: any) => u.Name.toUpperCase() === name.toUpperCase());

      const displayName = user ? user.Name : name;
      setUserName(displayName.toUpperCase());

      const completed = user?.Challenges
        ? (Array.isArray(user.Challenges) ? user.Challenges : user.Challenges.split(","))
        : [];

      const recordsData = [];
      let doneCount = 0;

      for (let i = 0; i < 9; i++) {
        const title = `ELLL ${i + 1}`;
        let requiredChallenges = 1;
        if (i + 1 === 2) requiredChallenges = 120;
        if (i + 1 === 5) requiredChallenges = 12;

        const challengesDone = completed.filter((c: string) =>
          c.trim().toUpperCase().startsWith(title.toUpperCase())
        ).length;

        const percent = Math.min(Math.round((challengesDone / requiredChallenges) * 100), 100);
        const emoji = percent === 100 ? EMOJIS_COMPLETE[i] : EMOJIS_INCOMPLETE[i];

        if (percent === 100) doneCount++;

        recordsData.push({
          activity: ACTIVITY_NAMES[i],
          percent,
          emoji,
          link: ELLL_LINKS[i + 1]
        });
      }

      setRecords(recordsData);
      setGemsCollected(doneCount);

      onUserDataLoaded({
        name: displayName,
        challenges: completed,
        stats: recordsData
      });

    } catch (err) {
      console.error(err);
      alert("Error fetching data!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {showInput && (
        <div className="flex flex-col items-center mb-4">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchDirectory()}
            placeholder="Enter Your Name"
            className="w-48 px-3 py-2 rounded-md border border-[#D4AF37] bg-[#2B2B44] text-[#EDEDED]
                       focus:outline-none focus:border-[#FFD700] transition-colors mb-2 font-serif"
          />
          <button
            onClick={fetchDirectory}
            className="px-6 py-2 bg-[#4B3E8C] text-[#FFD700] rounded-md border border-[#D4AF37]
                       font-bold hover:bg-[#3C2F70] hover:-translate-y-0.5 transition-all duration-300"
          >
            Show Records
          </button>
        </div>
      )}

      {loading && (
        <div className="text-xs italic text-center mb-4">
          Fetching your ELLL progress... Please wait 📜🎓
        </div>
      )}

      {userName && (
        <>
          <div className="text-center font-bold text-[#FFD700] mb-1 text-base">{userName}</div>
          <div className="text-center text-[#D4AF37] text-sm mb-4">
            Gems: {gemsCollected}/9 collected {gemsCollected === 9 ? "📜" : ""}
          </div>
        </>
      )}

      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3 w-full">
          {records.map((record, index) => {
            const opacity = 0.5 + (record.percent / 100) * 0.5;
            return (
              <div
                key={index}
                onClick={() => window.open(record.link, '_blank')}
                className="relative bg-[#2B2B44] rounded-xl p-4 flex flex-col items-center cursor-pointer
                           hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D4AF37]/40 transition-all duration-200 overflow-hidden"
                style={{
                  opacity,
                  background: `linear-gradient(to top, rgba(255,215,0,0.5) ${record.percent}%, #2B2B44 ${record.percent}%)`
                }}
              >
                <div className="text-2xl">{record.emoji}</div>
                <div className="text-xs font-bold mt-2 text-center break-words">{record.activity}</div>
                <div className="text-[10px] mt-1.5 text-[#FFD700]">{record.percent}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
