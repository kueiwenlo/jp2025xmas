import React, { useState, useEffect } from "react";
import {
  Plane,
  MapPin,
  Calendar,
  Utensils,
  Hotel,
  Ticket,
  Heart,
  Train,
  Car,
  Bus,
  QrCode,
  X,
  Coffee,
  Mountain,
  Camera,
  ChevronDown,
  ChevronUp,
  Cloud,
  Sun,
  CloudRain,
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";

// --- Firebase 設定區 ---
const appId = typeof __app_id !== "undefined" ? __app_id : "tokyo-vibe-app";
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "AIzaSyDPrMQm70daYFY8axfvJjHfH43mf09P3p8",
        authDomain: "projectid01-c5aff.firebaseapp.com",
        projectId: "projectid01-c5aff",
        storageBucket: "projectid01-c5aff.firebasestorage.app",
        messagingSenderId: "967926408832",
        appId: "1:967926408832:web:a2e806b578bfbf04112865",
        measurementId: "G-BCSSJ7FJB4",
      };

const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

// --- Firebase 初始化 ---
let db = null;
let auth = null;
let app = null;
let firebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  firebaseInitialized = true;
} catch (e) {
  console.error("Firebase 初始化失敗:", e);
}

// --- 天氣資料 ---
const weatherData = [
  {
    date: "12/3 (三)",
    temp: "13°C / 6°C",
    weather: "晴時多雲",
    icon: <Sun className="w-6 h-6 text-orange-400" />,
    note: "東京乾燥，注意保濕",
  },
  {
    date: "12/4 (四)",
    temp: "11°C / 2°C",
    weather: "晴朗",
    icon: <Sun className="w-6 h-6 text-orange-400" />,
    note: "富士山區氣溫較低，需穿厚外套",
  },
  {
    date: "12/5 (五)",
    temp: "10°C / 1°C",
    weather: "多雲",
    icon: <Cloud className="w-6 h-6 text-gray-400" />,
    note: "河口湖早晚溫差大",
  },
  {
    date: "12/6 (六)",
    temp: "11°C / 4°C",
    weather: "晴時多雲",
    icon: <Sun className="w-6 h-6 text-orange-400" />,
    note: "適合戶外活動",
  },
  {
    date: "12/7 (日)",
    temp: "12°C / 5°C",
    weather: "多雲",
    icon: <Cloud className="w-6 h-6 text-gray-400" />,
    note: "舒適涼爽",
  },
  {
    date: "12/8 (一)",
    temp: "13°C / 7°C",
    weather: "短暫雨",
    icon: <CloudRain className="w-6 h-6 text-blue-400" />,
    note: "建議攜帶摺疊傘",
  },
  {
    date: "12/9 (二)",
    temp: "14°C / 8°C",
    weather: "晴朗",
    icon: <Sun className="w-6 h-6 text-orange-400" />,
    note: "回暖",
  },
];

