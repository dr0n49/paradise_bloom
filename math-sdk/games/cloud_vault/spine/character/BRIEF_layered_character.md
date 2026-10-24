# Героиня под анимацию — что сгенерировать

Почему нынешняя героиня не оживает: это одна готовая картина V28 (с тенями, бликами, мелкой прорисовкой),
грубо нарезанная на куски. Концы прядей обрублены, за рукой и волосами ничего не нарисовано, поэтому любое
заметное движение режет и мажет картинку. У Sky Drop героиня нарисована специально под анимацию:
чистый контур, плоская заливка в 2–3 тона, каждая часть отдельным слоем и дорисована целиком, а глаза, рот
и кисть руки имеют по нескольку вариантов. Птичка — отдельная фигурка с крыльями в нескольких положениях.

## 1. Мастер-кадр (сначала только он)

Один кадр героини в финальной позе, по нему потом режутся слои.

```
2D slot game character, full body, original elf angel heroine with long flowing blonde hair, small white
feathered wings on the head, thin golden halo, white and pale-blue dress with gold trim and blue gems.
She sits sideways on a soft pastel cloud, body turned three-quarters to the LEFT, legs crossed,
one hand resting on the cloud, the other hand raised near her face with the index finger pointing up
(a tiny bird will perch on it), gentle smile, looking at her raised finger.
Compact silhouette that fits a 4:5 box; long hair flows to the right and down behind her.
Clean thick dark outlines, flat cel shading with 2-3 tones, bright pastel palette, no painterly texture,
no noise, no text. Plain flat #00FF00 green background, character centred, 2048x2560.
```

## 2. Слои (каждый — PNG 2048×2560 с прозрачным фоном, ровно на месте мастер-кадра)

Главное правило: части, закрытые другими частями, **дорисованы целиком** (тело под рукой, шея под
волосами, волосы за спиной). Размер холста и положение у всех файлов одинаковые.

| файл | что внутри |
|---|---|
| `hair_back.png` | все волосы за телом и головой, целиком |
| `cloud_back.png` / `cloud_front.png` | облако за ней и клочья облака перед ногами |
| `body.png` | тело с платьем и ногами **без рук, без головы и шеи**, плечи дорисованы |
| `dress_tail.png` | развевающийся хвост платья отдельно |
| `neck.png` | шея |
| `arm_rest.png` | рука, лежащая на облаке (плечо → кисть) |
| `arm_up_upper.png` / `arm_up_fore.png` | поднятая рука: плечо и предплечье отдельно |
| `hand_point.png` / `hand_open.png` / `hand_cheer.png` | кисть поднятой руки: палец вверх, раскрытая ладонь, кулачок «ура» |
| `head.png` | голова без чёлки и боковых прядей, **без глаз и рта** (кожа на их месте) |
| `eyes_open.png` / `eyes_half.png` / `eyes_closed.png` / `eyes_happy.png` | глаза: открыты, полуприкрыты, закрыты, «^^» |
| `mouth_smile.png` / `mouth_open.png` / `mouth_o.png` | рот: улыбка, открытая улыбка, «о» |
| `bangs.png` | чёлка |
| `lock_L.png` / `lock_R.png` | боковые пряди у лица |
| `strand_1.png` … `strand_4.png` | 3–4 длинные пряди, которые качаются отдельно |
| `wing_L.png` / `wing_R.png` / `halo.png` | крылышки на голове и нимб |

Как получить слои из мастер-кадра в генераторе (режим редактирования по картинке):

```
Using the attached image, output ONLY the <part> of this character on a transparent background.
Keep the exact same position, scale and canvas size (2048x2560). Paint in every area of the <part>
that is hidden by other parts, so the <part> is complete. Same line art and colours, nothing else.
```

Если проще в Photoshop: вырезать каждую часть на свой слой и заполнить дыры генеративной заливкой,
потом выгрузить слои в PNG того же размера (или прислать PSD).

## 3. Птичка-спутник

Тот же стиль, жёлтая/золотая маленькая птичка размером примерно с её голову ×0.35, вид сбоку.

| файл | что внутри |
|---|---|
| `bird_body.png` | тело с головой и хвостом, без крыльев |
| `bird_wing_up.png` / `bird_wing_mid.png` / `bird_wing_down.png` | крыло в трёх положениях |
| `bird_sit.png` | птичка сидит со сложенными крыльями |

## 4. Куда класть

Все PNG — в `games/cloud_vault/spine/character/layers/` с именами из таблиц (`master.png` тоже туда).
Птичка может быть на своём холсте (например 512×512), но все её картинки — на одном и том же.
Проверка без сборки: `/usr/bin/python3 spine/tools/make_heroine.py --check` (что не хватает, совпадают ли
холсты, есть ли перекрытия в суставах, превью рядом с мастер-кадром в `character/layers_check.png`).
Если сустав определился криво или птичка смотрит вправо — `layers/rig.json`:
`{"bird_faces": "right", "joints": {"shoulder": [x, y]}, "front": ["arm_rest"]}`.

## 5. Что сделаю я

Соберу риг в Spine из этих слоёв: кости и смена картинок (глаза, рот, кисть) работают и в Essential,
так что проект можно будет открыть и править самому; волосы и ткань получат сетки и физику через
`tools/make_character.py`. Анимации повторю по записи эталона: птичка садится на палец, взлетает,
кружит у головы; моргание, улыбка, наклон к птичке; реакции на спин, выигрыш, бонус и большой выигрыш.
Проверка — раскадровки рядом с кадрами записи (`?qa=character&sheet=…`).
