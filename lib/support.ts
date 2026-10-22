// Brahman as a caring family pandit: recognises feelings and life moments ("I'm scared", "exam tomorrow,
// pray for me") and answers with warmth, a prayer offered on the person's behalf, mantras, a Gita verse,
// practical steps and a related katha. Crisis messages always put real-world help first.
import { transliterate } from "./devanagari.ts";
import { GANESHA_DHYANA, type Mantra } from "./ritual-common.ts";
import { MANTRAS } from "./hawans.ts";

export interface Situation {
  id: string;
  title: string;
  /** Regexes over transliterated, lower-cased text, with a weight each. */
  patterns: [RegExp, number][];
  deity: string;
  /** Openers when the person speaks for themselves; one is chosen per message. */
  comfort: string[];
  /** Opener when they ask on behalf of someone else. `{who}` is e.g. "your mother", `{they}` "she". */
  comfortOther: string;
  /** Brahman's prayer, spoken on the person's behalf. `{who}`, `{whose}` and `{when}` are filled in. */
  prayer: string;
  mantras: (Mantra & { title: string })[];
  verse: Mantra;
  steps: string[];
  kathaId?: string;
  ritualId?: string;
}

const m = (title: string, devanagari: string, iast: string, meaning: string, extra: Partial<Mantra> = {}) => ({ title, devanagari, iast, meaning, ...extra });
const gita = (devanagari: string, iast: string, meaning: string, source: string): Mantra => ({ devanagari, iast, meaning, source });

const SARASWATI_VANDANA = m(
  "Saraswati Vandana",
  "या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता। या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना॥ या ब्रह्माच्युतशङ्करप्रभृतिभिर्देवैः सदा वन्दिता। सा मां पातु सरस्वती भगवती निःशेषजाड्यापहा॥",
  "yā kundendutuṣārahāradhavalā yā śubhravastrāvṛtā | yā vīṇāvaradaṇḍamaṇḍitakarā yā śvetapadmāsanā || yā brahmācyutaśaṅkaraprabhṛtibhir devaiḥ sadā vanditā | sā māṃ pātu sarasvatī bhagavatī niḥśeṣajāḍyāpahā ||",
  "May Goddess Saraswati — white as jasmine, the moon and snow, clad in white, holding the veena, seated on a white lotus, ever worshipped by Brahma, Vishnu and Shiva — protect me and remove all dullness of mind.",
);
const SARASWATI_BEEJ = m("Saraswati mantra", "ॐ ऐं सरस्वत्यै नमः", "oṃ aiṃ sarasvatyai namaḥ", "Om, salutations to Saraswati (ऐं is her bija of wisdom).", { count: "11 or 108 times" });
const SARASWATI_STUDY = m(
  "Prayer before study or an exam",
  "सरस्वति नमस्तुभ्यं वरदे कामरूपिणि। विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा॥",
  "sarasvati namas tubhyaṃ varade kāmarūpiṇi | vidyārambhaṃ kariṣyāmi siddhir bhavatu me sadā ||",
  "Salutations to you, O Saraswati, giver of boons. I begin my learning — may I always succeed.",
);
const GANESH_BEEJ = m("Ganesha mantra", "ॐ गं गणपतये नमः", "oṃ gaṃ gaṇapataye namaḥ", "Om, salutations to Ganapati, remover of obstacles.", { count: "11 or 108 times" });
const GANESH = { title: "Ganesha prayer", ...GANESHA_DHYANA };
const HANUMAN_BEEJ = m("Hanuman mantra", "ॐ हं हनुमते नमः", "oṃ haṃ hanumate namaḥ", "Om, salutations to Hanuman.", { count: "11 or 108 times" });
const HANUMAN_SANKAT = m(
  "From the Hanuman Chalisa",
  "संकट कटै मिटै सब पीरा। जो सुमिरै हनुमत बलबीरा॥",
  "saṃkaṭa kaṭai miṭai saba pīrā | jo sumirai hanumata balabīrā ||",
  "Troubles end and all pain vanishes for whoever remembers the mighty Hanuman.",
);
const HANUMAN_FEAR = m(
  "From the Hanuman Chalisa",
  "सब सुख लहै तुम्हारी सरना। तुम रच्छक काहू को डर ना॥",
  "saba sukha lahai tumhārī saranā | tuma racchaka kāhū ko ḍara nā ||",
  "All happiness is found in your refuge; with you as protector, there is nothing to fear.",
);
const DURGA_REFUGE = m(
  "Durga stuti",
  "शरणागतदीनार्तपरित्राणपरायणे। सर्वस्यार्तिहरे देवि नारायणि नमोऽस्तु ते॥",
  "śaraṇāgatadīnārtaparitrāṇaparāyaṇe | sarvasyārtihare devi nārāyaṇi namo'stu te ||",
  "O Goddess devoted to protecting the helpless and distressed who seek your refuge, O remover of everyone's suffering — O Narayani, salutations to you.",
  { source: "Durga Saptashati 11" },
);
const MAHAMRITYUNJAYA = { title: "Mahamrityunjaya mantra", ...MANTRAS.mahamrityunjaya, count: "11 or 108 times" };
const OM_NAMAH_SHIVAYA = { title: "Shiva panchakshari", ...MANTRAS.shivaPanchakshari };
const LAKSHMI = { title: "Mahalakshmi mantra", ...MANTRAS.lakshmi };
const KRISHNA = { title: "Krishna mantra", ...MANTRAS.krishna };
const SHANTI = { title: "Shanti path", ...MANTRAS.shantiPath };
const GAYATRI = { title: "Gayatri mantra", ...MANTRAS.gayatri, count: "11 times" };
const KATYAYANI = m(
  "Katyayani mantra",
  "कात्यायनि महामाये महायोगिन्यधीश्वरि। नन्दगोपसुतं देवि पतिं मे कुरु ते नमः॥",
  "kātyāyani mahāmāye mahāyoginy adhīśvari | nandagopasutaṃ devi patiṃ me kuru te namaḥ ||",
  "O Katyayani, great power of illusion, great yogini, sovereign goddess — make the son of Nanda Gopa my husband; salutations to you. (Prayed by the gopis; recited for a good marriage.)",
  { source: "Bhagavatam 10.22.4" },
);
const SAMARPAN = m(
  "Prayer of offering",
  "कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्। करोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥",
  "kāyena vācā manasendriyair vā buddhyātmanā vā prakṛteḥ svabhāvāt | karomi yad yat sakalaṃ parasmai nārāyaṇāyeti samarpayāmi ||",
  "Whatever I do — with body, speech, mind, senses, intellect or by my very nature — I offer it all to the Supreme Narayana.",
);

