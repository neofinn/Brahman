// Hawan (homa), shanti and festival rites. Each follows the classical sequence:
// purification → sankalpa → Ganesha and kalash → agni sthapana → ahutis → purnahuti → aarti and shanti path.
import { GRAHAS } from "./grahas.ts";
import { ACHAMANA, DEEPA, GANESHA_DHYANA, KSHAMA, PAVITRIKARANA, type Kriya, type Mantra, type Step } from "./ritual-common.ts";

const m = (devanagari: string, iast: string, meaning: string, extra: Partial<Mantra> = {}): Mantra => ({ devanagari, iast, meaning, ...extra });

export const MANTRAS = {
  gayatri: m(
    "ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥",
    "oṃ bhūr bhuvaḥ svaḥ | tat savitur vareṇyaṃ bhargo devasya dhīmahi | dhiyo yo naḥ pracodayāt ||",
    "We meditate on the adorable radiance of the divine Savitr; may it inspire our intellect.",
    { source: "Rigveda 3.62.10" },
  ),
  mahamrityunjaya: m(
    "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥",
    "oṃ tryambakaṃ yajāmahe sugandhiṃ puṣṭivardhanam | urvārukam iva bandhanān mṛtyor mukṣīya mā'mṛtāt ||",
    "We worship the three-eyed Lord, fragrant, who nourishes all. As the ripe cucumber is freed from its vine, may he free us from death, not from immortality.",
    { source: "Rigveda 7.59.12" },
  ),
  kalash: m(
    "कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः। मूले तत्र स्थितो ब्रह्मा मध्ये मातृगणाः स्मृताः॥",
    "kalaśasya mukhe viṣṇuḥ kaṇṭhe rudraḥ samāśritaḥ | mūle tatra sthito brahmā madhye mātṛgaṇāḥ smṛtāḥ ||",
    "Vishnu dwells at the mouth of the kalash, Rudra at its neck, Brahma at its base, and the Divine Mothers in its middle.",
  ),
  agni: m(
    "ॐ अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम्। होतारं रत्नधातमम्॥",
    "oṃ agnim īḷe purohitaṃ yajñasya devam ṛtvijam | hotāraṃ ratnadhātamam ||",
    "I praise Agni, the household priest, the divine minister of the sacrifice, the invoker, bestower of treasures.",
    { source: "Rigveda 1.1.1" },
  ),
  purnahuti: m(
    "ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते। पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥",
    "oṃ pūrṇam adaḥ pūrṇam idaṃ pūrṇāt pūrṇam udacyate | pūrṇasya pūrṇam ādāya pūrṇam evāvaśiṣyate ||",
    "That is whole, this is whole; from the whole the whole arises. Taking the whole from the whole, the whole alone remains.",
    { source: "Brihadaranyaka Upanishad 5.1.1" },
  ),
  shantiPath: m(
    "ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः। वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥ ॐ शान्तिः शान्तिः शान्तिः॥",
    "oṃ dyauḥ śāntir antarikṣaṃ śāntiḥ pṛthivī śāntir āpaḥ śāntir oṣadhayaḥ śāntiḥ | vanaspatayaḥ śāntir viśvedevāḥ śāntir brahma śāntiḥ sarvaṃ śāntiḥ śāntir eva śāntiḥ sā mā śāntir edhi || oṃ śāntiḥ śāntiḥ śāntiḥ ||",
    "May there be peace in the heavens, the sky and the earth; peace in the waters, herbs and trees; peace among all the gods and in Brahman; peace everywhere — and may that peace come to me.",
    { source: "Shukla Yajurveda 36.17" },
  ),
  vishnu: m(
    "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्। लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥",
    "śāntākāraṃ bhujagaśayanaṃ padmanābhaṃ sureśaṃ viśvādhāraṃ gaganasadṛśaṃ meghavarṇaṃ śubhāṅgam | lakṣmīkāntaṃ kamalanayanaṃ yogibhir dhyānagamyaṃ vande viṣṇuṃ bhavabhayaharaṃ sarvalokaikanātham ||",
    "I bow to Vishnu — of peaceful form, resting on the serpent, lotus-navelled, lord of the gods, support of the universe, vast as the sky, cloud-hued, beloved of Lakshmi, lotus-eyed, reached by yogis in meditation, remover of the fear of worldly existence, sole lord of all worlds.",
  ),
  rudraGayatri: m(
    "ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि। तन्नो रुद्रः प्रचोदयात्॥",
    "oṃ tatpuruṣāya vidmahe mahādevāya dhīmahi | tanno rudraḥ pracodayāt ||",
    "May we know the Supreme Person and meditate on Mahadeva; may Rudra inspire us.",
  ),
  ganeshGayatri: m(
    "ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि। तन्नो दन्ती प्रचोदयात्॥",
    "oṃ ekadantāya vidmahe vakratuṇḍāya dhīmahi | tanno dantī pracodayāt ||",
    "May we know the single-tusked One and meditate on the curved-trunked One; may the Tusked Lord inspire us.",
  ),
  lakshmi: m("ॐ श्रीं महालक्ष्म्यै नमः", "oṃ śrīṃ mahālakṣmyai namaḥ", "Om, salutations to Mahalakshmi (श्रीं is her bija).", { count: "108 times" }),
  lakshmiGayatri: m(
    "ॐ महालक्ष्म्यै च विद्महे विष्णुपत्न्यै च धीमहि। तन्नो लक्ष्मीः प्रचोदयात्॥",
    "oṃ mahālakṣmyai ca vidmahe viṣṇupatnyai ca dhīmahi | tanno lakṣmīḥ pracodayāt ||",
    "May we know Mahalakshmi and meditate on the consort of Vishnu; may Lakshmi inspire us.",
  ),
  durga: m(
    "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता। नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥",
    "yā devī sarvabhūteṣu śaktirūpeṇa saṃsthitā | namas tasyai namas tasyai namas tasyai namo namaḥ ||",
    "To the Goddess who dwells in all beings as power — salutations to her, again and again.",
    { source: "Devi Mahatmya (Durga Saptashati) 5" },
  ),
  navarna: m("ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे", "oṃ aiṃ hrīṃ klīṃ cāmuṇḍāyai vicce", "The Navarna mantra of Devi Chamunda, chanted through Navaratri.", { count: "108 times or more" }),
  hanuman: m(
    "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्। वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥",
    "manojavaṃ mārutatulyavegaṃ jitendriyaṃ buddhimatāṃ variṣṭham | vātātmajaṃ vānarayūthamukhyaṃ śrīrāmadūtaṃ śaraṇaṃ prapadye ||",
    "I take refuge in the messenger of Shri Rama — swift as the mind, fast as the wind, master of the senses, foremost of the wise, son of Vayu, chief of the vanaras.",
  ),
  vastu: m(
    "ॐ वास्तोष्पते प्रति जानीह्यस्मान्त्स्वावेशो अनमीवो भवा नः। यत्त्वेमहे प्रति तन्नो जुषस्व शं नो भव द्विपदे शं चतुष्पदे॥",
    "oṃ vāstoṣpate prati jānīhy asmān svāveśo anamīvo bhavā naḥ | yat tvemahe prati tan no juṣasva śaṃ no bhava dvipade śaṃ catuṣpade ||",
    "O Lord of the dwelling, accept us; give us a good entrance and a home free of disease. Grant what we ask of you; be a blessing to our people and our animals.",
    { source: "Rigveda 7.54.1" },
  ),
  shivaPanchakshari: m("ॐ नमः शिवाय", "oṃ namaḥ śivāya", "Om, salutations to Shiva — the five-syllable mantra.", { count: "108 times" }),
  krishna: m("ॐ नमो भगवते वासुदेवाय", "oṃ namo bhagavate vāsudevāya", "Om, salutations to Lord Vasudeva (Krishna).", { count: "108 times" }),
};

