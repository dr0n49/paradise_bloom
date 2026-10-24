/**
 * UI text. Language comes from ?lang= (unknown codes fall back to English).
 * Social casino (?social=true or jurisdiction.socialCasino) swaps in wording without
 * bet/buy/pay/cash terms — see Engine's social-mode word list.
 */

import { SUPPORTED_LANGUAGES, TRANSLATIONS, type Language } from "./locales";
import { GENERAL_GAME_DISCLAIMER } from "./game/disclaimer";
export { SUPPORTED_LANGUAGES } from "./locales";

export function resolveLanguage(code: string | null): Language {
  const primary = (code ?? "en").trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(primary as Language) ? primary as Language : "en";
}

const params = new URLSearchParams(location.search);
const lang = resolveLanguage(params.get("lang"));
export const isRu = lang === "ru";
let social = params.get("social") === "true";
export const isSocial = () => social;
export const setSocial = (on: boolean) => {
  social = social || on;
  syncLanguage();
};

export const uiLanguage = () => social ? "en" : lang;
function syncLanguage() {
  if (typeof document !== "undefined") document.documentElement.lang = uiLanguage();
}

export type Dict = {
  recovery: { title: string; message: string; resume: string; errorTitle: string; error: string; reload: string };
  spin: string;
  features: string;
  menu: string;
  turbo: string;
  modeStats: string;
  replayErrors: Record<"incomplete" | "unavailable" | "notFound" | "invalid" | "insecure", string>;
  balance: string;
  win: string;
  bet: string;
  increaseAmount: string;
  decreaseAmount: string;
  totalWin: string;
  freeSpins: string;
  tapToContinue: string;
  disable: string;
  activate: string;
  buy: string;
  confirm: string;
  info: string;
  close: string;
  effectsVolume: string;
  musicVolume: string;
  muteEffects: string;
  unmuteEffects: string;
  muteMusic: string;
  unmuteMusic: string;
  audioCredit: string;
  autoplay: string;
  autoStart: string;
  autoStop: string;
  spins: string;
  insufficient: string;
  amountUnavailable: string;
  sessionExpired: string;
  limits: string;
  connection: string;
  connectFail: string;
  loading: string;
  replay: string;
  playReplay: string;
  playing: string;
  replayAgain: string;
  realCost: string;
  mysteryResult: string;
  noFeature: string;
  freeSpinsN: (n: number) => string;
  featureSub: Record<string, string>;
  minimum: string;
  bigWin: string;
  megaWin: string;
  epicWin: string;
  maxWin: string;
  intro: { epic: [string, string]; chest: [string, string]; max: [string, string] };
  modeText: Record<string, string>;
  rules: {
    title: string;
    intro: string;
    payTitle: string;
    waysTitle: string;
    ways: string;
    featTitle: string;
    chestsTitle: string;
    chests: string[];
    halo: string[];
    mystery: string;
    modesTitle: string;
    controlsTitle: string;
    controls: [string, string][];
    generalTitle: string;
    general: string[];
  };
};

