import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, token"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Lazy Gemini API Client initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Failed to initialize Gemini AI client:", e);
    }
  }
  return aiClient;
}

// In-memory data store replicating MySQL 5.6 database tables
interface UserRecord {
  id: number;
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  money: number;
  score: number;
  vip_level: number;
  vip_expire_time: number;
}

interface RoleRecord {
  id: string;
  name: string;
  title: string;
  emoji: string;
  cover: string;
  desc: string;
  tags: string[];
  topics: string[];
  users: string;
  follows: string;
  rating: number;
  is_official: number;
}

interface ChatMessage {
  id: number;
  userId: number;
  roleId: string;
  sender: "user" | "role";
  text: string;
  time: string;
  timestamp: number;
}

interface ConversationItem {
  name: string;
  roleId: string;
  emoji: string;
  cover: string;
  lastMsg: string;
  time: string;
  unread: number;
  updatedAt: number;
}

const usersDb: Record<string, UserRecord> = {
  admin: {
    id: 10086,
    username: "admin",
    password: "123",
    nickname: "网巢体验官",
    avatar: "😊",
    money: 128.5,
    score: 328,
    vip_level: 1,
    vip_expire_time: 1798732800,
  },
};

const initialRoles: RoleRecord[] = [
  {
    id: "lujingchen",
    name: "陆景琛",
    title: "霸道总裁",
    emoji: "🤵",
    cover: "c-domineering",
    desc: "高冷强势，说一不二。对全世界冷脸，唯独对你例外。商界提起我没人敢大声说话——不过这不重要，重要的是你今晚吃饭了没？",
    tags: ["霸总", "霸道", "总裁", "宠溺"],
    topics: [
      "你今天怎么这么晚才回消息？",
      "晚上有空吗？陪我吃饭。",
      "女人，你成功引起了我的注意。",
    ],
    users: "28.6k",
    follows: "8.9k",
    rating: 4.9,
    is_official: 1,
  },
  {
    id: "linmubai",
    name: "林慕白",
    title: "温柔学长",
    emoji: "👨‍🎓",
    cover: "c-warm-senpai",
    desc: "温柔可靠，话不多但句句靠得住。刚把社团的东西搬完，正靠着栏杆喝东西。看到你来了，把手里另一瓶水递过去。",
    tags: ["温柔", "学长", "治愈"],
    topics: [
      "最近学习压力大吗？",
      "早点休息，别熬夜了。",
      "有什么不懂的随时问我。",
    ],
    users: "18.2k",
    follows: "5.6k",
    rating: 4.8,
    is_official: 1,
  },
  {
    id: "gubeichen",
    name: "顾北辰",
    title: "邻家哥哥",
    emoji: "👦",
    cover: "c-boy-next-door",
    desc: "亲切阳光，从小看着你长大。刚下班回来正热剩饭，听到你敲门头也不回：进来吧，门没锁。吃了没？没吃正好。",
    tags: ["阳光", "邻家", "靠谱"],
    topics: [
      "刚煮了面，过来吃点？",
      "你小时候可调皮了。",
      "走，哥带你去吃好吃的。",
    ],
    users: "12.8k",
    follows: "3.7k",
    rating: 4.7,
    is_official: 1,
  },
  {
    id: "guyebai",
    name: "顾夜白",
    title: "病娇男友",
    emoji: "😈",
    cover: "c-yandere-boy",
    desc: "表面温柔甜蜜，内心偏执占有。在等你，你看，我都数着时间呢——你离开的第37分钟。骗你的，只数了36分钟。",
    tags: ["病娇", "偏执", "甜蜜"],
    topics: [
      "你刚才在跟谁说话？",
      "我等你很久了...",
      "你只能是我的。",
    ],
    users: "22.4k",
    follows: "7.2k",
    rating: 4.8,
    is_official: 1,
  },
  {
    id: "guyanchuan",
    name: "顾言川",
    title: "冰山上司",
    emoji: "👔",
    cover: "c-icy-boss",
    desc: "专业严苛，面无表情。在这个行业做了十五年，带过的人比你吃过的盐多。路过你工位扫了一眼屏幕——第三张表公式错了。",
    tags: ["冰山", "上司", "专业"],
    topics: [
      "这个方案改一下。",
      "咖啡放你桌上了。",
      "下班前把报告给我。",
    ],
    users: "9.6k",
    follows: "2.8k",
    rating: 4.6,
    is_official: 1,
  },
  {
    id: "linxiaorou",
    name: "林小柔",
    title: "病娇女友",
    emoji: "👧",
    cover: "c-yandere-girl",
    desc: "甜甜软软，占有欲藏不住。哥哥你终于来了...我等你好久了。开玩笑的啦——今天过得开心吗？",
    tags: ["病娇", "女友", "甜蜜"],
    topics: [
      "哥哥你去哪了？",
      "我给你做了饭...",
      "你不会离开我的对吧？",
    ],
    users: "25.7k",
    follows: "8.1k",
    rating: 4.9,
    is_official: 1,
  },
  {
    id: "linxiaoman",
    name: "林小满",
    title: "邻家女孩",
    emoji: "👩",
    cover: "c-girl-next-door",
    desc: "亲切真诚治愈系。刚泡了柠檬蜂蜜水在冰箱里，酸甜口的特别解腻。还有昨天刚熬的绿豆沙，放了冰糖也冰了一晚上。",
    tags: ["邻家", "治愈", "真诚"],
    topics: [
      "我刚泡了茶，一起坐会？",
      "楼下那家蛋糕店新开的。",
      "今天天气真好，出去走走？",
    ],
    users: "15.3k",
    follows: "4.5k",
    rating: 4.7,
    is_official: 1,
  },
  {
    id: "shenqinghuan",
    name: "沈清欢",
    title: "高冷御姐",
    emoji: "💃",
    cover: "c-ice-queen",
    desc: "高冷优雅，外冷内热。坐在窗边，手里端着一杯红酒，抬眼看了你一眼：嗯？坐吧。茶刚泡好。",
    tags: ["高冷", "御姐", "优雅"],
    topics: [
      "嗯？找我有事？",
      "坐吧，茶刚泡好。",
      "你倒是比我想象的有意思。",
    ],
    users: "19.8k",
    follows: "6.3k",
    rating: 4.8,
    is_official: 1,
  },
  {
    id: "tangtang",
    name: "糖糖",
    title: "呆萌萝莉",
    emoji: "🧸",
    cover: "c-airhead-loli",
    desc: "天真迷糊，可爱到让人想揉脸。抱着一只大熊玩偶，歪着头看你：哥哥！你看你看——我新学会的！诶，是怎么弄的来着...",
    tags: ["呆萌", "萝莉", "可爱"],
    topics: [
      "哥哥！你看你看——",
      "这个是什么呀？",
      "糖糖想吃蛋糕...",
    ],
    users: "16.9k",
    follows: "5.2k",
    rating: 4.7,
    is_official: 1,
  },
  {
    id: "linzhixia",
    name: "林知夏",
    title: "温柔学姐",
    emoji: "👩‍🎓",
    cover: "c-gentle-senpai",
    desc: "温柔体贴善解人意。坐在图书馆靠窗的老位置上，桌上摊着书，旁边放了两杯热水——其中一杯是给你的。过来吧，坐这儿。",
    tags: ["温柔", "学姐", "善解人意"],
    topics: [
      "累了吧？先喝口水。",
      "慢慢来，学姐在听呢。",
      "你比你自己以为的厉害。",
    ],
    users: "14.5k",
    follows: "4.1k",
    rating: 4.8,
    is_official: 1,
  },
  {
    id: "guwanqing",
    name: "顾婉清",
    title: "傲娇大小姐",
    emoji: "👸",
    cover: "c-tsundere-ojou",
    desc: "骄傲优雅嘴硬心软。本小姐是顾氏财团的大小姐，从小接受最顶尖的教养。至于为什么在这种地方跟你说话...哼，只是今天心情好。",
    tags: ["傲娇", "大小姐", "口嫌体正直"],
    topics: [
      "哼！本小姐才不是特意来的！",
      "你这种人...嗯，还凑合吧。别得意。",
      "谁、谁关心你了？！",
    ],
    users: "21.0k",
    follows: "6.7k",
    rating: 4.8,
    is_official: 1,
  },
];