// --- Steps shared by every hawan -------------------------------------------------

const SANKALPA: Step = {
  title: "Sankalpa (statement of intent)",
  detail:
    "Holding water, akshata, a flower and a coin in the right hand, say: 'Om Vishnur Vishnur Vishnuh' and state the place, date (samvat, masa, paksha, tithi, vara), your name, gotra and the purpose of the hawan. Release the water into a plate.",
};

const GANESHA_GAURI: Step = {
  title: "Ganesha–Gauri puja",
  detail: "Worship Ganesha (a betel nut on rice can represent him) with kumkum, akshata, flowers, durva and a sweet, so the rite proceeds without obstacles.",
  mantra: GANESHA_DHYANA,
};

const KALASH: Step = {
  title: "Kalash sthapana",
  detail:
    "On a heap of rice, place a copper or brass kalash filled with water, a coin, a betel nut, turmeric and akshata; set five mango leaves in its mouth and a red-cloth-wrapped coconut on top. Tie mauli round its neck and invoke the sacred rivers and devatas into it.",
  mantra: MANTRAS.kalash,
};

const AGNI_STHAPANA: Step = {
  title: "Agni sthapana (installing the sacred fire)",
  detail:
    "Make a swastika in the havan kund, arrange small sticks of mango wood, place camphor and light it while chanting. Fan gently until the flames are steady, and invite Agni Deva to carry the offerings to the devatas.",
  mantra: MANTRAS.agni,
};

const AGHARA: Step = {
  title: "Aghara and ajyabhaga ahutis (first ghee offerings)",
  detail:
    "With the sruva (spoon), offer ghee into the fire once with each mantra. Say 'स्वाहा' as you offer and 'इदं … न मम' (this is for …, not for me) after each offering.",
  mantra: m(
    "ॐ प्रजापतये स्वाहा। इदं प्रजापतये न मम॥ ॐ इन्द्राय स्वाहा। इदं इन्द्राय न मम॥ ॐ अग्नये स्वाहा। इदं अग्नये न मम॥ ॐ सोमाय स्वाहा। इदं सोमाय न मम॥",
    "oṃ prajāpataye svāhā | idaṃ prajāpataye na mama || oṃ indrāya svāhā | idaṃ indrāya na mama || oṃ agnaye svāhā | idaṃ agnaye na mama || oṃ somāya svāhā | idaṃ somāya na mama ||",
    "Offerings to Prajapati, Indra, Agni and Soma — 'this is for them, not for me'.",
  ),
};

const VYAHRITI: Step = {
  title: "Vyahriti ahutis",
  detail: "Offer ghee three times for the three worlds.",
  mantra: m(
    "ॐ भूः स्वाहा। इदं अग्नये न मम॥ ॐ भुवः स्वाहा। इदं वायवे न मम॥ ॐ स्वः स्वाहा। इदं सूर्याय न मम॥",
    "oṃ bhūḥ svāhā | idam agnaye na mama || oṃ bhuvaḥ svāhā | idaṃ vāyave na mama || oṃ svaḥ svāhā | idaṃ sūryāya na mama ||",
    "Offerings for the earth (to Agni), the atmosphere (to Vayu) and the heavens (to Surya).",
  ),
};

const GAYATRI_AHUTI: Step = {
  title: "Gayatri ahutis",
  detail: "Offer havan samagri mixed with ghee 11, 21 or 108 times, adding 'स्वाहा' at the end of each Gayatri.",
  mantra: { ...MANTRAS.gayatri, count: "11, 21 or 108 ahutis" },
};

