# Kamila — Product Spec

## Що це одним реченням?
AI дзвонить у підтримку замість тебе, знаючи Terms of Service і юридичні лазівки, і вибиває рішення.

## Hook для відео
"Companies hide their refund rules in 50 pages of legal text hoping you won't read it. Kamila reads it in seconds and calls them for you."

---

## Для кого?
Будь-яка людина яка ненавидить дзвонити в підтримку. А це майже всі.

## User flow

1. Користувач завантажує чек / скріншот / фото проблеми
2. Описує проблему текстом ("Замовив піцу годину тому, привезли холодну, хочу повернення")
3. Вводить номер підтримки компанії АБО URL їхнього сайту
4. Натискає "Call for me"
5. Kamila дзвонить на номер підтримки
6. Користувач чує розмову в реальному часі + бачить live транскрипт
7. Kamila аргументовано вимагає рішення, використовуючи Terms of Service і права споживача

---

## Як працює під капотом

**При натисканні "Call for me":**
- Якщо дано URL: Firecrawl **JSON Extract** витягує структуровані дані з Terms of Service:
  ```
  formats: [{ type: "json", prompt: "Extract: return window in days, exceptions, required documents, refund process steps, escalation contacts, customer rights" }]
  ```
  Kamila отримує чисті факти: "return_window: 14 days", "exceptions: [damaged by user]" — замість читання 50 сторінок тексту
- Firecrawl **Search** з scrape шукає:
  - `"${companyName} refund experience site:reddit.com"` — реальні скрипти і хитрощі
  - `"${companyName} complaint resolved"` — що спрацювало в інших
  - `"consumer rights refund ${country}"` — юридичні аргументи
- Firecrawl **Actions** — якщо Terms of Service за кнопкою "I agree" або popup, Firecrawl може натиснути і дістати контент
- ElevenLabs **Create Agent API** створює агента з:
  - **Personalization / Dynamic Variables**: ім'я клієнта, номер замовлення, опис проблеми передаються як змінні при старті розмови (не хардкод в промпт)
  - **Conversation Analysis**: evaluation criteria "чи отримано refund/рішення"
  - **Data Collection**: витягує результат розмови, суму refund, ім'я оператора
  - **Post-call Webhook**: результат → Vercel Postgres
- Twilio **Outbound Call API** ініціює дзвінок на номер підтримки

**Під час дзвінка:**
- Агент представляється і описує проблему
- Якщо оператор відмовляє — агент цитує конкретні пункти Terms of Service (з JSON Extract даних)
- Якщо оператор викручується — агент має контраргументи з Reddit та законодавства
- Firecrawl Search доступний як **server tool** для пошуку додаткової інфо в реальному часі
- **ElevenLabs React SDK** на клієнті відображає live транскрипт через Events API
- Транскрипт підсвічує коли Kamila цитує Terms of Service (фронтенд парсить JSON extract ключі)

**Після дзвінка:**
- **Post-call Webhook**: summary, результат (success/partial/failed), зібрані дані
- **Conversation Analysis**: автоматична оцінка чи було досягнуто цілі
- Все в Vercel Postgres → Result page з повним розбором

---

## UI

**Сторінка Kamila (New Call):**
- Drag & drop для чеку / скріншоту
- Текстове поле "Опиши проблему"
- Поле для номера телефону підтримки АБО URL компанії
- Кнопка "Call for me"

**Preparation screen (поки Kamila готується):**
- Анімація з етапами:
  - "Reading their Terms of Service..." (Firecrawl JSON Extract)
  - "Searching for refund strategies..." (Firecrawl Search — Reddit)
  - "Finding legal requirements..." (Firecrawl Search — права споживача)
  - "Building your case..."
  - "Dialing..."
- Реальні сніпети що Kamila знайшла: "Found: Section 4.2 says refund within 14 days for defective products"

**Під час дзвінка:**
- Live audio player (чуєш розмову)
- Live транскрипт (два кольори: Kamila і Operator)
- Sidebar "Kamila's Arsenal" — список підготовлених аргументів з позначками що використано
- "Kamila's Strategy" блок — що Kamila планує робити далі
- Кнопка "End call"