const en: Dict = {
  recovery: {"title": "Unfinished round", "message": "This round was already started. Continue it without another balance deduction.", "resume": "Continue round", "errorTitle": "Check connection", "error": "The round status could not be confirmed. Reload to sync your balance and finish any unfinished round before starting another.", "reload": "Reload"},
  spin: "Spin",
  features: "Features",
  menu: "Menu",
  turbo: "Turbo",
  modeStats: "RTP 96.00%, max win 25,000x.",
  replayErrors: {
    incomplete: "Replay link is incomplete.", unavailable: "Replay unavailable.",
    notFound: "Replay not found.", invalid: "Replay data is invalid.",
    insecure: "Replay host must use HTTPS.",
  },
  balance: "Balance",
  win: "Win",
  bet: "Bet",
  increaseAmount: "Increase amount",
  decreaseAmount: "Decrease amount",
  totalWin: "Total win",
  freeSpins: "Free spins",
  tapToContinue: "Press to continue",
  disable: "Disable",
  activate: "Activate",
  buy: "Buy",
  confirm: "Confirm",
  info: "Info",
  close: "Close",
  effectsVolume: "Sound volume",
  musicVolume: "Music volume",
  muteEffects: "Mute sound effects",
  unmuteEffects: "Unmute sound effects",
  muteMusic: "Mute music",
  unmuteMusic: "Unmute music",
  audioCredit: "Original music and sound — Paradise Bloom.",
  autoplay: "Autoplay",
  autoStart: "Start",
  autoStop: "Stop autoplay",
  spins: "spins",
  insufficient: "Insufficient balance.",
  amountUnavailable: "This amount is no longer available. Choose an available amount using the up/down arrows.",
  sessionExpired: "Session expired — please reopen the game.",
  limits: "Gambling limit reached.",
  connection: "Connection problem — please retry.",
  connectFail: "Could not connect to the game server.",
  loading: "Loading…",
  replay: "Replay",
  playReplay: "Play",
  playing: "Playing…",
  replayAgain: "Play again",
  realCost: "Real cost",
  mysteryResult: "Mystery",
  noFeature: "No feature",
  freeSpinsN: (n) => `${n} free spins`,
  featureSub: {
    bonus: "Win in all 5 rows of a reel to open its lotus",
    super: "Win in all 5 rows of a reel — every lotus at least 5x",
    epic: "Win in the 3 middle rows of a reel — every lotus at least 5x",
  },
  minimum: "minimum",
  bigWin: "Big win",
  megaWin: "Mega win",
  epicWin: "Epic win",
  maxWin: "Max win",
  intro: {
    epic: ["Epic Bloom Bonus", "A golden lotus under every reel"],
    chest: ["Lotus Multipliers", "Win on a reel's rows to open its lotus"],
    max: ["Max Win", "Open lotuses multiply together. Win up to 25,000x!"],
  },
  modeText: {
    extra_chance: "Every spin costs 3x. Free spins trigger on approximately 1.6404% of spins, 4.51x the normal spin rate.",
    super_chance: "Every spin costs 6x. Free spins trigger on approximately 1.9386% of spins, 5.33x the normal spin rate, with a higher share of Bloom Super and Bloom Epic.",
    raid: "One boosted spin with live lotuses: a reel opens its lotus from its middle row alone.",
    storm: "One super-boosted spin with live lotuses, and every lotus that opens is worth at least 5x.",
    bonus: "10 free spins. A lotus opens when all 5 rows of its reel have won.",
    super: "10 free spins, and every lotus that opens is worth at least 5x.",
    mystery: "A mystery entry: 50% no feature, 40% Bloom Super, 10% Bloom Epic.",
  },
  rules: {
    title: "Game rules",
    intro:
      "Paradise Bloom is a 5x5 cluster-pays game with tumbling wins. A cluster is 5 or more matching symbols connected horizontally or vertically. The theoretical RTP of every mode is 96.00%. The maximum win is 25,000x the bet in every mode.",
    payTitle: "Paytable",
    waysTitle: "How wins form",
    ways:
      "Every cluster of 5 or more matching symbols pays the value shown for its size. Winning symbols disappear, the symbols above fall down and new ones drop in; this repeats while new clusters form. There are no wild symbols. Bloom Gate symbols do not pay; they trigger free spins.",
    featTitle: "Features",
    chestsTitle: "Lotuses",
    chests: [
      "A golden lotus sits under every reel. Lotuses are live in Bloom Raid, Storm Raid and every free spins round, never in the base game.",
      "A ROW of a reel is won when a symbol in that row is part of a winning cluster. Won rows stay won until the end of the round: they build up through every tumble and every free spin. When a reel has won the rows its mode requires, its lotus opens.",
      "At the end of the feature every open lotus reveals 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x or 100x. Their multipliers are multiplied together: three lotuses at 5x, 3x and 2x give a combined multiplier of 30x. A lotus that stays closed counts as 1x.",
      "In free spins, the combined lotus multiplier applies only to the total win from the free spins. Any win from the spin that triggered the free spins is added separately and is not multiplied by the lotuses. In Bloom Raid and Storm Raid, the combined lotus multiplier applies to the win from that mode's single spin, including its tumbles.",
    ],
    halo: [
      "Land 3, 4 or 5 Bloom Gate symbols to trigger Bloom Bonus, Bloom Super or Bloom Epic, each with 10 free spins. Every Bloom Gate that lands during free spins adds 1 extra free spin.",
      "Bloom Bonus and Bloom Super open a lotus when all 5 rows of its reel have won. Bloom Epic opens it with just the 3 middle rows, so far more lotuses open. In Bloom Super, Bloom Epic and Storm Raid every open lotus is worth at least 5x.",
    ],
    mystery: "MYSTERY is an entry whose outcome is drawn on entry: 50% no feature, 40% Bloom Super and 10% Bloom Epic.",
    modesTitle: "Modes",
    controlsTitle: "Controls",
    controls: [
      ["Spin", "Starts a round at the shown bet. The space bar does the same."],
      ["Bet ▲ ▼", "Raises or lowers the bet through the available bet levels."],
      ["Feature button", "Opens the feature menu. Every feature asks for confirmation and shows its cost first."],
      ["Disable", "Turns an active mode off and returns to the normal spin."],
      ["Autoplay", "Opens the autoplay panel: choose the number of spins and press Start. Press the spin button to stop."],
      ["Turbo ⚡", "Speeds up the animations."],
      ["Menu ☰", "Opens Info (these rules), the sound volume and the music volume."],
      ["Close ✕", "Closes the open menu or information panel. Clicking outside a menu also closes it."],
      ["Replay: Play / Play again", "Play starts the loaded replay. Play again watches the same round again. Replay controls never start a new round."],
      ["Press to continue", "The bonus start and Total Win screens wait for a click or key. Any click or key also skips a win screen."],
    ],
    generalTitle: "General",
    general: [
      "All wins and winning combinations are shown according to the paytable.",
      GENERAL_GAME_DISCLAIMER,
    ],
  },
};