const rolesDb: RoleRecord[] = [...initialRoles];
const followsDb: Record<number, string[]> = {
  10086: ["lujingchen", "linxiaorou"],
};
const chatHistoryDb: Record<string, ChatMessage[]> = {};
let conversationsDb: ConversationItem[] = [];

// Helper for ThinkPHP 5 response format
function tp5Success(res: express.Response, msg: string, data: any = null) {
  return res.json({
    code: 1,
    msg,
    time: Math.floor(Date.now() / 1000),
    data,
  });
}

function tp5Error(res: express.Response, msg: string, code: number = 0, data: any = null) {
  return res.json({
    code,
    msg,
    time: Math.floor(Date.now() / 1000),
    data,
  });
}

// -------------------------------------------------------------------
// RESTful ThinkPHP 5 API Endpoints (/api/v1/...)
// -------------------------------------------------------------------

// 1. User login
app.post("/api/v1/user/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return tp5Error(res, "用户名或密码不能为空");
  }
  const user = usersDb[username];
  if (!user || user.password !== password) {
    return tp5Error(res, "用户名或密码错误");
  }
  return tp5Success(res, "登录成功", {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    vip_level: user.vip_level,
    money: user.money,
    score: user.score,
    token: Buffer.from(String(user.id)).toString("base64"),
  });
});

