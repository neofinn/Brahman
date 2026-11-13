// Lal Kitab (Pt. Roop Chand Joshi, editions 1939–1952): the house-based system with its own permanent houses,
// house-to-house aspects, ancestral debts (rin) and simple behavioural remedies (upay). The Lal Kitab chart ignores
// signs: the lagna is always house 1 and is labelled Mesha, house 2 Vrishabha, and so on, so a planet's whole-sign
// house from the lagna is its Lal Kitab house. Where secondary sources disagree, the most widely published version is
// used and the variant is noted in a comment. Remedies are tendencies to work with, never fear-based fate.
import { RASHIS, type Kundli } from "./jyotish.ts";

export const LK_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"] as const;

// ---------------------------------------------------------------------------
// Pakka ghar (permanent houses)

// House-wise in Lal Kitab: 1 Sun, 2 Jupiter, 3 Mars, 4 Moon, 5 Jupiter, 6 Ketu, 7 Venus (and Mercury), 8 Mars and
// Saturn, 9 Jupiter, 10 Saturn, 11 Jupiter, 12 Jupiter (and Rahu).
// Variants: some lists also give Mercury the 6th (where it is exalted) and give the 11th to Jupiter or to Saturn. Both
// are left out here because the planet-wise lists published most often omit them.
export const PAKKA_GHAR: Record<string, number[]> = {
  Sun: [1],
  Moon: [4],
  Mars: [3, 8],
  Mercury: [7],
  Jupiter: [2, 5, 9, 12],
  Venus: [7],
  Saturn: [8, 10],
  Rahu: [12],
  Ketu: [6],
};

// ---------------------------------------------------------------------------
// Aspects (drishti): Lal Kitab aspects run from house to house, not from planet to planet.

export interface LkAspect { from: number; to: number; strength: 100 | 50 | 25; note: string }

// Full: 1→7 and 4→10. Half: 3→9, 3→11 and 5→9. Quarter: 2→6 and 6→12. The 8th acts on the 2nd as well; it is usually
// described as a full aspect (the "inverted" 8th), which completes the chain 8→2→6→12.
// Variant: some writers add mutual quarter aspects 8↔6 and 2↔12. They are left out here as less widely published.
export const LK_ASPECTS: LkAspect[] = [
  { from: 1, to: 7, strength: 100, note: "full (sau fi sadi)" },
  { from: 4, to: 10, strength: 100, note: "full (sau fi sadi)" },
  { from: 8, to: 2, strength: 100, note: "full; the 8th strikes the 2nd" },
  { from: 3, to: 9, strength: 50, note: "half (pachas fi sadi)" },
  { from: 3, to: 11, strength: 50, note: "half (pachas fi sadi)" },
  { from: 5, to: 9, strength: 50, note: "half (pachas fi sadi)" },
  { from: 2, to: 6, strength: 25, note: "quarter (pachchis fi sadi)" },
  { from: 6, to: 12, strength: 25, note: "quarter (pachchis fi sadi)" },
];

// ---------------------------------------------------------------------------
// Planet in house: effect and remedies (upay), applied when the planet is afflicted

type Entry = { effect: string; remedies: string[] };
const e = (effect: string, ...remedies: string[]): Entry => ({ effect, remedies });