// --- 行程資料 ---
const itineraryData = [
  {
    day: "Day 1",
    date: "12/3 (三)",
    title: "出發東京 & 澀谷之夜",
    icon: <Plane className="w-5 h-5" />,
    details: [
      {
        time: "11:00",
        event: "家中接駁",
        note: "肯驛國際",
        desc: "專車接送前往機場，開啟美好旅程。",
        mapUrl: "https://maps.google.com",
      },
      {
        time: "12:00",
        event: "寰宇禮遇通關",
        note: "抵達機場",
        desc: "享受快速通關服務，免去排隊煩惱。",
        mapUrl: "https://maps.app.goo.gl/TaoyuanAirport",
      },
      {
        time: "13:55",
        event: "TR874 起飛",
        note: "往東京 NRT",
        desc: "搭乘酷航前往成田機場，飛行時間約 3.5 小時。",
        mapUrl: "https://maps.app.goo.gl/TaoyuanAirport",
      },
      {
        time: "17:55",
        event: "抵達東京成田",
        note: "入境手續",
        desc: "抵達日本，辦理入境與領取行李。",
        mapUrl: "https://maps.app.goo.gl/NaritaAirport",
      },
      {
        time: "18:45",
        event: "NEX 46 發車",
        note: "Car 7, Seat: 4C, 4D",
        desc: "成田特快直達澀谷，舒適便捷。",
        mapUrl: "https://maps.app.goo.gl/NaritaStation",
      },
      {
        time: "20:08",
        event: "抵達澀谷",
        note: "前往飯店",
        desc: "東京潮流中心，著名的十字路口所在地。",
        mapUrl: "https://maps.app.goo.gl/ShibuyaStation",
      },
      {
        time: "Check-in",
        event: "the onefive Tokyo Shibuya",
        note: "飯店入住",
        desc: "位於澀谷中心，設計時尚，交通極其便利。",
        mapUrl: "https://maps.app.goo.gl/Shibuya",
      },
      {
        time: "20:40",
        event: "CBD SHOP -YANAGI-",
        note: "澀谷本店",
        desc: "合法 CBD 專賣店，提供放鬆身心的相關產品體驗。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=CBD+SHOP+YANAGI+Shibuya",
      },
      {
        time: "21:30",
        event: "Itameshi Sakaba Grazie",
        note: "澀谷中心街店",
        desc: "結合義式料理與日式居酒屋風格，氛圍熱鬧，適合小酌。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=New+Itameshi+Sakaba+Grazie+Shibuya",
      },
    ],
  },
  {
    day: "Day 2",
    date: "12/4 (四)",
    title: "前進富士山 & 自駕開始",
    icon: <Car className="w-5 h-5" />,
    details: [
      {
        time: "10:00",
        event: "かつお食堂",
        note: "柴魚片飯專門店",
        desc: "現削柴魚片搭配熱飯，極致簡單的鮮美滋味，人氣排隊早餐。",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Katsuo+Shokudo",
      },
      {
        time: "13:30",
        event: "高速巴士出發",
        note: "Mark City 5F",
        desc: "前往河口湖的直達巴士，沿途欣賞風景。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Shibuya+Mark+City+Bus+Terminal",
      },
      {
        time: "15:37",
        event: "抵達河口湖",
        note: "轉乘火車",
        desc: "富士山腳下的美麗湖泊，轉乘富士急行線至富士山站。",
        mapUrl: "https://maps.app.goo.gl/KawaguchikoStation",
      },
      {
        time: "16:00",
        event: "ORIX 租車取車",
        note: "富士山站前店",
        desc: "預約單號 #684258558，開始自駕之旅。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=ORIX+Rent+a+Car+Fujisan+Station",
      },
      {
        time: "17:00",
        event: "富士吉田本町通り",
        note: "商店街攝影",
        desc: "昭和風情商店街，背景就是巨大的富士山，絕佳打卡點。",
        mapUrl: "https://maps.app.goo.gl/HonchoStreet",
      },
      {
        time: "Night",
        event: "Hotel Mt. Fuji",
        note: "富士山大飯店",
        desc: "位於山腰的經典飯店，擁有絕佳的富士山與山中湖景觀。",
        mapUrl: "https://maps.app.goo.gl/MtFujiHotel",
      },
    ],
  },
  {
    day: "Day 3",
    date: "12/5 (五)",
    title: "忍野八海 & 環湖絕景",
    icon: <Mountain className="w-5 h-5" />,
    details: [
      {
        time: "Morning",
        event: "忍野八海",
        note: "榮徳駐車場",
        desc: "富士山融雪形成的八個清泉，水質清澈見底，列入世界遺產。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=榮徳駐車場+Oshino",
      },
      {
        time: "Lunch",
        event: "らぁ麺 八葉",
        note: "拉麵午餐",
        desc: "當地好評拉麵，湯頭鮮美，麵條勁道。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=らぁ麺+八葉",
      },
      {
        time: "14:00",
        event: "富士見橋 觀景台",
        note: "絕佳拍攝點",
        desc: "能同時拍到富士山與電車經過的知名攝影點。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Fujimi+Bridge+Observatory",
      },
      {
        time: "15:30",
        event: "河口湖楓葉迴廊",
        note: "Momiji Corridor",
        desc: "著名的紅葉景點，雖然12月可能已過盛期，但景色依然優美。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Momiji+Corridor+Kawaguchiko",
      },
      {
        time: "16:30",
        event: "Tatego-Hama Beach",
        note: "夕陽湖景",
        desc: "夕陽西下時，富士山倒映在湖面上的絕景。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Tatego-Hama+Beach",
      },
      {
        time: "Night",
        event: "Motosu Phoenix Hotel",
        note: "本栖鳳凰酒店",
        desc: "位於本栖湖畔，環境清幽，適合放鬆身心。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Motosu+Phoenix+Hotel",
      },
    ],
  },
  {
    day: "Day 4",
    date: "12/6 (六)",
    title: "音樂森林 & 返回新宿",
    icon: <Train className="w-5 h-5" />,
    details: [
      {
        time: "Morning",
        event: "音樂森林美術館",
        note: "河口湖",
        desc: "彷彿置身歐洲的庭園，收藏珍貴的自動演奏樂器。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Kawaguchiko+Music+Forest+Museum",
      },
      {
        time: "14:00",
        event: "還車: ORIX",
        note: "富士山站前",
        desc: "歸還車輛，記得加滿油並檢查隨身物品。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=ORIX+Rent+a+Car+Fujisan+Station",
      },
      {
        time: "15:00",
        event: "Fuji Excursion 36",
        note: "Car 3, 4A/4B",
        desc: "富士回遊號直達新宿，舒適快捷。",
        mapUrl: "https://maps.app.goo.gl/FujisanStation",
      },
      {
        time: "16:58",
        event: "抵達新宿",
        note: "前往 BNB",
        desc: "東京最繁忙的交通樞紐，人潮洶湧。",
        mapUrl: "https://maps.app.goo.gl/ShinjukuStation",
      },
      {
        time: "17:30",
        event: "Check-in BNB",
        note: "歌舞伎町",
        desc: "位於歌舞伎町二丁目，體驗東京的不夜城氛圍。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=2+Chome-8-3+Kabukicho,+Shinjuku+City",
      },
      {
        time: "18:00",
        event: "惠比壽啤酒紀念館",
        note: "晚餐 & 參觀",
        desc: "品嚐新鮮惠比壽啤酒，了解日本啤酒歷史。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Museum+of+Yebisu+Beer",
      },
    ],
  },
  {
    day: "Day 5",
    date: "12/7 (日)",
    title: "銀杏林 & 藝術巡禮",
    icon: <Camera className="w-5 h-5" />,
    details: [
      {
        time: "Breakfast",
        event: "Masala Station",
        note: "マサラステーション",
        desc: "道地的印度咖哩，香料味濃郁，開啟活力的一天。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Masala+Station+Shinjuku",
      },
      {
        time: "Morning",
        event: "明治神宮外苑",
        note: "銀杏林",
        desc: "漫步在金黃色的銀杏大道，感受東京的秋意。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Meiji+Jingu+Gaien+Ginkgo+Avenue",
      },
      {
        time: "Afternoon",
        event: "21_21 Design Sight",
        note: "美術館",
        desc: "安藤忠雄設計的建築，展出前衛的設計藝術展覽。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=21_21+Design+Sight",
      },
      {
        time: "Evening",
        event: "新宿逛街",
        note: "購物行程",
        desc: "各大百貨林立，滿足所有的購物需求。",
        mapUrl: "https://maps.app.goo.gl/ShinjukuStation",
      },
    ],
  },
  {
    day: "Day 6",
    date: "12/8 (一)",
    title: "麻布台之丘 & 返程",
    icon: <Plane className="w-5 h-5" />,
    details: [
      {
        time: "Morning",
        event: "早餐 & Check-out",
        note: "準備出發",
        desc: "整理行李，辦理退房手續。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=2+Chome-8-3+Kabukicho,+Shinjuku+City",
      },
      {
        time: "09:30",
        event: "寄放行李",
        note: "置物櫃導航",
        desc: "將行李寄放在方便的地點，輕裝遊玩。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=35°41'29.1\"N+139°42'04.3\"E",
      },
      {
        time: "10:00",
        event: "麻布台之丘",
        note: "東京新地標",
        desc: "東京最新最高的大樓，集結藝術、時尚與美食。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=Azabudai+Hills",
      },
      {
        time: "Afternoon",
        event: "teamLab Borderless",
        note: "數位藝術",
        desc: "無邊界的數位藝術世界，沉浸式的視覺體驗。",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=teamLab+Borderless+Azabudai",
      },
      {
        time: "18:09",
        event: "NEX 快線出發",
        note: "往成田機場",
        desc: "搭乘特快列車前往機場，結束旅程。",
        mapUrl: "https://maps.app.goo.gl/ShinjukuStation",
      },
      {
        time: "19:37",
        event: "抵達機場 NRT",
        note: "辦理登機",
        desc: "最後的免稅品採購，準備搭機返台。",
        mapUrl: "https://maps.app.goo.gl/NaritaAirport",
      },
      {
        time: "22:05",
        event: "MM627 起飛",
        note: "樂桃航空 -> TPE",
        desc: "帶著滿滿的回憶飛往台北桃園。",
        mapUrl: "https://maps.app.goo.gl/NaritaAirport",
      },
    ],
  },
];