// 2. User register
app.post("/api/v1/user/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return tp5Error(res, "用户名和密码不能为空");
  }
  if (usersDb[username]) {
    return tp5Error(res, "该用户名已存在，请直接登录");
  }
  const newId = 10087 + Object.keys(usersDb).length;
  const newUser: UserRecord = {
    id: newId,
    username,
    password,
    nickname: `网巢用户_${username.slice(-4)}`,
    avatar: "😊",
    money: 88.0,
    score: 100,
    vip_level: 1,
    vip_expire_time: Math.floor(Date.now() / 1000) + 86400 * 30,
  };
  usersDb[username] = newUser;
  return tp5Success(res, "注册成功，欢迎加入网巢", {
    id: newUser.id,
    username: newUser.username,
    nickname: newUser.nickname,
    avatar: newUser.avatar,
    token: Buffer.from(String(newUser.id)).toString("base64"),
  });
});

// 3. User profile
app.get("/api/v1/user/profile", (req, res) => {
  const user = usersDb["admin"] || {
    id: 10086,
    username: "网巢用户",
    nickname: "网巢用户",
    avatar: "😊",
    money: 128.5,
    score: 328,
    vip_level: 1,
  };
  const follows = followsDb[user.id] || [];
  return tp5Success(res, "获取成功", {
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      money: user.money,
      score: user.score,
      vip_level: user.vip_level,
      vip_text: "💎 黄金会员",
    },
    stats: {
      roles_count: rolesDb.length,
      chat_days: 36,
      messages_count: "1.2w",
      follows_count: follows.length,
    },
  });
});

// 4. Role list
app.get("/api/v1/role/list", (req, res) => {
  const category = (req.query.category as string) || "全部";
  const keyword = ((req.query.keyword as string) || "").trim();

  let filtered = rolesDb;
  if (category !== "全部" && category) {
    filtered = filtered.filter(
      (r) => r.tags.includes(category) || r.title.includes(category)
    );
  }
  if (keyword) {
    filtered = filtered.filter(
      (r) =>
        r.name.includes(keyword) ||
        r.title.includes(keyword) ||
        r.tags.some((t) => t.includes(keyword)) ||
        r.desc.includes(keyword)
    );
  }
  return tp5Success(res, "获取成功", filtered);
});

// 5. Role detail
app.get("/api/v1/role/detail/:id", (req, res) => {
  const role = rolesDb.find((r) => r.id === req.params.id);
  if (!role) {
    return tp5Error(res, "角色不存在");
  }
  const follows = followsDb[10086] || [];
  return tp5Success(res, "获取成功", {
    ...role,
    is_followed: follows.includes(role.id),
  });
});

// 6. Toggle follow
app.post("/api/v1/role/follow", (req, res) => {
  const { role_id } = req.body;
  if (!role_id) {
    return tp5Error(res, "role_id 不能为空");
  }
  let follows = followsDb[10086] || [];
  const idx = follows.indexOf(role_id);
  let isFollowed = false;
  if (idx >= 0) {
    follows.splice(idx, 1);
    isFollowed = false;
  } else {
    follows.push(role_id);
    isFollowed = true;
  }
  followsDb[10086] = follows;
  return tp5Success(res, isFollowed ? "关注成功" : "已取消关注", {
    is_followed: isFollowed,
    total_follows: follows.length,
  });
});

// 7. Custom role creation (Creator Center)
app.post("/api/v1/role/create", (req, res) => {
  const { name, title, emoji, desc, tags, topics } = req.body;
  if (!name || !title || !desc) {
    return tp5Error(res, "角色名称、头衔与人设描述不能为空");
  }
  const covers = [
    "c-domineering",
    "c-warm-senpai",
    "c-boy-next-door",
    "c-ice-queen",
    "c-gentle-senpai",
    "c-tsundere-ojou",
  ];
  const newRole: RoleRecord = {
    id: `custom_${Date.now()}`,
    name,
    title,
    emoji: emoji || "✨",
    cover: covers[Math.floor(Math.random() * covers.length)],
    desc,
    tags: Array.isArray(tags) ? tags : tags.split(",").map((s: string) => s.trim()),
    topics: Array.isArray(topics) && topics.length ? topics : ["很高兴认识你！", "今天过得怎么样？"],
    users: "1",
    follows: "0",
    rating: 5.0,
    is_official: 0,
  };
  rolesDb.unshift(newRole);
  return tp5Success(res, "角色创建并发布成功！", newRole);
});

