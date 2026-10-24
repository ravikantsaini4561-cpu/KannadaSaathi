// verified stays false until a Kannada speaker reviews the row (see README).
const p = (category, english, hindi, kannada, transliteration, tags = '') => ({
  category,
  english,
  hindi,
  kannada,
  transliteration,
  tags: tags.split(' ').filter(Boolean),
  verified: false
});

export const categories = [
  { id: 'college', name: 'College', blurb: 'Classes, library, exams, office', icon: '🎓' },
  { id: 'food', name: 'Hostel & Food', blurb: 'Canteen, tea, hostel, shops', icon: '🍛' },
  { id: 'transport', name: 'Transport', blurb: 'Bus, auto, metro, directions', icon: '🚌' },
  { id: 'healthcare', name: 'Healthcare', blurb: 'Clinic, pharmacy, emergencies', icon: '🏥' },
  { id: 'village', name: 'Village', blurb: 'Talk to villagers who speak only Kannada', icon: '🌾' },
  { id: 'beach', name: 'Beach', blurb: 'Safety, boats, restrooms', icon: '🏖️' },
  { id: 'hills', name: 'Hill Station', blurb: 'Viewpoints, treks, weather', icon: '⛰️' },
  { id: 'mall', name: 'Mall', blurb: 'Shopping, sizes, payments', icon: '🛍️' },
  { id: 'festival', name: 'Festival', blurb: 'Greetings, temple, procession', icon: '🪔' },
  { id: 'work', name: 'Work & Office', blurb: 'Workplace, meetings, tasks, communication', icon: '💼' },
  { id: 'emergency', name: 'Emergency', blurb: 'Urgent help, safety, lost items, contacts', icon: '🆘' }
];