export const PLANET_IN_HOUSE: Record<string, Record<number, Entry>> = {
  Sun: {
    1: e("Pakka ghar: the native is self-made, religious-minded and favoured by the government; when afflicted, the father's support and married life suffer.",
      "Install a hand pump or water source in the ancestral house", "Avoid intimacy with the spouse during daytime", "One of the couple should give up eating jaggery (gur)"),
    2: e("Self-reliant and skilled, earns well through their own effort; when afflicted, disputes over money, property or the wife's family arise.",
      "Donate coconut, mustard oil and almonds at a religious place", "Avoid accepting charity, especially rice, silver and milk"),
    3: e("Courageous and intelligent with the support of brothers and good wealth; when afflicted, losses through theft or the native's own rashness.",
      "Serve the mother and take her blessings", "Keep good conduct and avoid deceit", "Distribute rice or milk to others"),
    4: e("Gives inheritance and comfort, and the native helps others; when afflicted (especially with Saturn in 10), eyesight and the father's fortune suffer.",
      "Feed the needy", "Avoid trading in iron and wood"),
    5: e("Good for children, intellect and government favour; when afflicted, troubles concern the children and the native's own reputation.",
      "Keep the kitchen in the eastern part of the house", "Avoid alcohol and non-vegetarian food", "Do not delay having children"),
    6: e("Fortunate, wins over rivals and gains from the government; when afflicted, the health of the son and of the maternal family suffers.",
      "Keep Ganga jal in the house", "Feed wheat or jaggery to monkeys", "Do not build an underground furnace (bhatti) in the house"),
    7: e("Gives position through the government and a partner of standing; when afflicted, married life, health and the government trouble the native.",
      "Put a small portion of food into the kitchen fire before eating", "Put out the kitchen fire with a little milk", "Serve a black or hornless cow", "Eat something sweet and drink water before starting any work"),
    8: e("Long life and steady government support; when afflicted, there are hasty decisions and a weak constitution.",
      "Flow copper coins in running water", "Avoid living in a south-facing house", "Do not accept white clothes as gifts"),
    9: e("Fortunate, kind and devoted to family and religion; when afflicted, the native turns arrogant and fortune sours.",
      "Do not accept silver articles as gifts; give silver in charity instead", "Use ancestral brass utensils", "Control anger"),
    10: e("Brings government service, authority and good health; when afflicted, the father's health and the native's standing suffer.",
      "Avoid wearing black and blue clothes", "Flow a copper coin in a river for 43 days", "Avoid alcohol and non-vegetarian food"),
    11: e("Wealthy, long-lived, and a vegetarian disposition brings luck; when afflicted, the native suffers through bad habits and haughtiness.",
      "Avoid meat and alcohol", "Keep a radish near the pillow at night and offer it at a temple in the morning"),
    12: e("Good income and sound sleep; when afflicted, there is depression, loss through the government and restless nights.",
      "Keep an open courtyard in the house", "Keep a hand grinder (chakki) in the house", "Be truthful and religious-minded"),
  },
  Moon: {
    1: e("Kind and soft-hearted, carrying the mother's qualities; when afflicted, the native is moody and the mother's health suffers.",
      "Use silver vessels for drinking water or milk", "Offer water to a banyan tree", "Avoid wearing green"),
    2: e("Wealth, inheritance and a good education, and the mother's blessing protects; when afflicted, family wealth wavers.",
      "Respect the mother and take her blessings", "Keep silver articles received from the mother", "Offer milk or rice at a temple"),
    3: e("Long life, good earnings and an interest in learning; when afflicted, money is lost and siblings drift away.",
      "Donate articles of the Sun and the Moon (wheat, jaggery, rice, milk) at family occasions such as a daughter's birth", "Worship Goddess Durga and feed young girls (kanya puja)"),
    4: e("Pakka ghar: wealth, a loving mother and peace of mind; when afflicted, mental restlessness follows.",
      "Never sell milk for profit", "Respect the mother and touch her feet", "Keep a vessel of water by the bed at night and pour it on a plant in the morning"),
    5: e("Intelligent, just and well regarded; when afflicted, greed or selfishness harms the children and the native's fortune.",
      "Speak the truth and avoid greed", "Serve the public without selfishness", "Keep a silver article"),
    6: e("Helpful to others and a good healer, though the mother's health needs care; when afflicted, mental worry and health trouble follow.",
      "Donate articles of the Sun, Mars and Jupiter (wheat, jaggery, red lentils, turmeric) at a temple", "Serve the parents, especially the mother"),
    7: e("Good for education, wealth and a harmonious marriage; when afflicted, there is friction between the mother and the spouse.",
      "Do not sell milk or water for profit", "Keep the mother happy", "Keep a silver article in the house"),
    8: e("Long life but emotional ups and downs; when afflicted, there is worry over the mother and over the family's wealth.",
      "Bring water from a well near a cremation ground and keep it at home", "Perform shraddh for the ancestors", "Take the blessings of elders by touching their feet"),
    9: e("Religious, fortunate and fond of travel to sacred places; when afflicted, fortune fluctuates.",
      "Visit religious places", "Feed ants with sugar or flour", "Keep a silver article in the house"),
    10: e("Long life, career growth and a cool temperament; when afflicted, the mother suffers and the native's mind is disturbed.",
      "Avoid drinking milk at night", "Keep rainwater or river water in a container at home", "Avoid alcohol and non-vegetarian food"),
    11: e("Gains and a long life, with support from the mother; when afflicted, the native's earnings fluctuate.",
      "Offer milk at a Bhairav temple", "Respect the mother and maternal relatives"),
    12: e("Peace of mind through spirituality, but heavy expenses; when afflicted, the native is restless and sleepless.",
      "Drink water or milk from a silver glass", "Wear silver"),
  },
  Mars: {
    1: e("Brave, truthful and a leader; when afflicted, the native is quarrelsome and blood-related ailments follow.",
      "Avoid accepting free things or charity", "Speak the truth", "Flow sugar sweets (batashe) in running water"),
    2: e("Gains through brothers and in-laws, with a good income; when afflicted, family disputes arise over money.",
      "Respect the elder brother and sister-in-law", "Donate red lentils (masoor dal)"),
    3: e("Pakka ghar: courageous and supported by siblings; when afflicted, the native turns arrogant and quarrels with brothers.",
      "Be soft-spoken and avoid arrogance", "Wear a silver ring on the left hand", "Respect elder brothers"),
    4: e("Hot-tempered at home, which disturbs domestic peace; when afflicted, losses through fire and the mother's health suffer.",
      "Offer milk at the roots of a banyan tree and apply the wet soil as a tilak", "Flow sugar sweets (batashe) in running water", "Keep a silver article"),
    5: e("Intelligent and courageous, with prospering children; when afflicted, the children and the native's character suffer.",
      "Keep a vessel of water by the bed at night and pour it on a plant in the morning", "Plant a neem tree", "Keep good moral character"),
    6: e("Victory over enemies and a good career; when afflicted, there is anger and trouble from rivals and the maternal family.",
      "Distribute salt instead of sweets on a son's birth", "Worship Lord Ganesha", "Respect brothers"),
    7: e("Gives wealth and property and helps the family; when afflicted, married life and the in-laws suffer.",
      "Keep a solid piece of silver", "Always give sweets to sisters, daughters and aunts", "Avoid lying"),
    8: e("Pakka ghar, but troubled here (manda): health, accidents and brothers need care.",
      "Take the blessings of widows", "Wear a silver chain", "Flow sweets (rewri or batashe) in running water"),
    9: e("Fortunate, with the support of elder brothers and the father; when afflicted, siblings fall out.",
      "Respect the elder brother and his wife (bhabhi)", "Feed sweet rice to the needy"),
    10: e("Rises to high position with property and wealth; when afflicted, ancestral property and the native's status suffer.",
      "Do not sell ancestral property", "Do not let milk boil over", "Serve one-eyed or childless persons"),
    11: e("Gains through courage, property and brothers; when afflicted, money is lost through rash dealings.",
      "Keep honey or vermilion (sindoor) in the house", "Do not sell ancestral property"),
    12: e("Wealth and comfort after hard work; when afflicted, expenses and anger rise.",
      "Take some honey or sweets in the morning", "Worship Lord Hanuman", "Distribute sweets (batashe) on Tuesdays"),
  },
  Mercury: {
    1: e("Witty, clever and good at business; when afflicted, the native is fickle and loses through speech.",
      "Avoid meat, eggs and alcohol", "Avoid wearing green"),
    2: e("Good speech, intelligence and wealth; when afflicted, losses come through relatives on the in-laws' side.",
      "Avoid meat and eggs", "Keep relations with sisters-in-law and daughters respectful", "Nose-piercing (a traditional Lal Kitab Mercury remedy)"),
    3: e("A good communicator who prospers through travel and siblings; when afflicted, siblings and debts cause trouble.",
      "Feed birds", "Clean the teeth with alum (phitkari)", "Nose-piercing (a traditional Lal Kitab Mercury remedy)"),
    4: e("Lucky in business, education and property; when afflicted, the mother's family and the native's peace of mind suffer.",
      "Wear a silver chain", "Apply a saffron tilak", "Feed birds"),
    5: e("Intelligent, learned and fortunate in children; when afflicted, the children's progress and the native's reputation suffer.",
      "Wear a copper coin in a white thread", "Serve cows", "Keep good moral character"),
    6: e("Exalted here: skilled in trade, writing and business; when afflicted, the native suffers from nerves and quarrels with relatives.",
      "Bury a glass bottle filled with Ganga jal in agricultural land", "Wear a silver ring on the left hand"),
    7: e("Pakka ghar: good for business partnerships, a clever spouse and wealth; when afflicted, partnerships and speculation fail.",
      "Avoid speculation and gambling", "Respect sisters, daughters and aunts"),
    8: e("Long life but nervous or skin troubles; when afflicted, there is loss through bad company and debts.",
      "Nose-piercing (a traditional Lal Kitab Mercury remedy)", "Bury an earthen pot filled with honey in a deserted place"),
    9: e("Learned and religious, gaining through knowledge; when afflicted, bad advice and false holy men mislead the native.",
      "Avoid wearing green", "Do not accept amulets from sadhus or fakirs", "Nose-piercing (a traditional Lal Kitab Mercury remedy)"),
    10: e("Good in business and accounts, with a sharp intellect; when afflicted, the native loses through bad habits and sharp dealings.",
      "Avoid alcohol, eggs and meat", "Offer rice and milk at a religious place"),
    11: e("Gains through intellect, trade and friends; when afflicted, deceit by friends and unstable earnings follow.",
      "Wear a copper coin in a white thread", "Avoid wearing green"),
    12: e("Heavy expenses, and the mind wanders; when afflicted, sleeplessness and loss through unwise decisions follow.",
      "Wear a steel ring", "Flow an empty earthen pot in a river", "Care for sisters and daughters"),
  },
  Jupiter: {
    1: e("Learned, respected, healthy and wealthy; when afflicted, the father's health and the native's reputation suffer.",
      "Feed cows", "Offer water to a peepal tree", "Respect elders and teachers"),
    2: e("Pakka ghar: wealth, family happiness and good speech; when afflicted, family wealth dwindles.",
      "Avoid accepting gifts in charity", "Apply a saffron or turmeric tilak", "Keep good relations with the in-laws"),
    3: e("Learned, long-lived and helped by brothers; when afflicted, flatterers and false friends cause loss.",
      "Worship Goddess Durga and feed young girls", "Respect elders and avoid flattery"),
    4: e("Exalted here: property, vehicles and comforts; when afflicted, the native loses ancestral comfort.",
      "Do not build a temple inside the house", "Serve elders", "Offer milk at a temple"),
    5: e("Pakka ghar: learned, fortunate and blessed with children; when afflicted, the children's welfare and the native's honour suffer.",
      "Do not accept donations or gifts in charity", "Serve priests and sadhus"),
    6: e("Comfort and a religious disposition; when afflicted, debts, disputes and the father's health suffer.",
      "Donate Jupiter's articles (turmeric, chana dal, saffron) at a temple", "Feed cows"),
    7: e("A learned spouse, gain through partnerships and religious leanings; when afflicted, married life and the father's support suffer.",
      "Respect the father and religious teachers", "Serve cows"),
    8: e("Long life and protection in crises; when afflicted, family problems and health issues arise.",
      "Offer water to a peepal tree", "Offer ghee, potatoes and camphor at a temple"),
    9: e("Pakka ghar: very fortunate, religious, wealthy and respected; when afflicted, fortune declines through neglect of dharma.",
      "Flow rice or almonds in a river", "Visit a temple daily", "Avoid alcohol and meat"),
    10: e("Debilitated here: success comes slowly and through hard work; when afflicted, there is loss of valuables and of status.",
      "Apply a saffron tilak", "Clean the nose before beginning any important work", "Do not keep idols for worship in the house"),
    11: e("Steady gains, with support from the father and elders; when afflicted, gains depend on the father's welfare.",
      "Respect the father and elder brother", "Keep a gold or copper article on the person"),
    12: e("Pakka ghar: spiritual, charitable and restful; when afflicted, heavy expenses and false accusations follow.",
      "Never give false evidence", "Serve sadhus and the needy", "Offer water to a peepal tree"),
  },
  Venus: {
    1: e("Attractive and artistic, enjoying comforts; when afflicted, the native is drawn to indulgence and married life suffers.",
      "Feed or serve cows", "Keep good moral character and respect the spouse"),
    2: e("Wealth, a comfortable family life and a refined taste; when afflicted, the native loses through indulgence.",
      "Donate a cow or feed cows", "Keep good conduct and respect the wife"),
    3: e("Charming, with a loving spouse and the support of women; when afflicted, temptation harms the household.",
      "Respect the wife", "Keep away from extra-marital relations"),
    4: e("Comforts, vehicles and a beautiful home; when afflicted, discord arises between the mother and the spouse.",
      "Feed cows", "Keep the wife happy and respected"),
    5: e("Artistic, romantic and blessed with children; when afflicted, indulgence harms the children and the native's reputation.",
      "Keep good moral conduct", "Serve cows and the mother"),
    6: e("Debilitated here: married life needs care; when afflicted, the spouse's health and domestic peace suffer.",
      "The wife may wear a gold pin in tied hair", "Do not let the wife go barefoot"),
    7: e("Pakka ghar: a devoted spouse, comforts and gain through partnership; when afflicted, married life suffers.",
      "Donate or feed cows", "Keep good moral conduct"),
    8: e("Long life, but married life and wealth fluctuate; when afflicted, the native lives through harsh speech and the spouse's ill health.",
      "Do not accept anything free from others", "Flow blue flowers in a drain for 10 days"),
    9: e("Fortunate, with gains through women and the arts; when afflicted, fortune wavers.",
      "Bury silver or honey under the foundation of the house", "Keep good conduct"),
    10: e("Career in the arts, luxury or women's goods, with comfort; when afflicted, character and status suffer.",
      "Avoid alcohol and non-vegetarian food", "Keep away from extra-marital relations"),
    11: e("Gains through the spouse and the arts; when afflicted, gains slip away through indulgence.",
      "Respect the wife", "Keep a silver article in the house"),
    12: e("Exalted here: a devoted spouse, comfort and good sleep; when afflicted, the spouse's health and expenses suffer.",
      "Treat the wife with respect", "Donate or feed cows"),
  },
  Saturn: {
    1: e("Hard-working but delayed in results (Saturn is weak here); when afflicted, poverty and ill health follow.",
      "Bury surma (antimony) in the earth", "Feed monkeys", "Avoid alcohol and meat"),
    2: e("Wise, just and long-lived; when afflicted, family wealth and harmony suffer.",
      "Serve a black cow", "Offer mustard oil at a Shani temple"),
    3: e("Wealthy, healthy and a good business sense; when afflicted, there is trouble from relatives and with the eyes.",
      "Feed three dogs", "Keep a dark room at the far end of the house"),
    4: e("Wealth through property and inheritance; when afflicted, the mother suffers and domestic peace is disturbed.",
      "Pour milk into a well", "Avoid alcohol", "Feed fish"),
    5: e("Intelligent but the children may face hardship; when afflicted, delay concerns the children and the house.",
      "Distribute almonds at a temple and keep some at home", "Avoid constructing a house before age 48"),
    6: e("Victory over enemies and gain through service; when afflicted, debts and disputes arise.",
      "Feed a black dog", "Flow coconut or almonds in running water", "Avoid buying leather or iron goods on Saturdays"),
    7: e("Gain through business, iron and machinery; when afflicted, married life and health suffer.",
      "Bury a flute filled with sugar in a deserted place", "Serve a black cow", "Avoid alcohol and meat"),
    8: e("Pakka ghar: long life; when afflicted, health, accidents and the family's welfare need care.",
      "Keep a square piece of silver", "Avoid alcohol and non-vegetarian food"),
    9: e("Fortunate, with comforts and long-lasting property; when afflicted, delay comes to fortune and the father's welfare.",
      "Flow rice in running water", "Avoid alcohol and meat and keep good conduct"),
    10: e("Pakka ghar: high position, wealth and lasting success through hard work; when afflicted, the native falls through dishonesty.",
      "Avoid alcohol, meat and eggs", "Serve blind or disabled persons"),
    11: e("Long life and steady gains (Saturn is strong here); when afflicted, gains come through dishonest means and do not last.",
      "Pour a little mustard oil on the ground before sunrise for 43 days", "Avoid alcohol and meat"),
    12: e("Wealth, a peaceful home and good sleep; when afflicted, losses come through lies and bad conduct.",
      "Tie 12 almonds in a black cloth, put them in an iron pot and keep it in a dark room", "Avoid lies and adultery"),
  },
  Rahu: {
    1: e("Bold and influential, rising through politics or authority; when afflicted, there is confusion, health worries and trouble from the government.",
      "Wear silver around the neck", "Keep good relations with the in-laws", "Avoid alcohol"),
    2: e("Wealth and a royal temperament if the mother is respected; when afflicted, family wealth suffers.",
      "Keep a solid silver ball in the pocket", "Keep good relations with the mother"),
    3: e("Courageous, long-lived and victorious over enemies; when afflicted, siblings and friends cause loss.",
      "Do not keep ivory articles in the house", "Respect brothers and sisters"),
    4: e("Wealthy and intelligent if the mother is served; when afflicted, the mother's health and domestic peace suffer.",
      "Wear silver", "Flow 400 g of coriander or almonds in running water"),
    5: e("Intelligent and wealthy, but children may be delayed; when afflicted, there is worry over the children.",
      "Keep a silver elephant in the house", "Avoid alcohol and meat"),
    6: e("Victory over enemies and good health (Rahu is good here); when afflicted, siblings and expenses cause trouble.",
      "Keep a black dog", "Keep good relations with siblings"),
    7: e("Wealthy, but married life needs attention; when afflicted, trouble comes through the spouse and partners.",
      "Flow a coconut in running water", "Keep good relations with the in-laws"),
    8: e("Long life but sudden ups and downs; when afflicted, losses and health crises follow.",
      "Flow eight pieces of coal in running water", "Keep a square piece of silver"),
    9: e("Fortunate if the in-laws and elders are respected; when afflicted, fortune and the children suffer.",
      "Keep good relations with the in-laws", "Apply a saffron tilak", "Keep a dog"),
    10: e("Rises in career, often through cleverness or politics; when afflicted, the native's status and the father's welfare suffer.",
      "Keep the head covered (a cap or turban)", "Offer jaggery at a temple"),
    11: e("Gains, wealth and support from the father; when afflicted, the father's health and the native's earnings suffer.",
      "Wear iron or silver", "Serve the father"),
    12: e("Spiritual expenses and travel; when afflicted, sleeplessness, false allegations and heavy expenses follow.",
      "Take meals in the kitchen", "Keep fennel (saunf) or sugar near the pillow at night"),
  },
  Ketu: {
    1: e("Hard-working and gaining through travel; when afflicted, there are headaches, and the spouse and children need care.",
      "Feed jaggery to monkeys", "Apply a saffron tilak", "Wear silver"),
    2: e("Earnings through travel and an honourable family life; when afflicted, family wealth and harmony fluctuate.",
      "Apply a turmeric or saffron tilak", "Visit a temple regularly"),
    3: e("Courageous, with the support of children and siblings; when afflicted, siblings fall out and travel brings loss.",
      "Apply a saffron tilak", "Wear gold"),
    4: e("Good for the mother and for children when the mother is respected; when afflicted, the mother's health and domestic peace suffer.",
      "Wear silver", "Respect the mother"),
    5: e("Blessed with children and good fortune, though later in life; when afflicted, worry over the children follows.",
      "Donate milk and sugar", "Apply a turmeric tilak"),
    6: e("Pakka ghar: good for maternal relatives and victory over rivals; when afflicted, the native has trouble with legs or joints and with the maternal family.",
      "Wear a gold ring on the left hand", "Keep a dog"),
    7: e("Wealth and gain through children and travel; when afflicted, the spouse suffers and the native breaks promises.",
      "Keep promises and avoid boastful speech", "Keep a dog"),
    8: e("Long life, but health and the children need care; when afflicted, sudden problems arise.",
      "Keep a dog", "Donate a black-and-white blanket at a temple", "Wear gold in the ears"),
    9: e("Fortunate, obedient and prospering through travel; when afflicted, fortune and the father's welfare fluctuate.",
      "Keep a dog", "Wear gold in the ears", "Respect elders"),
    10: e("Gains through work and travel, if conduct is good; when afflicted, the native's career and the father's health suffer.",
      "Keep a dog", "Keep honey in a silver pot in the house"),
    11: e("Steady gains and prosperity; when afflicted, worry and the mother's health suffer.",
      "Keep a black dog", "Respect elders"),
    12: e("Spiritual, wealthy and sleeps well (Ketu is good here); when afflicted, expenses and worry over the children follow.",
      "Keep a dog", "Worship Lord Ganesha"),
  },
};