const PURNAHUTI: Step = {
  title: "Purnahuti (final complete offering)",
  detail:
    "Everyone stands. Place a dry coconut (gola) filled with ghee and samagri, with a red cloth, betel leaf, nut and sweets, into the fire with both hands while chanting; pour a stream of ghee (vasordhara) after it.",
  mantra: MANTRAS.purnahuti,
};

const AARTI_SHANTI: Step = {
  title: "Aarti, bhasma and shanti path",
  detail:
    "Perform aarti to the deity and the fire, circumambulate the havan kund clockwise, apply a little bhasma (ash) from the kund to the forehead as prasad, and chant the shanti path.",
  mantra: MANTRAS.shantiPath,
};

const DAKSHINA: Step = {
  title: "Dakshina, daan and prasad",
  detail: "Offer dakshina and clothes to the purohit, give food and daan to the needy, and share prasad with everyone present. Let the fire settle by itself; never blow it out.",
};

function hawan(main: Step[], opening: Step[] = []): Step[] {
  return [
    { title: "Prepare", detail: "Bathe, wear clean (preferably unstitched or traditional) clothes, set up facing east, keep the havan kund to the east of the yajaman, and lay out all samagri within reach." },
    ACHAMANA,
    PAVITRIKARANA,
    { title: "Light the lamp", detail: "Light a ghee lamp to the right of the deity.", mantra: DEEPA },
    SANKALPA,
    GANESHA_GAURI,
    KALASH,
    ...opening,
    AGNI_STHAPANA,
    AGHARA,
    VYAHRITI,
    GAYATRI_AHUTI,
    ...main,
    PURNAHUTI,
    AARTI_SHANTI,
    KSHAMA,
    DAKSHINA,
  ];
}

const HAWAN_SAMAGRI = [
  "Havan kund (copper, iron or brick) and mango-wood sticks",
  "Pure cow ghee (500 g – 1 kg) and a sruva (offering spoon)",
  "Havan samagri mix (about 1 kg): jau (barley), til (sesame), rice, sugar/jaggery, guggul, loban, dried herbs",
  "Camphor and matches",
  "Kalash, mango leaves, coconut with red cloth, mauli (sacred thread)",
  "Roli/kumkum, haldi, chandan, akshata, flowers, durva, betel leaves and nuts, cloves, cardamom",
  "Dry coconut (gola) for purnahuti",
  "Fruits, sweets for naivedya, Ganga jal, panchamrit",
  "Asanas (mats) for everyone, a plate for sankalpa water, dakshina",
];

// --- The rites -------------------------------------------------------------------