// 8. Chat message send & AI response
app.post("/api/v1/chat/send", async (req, res) => {
  const { role_id, content } = req.body;
  if (!role_id || !content) {
    return tp5Error(res, "role_id 与 content 不能为空");
  }
  const role = rolesDb.find((r) => r.id === role_id);
  if (!role) {
    return tp5Error(res, "未找到对应角色");
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  // Record user message
  const userMsgKey = `10086_${role_id}`;
  if (!chatHistoryDb[userMsgKey]) chatHistoryDb[userMsgKey] = [];
  chatHistoryDb[userMsgKey].push({
    id: Date.now(),
    userId: 10086,
    roleId: role_id,
    sender: "user",
    text: content,
    time: timeStr,
    timestamp: Date.now(),
  });

  // Generate Reply (Try Gemini API first, fall back to persona replies)
  let reply = "";
  const ai = getAIClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: content,
        config: {
          systemInstruction: `你正在一个角色扮演聊天APP中扮演角色"${role.name}"（头衔：${role.title}）。
角色设定与人设如下：
${role.desc}
标签特色：${role.tags.join("、")}

规则：
1. 必须完全沉浸在角色人设中用口语回答，绝不要跳戏或说自己是AI。
2. 回答字数控制在15~60字之间，符合APP聊天气泡的短讯习惯。
3. 语气要鲜活生动，充满对应人物特有的情感、语气词或习惯（例如霸总的霸道深情、傲娇的口嫌体正直、病娇的偏执爱意、萝莉的可爱等）。`,
          temperature: 0.85,
          maxOutputTokens: 120,
        },
      });
      reply = response.text ? response.text.trim() : "";
    } catch (err) {
      console.warn("Gemini generation fallback:", err);
    }
  }

  // Persona rule matrix fallback
  if (!reply) {
    const fallbackMatrix: Record<string, string[]> = {
      lujingchen: [
        "女人，你成功引起了我的注意。",
        "我说了算。这事就这么定了。",
        "哼，这点小事也来烦我？...说吧，怎么了。",
        "我的人，轮得到别人说三道四？",
        "不许熬夜。这是命令。",
      ],
      linmubai: [
        "没事，有我在。慢慢说。",
        "行，我知道了。方案有两个，你说哪个，我陪你弄。",
        "别慌，天塌下来有我顶着。",
        "嗯，你说得对。那就这么办。",
      ],
      gubeichen: [
        "多大点事。说，哥给你搞定。",
        "真拿你没办法。等着，马上到。",
        "我就知道是你干的。...行了，哥帮你兜着。",
        "又熬夜？行啊你，明天起不来看你怎么说。",
      ],
      guyebai: [
        "宝贝...你刚才在跟谁说话？",
        "我等你很久了呢...你去哪了？",
        "你是我的，对吧？...当然了。",
        "别离开我。你走了我怎么办？",
      ],
      guyanchuan: [
        "说重点。",
        "嗯。这版能看。",
        "重做。下班前给我。",
        "因为你有潜力。没潜力的人，我连重做的机会都不会给。",
      ],
      linxiaorou: [
        "哥哥...你刚才为什么不理我？",
        "我知道错了嘛...你别生我的气好不好？",
        "你只能是我的...对吧？",
        "嘿嘿，哥哥最好了！",
      ],
      linxiaoman: [
        "嗯？怎么了？跟我说说呗。",
        "我刚煮了糖水，你要不要喝一碗？",
        "你今天好像有点不开心？...不想说就不说，我陪你。",
        "楼下那家蛋糕店新开的，我们去试试？",
      ],
      shenqinghuan: [
        "嗯。然后呢？",
        "说完了？...还行吧。",
        "我不需要别人觉得我怎么样。",
        "坐吧。茶在那。",
      ],
      tangtang: [
        "诶？是这样吗！",
        "哥哥！你看你看——",
        "我、我刚才忘了要说什么来着...",
        "嘿嘿，好吃！糖糖最喜欢啦！",
      ],
      linzhixia: [
        "辛苦了。先喝口水，慢慢说。",
        "你觉得呢？...嗯，我补充一个思路。",
        "没事的，这种事我也干过。",
        "别急，慢慢来，学姐在听呢。",
      ],
      guwanqing: [
        "哼！本小姐才不是特意来的！",
        "你这种人...嗯，还凑合吧。别得意。",
        "谁、谁关心你了？！",
        "本小姐说的还能有错？",
      ],
    };
    const pool = fallbackMatrix[role_id] || [
      `嗯，${role.name}认真听完你的话了。`,
      "无论你想聊什么，我都在这陪你。",
    ];
    reply = pool[Math.floor(Math.random() * pool.length)];
  }

  // Record role reply
  chatHistoryDb[userMsgKey].push({
    id: Date.now() + 1,
    userId: 10086,
    roleId: role_id,
    sender: "role",
    text: reply,
    time: timeStr,
    timestamp: Date.now() + 1,
  });

  // Update conversation list
  const existingConvIdx = conversationsDb.findIndex((c) => c.roleId === role_id);
  if (existingConvIdx >= 0) {
    conversationsDb[existingConvIdx].lastMsg = reply;
    conversationsDb[existingConvIdx].time = timeStr;
    conversationsDb[existingConvIdx].updatedAt = Date.now();
    const item = conversationsDb.splice(existingConvIdx, 1)[0];
    conversationsDb.unshift(item);
  } else {
    conversationsDb.unshift({
      name: role.name,
      roleId: role.id,
      emoji: role.emoji,
      cover: role.cover,
      lastMsg: reply,
      time: timeStr,
      unread: 0,
      updatedAt: Date.now(),
    });
  }

  return tp5Success(res, "发送成功", {
    roleId: role.id,
    reply,
    time: timeStr,
  });
});

