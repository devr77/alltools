"use client";
import { useState } from "react";

type Animal = {
  Animal: string;
  Diet: string;
  Habitat: string;
  Lifespan: string;
  Weight: string;
  ImageURL: string;
};

type Props = {
  animals: Animal[];
};

const infoOptions = [
  { key: "Diet", label: "Diet" },
  { key: "Habitat", label: "Habitat" },
  { key: "Lifespan", label: "Lifespan" },
  { key: "Weight", label: "Weight" },
  // { key: "ImageURL", label: "Image" },
];

function getRandomAnimals(arr: Animal[], count: number) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #4f8cff 0%, #2355e6 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 28px",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(79,140,255,0.08)",
  transition: "background 0.2s, box-shadow 0.2s",
};

const copyBtnStyle: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#222",
  border: "1px solid #e0e7ef",
  borderRadius: 6,
  padding: "6px 16px",
  fontSize: 14,
  cursor: "pointer",
  marginLeft: 8,
  marginTop: 8,
  transition: "background 0.2s, border 0.2s",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  marginBottom: 20,
  padding: 20,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  display: "flex",
  alignItems: "flex-start",
  gap: 20,
  position: "relative",
};

const infoListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 0,
  listStyle: "none",
  fontSize: 15,
};

const imgStyle: React.CSSProperties = {
  maxWidth: 120,
  maxHeight: 90,
  borderRadius: 8,
  objectFit: "cover",
  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
};

const RandomAnimalGen = ({ animals }: Props) => {
  const [num, setNum] = useState(1);
  const [selectedInfo, setSelectedInfo] = useState<{ [key: string]: boolean }>({
    Diet: true,
    Habitat: true,
    Lifespan: true,
    Weight: false,
    ImageURL: false,
  });
  const [results, setResults] = useState<Animal[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleToggle = (key: string) => {
    setSelectedInfo((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > animals.length) val = animals.length;
    setNum(val);
  };

  const handleGenerate = () => {
    setResults(getRandomAnimals(animals, num));
    setCopiedIdx(null);
  };

  const handleCopy = (animal: Animal, idx: number) => {
    let info = `Animal: ${animal.Animal}`;
    infoOptions.forEach((opt) => {
      if (selectedInfo[opt.key] && opt.key !== "ImageURL") {
        info += `\n${opt.label}: ${animal[opt.key as keyof Animal]}`;
      }
    });
    if (selectedInfo.ImageURL) {
      info += `\nImage: ${animal.ImageURL}`;
    }
    navigator.clipboard.writeText(info);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "0 auto",
        padding: 32,
        background: "#f8fafc",
        borderRadius: 16,
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 28,
          marginBottom: 24,
          letterSpacing: -1,
        }}
      >
        Random Animal Generator
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <label style={{ fontWeight: 500 }}>
          Number of animals:
          <input
            type="number"
            min={1}
            max={animals.length}
            value={num}
            onChange={handleNumChange}
            style={{
              width: 70,
              marginLeft: 10,
              padding: 6,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: 15,
            }}
          />
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 500, marginRight: 6 }}>Show info:</span>
          {infoOptions.map((opt) => (
            <label
              key={opt.key}
              style={{
                marginLeft: 0,
                fontSize: 15,
                fontWeight: 400,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <input
                type="checkbox"
                checked={selectedInfo[opt.key]}
                onChange={() => handleToggle(opt.key)}
                style={{ accentColor: "#4f8cff" }}
              />
              {opt.label}
            </label>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          style={{ ...buttonStyle, marginLeft: 10, marginTop: 8 }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 4v16m8-8H4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Generate
          </span>
        </button>
      </div>
      <div style={{ marginTop: 24 }}>
        {results.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {results.map((animal, idx) => (
              <li key={animal.Animal + idx} style={cardStyle}>
                {selectedInfo.ImageURL && (
                  <img
                    src={animal.ImageURL}
                    alt={animal.Animal}
                    style={imgStyle}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: 20,
                      color: "#2355e6",
                    }}
                  >
                    {animal.Animal}
                  </h3>
                  <ul style={infoListStyle}>
                    {infoOptions.map(
                      (opt) =>
                        selectedInfo[opt.key] &&
                        opt.key !== "ImageURL" && (
                          <li key={opt.key} style={{ marginBottom: 2 }}>
                            <b style={{ color: "#4f8cff" }}>{opt.label}:</b>{" "}
                            {animal[opt.key as keyof Animal]}
                          </li>
                        ),
                    )}
                  </ul>
                  <button
                    style={copyBtnStyle}
                    onClick={() => handleCopy(animal, idx)}
                    aria-label="Copy animal info"
                  >
                    {copiedIdx === idx ? "Copied!" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const AnimalTable = ({ animals }: { animals: Animal[] }) => (
  <div style={{ marginTop: 40 }}>
    <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>
      All Animals
    </h3>
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          background: "#fff",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #e5e7eb",
                padding: 8,
                background: "#f3f4f6",
              }}
            >
              Animal
            </th>
            <th
              style={{
                border: "1px solid #e5e7eb",
                padding: 8,
                background: "#f3f4f6",
              }}
            >
              Diet
            </th>
            <th
              style={{
                border: "1px solid #e5e7eb",
                padding: 8,
                background: "#f3f4f6",
              }}
            >
              Habitat
            </th>
            <th
              style={{
                border: "1px solid #e5e7eb",
                padding: 8,
                background: "#f3f4f6",
              }}
            >
              Lifespan
            </th>
            <th
              style={{
                border: "1px solid #e5e7eb",
                padding: 8,
                background: "#f3f4f6",
              }}
            >
              Weight
            </th>
          </tr>
        </thead>
        <tbody>
          {animals.map((a, i) => (
            <tr key={a.Animal + i}>
              <td
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 8,
                }}
              >
                {a.Animal}
              </td>
              <td
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 8,
                }}
              >
                {a.Diet}
              </td>
              <td
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 8,
                }}
              >
                {a.Habitat}
              </td>
              <td
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 8,
                }}
              >
                {a.Lifespan}
              </td>
              <td
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 8,
                }}
              >
                {a.Weight}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function RandomAnimalGenWithTable(props: Props) {
  return (
    <>
      <RandomAnimalGen {...props} />
      <AnimalTable animals={props.animals} />
    </>
  );
}