**Після дзвінка (Result page):**
- Результат: SUCCESS / PARTIAL / FAILED з сумою
- Аргументи які Kamila використала
- Повний транскрипт
- Запис аудіо (переслухати)
- Наступні кроки (якщо FAILED: try again, file complaint, escalate)
- "Share your win" для соцмереж

**History page:**
- Список всіх дзвінків з результатами
- Загальна статистика: кількість дзвінків, success rate, сума recovered

---

## Tech Stack

| Компонент | Технологія | Навіщо |
|-----------|-----------|--------|
| Frontend + Backend | Next.js (App Router) на Vercel | UI + API routes |
| Database | Vercel Postgres (Prisma ORM) | Дзвінки, транскрипти, результати |
| Storage | Vercel Blob | Чеки, файли, аудіо записи |
| Real-time транскрипт | ElevenLabs React SDK + Events API | Live транскрипт на клієнті |
| Парсинг сайтів | Firecrawl JSON Extract + Actions | Terms of Service як структуровані дані |
| Пошук аргументів | Firecrawl Search API | Reddit, права споживача, прецеденти |
| Голосовий AI | ElevenLabs Agents API | Створення агентів програматично |
| Телефонія | Twilio | Outbound дзвінки |
| Деплой | Vercel (single deploy) | Все в одному місці |

### Env variables
```
FIRECRAWL_API_KEY=fc-...
ELEVENLABS_API_KEY=xi-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
POSTGRES_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

---

## ElevenLabs — деталі інтеграції

### Створення агента програматично
```
POST https://api.elevenlabs.io/v1/convai/agents/create

Body:
{
  "name": "Kamila - Refund Agent for [Company]",
  "conversation_config": {
    "agent": {
      "prompt": {
        "prompt": "<system prompt з Terms of Service JSON + Reddit скриптами + правами споживача>"
      },
      "tools": [
        {
          "type": "webhook",
          "name": "firecrawl_search",
          "description": "Search the web for additional legal arguments or consumer rights information",
          "api_schema": { ... }
        }
      ]
    },
    "tts": {
      "voice_id": "<впевнений але ввічливий голос>"
    }
  },
  "platform_settings": {
    "evaluation_criteria": [
      {
        "name": "obtained_resolution",
        "description": "Whether the agent successfully obtained a refund, compensation, or other resolution for the customer"
      }
    ],
    "data_collection": [
      {
        "name": "resolution_type",
        "description": "Type of resolution obtained: full_refund, partial_refund, store_credit, replacement, escalation, denied"
      },
      {
        "name": "resolution_amount",
        "description": "Amount of refund or compensation obtained, if any"
      },
      {
        "name": "operator_name",
        "description": "Name of the support operator if provided"
      },
      {
        "name": "reference_number",
        "description": "Any reference or case number provided by the operator"
      }
    ],
    "post_call_webhook_url": "https://our-api.com/api/webhooks/elevenlabs-kamila"
  }
}
```

### Outbound Call
```
POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call

Body:
{
  "agent_id": "<kamila agent id>",
  "agent_phone_number_id": "<наш Twilio номер>",
  "to_number": "<номер підтримки компанії>",
  "conversation_initiation_client_data": {
    "dynamic_variables": {
      "customer_name": "John Doe",
      "order_number": "ORD-12345",
      "problem_description": "Flight delayed 4 hours, requesting EU261 compensation"
    }
  }
}
```

### Firecrawl як Server Tool
- Реєструється як webhook tool в ElevenLabs Agent
- URL: наш endpoint `/api/tools/firecrawl-search`
- Наш endpoint приймає запит від агента → викликає Firecrawl Search → повертає результат
- Агент отримує додаткові аргументи під час дзвінка

---

## Firecrawl — деталі використання

### JSON Extract Terms of Service
```javascript
import Firecrawl from "@mendable/firecrawl-js";
const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Структуровані Terms of Service як зброя
const tosData = await firecrawl.scrape(`${companyUrl}/terms`, {
  formats: [
    { type: "json", prompt: "Extract as structured data: return window in days, conditions for full refund, exceptions that void refund, escalation process, regulatory body for complaints, customer rights mentioned" }
  ]
});
// Повертає: { return_window: 14, full_refund_conditions: ["defective product", "wrong item"], exceptions: ["opened software"], ... }
```

### Search — Reddit скрипти і юридичні аргументи
```javascript
// Досвід з Reddit
const redditTips = await firecrawl.search(
  `${companyName} refund success site:reddit.com`,
  { limit: 5, scrapeOptions: { formats: ["markdown"], onlyMainContent: true } }
);

