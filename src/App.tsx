import { useMemo, useState } from "react";
import dust2Map from "./assets/dust2-map.jpg";
import mirageMap from "./assets/mirage-map.jpg";
import nukeMap from "./assets/nuke-map.jpg";
import csBrand from "./assets/cs-brand.jpg";

type Side = "T方" | "CT方";
type UtilityType = "烟雾" | "闪光" | "燃烧" | "手雷";

const maps = ["Mirage", "Inferno", "Nuke", "Dust2", "Anubis", "Ancient"];
const mapImages: Record<string, string> = {
  Mirage: mirageMap,
  Nuke: nukeMap,
  Dust2: dust2Map,
};
const mapShapes: Record<string, string[]> = {
  Mirage: [
    "M133 169h257v155h121v170H362v236H126V526h91V362h-84z",
    "M557 111h267v122h90v259H783v235H551V570H432V401h125z",
    "M389 324h170v246H389z",
  ],
  Inferno: [
    "M100 126h266v171h-89v177H135z",
    "M421 91h177v230h121v147H535v188H348V489h73z",
    "M718 268h197v411H782v168H596V679h122z",
  ],
  Nuke: [
    "M169 119h689v184H746v151h119v382H632V708H398v128H172V469h116V303H169z",
    "M347 303h343v323H347z",
    "M447 390h143v145H447z",
  ],
  Dust2: [
    "M116 155h237v168h135v138H335v176H111z",
    "M538 97h309v181h78v241H782v252H536V596H394V455h144z",
    "M267 637h341v212H267z",
  ],
  Anubis: [
    "M111 245h215V105h188v177h131v181H493v168H305v202H107V604h91V423h-87z",
    "M645 184h276v247H806v150h105v240H659V659H529V487h116z",
    "M326 282h319v205H326z",
  ],
  Ancient: [
    "M113 119h322v154h124v174H411v181H264v216H102V542h89V273h-78z",
    "M559 195h351v246H796v153h101v236H634V671H487V447h72z",
    "M335 273h224v174H335z",
  ],
};
const types: Array<"全部" | UtilityType> = ["全部", "烟雾", "闪光", "燃烧", "手雷"];

const utilityTemplates = [
  { suffix: "进攻烟", suffixEn: "Execute Smoke", type: "烟雾" as UtilityType, difficulty: "★★☆", throw: "跳投" },
  { suffix: "瞬爆闪", suffixEn: "Pop Flash", type: "闪光" as UtilityType, difficulty: "★☆☆", throw: "左键投掷" },
  { suffix: "隔断火", suffixEn: "Entry Molotov", type: "燃烧" as UtilityType, difficulty: "★★☆", throw: "跑投" },
  { suffix: "清点雷", suffixEn: "Clear HE", type: "手雷" as UtilityType, difficulty: "★★★", throw: "跳投" },
  { suffix: "封锁烟", suffixEn: "Block Smoke", type: "烟雾" as UtilityType, difficulty: "★★★", throw: "左键投掷" },
  { suffix: "反清闪", suffixEn: "Counter Flash", type: "闪光" as UtilityType, difficulty: "★★☆", throw: "右键投掷" },
];

const steps = [
  { title: "确认站位", titleEn: "Set Position", text: "贴紧木箱右侧，准星保持水平，确保人物完全停止移动。", textEn: "Align with the right side of the crate and come to a complete stop." },
  { title: "寻找瞄点", titleEn: "Find Aim Point", text: "将准星对准屋檐与天线交点，使用准星中心精确定位。", textEn: "Place the center of your crosshair at the roof and antenna intersection." },
  { title: "完成投掷", titleEn: "Execute Throw", text: "按住 W 向前一步，在标记线处完成跳投释放。", textEn: "Hold W, step forward, and release the jump throw at the marked line." },
  { title: "确认落点", titleEn: "Check Landing", text: "烟雾将封住主要视野，持续约 18 秒，可配合队友同步进点。", textEn: "The smoke blocks the main sightline for about 18 seconds." },
];