export const HAWANS: Kriya[] = [
  {
    id: "havan",
    title: "Havan / Homa Vidhi (general)",
    devanagari: "हवन विधि",
    category: "hawan",
    keywords: ["havan", "hawan", "homa", "homam", "yagya", "yagna", "yajna", "agnihotra", "ghar par havan", "simple havan", "havan kaise kare", "havan vidhi", "fire ritual"],
    duration: "1–1½ hours",
    purohit: "A household can perform this simple havan; for elaborate homas a purohit leads the Vedic portions.",
    summary: "The sacred fire offering — a complete household havan with agni sthapana, ghee and samagri ahutis, Gayatri ahutis and purnahuti. Use it for birthdays, new beginnings, purification or simply for peace.",
    when: "Any auspicious day — Sunday or Thursday mornings, Purnima, birthdays, anniversaries, after recovery or before a new venture. Morning after sunrise is best.",
    samagri: HAWAN_SAMAGRI,
    steps: hawan([
      { title: "Ishta devata ahutis", detail: "Offer 108 ahutis with the mantra of your family deity, adding 'स्वाहा' — e.g. 'ॐ नमः शिवाय स्वाहा', 'ॐ नमो भगवते वासुदेवाय स्वाहा', 'ॐ गं गणपतये स्वाहा'." },
      { title: "Mahamrityunjaya ahutis (optional)", detail: "For health and protection, offer 11 or 108 ahutis with the Mahamrityunjaya mantra followed by 'स्वाहा'.", mantra: MANTRAS.mahamrityunjaya },
    ]),
    notes: ["Keep the fire moderate; offer samagri with the right hand using the thumb, middle and ring fingers (mrigi mudra).", "Never offer anything impure or non-vegetarian into the fire, and do not blow it out — let it subside naturally."],
  },
  {
    id: "navagraha-shanti",
    title: "Graha Shanti (Navagraha) Hawan",
    devanagari: "नवग्रह शान्ति हवन",
    category: "hawan",
    keywords: ["graha shanti", "grah shanti", "greh shanti", "grih shanti", "grah shanti puja", "navagraha", "navgrah", "nav grah", "navagraha homam", "graha dosh", "grah dosh", "planet dosh", "planetary remedy", "graha pooja", "nine planets"],
    duration: "2–3 hours",
    purohit: "Traditionally performed by a purohit with the Vedic mantras of each graha; the household version below uses the beej and Puranic mantras.",
    summary: "Pacification of the nine grahas — Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu and Ketu — to reduce malefic influences and strengthen benefic ones. Performed before weddings, griha pravesha, during difficult dashas, or when a kundli shows afflicted planets.",
    when: "On an auspicious muhurta from the panchang — Sundays are traditional; also before major samskaras and at the start of a difficult mahadasha. Avoid Rikta tithis (4, 9, 14) and Amavasya unless your purohit advises otherwise.",
    samagri: [
      ...HAWAN_SAMAGRI,
      "Navagraha mandal: a cloth with nine squares, or nine heaps of grains — wheat (Surya), rice (Chandra), toor dal (Mangala), moong (Budha), chana dal (Guru), white beans (Shukra), black til (Shani), urad (Rahu), horse gram (Ketu)",
      "Nine kinds of samidha (sacred wood): arka, palasha, khair, apamarga, peepal, gular, shami, durva, kusha",
      "Cloth pieces in the nine graha colours, nine betel nuts, nine coins",
      "Navagraha daan items (see each graha step)",
    ],
    steps: hawan(
      [
        ...GRAHAS.map((g): Step => ({
          title: `${g.sanskrit} (${g.devanagari}) ahutis`,
          detail: `Offer 108 (or at least 28) ahutis of ${g.samidha} samidha dipped in ghee, with samagri, chanting the beej mantra followed by 'स्वाहा'. Colour: ${g.color}. Daan for ${g.sanskrit}: ${g.daan}.`,
          mantra: { ...g.beej, count: `108 ahutis (full japa: ${g.japaCount.toLocaleString("en-IN")})` },
        })),
        {
          title: "Navagraha stuti",
          detail: "Recite the Navagraha Stotra of Vyasa, or the one-line prayer to all nine grahas.",
          mantra: m(
            "ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च। गुरुश्च शुक्रः शनिराहुकेतवः सर्वे ग्रहाः शान्तिकरा भवन्तु॥",
            "brahmā murāris tripurāntakārī bhānuḥ śaśī bhūmisuto budhaś ca | guruś ca śukraḥ śani-rāhu-ketavaḥ sarve grahāḥ śāntikarā bhavantu ||",
            "May Brahma, Vishnu and Shiva, and the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu — may all the grahas bring peace.",
          ),
        },
      ],
      [
        {
          title: "Navagraha mandal sthapana and puja",
          detail:
            "Arrange the nine grains in the mandal — Surya in the centre, Chandra south-east, Mangala south, Budha north-east, Guru north, Shukra east, Shani west, Rahu south-west, Ketu north-west — and worship each graha with its colour of flower, cloth and akshata, reciting its stotra verse.",
          mantra: GRAHAS[0].stotra,
        },
      ],
    ),
    notes: [
      "If only one graha is troubling (e.g. Shani or Mangala in your kundli), do its japa and ahutis in larger number and give its daan on its weekday.",
      "Ask Brahman for your kundli — it will point out which grahas need shanti.",
    ],
  },
  {
    id: "vastu-shanti",
    title: "Vastu Shanti Puja & Hawan",
    devanagari: "वास्तु शान्ति",
    category: "shanti",
    keywords: ["vastu", "vaastu", "vastu shanti", "vastu dosh", "vastu puja", "new house puja", "office opening", "shop opening", "bhoomi pujan", "bhumi pujan", "foundation", "new flat"],
    duration: "3–4 hours",
    purohit: "Usually performed by a purohit, often together with Griha Pravesha or Bhoomi Pujan.",
    summary: "Worship of Vastu Purusha, the deity of the dwelling, and the guardians of the directions, to remove doshas in a building and bring peace, health and prosperity to its occupants.",
    when: "Before or during griha pravesha, at bhoomi pujan before construction, after major renovation, or when vastu defects are felt. Choose a muhurta from the panchang.",
    samagri: [...HAWAN_SAMAGRI, "Vastu Purusha mandal (or yantra) on a wooden board", "Silver or copper snake and tortoise (for foundation pujas)", "Panchratna or five metals, nine grains", "Seasonal fruits, sweets, toran of mango leaves"],
    steps: hawan(
      [
        { title: "Vastu ahutis", detail: "Offer 108 ahutis with ghee and samagri chanting the Vastoshpati mantra with 'स्वाहा', then 'ॐ वास्तुपुरुषाय नमः स्वाहा'.", mantra: { ...MANTRAS.vastu, count: "108 ahutis" } },
        { title: "Navagraha ahutis", detail: "Offer 11 ahutis to each graha with its beej mantra (see Graha Shanti Hawan)." },
        { title: "Direction pujas", detail: "Sprinkle Ganga jal and offer akshata in all eight directions and the centre, honouring Indra (E), Agni (SE), Yama (S), Nirriti (SW), Varuna (W), Vayu (NW), Kubera (N), Ishana (NE) and Brahma (centre)." },
      ],
      [{ title: "Vastu Purusha puja", detail: "Worship the Vastu Purusha mandal with flowers, akshata and naivedya, praying for the well-being of everyone who will live or work in the building." }],
    ),
    notes: ["Many families bury the puja's kalash water and some grains in the north-east of the plot or keep it in a pot of tulsi."],
  },
  {
    id: "mahamrityunjaya",
    title: "Mahamrityunjaya Jaap & Hawan",
    devanagari: "महामृत्युञ्जय जाप",
    category: "hawan",
    keywords: ["mahamrityunjaya", "maha mrityunjaya", "mrityunjay", "mrityunjaya jaap", "health", "illness", "bimari", "recovery", "long life", "longevity", "surgery", "accident", "fear of death", "tryambakam"],
    duration: "1–3 hours (japa can be spread over days)",
    purohit: "A family can chant the japa; a full sava-lakh (125,000) anushthana is usually done by a team of purohits.",
    summary: "Japa and homa of the great death-conquering mantra of Shiva from the Rigveda, for health, recovery from illness, protection and longevity.",
    when: "Mondays, Pradosh, Shivaratri, Shravana month, during illness or before surgery, on birthdays, or in a difficult Saturn/Rahu/Ketu period.",
    samagri: [...HAWAN_SAMAGRI, "Shivling or picture of Shiva", "Bel (bilva) leaves, white flowers, dhatura", "Milk, curd, honey for abhishek", "Rudraksha mala", "Black sesame and guggul for the homa"],
    steps: hawan([
      { title: "Shiva puja", detail: "Offer water, milk and bel leaves to the Shivling, saying 'ॐ नमः शिवाय'.", mantra: MANTRAS.shivaPanchakshari },
      { title: "Mahamrityunjaya japa", detail: "With a rudraksha mala, chant the mantra 108 times (11 malas for a fuller sankalpa), keeping the sick person in mind.", mantra: { ...MANTRAS.mahamrityunjaya, count: "108 × 1 to 11 malas" } },
      { title: "Mahamrityunjaya ahutis", detail: "Offer black sesame, guggul and ghee with the mantra followed by 'स्वाहा' — one-tenth of the japa count (e.g. 108 ahutis after 11 malas).", mantra: { ...MANTRAS.mahamrityunjaya, count: "one-tenth of the japa" } },
    ]),
    notes: ["Spiritual practice supports healing; always continue the treatment prescribed by doctors."],
  },
  {
    id: "rudrabhishek",
    title: "Rudrabhishek & Shiva Puja",
    devanagari: "रुद्राभिषेक",
    category: "puja",
    keywords: ["rudrabhishek", "rudra abhishek", "abhishek", "shiv puja", "shiva puja", "shivling", "mahashivratri", "shivratri", "shravan somvar", "sawan somvar", "monday", "somvar vrat", "bholenath", "mahadev", "rudram"],
    duration: "1–2 hours",
    purohit: "The Sri Rudram (Namakam–Chamakam) is chanted by trained purohits; households can perform the abhishek with Om Namah Shivaya.",
    summary: "Ritual bathing of the Shivling with water, milk, curd, honey, ghee, sugarcane juice and Ganga jal while chanting the Rudram or Om Namah Shivaya — for peace, removal of obstacles and fulfilment of wishes.",
    when: "Mondays, Pradosh (Trayodashi at dusk), Masik Shivaratri, Maha Shivaratri, and every Monday of Shravana.",
    samagri: ["Shivling (or visit a temple)", "Ganga jal, milk, curd, honey, ghee, sugar (panchamrit)", "Sugarcane juice, coconut water (optional)", "Bel leaves (three-leaf, unbroken), dhatura, aak flowers, white flowers", "Bhasma, chandan, akshata, janeu", "Fruits, sweets, lamp, incense, camphor"],
    steps: [
      ACHAMANA,
      SANKALPA,
      GANESHA_GAURI,
      { title: "Shiva dhyana", detail: "Meditate on Shiva — seated in the Himalayas, with Ganga in his locks, the crescent Moon, serpents and the trident.", mantra: MANTRAS.rudraGayatri },
      { title: "Abhishek", detail: "Pour each liquid in a slow, steady stream over the Shivling — water, milk, curd, ghee, honey, sugar water, then Ganga jal — chanting the Rudram or 'ॐ नमः शिवाय' continuously.", mantra: { ...MANTRAS.shivaPanchakshari, count: "continuously during the abhishek" } },
      { title: "Shringar", detail: "Wipe the Shivling, apply chandan and bhasma, and offer bel leaves (smooth side down), dhatura and flowers. Never offer tulsi, kumkum or ketaki flowers to Shiva." },
      { title: "Mahamrityunjaya", detail: "Chant 11 or 108 times.", mantra: MANTRAS.mahamrityunjaya },
      { title: "Naivedya and aarti", detail: "Offer fruits and sweets, then sing 'Om Jai Shiv Omkara'. Circumambulate only half-way (do not cross the jaladhari outlet)." },
      KSHAMA,
    ],
  },
  {
    id: "lakshmi-puja",
    title: "Diwali Lakshmi–Ganesh Puja",
    devanagari: "दीपावली लक्ष्मी पूजा",
    category: "puja",
    keywords: ["lakshmi", "laxmi", "lakshmi puja", "laxmi pujan", "diwali", "deepavali", "dhanteras", "kuber", "wealth", "money", "dhan", "business growth", "friday puja", "varalakshmi"],
    duration: "1–1½ hours",
    summary: "The main Diwali worship of Mahalakshmi with Shri Ganesha (and Kubera and Saraswati), performed in the evening of Kartika Amavasya in Pradosh kaal for prosperity, auspiciousness and abundance.",
    when: "Diwali night (Kartika Amavasya, Ashwin Amavasya in amanta reckoning) during Pradosh kaal / Sthir lagna (Vrishabha); also Fridays and Sharad Purnima.",
    samagri: ["Lakshmi and Ganesha murtis or picture, new red cloth for the chowki", "Kalash with water, coconut, mango leaves", "Silver coins, account books (bahi-khata), pen", "Lotus or red flowers, garland, kumkum, haldi, akshata", "Kheel–batashe, sweets, fruits, dry fruits, betel leaves and nuts", "Many earthen diyas with oil or ghee, incense, camphor", "Panchamrit, Ganga jal"],
    steps: [
      { title: "Prepare", detail: "Clean the house thoroughly, draw rangoli and footprints of Lakshmi at the entrance, place the chowki in the north-east facing east, with Lakshmi to the right of Ganesha." },
      ACHAMANA,
      PAVITRIKARANA,
      SANKALPA,
      KALASH,
      { title: "Ganesha puja", detail: "Worship Ganesha first with durva, modak and red flowers.", mantra: GANESHA_DHYANA },
      { title: "Lakshmi dhyana and avahana", detail: "Meditate on Lakshmi seated on a lotus, showering gold, and invite her.", mantra: MANTRAS.lakshmiGayatri },
      { title: "Shodashopachara to Lakshmi", detail: "Offer the sixteen upacharas (see that guide): bathe the coins/murti in panchamrit, offer red cloth, kumkum, lotus flowers, perfume, incense, lamp and naivedya." },
      { title: "Lakshmi mantra japa", detail: "Chant with a lotus-seed (kamalgatta) or crystal mala.", mantra: MANTRAS.lakshmi },
      { title: "Kubera and bahi-khata puja", detail: "Worship the account books, pen and safe, writing 'शुभ लाभ' and a swastika on the first page; pray to Kubera for steady wealth." },
      { title: "Aarti and deepa daan", detail: "Sing 'Om Jai Lakshmi Mata', then light diyas throughout the house, at the doorstep, the tulsi and the kitchen.", mantra: DEEPA },
      KSHAMA,
    ],
    notes: ["Keep a lamp burning through the night; avoid quarrels and give generously on Diwali."],
  },
  {
    id: "navratri",
    title: "Navratri Ghatasthapana & Durga Puja",
    devanagari: "नवरात्रि घटस्थापना",
    category: "puja",
    keywords: ["navratri", "navaratri", "durga", "durga puja", "ghatasthapana", "kalash sthapana", "devi", "mata rani", "kanya pujan", "kanjak", "ashtami", "navami", "chaitra navratri", "sharad navratri", "durga saptashati", "chandi path"],
    duration: "Daily puja of 30–60 minutes for nine nights",
    summary: "Installation of the ghata (kalash) with sown barley on the first day of Navratri, followed by nine days of worship of the nine forms of Durga, Durga Saptashati path, and Kanya pujan on Ashtami or Navami.",
    when: "Chaitra Navratri (Chaitra Shukla 1–9) and Sharad Navratri (Ashwin Shukla 1–9). Ghatasthapana in the morning muhurta of Pratipada, avoiding Chitra nakshatra and Vaidhriti yoga if possible.",
    samagri: ["Clay pot with clean soil and barley (jau) seeds", "Kalash, coconut with red chunri, mango leaves", "Durga picture/murti, red chunri, shringar items (bangles, sindoor, bindi)", "Red flowers (hibiscus), akhand jyoti lamp with ghee", "Durga Saptashati book", "Fruits, sweets, halwa–puri–chana for kanya pujan"],
    steps: [
      ACHAMANA,
      SANKALPA,
      GANESHA_GAURI,
      { title: "Sow the jawara", detail: "Spread soil in the clay pot, sow barley, sprinkle water, and place the kalash on it.", mantra: MANTRAS.kalash },
      { title: "Akhand jyoti", detail: "Light a ghee lamp to burn continuously for nine days, if possible.", mantra: DEEPA },
      { title: "Devi avahana and puja", detail: "Invite Durga, offer red chunri, shringar, red flowers and naivedya.", mantra: MANTRAS.durga },
      { title: "Daily worship of Navadurga", detail: "Day 1 Shailaputri, 2 Brahmacharini, 3 Chandraghanta, 4 Kushmanda, 5 Skandamata, 6 Katyayani, 7 Kalaratri, 8 Mahagauri, 9 Siddhidatri — with aarti 'Jai Ambe Gauri' morning and evening." },
      { title: "Navarna japa and Saptashati path", detail: "Chant the Navarna mantra and read the Durga Saptashati (all 13 chapters over the nine days, or Kunjika Stotra if time is short).", mantra: MANTRAS.navarna },
      { title: "Kanya pujan", detail: "On Ashtami or Navami, wash the feet of nine young girls (and one boy as Bhairava), offer tilak, chunri, halwa–puri–chana and dakshina, and touch their feet." },
      { title: "Havan and visarjan", detail: "Perform a havan (see Havan Vidhi) with 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे स्वाहा' on Navami, then immerse the jawara and conclude on Dashami." },
      KSHAMA,
    ],
  },
  {
    id: "hanuman-sundarkand",
    title: "Hanuman Puja & Sundarkand Path",
    devanagari: "हनुमान पूजा एवं सुन्दरकाण्ड पाठ",
    category: "path",
    keywords: ["hanuman", "bajrang bali", "bajrangbali", "sundarkand", "sunderkand", "hanuman puja", "tuesday puja", "mangalvar", "saturday hanuman", "bhoot pret", "fear", "courage", "sankat mochan", "hanuman jayanti"],
    duration: "Chalisa 10 minutes; Sundarkand about 2–3 hours",
    summary: "Worship of Shri Hanuman with sindoor and jasmine oil, recitation of the Hanuman Chalisa and the Sundarkand of the Ramcharitmanas — for courage, protection from fear and negativity, and relief in Mangal and Shani afflictions.",
    when: "Tuesdays and Saturdays, Hanuman Jayanti, during Shani Sade Sati or Mangal dosha, and before important undertakings.",
    samagri: ["Hanuman picture/murti and a picture of Shri Rama", "Sindoor mixed with jasmine (chameli) oil", "Red flowers, tulsi garland", "Boondi laddoo or gur–chana as naivedya", "Ghee or mustard-oil lamp, incense", "Ramcharitmanas (Sundarkand) / Hanuman Chalisa book"],
    steps: [
      ACHAMANA,
      SANKALPA,
      { title: "Shri Rama smarana", detail: "Hanuman is pleased first by remembrance of Rama — chant 'श्री राम जय राम जय जय राम' 11 times." },
      { title: "Hanuman dhyana", detail: "Meditate on Hanuman, folded hands at Rama's feet.", mantra: MANTRAS.hanuman },
      { title: "Offerings", detail: "Offer sindoor with jasmine oil (chola), red flowers, tulsi, laddoo, and light the lamp. Chant 'ॐ हं हनुमते नमः' 108 times.", mantra: m("ॐ हं हनुमते नमः", "oṃ haṃ hanumate namaḥ", "Om, salutations to Hanuman (हं is his bija).", { count: "108 times" }) },
      { title: "Hanuman Chalisa", detail: "Recite the Hanuman Chalisa of Goswami Tulsidas — 1, 7, 11 or 108 times." },
      { title: "Sundarkand path", detail: "Read the Sundarkand (fifth kanda of the Ramcharitmanas) from beginning to end without interruption, ideally in a group with music." },
      { title: "Aarti", detail: "Sing 'Aarti Kije Hanuman Lala Ki' and distribute prasad." },
      KSHAMA,
    ],
  },
  {
    id: "mangal-dosh",
    title: "Mangal Dosh Shanti",
    devanagari: "मङ्गल दोष शान्ति",
    category: "shanti",
    keywords: ["mangal dosh", "manglik", "mangalik", "kuja dosha", "chevvai dosham", "mangal dosha", "mars dosh", "marriage delay", "shaadi mein deri", "angarak", "bhaum"],
    duration: "1–2 hours (plus Tuesday observances)",
    purohit: "Mangal shanti homa or Kumbh/Ark vivah (when advised) is performed by a purohit.",
    summary: "Remedies for Mangal (Kuja) dosha — Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house — which tradition associates with friction in marriage. The dosha is often cancelled by other factors; check the kundli first.",
    when: "Tuesdays (especially in Shukla paksha), Angaraki Chaturthi, before marriage.",
    samagri: ["Red cloth, red flowers, red sandalwood", "Masoor dal, jaggery, copper vessel for daan", "Khair (khadira) samidha for homa", "Hanuman picture, sindoor, chameli oil"],
    steps: [
      ACHAMANA,
      SANKALPA,
      GANESHA_GAURI,
      { title: "Mangal puja", detail: "Worship Mangala on a red cloth with red flowers and red sandalwood.", mantra: getStotra("Mars") },
      { title: "Mangal beej japa", detail: "Chant 108 times daily on Tuesdays (full anushthana: 10,000).", mantra: { ...getBeej("Mars"), count: "108 daily; 10,000 for anushthana" } },
      { title: "Mangal homa", detail: "Offer 108 ahutis of khair samidha with ghee and the beej mantra with 'स्वाहा' (see Havan Vidhi for the fire sequence)." },
      { title: "Hanuman worship", detail: "Recite the Hanuman Chalisa and offer sindoor to Hanuman every Tuesday." },
      { title: "Daan", detail: "Donate masoor dal, jaggery, red cloth and copper on Tuesday." },
      KSHAMA,
    ],
    notes: [
      "Classical texts list many cancellations — Mars in its own sign or exalted, the same dosha in both charts, Mars aspected by Jupiter, and more. Brahman's kundli reading checks the main ones.",
      "Never treat Mangal dosha as a reason for fear or to reject a person; kundli matching considers the whole chart.",
    ],
  },
  {
    id: "kaal-sarp",
    title: "Kaal Sarp Dosh Shanti Puja",
    devanagari: "कालसर्प दोष शान्ति",
    category: "shanti",
    keywords: ["kaal sarp", "kalsarp", "kaal sarp dosh", "kalsarpa", "sarpa dosha", "naag dosh", "rahu ketu", "rahu ketu dosh", "trimbakeshwar", "nag panchami"],
    duration: "2–3 hours",
    purohit: "Traditionally performed by a purohit, famously at Trimbakeshwar (Nashik), Ujjain or Srikalahasti.",
    summary: "Shanti for Kaal Sarp yoga — when all seven grahas fall on one side of the Rahu–Ketu axis. The yoga is not mentioned in the classical Parashari texts and its effects are debated; worship of Shiva and the Nagas is the traditional remedy.",
    when: "Nag Panchami, Amavasya, Mondays, Shivaratri, or during Rahu/Ketu dashas.",
    samagri: ["Silver naag–naagin pair (or picture)", "Shivling, milk, Ganga jal, bel leaves", "Durva and kusha (Rahu–Ketu samidha)", "Black urad, black sesame, blanket for daan", "Havan samagri"],
    steps: [
      ACHAMANA,
      SANKALPA,
      GANESHA_GAURI,
      KALASH,
      { title: "Rahu–Ketu puja", detail: "Worship Rahu and Ketu, reciting their stotra verses.", mantra: getStotra("Rahu") },
      { title: "Naag puja", detail: "Worship the silver naag pair with milk, haldi, akshata and flowers, praying to the nine Nagas (Ananta, Vasuki, Shesha, Padmanabha, Kambala, Shankhapala, Dhritarashtra, Takshaka, Kaliya)." },
      { title: "Rudrabhishek", detail: "Perform abhishek of the Shivling with milk and water chanting 'ॐ नमः शिवाय' (see Rudrabhishek).", mantra: MANTRAS.shivaPanchakshari },
      { title: "Rahu and Ketu japa and homa", detail: "Chant the Rahu and Ketu beej mantras 108 times each and offer ahutis with durva (Rahu) and kusha (Ketu).", mantra: getBeej("Rahu") },
      { title: "Mahamrityunjaya", detail: "Chant 108 times.", mantra: MANTRAS.mahamrityunjaya },
      { title: "Visarjan and daan", detail: "Immerse the naag pair in flowing water (or give it to a Shiva temple) and donate black urad, sesame and a blanket." },
      KSHAMA,
    ],
  },
  {
    id: "shani-shanti",
    title: "Shani Shanti & Sade Sati Remedies",
    devanagari: "शनि शान्ति",
    category: "shanti",
    keywords: ["shani", "shani dev", "shanidev", "sade sati", "sadesati", "saade saati", "dhaiya", "dhaiyya", "shani dosh", "saturn", "shanivar", "saturday", "shani mahadasha", "shani jayanti", "panoti"],
    duration: "30 minutes weekly; homa 1–2 hours",
    summary: "Worship and remedies for Shani — during Sade Sati (Saturn transiting the 12th, 1st and 2nd from the Moon), Dhaiya, or Shani mahadasha. Shani rewards honesty, discipline and service; these practices invite his grace.",
    when: "Saturdays, Shani Amavasya, Shani Jayanti (Jyeshtha Amavasya), and throughout Sade Sati.",
    samagri: ["Mustard oil and an iron or clay lamp", "Black sesame, black urad, black cloth, iron items for daan", "Blue or black flowers, shami leaves", "Peepal tree for evening worship"],
    steps: [
      ACHAMANA,
      SANKALPA,
      { title: "Shani dhyana", detail: "Remember Shani with reverence, not fear.", mantra: getStotra("Saturn") },
      { title: "Shani mantra japa", detail: "Chant the beej mantra (or 'ॐ शं शनैश्चराय नमः') 108 times every Saturday.", mantra: { ...getBeej("Saturn"), count: "108 every Saturday; 23,000 for anushthana" } },
      { title: "Oil abhishek and lamp", detail: "Offer mustard oil to Shani's murti (or see your reflection in a bowl of oil and donate it — chhaya daan), and light a mustard-oil lamp under a peepal tree at dusk, circling it seven times." },
      { title: "Hanuman worship", detail: "Recite the Hanuman Chalisa on Saturdays — Hanuman is said to protect devotees from Shani's harshness." },
      { title: "Shani homa (optional)", detail: "Offer 108 ahutis of shami samidha with black sesame and ghee using the beej mantra (see Havan Vidhi)." },
      { title: "Seva and daan", detail: "Donate black sesame, urad, mustard oil, black cloth, footwear or blankets to the needy, and serve workers, the elderly and the disabled — the truest Shani remedy." },
      KSHAMA,
    ],
    notes: ["Do not wear a blue sapphire without careful testing and advice from an experienced astrologer."],
  },
  {
    id: "janmashtami",
    title: "Krishna Janmashtami Puja",
    devanagari: "श्री कृष्ण जन्माष्टमी",
    category: "vrat",
    keywords: ["janmashtami", "krishna", "krishna janmashtami", "gokulashtami", "laddu gopal", "bal gopal", "kanha", "midnight puja", "dahi handi"],
    duration: "Day-long fast; midnight puja about 1 hour",
    summary: "Celebration of the birth of Shri Krishna at midnight on Bhadrapada Krishna Ashtami (Shravana Krishna Ashtami in amanta reckoning), with fasting, bhajans, abhishek of Laddu Gopal and a cradle ceremony.",
    when: "Bhadrapada Krishna Ashtami (purnimanta), ideally with Rohini nakshatra; the puja is at Nishita kaal (around midnight).",
    samagri: ["Laddu Gopal murti, cradle (jhula), new clothes and ornaments", "Panchamrit, Ganga jal", "Tulsi, makhan–mishri, panjiri, fruits, dhaniya panjiri", "Flowers, lamp, incense, peacock feather"],
    steps: [
      { title: "Fast", detail: "Keep a fast through the day (phalahar or nirjala, as health allows), singing bhajans and reading the Bhagavata's tenth skandha." },
      ACHAMANA,
      SANKALPA,
      { title: "Midnight abhishek", detail: "At midnight, bathe Laddu Gopal with panchamrit and Ganga jal while chanting.", mantra: MANTRAS.krishna },
      { title: "Shringar and jhula", detail: "Dress the Lord in new clothes, adorn him, offer tulsi and place him in the cradle; swing it gently, singing 'Nand ke anand bhayo, jai Kanhaiya lal ki'." },
      { title: "Bhoga", detail: "Offer makhan–mishri, panjiri and 56 dishes (chappan bhog) if possible, always with tulsi." },
      { title: "Aarti", detail: "Sing 'Aarti Kunj Bihari Ki' and distribute prasad. Break the fast after midnight or the next morning per family custom." },
      KSHAMA,
    ],
  },
  {
    id: "karwa-chauth",
    title: "Karwa Chauth Vrat",
    devanagari: "करवा चौथ व्रत",
    category: "vrat",
    keywords: ["karwa chauth", "karva chauth", "karwachauth", "husband long life", "pati ki lambi umar", "moon sighting", "chand", "sargi"],
    duration: "Sunrise to moonrise",
    summary: "The fast kept by married women for the well-being and long life of their husbands on Kartika Krishna Chaturthi, broken after sighting the moon.",
    when: "Kartika Krishna Chaturthi (purnimanta) — about nine days before Diwali; the fast ends at moonrise (see the Panchang page for moonrise time in your city).",
    samagri: ["Karwa (earthen pot with spout) filled with water", "Sieve (channi), diya, roli, akshata", "Picture/calendar of Karwa Mata, Gauri, Shiva and Ganesha", "Sargi (pre-dawn meal from the mother-in-law)", "Sweets, fruits, mathri, sixteen shringar items"],
    steps: [
      { title: "Sargi", detail: "Before sunrise, eat the sargi given by the mother-in-law, then take the sankalpa of the fast." },
      { title: "Nirjala fast", detail: "Fast without food or water through the day (those with health conditions should keep a phalahar fast instead)." },
      { title: "Evening puja and katha", detail: "Dressed in bridal finery, women gather, worship Gauri–Shiva–Ganesha and Karwa Mata, pass the thalis in a circle seven times and listen to the Karwa Chauth katha (the story of Queen Veeravati)." },
      { title: "Moon arghya", detail: "At moonrise, view the moon through the sieve, offer water from the karwa as arghya, then look at the husband's face through the sieve." },
      { title: "Break the fast", detail: "The husband offers the first sip of water and a bite of sweet." },
    ],
  },
];

function getBeej(name: string): Mantra {
  return GRAHAS.find((g) => g.name === name)!.beej;
}

function getStotra(name: string): Mantra {
  return GRAHAS.find((g) => g.name === name)!.stotra;
}