// ---------------------------------------------------------------------------
// Rin (ancestral debts): a placement shows a debt carried in the family. Lal Kitab's remedy is collective: every blood
// relative contributes equally, and the whole remedy is done on a single day.

export interface Rin {
  name: string;
  meaning: string;
  /** Planets any one of which, placed in any of `houses`, indicates the debt. */
  planets: string[];
  houses: number[];
  remedy: string;
}

// The conditions follow the most widely published table (e.g. InstaAstro, AstroSage).
// Variant: Astrobix states the debts through the significator instead. Its Pitri Rin requires that Jupiter be out of
// its pakka ghar while enemies of Jupiter hold those houses, and its Matri Rin is also caused by the Moon outside the 2nd
// and 4th houses. Its Ajanma Rin adds that Rahu must not be in the 3rd, 6th or 12th.
export const RINAS: Rin[] = [
  { name: "Pitri Rin", meaning: "Debt of the ancestors / father", planets: ["Venus", "Mercury", "Rahu"], houses: [2, 5, 9, 12],
    remedy: "Collect an equal sum from every blood relative and donate it to a temple or religious cause on the same day; serve a peepal tree." },
  { name: "Swayam Rin", meaning: "Self debt", planets: ["Venus", "Saturn", "Rahu", "Ketu"], houses: [5],
    remedy: "Perform a havan (yagya) with money contributed equally by all family members." },
  { name: "Matri Rin", meaning: "Debt of the mother", planets: ["Ketu"], houses: [4],
    remedy: "Collect silver (or silver coins) from every family member and flow it in a river on the same day." },
  { name: "Stri Rin", meaning: "Debt of the wife / women", planets: ["Sun", "Moon", "Rahu"], houses: [2, 7],
    remedy: "With money collected from every family member, feed 100 healthy cows on a single day." },
  { name: "Bhai-Bandhu Rin", meaning: "Debt of relatives / brothers", planets: ["Mercury", "Ketu"], houses: [1, 8],
    remedy: "Collect money from every family member and give it on one day towards medicine or treatment for the needy." },
  { name: "Behen-Putri Rin", meaning: "Debt of sister / daughter", planets: ["Moon"], houses: [3, 6],
    remedy: "Collect yellow cowries from every family member, burn them to ash and flow the ash in running water the same day." },
  // Variant: some books give feeding 100 fish instead of labourers.
  { name: "Nirdayi Rin", meaning: "Debt of cruelty", planets: ["Sun", "Moon", "Mars"], houses: [10, 11],
    remedy: "With money collected from every family member, feed 100 labourers on a single day." },
  { name: "Ajanma Rin", meaning: "Debt of the unborn", planets: ["Sun", "Venus", "Mars"], houses: [12],
    remedy: "Take one coconut from each family member and flow them all in a river on the same day." },
  { name: "Daivik (Prakriti) Rin", meaning: "Divine / natural debt (cruelty to animals)", planets: ["Moon", "Mars"], houses: [6],
    remedy: "With money collected from every family member, feed 100 dogs (or stray animals) on a single day." },
];