// Права споживача
const consumerRights = await firecrawl.search(
  `consumer rights refund ${country}`,
  { limit: 3, scrapeOptions: { formats: [{ type: "json", prompt: "Extract: relevant laws, compensation amounts, complaint process" }] } }
);
```

### Actions — для сторінок за кнопками
```javascript
// Якщо Terms of Service за кнопкою "I agree" або cookie popup
const tos = await firecrawl.scrape(`${companyUrl}/terms`, {
  formats: ["markdown"],
  actions: [
    { type: "click", selector: "button.accept-cookies" },
    { type: "click", selector: "button.show-full-terms" },
    { type: "wait", milliseconds: 1000 }
  ]
});
```

### Як tool агента (Search в реальному часі)
```javascript
// Server tool endpoint: /api/tools/firecrawl-search
const results = await firecrawl.search(query, {
  limit: 5,
  scrapeOptions: {
    formats: ["markdown"],
    onlyMainContent: true
  }
});
```

---

## Нетривіальні фічі — чим вражаємо суддів

### ElevenLabs (6 advanced features):
| Фіча | Де використовуємо | Чому нетривіально |
|-------|-------------------|-------------------|
| Conversation Analysis | Автоматична оцінка результату | Замінює ручну перевірку |
| Data Collection | Витяг resolution type, amount | Платформа сама структурує дані |
| Post-call Webhooks | Vercel Postgres sync | Автоматизує post-call flow |
| Dynamic Variables | Ім'я, замовлення, проблема | Один агент, різні кейси |
| Events API + React SDK | Live транскрипт | Real-time на клієнті |
| System Tools (end_call) | Завершення розмови | Нативна інтеграція |

### Firecrawl (5 advanced features):
| Фіча | Де використовуємо | Чому нетривіально |
|-------|-------------------|-------------------|
| JSON Extract з prompt | Terms of Service як структуровані дані | Зброя для аргументації замість сирого тексту |
| Actions (click, wait) | Terms of Service за кнопками | Доступ до контенту за popups/cookies |
| Search + Scrape combo | Reddit + права споживача | Пошук + витяг контенту в одному запиті |
| Search як real-time tool | Додаткові аргументи під час дзвінка | Агент шукає на ходу |
| News source filtering | `site:reddit.com` пошук | Таргетований пошук конкретних джерел |

**Разом: 11 нетривіальних фіч.** Більшість учасників використають 2-3.

---

## Демо відео (60 секунд)

**0:00-0:05 — Hook:**
"Companies make refunds impossible on purpose. So I built an AI that reads their fine print and calls them for you."

**0:05-0:20 — Setup:**
Завантажуємо чек. Пишемо проблему. Вставляємо номер підтримки (або URL). Натискаємо "Call for me".

**0:20-0:45 — Дзвінок у реальному часі:**
Kamila дзвонить (контрольоване середовище). Чуємо розмову. Бачимо транскрипт. Kamila цитує Terms of Service, оператор пробує відмовити, Kamila тисне далі з аргументами з Reddit.

**0:45-0:55 — Результат:**
Kamila домоглась рішення. Показуємо summary: "Refund approved! €400."

**0:55-1:00 — Outro:**
"Stop wasting hours on hold. Let Kamila fight for you. Built with @firecrawl and @elevenlabs. #ElevenHacks"

---

## Ключовий інсайт для демо

Kamila у відео дзвонить на контрольоване середовище (наш власний AI call center). Ми контролюємо обидва боки дзвінка. Глядач бачить Kamila в дії — демо надійне і передбачуване. Результат завжди jaw-drop.

---

## Обробка чеків / скріншотів

ElevenLabs агенти підтримують мультимодальні моделі (Qwen3-30B-A3B). Якщо vision не підтримується нативно для phone calls — використовуємо Gemini Vision API як preprocessing крок:
1. Користувач завантажує фото чеку
2. Gemini Vision витягує: назва компанії, сума, дата, номер замовлення
3. Ці дані передаються як Dynamic Variables в агента
