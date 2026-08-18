// Content status: DRAFT — pending review by a qualified source before being
// treated as authoritative (see reviewStatus below, surfaced as a banner in the UI).
// Where Sunni schools of thought differ in practice, both are noted rather than
// silently picking one.
export const janazahPrayerGuide = {
  slug: 'janazah-prayer',
  reviewStatus: 'pending_review',
  title: {
    en: 'How to Pray Janazah',
    ta: 'ஜனாஸா தொழுவது எப்படி',
  },
  intro: {
    en: 'Salat al-Janazah (the funeral prayer) is a communal obligation (fard kifayah) — it has no ruku or sujud, and is offered standing, in four takbirs.',
    ta: 'ஜனாஸா தொழுகை (இறுதி தொழுகை) சமூகக் கடமையாகும் (ஃபர்ளு கிஃபாயா) — இதில் ருகூவோ, ஸஜ்தாவோ இல்லை; நான்கு தக்பீர்களுடன் நின்றபடி தொழப்படுகிறது.',
  },
  sections: [
    {
      heading: { en: 'Before the prayer', ta: 'தொழுகைக்கு முன்' },
      steps: [
        {
          label: { en: 'Standing position', ta: 'நிற்கும் இடம்' },
          meaning: {
            en: 'Rows are formed facing the qibla, with the janazah (bier) placed in front. The imam stands level with the chest of the deceased (or roughly the middle, for a woman, in most reported practice).',
            ta: 'கிப்லாவை நோக்கி வரிசைகள் அமைக்கப்படும்; ஜனாஸா முன்பக்கம் வைக்கப்படும். இமாம் இறந்தவரின் நெஞ்சு பகுதிக்கு நேராக நிற்பார் (பெண் இறந்தவர் எனில், பொதுவாகக் கூறப்படுவது போல் இடை பகுதிக்கு நேராக).',
          },
        },
        {
          label: { en: 'Niyyah (intention)', ta: 'நியாஹ் (எண்ணம்)' },
          meaning: {
            en: 'Made silently in the heart — no fixed wording is required.',
            ta: 'மனதிற்குள் அமைதியாகச் செய்யப்படுகிறது — குறிப்பிட்ட வார்த்தைகள் அவசியமில்லை.',
          },
        },
      ],
    },
    {
      heading: { en: '1st Takbir', ta: '1வது தக்பீர்' },
      steps: [
        {
          label: { en: 'Takbiratul Ihram', ta: 'தக்பீரதுல் இஹ்ராம்' },
          arabic: 'اللَّهُ أَكْبَرُ',
          transliteration: { en: 'Allahu Akbar', ta: 'அல்லாஹு அக்பர்' },
          meaning: { en: 'Allah is the Greatest.', ta: 'அல்லாஹ் மிகப் பெரியவன்.' },
        },
        {
          label: { en: 'Surah Al-Fatiha', ta: 'சூரா அல்-ஃபாத்திஹா' },
          arabic:
            'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ.',
          transliteration: {
            en: 'Bismillahir Rahmanir Rahim. Alhamdu lillahi rabbil alamin. Ar-Rahmanir Rahim. Maliki yawmid din. Iyyaka na’budu wa iyyaka nasta’in. Ihdinas siratal mustaqim. Siratal ladhina an’amta ‘alayhim ghayril maghdubi ‘alayhim wa lad dallin.',
            ta: 'பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம். அல்ஹம்து லில்லாஹி ரப்பில் ஆலமீன். அர்ரஹ்மானிர் ரஹீம். மாலிகி யவ்மித் தீன். இய்யாக நஅ்புது வ இய்யாக நஸ்தயீன். இஹ்தினஸ் ஸிராதல் முஸ்தகீம். ஸிராதல்லதீன அன்அம்த அலைஹிம் கைரில் மக்ளூபி அலைஹிம் வலள் ளாலீன்.',
          },
          meaning: {
            en: 'In the name of Allah, the Most Gracious, the Most Merciful. All praise is for Allah, Lord of all the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path — the path of those You have blessed, not of those who earned Your anger, nor of those who went astray.',
            ta: 'அளவற்ற அருளாளன், நிகரற்ற அன்புடையோன் அல்லாஹ்வின் திருப்பெயரால். எல்லாப் புகழும் அகிலங்களின் அதிபதியான அல்லாஹ்வுக்கே. அளவற்ற அருளாளன், நிகரற்ற அன்புடையோன். நியாயத் தீர்ப்பு நாளின் அதிபதி. உன்னையே நாங்கள் வணங்குகிறோம்; உன்னிடமே உதவி தேடுகிறோம். எங்களை நேரான வழியில் நடத்துவாயாக — நீ அருள் புரிந்தோரின் வழியில்; கோபத்திற்குள்ளானோர், வழிதவறியோரின் வழியில் அல்ல.',
          },
        },
      ],
    },
    {
      heading: { en: '2nd Takbir', ta: '2வது தக்பீர்' },
      steps: [
        {
          label: { en: 'Takbir', ta: 'தக்பீர்' },
          arabic: 'اللَّهُ أَكْبَرُ',
          transliteration: { en: 'Allahu Akbar', ta: 'அல்லாஹு அக்பர்' },
          meaning: { en: 'Allah is the Greatest.', ta: 'அல்லாஹ் மிகப் பெரியவன்.' },
        },
        {
          label: { en: 'Durood Ibrahim (salutations on the Prophet)', ta: 'தூரூத் இப்ராஹீம் (நபிக்கு ஸலவாத்)' },
          arabic:
            'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ.',
          transliteration: {
            en: 'Allahumma salli ‘ala Muhammadin wa ‘ala aali Muhammad, kama sallayta ‘ala Ibrahima wa ‘ala aali Ibrahim, innaka Hamidum Majid. Allahumma barik ‘ala Muhammadin wa ‘ala aali Muhammad, kama barakta ‘ala Ibrahima wa ‘ala aali Ibrahim, innaka Hamidum Majid.',
            ta: 'அல்லாஹும்ம ஸல்லி அலா முஹம்மதின் வ அலா ஆலி முஹம்மத், கமா ஸல்லைத அலா இப்ராஹீம வ அலா ஆலி இப்ராஹீம், இன்னக ஹமீதும் மஜீத். அல்லாஹும்ம பாரிக் அலா முஹம்மதின் வ அலா ஆலி முஹம்மத், கமா பாரக்த அலா இப்ராஹீம வ அலா ஆலி இப்ராஹீம், இன்னக ஹமீதும் மஜீத்.',
          },
          meaning: {
            en: 'O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim — You are Praiseworthy, Glorious. O Allah, grant favor to Muhammad and the family of Muhammad, as You granted favor to Ibrahim and the family of Ibrahim — You are Praiseworthy, Glorious.',
            ta: 'இறைவா, முஹம்மது மீதும் முஹம்மதின் குடும்பத்தார் மீதும் அருள் பொழிவாயாக, இப்ராஹீம் மீதும் அவரது குடும்பத்தார் மீதும் நீ அருள் பொழிந்தது போல் — நீ புகழுக்குரியவன், மகிமை மிக்கவன். இறைவா, முஹம்மது மீதும் அவரது குடும்பத்தார் மீதும் வளம் பொழிவாயாக, இப்ராஹீம் மீதும் அவரது குடும்பத்தார் மீதும் நீ வளம் பொழிந்தது போல் — நீ புகழுக்குரியவன், மகிமை மிக்கவன்.',
          },
        },
      ],
    },
    {
      heading: { en: '3rd Takbir', ta: '3வது தக்பீர்' },
      steps: [
        {
          label: { en: 'Takbir', ta: 'தக்பீர்' },
          arabic: 'اللَّهُ أَكْبَرُ',
          transliteration: { en: 'Allahu Akbar', ta: 'அல்லாஹு அக்பர்' },
          meaning: { en: 'Allah is the Greatest.', ta: 'அல்லாஹ் மிகப் பெரியவன்.' },
        },
        {
          label: { en: 'Dua for the deceased', ta: 'இறந்தவருக்கான துஆ' },
          arabic:
            'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الْأَبْيَضَ مِنَ الدَّنَسِ، وَأَبْدِلْهُ دَارًا خَيْرًا مِنْ دَارِهِ، وَأَهْلًا خَيْرًا مِنْ أَهْلِهِ، وَزَوْجًا خَيْرًا مِنْ زَوْجِهِ، وَأَدْخِلْهُ الْجَنَّةَ، وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ وَعَذَابِ النَّارِ',
          transliteration: {
            en: 'Allahummaghfir lahu warhamhu wa ‘aafihi wa’fu ‘anhu, wa akrim nuzulahu wa wassi’ mudkhalahu, waghsilhu bil ma’i wath thalji wal barad, wa naqqihi minal khataya kama naqqaytath thawbal abyada minad danas, wa abdilhu daran khayran min darihi, wa ahlan khayran min ahlihi, wa zawjan khayran min zawjihi, wa adkhilhul jannata, wa a’idhhu min ‘adhabil qabri wa ‘adhabin nar.',
            ta: 'அல்லாஹும்மக்ஃபிர் லஹு வர்ஹம்ஹு வ ஆஃபிஹி வஅ்ஃபு அன்ஹு, வ அக்ரிம் நுஸுலஹு வ வஸ்ஸிஃ முத்கலஹு, வக்ஸில்ஹு பில்மாயி வஸ்ஸல்ஜி வல்பரத், வ நக்கிஹி மினல் கதாயா கமா நக்கைத தவ்பல் அப்யள மினத் தனஸ், வ அப்தில்ஹு தாரன் கைரன் மின் தாரிஹி, வ அஹ்லன் கைரன் மின் அஹ்லிஹி, வ ஸவ்ஜன் கைரன் மின் ஸவ்ஜிஹி, வ அத்கில்ஹுல் ஜன்னத, வ அயித்ஹு மின் அதாபில் கப்ரி வ அதாபின் னார்.',
          },
          meaning: {
            en: 'O Allah, forgive him/her, have mercy on him/her, keep him/her safe and pardon him/her. Make his/her resting place generous, and grant him/her an expansive entrance. Cleanse him/her with water, snow, and hail, and purify him/her of sin as a white garment is purified of stain. Grant him/her a home better than his/her home, a family better than his/her family, and a companion better than his/her companion. Admit him/her into Paradise, and protect him/her from the punishment of the grave and the punishment of the Fire.',
            ta: 'இறைவா, இவரை மன்னிப்பாயாக, இவர் மீது கருணை காட்டுவாயாக, இவரைப் பாதுகாத்து மன்னிப்பளிப்பாயாக. இவரது தங்குமிடத்தை கண்ணியப்படுத்தி, இவரது நுழைவிடத்தை விசாலமாக்குவாயாக. நீரினாலும், பனியினாலும், ஆலங்கட்டியினாலும் இவரைத் தூய்மைப்படுத்துவாயாக; வெண்ணிற ஆடையிலிருந்து அழுக்கு நீக்கப்படுவது போல் இவரது பாவங்களிலிருந்து இவரைத் தூய்மைப்படுத்துவாயாக. இவரது வீட்டைவிட மேலான வீட்டையும், இவரது குடும்பத்தைவிட மேலான குடும்பத்தையும், இவரது துணையைவிட மேலான துணையையும் இவருக்கு மாற்றாகத் தருவாயாக. இவரைச் சொர்க்கத்தில் நுழையச் செய்வாயாக; மண்ணறை வேதனையிலிருந்தும் நரக வேதனையிலிருந்தும் இவரைப் பாதுகாப்பாயாக.',
          },
          note: {
            en: 'Traditionally recited with "lahu/lahā" (him/her) matching the deceased’s gender, or "lahum" for a group — adjust the pronoun accordingly. This is the well-known dua reported from the hadith of ‘Awf ibn Malik (Sahih Muslim); some communities use a shorter alternative dua instead.',
            ta: 'இறந்தவரின் பாலினத்திற்கேற்ப "லஹு/லஹா" (அவனுக்கு/அவளுக்கு) என மாற்றி ஓதப்படும்; பலருக்கு எனில் "லஹும்". இது அவ்ஃப் இப்னு மாலிக் அறிவித்த ஹதீஸில் (ஸஹீஹ் முஸ்லிம்) பதிவான நன்கறியப்பட்ட துஆ; சில சமூகங்களில் இதற்குப் பதிலாக குறுகிய துஆ ஓதப்படுகிறது.',
          },
        },
      ],
    },
    {
      heading: { en: '4th Takbir & Salam', ta: '4வது தக்பீர் & ஸலாம்' },
      steps: [
        {
          label: { en: 'Takbir', ta: 'தக்பீர்' },
          arabic: 'اللَّهُ أَكْبَرُ',
          transliteration: { en: 'Allahu Akbar', ta: 'அல்லாஹு அக்பர்' },
          meaning: { en: 'Allah is the Greatest.', ta: 'அல்லாஹ் மிகப் பெரியவன்.' },
        },
        {
          label: { en: 'General dua', ta: 'பொதுவான துஆ' },
          arabic:
            'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا، وَشَاهِدِنَا وَغَائِبِنَا، وَصَغِيرِنَا وَكَبِيرِنَا، وَذَكَرِنَا وَأُنْثَانَا. اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ، وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ. اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تُضِلَّنَا بَعْدَهُ.',
          transliteration: {
            en: 'Allahummaghfir li hayyina wa mayyitina, wa shahidina wa gha’ibina, wa saghirina wa kabirina, wa dhakarina wa unthana. Allahumma man ahyaytahu minna fa ahyihi ‘alal Islam, wa man tawaffaytahu minna fa tawaffahu ‘alal iman. Allahumma la tahrimna ajrahu wa la tudillana ba’dahu.',
            ta: 'அல்லாஹும்மக்ஃபிர் லிஹய்யினா வ மய்யிதினா, வ ஷாஹிதினா வ காயிபினா, வ ஸகீரினா வ கபீரினா, வ தகரினா வ உன்தானா. அல்லாஹும்ம மன் அஹ்யைத்தஹு மின்னா ஃபஅஹ்யிஹி அலல் இஸ்லாம், வ மன் தவஃப்பைத்தஹு மின்னா ஃபதவஃபஹு அலல் ஈமான். அல்லாஹும்ம லா தஹ்ரிம்னா அஜ்ரஹு வலா துளில்லனா பஅ்தஹு.',
          },
          meaning: {
            en: 'O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females. O Allah, whomever You keep alive among us, keep him alive upon Islam, and whomever You cause to die among us, cause him to die upon faith. O Allah, do not deprive us of his reward, and do not let us go astray after him.',
            ta: 'இறைவா, எங்களில் உயிருள்ளோரையும் இறந்தோரையும், முன்னிருப்போரையும் வெளியிலுள்ளோரையும், எங்கள் சிறியோரையும் பெரியோரையும், எங்கள் ஆண்களையும் பெண்களையும் மன்னிப்பாயாக. இறைவா, எங்களில் யாரை நீ உயிருடன் வைத்திருக்கிறாயோ அவரை இஸ்லாத்தின் மீது உயிருடன் வைப்பாயாக; எங்களில் யாரை நீ மரணிக்கச் செய்கிறாயோ அவரை ஈமானின் மீது மரணிக்கச் செய்வாயாக. இறைவா, அவரது நற்கூலியை எங்களுக்கு இழக்கச் செய்யாதே; அவருக்குப் பின் எங்களை வழிதவறச் செய்யாதே.',
          },
        },
        {
          label: { en: 'Taslim (Salam)', ta: 'தஸ்லீம் (ஸலாம்)' },
          arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
          transliteration: { en: 'Assalamu ‘alaykum wa rahmatullah', ta: 'அஸ்ஸலாமு அலைக்கும் வரஹ்மத்துல்லாஹ்' },
          meaning: { en: 'Peace and the mercy of Allah be upon you.', ta: 'உங்கள் மீது சாந்தியும் அல்லாஹ்வின் அருளும் உண்டாகட்டும்.' },
        },
      ],
    },
  ],
}