// ---------------------------------------------------------------------------
// How remedies are performed (general rules repeated throughout Lal Kitab literature)

export const LK_GENERAL_RULES = [
  "Perform remedies between sunrise and sunset; no remedy is done at night.",
  "Do one remedy at a time, starting with the planet that troubles you most.",
  "Continue a remedy for 40 to 43 days without a break; if a day is missed, start the count again.",
  "Remedies are done by the native themselves, or by a blood relative only with the native's consent; never on behalf of someone without their knowledge.",
  "Debt (rin) remedies are collective: every blood relative contributes equally and the remedy is completed on a single day.",
  "Items flowed in water go into clean running water (a river or canal), never into a well or stagnant pond, unless the remedy says otherwise.",
  "Keep good conduct throughout: avoid alcohol, non-vegetarian food, lies and adultery, which spoil Saturn, Rahu and Ketu.",
  "Do not remedy a planet that is well placed; Lal Kitab remedies are meant for an afflicted planet.",
  "Remedies support effort and good conduct; they are not a substitute for medical, legal or financial advice.",
];

// ---------------------------------------------------------------------------
// The Lal Kitab reading

export interface LkPlacement { planet: string; house: number; pakka: boolean; effect: string; remedies: string[] }
export interface LalKitabReading {
  chart: { house: number; rashi: string; planets: string[] }[];
  placements: LkPlacement[];
  rinas: { name: string; reason: string; remedy: string }[];
  sleepingHouses: number[];
  sleepingPlanets: string[];
  generalRules: string[];
}