const throwMethods = [
  {
    name: "标准点位",
    nameEn: "Standard Lineup",
    detail: "稳定 · 推荐",
    detailEn: "Stable · Recommended",
    notes: ["使用默认出生位路线。", "选择固定建筑边缘作为参照。", "无需额外助跑距离。", "适合常规同步进攻。"],
    notesEn: ["Use the default spawn route.", "Use a fixed building edge as reference.", "No extra run-up is required.", "Best for standard team executes."],
  },
  {
    name: "快速跑投",
    nameEn: "Fast Run Throw",
    detail: "快速 · 进阶",
    detailEn: "Fast · Advanced",
    notes: ["向前预留两个身位。", "准星略微向右上修正。", "跑动两步后立即释放。", "更快形成落点效果。"],
    notesEn: ["Leave two steps of space ahead.", "Adjust the crosshair slightly up-right.", "Release after two running steps.", "Creates the effect more quickly."],
  },
  {
    name: "安全变体",
    nameEn: "Safe Variation",
    detail: "低风险 · 战术",
    detailEn: "Low Risk · Tactical",
    notes: ["贴近掩体避免暴露。", "使用更低的墙面瞄点。", "静步后完成原地投掷。", "适合残局与防守回防。"],
    notesEn: ["Stay close to cover.", "Use the lower wall reference.", "Walk, stop, and throw in place.", "Useful for clutches and retakes."],
  },
];

const typeEnglish: Record<string, string> = {
  全部: "All",
  烟雾: "Smoke",
  闪光: "Flash",
  燃烧: "Molotov",
  手雷: "HE",
};

const throwEnglish: Record<string, string> = {
  跳投: "Jump Throw",
  左键投掷: "Left-click Throw",
  右键投掷: "Right-click Throw",
  跑投: "Run Throw",
};

function MapGraphic({ map }: { map: string }) {
  if (mapImages[map]) {
    return <img className="map-radar-image" src={mapImages[map]} alt={`${map} 点位雷达图`} />;
  }

  return (
    <svg viewBox="0 0 1036 1036" role="img" aria-label={`${map} 战术地图`}>
      <defs>
        <pattern id="map-grid" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M42 0H0v42" />
        </pattern>
      </defs>
      <rect className="map-grid" width="1036" height="1036" fill="url(#map-grid)" />
      <g className="map-shapes">
        {mapShapes[map].map((path) => (
          <path d={path} key={path} />
        ))}
      </g>
      <path className="map-route" d="M180 742C277 528 394 662 502 471S711 281 854 411" />
      <circle className="site-marker" cx="196" cy="696" r="38" />
      <circle className="site-marker" cx="827" cy="356" r="38" />
      <text x="177" y="707">B</text>
      <text x="808" y="367">A</text>
    </svg>
  );
}

