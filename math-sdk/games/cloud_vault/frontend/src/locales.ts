import type { Dict } from "./i18n";

export const SUPPORTED_LANGUAGES = ["ar", "de", "en", "es", "fi", "fr", "hi", "id", "ja", "ko", "pl", "pt", "ru", "tr", "zh", "vi", "da"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
type NewLanguage = Exclude<Language, "en" | "ru">;
type LocalizedData = Omit<Dict, "totalWin" | "bigWin" | "megaWin" | "epicWin" | "maxWin" | "mysteryResult" | "intro" | "freeSpinsN"> & {
  introDescriptions: [string, string, string];
  freeSpinsN: string;
};

// Graphical win titles and all bonus names remain in their original language.
export const TRANSLATIONS: Record<NewLanguage, LocalizedData> = {
  "ar": {
    "recovery": {"title": "جولة غير مكتملة", "message": "بدأت هذه الجولة بالفعل. تابعها دون خصم آخر من الرصيد.", "resume": "متابعة الجولة", "errorTitle": "تحقق من الاتصال", "error": "تعذر تأكيد حالة الجولة. أعد التحميل لمزامنة رصيدك وإكمال أي جولة غير مكتملة قبل بدء أخرى.", "reload": "إعادة التحميل"},
    "balance": "الرصيد",
    "win": "الربح",
    "bet": "الرهان",
    "increaseAmount": "زيادة المبلغ",
    "decreaseAmount": "تقليل المبلغ",
    "freeSpins": "دورات مجانية",
    "tapToContinue": "اضغط للمتابعة",
    "disable": "إيقاف",
    "activate": "تفعيل",
    "buy": "شراء",
    "confirm": "تأكيد",
    "info": "معلومات",
    "close": "إغلاق",
    "effectsVolume": "مستوى صوت المؤثرات",
    "musicVolume": "مستوى صوت الموسيقى",
    "muteEffects": "كتم المؤثرات",
    "unmuteEffects": "تشغيل المؤثرات",
    "muteMusic": "كتم الموسيقى",
    "unmuteMusic": "تشغيل الموسيقى",
    "audioCredit": "موسيقى ومؤثرات صوتية أصلية — Paradise Bloom.",
    "autoplay": "اللعب التلقائي",
    "autoStart": "بدء",
    "autoStop": "إيقاف اللعب التلقائي",
    "spins": "دورات",
    "insufficient": "الرصيد غير كافٍ.",
    "amountUnavailable": "لم يعد هذا الرهان متاحًا. اختر مبلغًا مسموحًا باستخدام سهمي الأعلى والأسفل.",
    "sessionExpired": "انتهت الجلسة. افتح اللعبة من جديد.",
    "limits": "تم بلوغ حد اللعب.",
    "connection": "مشكلة في الاتصال. حاول مجددًا.",
    "connectFail": "تعذر الاتصال بخادم اللعبة.",
    "loading": "جارٍ التحميل…",
    "replay": "إعادة العرض",
    "playReplay": "عرض",
    "playing": "جارٍ العرض…",
    "replayAgain": "شاهد مجددًا",
    "realCost": "التكلفة الإجمالية",
    "noFeature": "دون ميزة",
    "freeSpinsN": "{n} دورات مجانية",
    "minimum": "الحد الأدنى",
    "spin": "تدوير",
    "features": "الميزات",
    "menu": "القائمة",
    "turbo": "تسريع",
    "modeStats": "RTP 96.00%، الحد الأقصى للربح 25000x.",
    "introDescriptions": [
      "زهرة لوتس ذهبية تحت كل بكرة",
      "اربح في صفوف البكرة لفتح زهرتها",
      "تُضرب مضاعفات الزهور المفتوحة معًا. اربح حتى 25000x!"
    ],
    "featureSub": {
      "bonus": "اربح في الصفوف الخمسة للبكرة لفتح زهرتها",
      "super": "اربح في الصفوف الخمسة — كل زهرة مفتوحة بقيمة 5x على الأقل",
      "epic": "اربح في الصفوف الوسطى الثلاثة — كل زهرة مفتوحة بقيمة 5x على الأقل"
    },
    "modeText": {
      "extra_chance": "تكلفة كل دورة 3x. تبدأ الدورات المجانية في نحو 1.6404% من الدورات، بمعدل 4.51 أضعاف المعدل العادي.",
      "super_chance": "تكلفة كل دورة 6x. تبدأ الدورات المجانية في نحو 1.9386% من الدورات، بمعدل 5.33 أضعاف المعدل العادي، مع نسبة أعلى من Bloom Super وBloom Epic.",
      "raid": "دورة معززة واحدة مع زهور نشطة. يكفي الربح في الصف الأوسط للبكرة لفتح زهرتها.",
      "storm": "دورة معززة خاصة واحدة مع زهور نشطة. قيمة كل زهرة مفتوحة 5x على الأقل.",
      "bonus": "10 دورات مجانية. تفتح الزهرة بعد الربح في الصفوف الخمسة لبكرتها.",
      "super": "10 دورات مجانية. قيمة كل زهرة مفتوحة 5x على الأقل.",
      "mystery": "تُسحب النتيجة عند الدخول: 50% دون ميزة، و40% Bloom Super، و10% Bloom Epic."
    },
    "rules": {
      "title": "قواعد اللعبة",
      "intro": "Paradise Bloom لعبة مجموعات على شبكة 5x5 مع أرباح متتابعة عند سقوط الرموز. تتكون المجموعة من 5 رموز متطابقة على الأقل متصلة أفقيًا أو عموديًا. نسبة RTP النظرية في جميع الأوضاع 96.00%. الحد الأقصى للربح في جميع الأوضاع هو 25000 ضعف الرهان.",
      "payTitle": "جدول الأرباح",
      "waysTitle": "كيف تتكون الأرباح",
      "ways": "تمنح كل مجموعة من 5 رموز متطابقة أو أكثر القيمة الموضحة في الجدول حسب حجمها. تختفي الرموز الرابحة، وتسقط الرموز فوقها وتصل رموز جديدة. يستمر ذلك ما دامت تتكون مجموعات رابحة جديدة. لا توجد رموز بديلة. لا يمنح Bloom Gate ربحًا مباشرًا، بل يبدأ الدورات المجانية.",
      "featTitle": "الميزات",
      "chestsTitle": "زهور اللوتس",
      "chests": [
        "توجد زهرة لوتس ذهبية تحت كل بكرة. تنشط الزهور في Bloom Raid وStorm Raid وكل جولات الدورات المجانية، ولا تنشط في اللعبة الأساسية.",
        "يُعد صف البكرة رابحًا عندما يكون رمزه جزءًا من مجموعة رابحة. تبقى الصفوف الرابحة محفوظة عبر سقوط الرموز والدورات المجانية حتى نهاية الجولة. تفتح الزهرة بعد تحقيق الربح في الصفوف التي يتطلبها الوضع.",
        "في نهاية الميزة تكشف كل زهرة مفتوحة عن 2x أو 3x أو 4x أو 5x أو 6x أو 7x أو 8x أو 9x أو 10x أو 25x أو 50x أو 100x. تُضرب المضاعفات معًا؛ مثلًا 5x و3x و2x تعطي 30x. تُحسب الزهرة المغلقة بقيمة 1x.",
        "في الدورات المجانية، يطبق مضاعف الزهور المشترك على مجموع أرباح الدورات المجانية فقط. يُضاف ربح الدورة التي بدأت الميزة بشكل منفصل ولا تضاعفه الزهور. في Bloom Raid وStorm Raid، يطبق المضاعف على ربح الدورة الوحيدة للوضع، بما يشمل جميع مراحل سقوط الرموز فيها."
      ],
      "halo": [
        "ظهور 3 أو 4 أو 5 رموز Bloom Gate يبدأ Bloom Bonus أو Bloom Super أو Bloom Epic على الترتيب، مع 10 دورات مجانية لكل منها. كل Bloom Gate يظهر أثناء الدورات المجانية يضيف دورة مجانية واحدة.",
        "في Bloom Bonus وBloom Super يجب الربح في الصفوف الخمسة للبكرة لفتح الزهرة. في Bloom Epic تكفي الصفوف الوسطى الثلاثة. في Bloom Super وBloom Epic وStorm Raid تكون قيمة كل زهرة مفتوحة 5x على الأقل."
      ],
      "mystery": "يحدد MYSTERY النتيجة عند الدخول: 50% دون ميزة، و40% Bloom Super، و10% Bloom Epic.",
      "modesTitle": "الأوضاع",
      "controlsTitle": "عناصر التحكم",
      "controls": [
        [
          "تدوير",
          "يبدأ جولة بالرهان المعروض. يؤدي مفتاح المسافة الوظيفة نفسها."
        ],
        [
          "الرهان ▲ ▼",
          "يرفع الرهان أو يخفضه ضمن المستويات المسموح بها."
        ],
        [
          "زر الميزات",
          "يفتح قائمة الميزات. تعرض كل ميزة تكلفتها وتطلب التأكيد قبل البدء."
        ],
        [
          "إيقاف",
          "يوقف الوضع النشط ويعيد الدورة العادية."
        ],
        [
          "اللعب التلقائي",
          "اختر عدد الدورات واضغط بدء. زر التدوير يوقف اللعب التلقائي."
        ],
        [
          "تسريع ⚡",
          "يسرع الرسوم المتحركة."
        ],
        [
          "القائمة ☰",
          "تفتح المعلومات ومستوى صوت المؤثرات والموسيقى."
        ],
        [
          "إغلاق ✕",
          "يغلق القائمة أو القواعد. الضغط خارج القائمة يغلقها أيضًا."
        ],
        [
          "إعادة العرض: عرض / شاهد مجددًا",
          "يعرض الجولة المحملة نفسها ولا يبدأ جولة جديدة."
        ],
        [
          "اضغط للمتابعة",
          "تنتظر بداية المكافأة وشاشة Total Win ضغطة أو مفتاحًا. ويمكن تجاوز شاشات الربح بالطريقة نفسها."
        ]
      ],
      "generalTitle": "أحكام عامة",
      "general": [
        "تتبع جميع الأرباح والتركيبات الرابحة جدول الأرباح.",
        "أي خلل يلغي جميع الأرباح وعمليات اللعب.",
        "يلزم اتصال ثابت بالإنترنت. بعد انقطاع الاتصال، أعد تحميل اللعبة لإكمال الجولات المعلقة. يبقى رهان الجولة غير المكتملة محفوظًا حتى اكتمالها.",
        "يُحسب العائد المتوقع على عدد كبير من مرات اللعب.",
        "العرض توضيحي فقط ولا يمثل جهازًا ماديًا حقيقيًا.",
        "تُسوى الأرباح بحسب المبلغ المستلم من Remote Game Server، وليس بحسب أحداث المتصفح.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "رابط إعادة العرض غير مكتمل.",
      "unavailable": "إعادة العرض غير متاحة.",
      "notFound": "لم يتم العثور على إعادة العرض.",
      "invalid": "بيانات إعادة العرض غير صالحة.",
      "insecure": "يلزم اتصال آمن لإعادة العرض."
    }
  },
  "da": {
    "recovery": {"title": "Uafsluttet runde", "message": "Denne runde er allerede startet. Fortsæt uden endnu et fradrag fra saldoen.", "resume": "Fortsæt runden", "errorTitle": "Kontrollér forbindelsen", "error": "Rundens status kunne ikke bekræftes. Genindlæs for at opdatere saldoen og afslutte uafsluttede runder, før du starter en ny.", "reload": "Genindlæs"},
    "balance": "Saldo",
    "win": "Gevinst",
    "bet": "Indsats",
    "increaseAmount": "Forøg beløb",
    "decreaseAmount": "Sænk beløb",
    "freeSpins": "Gratis spins",
    "tapToContinue": "Tryk for at fortsætte",
    "disable": "Deaktivér",
    "activate": "Aktivér",
    "buy": "Køb",
    "confirm": "Bekræft",
    "info": "Info",
    "close": "Luk",
    "effectsVolume": "Lydstyrke for effekter",
    "musicVolume": "Musiklydstyrke",
    "muteEffects": "Slå effekter fra",
    "unmuteEffects": "Slå effekter til",
    "muteMusic": "Slå musik fra",
    "unmuteMusic": "Slå musik til",
    "audioCredit": "Original musik og lyd — Paradise Bloom.",
    "autoplay": "Autospil",
    "autoStart": "Start",
    "autoStop": "Stop autospil",
    "spins": "spins",
    "insufficient": "Saldoen er for lav.",
    "amountUnavailable": "Denne indsats er ikke længere tilgængelig. Vælg et tilladt beløb med pilene.",
    "sessionExpired": "Sessionen er udløbet. Åbn spillet igen.",
    "limits": "Spilgrænsen er nået.",
    "connection": "Forbindelsesproblem. Prøv igen.",
    "connectFail": "Kunne ikke oprette forbindelse til spilserveren.",
    "loading": "Indlæser…",
    "replay": "Genafspilning",
    "playReplay": "Afspil",
    "playing": "Afspiller…",
    "replayAgain": "Se igen",
    "realCost": "Samlet pris",
    "noFeature": "Ingen funktion",
    "freeSpinsN": "{n} gratis spins",
    "minimum": "mindst",
    "spin": "Spin",
    "features": "Funktioner",
    "menu": "Menu",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, maksimal gevinst 25000x.",
    "introDescriptions": [
      "En gylden lotus under hvert hjul",
      "Vind på et hjuls rækker for at åbne dets lotus",
      "Åbne lotusser ganges sammen. Vind op til 25000x!"
    ],
    "featureSub": {
      "bonus": "Vind på alle 5 rækker på et hjul for at åbne dets lotus",
      "super": "Vind på alle 5 rækker — hver åben lotus er mindst 5x",
      "epic": "Vind på de 3 midterste rækker — hver åben lotus er mindst 5x"
    },
    "modeText": {
      "extra_chance": "Hvert spin koster 3x. Gratis spins udløses på cirka 1.6404% af alle spins, 4.51 gange så ofte som normalt.",
      "super_chance": "Hvert spin koster 6x. Gratis spins udløses på cirka 1.9386% af alle spins, 5.33 gange så ofte som normalt, med en større andel Bloom Super og Bloom Epic.",
      "raid": "Ét forstærket spin med aktive lotusser. Gevinst på hjulets midterste række er nok til at åbne dets lotus.",
      "storm": "Ét ekstra forstærket spin med aktive lotusser. Hver åben lotus er mindst 5x.",
      "bonus": "10 gratis spins. En lotus åbner, når alle hjulets 5 rækker har vundet.",
      "super": "10 gratis spins. Hver åben lotus er mindst 5x.",
      "mystery": "Resultatet trækkes ved start: 50% ingen funktion, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Spilleregler",
      "intro": "Paradise Bloom er et 5x5-klyngespil med kaskadegevinster. En klynge består af mindst 5 ens symboler, der er forbundet vandret eller lodret. Teoretisk RTP er 96.00% i alle tilstande. Maksimal gevinst er 25000 gange indsatsen i alle tilstande.",
      "payTitle": "Gevinsttabel",
      "waysTitle": "Sådan dannes gevinster",
      "ways": "Hver klynge med mindst 5 ens symboler giver tabellens værdi for sin størrelse. Gevinstsymboler forsvinder, symbolerne ovenover falder ned, og nye kommer til. Det fortsætter, så længe der dannes nye gevinstklynger. Der er ingen wild-symboler. Bloom Gate giver ingen symbolgevinst, men udløser gratis spins.",
      "featTitle": "Funktioner",
      "chestsTitle": "Lotusser",
      "chests": [
        "En gylden lotus sidder under hvert hjul. Lotusser er aktive i Bloom Raid, Storm Raid og alle runder med gratis spins, aldrig i grundspillet.",
        "En række på et hjul er vundet, når dens symbol indgår i en gevinstklynge. Vundne rækker gemmes gennem kaskader og gratis spins indtil rundens afslutning. Når de rækker, tilstanden kræver, har vundet, åbner lotussen.",
        "Ved funktionens slutning viser hver åben lotus 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x eller 100x. Multiplikatorerne ganges sammen: 5x, 3x og 2x giver 30x. En lukket lotus tæller som 1x.",
        "Ved gratis spins gælder den samlede multiplikator kun den samlede gevinst fra de gratis spins. Gevinsten fra det udløsende spin lægges til separat og ganges ikke med lotusserne. I Bloom Raid og Storm Raid ganges gevinsten fra tilstandens ene spin, inklusive kaskader."
      ],
      "halo": [
        "3, 4 eller 5 Bloom Gate-symboler udløser henholdsvis Bloom Bonus, Bloom Super eller Bloom Epic, hver med 10 gratis spins. Hvert Bloom Gate under gratis spins tilføjer 1 gratis spin.",
        "Bloom Bonus og Bloom Super kræver gevinst på alle 5 rækker på et hjul. I Bloom Epic er de 3 midterste rækker nok. I Bloom Super, Bloom Epic og Storm Raid er hver åben lotus mindst 5x."
      ],
      "mystery": "MYSTERY trækker resultatet ved start: 50% ingen funktion, 40% Bloom Super og 10% Bloom Epic.",
      "modesTitle": "Tilstande",
      "controlsTitle": "Betjening",
      "controls": [
        [
          "Spin",
          "Starter en runde med den viste indsats. Mellemrumstasten gør det samme."
        ],
        [
          "Indsats ▲ ▼",
          "Hæver eller sænker indsatsen gennem de tilladte niveauer."
        ],
        [
          "Funktionsknap",
          "Åbner funktionsmenuen. Hver funktion viser først prisen og beder om bekræftelse."
        ],
        [
          "Deaktivér",
          "Slår den aktive tilstand fra og vender tilbage til almindelige spins."
        ],
        [
          "Autospil",
          "Vælg antal spins og tryk Start. Spinknappen stopper autospil."
        ],
        [
          "Turbo ⚡",
          "Gør animationerne hurtigere."
        ],
        [
          "Menu ☰",
          "Åbner Info og lydstyrken for effekter og musik."
        ],
        [
          "Luk ✕",
          "Lukker menuen eller reglerne. Klik udenfor lukker også menuer."
        ],
        [
          "Genafspilning: Afspil / Se igen",
          "Afspiller den samme indlæste runde uden at starte en ny."
        ],
        [
          "Tryk for at fortsætte",
          "Bonusstart og Total Win venter på et klik eller tastetryk. Det springer også gevinstskærme over."
        ]
      ],
      "generalTitle": "Generelt",
      "general": [
        "Alle gevinster og gevinstkombinationer følger gevinsttabellen.",
        "Fejlfunktion annullerer alle gevinster og spil.",
        "En stabil internetforbindelse kræves. Genindlæs efter afbrydelse for at afslutte åbne runder. Indsatsen i en åben runde bevares, indtil runden er afsluttet.",
        "Det forventede afkast beregnes over mange spil.",
        "Visningen forestiller ikke en virkelig fysisk enhed og er kun illustrativ.",
        "Gevinster afgøres af beløbet fra Remote Game Server og ikke af hændelser i browseren.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Linket til genafspilning er ufuldstændigt.",
      "unavailable": "Genafspilning er ikke tilgængelig.",
      "notFound": "Genafspilning blev ikke fundet.",
      "invalid": "Data til genafspilning er ugyldige.",
      "insecure": "Genafspilning kræver en sikker forbindelse."
    }
  },
  "de": {
    "recovery": {"title": "Unvollendete Runde", "message": "Diese Runde wurde bereits gestartet. Setze sie ohne erneuten Abzug vom Guthaben fort.", "resume": "Runde fortsetzen", "errorTitle": "Verbindung prüfen", "error": "Der Rundenstatus konnte nicht bestätigt werden. Lade das Spiel neu, um das Guthaben abzugleichen und offene Runden vor einer neuen Runde abzuschließen.", "reload": "Neu laden"},
    "balance": "Guthaben",
    "win": "Gewinn",
    "bet": "Einsatz",
    "increaseAmount": "Betrag erhöhen",
    "decreaseAmount": "Betrag verringern",
    "freeSpins": "Freispiele",
    "tapToContinue": "Zum Fortfahren drücken",
    "disable": "Deaktivieren",
    "activate": "Aktivieren",
    "buy": "Kaufen",
    "confirm": "Bestätigen",
    "info": "Info",
    "close": "Schließen",
    "effectsVolume": "Effektlautstärke",
    "musicVolume": "Musiklautstärke",
    "muteEffects": "Effekte stummschalten",
    "unmuteEffects": "Effekte einschalten",
    "muteMusic": "Musik stummschalten",
    "unmuteMusic": "Musik einschalten",
    "audioCredit": "Originalmusik und Sound — Paradise Bloom.",
    "autoplay": "Autospiel",
    "autoStart": "Start",
    "autoStop": "Autospiel stoppen",
    "spins": "Drehungen",
    "insufficient": "Nicht genügend Guthaben.",
    "amountUnavailable": "Dieser Einsatz ist nicht mehr verfügbar. Wähle mit den Pfeilen einen verfügbaren Betrag.",
    "sessionExpired": "Sitzung abgelaufen — öffne das Spiel erneut.",
    "limits": "Spiellimit erreicht.",
    "connection": "Verbindungsproblem — bitte erneut versuchen.",
    "connectFail": "Verbindung zum Spielserver fehlgeschlagen.",
    "loading": "Wird geladen…",
    "replay": "Wiederholung",
    "playReplay": "Abspielen",
    "playing": "Wird abgespielt…",
    "replayAgain": "Erneut ansehen",
    "realCost": "Gesamtkosten",
    "noFeature": "Kein Feature",
    "freeSpinsN": "{n} Freispiele",
    "minimum": "mindestens",
    "spin": "Drehen",
    "features": "Features",
    "menu": "Menü",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, Höchstgewinn 25000x.",
    "introDescriptions": [
      "Ein goldener Lotus unter jeder Walze",
      "Gewinne in den Reihen einer Walze, um ihren Lotus zu öffnen",
      "Offene Lotusblüten werden miteinander multipliziert. Gewinne bis zu 25000x!"
    ],
    "featureSub": {
      "bonus": "Gewinne in allen 5 Reihen einer Walze, um ihren Lotus zu öffnen",
      "super": "Gewinne in allen 5 Reihen — jeder offene Lotus mindestens 5x",
      "epic": "Gewinne in den 3 mittleren Reihen — jeder offene Lotus mindestens 5x"
    },
    "modeText": {
      "extra_chance": "Jede Drehung kostet 3x. Freispiele starten bei etwa 1.6404% der Drehungen, 4.51-mal so häufig wie im Normalmodus.",
      "super_chance": "Jede Drehung kostet 6x. Freispiele starten bei etwa 1.9386% der Drehungen, 5.33-mal so häufig wie im Normalmodus, mit einem höheren Anteil an Bloom Super und Bloom Epic.",
      "raid": "Eine verstärkte Drehung mit aktiven Lotusblüten: Die mittlere Reihe allein öffnet den Lotus einer Walze.",
      "storm": "Eine besonders verstärkte Drehung mit aktiven Lotusblüten. Jeder offene Lotus hat mindestens 5x.",
      "bonus": "10 Freispiele. Ein Lotus öffnet sich, wenn alle 5 Reihen seiner Walze gewonnen haben.",
      "super": "10 Freispiele. Jeder offene Lotus hat mindestens 5x.",
      "mystery": "Das Ergebnis wird beim Eintritt bestimmt: 50% kein Feature, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Spielregeln",
      "intro": "Paradise Bloom ist ein 5x5-Clusterspiel mit Gewinnkaskaden. Ein Cluster besteht aus mindestens 5 gleichen Symbolen, die waagerecht oder senkrecht verbunden sind. Der theoretische RTP beträgt in jedem Modus 96.00%. Der Höchstgewinn beträgt in jedem Modus das 25000-Fache des Einsatzes.",
      "payTitle": "Gewinntabelle",
      "waysTitle": "So entstehen Gewinne",
      "ways": "Jeder Cluster aus mindestens 5 gleichen Symbolen zahlt den Tabellenwert für seine Größe. Gewinnsymbole verschwinden, Symbole darüber fallen nach und neue kommen hinzu. Dies wiederholt sich, solange neue Gewinncluster entstehen. Es gibt keine Wild-Symbole. Bloom Gate zahlt nicht, sondern löst Freispiele aus.",
      "featTitle": "Features",
      "chestsTitle": "Lotusblüten",
      "chests": [
        "Unter jeder Walze sitzt ein goldener Lotus. Lotusblüten sind in Bloom Raid, Storm Raid und allen Freispielrunden aktiv, nie im Basisspiel.",
        "Eine Reihe einer Walze zählt als gewonnen, wenn ihr Symbol Teil eines Gewinnclusters ist. Gewonnene Reihen bleiben über alle Kaskaden und Freispiele bis zum Rundenende gespeichert. Sobald die für den Modus benötigten Reihen gewonnen haben, öffnet sich der Lotus.",
        "Am Feature-Ende zeigt jeder offene Lotus 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x oder 100x. Die Multiplikatoren werden miteinander multipliziert: 5x, 3x und 2x ergeben 30x. Ein geschlossener Lotus zählt als 1x.",
        "Bei Freispielen gilt der gemeinsame Lotusmultiplikator nur für den gesamten Freispielgewinn. Der Gewinn der auslösenden Drehung wird separat addiert und nicht durch Lotusblüten multipliziert. In Bloom Raid und Storm Raid gilt der Multiplikator für den Gewinn der einzelnen Drehung einschließlich ihrer Kaskaden."
      ],
      "halo": [
        "3, 4 oder 5 Bloom Gate-Symbole starten Bloom Bonus, Bloom Super bzw. Bloom Epic mit jeweils 10 Freispielen. Jedes Bloom Gate, das während der Freispiele landet, fügt 1 Freispiel hinzu.",
        "In Bloom Bonus und Bloom Super müssen alle 5 Reihen einer Walze gewinnen. In Bloom Epic genügen die 3 mittleren Reihen. In Bloom Super, Bloom Epic und Storm Raid hat jeder offene Lotus mindestens 5x."
      ],
      "mystery": "MYSTERY bestimmt beim Eintritt das Ergebnis: 50% kein Feature, 40% Bloom Super und 10% Bloom Epic.",
      "modesTitle": "Modi",
      "controlsTitle": "Steuerung",
      "controls": [
        [
          "Drehen",
          "Startet eine Runde mit dem angezeigten Einsatz. Die Leertaste tut dasselbe."
        ],
        [
          "Einsatz ▲ ▼",
          "Erhöht oder verringert den Einsatz innerhalb der verfügbaren Stufen."
        ],
        [
          "Feature-Taste",
          "Öffnet das Feature-Menü. Jedes Feature zeigt zuerst seine Kosten und verlangt eine Bestätigung."
        ],
        [
          "Deaktivieren",
          "Schaltet den aktiven Modus aus und kehrt zur normalen Drehung zurück."
        ],
        [
          "Autospiel",
          "Anzahl der Drehungen wählen und Start drücken. Die Drehtaste stoppt das Autospiel."
        ],
        [
          "Turbo ⚡",
          "Beschleunigt die Animationen."
        ],
        [
          "Menü ☰",
          "Öffnet Info sowie die Lautstärke für Effekte und Musik."
        ],
        [
          "Schließen ✕",
          "Schließt das Menü oder die Regeln. Menüs schließen sich auch durch einen Klick außerhalb."
        ],
        [
          "Wiederholung: Abspielen / Erneut ansehen",
          "Spielt dieselbe geladene Runde ab. Diese Tasten starten keine neue Runde."
        ],
        [
          "Zum Fortfahren drücken",
          "Bonusstart und Total Win warten auf einen Klick oder Tastendruck. Gewinnanzeigen lassen sich ebenfalls damit überspringen."
        ]
      ],
      "generalTitle": "Allgemeines",
      "general": [
        "Alle Gewinne und Gewinnkombinationen richten sich nach der Gewinntabelle.",
        "Bei Fehlfunktion sind alle Gewinne und Spiele ungültig.",
        "Eine stabile Internetverbindung ist erforderlich. Nach einer Unterbrechung das Spiel neu laden, um offene Runden abzuschließen. Der Einsatz einer offenen Runde bleibt bis zu ihrem Abschluss erhalten.",
        "Der erwartete Rückzahlungswert wird über viele Spiele berechnet.",
        "Die Darstellung bildet kein echtes physisches Gerät ab und dient nur der Illustration.",
        "Maßgeblich für Gewinne ist der vom Remote Game Server empfangene Betrag, nicht das Geschehen im Browser.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Der Wiederholungslink ist unvollständig.",
      "unavailable": "Wiederholung nicht verfügbar.",
      "notFound": "Wiederholung nicht gefunden.",
      "invalid": "Ungültige Wiederholungsdaten.",
      "insecure": "Wiederholungen erfordern eine sichere Verbindung."
    }
  },
  "es": {
    "recovery": {"title": "Ronda pendiente", "message": "Esta ronda ya comenzó. Continúa sin otro descuento del saldo.", "resume": "Continuar ronda", "errorTitle": "Comprueba la conexión", "error": "No se pudo confirmar el estado de la ronda. Recarga para sincronizar el saldo y terminar cualquier ronda pendiente antes de empezar otra.", "reload": "Recargar"},
    "balance": "Saldo",
    "win": "Ganancia",
    "bet": "Apuesta",
    "increaseAmount": "Aumentar importe",
    "decreaseAmount": "Reducir importe",
    "freeSpins": "Giros gratis",
    "tapToContinue": "Pulsa para continuar",
    "disable": "Desactivar",
    "activate": "Activar",
    "buy": "Comprar",
    "confirm": "Confirmar",
    "info": "Información",
    "close": "Cerrar",
    "effectsVolume": "Volumen de efectos",
    "musicVolume": "Volumen de música",
    "muteEffects": "Silenciar efectos",
    "unmuteEffects": "Activar efectos",
    "muteMusic": "Silenciar música",
    "unmuteMusic": "Activar música",
    "audioCredit": "Música y sonido originales — Paradise Bloom.",
    "autoplay": "Juego automático",
    "autoStart": "Iniciar",
    "autoStop": "Detener juego automático",
    "spins": "giros",
    "insufficient": "Saldo insuficiente.",
    "amountUnavailable": "Esta apuesta ya no está disponible. Elige un importe disponible con las flechas.",
    "sessionExpired": "La sesión ha caducado. Vuelve a abrir el juego.",
    "limits": "Se ha alcanzado el límite de juego.",
    "connection": "Problema de conexión. Inténtalo de nuevo.",
    "connectFail": "No se pudo conectar con el servidor del juego.",
    "loading": "Cargando…",
    "replay": "Repetición",
    "playReplay": "Ver",
    "playing": "Reproduciendo…",
    "replayAgain": "Ver de nuevo",
    "realCost": "Coste total",
    "noFeature": "Sin función",
    "freeSpinsN": "{n} giros gratis",
    "minimum": "mínimo",
    "spin": "Girar",
    "features": "Funciones",
    "menu": "Menú",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, ganancia máxima 25000x.",
    "introDescriptions": [
      "Un loto dorado bajo cada rodillo",
      "Gana en las filas de un rodillo para abrir su loto",
      "Los lotos abiertos se multiplican entre sí. ¡Gana hasta 25000x!"
    ],
    "featureSub": {
      "bonus": "Gana en las 5 filas de un rodillo para abrir su loto",
      "super": "Gana en las 5 filas: cada loto abierto vale al menos 5x",
      "epic": "Gana en las 3 filas centrales: cada loto abierto vale al menos 5x"
    },
    "modeText": {
      "extra_chance": "Cada giro cuesta 3x. Los giros gratis se activan en aproximadamente el 1.6404% de los giros, 4.51 veces más que en el modo normal.",
      "super_chance": "Cada giro cuesta 6x. Los giros gratis se activan en aproximadamente el 1.9386% de los giros, 5.33 veces más que en el modo normal, con mayor proporción de Bloom Super y Bloom Epic.",
      "raid": "Un giro potenciado con lotos activos: basta ganar en la fila central de un rodillo para abrir su loto.",
      "storm": "Un giro especialmente potenciado con lotos activos. Cada loto abierto vale al menos 5x.",
      "bonus": "10 giros gratis. Un loto se abre cuando sus 5 filas han ganado.",
      "super": "10 giros gratis. Cada loto abierto vale al menos 5x.",
      "mystery": "El resultado se decide al entrar: 50% sin función, 40% Bloom Super y 10% Bloom Epic."
    },
    "rules": {
      "title": "Reglas del juego",
      "intro": "Paradise Bloom es un juego de grupos de 5x5 con ganancias en cascada. Un grupo contiene al menos 5 símbolos iguales conectados horizontal o verticalmente. El RTP teórico es del 96.00% en todos los modos. La ganancia máxima es 25000 veces la apuesta en todos los modos.",
      "payTitle": "Tabla de pagos",
      "waysTitle": "Cómo se forman las ganancias",
      "ways": "Cada grupo de 5 o más símbolos iguales paga el valor indicado para su tamaño. Los símbolos ganadores desaparecen, los de arriba caen y aparecen otros nuevos. Esto se repite mientras se formen grupos ganadores. No hay símbolos comodín. Bloom Gate no paga; activa giros gratis.",
      "featTitle": "Funciones",
      "chestsTitle": "Lotos",
      "chests": [
        "Hay un loto dorado bajo cada rodillo. Los lotos están activos en Bloom Raid, Storm Raid y todas las rondas de giros gratis, nunca en el juego base.",
        "Una fila de un rodillo se considera ganada si su símbolo forma parte de un grupo ganador. Las filas ganadas se conservan durante las cascadas y los giros gratis hasta el final de la ronda. Al completar las filas exigidas por el modo, el loto se abre.",
        "Al terminar la función, cada loto abierto revela 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x o 100x. Los multiplicadores se multiplican entre sí: 5x, 3x y 2x dan 30x. Un loto cerrado cuenta como 1x.",
        "En los giros gratis, el multiplicador combinado se aplica solo a la ganancia total de esos giros. La ganancia del giro que los activó se suma por separado y no se multiplica con los lotos. En Bloom Raid y Storm Raid, se multiplica la ganancia del único giro del modo, incluidas sus cascadas."
      ],
      "halo": [
        "3, 4 o 5 símbolos Bloom Gate activan Bloom Bonus, Bloom Super o Bloom Epic, respectivamente, con 10 giros gratis cada uno. Cada Bloom Gate que cae durante los giros gratis añade 1 giro gratis.",
        "Bloom Bonus y Bloom Super necesitan ganar en las 5 filas de un rodillo para abrir su loto. En Bloom Epic bastan las 3 filas centrales. En Bloom Super, Bloom Epic y Storm Raid, cada loto abierto vale al menos 5x."
      ],
      "mystery": "MYSTERY decide el resultado al entrar: 50% sin función, 40% Bloom Super y 10% Bloom Epic.",
      "modesTitle": "Modos",
      "controlsTitle": "Controles",
      "controls": [
        [
          "Girar",
          "Inicia una ronda con la apuesta mostrada. La barra espaciadora hace lo mismo."
        ],
        [
          "Apuesta ▲ ▼",
          "Sube o baja la apuesta entre los niveles disponibles."
        ],
        [
          "Botón de funciones",
          "Abre el menú de funciones. Cada función muestra su coste y pide confirmación antes de comenzar."
        ],
        [
          "Desactivar",
          "Desactiva el modo actual y vuelve al giro normal."
        ],
        [
          "Juego automático",
          "Elige el número de giros y pulsa Iniciar. El botón de giro detiene el juego automático."
        ],
        [
          "Turbo ⚡",
          "Acelera las animaciones."
        ],
        [
          "Menú ☰",
          "Abre Información y los volúmenes de efectos y música."
        ],
        [
          "Cerrar ✕",
          "Cierra el menú o las reglas. Pulsar fuera también cierra los menús."
        ],
        [
          "Repetición: Ver / Ver de nuevo",
          "Reproduce la misma ronda cargada. Estos botones no inician una ronda nueva."
        ],
        [
          "Pulsa para continuar",
          "El inicio del bonus y Total Win esperan un clic o una tecla. También permiten saltar las pantallas de ganancia."
        ]
      ],
      "generalTitle": "General",
      "general": [
        "Todas las ganancias y combinaciones se muestran según la tabla de pagos.",
        "Un fallo de funcionamiento anula todas las ganancias y jugadas.",
        "Se necesita una conexión estable. Si se interrumpe, vuelve a cargar el juego para completar las rondas pendientes. La apuesta de una ronda pendiente se conserva hasta que termine.",
        "El retorno esperado se calcula sobre muchas jugadas.",
        "La representación no corresponde a un dispositivo físico real y solo es ilustrativa.",
        "Las ganancias se liquidan según el importe recibido del Remote Game Server, no según los eventos del navegador.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "El enlace de repetición está incompleto.",
      "unavailable": "Repetición no disponible.",
      "notFound": "No se encontró la repetición.",
      "invalid": "Los datos de la repetición no son válidos.",
      "insecure": "La repetición requiere una conexión segura."
    }
  },
  "fi": {
    "recovery": {"title": "Keskeneräinen kierros", "message": "Tämä kierros on jo alkanut. Jatka ilman uutta veloitusta saldosta.", "resume": "Jatka kierrosta", "errorTitle": "Tarkista yhteys", "error": "Kierroksen tilaa ei voitu vahvistaa. Lataa peli uudelleen saldon päivittämiseksi ja keskeneräisen kierroksen päättämiseksi ennen uutta kierrosta.", "reload": "Lataa uudelleen"},
    "balance": "Saldo",
    "win": "Voitto",
    "bet": "Panos",
    "increaseAmount": "Suurenna panosta",
    "decreaseAmount": "Pienennä panosta",
    "freeSpins": "Ilmaiskierrokset",
    "tapToContinue": "Jatka painamalla",
    "disable": "Poista käytöstä",
    "activate": "Ota käyttöön",
    "buy": "Osta",
    "confirm": "Vahvista",
    "info": "Ohjeet",
    "close": "Sulje",
    "effectsVolume": "Tehosteiden äänenvoimakkuus",
    "musicVolume": "Musiikin äänenvoimakkuus",
    "muteEffects": "Mykistä tehosteet",
    "unmuteEffects": "Ota tehosteäänet käyttöön",
    "muteMusic": "Mykistä musiikki",
    "unmuteMusic": "Ota musiikki käyttöön",
    "audioCredit": "Alkuperäinen musiikki ja äänet — Paradise Bloom.",
    "autoplay": "Automaattipeli",
    "autoStart": "Aloita",
    "autoStop": "Pysäytä automaattipeli",
    "spins": "kierrosta",
    "insufficient": "Saldo ei riitä.",
    "amountUnavailable": "Tämä panos ei ole enää käytettävissä. Valitse sallittu panos nuolilla.",
    "sessionExpired": "Istunto vanheni. Avaa peli uudelleen.",
    "limits": "Peliraja saavutettu.",
    "connection": "Yhteysongelma. Yritä uudelleen.",
    "connectFail": "Pelipalvelimeen ei saatu yhteyttä.",
    "loading": "Ladataan…",
    "replay": "Uusinta",
    "playReplay": "Katso",
    "playing": "Toistetaan…",
    "replayAgain": "Katso uudelleen",
    "realCost": "Kokonaiskustannus",
    "noFeature": "Ei toimintoa",
    "freeSpinsN": "{n} ilmaiskierrosta",
    "minimum": "vähintään",
    "spin": "Pyöräytä",
    "features": "Toiminnot",
    "menu": "Valikko",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, enimmäisvoitto 25000x.",
    "introDescriptions": [
      "Kultainen lootus jokaisen kelan alla",
      "Avaa lootus voittamalla sen kelan riveillä",
      "Avointen lootusten kertoimet kerrotaan keskenään. Voita jopa 25000x!"
    ],
    "featureSub": {
      "bonus": "Voita kelan kaikilla 5 rivillä avataksesi lootuksen",
      "super": "Voita kaikilla 5 rivillä — jokainen avoin lootus vähintään 5x",
      "epic": "Voita 3 keskimmäisellä rivillä — jokainen avoin lootus vähintään 5x"
    },
    "modeText": {
      "extra_chance": "Kierros maksaa 3x. Ilmaiskierrokset käynnistyvät noin 1.6404%:lla kierroksista, 4.51 kertaa tavallista useammin.",
      "super_chance": "Kierros maksaa 6x. Ilmaiskierrokset käynnistyvät noin 1.9386%:lla kierroksista, 5.33 kertaa tavallista useammin. Bloom Superin ja Bloom Epicin osuus on suurempi.",
      "raid": "Yksi tehostettu kierros aktiivisilla lootuksilla. Kelan keskimmäisen rivin voitto riittää avaamaan lootuksen.",
      "storm": "Yksi erityisen tehostettu kierros aktiivisilla lootuksilla. Jokainen avoin lootus on vähintään 5x.",
      "bonus": "10 ilmaiskierrosta. Lootus avautuu, kun sen kelan kaikki 5 riviä ovat voittaneet.",
      "super": "10 ilmaiskierrosta. Jokainen avoin lootus on vähintään 5x.",
      "mystery": "Tulos arvotaan alussa: 50% ei toimintoa, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Pelisäännöt",
      "intro": "Paradise Bloom on 5x5-ruudukon ryhmävoittopeli, jossa voitot jatkuvat putouksina. Ryhmässä on vähintään 5 samanlaista vaaka- tai pystysuunnassa yhdistyvää symbolia. Kaikkien tilojen teoreettinen RTP on 96.00% ja enimmäisvoitto 25000 kertaa panos.",
      "payTitle": "Voittotaulukko",
      "waysTitle": "Voittojen muodostuminen",
      "ways": "Vähintään 5 samanlaisen symbolin ryhmä maksaa kokonsa mukaisen taulukkoarvon. Voittosymbolit poistuvat, ylemmät putoavat ja uusia saapuu. Tätä jatkuu niin kauan kuin uusia voittoryhmiä syntyy. Wild-symboleja ei ole. Bloom Gate ei maksa voittoa, vaan käynnistää ilmaiskierrokset.",
      "featTitle": "Toiminnot",
      "chestsTitle": "Lootukset",
      "chests": [
        "Jokaisen kelan alla on kultainen lootus. Lootukset ovat aktiivisia Bloom Raidissa, Storm Raidissa ja kaikilla ilmaiskierroksilla, eivät peruspelissä.",
        "Kelan rivi voitetaan, kun sen symboli kuuluu voittoryhmään. Voitetut rivit säilyvät putousten ja ilmaiskierrosten ajan kierroksen loppuun asti. Lootus avautuu, kun tilan edellyttämät rivit ovat voittaneet.",
        "Toiminnon lopussa jokainen avoin lootus paljastaa kertoimen 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x tai 100x. Kertoimet kerrotaan keskenään: 5x, 3x ja 2x antavat 30x. Suljettu lootus on 1x.",
        "Ilmaiskierroksilla yhteiskerroin koskee vain ilmaiskierrosten kokonaisvoittoa. Käynnistäneen kierroksen voitto lisätään erikseen, eikä lootuksilla kerrota sitä. Bloom Raidissa ja Storm Raidissa kerrotaan tilan yhden kierroksen voitto putouksineen."
      ],
      "halo": [
        "3, 4 tai 5 Bloom Gate -symbolia käynnistää vastaavasti Bloom Bonusin, Bloom Superin tai Bloom Epicin. Jokainen antaa 10 ilmaiskierrosta. Ilmaiskierroksilla laskeutuva Bloom Gate lisää 1 ilmaiskierroksen.",
        "Bloom Bonusissa ja Bloom Superissa kelan kaikkien 5 rivin on voitettava lootuksen avaamiseksi. Bloom Epicissä riittävät 3 keskimmäistä riviä. Bloom Superissa, Bloom Epicissä ja Storm Raidissa jokainen avoin lootus on vähintään 5x."
      ],
      "mystery": "MYSTERY arpoo alussa tuloksen: 50% ei toimintoa, 40% Bloom Super ja 10% Bloom Epic.",
      "modesTitle": "Pelitilat",
      "controlsTitle": "Ohjaimet",
      "controls": [
        [
          "Pyöräytä",
          "Aloittaa kierroksen näkyvällä panoksella. Välilyönti toimii samoin."
        ],
        [
          "Panos ▲ ▼",
          "Vaihtaa panosta sallittujen tasojen välillä."
        ],
        [
          "Toimintopainike",
          "Avaa toimintovalikon. Jokainen toiminto näyttää ensin hinnan ja pyytää vahvistuksen."
        ],
        [
          "Poista käytöstä",
          "Poistaa aktiivisen tilan ja palauttaa tavallisen kierroksen."
        ],
        [
          "Automaattipeli",
          "Valitse kierrosmäärä ja Aloita. Pyöräytyspainike pysäyttää automaattipelin."
        ],
        [
          "Turbo ⚡",
          "Nopeuttaa animaatioita."
        ],
        [
          "Valikko ☰",
          "Avaa ohjeet sekä tehosteiden ja musiikin äänenvoimakkuudet."
        ],
        [
          "Sulje ✕",
          "Sulkee valikon tai ohjeet. Valikot sulkeutuvat myös painamalla niiden ulkopuolelle."
        ],
        [
          "Uusinta: Katso / Katso uudelleen",
          "Toistaa saman ladatun kierroksen aloittamatta uutta kierrosta."
        ],
        [
          "Jatka painamalla",
          "Bonuksen alku ja Total Win odottavat painallusta. Painallus ohittaa myös voittonäytön."
        ]
      ],
      "generalTitle": "Yleistä",
      "general": [
        "Voitot ja voittoyhdistelmät määräytyvät voittotaulukon mukaan.",
        "Toimintahäiriö mitätöi kaikki voitot ja pelit.",
        "Vakaa internetyhteys vaaditaan. Katkon jälkeen lataa peli uudelleen keskeneräisten kierrosten päättämiseksi. Keskeneräisen kierroksen panos säilyy sen päättymiseen asti.",
        "Odotettu palautus lasketaan monen pelin perusteella.",
        "Näyttö ei vastaa todellista fyysistä laitetta, vaan on havainnollistava.",
        "Voitot ratkaisee Remote Game Serveriltä saatu summa, ei selaimen tapahtumat.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Uusintalinkki on puutteellinen.",
      "unavailable": "Uusinta ei ole käytettävissä.",
      "notFound": "Uusintaa ei löytynyt.",
      "invalid": "Uusinnan tiedot ovat virheelliset.",
      "insecure": "Uusinta vaatii suojatun yhteyden."
    }
  },
  "fr": {
    "recovery": {"title": "Manche inachevée", "message": "Cette manche a déjà commencé. Continuez sans nouvelle déduction du solde.", "resume": "Continuer la manche", "errorTitle": "Vérifiez la connexion", "error": "Impossible de confirmer l’état de la manche. Rechargez pour synchroniser le solde et terminer toute manche inachevée avant d’en commencer une autre.", "reload": "Recharger"},
    "balance": "Solde",
    "win": "Gain",
    "bet": "Mise",
    "increaseAmount": "Augmenter le montant",
    "decreaseAmount": "Réduire le montant",
    "freeSpins": "Tours gratuits",
    "tapToContinue": "Appuyez pour continuer",
    "disable": "Désactiver",
    "activate": "Activer",
    "buy": "Acheter",
    "confirm": "Confirmer",
    "info": "Informations",
    "close": "Fermer",
    "effectsVolume": "Volume des effets",
    "musicVolume": "Volume de la musique",
    "muteEffects": "Couper les effets",
    "unmuteEffects": "Activer les effets",
    "muteMusic": "Couper la musique",
    "unmuteMusic": "Activer la musique",
    "audioCredit": "Musique et sons originaux — Paradise Bloom.",
    "autoplay": "Jeu automatique",
    "autoStart": "Démarrer",
    "autoStop": "Arrêter le jeu automatique",
    "spins": "tours",
    "insufficient": "Solde insuffisant.",
    "amountUnavailable": "Cette mise n’est plus disponible. Choisissez un montant disponible avec les flèches.",
    "sessionExpired": "Session expirée — rouvrez le jeu.",
    "limits": "Limite de jeu atteinte.",
    "connection": "Problème de connexion — réessayez.",
    "connectFail": "Impossible de se connecter au serveur du jeu.",
    "loading": "Chargement…",
    "replay": "Rediffusion",
    "playReplay": "Voir",
    "playing": "Lecture…",
    "replayAgain": "Revoir",
    "realCost": "Coût total",
    "noFeature": "Aucune fonction",
    "freeSpinsN": "{n} tours gratuits",
    "minimum": "minimum",
    "spin": "Lancer",
    "features": "Fonctions",
    "menu": "Menu",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, gain maximal 25000x.",
    "introDescriptions": [
      "Un lotus doré sous chaque rouleau",
      "Gagnez sur les rangées d’un rouleau pour ouvrir son lotus",
      "Les lotus ouverts se multiplient entre eux. Gagnez jusqu’à 25000x !"
    ],
    "featureSub": {
      "bonus": "Gagnez sur les 5 rangées d’un rouleau pour ouvrir son lotus",
      "super": "Gagnez sur les 5 rangées — chaque lotus ouvert vaut au moins 5x",
      "epic": "Gagnez sur les 3 rangées centrales — chaque lotus ouvert vaut au moins 5x"
    },
    "modeText": {
      "extra_chance": "Chaque tour coûte 3x. Les tours gratuits se déclenchent sur environ 1.6404% des tours, soit 4.51 fois le taux normal.",
      "super_chance": "Chaque tour coûte 6x. Les tours gratuits se déclenchent sur environ 1.9386% des tours, soit 5.33 fois le taux normal, avec davantage de Bloom Super et Bloom Epic.",
      "raid": "Un tour renforcé avec des lotus actifs : gagner sur la seule rangée centrale d’un rouleau ouvre son lotus.",
      "storm": "Un tour très renforcé avec des lotus actifs. Chaque lotus ouvert vaut au moins 5x.",
      "bonus": "10 tours gratuits. Un lotus s’ouvre quand les 5 rangées de son rouleau ont gagné.",
      "super": "10 tours gratuits. Chaque lotus ouvert vaut au moins 5x.",
      "mystery": "Le résultat est tiré à l’entrée : 50% sans fonction, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Règles du jeu",
      "intro": "Paradise Bloom est un jeu à groupes de 5x5 avec des gains en cascade. Un groupe comprend au moins 5 symboles identiques reliés horizontalement ou verticalement. Le RTP théorique de chaque mode est de 96.00%. Le gain maximal de chaque mode est de 25000 fois la mise.",
      "payTitle": "Table des gains",
      "waysTitle": "Formation des gains",
      "ways": "Chaque groupe d’au moins 5 symboles identiques rapporte la valeur indiquée pour sa taille. Les symboles gagnants disparaissent, ceux du dessus tombent et de nouveaux arrivent. Cela continue tant que de nouveaux groupes gagnants se forment. Il n’y a pas de symboles Wild. Bloom Gate ne rapporte pas de gain ; il déclenche les tours gratuits.",
      "featTitle": "Fonctions",
      "chestsTitle": "Lotus",
      "chests": [
        "Un lotus doré se trouve sous chaque rouleau. Les lotus sont actifs dans Bloom Raid, Storm Raid et toutes les séries de tours gratuits, jamais dans le jeu de base.",
        "Une rangée d’un rouleau est gagnée lorsque son symbole appartient à un groupe gagnant. Les rangées gagnées restent acquises pendant les cascades et les tours gratuits jusqu’à la fin de la manche. Le lotus s’ouvre dès que les rangées exigées par le mode ont gagné.",
        "À la fin de la fonction, chaque lotus ouvert révèle 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x ou 100x. Les multiplicateurs se multiplient entre eux : 5x, 3x et 2x donnent 30x. Un lotus fermé compte pour 1x.",
        "Dans les tours gratuits, le multiplicateur combiné s’applique uniquement au gain total de ces tours. Le gain du tour déclencheur est ajouté séparément et n’est pas multiplié par les lotus. Dans Bloom Raid et Storm Raid, le multiplicateur s’applique au gain de l’unique tour du mode, cascades comprises."
      ],
      "halo": [
        "3, 4 ou 5 symboles Bloom Gate déclenchent respectivement Bloom Bonus, Bloom Super ou Bloom Epic, avec 10 tours gratuits chacun. Chaque Bloom Gate obtenu pendant les tours gratuits ajoute 1 tour gratuit.",
        "Bloom Bonus et Bloom Super exigent des gains sur les 5 rangées d’un rouleau pour ouvrir son lotus. Dans Bloom Epic, les 3 rangées centrales suffisent. Dans Bloom Super, Bloom Epic et Storm Raid, chaque lotus ouvert vaut au moins 5x."
      ],
      "mystery": "MYSTERY tire le résultat à l’entrée : 50% sans fonction, 40% Bloom Super et 10% Bloom Epic.",
      "modesTitle": "Modes",
      "controlsTitle": "Commandes",
      "controls": [
        [
          "Lancer",
          "Démarre une manche à la mise affichée. La barre d’espace fait de même."
        ],
        [
          "Mise ▲ ▼",
          "Augmente ou réduit la mise parmi les niveaux disponibles."
        ],
        [
          "Bouton des fonctions",
          "Ouvre les fonctions. Chaque fonction affiche son coût et demande confirmation avant de commencer."
        ],
        [
          "Désactiver",
          "Désactive le mode en cours et revient au tour normal."
        ],
        [
          "Jeu automatique",
          "Choisissez le nombre de tours puis Démarrer. Le bouton de lancement arrête le jeu automatique."
        ],
        [
          "Turbo ⚡",
          "Accélère les animations."
        ],
        [
          "Menu ☰",
          "Ouvre les informations et les volumes des effets et de la musique."
        ],
        [
          "Fermer ✕",
          "Ferme le menu ou les règles. Un clic à l’extérieur ferme aussi les menus."
        ],
        [
          "Rediffusion : Voir / Revoir",
          "Relit la même manche chargée. Ces boutons ne lancent aucune nouvelle manche."
        ],
        [
          "Appuyez pour continuer",
          "Le début du bonus et Total Win attendent un clic ou une touche. Cela permet aussi de passer un écran de gain."
        ]
      ],
      "generalTitle": "Généralités",
      "general": [
        "Tous les gains et combinaisons suivent la table des gains.",
        "Tout dysfonctionnement annule les gains et les parties.",
        "Une connexion stable est requise. Après une déconnexion, rechargez le jeu pour terminer les manches en cours. La mise d’une manche inachevée est conservée jusqu’à sa fin.",
        "Le retour attendu est calculé sur un grand nombre de parties.",
        "La représentation est uniquement illustrative et ne correspond à aucun appareil physique réel.",
        "Les gains sont réglés selon le montant reçu du Remote Game Server et non selon les événements du navigateur.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Le lien de rediffusion est incomplet.",
      "unavailable": "Rediffusion indisponible.",
      "notFound": "Rediffusion introuvable.",
      "invalid": "Les données de rediffusion sont invalides.",
      "insecure": "La rediffusion nécessite une connexion sécurisée."
    }
  },
  "hi": {
    "recovery": {"title": "अधूरा राउंड", "message": "यह राउंड पहले ही शुरू हो चुका है। बैलेंस से दोबारा कटौती के बिना जारी रखें।", "resume": "राउंड जारी रखें", "errorTitle": "कनेक्शन जाँचें", "error": "राउंड की स्थिति की पुष्टि नहीं हो सकी। बैलेंस अपडेट करने और नया राउंड शुरू करने से पहले अधूरा राउंड पूरा करने के लिए फिर से लोड करें।", "reload": "फिर से लोड करें"},
    "balance": "शेष",
    "win": "जीत",
    "bet": "दाँव",
    "increaseAmount": "राशि बढ़ाएँ",
    "decreaseAmount": "राशि घटाएँ",
    "freeSpins": "मुफ़्त स्पिन",
    "tapToContinue": "जारी रखने के लिए दबाएँ",
    "disable": "बंद करें",
    "activate": "सक्रिय करें",
    "buy": "खरीदें",
    "confirm": "पुष्टि करें",
    "info": "जानकारी",
    "close": "बंद करें",
    "effectsVolume": "ध्वनि प्रभावों की आवाज़",
    "musicVolume": "संगीत की आवाज़",
    "muteEffects": "ध्वनि प्रभाव बंद करें",
    "unmuteEffects": "ध्वनि प्रभाव चालू करें",
    "muteMusic": "संगीत बंद करें",
    "unmuteMusic": "संगीत चालू करें",
    "audioCredit": "मौलिक संगीत और ध्वनि — Paradise Bloom।",
    "autoplay": "ऑटो प्ले",
    "autoStart": "शुरू करें",
    "autoStop": "ऑटो प्ले रोकें",
    "spins": "स्पिन",
    "insufficient": "शेष राशि पर्याप्त नहीं है।",
    "amountUnavailable": "यह दाँव अब उपलब्ध नहीं है। ऊपर/नीचे के तीरों से अनुमत राशि चुनें।",
    "sessionExpired": "सत्र समाप्त हो गया। खेल दोबारा खोलें।",
    "limits": "खेल की सीमा पूरी हो गई।",
    "connection": "कनेक्शन में समस्या है। दोबारा कोशिश करें।",
    "connectFail": "खेल के सर्वर से कनेक्ट नहीं हो सका।",
    "loading": "लोड हो रहा है…",
    "replay": "रीप्ले",
    "playReplay": "देखें",
    "playing": "चल रहा है…",
    "replayAgain": "फिर देखें",
    "realCost": "कुल लागत",
    "noFeature": "कोई फ़ीचर नहीं",
    "freeSpinsN": "{n} मुफ़्त स्पिन",
    "minimum": "न्यूनतम",
    "spin": "स्पिन",
    "features": "फ़ीचर",
    "menu": "मेन्यू",
    "turbo": "टर्बो",
    "modeStats": "RTP 96.00%, अधिकतम जीत 25000x।",
    "introDescriptions": [
      "हर रील के नीचे एक सुनहरा कमल",
      "कमल खोलने के लिए रील की पंक्तियों में जीतें",
      "खुले कमलों के गुणक आपस में गुणा होते हैं। 25000x तक जीतें!"
    ],
    "featureSub": {
      "bonus": "कमल खोलने के लिए रील की सभी 5 पंक्तियों में जीतें",
      "super": "सभी 5 पंक्तियों में जीतें — हर खुला कमल कम से कम 5x",
      "epic": "बीच की 3 पंक्तियों में जीतें — हर खुला कमल कम से कम 5x"
    },
    "modeText": {
      "extra_chance": "हर स्पिन की लागत 3x है। लगभग 1.6404% स्पिन पर मुफ़्त स्पिन शुरू होते हैं, जो सामान्य दर से 4.51 गुना है।",
      "super_chance": "हर स्पिन की लागत 6x है। लगभग 1.9386% स्पिन पर मुफ़्त स्पिन शुरू होते हैं, जो सामान्य दर से 5.33 गुना है। Bloom Super और Bloom Epic का अनुपात भी अधिक है।",
      "raid": "सक्रिय कमलों के साथ एक शक्तिशाली स्पिन। रील की केवल बीच की पंक्ति की जीत से उसका कमल खुलता है।",
      "storm": "सक्रिय कमलों के साथ एक विशेष शक्तिशाली स्पिन। हर खुला कमल कम से कम 5x का होता है।",
      "bonus": "10 मुफ़्त स्पिन। रील की सभी 5 पंक्तियाँ जीतने पर उसका कमल खुलता है।",
      "super": "10 मुफ़्त स्पिन। हर खुला कमल कम से कम 5x का होता है।",
      "mystery": "प्रवेश पर परिणाम चुना जाता है: 50% कोई फ़ीचर नहीं, 40% Bloom Super, 10% Bloom Epic।"
    },
    "rules": {
      "title": "खेल के नियम",
      "intro": "Paradise Bloom गिरते प्रतीकों के साथ लगातार जीत वाला 5x5 क्लस्टर खेल है। क्षैतिज या लंबवत जुड़े कम से कम 5 समान प्रतीक एक क्लस्टर बनाते हैं। सभी मोड का सैद्धांतिक RTP 96.00% है। सभी मोड में अधिकतम जीत दाँव की 25000 गुना है।",
      "payTitle": "भुगतान तालिका",
      "waysTitle": "जीत कैसे बनती है",
      "ways": "कम से कम 5 समान प्रतीकों का क्लस्टर अपने आकार के अनुसार तालिका का मूल्य देता है। जीतने वाले प्रतीक हटते हैं, ऊपर के प्रतीक नीचे गिरते हैं और नए आते हैं। यह तब तक चलता है जब तक नए जीतने वाले क्लस्टर बनते हैं। वाइल्ड प्रतीक नहीं हैं। Bloom Gate स्वयं भुगतान नहीं करता, बल्कि मुफ़्त स्पिन शुरू करता है।",
      "featTitle": "फ़ीचर",
      "chestsTitle": "कमल",
      "chests": [
        "हर रील के नीचे एक सुनहरा कमल है। कमल Bloom Raid, Storm Raid और सभी मुफ़्त स्पिन राउंड में सक्रिय होते हैं, मुख्य खेल में नहीं।",
        "रील की कोई पंक्ति तब जीती मानी जाती है जब उसका प्रतीक जीतने वाले क्लस्टर में हो। जीती हुई पंक्तियाँ हर गिरावट और मुफ़्त स्पिन के दौरान राउंड समाप्त होने तक जमा रहती हैं। मोड के लिए आवश्यक पंक्तियाँ जीतने पर कमल खुलता है।",
        "फ़ीचर के अंत में हर खुला कमल 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x या 100x दिखाता है। गुणक आपस में गुणा होते हैं: 5x, 3x और 2x मिलकर 30x देते हैं। बंद कमल 1x गिना जाता है।",
        "मुफ़्त स्पिन में संयुक्त कमल गुणक केवल मुफ़्त स्पिन की कुल जीत पर लगता है। उन्हें शुरू करने वाले स्पिन की जीत अलग से जोड़ी जाती है और कमलों से गुणा नहीं होती। Bloom Raid और Storm Raid में मोड के एकमात्र स्पिन की जीत, उसकी सभी गिरावटों सहित, गुणा होती है।"
      ],
      "halo": [
        "3, 4 या 5 Bloom Gate क्रमशः Bloom Bonus, Bloom Super या Bloom Epic शुरू करते हैं। प्रत्येक में 10 मुफ़्त स्पिन मिलते हैं। मुफ़्त स्पिन के दौरान आने वाला हर Bloom Gate 1 मुफ़्त स्पिन जोड़ता है।",
        "Bloom Bonus और Bloom Super में कमल खोलने के लिए रील की सभी 5 पंक्तियाँ जीतनी होती हैं। Bloom Epic में केवल बीच की 3 पंक्तियाँ आवश्यक हैं। Bloom Super, Bloom Epic और Storm Raid में हर खुला कमल कम से कम 5x का होता है।"
      ],
      "mystery": "MYSTERY में परिणाम प्रवेश पर चुना जाता है: 50% कोई फ़ीचर नहीं, 40% Bloom Super और 10% Bloom Epic।",
      "modesTitle": "मोड",
      "controlsTitle": "नियंत्रण",
      "controls": [
        [
          "स्पिन",
          "दिखाए गए दाँव पर राउंड शुरू करता है। स्पेस बार भी यही करता है।"
        ],
        [
          "दाँव ▲ ▼",
          "उपलब्ध स्तरों के बीच दाँव बढ़ाता या घटाता है।"
        ],
        [
          "फ़ीचर बटन",
          "फ़ीचर मेन्यू खोलता है। हर फ़ीचर पहले लागत दिखाता है और पुष्टि माँगता है।"
        ],
        [
          "बंद करें",
          "सक्रिय मोड बंद करके सामान्य स्पिन पर लौटता है।"
        ],
        [
          "ऑटो प्ले",
          "स्पिन की संख्या चुनें और शुरू करें दबाएँ। स्पिन बटन ऑटो प्ले रोकता है।"
        ],
        [
          "टर्बो ⚡",
          "ऐनिमेशन तेज़ करता है।"
        ],
        [
          "मेन्यू ☰",
          "जानकारी तथा ध्वनि प्रभाव और संगीत की आवाज़ खोलता है।"
        ],
        [
          "बंद करें ✕",
          "मेन्यू या नियम बंद करता है। मेन्यू के बाहर दबाने से भी वह बंद होता है।"
        ],
        [
          "रीप्ले: देखें / फिर देखें",
          "उसी लोड किए गए राउंड को चलाता है, नया राउंड शुरू नहीं करता।"
        ],
        [
          "जारी रखने के लिए दबाएँ",
          "बोनस की शुरुआत और Total Win पर क्लिक या कुंजी दबाने से आगे बढ़ते हैं। जीत की स्क्रीन भी ऐसे छोड़ी जा सकती है।"
        ]
      ],
      "generalTitle": "सामान्य जानकारी",
      "general": [
        "सभी जीत और जीतने वाले संयोजन भुगतान तालिका के अनुसार होते हैं।",
        "तकनीकी खराबी होने पर सभी जीत और खेल अमान्य हो जाते हैं।",
        "स्थिर इंटरनेट कनेक्शन आवश्यक है। कनेक्शन टूटने पर अधूरे राउंड पूरे करने के लिए खेल फिर लोड करें। अधूरे राउंड का दाँव उसके पूरा होने तक बना रहता है।",
        "अपेक्षित रिटर्न बहुत सारे खेलों पर आधारित होता है।",
        "स्क्रीन केवल चित्रण है और किसी वास्तविक भौतिक उपकरण का प्रतिनिधित्व नहीं करती।",
        "जीत का निपटारा ब्राउज़र की घटनाओं से नहीं, Remote Game Server से मिली राशि के अनुसार होता है।",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "रीप्ले का लिंक अधूरा है।",
      "unavailable": "रीप्ले उपलब्ध नहीं है।",
      "notFound": "रीप्ले नहीं मिला।",
      "invalid": "रीप्ले का डेटा अमान्य है।",
      "insecure": "रीप्ले के लिए सुरक्षित कनेक्शन आवश्यक है।"
    }
  },
  "id": {
    "recovery": {"title": "Putaran belum selesai", "message": "Putaran ini sudah dimulai. Lanjutkan tanpa pengurangan saldo lagi.", "resume": "Lanjutkan putaran", "errorTitle": "Periksa koneksi", "error": "Status putaran tidak dapat dikonfirmasi. Muat ulang untuk menyinkronkan saldo dan menyelesaikan putaran tertunda sebelum memulai putaran baru.", "reload": "Muat ulang"},
    "balance": "Saldo",
    "win": "Menang",
    "bet": "Taruhan",
    "increaseAmount": "Naikkan jumlah",
    "decreaseAmount": "Turunkan jumlah",
    "freeSpins": "Putaran gratis",
    "tapToContinue": "Ketuk untuk melanjutkan",
    "disable": "Nonaktifkan",
    "activate": "Aktifkan",
    "buy": "Beli",
    "confirm": "Konfirmasi",
    "info": "Info",
    "close": "Tutup",
    "effectsVolume": "Volume efek",
    "musicVolume": "Volume musik",
    "muteEffects": "Bisukan efek",
    "unmuteEffects": "Aktifkan suara efek",
    "muteMusic": "Bisukan musik",
    "unmuteMusic": "Aktifkan musik",
    "audioCredit": "Musik dan suara orisinal — Paradise Bloom.",
    "autoplay": "Main otomatis",
    "autoStart": "Mulai",
    "autoStop": "Hentikan main otomatis",
    "spins": "putaran",
    "insufficient": "Saldo tidak cukup.",
    "amountUnavailable": "Taruhan ini tidak lagi tersedia. Pilih jumlah yang diizinkan dengan tombol panah.",
    "sessionExpired": "Sesi berakhir. Buka kembali permainan.",
    "limits": "Batas permainan tercapai.",
    "connection": "Masalah koneksi. Silakan coba lagi.",
    "connectFail": "Tidak dapat terhubung ke server permainan.",
    "loading": "Memuat…",
    "replay": "Putar ulang",
    "playReplay": "Tonton",
    "playing": "Memutar…",
    "replayAgain": "Tonton lagi",
    "realCost": "Biaya total",
    "noFeature": "Tanpa fitur",
    "freeSpinsN": "{n} putaran gratis",
    "minimum": "minimal",
    "spin": "Putar",
    "features": "Fitur",
    "menu": "Menu",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, kemenangan maksimal 25000x.",
    "introDescriptions": [
      "Teratai emas di bawah setiap gulungan",
      "Menang di baris gulungan untuk membuka teratainya",
      "Pengali teratai terbuka dikalikan bersama. Menang hingga 25000x!"
    ],
    "featureSub": {
      "bonus": "Menang di semua 5 baris gulungan untuk membuka teratainya",
      "super": "Menang di semua 5 baris — setiap teratai terbuka minimal 5x",
      "epic": "Menang di 3 baris tengah — setiap teratai terbuka minimal 5x"
    },
    "modeText": {
      "extra_chance": "Setiap putaran berbiaya 3x. Putaran gratis terpicu pada sekitar 1.6404% putaran, 4.51 kali frekuensi normal.",
      "super_chance": "Setiap putaran berbiaya 6x. Putaran gratis terpicu pada sekitar 1.9386% putaran, 5.33 kali frekuensi normal, dengan porsi Bloom Super dan Bloom Epic lebih tinggi.",
      "raid": "Satu putaran diperkuat dengan teratai aktif. Kemenangan pada baris tengah gulungan saja membuka teratainya.",
      "storm": "Satu putaran sangat diperkuat dengan teratai aktif. Setiap teratai terbuka bernilai minimal 5x.",
      "bonus": "10 putaran gratis. Teratai terbuka setelah semua 5 baris gulungannya menang.",
      "super": "10 putaran gratis. Setiap teratai terbuka bernilai minimal 5x.",
      "mystery": "Hasil diundi saat masuk: 50% tanpa fitur, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Aturan permainan",
      "intro": "Paradise Bloom adalah permainan klaster 5x5 dengan kemenangan beruntun melalui simbol jatuh. Klaster terdiri dari minimal 5 simbol sama yang terhubung horizontal atau vertikal. RTP teoretis semua mode adalah 96.00%. Kemenangan maksimal semua mode adalah 25000 kali taruhan.",
      "payTitle": "Tabel pembayaran",
      "waysTitle": "Cara kemenangan terbentuk",
      "ways": "Klaster minimal 5 simbol sama membayar nilai pada tabel sesuai ukurannya. Simbol pemenang hilang, simbol di atasnya jatuh dan simbol baru masuk. Ini berulang selama klaster pemenang baru terbentuk. Tidak ada simbol wild. Bloom Gate tidak membayar; simbol ini memicu putaran gratis.",
      "featTitle": "Fitur",
      "chestsTitle": "Teratai",
      "chests": [
        "Teratai emas berada di bawah setiap gulungan. Teratai aktif dalam Bloom Raid, Storm Raid dan semua ronde putaran gratis, bukan dalam permainan dasar.",
        "Baris gulungan dianggap menang jika simbolnya termasuk dalam klaster pemenang. Baris yang menang tetap tersimpan melalui simbol jatuh dan putaran gratis hingga ronde berakhir. Teratai terbuka setelah baris yang diwajibkan mode menang.",
        "Di akhir fitur, setiap teratai terbuka mengungkap 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x atau 100x. Semua pengali dikalikan: 5x, 3x dan 2x menghasilkan 30x. Teratai tertutup dihitung sebagai 1x.",
        "Pada putaran gratis, pengali gabungan hanya diterapkan ke total kemenangan putaran gratis. Kemenangan putaran pemicu ditambahkan terpisah dan tidak dikalikan teratai. Pada Bloom Raid dan Storm Raid, pengali diterapkan ke kemenangan satu putaran mode tersebut, termasuk seluruh rangkaian simbol jatuhnya."
      ],
      "halo": [
        "3, 4 atau 5 Bloom Gate memicu Bloom Bonus, Bloom Super atau Bloom Epic secara berurutan, masing-masing dengan 10 putaran gratis. Setiap Bloom Gate yang muncul selama putaran gratis menambah 1 putaran gratis.",
        "Bloom Bonus dan Bloom Super memerlukan kemenangan di semua 5 baris gulungan. Bloom Epic hanya memerlukan 3 baris tengah. Pada Bloom Super, Bloom Epic dan Storm Raid, setiap teratai terbuka bernilai minimal 5x."
      ],
      "mystery": "MYSTERY mengundi hasil saat masuk: 50% tanpa fitur, 40% Bloom Super dan 10% Bloom Epic.",
      "modesTitle": "Mode",
      "controlsTitle": "Kontrol",
      "controls": [
        [
          "Putar",
          "Memulai ronde pada taruhan yang ditampilkan. Tombol spasi melakukan hal yang sama."
        ],
        [
          "Taruhan ▲ ▼",
          "Menaikkan atau menurunkan taruhan melalui tingkat yang tersedia."
        ],
        [
          "Tombol fitur",
          "Membuka menu fitur. Setiap fitur menampilkan biaya dan meminta konfirmasi terlebih dahulu."
        ],
        [
          "Nonaktifkan",
          "Mematikan mode aktif dan kembali ke putaran normal."
        ],
        [
          "Main otomatis",
          "Pilih jumlah putaran lalu Mulai. Tombol putar menghentikan main otomatis."
        ],
        [
          "Turbo ⚡",
          "Mempercepat animasi."
        ],
        [
          "Menu ☰",
          "Membuka Info serta volume efek dan musik."
        ],
        [
          "Tutup ✕",
          "Menutup menu atau aturan. Mengetuk di luar menu juga menutupnya."
        ],
        [
          "Putar ulang: Tonton / Tonton lagi",
          "Memutar ronde yang sama tanpa memulai ronde baru."
        ],
        [
          "Ketuk untuk melanjutkan",
          "Awal bonus dan Total Win menunggu ketukan atau tombol. Layar kemenangan juga dapat dilewati dengan cara ini."
        ]
      ],
      "generalTitle": "Umum",
      "general": [
        "Semua kemenangan dan kombinasinya mengikuti tabel pembayaran.",
        "Gangguan fungsi membatalkan semua kemenangan dan permainan.",
        "Koneksi internet stabil diperlukan. Jika terputus, muat ulang permainan untuk menyelesaikan ronde tertunda. Taruhan ronde tertunda disimpan sampai ronde selesai.",
        "Pengembalian yang diharapkan dihitung dari banyak permainan.",
        "Tampilan hanya ilustrasi dan bukan representasi perangkat fisik nyata.",
        "Kemenangan diselesaikan berdasarkan jumlah dari Remote Game Server, bukan peristiwa di browser.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Tautan putar ulang tidak lengkap.",
      "unavailable": "Putar ulang tidak tersedia.",
      "notFound": "Putar ulang tidak ditemukan.",
      "invalid": "Data putar ulang tidak valid.",
      "insecure": "Putar ulang memerlukan koneksi aman."
    }
  },
  "ja": {
    "recovery": {"title": "未完了のラウンド", "message": "このラウンドはすでに開始されています。残高から再度差し引かれることなく続行できます。", "resume": "ラウンドを続行", "errorTitle": "接続を確認", "error": "ラウンドの状態を確認できませんでした。再読み込みして残高を同期し、未完了のラウンドを終えてから次を開始してください。", "reload": "再読み込み"},
    "balance": "残高",
    "win": "獲得額",
    "bet": "ベット",
    "increaseAmount": "金額を上げる",
    "decreaseAmount": "金額を下げる",
    "freeSpins": "フリースピン",
    "tapToContinue": "タップして続行",
    "disable": "解除",
    "activate": "有効化",
    "buy": "購入",
    "confirm": "確認",
    "info": "ゲーム情報",
    "close": "閉じる",
    "effectsVolume": "効果音の音量",
    "musicVolume": "音楽の音量",
    "muteEffects": "効果音をミュート",
    "unmuteEffects": "効果音をオン",
    "muteMusic": "音楽をミュート",
    "unmuteMusic": "音楽をオン",
    "audioCredit": "オリジナル音楽・効果音 — Paradise Bloom。",
    "autoplay": "オートプレイ",
    "autoStart": "開始",
    "autoStop": "オートプレイを停止",
    "spins": "スピン",
    "insufficient": "残高が不足しています。",
    "amountUnavailable": "このベット額は現在利用できません。上下の矢印で利用可能な金額を選んでください。",
    "sessionExpired": "セッションが終了しました。ゲームを開き直してください。",
    "limits": "プレイ上限に達しました。",
    "connection": "接続エラーです。もう一度お試しください。",
    "connectFail": "ゲームサーバーに接続できませんでした。",
    "loading": "読み込み中…",
    "replay": "リプレイ",
    "playReplay": "再生",
    "playing": "再生中…",
    "replayAgain": "もう一度見る",
    "realCost": "合計費用",
    "noFeature": "機能なし",
    "freeSpinsN": "フリースピン {n} 回",
    "minimum": "最低",
    "spin": "スピン",
    "features": "機能",
    "menu": "メニュー",
    "turbo": "ターボ",
    "modeStats": "RTP 96.00%、最大獲得額 25000x。",
    "introDescriptions": [
      "各リールの下に黄金のハス",
      "リールの各行で勝利してハスを開こう",
      "開いたハスの倍率を掛け合わせます。最大25000x！"
    ],
    "featureSub": {
      "bonus": "リールの全5行で勝利するとハスが開きます",
      "super": "全5行で勝利 — 開いたハスは最低5x",
      "epic": "中央3行で勝利 — 開いたハスは最低5x"
    },
    "modeText": {
      "extra_chance": "各スピンの費用は3x。フリースピン発生率は約1.6404%で、通常の4.51倍です。",
      "super_chance": "各スピンの費用は6x。フリースピン発生率は約1.9386%で、通常の5.33倍です。Bloom SuperとBloom Epicの割合も高くなります。",
      "raid": "ハスが有効な強化スピンを1回行います。リールの中央の行で勝利するだけでハスが開きます。",
      "storm": "ハスが有効な特別強化スピンを1回行います。開いたハスの倍率は最低5xです。",
      "bonus": "フリースピン10回。リールの全5行で勝利するとハスが開きます。",
      "super": "フリースピン10回。開いたハスの倍率は最低5xです。",
      "mystery": "開始時に抽選します。機能なし50%、Bloom Super 40%、Bloom Epic 10%。"
    },
    "rules": {
      "title": "ゲームルール",
      "intro": "Paradise Bloomは5x5のクラスター式ゲームです。勝利後にシンボルが落下し、連続して勝利が発生することがあります。クラスターは上下左右につながる同じシンボル5個以上で成立します。全モードの理論RTPは96.00%、最大獲得額はベットの25000倍です。",
      "payTitle": "配当表",
      "waysTitle": "勝利の成立方法",
      "ways": "同じシンボル5個以上のクラスターは、個数に対応する表の配当を獲得します。勝利シンボルは消え、上のシンボルが落下し、新しいシンボルが補充されます。新たな勝利クラスターができる限り続きます。ワイルドはありません。Bloom Gate自体に配当はなく、フリースピンを開始します。",
      "featTitle": "機能",
      "chestsTitle": "ハス",
      "chests": [
        "各リールの下に黄金のハスがあります。ハスはBloom Raid、Storm Raidと全フリースピンで有効です。基本ゲームでは無効です。",
        "リールのある行のシンボルが勝利クラスターに含まれると、その行は達成済みになります。達成した行は落下やフリースピンを通じてラウンド終了まで蓄積されます。モードが要求する行を達成するとハスが開きます。",
        "機能終了時、開いたハスは2x、3x、4x、5x、6x、7x、8x、9x、10x、25x、50x、100xのいずれかを示します。倍率を掛け合わせ、5x・3x・2xなら合計30xです。閉じたハスは1xとします。",
        "フリースピンでは、合成された倍率はフリースピン中の獲得額合計だけに適用されます。フリースピンを開始したスピンの獲得額は別に加算し、ハスの倍率を掛けません。Bloom RaidとStorm Raidでは、そのモードの1回のスピンの落下連鎖を含む獲得額に倍率を適用します。"
      ],
      "halo": [
        "Bloom Gateが3個、4個、5個で、それぞれBloom Bonus、Bloom Super、Bloom Epicを開始し、いずれもフリースピン10回を獲得します。フリースピン中に出たBloom Gateは1個につきフリースピンを1回追加します。",
        "Bloom BonusとBloom Superでは、ハスを開くためにリールの全5行で勝利する必要があります。Bloom Epicでは中央3行で開きます。Bloom Super、Bloom Epic、Storm Raidの開いたハスは最低5xです。"
      ],
      "mystery": "MYSTERYは開始時に結果を抽選します。機能なし50%、Bloom Super 40%、Bloom Epic 10%。",
      "modesTitle": "モード",
      "controlsTitle": "操作方法",
      "controls": [
        [
          "スピン",
          "表示されたベット額でラウンドを開始します。スペースキーも同じ操作です。"
        ],
        [
          "ベット ▲ ▼",
          "利用可能な段階の間でベット額を増減します。"
        ],
        [
          "機能ボタン",
          "機能メニューを開きます。各機能は費用を表示し、開始前に確認を求めます。"
        ],
        [
          "解除",
          "有効なモードを解除し、通常スピンに戻します。"
        ],
        [
          "オートプレイ",
          "回数を選んで開始を押します。スピンボタンで停止します。"
        ],
        [
          "ターボ ⚡",
          "アニメーションを速くします。"
        ],
        [
          "メニュー ☰",
          "ゲーム情報、効果音と音楽の音量設定を開きます。"
        ],
        [
          "閉じる ✕",
          "メニューやルールを閉じます。メニューの外をタップしても閉じます。"
        ],
        [
          "リプレイ：再生／もう一度見る",
          "読み込んだ同じラウンドを再生します。新たなラウンドは開始しません。"
        ],
        [
          "タップして続行",
          "ボーナス開始とTotal Winではタップかキー入力で進みます。獲得画面も同じ操作でスキップできます。"
        ]
      ],
      "generalTitle": "一般事項",
      "general": [
        "全獲得額と勝利の組み合わせは配当表に従います。",
        "不具合が発生した場合、全獲得額とプレイは無効になります。",
        "安定したインターネット接続が必要です。切断後はゲームを再読み込みし、未完了ラウンドを完了してください。未完了ラウンドのベット額は完了まで維持されます。",
        "期待還元率は多数のプレイにわたって計算されます。",
        "画面は説明用であり、実際の物理機器を表すものではありません。",
        "獲得額の確定にはブラウザー内のイベントではなく、Remote Game Serverから受信した金額を使用します。",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "リプレイリンクが不完全です。",
      "unavailable": "リプレイを利用できません。",
      "notFound": "リプレイが見つかりません。",
      "invalid": "リプレイデータが無効です。",
      "insecure": "リプレイには安全な接続が必要です。"
    }
  },
  "ko": {
    "recovery": {"title": "완료되지 않은 라운드", "message": "이미 시작된 라운드입니다. 잔액에서 다시 차감하지 않고 계속하세요.", "resume": "라운드 계속", "errorTitle": "연결 확인", "error": "라운드 상태를 확인할 수 없습니다. 새로고침하여 잔액을 동기화하고 미완료 라운드를 마친 후 새 라운드를 시작하세요.", "reload": "새로고침"},
    "balance": "잔액",
    "win": "당첨금",
    "bet": "베팅",
    "increaseAmount": "금액 올리기",
    "decreaseAmount": "금액 내리기",
    "freeSpins": "무료 스핀",
    "tapToContinue": "눌러서 계속",
    "disable": "해제",
    "activate": "활성화",
    "buy": "구매",
    "confirm": "확인",
    "info": "게임 정보",
    "close": "닫기",
    "effectsVolume": "효과음 음량",
    "musicVolume": "음악 음량",
    "muteEffects": "효과음 끄기",
    "unmuteEffects": "효과음 켜기",
    "muteMusic": "음악 끄기",
    "unmuteMusic": "음악 켜기",
    "audioCredit": "오리지널 음악 및 음향 — Paradise Bloom.",
    "autoplay": "자동 플레이",
    "autoStart": "시작",
    "autoStop": "자동 플레이 중지",
    "spins": "회",
    "insufficient": "잔액이 부족합니다.",
    "amountUnavailable": "이 베팅 금액은 더 이상 사용할 수 없습니다. 화살표로 허용된 금액을 선택하세요.",
    "sessionExpired": "세션이 만료되었습니다. 게임을 다시 여세요.",
    "limits": "플레이 한도에 도달했습니다.",
    "connection": "연결 문제가 발생했습니다. 다시 시도하세요.",
    "connectFail": "게임 서버에 연결할 수 없습니다.",
    "loading": "불러오는 중…",
    "replay": "다시보기",
    "playReplay": "재생",
    "playing": "재생 중…",
    "replayAgain": "다시 보기",
    "realCost": "총비용",
    "noFeature": "기능 없음",
    "freeSpinsN": "무료 스핀 {n}회",
    "minimum": "최소",
    "spin": "스핀",
    "features": "기능",
    "menu": "메뉴",
    "turbo": "터보",
    "modeStats": "RTP 96.00%, 최대 당첨금 25000x.",
    "introDescriptions": [
      "각 릴 아래에 황금 연꽃",
      "릴의 행에서 당첨되어 연꽃을 여세요",
      "열린 연꽃의 배수를 서로 곱합니다. 최대 25000x!"
    ],
    "featureSub": {
      "bonus": "릴의 5개 행 모두에서 당첨되면 연꽃이 열립니다",
      "super": "5개 행 모두 당첨 — 열린 연꽃은 최소 5x",
      "epic": "가운데 3개 행 당첨 — 열린 연꽃은 최소 5x"
    },
    "modeText": {
      "extra_chance": "각 스핀 비용은 3x입니다. 무료 스핀 발생률은 약 1.6404%로 일반 모드의 4.51배입니다.",
      "super_chance": "각 스핀 비용은 6x입니다. 무료 스핀 발생률은 약 1.9386%로 일반 모드의 5.33배이며, Bloom Super와 Bloom Epic의 비중도 높습니다.",
      "raid": "활성 연꽃과 함께 강화 스핀 1회를 진행합니다. 릴 가운데 행의 당첨만으로 연꽃이 열립니다.",
      "storm": "활성 연꽃과 함께 특별 강화 스핀 1회를 진행합니다. 열린 연꽃은 최소 5x입니다.",
      "bonus": "무료 스핀 10회. 릴의 5개 행이 모두 당첨되면 연꽃이 열립니다.",
      "super": "무료 스핀 10회. 열린 연꽃은 최소 5x입니다.",
      "mystery": "진입 시 결과가 결정됩니다. 기능 없음 50%, Bloom Super 40%, Bloom Epic 10%."
    },
    "rules": {
      "title": "게임 규칙",
      "intro": "Paradise Bloom은 심볼이 연속으로 떨어지는 5x5 클러스터 게임입니다. 같은 심볼 5개 이상이 가로나 세로로 연결되면 클러스터가 됩니다. 모든 모드의 이론적 RTP는 96.00%이며 최대 당첨금은 베팅 금액의 25000배입니다.",
      "payTitle": "배당표",
      "waysTitle": "당첨 방식",
      "ways": "같은 심볼 5개 이상의 클러스터는 크기에 해당하는 배당표 값을 지급합니다. 당첨 심볼이 사라지면 위 심볼이 떨어지고 새 심볼이 채워집니다. 새 당첨 클러스터가 생기는 동안 반복됩니다. 와일드 심볼은 없습니다. Bloom Gate는 배당 없이 무료 스핀을 시작합니다.",
      "featTitle": "기능",
      "chestsTitle": "연꽃",
      "chests": [
        "각 릴 아래에 황금 연꽃이 있습니다. 연꽃은 Bloom Raid, Storm Raid 및 모든 무료 스핀 라운드에서 활성화되며 기본 게임에서는 활성화되지 않습니다.",
        "릴의 한 행에 있는 심볼이 당첨 클러스터에 포함되면 그 행을 달성합니다. 달성한 행은 심볼 낙하와 무료 스핀 동안 누적되어 라운드 끝까지 유지됩니다. 모드에서 요구하는 행을 달성하면 연꽃이 열립니다.",
        "기능 종료 시 열린 연꽃마다 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x 또는 100x가 나타납니다. 배수를 서로 곱하므로 5x, 3x, 2x는 총 30x입니다. 닫힌 연꽃은 1x로 계산합니다.",
        "무료 스핀에서 합산 배수는 무료 스핀 당첨금 합계에만 적용됩니다. 무료 스핀을 시작한 스핀의 당첨금은 별도로 더하며 연꽃 배수를 적용하지 않습니다. Bloom Raid와 Storm Raid에서는 해당 모드의 스핀 1회와 모든 연속 낙하에서 얻은 당첨금에 배수를 적용합니다."
      ],
      "halo": [
        "Bloom Gate 3개, 4개, 5개는 각각 Bloom Bonus, Bloom Super, Bloom Epic을 시작하며 모두 무료 스핀 10회를 제공합니다. 무료 스핀 중 등장하는 Bloom Gate마다 무료 스핀 1회가 추가됩니다.",
        "Bloom Bonus와 Bloom Super에서는 릴의 5개 행을 모두 달성해야 연꽃이 열립니다. Bloom Epic에서는 가운데 3개 행만 필요합니다. Bloom Super, Bloom Epic, Storm Raid에서 열린 연꽃은 최소 5x입니다."
      ],
      "mystery": "MYSTERY는 진입 시 결과를 결정합니다. 기능 없음 50%, Bloom Super 40%, Bloom Epic 10%입니다.",
      "modesTitle": "모드",
      "controlsTitle": "조작 방법",
      "controls": [
        [
          "스핀",
          "표시된 베팅 금액으로 라운드를 시작합니다. 스페이스 키도 같은 기능입니다."
        ],
        [
          "베팅 ▲ ▼",
          "허용된 단계 안에서 베팅 금액을 올리거나 내립니다."
        ],
        [
          "기능 버튼",
          "기능 메뉴를 엽니다. 각 기능은 먼저 비용을 표시하고 확인을 요청합니다."
        ],
        [
          "해제",
          "활성 모드를 끄고 일반 스핀으로 돌아갑니다."
        ],
        [
          "자동 플레이",
          "스핀 횟수를 선택하고 시작을 누릅니다. 스핀 버튼을 누르면 중지됩니다."
        ],
        [
          "터보 ⚡",
          "애니메이션을 빠르게 합니다."
        ],
        [
          "메뉴 ☰",
          "게임 정보와 효과음 및 음악 음량을 엽니다."
        ],
        [
          "닫기 ✕",
          "메뉴나 규칙을 닫습니다. 메뉴 밖을 눌러도 닫힙니다."
        ],
        [
          "다시보기: 재생 / 다시 보기",
          "불러온 같은 라운드를 재생하며 새 라운드를 시작하지 않습니다."
        ],
        [
          "눌러서 계속",
          "보너스 시작과 Total Win은 클릭 또는 키 입력을 기다립니다. 당첨 화면도 같은 방법으로 건너뜁니다."
        ]
      ],
      "generalTitle": "일반 안내",
      "general": [
        "모든 당첨금과 당첨 조합은 배당표를 따릅니다.",
        "오작동 시 모든 당첨금과 플레이는 무효입니다.",
        "안정적인 인터넷 연결이 필요합니다. 연결이 끊기면 게임을 새로 불러와 진행 중인 라운드를 완료하세요. 미완료 라운드의 베팅 금액은 완료될 때까지 유지됩니다.",
        "기대 환급률은 많은 플레이를 기준으로 계산합니다.",
        "화면은 설명용이며 실제 물리적 기기를 나타내지 않습니다.",
        "당첨금은 브라우저 이벤트가 아니라 Remote Game Server에서 받은 금액으로 정산합니다.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "다시보기 링크가 불완전합니다.",
      "unavailable": "다시보기를 사용할 수 없습니다.",
      "notFound": "다시보기를 찾을 수 없습니다.",
      "invalid": "다시보기 데이터가 올바르지 않습니다.",
      "insecure": "다시보기에는 보안 연결이 필요합니다."
    }
  },
  "pl": {
    "recovery": {"title": "Niedokończona runda", "message": "Ta runda już się rozpoczęła. Kontynuuj bez ponownego potrącenia z salda.", "resume": "Kontynuuj rundę", "errorTitle": "Sprawdź połączenie", "error": "Nie udało się potwierdzić stanu rundy. Odśwież grę, aby zsynchronizować saldo i dokończyć otwartą rundę przed rozpoczęciem kolejnej.", "reload": "Odśwież"},
    "balance": "Saldo",
    "win": "Wygrana",
    "bet": "Stawka",
    "increaseAmount": "Zwiększ kwotę",
    "decreaseAmount": "Zmniejsz kwotę",
    "freeSpins": "Darmowe obroty",
    "tapToContinue": "Naciśnij, aby kontynuować",
    "disable": "Wyłącz",
    "activate": "Aktywuj",
    "buy": "Kup",
    "confirm": "Potwierdź",
    "info": "Informacje",
    "close": "Zamknij",
    "effectsVolume": "Głośność efektów",
    "musicVolume": "Głośność muzyki",
    "muteEffects": "Wycisz efekty",
    "unmuteEffects": "Włącz efekty",
    "muteMusic": "Wycisz muzykę",
    "unmuteMusic": "Włącz muzykę",
    "audioCredit": "Oryginalna muzyka i dźwięki — Paradise Bloom.",
    "autoplay": "Gra automatyczna",
    "autoStart": "Start",
    "autoStop": "Zatrzymaj grę automatyczną",
    "spins": "obrotów",
    "insufficient": "Niewystarczające saldo.",
    "amountUnavailable": "Ta stawka nie jest już dostępna. Wybierz dozwoloną kwotę za pomocą strzałek.",
    "sessionExpired": "Sesja wygasła. Otwórz grę ponownie.",
    "limits": "Osiągnięto limit gry.",
    "connection": "Problem z połączeniem. Spróbuj ponownie.",
    "connectFail": "Nie udało się połączyć z serwerem gry.",
    "loading": "Ładowanie…",
    "replay": "Powtórka",
    "playReplay": "Odtwórz",
    "playing": "Odtwarzanie…",
    "replayAgain": "Obejrzyj ponownie",
    "realCost": "Łączny koszt",
    "noFeature": "Brak funkcji",
    "freeSpinsN": "Darmowe obroty: {n}",
    "minimum": "minimum",
    "spin": "Zakręć",
    "features": "Funkcje",
    "menu": "Menu",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, maksymalna wygrana 25000x.",
    "introDescriptions": [
      "Złoty lotos pod każdym bębnem",
      "Wygrywaj w rzędach bębna, aby otworzyć jego lotos",
      "Otwarte lotosy mnożą się przez siebie. Wygraj do 25000x!"
    ],
    "featureSub": {
      "bonus": "Wygraj we wszystkich 5 rzędach bębna, aby otworzyć lotos",
      "super": "Wygraj we wszystkich 5 rzędach — każdy otwarty lotos co najmniej 5x",
      "epic": "Wygraj w 3 środkowych rzędach — każdy otwarty lotos co najmniej 5x"
    },
    "modeText": {
      "extra_chance": "Każdy obrót kosztuje 3x. Darmowe obroty uruchamiają się w około 1.6404% obrotów, czyli 4.51 razy częściej niż normalnie.",
      "super_chance": "Każdy obrót kosztuje 6x. Darmowe obroty uruchamiają się w około 1.9386% obrotów, czyli 5.33 razy częściej niż normalnie, z większym udziałem Bloom Super i Bloom Epic.",
      "raid": "Jeden wzmocniony obrót z aktywnymi lotosami. Wygrana w środkowym rzędzie bębna wystarcza do otwarcia jego lotosu.",
      "storm": "Jeden szczególnie wzmocniony obrót z aktywnymi lotosami. Każdy otwarty lotos ma co najmniej 5x.",
      "bonus": "10 darmowych obrotów. Lotos otwiera się, gdy wszystkie 5 rzędów jego bębna wygra.",
      "super": "10 darmowych obrotów. Każdy otwarty lotos ma co najmniej 5x.",
      "mystery": "Wynik jest losowany przy wejściu: 50% brak funkcji, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Zasady gry",
      "intro": "Paradise Bloom to gra klastrowa 5x5 z kaskadowymi wygranymi. Klaster tworzy co najmniej 5 jednakowych symboli połączonych poziomo lub pionowo. Teoretyczny RTP każdego trybu wynosi 96.00%. Maksymalna wygrana w każdym trybie wynosi 25000 razy stawka.",
      "payTitle": "Tabela wypłat",
      "waysTitle": "Powstawanie wygranych",
      "ways": "Klaster co najmniej 5 jednakowych symboli wypłaca wartość z tabeli dla swojej wielkości. Wygrywające symbole znikają, symbole nad nimi opadają, a nowe je uzupełniają. Powtarza się to, dopóki powstają kolejne wygrywające klastry. Nie ma symboli wild. Bloom Gate nie wypłaca wygranej, lecz uruchamia darmowe obroty.",
      "featTitle": "Funkcje",
      "chestsTitle": "Lotosy",
      "chests": [
        "Pod każdym bębnem znajduje się złoty lotos. Lotosy są aktywne w Bloom Raid, Storm Raid i wszystkich rundach darmowych obrotów, nigdy w grze podstawowej.",
        "Rząd bębna zostaje wygrany, gdy znajdujący się w nim symbol należy do wygrywającego klastra. Wygrane rzędy zachowują się przez wszystkie kaskady i darmowe obroty do końca rundy. Lotos otwiera się po wygraniu rzędów wymaganych przez dany tryb.",
        "Na koniec funkcji każdy otwarty lotos ujawnia 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x lub 100x. Mnożniki mnoży się przez siebie: 5x, 3x i 2x dają 30x. Zamknięty lotos liczy się jako 1x.",
        "Podczas darmowych obrotów łączny mnożnik dotyczy wyłącznie sumy wygranych z tych obrotów. Wygrana obrotu uruchamiającego funkcję jest dodawana osobno i nie jest mnożona przez lotosy. W Bloom Raid i Storm Raid mnożona jest wygrana jednego obrotu danego trybu, wraz z jego kaskadami."
      ],
      "halo": [
        "3, 4 lub 5 symboli Bloom Gate uruchamia odpowiednio Bloom Bonus, Bloom Super lub Bloom Epic, po 10 darmowych obrotów każdy. Każdy Bloom Gate podczas darmowych obrotów dodaje 1 darmowy obrót.",
        "Bloom Bonus i Bloom Super wymagają wygrania wszystkich 5 rzędów bębna. W Bloom Epic wystarczą 3 środkowe rzędy. W Bloom Super, Bloom Epic i Storm Raid każdy otwarty lotos ma co najmniej 5x."
      ],
      "mystery": "MYSTERY losuje wynik przy wejściu: 50% brak funkcji, 40% Bloom Super i 10% Bloom Epic.",
      "modesTitle": "Tryby",
      "controlsTitle": "Sterowanie",
      "controls": [
        [
          "Zakręć",
          "Rozpoczyna rundę z widoczną stawką. Spacja robi to samo."
        ],
        [
          "Stawka ▲ ▼",
          "Zwiększa lub zmniejsza stawkę wśród dostępnych poziomów."
        ],
        [
          "Przycisk funkcji",
          "Otwiera menu funkcji. Każda funkcja najpierw pokazuje koszt i wymaga potwierdzenia."
        ],
        [
          "Wyłącz",
          "Wyłącza aktywny tryb i przywraca zwykły obrót."
        ],
        [
          "Gra automatyczna",
          "Wybierz liczbę obrotów i Start. Przycisk obrotu zatrzymuje grę automatyczną."
        ],
        [
          "Turbo ⚡",
          "Przyspiesza animacje."
        ],
        [
          "Menu ☰",
          "Otwiera informacje oraz głośność efektów i muzyki."
        ],
        [
          "Zamknij ✕",
          "Zamyka menu lub zasady. Kliknięcie poza menu również je zamyka."
        ],
        [
          "Powtórka: Odtwórz / Obejrzyj ponownie",
          "Odtwarza tę samą załadowaną rundę, bez rozpoczynania nowej."
        ],
        [
          "Naciśnij, aby kontynuować",
          "Początek bonusu i Total Win czekają na kliknięcie lub klawisz. Można też w ten sposób pominąć ekran wygranej."
        ]
      ],
      "generalTitle": "Informacje ogólne",
      "general": [
        "Wszystkie wygrane i kombinacje są zgodne z tabelą wypłat.",
        "Awaria unieważnia wszystkie wygrane i gry.",
        "Wymagane jest stabilne połączenie internetowe. Po rozłączeniu załaduj grę ponownie, aby dokończyć otwarte rundy. Stawka niedokończonej rundy pozostaje zachowana do jej zakończenia.",
        "Oczekiwany zwrot jest obliczany dla wielu gier.",
        "Obraz ma charakter ilustracyjny i nie przedstawia rzeczywistego urządzenia fizycznego.",
        "Wygrane rozlicza się według kwoty otrzymanej z Remote Game Server, a nie zdarzeń w przeglądarce.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Link powtórki jest niekompletny.",
      "unavailable": "Powtórka jest niedostępna.",
      "notFound": "Nie znaleziono powtórki.",
      "invalid": "Dane powtórki są nieprawidłowe.",
      "insecure": "Powtórka wymaga bezpiecznego połączenia."
    }
  },
  "pt": {
    "recovery": {"title": "Rodada pendente", "message": "Esta rodada já começou. Continue sem outro desconto no saldo.", "resume": "Continuar rodada", "errorTitle": "Verifique a conexão", "error": "Não foi possível confirmar o estado da rodada. Recarregue para sincronizar o saldo e concluir qualquer rodada pendente antes de começar outra.", "reload": "Recarregar"},
    "balance": "Saldo",
    "win": "Ganho",
    "bet": "Aposta",
    "increaseAmount": "Aumentar valor",
    "decreaseAmount": "Diminuir valor",
    "freeSpins": "Rodadas grátis",
    "tapToContinue": "Toque para continuar",
    "disable": "Desativar",
    "activate": "Ativar",
    "buy": "Comprar",
    "confirm": "Confirmar",
    "info": "Informações",
    "close": "Fechar",
    "effectsVolume": "Volume dos efeitos",
    "musicVolume": "Volume da música",
    "muteEffects": "Silenciar efeitos",
    "unmuteEffects": "Ativar efeitos",
    "muteMusic": "Silenciar música",
    "unmuteMusic": "Ativar música",
    "audioCredit": "Música e sons originais — Paradise Bloom.",
    "autoplay": "Jogo automático",
    "autoStart": "Iniciar",
    "autoStop": "Parar jogo automático",
    "spins": "rodadas",
    "insufficient": "Saldo insuficiente.",
    "amountUnavailable": "Esta aposta não está mais disponível. Escolha um valor permitido usando as setas.",
    "sessionExpired": "A sessão expirou. Abra o jogo novamente.",
    "limits": "Limite de jogo atingido.",
    "connection": "Problema de conexão. Tente novamente.",
    "connectFail": "Não foi possível conectar ao servidor do jogo.",
    "loading": "Carregando…",
    "replay": "Repetição",
    "playReplay": "Assistir",
    "playing": "Reproduzindo…",
    "replayAgain": "Assistir novamente",
    "realCost": "Custo total",
    "noFeature": "Sem recurso",
    "freeSpinsN": "{n} rodadas grátis",
    "minimum": "mínimo",
    "spin": "Girar",
    "features": "Recursos",
    "menu": "Menu",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, ganho máximo 25000x.",
    "introDescriptions": [
      "Um lótus dourado sob cada rolo",
      "Ganhe nas linhas de um rolo para abrir seu lótus",
      "Os lótus abertos se multiplicam entre si. Ganhe até 25000x!"
    ],
    "featureSub": {
      "bonus": "Ganhe nas 5 linhas de um rolo para abrir seu lótus",
      "super": "Ganhe nas 5 linhas — cada lótus aberto vale pelo menos 5x",
      "epic": "Ganhe nas 3 linhas centrais — cada lótus aberto vale pelo menos 5x"
    },
    "modeText": {
      "extra_chance": "Cada rodada custa 3x. As rodadas grátis são ativadas em cerca de 1.6404% das rodadas, 4.51 vezes a frequência normal.",
      "super_chance": "Cada rodada custa 6x. As rodadas grátis são ativadas em cerca de 1.9386% das rodadas, 5.33 vezes a frequência normal, com maior proporção de Bloom Super e Bloom Epic.",
      "raid": "Uma rodada reforçada com lótus ativos. Ganhar apenas na linha central de um rolo abre seu lótus.",
      "storm": "Uma rodada especialmente reforçada com lótus ativos. Cada lótus aberto vale pelo menos 5x.",
      "bonus": "10 rodadas grátis. Um lótus abre quando as 5 linhas do seu rolo tiverem ganhado.",
      "super": "10 rodadas grátis. Cada lótus aberto vale pelo menos 5x.",
      "mystery": "O resultado é sorteado na entrada: 50% sem recurso, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Regras do jogo",
      "intro": "Paradise Bloom é um jogo de grupos em uma grade 5x5 com ganhos em cascata. Um grupo tem 5 ou mais símbolos iguais conectados na horizontal ou vertical. O RTP teórico de todos os modos é 96.00%. O ganho máximo de todos os modos é 25000 vezes a aposta.",
      "payTitle": "Tabela de pagamentos",
      "waysTitle": "Como os ganhos são formados",
      "ways": "Cada grupo de pelo menos 5 símbolos iguais paga o valor indicado para seu tamanho. Os símbolos vencedores desaparecem, os de cima caem e novos símbolos chegam. Isso continua enquanto novos grupos vencedores se formarem. Não há símbolos wild. Bloom Gate não paga; ativa rodadas grátis.",
      "featTitle": "Recursos",
      "chestsTitle": "Lótus",
      "chests": [
        "Há um lótus dourado sob cada rolo. Os lótus ficam ativos em Bloom Raid, Storm Raid e todas as rodadas grátis, nunca no jogo base.",
        "Uma linha de um rolo é vencida quando seu símbolo faz parte de um grupo vencedor. As linhas vencidas ficam acumuladas por todas as cascatas e rodadas grátis até o fim da rodada completa. Ao completar as linhas exigidas pelo modo, o lótus abre.",
        "No fim do recurso, cada lótus aberto revela 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x ou 100x. Os multiplicadores se multiplicam: 5x, 3x e 2x resultam em 30x. Um lótus fechado conta como 1x.",
        "Nas rodadas grátis, o multiplicador combinado se aplica somente ao total ganho nessas rodadas. O ganho da rodada que ativou o recurso é somado separadamente e não é multiplicado pelos lótus. Em Bloom Raid e Storm Raid, o multiplicador se aplica ao ganho da única rodada do modo, incluindo suas cascatas."
      ],
      "halo": [
        "3, 4 ou 5 símbolos Bloom Gate ativam, respectivamente, Bloom Bonus, Bloom Super ou Bloom Epic, cada um com 10 rodadas grátis. Cada Bloom Gate que cai nas rodadas grátis acrescenta 1 rodada grátis.",
        "Bloom Bonus e Bloom Super exigem ganhos nas 5 linhas de um rolo para abrir seu lótus. Em Bloom Epic bastam as 3 linhas centrais. Em Bloom Super, Bloom Epic e Storm Raid, cada lótus aberto vale pelo menos 5x."
      ],
      "mystery": "MYSTERY sorteia o resultado na entrada: 50% sem recurso, 40% Bloom Super e 10% Bloom Epic.",
      "modesTitle": "Modos",
      "controlsTitle": "Controles",
      "controls": [
        [
          "Girar",
          "Inicia uma rodada com a aposta exibida. A barra de espaço faz o mesmo."
        ],
        [
          "Aposta ▲ ▼",
          "Aumenta ou diminui a aposta entre os níveis disponíveis."
        ],
        [
          "Botão de recursos",
          "Abre o menu de recursos. Cada recurso exibe seu custo e pede confirmação antes de começar."
        ],
        [
          "Desativar",
          "Desliga o modo ativo e retorna à rodada normal."
        ],
        [
          "Jogo automático",
          "Escolha o número de rodadas e toque em Iniciar. O botão de girar para o jogo automático."
        ],
        [
          "Turbo ⚡",
          "Acelera as animações."
        ],
        [
          "Menu ☰",
          "Abre as informações e os volumes dos efeitos e da música."
        ],
        [
          "Fechar ✕",
          "Fecha o menu ou as regras. Tocar fora também fecha os menus."
        ],
        [
          "Repetição: Assistir / Assistir novamente",
          "Reproduz a mesma rodada carregada. Esses botões não iniciam uma nova rodada."
        ],
        [
          "Toque para continuar",
          "O início do bônus e Total Win aguardam um toque ou tecla. Isso também permite pular as telas de ganho."
        ]
      ],
      "generalTitle": "Geral",
      "general": [
        "Todos os ganhos e combinações seguem a tabela de pagamentos.",
        "Uma falha de funcionamento anula todos os ganhos e jogadas.",
        "É necessária uma conexão estável. Após uma desconexão, recarregue o jogo para concluir as rodadas pendentes. A aposta de uma rodada pendente é mantida até sua conclusão.",
        "O retorno esperado é calculado ao longo de muitas jogadas.",
        "A representação é apenas ilustrativa e não corresponde a um dispositivo físico real.",
        "Os ganhos são liquidados pelo valor recebido do Remote Game Server, não pelos eventos no navegador.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "O link da repetição está incompleto.",
      "unavailable": "Repetição indisponível.",
      "notFound": "Repetição não encontrada.",
      "invalid": "Os dados da repetição são inválidos.",
      "insecure": "A repetição exige uma conexão segura."
    }
  },
  "tr": {
    "recovery": {"title": "Tamamlanmamış tur", "message": "Bu tur zaten başlamıştı. Bakiyeden yeniden düşülmeden devam edin.", "resume": "Tura devam et", "errorTitle": "Bağlantıyı kontrol et", "error": "Tur durumu doğrulanamadı. Bakiyeyi eşitlemek ve yeni bir tura başlamadan önce tamamlanmamış turu bitirmek için yeniden yükleyin.", "reload": "Yeniden yükle"},
    "balance": "Bakiye",
    "win": "Kazanç",
    "bet": "Bahis",
    "increaseAmount": "Tutarı artır",
    "decreaseAmount": "Tutarı azalt",
    "freeSpins": "Ücretsiz dönüşler",
    "tapToContinue": "Devam etmek için dokun",
    "disable": "Kapat",
    "activate": "Etkinleştir",
    "buy": "Satın al",
    "confirm": "Onayla",
    "info": "Bilgi",
    "close": "Kapat",
    "effectsVolume": "Efekt sesi",
    "musicVolume": "Müzik sesi",
    "muteEffects": "Efektleri sustur",
    "unmuteEffects": "Efektleri aç",
    "muteMusic": "Müziği sustur",
    "unmuteMusic": "Müziği aç",
    "audioCredit": "Özgün müzik ve sesler — Paradise Bloom.",
    "autoplay": "Otomatik oyun",
    "autoStart": "Başlat",
    "autoStop": "Otomatik oyunu durdur",
    "spins": "dönüş",
    "insufficient": "Yetersiz bakiye.",
    "amountUnavailable": "Bu bahis artık kullanılamıyor. Oklarla izin verilen bir tutar seç.",
    "sessionExpired": "Oturum süresi doldu. Oyunu yeniden aç.",
    "limits": "Oyun sınırına ulaşıldı.",
    "connection": "Bağlantı sorunu. Lütfen yeniden dene.",
    "connectFail": "Oyun sunucusuna bağlanılamadı.",
    "loading": "Yükleniyor…",
    "replay": "Tekrar",
    "playReplay": "İzle",
    "playing": "Oynatılıyor…",
    "replayAgain": "Yeniden izle",
    "realCost": "Toplam tutar",
    "noFeature": "Özellik yok",
    "freeSpinsN": "{n} ücretsiz dönüş",
    "minimum": "en az",
    "spin": "Döndür",
    "features": "Özellikler",
    "menu": "Menü",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, azami kazanç 25000x.",
    "introDescriptions": [
      "Her makaranın altında altın bir lotus",
      "Lotusu açmak için makaranın sıralarında kazan",
      "Açık lotuslar birbiriyle çarpılır. 25000x’e kadar kazan!"
    ],
    "featureSub": {
      "bonus": "Lotusu açmak için makaranın 5 sırasının tamamında kazan",
      "super": "5 sıranın tamamında kazan — her açık lotus en az 5x",
      "epic": "Ortadaki 3 sırada kazan — her açık lotus en az 5x"
    },
    "modeText": {
      "extra_chance": "Her dönüşün maliyeti 3x’tir. Ücretsiz dönüşler, dönüşlerin yaklaşık 1.6404%’ünde tetiklenir; normal sıklığın 4.51 katıdır.",
      "super_chance": "Her dönüşün maliyeti 6x’tir. Ücretsiz dönüşler, dönüşlerin yaklaşık 1.9386%’ünde tetiklenir; normal sıklığın 5.33 katıdır. Bloom Super ve Bloom Epic payı daha yüksektir.",
      "raid": "Aktif lotuslarla tek bir güçlendirilmiş dönüş. Bir makaranın yalnızca orta sırasındaki kazanç lotusunu açar.",
      "storm": "Aktif lotuslarla tek bir çok güçlendirilmiş dönüş. Her açık lotus en az 5x değerindedir.",
      "bonus": "10 ücretsiz dönüş. Bir makaranın 5 sırasının tamamı kazandığında lotusu açılır.",
      "super": "10 ücretsiz dönüş. Her açık lotus en az 5x değerindedir.",
      "mystery": "Sonuç girişte belirlenir: 50% özellik yok, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Oyun kuralları",
      "intro": "Paradise Bloom, kazanan sembollerin düşerek yenilendiği 5x5 küme oyunudur. Bir küme yatay veya dikey bağlı en az 5 aynı sembolden oluşur. Tüm modların teorik RTP değeri 96.00%, azami kazancı ise bahsin 25000 katıdır.",
      "payTitle": "Ödeme tablosu",
      "waysTitle": "Kazançların oluşumu",
      "ways": "En az 5 aynı sembolden oluşan her küme, büyüklüğüne göre tablodaki değeri öder. Kazanan semboller kaybolur, üsttekiler aşağı düşer ve yenileri gelir. Yeni kazanan kümeler oluştuğu sürece devam eder. Wild sembolü yoktur. Bloom Gate ödeme yapmaz; ücretsiz dönüşleri tetikler.",
      "featTitle": "Özellikler",
      "chestsTitle": "Lotuslar",
      "chests": [
        "Her makaranın altında altın bir lotus bulunur. Lotuslar Bloom Raid, Storm Raid ve tüm ücretsiz dönüş turlarında aktiftir; ana oyunda aktif değildir.",
        "Bir makaranın sırasındaki sembol kazanan kümeye katıldığında o sıra kazanılmış sayılır. Kazanılmış sıralar tüm düşüşler ve ücretsiz dönüşler boyunca tur sonuna kadar korunur. Modun gerektirdiği sıralar kazanılınca lotus açılır.",
        "Özelliğin sonunda her açık lotus 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x veya 100x gösterir. Çarpanlar birbiriyle çarpılır: 5x, 3x ve 2x toplam 30x verir. Kapalı lotus 1x sayılır.",
        "Ücretsiz dönüşlerde birleşik çarpan yalnızca ücretsiz dönüşlerin toplam kazancına uygulanır. Ücretsiz dönüşleri başlatan dönüşün kazancı ayrı eklenir ve lotuslarla çarpılmaz. Bloom Raid ve Storm Raid’de modun tek dönüşünün düşüşler dahil kazancı çarpılır."
      ],
      "halo": [
        "3, 4 veya 5 Bloom Gate sırasıyla Bloom Bonus, Bloom Super veya Bloom Epic başlatır; her biri 10 ücretsiz dönüş verir. Ücretsiz dönüşlerde gelen her Bloom Gate 1 ücretsiz dönüş ekler.",
        "Bloom Bonus ve Bloom Super’de lotus için makaranın 5 sırasının tamamı kazanmalıdır. Bloom Epic’te ortadaki 3 sıra yeterlidir. Bloom Super, Bloom Epic ve Storm Raid’de her açık lotus en az 5x’tir."
      ],
      "mystery": "MYSTERY sonucu girişte belirler: 50% özellik yok, 40% Bloom Super ve 10% Bloom Epic.",
      "modesTitle": "Modlar",
      "controlsTitle": "Kontroller",
      "controls": [
        [
          "Döndür",
          "Gösterilen bahisle bir tur başlatır. Boşluk tuşu da aynı işlevdedir."
        ],
        [
          "Bahis ▲ ▼",
          "Bahsi izin verilen seviyeler arasında artırır veya azaltır."
        ],
        [
          "Özellik düğmesi",
          "Özellik menüsünü açar. Her özellik önce maliyetini gösterir ve onay ister."
        ],
        [
          "Kapat",
          "Aktif modu kapatıp normal dönüşe geri döner."
        ],
        [
          "Otomatik oyun",
          "Dönüş sayısını seçip Başlat’a bas. Dönüş düğmesi otomatik oyunu durdurur."
        ],
        [
          "Turbo ⚡",
          "Animasyonları hızlandırır."
        ],
        [
          "Menü ☰",
          "Bilgiyi, efekt ve müzik ses düzeylerini açar."
        ],
        [
          "Kapat ✕",
          "Menüyü veya kuralları kapatır. Menü dışına dokunmak da menüyü kapatır."
        ],
        [
          "Tekrar: İzle / Yeniden izle",
          "Yüklenmiş aynı turu tekrar oynatır, yeni tur başlatmaz."
        ],
        [
          "Devam etmek için dokun",
          "Bonus başlangıcı ve Total Win bir dokunuş veya tuş bekler. Kazanç ekranları da bu şekilde atlanabilir."
        ]
      ],
      "generalTitle": "Genel",
      "general": [
        "Tüm kazançlar ve kombinasyonlar ödeme tablosuna göre gösterilir.",
        "Arıza tüm kazançları ve oyunları geçersiz kılar.",
        "Sabit internet bağlantısı gerekir. Bağlantı kesilirse açık turları tamamlamak için oyunu yeniden yükle. Bitmemiş turun bahsi tamamlanana kadar korunur.",
        "Beklenen geri dönüş çok sayıda oyun üzerinden hesaplanır.",
        "Görüntü gerçek bir fiziksel aygıtı temsil etmez; yalnızca görseldir.",
        "Kazançlar tarayıcıdaki olaylara değil, Remote Game Server’dan alınan tutara göre hesaplanır.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Tekrar bağlantısı eksik.",
      "unavailable": "Tekrar kullanılamıyor.",
      "notFound": "Tekrar bulunamadı.",
      "invalid": "Tekrar verileri geçersiz.",
      "insecure": "Tekrar için güvenli bağlantı gerekir."
    }
  },
  "vi": {
    "recovery": {"title": "Vòng chưa hoàn tất", "message": "Vòng này đã bắt đầu. Tiếp tục mà không trừ thêm số dư.", "resume": "Tiếp tục vòng", "errorTitle": "Kiểm tra kết nối", "error": "Không thể xác nhận trạng thái vòng. Tải lại để đồng bộ số dư và hoàn tất vòng còn dang dở trước khi bắt đầu vòng mới.", "reload": "Tải lại"},
    "balance": "Số dư",
    "win": "Thắng",
    "bet": "Cược",
    "increaseAmount": "Tăng số tiền",
    "decreaseAmount": "Giảm số tiền",
    "freeSpins": "Vòng quay miễn phí",
    "tapToContinue": "Chạm để tiếp tục",
    "disable": "Tắt",
    "activate": "Kích hoạt",
    "buy": "Mua",
    "confirm": "Xác nhận",
    "info": "Thông tin",
    "close": "Đóng",
    "effectsVolume": "Âm lượng hiệu ứng",
    "musicVolume": "Âm lượng nhạc",
    "muteEffects": "Tắt âm hiệu ứng",
    "unmuteEffects": "Bật âm hiệu ứng",
    "muteMusic": "Tắt nhạc",
    "unmuteMusic": "Bật nhạc",
    "audioCredit": "Nhạc và âm thanh gốc — Paradise Bloom.",
    "autoplay": "Chơi tự động",
    "autoStart": "Bắt đầu",
    "autoStop": "Dừng chơi tự động",
    "spins": "vòng quay",
    "insufficient": "Số dư không đủ.",
    "amountUnavailable": "Mức cược này không còn khả dụng. Hãy dùng mũi tên để chọn số tiền được phép.",
    "sessionExpired": "Phiên đã hết hạn. Hãy mở lại trò chơi.",
    "limits": "Đã đạt giới hạn chơi.",
    "connection": "Lỗi kết nối. Vui lòng thử lại.",
    "connectFail": "Không thể kết nối với máy chủ trò chơi.",
    "loading": "Đang tải…",
    "replay": "Xem lại",
    "playReplay": "Phát",
    "playing": "Đang phát…",
    "replayAgain": "Xem lại lần nữa",
    "realCost": "Tổng chi phí",
    "noFeature": "Không có tính năng",
    "freeSpinsN": "{n} vòng quay miễn phí",
    "minimum": "tối thiểu",
    "spin": "Quay",
    "features": "Tính năng",
    "menu": "Trình đơn",
    "turbo": "Turbo",
    "modeStats": "RTP 96.00%, thắng tối đa 25000x.",
    "introDescriptions": [
      "Một bông sen vàng dưới mỗi cuộn",
      "Thắng ở các hàng của cuộn để mở bông sen",
      "Các hệ số sen đang mở nhân với nhau. Thắng tới 25000x!"
    ],
    "featureSub": {
      "bonus": "Thắng ở cả 5 hàng của một cuộn để mở bông sen",
      "super": "Thắng ở cả 5 hàng — mỗi bông sen mở ít nhất 5x",
      "epic": "Thắng ở 3 hàng giữa — mỗi bông sen mở ít nhất 5x"
    },
    "modeText": {
      "extra_chance": "Mỗi vòng quay có giá 3x. Vòng quay miễn phí được kích hoạt ở khoảng 1.6404% số vòng, gấp 4.51 lần mức bình thường.",
      "super_chance": "Mỗi vòng quay có giá 6x. Vòng quay miễn phí được kích hoạt ở khoảng 1.9386% số vòng, gấp 5.33 lần mức bình thường, với tỷ lệ Bloom Super và Bloom Epic cao hơn.",
      "raid": "Một vòng quay tăng cường với sen hoạt động. Chỉ cần thắng ở hàng giữa của cuộn để mở sen.",
      "storm": "Một vòng quay tăng cường đặc biệt với sen hoạt động. Mỗi bông sen mở có hệ số ít nhất 5x.",
      "bonus": "10 vòng quay miễn phí. Sen mở khi cả 5 hàng của cuộn đó đã thắng.",
      "super": "10 vòng quay miễn phí. Mỗi bông sen mở có hệ số ít nhất 5x.",
      "mystery": "Kết quả được chọn khi vào: 50% không có tính năng, 40% Bloom Super, 10% Bloom Epic."
    },
    "rules": {
      "title": "Luật chơi",
      "intro": "Paradise Bloom là trò chơi cụm 5x5 với thắng liên tiếp nhờ biểu tượng rơi. Một cụm gồm ít nhất 5 biểu tượng giống nhau nối theo chiều ngang hoặc dọc. RTP lý thuyết của mọi chế độ là 96.00%. Mức thắng tối đa của mọi chế độ là 25000 lần tiền cược.",
      "payTitle": "Bảng trả thưởng",
      "waysTitle": "Cách hình thành lượt thắng",
      "ways": "Mỗi cụm ít nhất 5 biểu tượng giống nhau trả giá trị trong bảng theo kích thước cụm. Biểu tượng thắng biến mất, biểu tượng phía trên rơi xuống và biểu tượng mới xuất hiện. Quá trình tiếp tục khi còn cụm thắng mới. Không có biểu tượng wild. Bloom Gate không trả thưởng mà kích hoạt vòng quay miễn phí.",
      "featTitle": "Tính năng",
      "chestsTitle": "Hoa sen",
      "chests": [
        "Có một bông sen vàng dưới mỗi cuộn. Sen hoạt động trong Bloom Raid, Storm Raid và mọi lượt chơi vòng quay miễn phí, không hoạt động trong trò chơi cơ bản.",
        "Một hàng của cuộn được tính là đã thắng khi biểu tượng của hàng đó thuộc cụm thắng. Các hàng đã thắng được giữ qua các đợt rơi và vòng quay miễn phí đến cuối lượt chơi. Sen mở khi các hàng mà chế độ yêu cầu đã thắng.",
        "Cuối tính năng, mỗi bông sen mở cho hệ số 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x, 25x, 50x hoặc 100x. Các hệ số nhân với nhau: 5x, 3x và 2x thành 30x. Sen đóng được tính là 1x.",
        "Trong vòng quay miễn phí, hệ số tổng chỉ nhân với tổng tiền thắng từ các vòng quay miễn phí. Tiền thắng của vòng kích hoạt được cộng riêng và không nhân với sen. Trong Bloom Raid và Storm Raid, hệ số nhân với tiền thắng của vòng quay duy nhất trong chế độ đó, gồm cả các đợt biểu tượng rơi."
      ],
      "halo": [
        "3, 4 hoặc 5 Bloom Gate lần lượt kích hoạt Bloom Bonus, Bloom Super hoặc Bloom Epic, mỗi loại có 10 vòng quay miễn phí. Mỗi Bloom Gate xuất hiện trong vòng quay miễn phí cộng thêm 1 vòng quay miễn phí.",
        "Bloom Bonus và Bloom Super yêu cầu thắng ở cả 5 hàng của cuộn để mở sen. Bloom Epic chỉ cần 3 hàng giữa. Trong Bloom Super, Bloom Epic và Storm Raid, mỗi bông sen mở có hệ số ít nhất 5x."
      ],
      "mystery": "MYSTERY chọn kết quả khi vào: 50% không có tính năng, 40% Bloom Super và 10% Bloom Epic.",
      "modesTitle": "Chế độ",
      "controlsTitle": "Điều khiển",
      "controls": [
        [
          "Quay",
          "Bắt đầu lượt chơi với mức cược hiển thị. Phím cách cũng làm như vậy."
        ],
        [
          "Cược ▲ ▼",
          "Tăng hoặc giảm tiền cược theo các mức được phép."
        ],
        [
          "Nút tính năng",
          "Mở trình đơn tính năng. Mỗi tính năng hiển thị chi phí và yêu cầu xác nhận trước."
        ],
        [
          "Tắt",
          "Tắt chế độ hiện tại và trở lại vòng quay thường."
        ],
        [
          "Chơi tự động",
          "Chọn số vòng và Bắt đầu. Nút quay dừng chơi tự động."
        ],
        [
          "Turbo ⚡",
          "Tăng tốc hoạt ảnh."
        ],
        [
          "Trình đơn ☰",
          "Mở thông tin và âm lượng hiệu ứng, nhạc."
        ],
        [
          "Đóng ✕",
          "Đóng trình đơn hoặc luật chơi. Chạm bên ngoài cũng đóng trình đơn."
        ],
        [
          "Xem lại: Phát / Xem lại lần nữa",
          "Phát cùng lượt chơi đã tải, không tạo lượt chơi mới."
        ],
        [
          "Chạm để tiếp tục",
          "Màn hình bắt đầu bonus và Total Win chờ chạm hoặc phím. Cách này cũng bỏ qua màn hình thắng."
        ]
      ],
      "generalTitle": "Thông tin chung",
      "general": [
        "Mọi tiền thắng và tổ hợp thắng tuân theo bảng trả thưởng.",
        "Sự cố khiến mọi khoản thắng và lượt chơi mất hiệu lực.",
        "Cần kết nối internet ổn định. Nếu mất kết nối, tải lại trò chơi để hoàn tất lượt còn dang dở. Tiền cược của lượt dang dở được giữ đến khi lượt đó hoàn tất.",
        "Tỷ lệ hoàn trả kỳ vọng được tính trên nhiều lượt chơi.",
        "Hình ảnh chỉ mang tính minh họa, không đại diện cho thiết bị vật lý thực.",
        "Tiền thắng được quyết định theo số tiền nhận từ Remote Game Server, không theo sự kiện trong trình duyệt.",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "Liên kết xem lại chưa đầy đủ.",
      "unavailable": "Không thể xem lại.",
      "notFound": "Không tìm thấy bản xem lại.",
      "invalid": "Dữ liệu xem lại không hợp lệ.",
      "insecure": "Xem lại cần kết nối an toàn."
    }
  },
  "zh": {
    "recovery": {"title": "未完成的回合", "message": "此回合已开始。继续时不会再次扣除余额。", "resume": "继续回合", "errorTitle": "检查连接", "error": "无法确认回合状态。请重新加载以同步余额，并完成未结束的回合后再开始新回合。", "reload": "重新加载"},
    "balance": "余额",
    "win": "赢额",
    "bet": "投注",
    "increaseAmount": "增加金额",
    "decreaseAmount": "减少金额",
    "freeSpins": "免费旋转",
    "tapToContinue": "点击继续",
    "disable": "关闭",
    "activate": "启用",
    "buy": "购买",
    "confirm": "确认",
    "info": "游戏信息",
    "close": "关闭",
    "effectsVolume": "音效音量",
    "musicVolume": "音乐音量",
    "muteEffects": "关闭音效",
    "unmuteEffects": "开启音效",
    "muteMusic": "关闭音乐",
    "unmuteMusic": "开启音乐",
    "audioCredit": "原创音乐与音效 — Paradise Bloom。",
    "autoplay": "自动游戏",
    "autoStart": "开始",
    "autoStop": "停止自动游戏",
    "spins": "次旋转",
    "insufficient": "余额不足。",
    "amountUnavailable": "此投注金额已不可用。请用上下箭头选择可用金额。",
    "sessionExpired": "会话已过期，请重新打开游戏。",
    "limits": "已达到游戏限额。",
    "connection": "连接异常，请重试。",
    "connectFail": "无法连接游戏服务器。",
    "loading": "正在加载…",
    "replay": "回放",
    "playReplay": "播放",
    "playing": "播放中…",
    "replayAgain": "再次观看",
    "realCost": "总费用",
    "noFeature": "无功能",
    "freeSpinsN": "{n}次免费旋转",
    "minimum": "最低",
    "spin": "旋转",
    "features": "功能",
    "menu": "菜单",
    "turbo": "加速",
    "modeStats": "RTP 96.00%，最高赢额25000x。",
    "introDescriptions": [
      "每个转轴下方都有一朵金莲",
      "在转轴各行赢取奖励以开启莲花",
      "开启的莲花倍数相乘，最高可赢25000x！"
    ],
    "featureSub": {
      "bonus": "在一个转轴的全部5行获胜，即可开启莲花",
      "super": "全部5行获胜 — 每朵开启的莲花最低5x",
      "epic": "中间3行获胜 — 每朵开启的莲花最低5x"
    },
    "modeText": {
      "extra_chance": "每次旋转费用为3x。免费旋转触发率约为1.6404%，是普通模式的4.51倍。",
      "super_chance": "每次旋转费用为6x。免费旋转触发率约为1.9386%，是普通模式的5.33倍，且Bloom Super和Bloom Epic的占比更高。",
      "raid": "进行一次启用莲花的强化旋转。只需在转轴中间一行获胜即可开启该轴莲花。",
      "storm": "进行一次启用莲花的特别强化旋转。每朵开启的莲花最低5x。",
      "bonus": "10次免费旋转。一个转轴的全部5行都获胜后，莲花开启。",
      "super": "10次免费旋转，每朵开启的莲花最低5x。",
      "mystery": "进入时随机决定结果：50%无功能、40% Bloom Super、10% Bloom Epic。"
    },
    "rules": {
      "title": "游戏规则",
      "intro": "Paradise Bloom是一款5x5集群式游戏，可通过符号下落产生连锁赢额。同类符号横向或纵向相连，达到5个或以上即构成集群。所有模式的理论RTP均为96.00%，最高赢额均为投注的25000倍。",
      "payTitle": "赔付表",
      "waysTitle": "获胜方式",
      "ways": "由至少5个同类符号组成的集群，按照其大小获得表中对应奖励。获胜符号消失，上方符号下落并补入新符号；只要产生新的获胜集群就会继续。游戏没有百搭符号。Bloom Gate本身不赔付，仅触发免费旋转。",
      "featTitle": "功能",
      "chestsTitle": "莲花",
      "chests": [
        "每个转轴下方都有一朵金莲。莲花在Bloom Raid、Storm Raid及所有免费旋转回合中启用，在基础游戏中不启用。",
        "当某一行的符号属于获胜集群时，该转轴的这一行被标记为已获胜。标记会在连锁下落和免费旋转过程中持续累积，直到整个回合结束。达到当前模式要求的行数后，莲花开启。",
        "功能结束时，每朵开启的莲花会显示2x、3x、4x、5x、6x、7x、8x、9x、10x、25x、50x或100x。各倍数相乘：5x、3x和2x合计为30x。未开启的莲花按1x计算。",
        "在免费旋转中，合计莲花倍数只作用于免费旋转所得的总赢额。触发免费旋转的那次旋转赢额另行相加，不乘莲花倍数。在Bloom Raid和Storm Raid中，倍数作用于该模式唯一一次旋转的赢额，包括其全部连锁下落。"
      ],
      "halo": [
        "3个、4个或5个Bloom Gate分别触发Bloom Bonus、Bloom Super或Bloom Epic，均获得10次免费旋转。免费旋转期间，每落下一个Bloom Gate就增加1次免费旋转。",
        "Bloom Bonus和Bloom Super需在转轴全部5行获胜，才能开启莲花。Bloom Epic只需中间3行。在Bloom Super、Bloom Epic和Storm Raid中，每朵开启的莲花最低5x。"
      ],
      "mystery": "MYSTERY在进入时随机决定结果：50%无功能、40% Bloom Super、10% Bloom Epic。",
      "modesTitle": "模式",
      "controlsTitle": "操作说明",
      "controls": [
        [
          "旋转",
          "以显示的投注金额开始回合。空格键功能相同。"
        ],
        [
          "投注 ▲ ▼",
          "在允许的档位内增加或减少投注金额。"
        ],
        [
          "功能按钮",
          "打开功能菜单。每项功能均先显示费用并要求确认。"
        ],
        [
          "关闭",
          "关闭当前模式并返回普通旋转。"
        ],
        [
          "自动游戏",
          "选择旋转次数后点击开始。旋转按钮可停止自动游戏。"
        ],
        [
          "加速 ⚡",
          "加快动画播放速度。"
        ],
        [
          "菜单 ☰",
          "打开游戏信息、音效音量和音乐音量设置。"
        ],
        [
          "关闭 ✕",
          "关闭菜单或规则。点击菜单外部也可关闭菜单。"
        ],
        [
          "回放：播放／再次观看",
          "播放已加载的同一个回合，不会开始新回合。"
        ],
        [
          "点击继续",
          "奖励开始画面和Total Win等待点击或按键。也可用同样操作跳过赢额画面。"
        ]
      ],
      "generalTitle": "通用说明",
      "general": [
        "所有赢额和获胜组合均以赔付表为准。",
        "发生故障时，所有赢额及游戏作废。",
        "需要稳定的互联网连接。断线后请重新加载游戏，以完成未结束的回合。未完成回合的投注金额会保留至该回合结束。",
        "预期回报率按大量游戏计算。",
        "画面仅供展示，不代表真实的物理设备。",
        "赢额以Remote Game Server返回的金额结算，而非浏览器内的事件。",
        "TM and © 2026 Engine."
      ]
    },
    "replayErrors": {
      "incomplete": "回放链接不完整。",
      "unavailable": "回放不可用。",
      "notFound": "未找到回放。",
      "invalid": "回放数据无效。",
      "insecure": "回放需要安全连接。"
    }
  }
};