// --- 訂位 / 票券資料 ---
const bookingsData = [
  {
    type: "Flight",
    title: "TR874 TPE->NRT",
    ref: "#TR-874",
    note: "12/3 13:55 起飛",
    icon: <Plane className="w-6 h-6 text-blue-500" />,
    qrUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=FlightTR874",
  },
  {
    type: "Flight",
    title: "MM627 NRT->TPE",
    ref: "#MM-627",
    note: "12/8 22:05 起飛",
    icon: <Plane className="w-6 h-6 text-blue-500" />,
    qrUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=FlightMM627",
  },
  {
    type: "Train",
    title: "Fuji Excursion 36",
    ref: "Car 3, 4A/4B",
    note: "12/6 15:00 河口湖發",
    icon: <Train className="w-6 h-6 text-red-500" />,
    qrUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=FujiExcursion36",
  },
  {
    type: "Hotel",
    title: "Motosu Phoenix Hotel",
    ref: "12/5 住宿",
    note: "本栖鳳凰酒店",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Motosu+Phoenix+Hotel",
    icon: <Hotel className="w-6 h-6 text-purple-500" />,
  },
  {
    type: "Hotel",
    title: "Shinjuku BNB",
    ref: "12/6-12/8 住宿",
    note: "Kabukicho 2-8-3",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=2+Chome-8-3+Kabukicho,+Shinjuku+City",
    icon: <Hotel className="w-6 h-6 text-purple-500" />,
  },
  {
    type: "Car",
    title: "ORIX 租車",
    ref: "#684258558",
    note: "12/6 14:00 還車",
    icon: <Car className="w-6 h-6 text-orange-500" />,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("itinerary");
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [newRes, setNewRes] = useState("");
  const [newResType, setNewResType] = useState("拉麵");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentQR, setCurrentQR] = useState({ url: "", title: "" });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (dayIdx, itemIdx) => {
    const key = `${dayIdx}-${itemIdx}`;
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!firebaseInitialized || !auth) {
      setIsAuthReady(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setIsAuthReady(true);
    });

    (async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("登入失敗:", error);
      }
    })();

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!db || !isAuthReady || !user) return;

    const q = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "restaurants"
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRestaurants(data);
      },
      (error) => console.error(error)
    );

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    if (!newRes.trim() || !db || !user) return;
    setLoading(true);
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "restaurants"),
        {
          name: newRes,
          type: newResType,
          votes: 0,
          addedBy: user.uid || "Anonymous",
          timestamp: new Date().toISOString(),
        }
      );
      setNewRes("");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleVote = async (id, currentVotes) => {
    if (!db || !user) return;
    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "restaurants", id),
        { votes: currentVotes + 1 }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!db || !user) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "restaurants", id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const openQR = (url, title) => {
    setCurrentQR({ url, title });
    setShowQR(true);
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-all duration-300 ${
        activeTab === id
          ? "text-rose-500 bg-rose-50"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <Icon
        className={`w-5 h-5 mb-1 ${
          activeTab === id ? "animate-bounce-short" : ""
        }`}
      />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 text-gray-800">
      {showQR && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-sm"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white p-4 rounded-3xl max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h3 className="font-bold text-xl">{currentQR.title}</h3>
            </div>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200">
              <img
                src={currentQR.url}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="mt-6 w-full bg-rose-500 text-white font-bold py-3 rounded-xl"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative h-44 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 z-10" />
        <img
          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop"
          alt="Tokyo Vibe"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-4 left-6 z-20">
          <p className="text-rose-400 text-xs font-bold tracking-widest uppercase mb-1">
            Tokyo 2025
          </p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            東京富士之旅
          </h1>
        </div>
      </div>

      <main className="px-4 py-4 max-w-md mx-auto">
        {/* Weather Tab */}
        {activeTab === "weather" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-2 pl-2 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-rose-500" />
              12/3-12/9 天氣預報
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {weatherData.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      {day.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{day.date}</p>
                      <p className="text-xs text-gray-500">{day.weather}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-lg text-gray-700">
                      {day.temp}
                    </p>
                    <p className="text-[10px] text-gray-400">{day.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === "itinerary" && (
          <div className="space-y-6 animate-fade-in">
            {itineraryData.map((item, dayIdx) => (
              <div
                key={dayIdx}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4 relative z-10 border-b border-gray-100 pb-3">
                  <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">
                      {item.day} • {item.date}
                    </p>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                  </div>
                </div>
                <div className="space-y-3 relative z-10 ml-2">
                  {item.details.map((detail, itemIdx) => {
                    const isExpanded = expandedItems[`${dayIdx}-${itemIdx}`];
                    return (
                      <div
                        key={itemIdx}
                        className="relative pl-6 pb-2 border-l-2 border-gray-100 last:border-0"
                      >
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isExpanded ? "bg-rose-500" : "bg-gray-300"
                            } transition-colors`}
                          />
                        </div>

                        <div
                          className="flex justify-between items-start cursor-pointer"
                          onClick={() => toggleItem(dayIdx, itemIdx)}
                        >
                          <div className="flex-1">
                            <p className="text-xs font-bold text-rose-500 mb-0.5">
                              {detail.time}
                            </p>
                            <h4 className="text-sm font-bold text-gray-800">
                              {detail.event}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {detail.note}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={detail.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 bg-gray-50 rounded-full text-blue-500 hover:bg-blue-50"
                            >
                              <MapPin className="w-4 h-4" />
                            </a>
                            <button className="text-gray-300">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-2 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 leading-relaxed animate-fade-in">
                            {detail.desc}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "booking" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-2 pl-2">訂位與票券</h2>
            {bookingsData.map((book, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl shrink-0">
                    {book.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        {book.type}
                      </span>
                      {book.mapUrl && (
                        <a
                          href={book.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="w-4 h-4 text-rose-400 hover:text-rose-600" />
                        </a>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 mt-1 truncate">
                      {book.title}
                    </h3>
                    <p className="text-sm text-rose-500 font-mono mt-1">
                      {book.ref}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{book.note}</p>
                  </div>
                </div>
                {book.qrUrl && (
                  <button
                    onClick={() => openQR(book.qrUrl, book.title)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-bold py-2.5 rounded-lg active:scale-95 transition-transform hover:bg-gray-800"
                  >
                    <QrCode className="w-4 h-4" />
                    顯示 QR Code
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Restaurant Tab */}
        {activeTab === "restaurants" && (
          <div className="animate-fade-in">
            {(!firebaseInitialized || !isAuthReady) && (
              <div className="mb-6 text-center p-5 text-red-700 bg-red-100 rounded-xl border-dashed border-2 border-red-300">
                <p className="text-sm font-bold mb-1">
                  {firebaseInitialized ? "登入中..." : "資料庫連接中..."}
                </p>
              </div>
            )}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-rose-500" />
                口袋名單
              </h2>
              <form onSubmit={handleAddRestaurant} className="space-y-3">
                <input
                  type="text"
                  placeholder="店名 (e.g. 阿夫利拉麵)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  value={newRes}
                  onChange={(e) => setNewRes(e.target.value)}
                  disabled={!db || !user || !isAuthReady}
                />
                <div className="flex gap-2">
                  <select
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none"
                    value={newResType}
                    onChange={(e) => setNewResType(e.target.value)}
                    disabled={!db || !user || !isAuthReady}
                  >
                    <option>拉麵</option>
                    <option>燒肉</option>
                    <option>壽司</option>
                    <option>甜點</option>
                    <option>居酒屋</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loading || !db || !user || !isAuthReady}
                    className={`flex-1 text-white rounded-lg text-sm font-bold py-2 active:scale-95 transition-transform ${
                      loading || !db || !user || !isAuthReady
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    新增
                  </button>
                </div>
              </form>
            </div>
            <div className="space-y-3">
              {restaurants
                .slice()
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                          {res.type}
                        </span>
                        <h3 className="font-bold text-gray-800">
                          {res.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Added by {res.addedBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleVote(res.id, res.votes || 0)
                        }
                        className="flex flex-col items-center text-gray-400 hover:text-rose-500 transition-colors"
                        disabled={!db || !user || !isAuthReady}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            (res.votes || 0) > 0
                              ? "fill-rose-500 text-rose-500"
                              : ""
                          }`}
                        />
                        <span className="text-xs font-mono font-bold">
                          {res.votes || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="text-gray-200 hover:text-red-400 px-2"
                        disabled={!db || !user || !isAuthReady}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pb-safe pt-1 flex justify-between items-end z-50">
        <TabButton id="itinerary" label="行程" icon={Calendar} />
        <TabButton id="weather" label="天氣" icon={Cloud} />
        <TabButton id="booking" label="訂位" icon={Ticket} />
        <TabButton id="restaurants" label="找餐廳" icon={Utensils} />
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .animate-bounce-short { animation: bounce-short 0.4s ease-out; }
      `}</style>
    </div>
  );
}
