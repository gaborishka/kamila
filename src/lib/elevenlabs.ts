const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
  };
}

interface CreateAgentParams {
  companyName: string;
  callId: string;
  tosData: Record<string, unknown>;
  redditTips: string[];
  consumerRights: string[];
  webhookUrl: string;
  additionalInfo?: Record<string, string>;
  language?: string;
}

export async function createAgent({
  companyName,
  callId,
  tosData,
  redditTips,
  consumerRights,
  webhookUrl,
  additionalInfo,
  language = "en",
}: CreateAgentParams) {
  const additionalInfoSection = additionalInfo && Object.keys(additionalInfo).length > 0
    ? `\n## Additional Details Provided by Client:\n${Object.entries(additionalInfo).map(([key, val]) => `- ${key.replace(/[#\n\r]/g, "")}: ${val.replace(/[#\n\r]/g, " ").slice(0, 500)}`).join("\n")}\n`
    : "";

  const systemPrompt = `You are Kamila, a confident and sharp consumer rights advocate making a phone call to ${companyName}'s customer support. You represent your client.

## YOUR PERSONALITY
- Talk like a real person on a phone call — natural, conversational, not robotic
- Use short sentences. Pause naturally. React to what the operator says
- NEVER repeat information you already said. If you stated the problem, don't restate it
- Listen first, then respond to what they actually said
- Be warm but assertive — like a friendly lawyer, not a script reader
- Say "mm-hmm", "I see", "right" when acknowledging
- Don't dump all information at once — reveal details progressively as the conversation flows

## CLIENT'S SITUATION
Client: {{customer_name}}
Order/Reference: {{order_number}}
Problem: {{problem_description}}

## YOUR ARSENAL (use strategically, not all at once)

Terms of Service:
${JSON.stringify(tosData, null, 2)}

Community strategies:
${redditTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Legal arguments:
${consumerRights.map((r, i) => `${i + 1}. ${r}`).join("\n")}
${additionalInfoSection}
## CONVERSATION STRATEGY
1. Start brief: state who you are and the core issue in 1-2 sentences
2. Let the operator respond before giving more details
3. Only cite Terms of Service or laws when the operator pushes back — not upfront
4. If denied: escalate gradually — first TOS, then consumer rights, then ask for supervisor
5. If offered partial solution: negotiate for more, but know when to accept a good deal
6. Get operator name and reference number before ending the call

## RULES
- Use {{customer_name}}, {{order_number}}, and {{problem_description}} as provided
- If you need info you don't have, use the ask_client tool. Say "Let me check with my client" to the operator
- IMPORTANT: Speak in the language specified by code "${language}". Only switch to English if the operator does first.`;

  const firstMessages: Record<string, string> = {
    en: `Hello, my name is Kamila. I'm calling on behalf of my client regarding a recent issue with your service. Could you please connect me with someone who can help with refund requests?`,
    uk: `Добрий день, мене звати Каміла. Я дзвоню від імені мого клієнта щодо нещодавньої проблеми з вашим сервісом. Чи можете ви з'єднати мене з кимось, хто може допомогти з питанням повернення коштів?`,
    es: `Hola, mi nombre es Kamila. Llamo en nombre de mi cliente respecto a un problema reciente con su servicio. ¿Podría conectarme con alguien que pueda ayudar con solicitudes de reembolso?`,
    fr: `Bonjour, je m'appelle Kamila. J'appelle au nom de mon client concernant un problème récent avec votre service. Pourriez-vous me mettre en contact avec quelqu'un qui peut m'aider pour une demande de remboursement ?`,
    de: `Hallo, mein Name ist Kamila. Ich rufe im Namen meines Kunden an, bezüglich eines kürzlichen Problems mit Ihrem Service. Könnten Sie mich bitte mit jemandem verbinden, der bei Erstattungsanfragen helfen kann?`,
    it: `Salve, mi chiamo Kamila. Chiamo per conto del mio cliente riguardo a un problema recente con il vostro servizio. Potrebbe mettermi in contatto con qualcuno che possa aiutarmi con una richiesta di rimborso?`,
    pt: `Olá, meu nome é Kamila. Estou ligando em nome do meu cliente sobre um problema recente com o seu serviço. Poderia me conectar com alguém que possa ajudar com solicitações de reembolso?`,
    pl: `Dzień dobry, mam na imię Kamila. Dzwonię w imieniu mojego klienta w sprawie niedawnego problemu z Państwa usługą. Czy mogłaby mnie Pani/Pan połączyć z kimś, kto może pomóc w sprawie zwrotu pieniędzy?`,
    nl: `Hallo, mijn naam is Kamila. Ik bel namens mijn klant over een recent probleem met uw dienst. Kunt u mij doorverbinden met iemand die kan helpen met terugbetalingsverzoeken?`,
    ru: `Здравствуйте, меня зовут Камила. Я звоню от имени моего клиента по поводу недавней проблемы с вашим сервисом. Не могли бы вы соединить меня с кем-то, кто может помочь с возвратом средств?`,
    zh: `您好，我叫Kamila。我代表我的客户就最近您服务中出现的问题来电。请问能否帮我转接一位可以处理退款请求的工作人员？`,
    ja: `こんにちは、カミラと申します。お客様の代理として、最近のサービスに関する問題についてお電話しております。払い戻しのご相談ができる担当者様につないでいただけますでしょうか？`,
    ko: `안녕하세요, 저는 카밀라입니다. 고객을 대신하여 최근 서비스 관련 문제로 전화드렸습니다. 환불 요청을 도와주실 수 있는 분과 연결해 주시겠습니까?`,
    tr: `Merhaba, ben Kamila. Müvekkilim adına hizmetinizle ilgili yakın zamanda yaşanan bir sorun hakkında arıyorum. Beni iade talepleri konusunda yardımcı olabilecek biriyle bağlar mısınız?`,
    ar: `مرحباً، اسمي كاميلا. أتصل نيابة عن عميلي بخصوص مشكلة حديثة مع خدمتكم. هل يمكنكم توصيلي بشخص يمكنه المساعدة في طلبات الاسترداد؟`,
    hi: `नमस्ते, मेरा नाम कामिला है। मैं अपने क्लाइंट की ओर से आपकी सेवा से संबंधित एक हालिया समस्या के बारे में कॉल कर रही हूँ। क्या आप मुझे किसी ऐसे व्यक्ति से जोड़ सकते हैं जो रिफंड अनुरोधों में मदद कर सके?`,
    sv: `Hej, mitt namn är Kamila. Jag ringer på uppdrag av min klient angående ett nyligen uppstått problem med er tjänst. Skulle ni kunna koppla mig till någon som kan hjälpa till med återbetalningsärenden?`,
    da: `Hej, mit navn er Kamila. Jeg ringer på vegne af min klient vedrørende et nyligt problem med jeres service. Kan I sætte mig i forbindelse med en, der kan hjælpe med tilbagebetalingsanmodninger?`,
    fi: `Hei, nimeni on Kamila. Soitan asiakkaani puolesta koskien äskettäistä ongelmaa palvelussanne. Voisitteko yhdistää minut henkilöön, joka voi auttaa hyvityspyynnöissä?`,
    no: `Hei, mitt navn er Kamila. Jeg ringer på vegne av min klient angående et nylig problem med tjenesten deres. Kan dere sette meg over til noen som kan hjelpe med refusjonsforespørsler?`,
    cs: `Dobrý den, jmenuji se Kamila. Volám jménem svého klienta ohledně nedávného problému s vaší službou. Mohli byste mě prosím spojit s někým, kdo může pomoci s žádostí o vrácení peněz?`,
    ro: `Bună ziua, mă numesc Kamila. Sun în numele clientului meu cu privire la o problemă recentă cu serviciul dumneavoastră. Ați putea să mă conectați cu cineva care poate ajuta cu solicitările de rambursare?`,
    el: `Γεια σας, με λένε Καμίλα. Τηλεφωνώ εκ μέρους του πελάτη μου σχετικά με ένα πρόσφατο πρόβλημα με την υπηρεσία σας. Θα μπορούσατε να με συνδέσετε με κάποιον που μπορεί να βοηθήσει με αιτήματα επιστροφής χρημάτων;`,
    bg: `Здравейте, казвам се Камила. Обаждам се от името на моя клиент относно скорошен проблем с вашата услуга. Бихте ли ме свързали с някой, който може да помогне със заявки за възстановяване на средства?`,
    hr: `Dobar dan, zovem se Kamila. Zovem u ime svog klijenta u vezi s nedavnim problemom s vašom uslugom. Biste li me mogli spojiti s nekim tko može pomoći sa zahtjevima za povrat novca?`,
    hu: `Jó napot, Kamila vagyok. Ügyfelemen nevében hívom Önöket egy nemrégiben felmerült szolgáltatási problémával kapcsolatban. Össze tudna kötni valakit, aki segíthet a visszatérítési kérelmekkel?`,
    sk: `Dobrý deň, volám sa Kamila. Volám v mene svojho klienta ohľadom nedávneho problému s vašou službou. Mohli by ste ma prosím spojiť s niekým, kto môže pomôcť so žiadosťou o vrátenie peňazí?`,
  };

  const firstMessage = firstMessages[language] || firstMessages.en;

  const res = await fetch(`${ELEVENLABS_API_BASE}/convai/agents/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: `Kamila - Refund Agent for ${companyName}`,
      conversation_config: {
        agent: {
          prompt: { prompt: systemPrompt },
          first_message: firstMessage,
          language,
          tools: [
            {
              type: "webhook",
              name: "search_web",
              description: "Search the web for additional legal arguments, consumer rights information, or company policies",
              api_schema: {
                url: `${webhookUrl}/api/tools/firecrawl-search`,
                method: "POST",
                request_body: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "The search query to find relevant information",
                    },
                  },
                  required: ["query"],
                },
              },
            },
            {
              type: "webhook",
              name: "ask_client",
              description: "Ask your client (the person who initiated this call) for information you need but don't have. Use this when the operator asks for details like order number, account number, date of purchase, exact amount, or any other information not in your briefing. The client is listening live and will respond.",
              api_schema: {
                url: `${webhookUrl}/api/tools/ask-client?callId=${callId}`,
                method: "POST",
                request_body: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                      description: "The question to ask the client, e.g. 'What is your order number?' or 'When did you make the purchase?'",
                    },
                  },
                  required: ["question"],
                },
              },
            },
          ],
        },
        tts: {
          model_id: "eleven_v3_conversational",
          voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah - Mature, Reassuring, Confident
          expressivity: 1.0,
          agent_output_audio_format: "ulaw_8000", // Twilio native format — no conversion needed
        },
      },
      platform_settings: {
        evaluation_criteria: [
          {
            id: "obtained_resolution",
            name: "obtained_resolution",
            description: "Whether the agent successfully obtained a refund, compensation, or other resolution for the customer",
          },
        ],
        data_collection: {
          resolution_type: {
            type: "string",
            description: "Type of resolution obtained: full_refund, partial_refund, store_credit, replacement, escalation, denied",
          },
          resolution_amount: {
            type: "string",
            description: "Amount of refund or compensation obtained, if any",
          },
          operator_name: {
            type: "string",
            description: "Name of the support operator if provided",
          },
          reference_number: {
            type: "string",
            description: "Any reference or case number provided by the operator",
          },
        },
        post_call_webhook_url: `${webhookUrl}/api/webhooks/elevenlabs`,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create agent: ${error}`);
  }

  return res.json();
}

/** Get a signed WebSocket URL for connecting to an ElevenLabs agent */
export async function getSignedUrl(agentId: string): Promise<string> {
  const res = await fetch(
    `${ELEVENLABS_API_BASE}/convai/conversation/get_signed_url?agent_id=${agentId}`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY || "" } }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get signed URL: ${error}`);
  }

  const data = await res.json();
  return data.signed_url;
}