const GITA_2_3 = gita("क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते। क्षुद्रं हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप॥", "klaibyaṃ mā sma gamaḥ pārtha naitat tvayy upapadyate | kṣudraṃ hṛdayadaurbalyaṃ tyaktvottiṣṭha parantapa ||", "Do not yield to weakness, O Partha; it does not become you. Cast off this petty faintness of heart and arise, O scorcher of foes!", "Gita 2.3");
const GITA_2_47 = gita("कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥", "karmaṇy evādhikāras te mā phaleṣu kadācana | mā karmaphalahetur bhūr mā te saṅgo'stv akarmaṇi ||", "Your right is to action alone, never to its fruits. Do not be motivated by the fruits of action, nor be attached to inaction.", "Gita 2.47");
const GITA_2_48 = gita("योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥", "yogasthaḥ kuru karmāṇi saṅgaṃ tyaktvā dhanañjaya | siddhyasiddhyoḥ samo bhūtvā samatvaṃ yoga ucyate ||", "Steadfast in yoga, do your work, giving up attachment, O Dhananjaya, equal in success and failure. This evenness of mind is called yoga.", "Gita 2.48");
const GITA_2_40 = gita("नेहाभिक्रमनाशोऽस्ति प्रत्यवायो न विद्यते। स्वल्पमप्यस्य धर्मस्य त्रायते महतो भयात्॥", "nehābhikramanāśo'sti pratyavāyo na vidyate | svalpam apy asya dharmasya trāyate mahato bhayāt ||", "On this path no effort is ever lost and no harm is done. Even a little of this dharma protects one from great fear.", "Gita 2.40");
const GITA_2_27 = gita("जातस्य हि ध्रुवो मृत्युर्ध्रुवं जन्म मृतस्य च। तस्मादपरिहार्येऽर्थे न त्वं शोचितुमर्हसि॥", "jātasya hi dhruvo mṛtyur dhruvaṃ janma mṛtasya ca | tasmād aparihārye'rthe na tvaṃ śocitum arhasi ||", "For one who is born, death is certain, and for one who dies, birth is certain. Therefore you should not grieve over what is unavoidable.", "Gita 2.27");
const GITA_2_20 = gita("न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥", "na jāyate mriyate vā kadācin nāyaṃ bhūtvā bhavitā vā na bhūyaḥ | ajo nityaḥ śāśvato'yaṃ purāṇo na hanyate hanyamāne śarīre ||", "The Self is never born and never dies. Unborn, eternal and ancient, it is not slain when the body is slain.", "Gita 2.20");
const GITA_2_63 = gita("क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः। स्मृतिभ्रंशाद्बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥", "krodhād bhavati sammohaḥ sammohāt smṛtivibhramaḥ | smṛtibhraṃśād buddhināśo buddhināśāt praṇaśyati ||", "From anger comes delusion; from delusion, loss of memory; from loss of memory, the ruin of discernment; and with that, one is lost.", "Gita 2.63");
const GITA_6_5 = gita("उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥", "uddhared ātmanātmānaṃ nātmānam avasādayet | ātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ ||", "Lift yourself by yourself; do not let yourself sink. You alone are your own friend, and you alone your own enemy.", "Gita 6.5");
const GITA_6_30 = gita("यो मां पश्यति सर्वत्र सर्वं च मयि पश्यति। तस्याहं न प्रणश्यामि स च मे न प्रणश्यति॥", "yo māṃ paśyati sarvatra sarvaṃ ca mayi paśyati | tasyāhaṃ na praṇaśyāmi sa ca me na praṇaśyati ||", "One who sees me everywhere and sees everything in me — I am never lost to them, nor are they ever lost to me.", "Gita 6.30");
const GITA_9_22 = gita("अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥", "ananyāś cintayanto māṃ ye janāḥ paryupāsate | teṣāṃ nityābhiyuktānāṃ yogakṣemaṃ vahāmy aham ||", "Those who worship me with undivided devotion — I carry what they lack and preserve what they have.", "Gita 9.22");
const GITA_18_66 = gita("सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥", "sarvadharmān parityajya mām ekaṃ śaraṇaṃ vraja | ahaṃ tvā sarvapāpebhyo mokṣayiṣyāmi mā śucaḥ ||", "Abandoning all else, take refuge in me alone. I shall free you from all sins; do not grieve.", "Gita 18.66");
const GITA_18_78 = gita("यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः। तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥", "yatra yogeśvaraḥ kṛṣṇo yatra pārtho dhanurdharaḥ | tatra śrīr vijayo bhūtir dhruvā nītir matir mama ||", "Wherever there is Krishna and Arjuna, there will surely be fortune, victory, prosperity and righteousness.", "Gita 18.78");
const GITA_9_26 = gita("पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति। तदहं भक्त्युपहृतमश्नामि प्रयतात्मनः॥", "patraṃ puṣpaṃ phalaṃ toyaṃ yo me bhaktyā prayacchati | tad ahaṃ bhaktyupahṛtam aśnāmi prayatātmanaḥ ||", "Whoever offers me with devotion a leaf, a flower, a fruit or water — that loving offering I accept.", "Gita 9.26");