const ru: Dict = {
  ...en,
  recovery: {"title": "Незавершённый раунд", "message": "Этот раунд уже был начат. Продолжите его без повторного списания с баланса.", "resume": "Продолжить раунд", "errorTitle": "Проверьте соединение", "error": "Не удалось подтвердить состояние раунда. Перезагрузите игру, чтобы обновить баланс и завершить незаконченный раунд перед новым спином.", "reload": "Перезагрузить"},
  spin: "Спин",
  features: "Функции",
  menu: "Меню",
  turbo: "Турбо",
  modeStats: "RTP 96.00%, максимальный выигрыш 25 000x.",
  replayErrors: {
    incomplete: "Ссылка на повтор неполная.", unavailable: "Повтор недоступен.",
    notFound: "Повтор не найден.", invalid: "Некорректные данные повтора.",
    insecure: "Для повтора требуется защищённое соединение HTTPS.",
  },
  balance: "Баланс",
  win: "Выигрыш",
  bet: "Ставка",
  increaseAmount: "Увеличить сумму",
  decreaseAmount: "Уменьшить сумму",
  totalWin: "Общий выигрыш",
  freeSpins: "Бесплатные вращения",
  tapToContinue: "Нажмите, чтобы продолжить",
  disable: "Disable",
  activate: "Activate",
  buy: "Buy",
  confirm: "Confirm",
  info: "Инфо",
  close: "Закрыть",
  effectsVolume: "Громкость звуков",
  musicVolume: "Громкость музыки",
  muteEffects: "Выключить звуки",
  unmuteEffects: "Включить звуки",
  muteMusic: "Выключить музыку",
  unmuteMusic: "Включить музыку",
  audioCredit: "Оригинальная музыка и звуки — Paradise Bloom.",
  autoplay: "Автоигра",
  autoStart: "Старт",
  autoStop: "Остановить автоигру",
  spins: "вращений",
  insufficient: "Недостаточно средств.",
  amountUnavailable: "Эта ставка больше недоступна. Выберите доступную сумму стрелками вверх/вниз.",
  sessionExpired: "Сессия истекла — откройте игру заново.",
  limits: "Достигнут лимит игры.",
  connection: "Проблема со связью — попробуйте ещё раз.",
  connectFail: "Не удалось подключиться к игровому серверу.",
  loading: "Загрузка…",
  replay: "Повтор",
  playReplay: "Смотреть",
  playing: "Воспроизведение…",
  replayAgain: "Ещё раз",
  realCost: "Реальная стоимость",
  noFeature: "Без функции",
  freeSpinsN: (n) => `${n} free spins`,
  featureSub: {
    bonus: "Выиграйте в 5 рядах колонки — лотос будет готов раскрыться",
    super: "Зарядите все ряды — множитель лотоса не меньше 5×",
    epic: "Три средних ряда заряжают лотос — множитель от 5×",
  },
  minimum: "минимум",
  bigWin: "Big win",
  megaWin: "Mega win",
  epicWin: "Epic win",
  maxWin: "Max win",
  intro: {
    epic: ["Epic Bloom Bonus", "Под каждой колонкой раскрывается лотос"],
    chest: ["Lotus Multipliers", "Выигрывайте в рядах барабана, чтобы открыть его лотос"],
    max: ["Max Win", "Открытые лотосы перемножаются. Выигрыш до 25 000x!"],
  },
  modeText: {
    extra_chance: "Каждый спин стоит 3x. Вероятность запуска фриспинов — около 1,6404% за спин, в 4,51 раза выше обычного режима.",
    super_chance: "Каждый спин стоит 6x. Вероятность запуска фриспинов — около 1,9386% за спин, в 5,33 раза выше обычного режима; доля Bloom Super и Bloom Epic также выше.",
    raid: "Один усиленный спин с активными лотосами: барабан открывает свой лотос одним лишь средним рядом.",
    storm: "Один суперусиленный спин с активными лотосами, и каждый открытый лотос стоит минимум 5x.",
    bonus: "10 фриспинов. Лотос открывается, когда выиграны все 5 рядов барабана.",
    super: "10 фриспинов, и каждый открытый лотос стоит минимум 5x.",
    mystery: "Покупка с результатом при входе: 50% без функции, 40% Bloom Super, 10% Bloom Epic.",
  },
  rules: {
    title: "Правила игры",
    intro:
      "Paradise Bloom, игра с кластерными выплатами 5x5 и каскадными выигрышами. Кластер, это 5 или более одинаковых символов, соединённых по горизонтали или вертикали. Теоретический RTP для всех режимов составляет 96,00%. Максимальный выигрыш, 25 000x от ставки, во всех режимах.",
    payTitle: "Таблица выплат",
    waysTitle: "Способы выигрыша",
    ways:
      "Каждый кластер из 5 и более одинаковых символов платит значение для своего размера. Выигрышные символы исчезают, символы сверху падают вниз и появляются новые; это повторяется, пока образуются новые кластеры. Диких символов нет. Символы Bloom Gate не платят, они запускают фриспины.",
    featTitle: "Особенности",
    chestsTitle: "Лотосы",
    chests: [
      "Под каждым барабаном стоит золотой лотос. Лотосы активны в Bloom Raid, Storm Raid и в каждом раунде фриспинов, но никогда в основной игре.",
      "РЯД барабана считается выигранным, когда символ в этом ряду входит в выигрышный кластер, и выигранные ряды остаются выигранными до конца раунда: они накапливаются через каждый каскад и каждый фриспин. Когда барабан выиграл ряды, которых требует режим, его лотос открывается.",
      "В конце функции каждый открытый лотос показывает множитель: 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x или 100x. Множители перемножаются: три лотоса 5x, 3x и 2x дают общий множитель 30x. Закрытый лотос считается за 1x.",
      "Во фриспинах общий множитель лотосов применяется только к сумме выигрышей фриспинов. Выигрыш спина, запустившего фриспины, прибавляется отдельно и лотосами не умножается. В Bloom Raid и Storm Raid общий множитель лотосов применяется к выигрышу единственного спина этого режима, включая его каскады.",
    ],
    halo: [
      "Соберите 3, 4 или 5 символов Bloom Gate, чтобы запустить Bloom Bonus, Bloom Super или Bloom Epic, все дают 10 фриспинов. Каждый Bloom Gate, выпавший во время фриспинов, добавляет 1 дополнительный фриспин.",
      "Bloom Bonus и Bloom Super открывают лотос, когда выиграны все 5 рядов барабана. Bloom Epic открывает его уже по трём средним рядам, поэтому открывается гораздо больше лотосов. В Bloom Super, Bloom Epic и Storm Raid каждый открытый лотос стоит минимум 5x.",
    ],
    mystery: "MYSTERY, это покупка, результат которой разыгрывается при входе: 50% шанс без функции, 40% Bloom Super и 10% Bloom Epic.",
    modesTitle: "Режимы",
    controlsTitle: "Управление",
    controls: [
      ["Спин", "Запускает раунд с показанной ставкой. Пробел делает то же самое."],
      ["Ставка ▲ ▼", "Повышает или понижает ставку по доступным уровням."],
      ["Кнопка функций", "Открывает меню функций. Каждая функция сначала показывает цену и просит подтверждения."],
      ["Disable", "Выключает активный режим и возвращает обычный спин."],
      ["Автоигра", "Открывает панель автоигры: выберите число спинов и нажмите «Старт». Кнопка спина останавливает автоигру."],
      ["Турбо ⚡", "Ускоряет анимации."],
      ["Меню ☰", "Открывает Инфо (эти правила), громкость звуков и музыки."],
      ["Закрыть ✕", "Закрывает открытое меню или правила. Меню также закрывается нажатием за его пределами."],
      ["Повтор: Смотреть / Ещё раз", "«Смотреть» запускает загруженный повтор. «Ещё раз» воспроизводит тот же раунд. Эти кнопки не запускают новую игру."],
      ["Нажмите, чтобы продолжить", "Любой клик или клавиша пропускает экран выигрыша или функции."],
    ],
    generalTitle: "Общие положения",
    general: [
      "Все выигрыши и выигрышные комбинации отображаются в соответствии с таблицей выплат.",
      "Неисправность или неправильное использование аннулируют все выплаты и игры.",
      "Требуется стабильное интернет-соединение. Прерванные или отключённые игры можно возобновить, запустив игру заново. Поставленные суммы в незавершённой игре сохраняются до её завершения или аннулирования.",
      "Ожидаемый возврат рассчитан на большом количестве игр.",
      "Любое визуальное представление физических устройств не является «реальным» физическим устройством и служит только для иллюстрации.",
      "Выигрыши рассчитываются по сумме, полученной от удалённого игрового сервера, а не по событиям в браузере.",
      "TM and © 2026 Engine.",
    ],
  },
};

