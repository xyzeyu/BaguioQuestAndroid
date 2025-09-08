// mocks/pois.ts
import { POI } from '@/types/navigation';
import { poiCoords } from './poi_coords'; // make sure poi_coords.ts is in the same 'mocks' folder

const basePOIs: POI[] = [
  {
    id: '1',
    name: 'Burnham Park',
    type: 'Park',
    description:
      'Often referred to as Baguio\'s "mother of all parks," this iconic 32.84-hectare urban oasis was designed by famed architect Daniel Burnham. Its diverse clusters include the Burnham Lagoon (great for boat rides), Children\'s Playground, Skating Rink, Rose Garden, Orchidarium, and more.',
    hours: '24 hours',
    rating: 4.5,
    amenities: [
      'Burnham Lagoon',
      'Boat Rides',
      "Children's Playground",
      'Skating Rink',
      'Rose Garden',
      'Orchidarium',
    ],
  },
  {
    id: '2',
    name: 'Baguio Cathedral',
    type: 'Tourist Attraction',
    description:
      'Our Lady of the Atonement Cathedral, also known as Baguio Cathedral, is a beautiful pink stone church.',
    hours: '6:00 AM - 7:00 PM',
    rating: 4.3,
    amenities: ['Parking'],
  },
  {
    id: '3',
    name: 'Session Road',
    type: 'Tourist Attraction',
    description:
      'The main commercial street of Baguio City, lined with shops, restaurants, and cafes.',
    hours: 'Varies by establishment',
    rating: 4.2,
    amenities: ['Shopping', 'Restaurants', 'ATM'],
  },
  {
    id: '4',
    name: 'Mines View Park',
    type: 'Park',
    description:
      'A high-elevation lookout offering sweeping views of the Amburayan Valley and the old mining town of Itogon. Visitors often don traditional Cordillera attire for photo ops at the observation deck.',
    hours: '6:00 AM - 6:00 PM',
    rating: 4.1,
    amenities: [
      'Observation Deck',
      'Amburayan Valley Views',
      'Traditional Cordillera Attire',
      'Photo Ops',
      'Souvenir Shops',
    ],
  },
  {
    id: '5',
    name: 'Baguio Botanical Garden',
    type: 'Park',
    description:
      "Nestled between Wright Park and Teacher's Camp, this garden offers themed sections featuring dahlia beds, cactus and succulent displays, a Friendship Garden (with global motifs), and even a WWII-era Japanese tunnel.",
    hours: '8:00 AM - 5:00 PM',
    rating: 4.0,
    amenities: [
      'Dahlia Beds',
      'Cactus Display',
      'Friendship Garden',
      'WWII Japanese Tunnel',
      'Walking Trails',
    ],
  },
  {
    id: '6',
    name: 'Wright Park',
    type: 'Park',
    description:
      'Located just across from The Mansion, this serene stretch of greenery is perfect for leisurely walks and horseback riding along a tree-lined reflecting pool. Pony handlers, known as "pony boys," offer rides that are popular with families.',
    hours: '6:00 AM - 6:00 PM',
    rating: 3.9,
    amenities: [
      'Tree-lined Reflecting Pool',
      'Pony Boys',
      'Horseback Riding',
      'Family-friendly',
      'Near The Mansion',
    ],
  },
  {
    id: '7',
    name: 'SM City Baguio',
    type: 'Shopping Mall',
    description:
      'A major shopping mall in Baguio City with various shops, restaurants, and entertainment options.',
    hours: '10:00 AM - 9:00 PM',
    phone: '+63 74 442 5555',
    website: 'www.smsupermalls.com',
    rating: 4.2,
    amenities: ['Parking', 'Restaurants', 'Cinema', 'ATM', 'WiFi'],
  },
  {
    id: '8',
    name: 'Camp John Hay',
    type: 'Park',
    description:
      "A vast forested former military base turned recreational zone. Here you'll find scenic History Trails, Secret Garden nooks, the whimsical Cemetery of Negativism, golf courses, and relaxing green spaces within a historical and natural setting.",
    hours: '24 hours',
    rating: 4.4,
    amenities: [
      'History Trails',
      'Secret Garden',
      'Cemetery of Negativism',
      'Golf Courses',
      'Forested Area',
      'Historical Setting',
    ],
  },
  {
    id: '9',
    name: 'The Mansion',
    type: 'Tourist Attraction',
    description:
      'The official summer residence of the President of the Philippines, featuring beautiful architecture and gardens.',
    hours: 'External viewing only',
    rating: 4.0,
    amenities: ['Photo Spots', 'Gardens'],
  },
  {
    id: '10',
    name: 'Baguio Public Market',
    type: 'Shopping',
    description:
      'A one-stop haven for the freshest strawberries, Benguet vegetables, a wide array of jams (strawberry, ube, blueberry), peanut brittle, Lengua de Gato, Benguet coffee, local teas, and handcrafted souvenirs such as woven bags, wooden decor, and keychains. Bring an eco-bag—Baguio enforces plastic- and styrofoam-free policies.',
    hours: '6:00 AM - 6:00 PM',
    rating: 4.2,
    amenities: [
      'Fresh Strawberries',
      'Local Jams',
      'Handicrafts',
      'Benguet Coffee',
      'Eco-friendly',
    ],
  },
  {
    id: '11',
    name: "Lion's Head",
    type: 'Tourist Attraction',
    description:
      'A scenic rock formation along Kennon Road offering spectacular mountain views.',
    hours: '24 hours',
    rating: 4.3,
    amenities: ['Photo Spots', 'Scenic Views'],
  },
  {
    id: '12',
    name: 'Teachers Camp',
    type: 'Educational Facility',
    description:
      'A historic training facility for teachers with beautiful pine trees and peaceful surroundings.',
    hours: '8:00 AM - 5:00 PM',
    rating: 3.7,
    amenities: ['Conference Facilities', 'Accommodation'],
  },
  {
    id: '13',
    name: 'Strawberry Farm',
    type: 'Tourist Attraction',
    description:
      'Pick your own strawberries at this popular farm attraction in La Trinidad, Benguet.',
    hours: '7:00 AM - 5:00 PM',
    rating: 4.2,
    amenities: ['Strawberry Picking', 'Fresh Produce', 'Photo Spots'],
  },
  {
    id: '14',
    name: 'Tam-awan Village',
    type: 'Tourist Attraction',
    description:
      'A recreated traditional Cordillera village showcasing indigenous culture and art.',
    hours: '8:00 AM - 5:00 PM',
    rating: 4.4,
    amenities: ['Cultural Shows', 'Art Gallery', 'Traditional Huts'],
  },
  {
    id: '15',
    name: 'Bencab Museum',
    type: 'Tourist Attraction',
    description:
      'A contemporary art museum featuring works by National Artist Benedicto Cabrera and other Filipino artists.',
    hours: '9:00 AM - 6:00 PM',
    rating: 4.6,
    amenities: ['Art Gallery', 'Gift Shop', 'Cafe'],
  },
  {
    id: '16',
    name: 'Asin Hot Springs',
    type: 'Tourist Attraction',
    description:
      'Natural hot springs perfect for relaxation with therapeutic mineral waters.',
    hours: '6:00 AM - 8:00 PM',
    rating: 4.1,
    amenities: ['Hot Springs', 'Changing Rooms', 'Parking'],
  },
  {
    id: '17',
    name: 'Baguio Country Club',
    type: 'Recreation',
    description:
      'An exclusive country club with golf course and recreational facilities.',
    hours: '6:00 AM - 6:00 PM',
    rating: 4.3,
    amenities: ['Golf Course', 'Restaurant', 'Swimming Pool'],
  },
  {
    id: '18',
    name: 'Mirador Jesuit Villa',
    type: 'Tourist Attraction',
    description:
      'A peaceful retreat center with beautiful gardens and panoramic views of Baguio.',
    hours: '8:00 AM - 5:00 PM',
    rating: 4.0,
    amenities: ['Chapel', 'Gardens', 'Retreat Facilities'],
  },
  {
    id: '19',
    name: 'Good Shepherd Convent',
    type: 'Shopping',
    description:
      'Famous for creamy ube jam, dragon fruit jam, and strawberry jam—locally loved and highly recommended for quality.',
    hours: '8:00 AM - 11:30 AM, 1:00 PM - 5:00 PM',
    rating: 4.5,
    amenities: [
      'Ube Jam',
      'Dragon Fruit Jam',
      'Strawberry Jam',
      'Quality Products',
    ],
  },
  {
    id: '20',
    name: 'Lourdes Grotto',
    type: 'Tourist Attraction',
    description:
      'A Catholic pilgrimage site with 252 steps leading to a grotto dedicated to Our Lady of Lourdes.',
    hours: '5:00 AM - 7:00 PM',
    rating: 4.2,
    amenities: ['Prayer Area', 'Candle Lighting', 'Scenic Views'],
  },
  {
    id: '21',
    name: 'Baguio Flower Festival Park',
    type: 'Tourist Attraction',
    description:
      'A colorful park celebrating the famous Panagbenga Flower Festival with year-round blooms.',
    hours: '6:00 AM - 6:00 PM',
    rating: 4.3,
    amenities: ['Flower Gardens', 'Photo Spots', 'Walking Paths'],
  },
  {
    id: '22',
    name: 'Diplomat Hotel',
    type: 'Tourist Attraction',
    description:
      'A historic and reportedly haunted hotel ruins with a dark past, now a popular tourist attraction.',
    hours: '8:00 AM - 5:00 PM',
    rating: 3.8,
    amenities: ['Historic Tours', 'Photo Opportunities'],
  },
  {
    id: '23',
    name: 'Café by the Ruins',
    type: 'Restaurant',
    description:
      'A rustic, wood-and-stone garden café housed in a former World War II theater. Known for Filipino dishes with fresh, local ingredients—try their pinikpikan, red rice Tapuey, and ube halaya. Arrive early to beat the crowds.',
    hours: '7:00 AM - 9:00 PM',
    rating: 4.6,
    amenities: [
      'Filipino Cuisine',
      'Garden Setting',
      'Local Ingredients',
      'Historic Building',
    ],
  },
  {
    id: '24',
    name: 'Oh My Gulay',
    type: 'Restaurant',
    description:
      "A unique, artsy vegetarian café perched atop a building on Session Road. Instagram-worthy interiors, creative veggie dishes, and lovely city views (though there's no elevator!).",
    hours: '11:00 AM - 9:00 PM',
    rating: 4.4,
    amenities: ['Vegetarian', 'City Views', 'Instagram-worthy', 'Art Decor'],
  },
  {
    id: '25',
    name: 'Lemon and Olives Greek Taverna',
    type: 'Restaurant',
    description:
      "Baguio's authentic Greek restaurant, offering moussaka, lamb gyros, baklava, and more, all served with a scenic view on Outlook Drive.",
    hours: '11:00 AM - 10:00 PM',
    rating: 4.5,
    amenities: ['Greek Cuisine', 'Scenic Views', 'Authentic Dishes', 'Mediterranean'],
  },
  {
    id: '26',
    name: 'Hill Station',
    type: 'Restaurant',
    description:
      'A cozy log-cabin-style eatery in Casa Vallejo offering a mix of Asian mountain and European flavors—think lamb, paella, steaks, and tapas. Great for dates or special occasions.',
    hours: '11:00 AM - 10:00 PM',
    rating: 4.7,
    amenities: ['Fine Dining', 'Log Cabin Style', 'European Cuisine', 'Romantic Setting'],
  },
  {
    id: '27',
    name: 'The Original Good Taste Cafe & Restaurant',
    type: 'Restaurant',
    description:
      'A no-frills, budget-friendly favorite known for hearty Filipino-style plates and massive portions—open 24/7 and a popular pick for families.',
    hours: '24 hours',
    rating: 4.2,
    amenities: ['24/7 Service', 'Budget-Friendly', 'Large Portions', 'Family-Friendly'],
  },
  {
    id: '28',
    name: 'Agara Ramen',
    type: 'Restaurant',
    description:
      'A go-to spot for slurping flavorful ramen—watch as your bowl is assembled right before you!',
    hours: '11:00 AM - 9:00 PM',
    rating: 4.3,
    amenities: ['Japanese Cuisine', 'Fresh Ramen', 'Open Kitchen', 'Authentic'],
  },
  {
    id: '29',
    name: 'Amare La Cucina',
    type: 'Restaurant',
    description:
      'A pizzeria with a traditional wood-fired oven; you might even get to toss your own dough. Their pasta, ribs, and homemade gelato (Monte Gelati) are also hits.',
    hours: '11:00 AM - 10:00 PM',
    rating: 4.5,
    amenities: ['Wood-Fired Pizza', 'Interactive Experience', 'Homemade Gelato', 'Italian Cuisine'],
  },
  {
    id: '30',
    name: 'Canto Bogchi Joint',
    type: 'Restaurant',
    description:
      'Comfort food at its best, with American-style dishes like lomo ribs and steaks, alongside Filipino favorites.',
    hours: '10:00 AM - 10:00 PM',
    rating: 4.4,
    amenities: ['American Cuisine', 'Comfort Food', 'Steaks & Ribs', 'Filipino Dishes'],
  },
  {
    id: '31',
    name: 'Chaya',
    type: 'Restaurant',
    description:
      "A relaxed Japanese restaurant with fresh sashimi (including uni and tamago)—great for when you're craving authentic Japanese fare.",
    hours: '11:00 AM - 9:00 PM',
    rating: 4.6,
    amenities: ['Japanese Cuisine', 'Fresh Sashimi', 'Authentic', 'Relaxed Atmosphere'],
  },
  {
    id: '32',
    name: 'Balajadia Kitchenette',
    type: 'Restaurant',
    description:
      'Offers homey Cordilleran and Ilocano home-style eats in a carinderia setting—simple, comforting, and local.',
    hours: '7:00 AM - 8:00 PM',
    rating: 4.1,
    amenities: ['Local Cuisine', 'Cordilleran Food', 'Home-style Cooking', 'Budget-Friendly'],
  },
  {
    id: '33',
    name: "50's Diner Baguio",
    type: 'Restaurant',
    description:
      'Nostalgic roller-skating-themed diner serving burgers, shakes (think strawberry or vanilla), sandwiches, and more.',
    hours: '10:00 AM - 10:00 PM',
    rating: 4.3,
    amenities: ['American Diner', 'Nostalgic Theme', 'Burgers & Shakes', 'Retro Atmosphere'],
  },
  {
    id: '34',
    name: 'The Manor at Camp John Hay',
    type: 'Hotel',
    description:
      'Iconic in Baguio, this lodge-style hotel is nestled among pine trees and offers a cozy, nostalgic vibe perfect for families or couples.',
    hours: '24 hours',
    rating: 4.6,
    priceRange: '$90-$100/night',
    amenities: ['Lodge-style', 'Pine Trees', 'Family-friendly', 'Nostalgic Vibe'],
  },
  {
    id: '35',
    name: 'The Forest Lodge at Camp John Hay',
    type: 'Hotel',
    description: 'Peaceful and modern design, ideal for visitors seeking a tranquil retreat.',
    hours: '24 hours',
    rating: 4.4,
    priceRange: '~$77/night',
    amenities: ['Modern Design', 'Peaceful', 'Tranquil Retreat', 'Forest Setting'],
  },
  {
    id: '36',
    name: 'Sotogrande Hotel Baguio',
    type: 'Hotel',
    description:
      'Modern architecture, spacious and stylish rooms, excellent buffet breakfast and bar drinks.',
    hours: '24 hours',
    rating: 4.6,
    priceRange: 'Mid-range',
    amenities: ['Modern Architecture', 'Spacious Rooms', 'Buffet Breakfast', 'Bar'],
  },
  {
    id: '37',
    name: 'Microtel by Wyndham Baguio',
    type: 'Hotel',
    description:
      'Budget-friendly without compromising comfort—great for families and value-seekers.',
    hours: '24 hours',
    rating: 4.3,
    priceRange: '~$50/night',
    amenities: ['Budget-Friendly', 'Family-Friendly', 'Value for Money', 'Comfortable'],
  },
  {
    id: '38',
    name: 'Hotel Elizabeth Baguio',
    type: 'Hotel',
    description:
      'Centrally located, modern and reliable—excellent for easy access to top spots.',
    hours: '24 hours',
    rating: 4.1,
    priceRange: '$45-$55/night',
    amenities: ['Central Location', 'Modern', 'Easy Access', 'Reliable Service'],
  },
  {
    id: '39',
    name: 'G1 Lodge Design Hotel',
    type: 'Hotel',
    description:
      'Architecturally striking with convenience—close to Mines View Park and Botanical Garden.',
    hours: '24 hours',
    rating: 4.2,
    priceRange: '₱3,000/night',
    amenities: ['Design Hotel', 'Striking Architecture', 'Near Attractions', 'Convenient Location'],
  },
  {
    id: '40',
    name: 'Grand Sierra Pines Hotel',
    type: 'Hotel',
    description: 'Located in a quieter side of town, with a restful, generous setup.',
    hours: '24 hours',
    rating: 4.0,
    priceRange: 'Mid-range',
    amenities: ['Quiet Location', 'Restful', 'Generous Setup', 'Pine Trees'],
  },
  {
    id: '41',
    name: 'Kamiseta Hotel',
    type: 'Hotel',
    description: 'Instagram-worthy interiors and themed rooms—stylish and modern.',
    hours: '24 hours',
    rating: 4.3,
    priceRange: 'Mid-range',
    amenities: ['Instagram-worthy', 'Themed Rooms', 'Stylish', 'Modern Design'],
  },
  {
    id: '42',
    name: 'Casa Vallejo',
    type: 'Hotel',
    description:
      "Baguio's oldest hotel (since 1923), rich in heritage and charm, located on Upper Session Road.",
    hours: '24 hours',
    rating: 4.4,
    priceRange: 'Historic rates',
    amenities: ['Historic (1923)', 'Heritage', 'Charm', 'Upper Session Road'],
  },
  {
    id: '43',
    name: 'Maharlika Livelihood Center',
    type: 'Shopping',
    description:
      'A livelihood complex featuring folk art, handicrafts, and woven textiles—perfect for handmade and cultural items.',
    hours: '9:00 AM - 6:00 PM',
    rating: 4.0,
    amenities: ['Folk Art', 'Handicrafts', 'Woven Textiles', 'Cultural Items'],
  },
  {
    id: '44',
    name: 'Session Road Sunday Market',
    type: 'Shopping',
    description:
      'On Sundays, Session Road transforms into a lively street market with vendors offering artisanal goods, books, snacks, crafts, and unique souvenirs.',
    hours: 'Sundays only, 8:00 AM - 6:00 PM',
    rating: 4.3,
    amenities: [
      'Sunday Market',
      'Artisanal Goods',
      'Books',
      'Street Food',
      'Unique Souvenirs',
    ],
  },
  {
    id: '45',
    name: 'Harrison Road Night Market',
    type: 'Shopping',
    description:
      "Evening strolls here lead to discovering quirky knickknacks, shirts, mugs with Baguio-themed designs, and budget-friendly local products.",
    hours: '6:00 PM - 11:00 PM',
    rating: 3.9,
    amenities: [
      'Night Market',
      'Quirky Items',
      'Baguio-themed Products',
      'Budget-friendly',
    ],
  },
  {
    id: '46',
    name: 'Easter Weaving, Inc.',
    type: 'Shopping',
    description:
      'Specializing in woven apparel and fabrics, showcasing traditional Filipino weaving techniques and modern designs.',
    hours: '9:00 AM - 6:00 PM',
    rating: 4.1,
    amenities: ['Woven Apparel', 'Traditional Fabrics', 'Filipino Weaving', 'Modern Designs'],
  },
  {
    id: '47',
    name: 'Mt. Cloud Bookshop',
    type: 'Shopping',
    description:
      'A cozy bookshop featuring local reads, literary finds, and books about Philippine culture and history.',
    hours: '9:00 AM - 7:00 PM',
    rating: 4.4,
    amenities: ['Local Books', 'Literary Finds', 'Philippine Culture', 'Cozy Atmosphere'],
  },
  {
    id: '48',
    name: "Redzel's Baguio",
    type: 'Shopping',
    description:
      'Known for their delicious ube halaya and other traditional Filipino sweets and delicacies.',
    hours: '8:00 AM - 8:00 PM',
    rating: 4.2,
    amenities: ['Ube Halaya', 'Filipino Sweets', 'Traditional Delicacies', 'Local Specialties'],
  },
  {
    id: '49',
    name: 'Shell – Abanao Road',
    type: 'Gas Station',
    description:
      'A full-service Shell outlet located near Burnham Park—ideal for topping up before or after visiting the city center. Features include a Select convenience store, car wash, and restrooms.',
    hours: '24 hours',
    rating: 4.2,
    amenities: ['Full Service', 'Select Store', 'Car Wash', 'Restrooms', 'Near Burnham Park'],
  },
  {
    id: '50',
    name: 'Shell – Marcos Highway (KM 4)',
    type: 'Gas Station',
    description:
      'Conveniently located along Marcos Highway at around KM 4, this Shell station is accessible on the main route into or out of the city.',
    hours: '24 hours',
    rating: 4.1,
    amenities: ['Highway Location', 'Main Route Access', 'Convenient', '24/7 Service'],
  },
  {
    id: '51',
    name: 'Caltex – Brower Road',
    type: 'Gas Station',
    description:
      "Situated near the Grand Mosque, this Caltex station is well-placed for those traveling around the city's northern or central areas.",
    hours: '24 hours',
    rating: 4.0,
    amenities: ['Near Grand Mosque', 'Northern Area', 'Central Location', 'Well-placed'],
  },
  {
    id: '52',
    name: 'Caltex – Chanum Street',
    type: 'Gas Station',
    description:
      "Right across from Igorot Garden and Burnham Park—that makes it a handy stop if you're touring downtown Baguio.",
    hours: '24 hours',
    rating: 4.3,
    amenities: ['Near Igorot Garden', 'Near Burnham Park', 'Downtown Location', 'Tourist Area'],
  },
  {
    id: '53',
    name: 'Petron – Worcester Road',
    type: 'Gas Station',
    description:
      "Located close to Pine Trees of the World Park, this Petron station is a practical pit stop when you're passing through the eastern side of the city.",
    hours: '24 hours',
    rating: 4.1,
    amenities: ['Near Pine Trees Park', 'Eastern Side', 'Practical Stop', 'Convenient Location'],
  },
  {
    id: '54',
    name: 'JCQ Gas Station – Kennon Road',
    type: 'Gas Station',
    description:
      "Found along the Kennon Road route and visible on Waze—it's especially convenient for travelers coming from or heading toward La Union and lowland provinces.",
    hours: '24 hours',
    rating: 3.9,
    amenities: ['Kennon Road', 'Waze Visible', 'La Union Route', 'Lowland Access'],
  },
];

// Merge coordinates by name (exact match with keys in poi_coords.ts)
export const mockPOIs: POI[] = basePOIs.map((p) => {
  const hit = poiCoords[p.name];
  return hit ? { ...p, lat: hit.lat, lng: hit.lng } : p;
});