export default [
  // College
  p('college', 'Where is the library?', 'Library kahan hai?', 'ಗ್ರಂಥಾಲಯ ಎಲ್ಲಿದೆ?', 'Granthaalaya ellide?', 'library books study'),
  p('college', 'Where is the classroom?', 'Classroom kahan hai?', 'ತರಗತಿ ಕೊಠಡಿ ಎಲ್ಲಿದೆ?', 'Taragati kotadi ellide?', 'class room lecture'),
  p('college', 'What time is the class?', 'Class kitne baje hai?', 'ತರಗತಿ ಎಷ್ಟು ಗಂಟೆಗೆ?', 'Taragati eshtu gantege?', 'class time timetable'),
  p('college', 'Where is the exam hall?', 'Exam hall kahan hai?', 'ಪರೀಕ್ಷಾ ಕೊಠಡಿ ಎಲ್ಲಿದೆ?', 'Pareekshaa kotadi ellide?', 'exam test hall'),
  p('college', 'Where is the college office?', 'College office kahan hai?', 'ಕಾಲೇಜು ಕಚೇರಿ ಎಲ್ಲಿದೆ?', 'College kacheri ellide?', 'office admin fees'),
  p('college', 'Can you help me?', 'Kya aap meri madad karenge?', 'ನನಗೆ ಸಹಾಯ ಮಾಡುತ್ತೀರಾ?', 'Nanage sahaaya maaduttheeraa?', 'help'),
  p('college', 'Please speak slowly.', 'Kripya dheere boliye.', 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.', 'Dayavittu nidhaanavaagi maatanaadi.', 'slow repeat understand'),
  p('college', "I don't know Kannada.", 'Mujhe Kannada nahi aati.', 'ನನಗೆ ಕನ್ನಡ ಗೊತ್ತಿಲ್ಲ.', 'Nanage Kannada gottilla.', 'language understand'),

  // Food and hostel
  p('food', 'Where is the canteen?', 'Canteen kahan hai?', 'ಕ್ಯಾಂಟೀನ್ ಎಲ್ಲಿದೆ?', 'Canteen ellide?', 'canteen mess lunch hungry eat food'),
  p('food', 'How much is this?', 'Yeh kitne ka hai?', 'ಇದು ಎಷ್ಟು?', 'Idu eshtu?', 'price cost shop'),
  p('food', 'One coffee, please.', 'Ek coffee dijiye.', 'ಒಂದು ಕಾಫಿ ಕೊಡಿ.', 'Ondu coffee kodi.', 'coffee tea order'),
  p('food', 'Water, please.', 'Kripya paani dijiye.', 'ದಯವಿಟ್ಟು ನೀರು ಕೊಡಿ.', 'Dayavittu neeru kodi.', 'water drink'),
  p('food', 'Is it spicy?', 'Kya yeh teekha hai?', 'ಇದು ಖಾರವಾಗಿದೆಯೇ?', 'Idu khaaravaagideye?', 'spicy food'),
  p('food', 'Where is the hostel?', 'Hostel kahan hai?', 'ಹಾಸ್ಟೆಲ್ ಎಲ್ಲಿದೆ?', 'Hostel ellide?', 'hostel room stay'),
  p('food', 'Thank you.', 'Dhanyavaad.', 'ಧನ್ಯವಾದಗಳು.', 'Dhanyavaadagalu.', 'thanks'),

  // Transport
  p('transport', 'Where is the bus stop?', 'Bus stop kahan hai?', 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', 'Bus nildaana ellide?', 'bus stop stand'),
  p('transport', 'Does this bus go to the college?', 'Kya yeh bus college jaati hai?', 'ಈ ಬಸ್ ಕಾಲೇಜಿಗೆ ಹೋಗುತ್ತದೆಯೇ?', 'Ee bus collegige hoguttadeye?', 'bus route college'),
  p('transport', 'Please stop here.', 'Kripya yahan rokiye.', 'ದಯವಿಟ್ಟು ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ.', 'Dayavittu illi nillisi.', 'stop auto bus drop'),
  p('transport', 'Please turn on the meter.', 'Meter chalu kijiye.', 'ದಯವಿಟ್ಟು ಮೀಟರ್ ಹಾಕಿ.', 'Dayavittu meter haaki.', 'auto meter fare rickshaw'),
  p('transport', 'How much to go to the college?', 'College jaane ka kitna lagega?', 'ಕಾಲೇಜಿಗೆ ಹೋಗಲು ಎಷ್ಟು?', 'Collegige hogalu eshtu?', 'auto fare price'),
  p('transport', 'Where is the railway station?', 'Railway station kahan hai?', 'ರೈಲು ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', 'Railu nildaana ellide?', 'train station'),
  p('transport', 'Turn left.', 'Baayein mudiye.', 'ಎಡಕ್ಕೆ ತಿರುಗಿ.', 'Edakke tirugi.', 'left direction'),
  p('transport', 'Turn right.', 'Daayein mudiye.', 'ಬಲಕ್ಕೆ ತಿರುಗಿ.', 'Balakke tirugi.', 'right direction'),

  // Healthcare
  p('healthcare', 'Where is the hospital?', 'Hospital kahan hai?', 'ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?', 'Aaspatre ellide?', 'hospital clinic'),
  p('healthcare', 'I need a doctor.', 'Mujhe doctor chahiye.', 'ನನಗೆ ವೈದ್ಯರು ಬೇಕು.', 'Nanage vaidyaru beku.', 'doctor'),
  p('healthcare', 'I have a fever.', 'Mujhe bukhaar hai.', 'ನನಗೆ ಜ್ವರ ಇದೆ.', 'Nanage jwara ide.', 'fever sick'),
  p('healthcare', 'I have a headache.', 'Mujhe sir dard hai.', 'ನನಗೆ ತಲೆನೋವು ಇದೆ.', 'Nanage thale novu ide.', 'headache pain'),
  p('healthcare', 'I have stomach pain.', 'Mujhe pet dard hai.', 'ನನಗೆ ಹೊಟ್ಟೆ ನೋವು ಇದೆ.', 'Nanage hotte novu ide.', 'stomach pain'),
  p('healthcare', 'Where is the pharmacy?', 'Pharmacy kahan hai?', 'ಔಷಧಿ ಅಂಗಡಿ ಎಲ್ಲಿದೆ?', 'Aushadhi angadi ellide?', 'pharmacy medicine medical store'),
  p('healthcare', 'Please call an ambulance.', 'Kripya ambulance bulaiye.', 'ದಯವಿಟ್ಟು ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.', 'Dayavittu ambulance kareyiri.', 'emergency ambulance help'),

  // Village and travel
  p('village', 'Hello, how are you?', 'Namaste, aap kaise hain?', 'ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?', 'Namaskara, hegiddeera?', 'greeting hello village'),
  p('village', 'I am a tourist.', 'Main paryatak hoon.', 'ನಾನು ಪ್ರವಾಸಿ.', 'Naanu pravaasi.', 'visitor guest tourist visiting'),
  p('village', 'Is this the way to the village?', 'Kya yeh gaon ka raasta hai?', 'ಇದು ಹಳ್ಳಿಗೆ ಹೋಗುವ ದಾರಿಯೇ?', 'Idu hallige hoguva daariye?', 'way road direction village'),
  p('village', 'May I take a photo?', 'Kya main photo le sakta hoon?', 'ನಾನು ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಬಹುದೇ?', 'Naanu photo tegedukollabahude?', 'photo camera permission'),
  p('village', 'Is there a place to stay here?', 'Yahan rukne ki jagah hai?', 'ಇಲ್ಲಿ ಉಳಿದುಕೊಳ್ಳಲು ಜಾಗ ಇದೆಯೇ?', 'Illi ulidukollalu jaaga ideye?', 'stay room lodge night'),
  p('village', 'The food is very tasty.', 'Khana bahut swadisht hai.', 'ಊಟ ತುಂಬಾ ರುಚಿಯಾಗಿದೆ.', 'Oota tumba ruchiyaagide.', 'food tasty delicious compliment'),
  p('village', 'Can I have some water?', 'Thoda paani milega?', 'ಸ್ವಲ್ಪ ನೀರು ಸಿಗಬಹುದೇ?', 'Swalpa neeru sigabahude?', 'water drink thirsty'),

  // Beach
  p('beach', 'Where is the beach?', 'Beach kahan hai?', 'ಕಡಲತೀರ ಎಲ್ಲಿದೆ?', 'Kadalateera ellide?', 'beach sea'),
  p('beach', 'Is it safe to swim here?', 'Kya yahan tairna surakshit hai?', 'ಇಲ್ಲಿ ಈಜುವುದು ಸುರಕ್ಷಿತವೇ?', 'Illi eejuvudu surakshitave?', 'swim safe water sea'),
  p('beach', 'Where is the restroom?', 'Shauchalay kahan hai?', 'ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?', 'Shouchaalaya ellide?', 'toilet restroom washroom'),
  p('beach', 'Can I hire a boat?', 'Kya naav kiraye par milegi?', 'ದೋಣಿ ಬಾಡಿಗೆಗೆ ಸಿಗುತ್ತದೆಯೇ?', 'Doni baadigege siguttadeye?', 'boat ride hire'),
  p('beach', 'Please watch my bag.', 'Kripya mera bag dekhiye.', 'ದಯವಿಟ್ಟು ನನ್ನ ಬ್ಯಾಗ್ ನೋಡಿಕೊಳ್ಳಿ.', 'Dayavittu nanna bag nodikolli.', 'bag watch luggage safe'),

  // Hills
  p('hills', 'How far is the viewpoint?', 'Viewpoint kitni door hai?', 'ವ್ಯೂಪಾಯಿಂಟ್ ಎಷ್ಟು ದೂರ?', 'Viewpoint eshtu doora?', 'viewpoint far distance'),
  p('hills', 'Is this road safe?', 'Kya yeh sadak surakshit hai?', 'ಈ ರಸ್ತೆ ಸುರಕ್ಷಿತವೇ?', 'Ee raste surakshitave?', 'road safe ghat'),
  p('hills', 'Can I get a trekking guide?', 'Kya trekking guide mil sakta hai?', 'ಟ್ರೆಕ್ಕಿಂಗ್ ಗೈಡ್ ಸಿಗುತ್ತಾರೆಯೇ?', 'Trekking guide siguttaareye?', 'trek trail guide hike'),
  p('hills', 'It is very cold.', 'Bahut thand hai.', 'ತುಂಬಾ ಚಳಿ ಇದೆ.', 'Tumba chali ide.', 'cold weather'),
  p('hills', 'Where can I get hot coffee?', 'Garam coffee kahan milegi?', 'ಬಿಸಿ ಕಾಫಿ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?', 'Bisi coffee elli siguttade?', 'coffee hot tea'),

  // Mall and shopping
  p('mall', 'Where is the food court?', 'Food court kahan hai?', 'ಫುಡ್ ಕೋರ್ಟ್ ಎಲ್ಲಿದೆ?', 'Food court ellide?', 'food court eat'),
  p('mall', 'Do you have a smaller size?', 'Kya isse chhota size hai?', 'ಇದರ ಚಿಕ್ಕ ಸೈಜ್ ಇದೆಯೇ?', 'Idara chikka size ideye?', 'size clothes shop'),
  p('mall', 'Is there a discount?', 'Kya discount hai?', 'ರಿಯಾಯಿತಿ ಇದೆಯೇ?', 'Riyaayiti ideye?', 'discount offer price'),
  p('mall', 'Where is the trial room?', 'Trial room kahan hai?', 'ಟ್ರಯಲ್ ರೂಮ್ ಎಲ್ಲಿದೆ?', 'Trial room ellide?', 'trial room clothes'),
  p('mall', 'Can I pay by UPI?', 'Kya main UPI se pay kar sakta hoon?', 'ಯುಪಿಐ ಮೂಲಕ ಪಾವತಿಸಬಹುದೇ?', 'UPI moolaka paavatisabahude?', 'pay upi payment'),

  // Festival
  p('festival', 'Happy festival!', 'Tyohaar ki shubhkamnayein!', 'ಹಬ್ಬದ ಶುಭಾಶಯಗಳು!', 'Habbada shubhaashayagalu!', 'festival wishes greeting'),
  p('festival', 'What time does the procession start?', 'Julus kab shuru hoga?', 'ಮೆರವಣಿಗೆ ಯಾವಾಗ ಶುರುವಾಗುತ್ತದೆ?', 'Meravanige yaavaaga shuruvaaguttade?', 'procession time parade'),
  p('festival', 'May I join you?', 'Kya main shaamil ho sakta hoon?', 'ನಾನೂ ಸೇರಬಹುದೇ?', 'Naanoo serabahude?', 'join dance'),
  p('festival', 'Where is the temple?', 'Mandir kahan hai?', 'ದೇವಸ್ಥಾನ ಎಲ್ಲಿದೆ?', 'Devasthaana ellide?', 'temple'),
  p('festival', 'What is this festival called?', 'Is tyohaar ka naam kya hai?', 'ಈ ಹಬ್ಬದ ಹೆಸರೇನು?', 'Ee habbada hesarenu?', 'festival name'),

  // Everyday introductions
  p('village', 'Hello.', 'Namaste.', 'ನಮಸ್ಕಾರ.', 'Namaskaara.', 'hello greeting namaste'),
  p('village', 'How are you?', 'Aap kaise hain?', 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', 'Neevu hegiddiri?', 'how are you greeting'),
  p('village', 'I am fine.', 'Main theek hoon.', 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ.', 'Naanu chennagiddene.', 'fine okay well'),
  p('village', 'What is your name?', 'Aapka naam kya hai?', 'ನಿಮ್ಮ ಹೆಸರೇನು?', 'Nimma hesarenu?', 'name introduction'),
  p('village', 'My name is Ravi.', 'Mera naam Ravi hai.', 'ನನ್ನ ಹೆಸರು ರವಿ.', 'Nanna hesaru Ravi.', 'name introduction ravi'),
  p('village', 'Where are you from?', 'Aap kahan se hain?', 'ನೀವು ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?', 'Neevu ellinda bandiddiri?', 'from place introduction'),
  p('village', 'I speak Hindi.', 'Main Hindi bolta hoon.', 'ನಾನು ಹಿಂದಿ ಮಾತನಾಡುತ್ತೇನೆ.', 'Naanu Hindi maatanaaduttene.', 'hindi language speak'),
  p('village', 'Nice to meet you.', 'Aapse milkar achha laga.', 'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷವಾಯಿತು.', 'Nimmannu bhetiyaagi santoshavaayitu.', 'meet greeting'),
  p('village', 'See you again.', 'Phir milenge.', 'ಮತ್ತೆ ಭೇಟಿಯಾಗೋಣ.', 'Matte bhetiyaagona.', 'goodbye meet again'),

  // Everyday conversation
  p('village', 'Yes.', 'Haan.', 'ಹೌದು.', 'Howdu.', 'yes agree'),
  p('village', 'No.', 'Nahi.', 'ಇಲ್ಲ.', 'Illa.', 'no refuse'),
  p('village', 'Okay.', 'Theek hai.', 'ಸರಿ.', 'Sari.', 'okay agree'),
  p('village', 'Please.', 'Kripya.', 'ದಯವಿಟ್ಟು.', 'Dayavittu.', 'please request'),
  p('village', 'Sorry, excuse me.', 'Maaf kijiye.', 'ಕ್ಷಮಿಸಿ.', 'Kshamisi.', 'sorry excuse'),
  p('village', "I didn't understand.", 'Mujhe samajh nahi aaya.', 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.', 'Nanage arthavaagalilla.', 'understand repeat'),
  p('village', 'Please say it again.', 'Dobara kahiye.', 'ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.', 'Dayavittu mattomme heli.', 'repeat again speak'),
  p('village', 'What does this mean?', 'Iska kya matlab hai?', 'ಇದರ ಅರ್ಥವೇನು?', 'Idara arthavenu?', 'meaning explain'),
  p('village', 'Do you understand Hindi?', 'Kya aap Hindi samajhte hain?', 'ನಿಮಗೆ ಹಿಂದಿ ಅರ್ಥವಾಗುತ್ತದೆಯೇ?', 'Nimage Hindi arthavaaguttadeye?', 'hindi understand language'),

  // Food and restaurant
  p('food', 'I need water.', 'Mujhe paani chahiye.', 'ನನಗೆ ನೀರು ಬೇಕು.', 'Nanage neeru beku.', 'water need drink'),
  p('food', 'I am hungry.', 'Mujhe bhookh lagi hai.', 'ನನಗೆ ಹಸಿವಾಗಿದೆ.', 'Nanage hasivaagide.', 'hungry food eat'),
  p('food', 'I am thirsty.', 'Mujhe pyaas lagi hai.', 'ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ.', 'Nanage baayaarikeyagide.', 'thirsty water drink'),
  p('food', 'Where can I get food?', 'Khana kahan milega?', 'ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?', 'Oota elli siguttade.', 'food meal hungry'),
  p('food', 'Show me the menu.', 'Menu dikhaiye.', 'ಮೆನು ತೋರಿಸಿ.', 'Menu torisi.', 'menu restaurant order'),
  p('food', 'I want vegetarian food.', 'Mujhe shakahari khana chahiye.', 'ನನಗೆ ಸಸ್ಯಾಹಾರಿ ಊಟ ಬೇಕು.', 'Nanage sasyahaari oota beku.', 'vegetarian food meal'),
  p('food', 'Please bring the bill.', 'Bill dijiye.', 'ಬಿಲ್ ಕೊಡಿ.', 'Bill kodi.', 'bill payment restaurant'),

  // Additional transport and directions
  p('transport', 'Where is the bus stand?', 'Bus stand kahan hai?', 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', 'Bus nildaana ellide?', 'bus stand stop station'),
  p('transport', 'I need to go there.', 'Mujhe wahan jaana hai.', 'ನಾನು ಅಲ್ಲಿಗೆ ಹೋಗಬೇಕು.', 'Naanu allige hogabeku.', 'go travel destination'),
  p('transport', 'Is this the right way?', 'Kya yeh sahi raasta hai?', 'ಇದು ಸರಿಯಾದ ದಾರಿಯೇ?', 'Idu sariyaada daariye?', 'way road direction'),
  p('transport', 'How far is it?', 'Yeh kitni door hai?', 'ಎಷ್ಟು ದೂರ ಇದೆ?', 'Eshtu doora ide.', 'distance far'),
  p('transport', 'Please call an auto.', 'Auto bulaiye.', 'ದಯವಿಟ್ಟು ಆಟೋ ಕರೆಸಿ.', 'Dayavittu auto karesi.', 'auto rickshaw call'),
  p('transport', "I don't know the way.", 'Mujhe raasta nahi pata.', 'ನನಗೆ ದಾರಿ ಗೊತ್ತಿಲ್ಲ.', 'Nanage daari gottilla.', 'lost way direction'),

  // Additional college phrases
  p('college', 'When will the class start?', 'Class kab shuru hogi?', 'ತರಗತಿ ಯಾವಾಗ ಶುರುವಾಗುತ್ತದೆ?', 'Taragati yaavaga shuruvaaguttade?', 'class start time'),
  p('college', 'I need help.', 'Mujhe madad chahiye.', 'ನನಗೆ ಸಹಾಯ ಬೇಕು.', 'Nanage sahaaya beku.', 'help assistance'),
  p('college', 'When is the exam?', 'Pariksha kab hai?', 'ಪರೀಕ್ಷೆ ಯಾವಾಗ ಇದೆ?', 'Pareekshe yaavaga ide?', 'exam test date'),
  p('college', 'Please explain this to me.', 'Mujhe yeh samjhaiye.', 'ದಯವಿಟ್ಟು ಇದನ್ನು ನನಗೆ ವಿವರಿಸಿ.', 'Dayavittu idannu nanage vivarisi.', 'explain understand study'),
  p('college', 'Can I borrow your notes?', 'Kya main aapke notes le sakta hoon?', 'ನಿಮ್ಮ ನೋಟ್ಸ್ ತೆಗೆದುಕೊಳ್ಳಬಹುದೇ?', 'Nimma notes tegedukollabahude?', 'notes borrow study'),

  // Shopping and payment
  p('mall', 'How much does this cost?', 'Iski keemat kitni hai?', 'ಇದರ ಬೆಲೆ ಎಷ್ಟು?', 'Idara bele eshtu?', 'price cost shopping'),
  p('mall', 'This is very expensive.', 'Yeh bahut mehenga hai.', 'ಇದು ತುಂಬಾ ದುಬಾರಿಯಾಗಿದೆ.', 'Idu tumbaa dubaariyaagide.', 'expensive price'),
  p('mall', 'Please reduce the price a little.', 'Thoda kam kijiye.', 'ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.', 'Swalpa kadime maadi.', 'bargain reduce price'),
  p('mall', 'I want this.', 'Mujhe yeh chahiye.', 'ನನಗೆ ಇದು ಬೇಕು.', 'Nanage idu beku.', 'want buy shopping'),
  p('mall', "I don't want this.", 'Mujhe yeh nahi chahiye.', 'ನನಗೆ ಇದು ಬೇಡ.', 'Nanage idu beda.', 'dont want shopping'),
  p('mall', 'Do you accept UPI?', 'Kya aap UPI lete hain?', 'ನೀವು UPI ಸ್ವೀಕರಿಸುತ್ತೀರಾ?', 'Neevu UPI sveekarisutteera?', 'upi payment pay'),
  p('mall', 'I need a receipt.', 'Mujhe receipt chahiye.', 'ನನಗೆ ರಸೀದಿ ಬೇಕು.', 'Nanage raseedi beku.', 'receipt bill payment'),
  p('mall', 'Do you have another size?', 'Kya doosri size hai?', 'ಬೇರೆ ಗಾತ್ರ ಇದೆಯೇ?', 'Bere gaatra ideye?', 'size clothes shopping'),

  // Additional healthcare
  p('healthcare', 'I am in pain.', 'Mujhe dard ho raha hai.', 'ನನಗೆ ನೋವಾಗುತ್ತಿದೆ.', 'Nanage novaaguttide.', 'pain hurt doctor'),
  p('healthcare', 'Call an ambulance.', 'Ambulance bulaiye.', 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಸಿ.', 'Ambulance karesi.', 'ambulance emergency'),
  p('healthcare', 'I need medicine.', 'Mujhe dawa chahiye.', 'ನನಗೆ ಔಷಧಿ ಬೇಕು.', 'Nanage aushadhi beku.', 'medicine pharmacy'),
  p('healthcare', 'Please help me.', 'Kripya meri madad kijiye.', 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.', 'Dayavittu nanage sahaaya maadi.', 'help emergency'),
  p('healthcare', 'Call the police.', 'Police ko bulaiye.', 'ಪೊಲೀಸರಿಗೆ ಕರೆ ಮಾಡಿ.', 'Policege kare maadi.', 'police emergency help'),

  // Kannada learning
  p('village', 'What are you doing?', 'Aap kya kar rahe hain?', 'ನೀವು ಏನು ಮಾಡುತ್ತಿದ್ದೀರಿ?', 'Neevu enu maaduttiddiri?', 'doing conversation'),
  p('village', 'Where are you going?', 'Aap kahan ja rahe hain?', 'ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ?', 'Neevu ellige hoguttiddiri?', 'going destination'),
  p('village', 'I want to learn Kannada.', 'Mujhe Kannada seekhni hai.', 'ನಾನು ಕನ್ನಡ ಕಲಿಯಬೇಕು.', 'Naanu Kannada kaliyabeku.', 'learn kannada language'),
  p('village', 'How do you say this in Kannada?', 'Ise Kannada mein kaise kehte hain?', 'ಇದನ್ನು ಕನ್ನಡದಲ್ಲಿ ಹೇಗೆ ಹೇಳುತ್ತಾರೆ?', 'Idannu Kannadadalli hege heluttare?', 'translate kannada language'),
  p('village', 'I want to practice.', 'Mujhe abhyas karna hai.', 'ನಾನು ಅಭ್ಯಾಸ ಮಾಡಬೇಕು.', 'Naanu abhyaasa maadabeku.', 'practice learn'),

  // NEW: Work and office phrases
  p('work', 'Where is the office?', 'Office kahan hai?', 'ಕಚೇರಿ ಎಲ್ಲಿದೆ?', 'Kacheri ellide?', 'work office location'),
  p('work', 'I have a meeting today.', 'Aaj meri meeting hai.', 'ನನಗೆ ಇಂದು ಸಭೆ ಇದೆ.', 'Nanage indu sabhe ide.', 'work meeting today'),
  p('work', 'When does the meeting start?', 'Meeting kab shuru hoti hai?', 'ಸಭೆ ಯಾವಾಗ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?', 'Sabhe yaavaaga praarambhavaaguttade?', 'meeting time start'),
  p('work', 'I am looking for work.', 'Main kaam dhoondh raha hoon.', 'ನಾನು ಕೆಲಸ ಹುಡುಕುತ್ತಿದ್ದೇನೆ.', 'Naanu kelasa hudukuttiddene.', 'work job looking'),
  p('work', 'Can you explain this task?', 'Kya aap yeh kaam samjha sakte hain?', 'ಈ ಕೆಲಸವನ್ನು ವಿವರಿಸಬಹುದೇ?', 'Ee kelasavannu vivarisabahude?', 'task explain help'),
  p('work', 'Please send me the details.', 'Kripya mujhe vivaran bhejiye.', 'ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ.', 'Dayavittu vivaragalannu kaluhisi.', 'details send message'),
  p('work', 'I will come tomorrow.', 'Main kal aaunga.', 'ನಾನು ನಾಳೆ ಬರುತ್ತೇನೆ.', 'Naanu naale baruttene.', 'tomorrow coming schedule'),
  p('work', 'I need some more time.', 'Mujhe thoda aur samay chahiye.', 'ನನಗೆ ಇನ್ನೂ ಸ್ವಲ್ಪ ಸಮಯ ಬೇಕು.', 'Nanage innoo swalpa samaya beku.', 'time delay deadline'),

  // NEW: Emergency phrases
  p('emergency', 'I need help immediately.', 'Mujhe turant madad chahiye.', 'ನನಗೆ ತಕ್ಷಣ ಸಹಾಯ ಬೇಕು.', 'Nanage takshana sahaaya beku.', 'emergency urgent help'),
  p('emergency', 'I am lost.', 'Main raasta bhatak gaya hoon.', 'ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ.', 'Naanu daari tappiddene.', 'lost direction emergency'),
  p('emergency', 'Please call the police.', 'Kripya police ko phone kijiye.', 'ದಯವಿಟ್ಟು ಪೊಲೀಸರಿಗೆ ಕರೆ ಮಾಡಿ.', 'Dayavittu policege kare maadi.', 'police emergency safety'),
  p('emergency', 'Please call an ambulance now.', 'Kripya abhi ambulance bulaiye.', 'ದಯವಿಟ್ಟು ಈಗ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ.', 'Dayavittu eega ambulance kare maadi.', 'ambulance urgent hospital'),
  p('emergency', 'Where is the nearest hospital?', 'Sabse nazdeek hospital kahan hai?', 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?', 'Hattirada aaspatre ellide?', 'hospital nearest emergency'),
  p('emergency', 'I do not feel safe.', 'Mujhe surakshit mehsoos nahi ho raha.', 'ನನಗೆ ಸುರಕ್ಷಿತವೆನಿಸುತ್ತಿಲ್ಲ.', 'Nanage surakshitavenisuttilla.', 'unsafe danger safety'),
  p('emergency', 'My phone is missing.', 'Mera phone kho gaya hai.', 'ನನ್ನ ಫೋನ್ ಕಾಣೆಯಾಗಿದೆ.', 'Nanna phone kaNeyagide.', 'phone lost missing'),
  p('emergency', 'Please contact my family.', 'Kripya mere parivaar se sampark kijiye.', 'ದಯವಿಟ್ಟು ನನ್ನ ಕುಟುಂಬವನ್ನು ಸಂಪರ್ಕಿಸಿ.', 'Dayavittu nanna kutumbavannu samparkisi.', 'family contact emergency'),
  p('emergency', 'Please help me find my way.', 'Kripya mujhe raasta dhoondhne mein madad kijiye.', 'ದಯವಿಟ್ಟು ದಾರಿ ಕಂಡುಕೊಳ್ಳಲು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.', 'Dayavittu daari kandukollalu nanage sahaaya maadi.', 'lost directions help')
];