/** Social (Stake.US) English: no bet/buy/pay/cash/cost-of wording. */
const socialEn: Partial<Dict> = {
  bet: "Play amount",
  buy: "Play",
  insufficient: "Not enough balance.",
  limits: "Play limit reached.",
  realCost: "Total play",
  modeText: {
    ...en.modeText,
    extra_chance: "Each spin can be played for 3x. Free spins trigger on approximately 1.6404% of spins, 4.51x the normal spin rate.",
    super_chance: "Each spin can be played for 6x. Free spins trigger on approximately 1.9386% of spins, 5.33x the normal spin rate, with a higher share of Bloom Super and Bloom Epic.",
    raid: "One boosted spin with live lotuses: a reel opens its lotus from its middle row alone.",
    mystery: "A mystery entry: 50% no feature, 40% Bloom Super, 10% Bloom Epic.",
  },
  rules: {
    ...en.rules,
    intro:
      "Paradise Bloom is a 5x5 cluster game with tumbling wins. A cluster is 5 or more matching symbols connected horizontally or vertically. The theoretical RTP of every mode is 96.00%. The maximum win is 25,000x the play amount in every mode.",
    payTitle: "Symbol wins",
    ways:
      "Every cluster of 5 or more matching symbols wins the value shown for its size. Winning symbols disappear, the symbols above fall down and new ones drop in; this repeats while new clusters form. There are no wild symbols. Bloom Gate symbols trigger free spins.",
    controls: [
      ["Spin", "Starts a round at the shown play amount. The space bar does the same."],
      ["Play amount ▲ ▼", "Raises or lowers the play amount through the available levels."],
      ["Feature button", "Opens the feature menu. Every feature asks for confirmation and shows its play amount first."],
      ["Disable", "Turns an active mode off and returns to the normal spin."],
      ["Autoplay", "Opens the autoplay panel: choose the number of spins and press Start. Press the spin button to stop."],
      ["Turbo ⚡", "Speeds up the animations."],
      ["Menu ☰", "Opens Info (these rules), the sound volume and the music volume."],
      ["Close ✕", "Closes the open menu or information panel. Clicking outside a menu also closes it."],
      ["Replay: Play / Play again", "Play starts the loaded replay. Play again watches the same round again. Replay controls never start a new round."],
      ["Press to continue", "The bonus start and Total Win screens wait for a click or key. Any click or key also skips a win screen."],
    ],
    general: [
      "All wins and winning combinations are shown according to the symbol wins table.",
      GENERAL_GAME_DISCLAIMER,
    ],
  },
};

function dictionary(): Dict {
  if (lang === "en") return en;
  if (lang === "ru") return ru;
  const { introDescriptions, freeSpinsN, ...translated } = TRANSLATIONS[lang];
  return {
    ...en,
    ...translated,
    freeSpinsN: (n) => freeSpinsN.replace("{n}", String(n)),
    intro: {
      epic: [en.intro.epic[0], introDescriptions[0]],
      chest: [en.intro.chest[0], introDescriptions[1]],
      max: [en.intro.max[0], introDescriptions[2]],
    },
  };
}

syncLanguage();
const base = dictionary();
/** Social sessions always use complete English text, including accessibility labels. */
export const t = new Proxy(base, {
  get(target, key: keyof Dict) {
    if (social) return key in socialEn ? (socialEn as Dict)[key] : en[key];
    return target[key];
  },
}) as Dict;
