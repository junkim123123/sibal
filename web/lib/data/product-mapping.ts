// Product name mapping: Korean folder name -> English display name & category
// This mapping is used to translate Korean product folder names to B2B sourcing terminology

export interface ProductMapping {
  englishName: string;
  category: 'confectionery' | 'toys' | 'character' | 'other';
  subcategory?: string;
}

export const productMapping: Record<string, ProductMapping> = {
  // Confectionery - Jelly & Gummy
  '3d젤리': { englishName: '3D Toy Jelly', category: 'confectionery', subcategory: '3D Gummy & DIY Kits' },
  'DIY 달콤 모나카': { englishName: 'DIY Sweet Monaka Kit', category: 'confectionery', subcategory: '3D Gummy & DIY Kits' },
  '까먹는 젤리': { englishName: 'Peelable Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '에그타르트젤리': { englishName: 'Egg Tart Jelly', category: 'confectionery', subcategory: '3D Gummy & DIY Kits' },
  '탕후루젤리': { englishName: 'Tanghulu Jelly (Candied Fruit Jelly)', category: 'confectionery', subcategory: '3D Gummy & DIY Kits' },
  '육회젤리': { englishName: 'Raw Meat Style Jelly (Yukhoe Jelly)', category: 'confectionery', subcategory: '3D Gummy & DIY Kits' },
  '망고맛 푸딩': { englishName: 'Mango Pudding', category: 'confectionery', subcategory: '3D Gummy & DIY Kits' },
  '맛있는 과일젤리': { englishName: 'Fruit Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '모듬젤리': { englishName: 'Assorted Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '프루츠사워젤리': { englishName: 'Fruit Sour Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '시즌 마시멜로우': { englishName: 'Seasonal Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '스위트 과일모양 젤리': { englishName: 'Sweet Fruit Shape Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '야미젤리빈': { englishName: 'Yummy Jelly Bean', category: 'confectionery', subcategory: 'Novelty Candy' },
  '새콤팡팡 젤리빈': { englishName: 'Sour Pop Jelly Bean', category: 'confectionery', subcategory: 'Novelty Candy' },
  '사이다 콜라 환타 병 젤리빈': { englishName: 'Soda/Cola/Fanta Bottle Jelly Bean', category: 'confectionery', subcategory: 'Novelty Candy' },
  '매직빈즈달콤젤리빈': { englishName: 'Magic Beans Jelly Bean', category: 'confectionery', subcategory: 'Novelty Candy' },
  '드럼스틱 더블 젤리': { englishName: 'Drumstick Double Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '루와버블껌': { englishName: 'Luwa Bubble Gum', category: 'confectionery', subcategory: 'Novelty Candy' },
  '리본젤리': { englishName: 'Ribbon Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '롤젤리': { englishName: 'Roll Jelly', category: 'confectionery', subcategory: 'Novelty Candy' },
  '크리스탈캔디': { englishName: 'Crystal Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '빠삭달콤캔디': { englishName: 'Crispy Sweet Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '말차캔디': { englishName: 'Matcha Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '소리까지담은캔디': { englishName: 'Sound Candy (ASMR)', category: 'confectionery', subcategory: 'Novelty Candy' },
  '스톤캔디': { englishName: 'Stone Chocolate/Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '로보사우루스 스톤캔디': { englishName: 'Robosaurus Stone Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '다이노 5단 합체로봇 스톤캔디': { englishName: 'Dino 5-Stage Combiner Robot Stone Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  'LED 불빛 반지캔디': { englishName: 'LED Light Ring Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '심쿵룰렛': { englishName: 'Heart-Thumping Roulette', category: 'confectionery', subcategory: 'Novelty Candy' },
  '악어 룰렛': { englishName: 'Crocodile Roulette Game', category: 'confectionery', subcategory: 'Novelty Candy' },
  '왕셔요 풍선껌': { englishName: 'King Shake Balloon Gum', category: 'confectionery', subcategory: 'Novelty Candy' },
  '왕큐브팝': { englishName: 'King Cube Pop', category: 'confectionery', subcategory: 'Novelty Candy' },
  '요요우주팝': { englishName: 'Yo-Yo Space Pop', category: 'confectionery', subcategory: 'Novelty Candy' },
  '주사위껌': { englishName: 'Dice Gum', category: 'confectionery', subcategory: 'Novelty Candy' },
  '후루츄': { englishName: 'Huruchu Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  
  // Confectionery - Marshmallows
  '과일먹은 마시멜로우': { englishName: 'Fruit-Filled Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '과일을 탐하는 마시멜로우': { englishName: 'Fruit-Filled Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '딸기모양 마시멜로': { englishName: 'Strawberry Shape Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '바베큐 마시멜로': { englishName: 'BBQ Roasting Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '바베큐 마시멜로우': { englishName: 'BBQ Roasting Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '짱셔요 마시멜로우': { englishName: 'Sour Powder Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '푸푸 마시멜로우': { englishName: 'Poop Emoji Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '메롱마시멜로우': { englishName: 'Poop Emoji Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '한입마시멜로우': { englishName: 'One-Bite Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '캐릭터 마시멜로우': { englishName: 'Character Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '말랑달콤 젤리 마시멜로우': { englishName: 'Soft Sweet Jelly Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  '악마의열매 마시멜로우': { englishName: 'Devil Fruit Marshmallow', category: 'confectionery', subcategory: 'Marshmallows' },
  
  // Confectionery - Other
  '곰돌이 껌': { englishName: 'Bear Gum', category: 'confectionery', subcategory: 'Novelty Candy' },
  '초코킥': { englishName: 'Choco Kick', category: 'confectionery', subcategory: 'Novelty Candy' },
  '초코펜': { englishName: 'Choco Pen', category: 'confectionery', subcategory: 'Novelty Candy' },
  '캐릭터 초코스틱 미니언즈 짱구': { englishName: 'Character Choco Stick (Minions/Crayon Shin-chan)', category: 'confectionery', subcategory: 'Novelty Candy' },
  '코코펀치': { englishName: 'Coco Punch', category: 'confectionery', subcategory: 'Novelty Candy' },
  '콜라 파인애플맛 캔디': { englishName: 'Cola Pineapple Flavor Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '콩순이 캔디샵': { englishName: 'Kongsooni Candy Shop', category: 'confectionery', subcategory: 'Novelty Candy' },
  '디너초코 공구박스': { englishName: 'Dinner Choco Toolbox', category: 'confectionery', subcategory: 'Novelty Candy' },
  '밀크소프페과자': { englishName: 'Milk Soft Cookie', category: 'confectionery', subcategory: 'Novelty Candy' },
  '밀크치즈바캐트': { englishName: 'Milk Cheese Bar Cat', category: 'confectionery', subcategory: 'Novelty Candy' },
  '밀크하이스퍼프스': { englishName: 'Milk High Surprise', category: 'confectionery', subcategory: 'Novelty Candy' },
  '펑리수 비스킷': { englishName: 'Pineapple Cake Biscuit', category: 'confectionery', subcategory: 'Novelty Candy' },
  '피넛밀크라이스롤과자': { englishName: 'Peanut Milk Rice Roll Snack', category: 'confectionery', subcategory: 'Novelty Candy' },
  '한입쌀과자': { englishName: 'One-Bite Rice Snack', category: 'confectionery', subcategory: 'Novelty Candy' },
  '망고맛집': { englishName: 'Mango Flavor Collection', category: 'confectionery', subcategory: 'Novelty Candy' },
  '슈퍼파워 버틀킹': { englishName: 'Super Power Battle King', category: 'confectionery', subcategory: 'Novelty Candy' },
  '숲속마을 죽순 버섯모양': { englishName: 'Forest Village Bamboo Shoot Mushroom Shape', category: 'confectionery', subcategory: 'Novelty Candy' },
  '눈오리만들기 달콤캔디': { englishName: 'Snow Duck Maker Candy', category: 'confectionery', subcategory: 'Novelty Candy' },
  '낚시왕 놀이': { englishName: 'Fishing King Game', category: 'confectionery', subcategory: 'Novelty Candy' },
  '나의히어로아카데미아 해피캔디': { englishName: 'My Hero Academia Happy Candy', category: 'confectionery', subcategory: 'Character' },
  '신묘한 캔뱃지': { englishName: 'Mysterious Can Badge', category: 'confectionery', subcategory: 'Novelty Candy' },
  
  // Toys & Novelties
  '$0.5 장난감': { englishName: 'Budget Toys ($0.5)', category: 'toys', subcategory: 'Play & Games' },
  '고슴도치 데스크탑 청소기': { englishName: 'Hedgehog Desktop Vacuum', category: 'toys', subcategory: 'Desktop & Gadgets' },
  '미키마우스 대스크탑 청소기': { englishName: 'Mickey Mouse Desktop Vacuum', category: 'toys', subcategory: 'Desktop & Gadgets' },
  '부엉이 저금통': { englishName: 'Owl Piggy Bank', category: 'toys', subcategory: 'Desktop & Gadgets' },
  '정수기 장난감': { englishName: 'Mini Water Purifier Toy', category: 'toys', subcategory: 'Desktop & Gadgets' },
  '탐나정수기': { englishName: 'Tamna Water Purifier Toy', category: 'toys', subcategory: 'Desktop & Gadgets' },
  '눈오리만들기': { englishName: 'Snow Duck Maker', category: 'toys', subcategory: 'Summer & Outdoor' },
  '돌고래비눗방울': { englishName: 'Dolphin Bubble Gun', category: 'toys', subcategory: 'Summer & Outdoor' },
  '자이언트 버블 스틱': { englishName: 'Giant Bubble Stick', category: 'toys', subcategory: 'Summer & Outdoor' },
  '선풍기 모음': { englishName: 'Portable Hand Fan Collection', category: 'toys', subcategory: 'Summer & Outdoor' },
  '도라에몽 선풍기': { englishName: 'Doraemon Neck Fan', category: 'toys', subcategory: 'Summer & Outdoor' },
  '라이센스 선풍기': { englishName: 'Character Neck Fan', category: 'toys', subcategory: 'Summer & Outdoor' },
  '아이스크림 선풍기': { englishName: 'Ice Cream Shape Fan', category: 'toys', subcategory: 'Summer & Outdoor' },
  '옥스포드 선풍기': { englishName: 'Oxford Fan', category: 'toys', subcategory: 'Summer & Outdoor' },
  '펭귄톡톡 얼음깨기': { englishName: 'Penguin Ice Breaker Game', category: 'toys', subcategory: 'Play & Games' },
  '활쏘기 장난감': { englishName: 'Toy Archery Set', category: 'toys', subcategory: 'Play & Games' },
  '브롤샷다트건': { englishName: 'Brawl Shot Dart Gun', category: 'toys', subcategory: 'Play & Games' },
  '미니 바둑': { englishName: 'Mini Baduk (Go Game) Set', category: 'toys', subcategory: 'Play & Games' },
  '귀요미 곤충 채집 통': { englishName: "Kids' Insect Observation Box", category: 'toys', subcategory: 'Play & Games' },
  '부방용품 장난감': { englishName: 'Bathroom Accessories Toy', category: 'toys', subcategory: 'Play & Games' },
  '윙윙 바람개비 비눗방을': { englishName: 'Whirring Pinwheel Bubble', category: 'toys', subcategory: 'Summer & Outdoor' },
  '애니멀 버블스틱': { englishName: 'Animal Bubble Stick', category: 'toys', subcategory: 'Summer & Outdoor' },
  '불빛라이트닝 캔디': { englishName: 'Light Lightning Candy', category: 'toys', subcategory: 'Play & Games' },
  '브레드 이발소 오뚝이': { englishName: 'Bread Barbershop Roly-Poly', category: 'toys', subcategory: 'Play & Games' },
  '브레드이발소 키링': { englishName: 'Bread Barbershop Keyring', category: 'toys', subcategory: 'Play & Games' },
  '햄토리하우스': { englishName: 'Hamster House', category: 'toys', subcategory: 'Play & Games' },
  
  // Character Licensing
  '포켓몬 매직미러': { englishName: 'Pokemon Magic Mirror', category: 'character', subcategory: 'Pokemon' },
  '포켓몬 미니 캐리어': { englishName: 'Pokemon Mini Carrier', category: 'character', subcategory: 'Pokemon' },
  '포켓몬 손풍기': { englishName: 'Pokemon Hand Fan', category: 'character', subcategory: 'Pokemon' },
  '포켓몬 컬랙션 키링 달콤젤리': { englishName: 'Pokemon Collection Keyring & Jelly', category: 'character', subcategory: 'Pokemon' },
  '먼작귀 매직미러': { englishName: 'Chiikawa Magic Mirror', category: 'character', subcategory: 'Sanrio & Cute Characters' },
  '먼작귀 스탬프': { englishName: 'Chiikawa Stamp', category: 'character', subcategory: 'Sanrio & Cute Characters' },
  '먼작귀 아크릴': { englishName: 'Chiikawa Acrylic Stand', category: 'character', subcategory: 'Sanrio & Cute Characters' },
  '미니니쮸': { englishName: 'Minini-Chu', category: 'character', subcategory: 'Sanrio & Cute Characters' },
  '귀멸의 칼날 키링': { englishName: 'Demon Slayer Keyring', category: 'character', subcategory: 'Anime & Animation' },
  '귀멸의칼날 오뚝이': { englishName: 'Demon Slayer Roly-Poly Toy', category: 'character', subcategory: 'Anime & Animation' },
  '원피스 그립톧': { englishName: 'One Piece Grip Tok (Phone Grip)', category: 'character', subcategory: 'Anime & Animation' },
  '원피스 마그넷': { englishName: 'One Piece Magnet', category: 'character', subcategory: 'Anime & Animation' },
  '원피스 오뚝이': { englishName: 'One Piece Roly-Poly', category: 'character', subcategory: 'Anime & Animation' },
  '짱구 캐릭미러 달콤젤리': { englishName: 'Crayon Shin-chan Character Mirror Jelly', category: 'character', subcategory: 'Anime & Animation' },
  '짱구마그넷': { englishName: 'Crayon Shin-chan Magnet', category: 'character', subcategory: 'Anime & Animation' },
  '뽀로로 달콤캔디 키링': { englishName: 'Pororo Keyring Candy', category: 'character', subcategory: 'Anime & Animation' },
  '뽀로로매직미러': { englishName: 'Pororo Magic Mirror', category: 'character', subcategory: 'Anime & Animation' },
  '캐로로 오뚝이 달콤캔디': { englishName: 'Keroro Roly-Poly Sweet Candy', category: 'character', subcategory: 'Anime & Animation' },
  '캐로로키링': { englishName: 'Keroro Keyring', category: 'character', subcategory: 'Anime & Animation' },
  '라인 캐리어': { englishName: 'LINE Carrier', category: 'character', subcategory: 'Sanrio & Cute Characters' },
  '라인프렌즈 오뚝이 달콤캔디': { englishName: 'LINE Friends Roly-Poly Candy', category: 'character', subcategory: 'Sanrio & Cute Characters' },
  '라인프렌즈스탠드': { englishName: 'LINE Friends Stand', category: 'character', subcategory: 'Sanrio & Cute Characters' },
  '시크릿 쥬쥬 달콤캔디 키링': { englishName: 'Secret Jouju Keyring Candy', category: 'character', subcategory: 'Anime & Animation' },
  '시크릿 쥬쥬 칫솔모양 캔디': { englishName: 'Secret Jouju Toothbrush Shape Candy', category: 'character', subcategory: 'Anime & Animation' },
  '시크릿쥬쥬 스탠드': { englishName: 'Secret Jouju LED Stand', category: 'character', subcategory: 'Anime & Animation' },
  '시크릿쥬쥬 오뚝이': { englishName: 'Secret Jouju Roly-Poly', category: 'character', subcategory: 'Anime & Animation' },
  '마스크맨 오뚝이': { englishName: 'Mask Man Roly-Poly', category: 'character', subcategory: 'Anime & Animation' },
  '마스크모양 마시멜로': { englishName: 'Mask Shape Marshmallow', category: 'character', subcategory: 'Anime & Animation' },
  '보들키링': { englishName: 'Bodle Keyring', category: 'character', subcategory: 'Anime & Animation' },
  '피크민 휘슬': { englishName: 'Pikmin Whistle', category: 'character', subcategory: 'Anime & Animation' },
  '하리보 캐리어': { englishName: 'Haribo Carrier', category: 'character', subcategory: 'Anime & Animation' },
  '저스디스 리그 달콤 캔디키링': { englishName: 'Justice League Keyring Candy', category: 'character', subcategory: 'Anime & Animation' },
  '긱스 캔디': { englishName: 'Geeks Candy', category: 'character', subcategory: 'Anime & Animation' },
  '앙핑거다이노': { englishName: 'Ang Finger Dino', category: 'character', subcategory: 'Anime & Animation' },
};

// Helper function to get English name and category
export function getProductInfo(folderName: string): ProductMapping {
  // Normalize folder name (remove spaces, convert to lowercase for matching)
  const normalized = folderName.trim();
  const mapping = productMapping[normalized];
  
  if (mapping) {
    return mapping;
  }
  
  // Fallback: return folder name as English name
  return {
    englishName: normalized.replace(/-/g, ' ').replace(/_/g, ' '),
    category: 'other',
  };
}

// Category display names
export const categoryNames = {
  all: 'All Products',
  confectionery: 'Confectionery',
  toys: 'Toys & Novelties',
  character: 'Character Licensing',
  other: 'Other',
} as const;