function TutorialArt({
  index,
  type,
  variant,
  onOpen,
  english = false,
}: {
  index: number;
  type: UtilityType;
  variant: number;
  onOpen?: () => void;
  english?: boolean;
}) {
  return (
    <div
      className={`tutorial-art art-${index} variant-${variant} ${onOpen ? "zoomable" : ""}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) onOpen();
      }}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      <svg viewBox="0 0 640 400" role="img" aria-label={steps[index - 1].title}>
        <defs>
          <linearGradient id={`sky-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f4650" />
            <stop offset="1" stopColor="#171a20" />
          </linearGradient>
          <linearGradient id={`wall-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c7162" />
            <stop offset="1" stopColor="#3e3a35" />
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill={`url(#sky-${index})`} />
        {index === 1 && (
          <>
            <path d="M0 170h242l68 68v162H0z" fill={`url(#wall-${index})`} />
            <path d="M390 102h250v298H344V171z" fill="#5f584f" />
            <rect x="410" y="139" width="113" height="114" fill="#292c31" />
            <path d="M292 400v-92l36-16 37 108" fill="#111318" />
            <circle cx="326" cy="288" r="8" fill="#d5ff45" />
          </>
        )}
        {index === 2 && (
          <>
            <path d="M0 122h640v278H0z" fill={`url(#wall-${index})`} />
            <path d="M0 155l234-33 45 36 361-26v268H0z" fill="#57534d" />
            <path d="M335 30l-7 129m-65-45h136" stroke="#9a9ea5" strokeWidth="5" />
            <path d="M319 145l16-16 16 16-16 16z" fill="#d5ff45" />
            <path d="M290 400l35-100 43 100" fill="#17191d" />
          </>
        )}
        {index === 3 && (
          <>
            <path d="M0 240L170 103l137 84L432 77l208 155v168H0z" fill="#2b2e34" />
            <path d="M190 326c72-190 182-206 305-105" fill="none" stroke="#d5ff45" strokeWidth="6" strokeDasharray="10 13" />
            <circle cx="495" cy="221" r="11" fill="#d5ff45" />
            <circle cx="186" cy="329" r="17" fill="#8a8f98" />
            <path d="M0 337h640" stroke="#444850" strokeWidth="2" />
          </>
        )}
        {index === 4 && (
          <>
            <path d="M0 195h158v-72h177v84h305v193H0z" fill="#4c4945" />
            <path d="M382 400v-90h125v90M228 400V274h104v126" fill="#26292e" />
            <circle cx="417" cy="239" r="83" fill="#aeb3b8" opacity=".28" />
            <circle cx="417" cy="239" r="61" fill="#c8ccd0" opacity=".28" />
            <circle cx="417" cy="239" r="40" fill="#e6e8e9" opacity=".32" />
            <text x="385" y="246" fill="#111318" fontSize="20" fontWeight="800">{type}</text>
          </>
        )}
      </svg>
      <span className="frame-index">
        {english ? ["POSITION", "AIM", "TRAJECTORY", "EFFECT"][index - 1] : ["站位", "瞄点", "轨迹", "效果"][index - 1]}
      </span>
    </div>
  );
}

export default function App() {
  const [selectedMap, setSelectedMap] = useState("Mirage");
  const [selectedPoint, setSelectedPoint] = useState("A点");
  const [mapOpen, setMapOpen] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [side, setSide] = useState<Side>("T方");
  const [typeFilter, setTypeFilter] = useState<"全部" | UtilityType>("全部");
  const [selectedUtility, setSelectedUtility] = useState(0);
  const [throwMethodIndex, setThrowMethodIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<"map" | number | null>(null);
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const english = language === "en";

  const utilities = useMemo(
    () =>
      utilityTemplates
        .map((item, index) => ({
          ...item,
          id: index,
          name: `${selectedPoint}${side === "CT方" ? "防守" : ""}${item.suffix}`,
        }))
        .filter((item) => typeFilter === "全部" || item.type === typeFilter),
    [selectedPoint, side, typeFilter],
  );

  const activeUtility = utilities.find((item) => item.id === selectedUtility) ?? utilities[0];

  const refreshSelection = () => {
    setSelectedUtility(0);
    setThrowMethodIndex(0);
  };

  const changeThrowMethod = (direction: number) => {
    setThrowMethodIndex((current) => (current + direction + throwMethods.length) % throwMethods.length);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <img src={csBrand} alt="Counter-Strike" />
          </div>
          <div>
            <strong>UTILITY LAB</strong>
            <span>{english ? "CS2 TACTICAL UTILITY DATABASE" : "CS2 战术道具数据库"}</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="language-toggle" onClick={() => setLanguage(english ? "zh" : "en")} type="button">
            {english ? "中文" : "EN"}
          </button>
          <div className="status">
            <span className="status-dot" />
            PATCH 1.40.8.4
          </div>
        </div>
      </header>

      <section className="map-toolbar">
        <div className="map-pills" aria-label="地图选择">
          {maps.map((map) => (
            <button
              className={`pill ${selectedMap === map ? "active" : ""}`}
              key={map}
              onClick={() => {
                setSelectedMap(map);
                setSelectedPoint("A点");
                setMapOpen(true);
                refreshSelection();
              }}
              type="button"
            >
              {map}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          {selectedMap && (
            <button className="button secondary bright" onClick={() => setMapOpen((open) => !open)} type="button">
              {mapOpen ? (english ? "COLLAPSE MAP  ▴" : "收起地图  ▴") : (english ? "EXPAND MAP  ▾" : "展开地图  ▾")}
            </button>
          )}
        </div>
      </section>

      <div className={`workspace ${listOpen ? "" : "list-collapsed"}`}>
        <div className="content-column">
          {mapOpen && (
            <div className="map-stage">
              <div
                className={`map-preview map-${selectedMap.toLowerCase()} zoomable`}
                aria-label={`${selectedMap} 地图图片，点击放大`}
                onClick={() => setLightboxImage("map")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setLightboxImage("map");
                }}
                role="button"
                tabIndex={0}
              >
                <MapGraphic map={selectedMap} />
                <div className="map-preview-copy">
                  <strong>{selectedMap.toUpperCase()}</strong>
                </div>
              </div>
            </div>
          )}

          <section className="tutorial">
            <div className="tutorial-head">
              <div>
                <div className="breadcrumb">
                  {selectedMap.toUpperCase()} <span>/</span> {selectedPoint} <span>/</span> {activeUtility?.type}
                </div>
                <h1>{english ? `A Site ${activeUtility?.suffixEn ?? "Utility"}` : (activeUtility?.name ?? `${selectedPoint}道具`)}</h1>
              </div>
              <span className="lesson-number">LESSON / {String((activeUtility?.id ?? 0) + 1).padStart(2, "0")}</span>
            </div>

            <div className="image-grid" key={`${activeUtility?.id}-${throwMethodIndex}`}>
              {[1, 2, 3, 4].map((index) => (
                <TutorialArt
                  index={index}
                  key={index}
                  type={activeUtility?.type ?? "烟雾"}
                  variant={throwMethodIndex}
                  onOpen={() => setLightboxImage(index)}
                  english={english}
                />
              ))}
            </div>

            <div className="throw-method-bar">
              <div className="throw-method-copy">
                <span>{english ? "THROW METHOD" : "投掷方案"} {String(throwMethodIndex + 1).padStart(2, "0")} / {String(throwMethods.length).padStart(2, "0")}</span>
                <strong>{english ? throwMethods[throwMethodIndex].nameEn : throwMethods[throwMethodIndex].name}</strong>
              </div>
              <div className="throw-method-controls">
                <div className="method-progress" aria-hidden="true">
                  {throwMethods.map((method, index) => (
                    <span className={index === throwMethodIndex ? "active" : ""} key={method.name} />
                  ))}
                </div>
                <button onClick={() => changeThrowMethod(-1)} type="button" aria-label="上一个投掷方案">←</button>
                <button onClick={() => changeThrowMethod(1)} type="button" aria-label="下一个投掷方案">→</button>
              </div>
            </div>

            <div className="instructions">
              {steps.map((step, index) => (
                <article className="instruction" key={step.title}>
                  <span className="instruction-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{english ? step.titleEn : step.title}</strong>
                    <p>{english ? step.textEn : step.text} {english ? throwMethods[throwMethodIndex].notesEn[index] : throwMethods[throwMethodIndex].notes[index]}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {!listOpen && (
          <button
            className="icon-button list-toggle closed"
            onClick={() => setListOpen(true)}
            type="button"
            aria-label="展开道具列表"
          >
            ‹
          </button>
        )}

        {listOpen && (
          <aside className="utility-panel">
            <button
              className="icon-button list-toggle open"
              onClick={() => setListOpen(false)}
              type="button"
              aria-label="收起道具列表"
            >
              ›
            </button>
            <div className="panel-head">
              <div>
                <span className="eyebrow">UTILITY INDEX</span>
                <h2>{english ? "Utility List" : "道具列表"}</h2>
              </div>
            </div>

            <div className="segment" aria-label="阵营选择">
              {(["T方", "CT方"] as Side[]).map((item) => (
                <button
                  className={side === item ? "active" : ""}
                  key={item}
                  onClick={() => {
                    setSide(item);
                    refreshSelection();
                  }}
                  type="button"
                >
                  {english ? (item === "T方" ? "T SIDE" : "CT SIDE") : item}
                </button>
              ))}
            </div>

            <div className="type-tabs" aria-label="道具类型">
              {types.map((type) => (
                <button
                  className={typeFilter === type ? "active" : ""}
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    refreshSelection();
                  }}
                  type="button"
                >
                  {english ? typeEnglish[type] : type}
                </button>
              ))}
            </div>

            <div className="list-summary">
              <span>{english ? `${utilities.length} UTILITIES` : `${utilities.length} 个道具`}</span>
              <span>{english ? "A SITE" : `${selectedPoint}区域`}</span>
            </div>

            <div className="utility-list">
              {utilities.map((utility) => (
                <button
                  className={`utility-card ${activeUtility?.id === utility.id ? "active" : ""}`}
                  key={utility.id}
                  onClick={() => {
                    setSelectedUtility(utility.id);
                    setThrowMethodIndex(0);
                  }}
                  type="button"
                >
                  <span className={`utility-icon type-${utility.type}`}>{utility.type.slice(0, 1)}</span>
                  <span className="card-copy">
                    <strong>{english ? `A Site ${utility.suffixEn}` : utility.name}</strong>
                    <span>
                      {english ? typeEnglish[utility.type] : utility.type} · {english ? throwEnglish[utility.throw] : utility.throw}
                    </span>
                  </span>
                  <span className="card-difficulty">{utility.difficulty}</span>
                </button>
              ))}
              {utilities.length === 0 && <p className="empty">该条件下暂无道具</p>}
            </div>
          </aside>
        )}
      </div>

      {lightboxImage !== null && (
        <div className="lightbox" onClick={() => setLightboxImage(null)} role="presentation">
          <div className={`lightbox-content ${lightboxImage === "map" ? "map" : "tutorial-image"}`} onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)} type="button">
              {english ? "CLOSE" : "关闭"}
            </button>
            {lightboxImage === "map" ? (
              <div className={`map-preview map-${selectedMap.toLowerCase()}`}>
                <MapGraphic map={selectedMap} />
                <div className="map-preview-copy">
                  <span>{english ? "ACTIVE MAP / 01" : "当前地图 / 01"}</span>
                  <strong>{selectedMap.toUpperCase()}</strong>
                  <small>1036 × 1036 · {english ? "TACTICAL OVERVIEW" : "战术俯视图"}</small>
                </div>
              </div>
            ) : (
              <TutorialArt index={lightboxImage} type={activeUtility?.type ?? "烟雾"} variant={throwMethodIndex} english={english} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