/** Houses aspected from `house` by the Lal Kitab aspect table. */
export function aspectedFrom(house: number): number[] {
  return LK_ASPECTS.filter((a) => a.from === house).map((a) => a.to);
}

export function lalKitab(k: Kundli): LalKitabReading {
  const grahas = k.grahas.filter((g) => PAKKA_GHAR[g.name]);
  const occupants = (h: number) => grahas.filter((g) => g.house === h).map((g) => g.name);
  const occupied = (h: number) => occupants(h).length > 0;

  const chart = Array.from({ length: 12 }, (_, i) => ({ house: i + 1, rashi: RASHIS[i], planets: occupants(i + 1) }));

  const placements: LkPlacement[] = grahas.map((g) => {
    const entry = PLANET_IN_HOUSE[g.name][g.house];
    return { planet: g.name, house: g.house, pakka: PAKKA_GHAR[g.name].includes(g.house), effect: entry.effect, remedies: entry.remedies };
  });

  const rinas = RINAS.flatMap((r) => {
    const hits = grahas.filter((g) => r.planets.includes(g.name) && r.houses.includes(g.house));
    if (!hits.length) return [];
    const reason = hits.map((g) => `${g.name} in house ${g.house}`).join(", ");
    return [{ name: `${r.name} (${r.meaning})`, reason, remedy: r.remedy }];
  });

  // Soya ghar (sleeping house): a house that no planet occupies and that no occupied house aspects under the Lal Kitab
  // aspect table. It stays dormant, and its matters wait for a planet to occupy or aspect it, by transit or by remedy.
  const sleepingHouses = chart
    .filter(({ house }) => !occupied(house) && !LK_ASPECTS.some((a) => a.to === house && occupied(a.from)))
    .map(({ house }) => house);

  // Soya grah (sleeping planet): a planet that casts its aspect on no other planet, because every house its own house
  // aspects is empty. A planet in a house that casts no aspect (7, 9, 10, 11, 12) therefore sleeps too. The exception is
  // a planet in its pakka ghar, which is always awake, though its effect stays confined to that house. Example: Venus
  // in the 4th sleeps when the 10th is empty.
  const sleepingPlanets = grahas
    .filter((g) => !PAKKA_GHAR[g.name].includes(g.house) && !aspectedFrom(g.house).some(occupied))
    .map((g) => g.name);

  return { chart, placements, rinas, sleepingHouses, sleepingPlanets, generalRules: [...LK_GENERAL_RULES] };
}