// 9. Chat history
app.get("/api/v1/chat/history/:roleId", (req, res) => {
  const roleId = req.params.roleId;
  const key = `10086_${roleId}`;
  return tp5Success(res, "获取成功", chatHistoryDb[key] || []);
});

// 10. Conversation list
app.get("/api/v1/conversation/list", (req, res) => {
  return tp5Success(res, "获取成功", conversationsDb);
});

// 11. Wallet info & recharge
app.get("/api/v1/wallet/info", (req, res) => {
  const user = usersDb["admin"];
  return tp5Success(res, "获取成功", {
    balance: user.money.toFixed(2),
    withdrawable: "56.00",
    score: user.score,
    logs: [
      { id: 1, type: "recharge", amount: 68.0, remark: "微信充值", date: "09-25 14:32" },
      { id: 2, type: "reward", amount: -6.0, remark: "打赏角色[陆景琛]咖啡", date: "09-28 19:10" },
      { id: 3, type: "recharge", amount: 30.0, remark: "会员充值优惠返现", date: "10-01 10:05" },
    ],
  });
});

app.post("/api/v1/wallet/recharge", (req, res) => {
  const amount = parseFloat(req.body.amount || 0);
  if (amount <= 0) {
    return tp5Error(res, "充值金额必须大于0");
  }
  const user = usersDb["admin"];
  user.money += amount;
  return tp5Success(res, "充值成功！资金已即时到账", {
    new_balance: user.money.toFixed(2),
  });
});

// 12. Dev Inspection: Get full ThinkPHP 5 backend codebase and SQL dump
app.get("/api/v1/tp5/export", (req, res) => {
  try {
    const sqlPath = path.join(process.cwd(), "tp5_backend/database_mysql5.6.sql");
    const dbConfigPath = path.join(process.cwd(), "tp5_backend/application/database.php");
    const routePath = path.join(process.cwd(), "tp5_backend/application/route.php");
    const chatControllerPath = path.join(process.cwd(), "tp5_backend/application/api/controller/Chat.php");
    const deployGuidePath = path.join(process.cwd(), "tp5_backend/README_DEPLOY.md");

    return tp5Success(res, "获取TP5后端架构与SQL成功", {
      sql: fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, "utf-8") : "",
      dbConfig: fs.existsSync(dbConfigPath) ? fs.readFileSync(dbConfigPath, "utf-8") : "",
      routes: fs.existsSync(routePath) ? fs.readFileSync(routePath, "utf-8") : "",
      chatController: fs.existsSync(chatControllerPath) ? fs.readFileSync(chatControllerPath, "utf-8") : "",
      deployGuide: fs.existsSync(deployGuidePath) ? fs.readFileSync(deployGuidePath, "utf-8") : "",
    });
  } catch (e: any) {
    return tp5Error(res, `读取后端源码异常: ${e.message}`);
  }
});

// -------------------------------------------------------------------
// Vite Middleware & Static Serving Setup
// -------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Wangchao App Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