export const SITUATIONS: Situation[] = [
  {
    id: "exam",
    title: "Blessings for your exam",
    patterns: [[/\b(exams?|examination|pariksha|parikcha|paper|board exams?|(?<!blood |covid |medical |sugar )test|neet|jee|upsc|ssc|cat exam|gate exam|entrance|semester|finals|viva|result)\b/, 4], [/\b(study|studies|padhai|padhna|revision|syllabus|marks|pass)\b/, 2]],
    deity: "Maa Saraswati and Shri Ganesha",
    comfort: [
      "🙏 Bless you, {who}. Feeling nervous before an exam is natural — it shows how much it matters. You have prepared more than you think.",
      "🙏 May Maa Saraswati sit on your tongue and in your mind. An exam is just a chance to show what you have learned — and you have learned a lot.",
    ],
    comfortOther: "🙏 I will pray for {who}. Exams bring nerves, but with your love and Maa Saraswati's grace, {they} will do well.",
    prayer:
      "O Maa Saraswati, giver of wisdom, and Shri Ganesha, remover of obstacles — please bless {who} {when}. Make {whose} mind calm and clear, let everything studied come back easily, steady the hand that writes, and remove every fear and obstacle. May the effort be complete and the result be for the highest good. Tathastu.",
    mantras: [SARASWATI_STUDY, SARASWATI_BEEJ, GANESH],
    verse: GITA_2_47,
    steps: [
      "Tonight: revise only the key points, then stop. Sleep well — a rested mind remembers far more than a tired one.",
      "In the morning: bathe, bow to your parents, and chant the Saraswati mantra 11 times. Eat something light; carry water.",
      "Before writing: close your eyes, take five slow breaths, and remember Ganesha. Read the whole paper once, start with what you know best.",
      "If your mind goes blank, put the pen down, breathe slowly, and say 'ॐ ऐं सरस्वत्यै नमः' silently — then move on and come back.",
      "Afterwards, let it go. You did your karma; the fruit is in the Lord's hands.",
    ],
    kathaId: "sundarkand",
    ritualId: "ganesh-puja",
  },
  {
    id: "interview",
    title: "Blessings for your interview",
    patterns: [[/\b(interview|job interview|selection|placement|naukri|naukari|job|presentation|pitch|audition|promotion|appraisal|meeting with (my )?boss)\b/, 4], [/\b(hr|offer letter|company|office|career)\b/, 1]],
    deity: "Shri Ganesha and Hanuman ji",
    comfort: [
      "🙏 All the best, {who}. An interview is a meeting, not a battle — they already liked what they saw, and that is why they called.",
      "🙏 May Ganesha open the doors and Hanuman ji give you courage. Go as yourself; that is your greatest strength.",
    ],
    comfortOther: "🙏 I will pray for {who}. May Ganesha open the right door — your blessings matter more than you know.",
    prayer:
      "O Vighnaharta Ganesha, remover of obstacles, and Hanuman ji, giver of strength and wisdom — please be with {who} {when}. Give {whose} words clarity and confidence, let {whose} true abilities shine, and open the door that is truly meant to open. If this is right, let it come easily; if something better is waiting, let it come soon. Tathastu.",
    mantras: [GANESH_BEEJ, HANUMAN_BEEJ, GANESH],
    verse: GITA_2_48,
    steps: [
      "Tonight: prepare three things you want them to know about you, and one example for each. Lay out your clothes and documents, then rest.",
      "In the morning: chant 'ॐ गं गणपतये नमः' 11 times; take a little curd and sugar (dahi-cheeni) for an auspicious start, as many families do.",
      "On the way: say the Hanuman mantra; breathe slowly. Arrive a little early.",
      "In the room: sit upright, smile, listen fully to each question, and pause before answering. It is fine to say 'let me think for a moment'.",
      "Afterwards: thank them, and leave the result to the Lord — do your best, be equal in success and failure.",
    ],
    kathaId: "sundarkand",
    ritualId: "ganesh-puja",
  },
  {
    id: "fear",
    title: "When you are afraid",
    patterns: [[/\b(scared|scary|afraid|fear|fearful|frightened|terrified|darr?|darr? lag|dar lagta|bhay|ghabra\w*|panic|nervous|anxious|anxiety|tension|worried|worry|chinta|restless|bechain)\b/, 3], [/\b(night|alone|akela|nightmare|bura sapna)\b/, 1]],
    deity: "Hanuman ji",
    comfort: [
      "🙏 I am here with you, {who}. Fear is a passing cloud — it feels big, but it is not stronger than you. Let us take a breath together.",
      "🙏 Do not be afraid, {who}. The Lord who protected Prahlad in the fire is with you right now. Breathe slowly; you are safe in this moment.",
    ],
    comfortOther: "🙏 I will pray for {who}. Let {them} know they are not alone — your presence is the first protection.",
    prayer:
      "O Sankat Mochan Hanuman ji, you who carried a mountain for Shri Ram, please hold {who} in your protection {when}. Take away this fear, fill {whose} heart with your courage, and let {whose} mind become calm and steady. Wherever {who} may go, may you walk ahead. Jai Hanuman.",
    mantras: [HANUMAN_FEAR, HANUMAN_BEEJ, HANUMAN_SANKAT],
    verse: GITA_2_40,
    steps: [
      "Breathe with me: in for 4 counts, hold for 4, out slowly for 6. Do it five times while silently saying 'Ram'.",
      "Put your hand on your heart and say 'ॐ हं हनुमते नमः' 11 times, slowly.",
      "Light a lamp or keep a small light on, and if you can, recite the Hanuman Chalisa — even once is enough.",
      "Tell someone you trust how you feel; fear grows in silence and shrinks when shared.",
      "If the fear or anxiety keeps coming back or stops you from living normally, please also talk to a doctor or counsellor — that is wisdom, not weakness.",
    ],
    kathaId: "prahlad",
    ritualId: "hanuman-sundarkand",
  },
  {
    id: "motivation",
    title: "Strength and motivation",
    patterns: [[/\b(lost my job|job chali gayi|naukri chali gayi|fired|laid off|layoff)\b/, 5], [/\b(motivate|motivation|demotivated|lazy|no energy|give up|giving up|hopeless|lost hope|low|down|weak|confidence|self doubt|not good enough|haar gaya|haar gayi|himmat|hausla|inspire)\b/, 3], [/\b(failed|failure|fail|rejected|rejection|lost)\b/, 2]],
    deity: "Shri Krishna",
    comfort: [
      "🙏 Arise, {who}! Even Arjuna — the greatest archer — once sat down and could not lift his bow. Krishna did not scold him; he lifted him. Let me do the same for you.",
      "🙏 Every great soul has known days like this. A setback is not the end of the story; it is the middle. You still have everything you need to rise.",
    ],
    comfortOther: "🙏 I will pray for {who}. Your faith in {them} is a great strength; let us add the Lord's blessing to it.",
    prayer:
      "O Shri Krishna, charioteer of Arjuna, please take the reins of {whose} life {when}. Remove this heaviness of heart, give {who} the strength to rise again, and show the next right step. Let {whose} effort be steady and {whose} faith unshaken. Jai Shri Krishna.",
    mantras: [KRISHNA, GAYATRI],
    verse: GITA_2_3,
    steps: [
      "Do one small thing right now — wash your face, stand up, step outside for five minutes. Movement brings energy.",
      "Write down one thing you will do today, however small, and do it. Victory is built from small wins.",
      "Each morning, read Gita 2.3 and 6.5 aloud: you are your own best friend.",
      "Offer your work to Krishna and stop measuring yourself only by the result.",
      "If this low feeling lasts for weeks, please speak to someone you trust and a doctor — the Lord also works through healers.",
    ],
    kathaId: "bhagavad-gita",
  },
  {
    id: "illness",
    title: "Prayers for health and healing",
    patterns: [[/\b(blood test|medical report|scan|mri|ill|illness|sick|bimar|beemar|bimari|beemari|hospital|surgery|operation|disease|cancer|fever|bukhar|icu|treatment|recovery|health|tabiyat|tabiyat kharab|unwell|pain|dard|accident|injured)\b/, 4]],
    deity: "Mahamrityunjaya Shiva and Dhanvantari",
    comfort: [
      "🙏 May Mahadev bless {who} with quick recovery. I am praying with you. Worry is love in another form — but let us turn it into prayer.",
      "🙏 Do not lose heart. Shiva saved Markandeya from Death itself; he hears every sincere prayer for healing. I am with you.",
    ],
    comfortOther: "🙏 May Mahadev bless {who} with quick recovery. I am praying with you — your worry is love; let us turn it into prayer.",
    prayer:
      "O Mahamrityunjaya Shiva, conqueror of death, and Lord Dhanvantari, divine healer — please place your healing hand on {who} {when}. Remove all pain and illness, give strength to the body and peace to the mind, guide the doctors' hands and the medicines, and bless {who} with a long and healthy life. Om Namah Shivaya.",
    mantras: [MAHAMRITYUNJAYA, OM_NAMAH_SHIVAYA],
    verse: GITA_9_22,
    steps: [
      "First and always: follow the doctors' advice and treatment. Prayer supports medicine; it never replaces it.",
      "Chant the Mahamrityunjaya mantra 11 or 108 times daily, keeping the person in mind; family members can share the japa.",
      "Offer water to a Shivling on Monday, or keep a glass of water near you while chanting and give it to the patient to sip.",
      "Keep the atmosphere calm — light a ghee lamp, play bhajans softly, and speak words of hope near the patient.",
      "Donate food or medicine to someone in need in the patient's name.",
    ],
    kathaId: "markandeya",
    ritualId: "mahamrityunjaya",
  },
  {
    id: "grief",
    title: "In your grief",
    patterns: [[/\b(passed away|died|death|expired|demise|lost my (mother|mom|father|dad|papa|son|daughter|wife|husband|brother|sister|grand\w+|friend|baby|child|pet|dog|cat)|no more|nahi rahe|nahi rahi|guzar gay\w*|swargwas|swargvas|grief|grieving|mourning|shok|miss (him|her|them)|funeral|cremation)\b/, 4], [/\b(sad|sadness|dukh|dukhi|udaas|udas|crying|ro raha|ro rahi|heartbroken|broken)\b/, 2]],
    deity: "Shiva and Shri Krishna",
    comfort: [
      "🙏 I am so sorry, {who}. There are no words that can take this pain away. Please know that the love you shared does not end — the soul is eternal.",
      "🙏 Om Shanti. May the departed soul find peace, and may you find strength. It is right to grieve; tears are also a prayer.",
    ],
    comfortOther: "🙏 I am so sorry for your loss. May {who} find peace in the Lord's abode, and may you find strength.",
    prayer:
      "O Lord Shiva and Shri Krishna, please receive the departed soul with love and grant it eternal peace and a high and happy path. Give {who} the strength to bear this loss {when}, fill the emptiness with your presence, and let the sweet memories become blessings. Om Shanti, Shanti, Shanti.",
    mantras: [OM_NAMAH_SHIVAYA, KRISHNA, SHANTI],
    verse: GITA_2_20,
    steps: [
      "Light a lamp for the departed every evening, facing south, and say their name with love.",
      "Read or listen to chapter 2 or 15 of the Bhagavad Gita; the Garuda Purana is traditionally heard in the days after a death.",
      "Let yourself grieve, and let others care for you. Eat, rest, and stay with family.",
      "Do something good in their name — feed the hungry, plant a tree, give to a cause they loved.",
      "If grief becomes too heavy to carry for a long time, please speak to a counsellor as well — there is no shame in seeking help.",
    ],
    kathaId: "garuda-purana",
    ritualId: "tarpan",
  },
  {
    id: "travel",
    title: "Blessings for a safe journey",
    patterns: [[/\b(travel|travelling|traveling|journey|yatra|trip|flight|flying|abroad|going abroad|visa|safar|road trip|driving)\b/, 4]],
    deity: "Hanuman ji and Shri Ganesha",
    comfort: ["🙏 Shubh yatra, {who}! May your journey be safe and every road smooth."],
    comfortOther: "🙏 Shubh yatra to {who}! May every road be safe.",
    prayer: "O Shri Ganesha and Hanuman ji, protector of travellers, please go ahead of {who} {when}. Keep every step of this journey safe, every vehicle steady, and bring {who} home happily. Shubh yatra.",
    mantras: [GANESH_BEEJ, HANUMAN_BEEJ],
    verse: GITA_9_22,
    steps: [
      "Before leaving, bow to the family deity and elders; many families give a spoon of curd and sugar for a good start.",
      "Chant 'ॐ गं गणपतये नमः' 11 times and the Hanuman mantra as you set out.",
      "Keep a small image of Hanuman ji or Ganesha with you.",
      "Call home when you arrive.",
    ],
    ritualId: "hanuman-sundarkand",
  },
  {
    id: "new-beginning",
    title: "Blessings for a new beginning",
    patterns: [[/\b(new job|first day|joining|new business|business|startup|shop opening|launch|new venture|new project|new start|naya kaam|naya business|dukaan)\b/, 4]],
    deity: "Shri Ganesha and Maa Lakshmi",
    comfort: ["🙏 Shubh aarambh, {who}! Every great thing begins with a single step taken with faith."],
    comfortOther: "🙏 Shubh aarambh to {who}! May this beginning grow with dharma and success.",
    prayer: "O Shri Ganesha, lord of beginnings, and Maa Lakshmi, giver of prosperity — please bless {whose} new beginning {when}. Remove every obstacle, bring good people and fair success, and let it grow with honesty and dharma. Shubh labh.",
    mantras: [GANESH, GANESH_BEEJ, LAKSHMI],
    verse: GITA_18_78,
    steps: [
      "Begin with a small Ganesha puja — even a lamp, a flower and 'ॐ गं गणपतये नमः' 11 times.",
      "Choose an auspicious time if you can (see the Panchang page), avoiding Rahu Kaal.",
      "Write 'शुभ लाभ' and a swastika in your first notebook or account book.",
      "Begin with an act of giving — sweets, or a donation — so that prosperity flows both ways.",
    ],
    ritualId: "ganesh-puja",
  },
  {
    id: "money",
    title: "When money troubles you",
    patterns: [[/\b(money|paisa|paise|financial|finance|debt|loan|karz|karza|loss in business|nuksan|nuksaan|poverty|garibi|salary|bills|rent|kharcha|udhaar|dhan)\b/, 4]],
    deity: "Maa Lakshmi and Kubera",
    comfort: ["🙏 Financial worries can weigh heavily, {who}. Take heart — Lakshmi is chanchala; she comes and goes, and good times return to those who stay honest and keep trying."],
    comfortOther: "🙏 I will pray for {who}. Good times return to those who stay honest and keep trying.",
    prayer: "O Maa Mahalakshmi and Kubera, guardian of wealth — please look kindly on {who} {when}. Clear the debts, open honest ways to earn, bring wisdom in spending and saving, and keep the home free of lack. May every rupee be earned with dharma and used with grace.",
    mantras: [LAKSHMI, GANESH_BEEJ],
    verse: GITA_9_22,
    steps: [
      "Write down what comes in and what goes out; clarity itself reduces fear.",
      "Speak honestly to those you owe and agree on small, steady repayments.",
      "On Fridays, light a ghee lamp for Lakshmi and chant 'ॐ श्रीं महालक्ष्म्यै नमः' 108 times; keep the home and entrance clean.",
      "Seek advice from someone experienced or a financial counsellor before big decisions or new loans.",
      "Give something, however small — gratitude and charity open the doors of Lakshmi.",
    ],
    ritualId: "lakshmi-puja",
  },
  {
    id: "marriage",
    title: "Prayers for marriage",
    patterns: [[/\b(marriage|shaadi|shadi|vivah|wedding|rishta|life partner|delay in marriage|shaadi mein deri|engagement|sagai|getting married)\b/, 4]],
    deity: "Maa Katyayani and Shiva–Parvati",
    comfort: ["🙏 May the right companion come at the right time, {who}. The Lord who joined Shiva and Parvati arranges every true union."],
    comfortOther: "🙏 May the right companion come for {who} at the right time — I will pray for it.",
    prayer: "O Maa Katyayani, and Shiva and Parvati, divine couple — please bless {who} {when}. Bring a good, loving and dharmic life partner, remove every delay and obstacle, and let the marriage be filled with respect, joy and devotion. Tathastu.",
    mantras: [KATYAYANI, OM_NAMAH_SHIVAYA],
    verse: GITA_9_22,
    steps: [
      "Chant the Katyayani mantra 108 times daily, especially on Mondays and Fridays.",
      "Keep the Solah Somvar or Monday vrat and offer water to Shiva, if your health allows.",
      "If your family wishes, check the kundli for Mangal dosha — Brahman can make it — but do not let astrology create fear.",
      "Stay open, kind and patient; the right person values who you truly are.",
    ],
    kathaId: "hartalika-teej-katha",
    ritualId: "mangal-dosh",
  },
  {
    id: "anger",
    title: "Calming anger",
    patterns: [[/\b(angry|anger|gussa|krodh|frustrated|frustration|irritated|annoyed|rage|fight|jhagda|jhagra|quarrel|argument)\b/, 3]],
    deity: "Shri Krishna and Lord Shiva",
    comfort: ["🙏 Let us pause together, {who}. Anger is a fire that burns the one who holds it first. You do not have to act on it right now."],
    comfortOther: "🙏 I will pray for peace for {who}. Patience from your side will help calm the fire.",
    prayer: "O Lord Shiva, who holds the fiercest power with perfect calm, and Shri Krishna, ever smiling — please cool the fire in {whose} heart {when}. Bring patience, understanding and the right words, and turn this moment towards peace. Om Shanti.",
    mantras: [OM_NAMAH_SHIVAYA, SHANTI],
    verse: GITA_2_63,
    steps: [
      "Do not reply or decide anything for the next ten minutes.",
      "Drink a glass of water slowly, and breathe out longer than you breathe in.",
      "Chant 'ॐ नमः शिवाय' 11 times, or simply count backwards from twenty.",
      "Later, speak about how you felt rather than what the other person did wrong.",
    ],
  },
  {
    id: "loneliness",
    title: "When you feel alone",
    patterns: [[/\b(lonely|loneliness|alone|akela|akeli|akelapan|no one|nobody|isolated|left out|no friends)\b/, 3]],
    deity: "Shri Krishna",
    comfort: ["🙏 You are not alone, {who}. I am here, and the Lord who lives in your heart has never left you for a moment."],
    comfortOther: "🙏 I will pray for {who}. Your care for {them} is already a sign that {they} are not alone.",
    prayer: "O Shri Krishna, friend of every heart, please let {who} feel your presence {when}. Fill this loneliness with your love, bring kind and true companions, and remind {who} that you are always near. Jai Shri Krishna.",
    mantras: [KRISHNA, OM_NAMAH_SHIVAYA],
    verse: GITA_6_30,
    steps: [
      "Reach out to one person today — a call or a message is enough.",
      "Visit a temple, satsang or kirtan; sangat (good company) heals the heart.",
      "Serve someone — a neighbour, an elder, an animal. Seva connects us.",
      "If loneliness turns into hopelessness, please talk to someone you trust or a counsellor.",
    ],
    kathaId: "sudama",
  },
  {
    id: "sleep",
    title: "For peaceful sleep",
    patterns: [[/\b(cant sleep|can't sleep|cannot sleep|insomnia|neend|neend nahi|sleepless|no sleep|bad dreams|nightmares?)\b/, 4]],
    deity: "Lord Vishnu",
    comfort: ["🙏 Rest now, {who}. The day is done; whatever is left can wait for the morning."],
    comfortOther: "🙏 I will pray that {who} rests peacefully tonight.",
    prayer: "O Lord Vishnu, who rests peacefully on Shesha, please give {who} deep and peaceful sleep {when}. Calm the mind, release the worries of the day, and protect through the night. Om Shanti.",
    mantras: [{ title: "Vishnu dhyana", ...MANTRAS.vishnu }, SHANTI],
    verse: GITA_18_66,
    steps: [
      "Put away the phone, dim the lights, and wash your feet before bed.",
      "Lying down, breathe slowly and say 'Ram' with each breath out.",
      "Offer the day to the Lord: whatever happened, give it to him.",
      "If sleeplessness continues for weeks, please consult a doctor.",
    ],
  },
  {
    id: "gratitude",
    title: "Giving thanks",
    patterns: [[/\b(passed my|cleared|got (the )?job|got selected|selected|i passed|good news|thank god|thanks to god|blessed|grateful|gratitude|dhanyavad|shukriya|it worked|success|got married|baby (is )?born|promotion came)\b/, 5]],
    deity: "Your ishta devata",
    comfort: ["🙏 Badhai ho, {who}! What wonderful news. Let us thank the Lord together — gratitude doubles every blessing."],
    comfortOther: "🙏 Badhai ho! What wonderful news about {who}. Let us thank the Lord together.",
    prayer: "O Lord, thank you for this blessing on {who}. Keep {whose} heart humble in success, let this good fortune be shared with others, and may it be the beginning of many more blessings. Sarve bhavantu sukhinah.",
    mantras: [SAMARPAN, GAYATRI],
    verse: GITA_9_26,
    steps: [
      "Offer a sweet or fruit to your deity and share it as prasad with family.",
      "Touch your parents' and teachers' feet; their blessings are part of this success.",
      "Give something to someone in need as thanks.",
      "If you made a mannat (vow), fulfil it.",
    ],
    ritualId: "satyanarayan",
  },
];

// ---------------------------------------------------------------------------

export type Relation = { who: string; whose: string; they: string; them: string };

const RELATIONS: [RegExp, Relation][] = [
  [/\bmy (mother|mom|mum|mummy|maa|mother in law)\b|\b(meri )?(maa|mummy|mata ji|mataji)\b/, { who: "your mother", whose: "her", they: "she", them: "her" }],
  [/\bmy (father|dad|papa|daddy|father in law)\b|\b(mere )?(papa|pitaji|pita ji)\b/, { who: "your father", whose: "his", they: "he", them: "him" }],
  [/\bmy (son|boy)\b|\b(mera )?beta\b/, { who: "your son", whose: "his", they: "he", them: "him" }],
  [/\bmy (daughter|girl)\b|\b(meri )?beti\b/, { who: "your daughter", whose: "her", they: "she", them: "her" }],
  [/\bmy (wife)\b|\b(meri )?(patni|biwi)\b/, { who: "your wife", whose: "her", they: "she", them: "her" }],
  [/\bmy (husband)\b|\b(mere )?(pati|pati dev)\b/, { who: "your husband", whose: "his", they: "he", them: "him" }],
  [/\bmy (brother)\b|\b(mera )?(bhai|bhaiya)\b/, { who: "your brother", whose: "his", they: "he", them: "him" }],
  [/\bmy (sister)\b|\b(meri )?(behen|behan|didi)\b/, { who: "your sister", whose: "her", they: "she", them: "her" }],
  [/\bmy (grandmother|grandma|nani|dadi)\b|\b(nani|dadi)\b/, { who: "your grandmother", whose: "her", they: "she", them: "her" }],
  [/\bmy (grandfather|grandpa|nana|dada)\b|\b(nana ji|dada ji)\b/, { who: "your grandfather", whose: "his", they: "he", them: "him" }],
  [/\bmy (friend)\b|\b(mera|meri) (dost|friend)\b/, { who: "your friend", whose: "their", they: "they", them: "them" }],
  [/\bmy (child|kid|baby)\b|\b(mera|meri) (bachcha|bacha|bachchi)\b/, { who: "your child", whose: "their", they: "they", them: "them" }],
];

const CRISIS = /\b(suicid\w*|kill myself|killing myself|end (my|this) life|end it all|want to die|wanna die|don'?t want to live|no reason to live|better off dead|hurt myself|self harm|cut myself|marna chahta|marna chahti|mar jaun|mar jaunga|mar jaungi|jeena nahi|jeene ka mann nahi|khudkushi|aatmahatya|atmahatya|zindagi khatam)\b/;
const EMERGENCY = /\b(heart attack|chest pain|can'?t breathe|cannot breathe|not breathing|unconscious|behosh|stroke|bleeding heavily|poison\w*|overdose|seizure)\b/;

export const CRISIS_TEXT = [
  "🙏 I am really glad you told me. What you are feeling matters, and you do not have to carry it alone.",
  "Please reach out right now to someone who can be with you:",
  "• In India: Tele-MANAS, the free 24×7 mental health helpline — call 14416 or 1-800-891-4416. In an emergency, call 112.",
  "• Outside India: call your local emergency number or a suicide prevention helpline in your country.",
  "• Tell a family member or friend near you how you feel, and stay with them.",
  "You are precious — to your family, and to the Lord who lives in your heart. This pain can pass, and help can make that happen. I am praying for you.",
];

export const EMERGENCY_TEXT = [
  "🙏 This sounds like a medical emergency. Please call for help right now — in India dial 112 (or 108 for an ambulance); elsewhere, your local emergency number.",
  "Stay with the person, keep them comfortable, and follow the operator's instructions. I am praying with you — but please get medical help first.",
];

export interface SupportMatch {
  id: string;
  score: number;
  relation?: Relation;
  when?: "today" | "tomorrow" | "tonight";
}

const PERSONAL = /\b(i am|i'?m|im|i feel|feeling|i have|i've|ive|my|me|mujhe|mera|meri|mere|main|hum|pray for|bless (me|us)|help me|motivate|please pray|dua|ashirwad|aashirwad)\b/;

function normalise(text: string): string {
  return ` ${transliterate(text).toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9'\s]+/g, " ").replace(/\s+/g, " ")} `;
}

export function detectCrisis(text: string): "crisis" | "emergency" | null {
  const t = normalise(text);
  if (CRISIS.test(t)) return "crisis";
  if (EMERGENCY.test(t)) return "emergency";
  return null;
}

/** Recognises a feeling or life moment. Returns the best situation, with who it is about and when. */
export function detectSituation(text: string): SupportMatch | null {
  const t = normalise(text);
  let best: SupportMatch | null = null;
  for (const s of SITUATIONS) {
    let score = 0;
    for (const [re, w] of s.patterns) if (re.test(t)) score += w;
    if (score > 0 && (!best || score > best.score)) best = { id: s.id, score };
  }
  if (!best) return null;
  if (PERSONAL.test(t)) best.score += 2;
  if (/\b(pray|prayer|bless|blessing|ashirwad|aashirwad|dua|prarthana)\b/.test(t)) best.score += 2;
  const relation = RELATIONS.find(([re]) => re.test(t))?.[1];
  if (relation) best.relation = relation;
  if (/\b(tomorrow|kal)\b/.test(t)) best.when = "tomorrow";
  else if (/\b(tonight|aaj raat)\b/.test(t)) best.when = "tonight";
  else if (/\b(today|aaj|now|abhi)\b/.test(t)) best.when = "today";
  return best;
}

export function getSituation(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}

const WHEN_TEXT = { today: "today", tomorrow: "tomorrow", tonight: "tonight" } as const;

/** Fills a situation's texts for the person: "{who}" → "you" / "your mother", etc. */
export function personalise(text: string, match: Pick<SupportMatch, "relation" | "when">, prayer = false): string {
  // In a prayer Brahman speaks to the Lord, so the person is "this devotee" rather than "you".
  const self: Relation = prayer ? { who: "this devotee", whose: "their", they: "they", them: "them" } : { who: "you", whose: "your", they: "you", them: "you" };
  const relation = match.relation && prayer ? { ...match.relation, who: match.relation.who.replace(/^your /, "this devotee's ") } : match.relation;
  const r = relation ?? self;
  let out = text;
  // Vocatives ("All the best, {who}.") only make sense when speaking to the person themselves.
  if (!match.relation && !prayer) out = out.replace(/, \{who\}(?=[.!,])/g, "");
  return out
    .replaceAll("{who}", r.who)
    .replaceAll("{whose}", r.whose)
    .replaceAll("{they}", r.they)
    .replaceAll("{them}", r.them)
    .replaceAll(" {when}", match.when ? ` ${WHEN_TEXT[match.when]}` : "");
}

/** A stable choice among variants, so the same message always gets the same words. */
export function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return items[h % items.length];
}

/** The personalised words of a support answer: the comfort line and Brahman's prayer. */
export function supportWords(card: { id: string; relation?: Relation; when?: "today" | "tomorrow" | "tonight"; seed: string }) {
  const s = getSituation(card.id);
  if (!s) return null;
  const comfort = card.relation ? s.comfortOther : pick(s.comfort, card.seed);
  return { situation: s, comfort: personalise(comfort, card), prayer: personalise(s.prayer, card, true) };
}
