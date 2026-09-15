import React, { useState, useEffect, useCallback } from "react";

const ICONS = ["🪐", "⭐", "🌙", "☄️", "🛰️", "👽", "🚀", "🌌"];

const shuffleDeck = () => {
  const doubled = [...ICONS, ...ICONS];

  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }

  return doubled.map((icon, index) => ({
    id: index,
    icon,
    flipped: false,
    matched: false,
  }));
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const s = (seconds % 60).toString().padStart(2, "0");

  return `${m}:${s}`;
}

function App() {
  const [cards, setCards] = useState(shuffleDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(null);
  const [locked, setLocked] = useState(false);

  const matchedCount = cards.filter((c) => c.matched).length;
  const won = matchedCount === cards.length;

  useEffect(() => {
    if (!running || won) return;

    const t = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(t);
  }, [running, won]);

  useEffect(() => {
    if (won && (best === null || moves < best)) {
      setBest(moves);
    }

    if (won) {
      setRunning(false);
    }
  }, [won]);

  const handleFlip = useCallback(
    (id) => {
      if (locked) return;

      const card = cards.find((c) => c.id === id);

      if (!card || card.flipped || card.matched) return;

      if (!running) {
        setRunning(true);
      }

      const nextSelected = [...selected, id];

      setCards((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, flipped: true } : c
        )
      );

      if (nextSelected.length === 2) {
        setLocked(true);
        setMoves((m) => m + 1);

        const [firstId, secondId] = nextSelected;

        const first = cards.find((c) => c.id === firstId);
        const second = card;

        if (first.icon === second.icon) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, matched: true }
                  : c
              )
            );

            setSelected([]);
            setLocked(false);
          }, 350);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, flipped: false }
                  : c
              )
            );

            setSelected([]);
            setLocked(false);
          }, 750);
        }
      } else {
        setSelected(nextSelected);
      }
    },
    [cards, selected, locked, running]
  );

  const restart = () => {
    setCards(shuffleDeck());
    setSelected([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setLocked(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at 20% 15%, #241a45 0%, #0f0b1e 55%, #0a0715 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily:
          "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&display=swap');

        .nm-title {
          font-family: 'Baloo 2', sans-serif;
        }

        .nm-card-inner {
          transition: transform 0.4s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }

        .nm-card-face {
          backface-visibility: hidden;
        }

        .nm-btn {
          transition: transform 0.15s ease, background 0.2s ease;
        }

        .nm-btn:hover {
          transform: translateY(-2px);
        }

        .nm-btn:active {
          transform: translateY(0px);
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1
            className="nm-title"
            style={{
              color: "#F4C95D",
              fontSize: 34,
              margin: 0,
              letterSpacing: 0.5,
            }}
          >
            Nebula Memory
          </h1>

          <p
            style={{
              color: "#9089B5",
              margin: "6px 0 0",
              fontSize: 14,
            }}
          >
            Flip two cards, find every pair among the stars
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            { label: "Moves", value: moves },
            { label: "Time", value: formatTime(seconds) },
            {
              label: "Best",
              value: best === null ? "—" : best,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#6F6795",
                  fontSize: 11,
                }}
              >
                {stat.label}
              </div>

              <div
                className="nm-title"
                style={{
                  color: "#F2EFEA",
                  fontSize: 20,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {cards.map((card) => {
            const isVisible = card.flipped || card.matched;

            return (
              <div
                key={card.id}
                onClick={() => handleFlip(card.id)}
                style={{
                  aspectRatio: "1 / 1",
                  cursor: card.matched
                    ? "default"
                    : "pointer",
                  perspective: 600,
                }}
              >
                <div
                  className="nm-card-inner"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transform: isVisible
                      ? "rotateY(180deg)"
                      : "rotateY(0deg)",
                  }}
                >
                  <div
                    className="nm-card-face"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      background:
                        "linear-gradient(145deg, #352a5c, #241c42)",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        opacity: 0.5,
                      }}
                    >
                      ✦
                    </span>
                  </div>

                  <div
                    className="nm-card-face"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      background: card.matched
                        ? "linear-gradient(145deg, #1c5a4d, #123a32)"
                        : "linear-gradient(145deg, #3d3269, #2a2350)",
                      border: card.matched
                        ? "1px solid #5FE1C0"
                        : "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: "rotateY(180deg)",
                      fontSize: 26,
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {won && (
          <div
            style={{
              textAlign: "center",
              background: "rgba(95,225,192,0.1)",
              border: "1px solid #5FE1C0",
              borderRadius: 14,
              padding: "14px 10px",
              marginBottom: 16,
              color: "#5FE1C0",
            }}
          >
            <div
              className="nm-title"
              style={{ fontSize: 18 }}
            >
              Cleared in {moves} moves, {formatTime(seconds)}!
            </div>
          </div>
        )}

        <button
          className="nm-btn"
          onClick={restart}
          style={{
            display: "block",
            margin: "0 auto",
            background: "#F4C95D",
            color: "#241c42",
            border: "none",
            borderRadius: 999,
            padding: "10px 28px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {won ? "Play again" : "Restart"}
        </button>
      </div>
    </div>
  );
}

export default App;