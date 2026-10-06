/* Creative Wing Investments — product data
   Edit names, prices, stock here. Prices in USD. Set inStock:false to mark sold-out.
*/

const WHATSAPP_NUMBER = "263785783150"; // international format, no '+'
const PHONE_NUMBER = "077 441 1867";
const EMAIL_ADDRESS = "info@creativewinginvestments.co.zw";
const BUSINESS_NAME = "Creative Wing Investments";
const LOCATION = "Harare, Zimbabwe";

const DEFAULT_CARS = [
  { 
    id:"C00", 
    name:"Toyota Hilux Travo 2.8 GD-6 4x4", 
    price:42500, 
    year:2024, 
    mileage:"1,200 km (Delivery)", 
    transmission:"Automatic", 
    fuel:"Diesel", 
    body:"Pickup", 
    color:"Battleship Grey", 
    inStock:true, 
    image:"images/cars/travo-front-34.jpeg",
    gallery: [
      "images/cars/travo-front.jpeg",
      "images/cars/travo-front-34.jpeg",
      "images/cars/travo-rear.jpeg",
      "images/cars/travo-side-rear.jpeg",
      "images/cars/travo-tailgate.jpeg",
      "images/cars/travo-cockpit.jpeg",
      "images/cars/travo-console.jpeg",
      "images/cars/travo-cabin.jpeg",
      "images/cars/travo-steering.jpeg"
    ]
  },
  { id:"C01", name:"Toyota Auris Hatchback", price:8500, year:2014, mileage:"118,000 km", transmission:"Automatic", fuel:"Petrol", body:"Hatchback", color:"Maroon", inStock:true, image:"images/cars/01.jpeg" },
  { id:"C02", name:"Toyota Sedan Executive", price:9200, year:2013, mileage:"135,000 km", transmission:"Automatic", fuel:"Petrol", body:"Sedan", color:"Silver", inStock:true, image:"images/cars/02.jpeg" },
  { id:"C03", name:"Honda Fit Compact", price:6800, year:2012, mileage:"142,000 km", transmission:"Automatic", fuel:"Petrol", body:"Hatchback", color:"White", inStock:true, image:"images/cars/03.jpeg" },
  { id:"C04", name:"Mazda Demio Sport", price:6500, year:2013, mileage:"128,000 km", transmission:"Automatic", fuel:"Petrol", body:"Hatchback", color:"Red", inStock:true, image:"images/cars/04.jpeg" },
  { id:"C05", name:"Nissan AD Wagon", price:7200, year:2014, mileage:"110,000 km", transmission:"Automatic", fuel:"Petrol", body:"Wagon", color:"White", inStock:true, image:"images/cars/05.jpeg" },
  { id:"C06", name:"Toyota Corolla Sedan", price:9800, year:2015, mileage:"95,000 km", transmission:"Automatic", fuel:"Petrol", body:"Sedan", color:"Pearl White", inStock:true, image:"images/cars/06.jpeg" },
  { id:"C07", name:"Mercedes-Benz A-Class Sport", price:16800, year:2016, mileage:"88,000 km", transmission:"Automatic", fuel:"Petrol", body:"Hatchback", color:"Jupiter Red", inStock:true, image:"images/cars/07.jpeg" },
  { id:"C08", name:"GWM P-Series Commercial Pickup", price:19500, year:2021, mileage:"62,000 km", transmission:"Automatic", fuel:"Diesel", body:"Pickup", color:"Royal Blue", inStock:true, image:"images/cars/08.jpeg" },
  { id:"C09", name:"Mazda Axela Touring", price:9400, year:2014, mileage:"125,000 km", transmission:"Automatic", fuel:"Petrol", body:"Sedan", color:"Grey", inStock:true, image:"images/cars/09.jpeg" },
  { id:"C10", name:"Nissan Tiida Latio", price:7800, year:2013, mileage:"132,000 km", transmission:"Automatic", fuel:"Petrol", body:"Sedan", color:"Champagne", inStock:true, image:"images/cars/10.jpeg" },
  { id:"C11", name:"Toyota Wish MPV", price:11200, year:2014, mileage:"138,000 km", transmission:"Automatic", fuel:"Petrol", body:"MPV", color:"Pearl", inStock:true, image:"images/cars/11.jpeg" },
  { id:"C12", name:"Honda Stream RSZ", price:8900, year:2013, mileage:"140,000 km", transmission:"Automatic", fuel:"Petrol", body:"MPV", color:"Black", inStock:true, image:"images/cars/12.jpeg" },
  { id:"C13", name:"Toyota Spacio Family", price:7600, year:2012, mileage:"152,000 km", transmission:"Automatic", fuel:"Petrol", body:"MPV", color:"Silver", inStock:true, image:"images/cars/13.jpeg" },
  { id:"C14", name:"Toyota Premio Luxury", price:12500, year:2015, mileage:"98,000 km", transmission:"Automatic", fuel:"Petrol", body:"Sedan", color:"Pearl White", inStock:true, image:"images/cars/14.jpeg" },
  { id:"C15", name:"Mazda CX-5 SUV", price:14800, year:2014, mileage:"115,000 km", transmission:"Automatic", fuel:"Petrol", body:"SUV", color:"Soul Red", inStock:true, image:"images/cars/15.jpeg" },
  { id:"C16", name:"Nissan X-Trail SUV", price:13200, year:2013, mileage:"130,000 km", transmission:"Automatic", fuel:"Petrol", body:"SUV", color:"Black", inStock:true, image:"images/cars/16.jpeg" },
  { id:"C17", name:"Honda Vezel Hybrid", price:13800, year:2015, mileage:"105,000 km", transmission:"Automatic", fuel:"Hybrid", body:"SUV", color:"White Pearl", inStock:true, image:"images/cars/17.jpeg" },
  { id:"C18", name:"Toyota RAV4 SUV", price:15500, year:2014, mileage:"120,000 km", transmission:"Automatic", fuel:"Petrol", body:"SUV", color:"Bronze", inStock:true, image:"images/cars/18.jpeg" }
];

const DEFAULT_SPORTSWEAR = [
  { id:"S01", name:"Yellow Chevron Pro Match Set", price:25, category:"Match Set", inStock:true, image:"images/sportswear/01.jpeg" },
  { id:"S02", name:"Royal Blue Pro Kit", price:28, category:"Match Set", inStock:true, image:"images/sportswear/02.jpeg" },
  { id:"S03", name:"Crimson Striker Match Kit", price:25, category:"Match Set", inStock:true, image:"images/sportswear/03.jpeg" },
  { id:"S04", name:"Flame Red Goalkeeper Pro Kit", price:30, category:"Goalkeeper", inStock:true, image:"images/sportswear/04.jpeg" },
  { id:"S05", name:"Sky Blue Goalkeeper Match Kit", price:30, category:"Goalkeeper", inStock:true, image:"images/sportswear/05.jpeg" },
  { id:"S06", name:"Shumba 14 Electric Basketball Jersey", price:26, category:"Basketball", inStock:true, image:"images/sportswear/06.jpeg" },
  { id:"S07", name:"Neon Volt Goalkeeper Kit", price:30, category:"Goalkeeper", inStock:true, image:"images/sportswear/07.jpeg" },
  { id:"S08", name:"Royal Blue Striped Squad Kit", price:26, category:"Match Set", inStock:true, image:"images/sportswear/08.jpeg" },
  { id:"S09", name:"White & Gold Elite Match Set", price:28, category:"Match Set", inStock:true, image:"images/sportswear/09.jpeg" },
  { id:"S10", name:"Forest Green Tournament Kit", price:26, category:"Match Set", inStock:true, image:"images/sportswear/10.jpeg" },
  { id:"S11", name:"Navy Captain League Kit", price:27, category:"Match Set", inStock:true, image:"images/sportswear/11.jpeg" },
  { id:"S12", name:"Black & Gold Stealth Pro Kit", price:28, category:"Match Set", inStock:true, image:"images/sportswear/12.jpeg" },
  { id:"S13", name:"Burgundy Aurum League Set", price:28, category:"Match Set", inStock:true, image:"images/sportswear/13.jpeg" },
  { id:"S14", name:"Teal Velocity Speed Kit", price:26, category:"Match Set", inStock:true, image:"images/sportswear/14.jpeg" },
  { id:"S15", name:"Volt Orange Energy Match Set", price:26, category:"Match Set", inStock:true, image:"images/sportswear/15.jpeg" },
  { id:"S16", name:"Imperial Gold Championship Set", price:30, category:"Match Set", inStock:true, image:"images/sportswear/16.jpeg" },
  { id:"S17", name:"Cybernetics Aqua Match Set", price:26, category:"Match Set", inStock:true, image:"images/sportswear/17.jpeg" },
  { id:"S18", name:"Royal Blue Squad Kit (Alt)", price:25, category:"Match Set", inStock:true, image:"images/sportswear/18.jpeg" },
  { id:"S19", name:"Pro Blue Match Kit (Alt)", price:26, category:"Match Set", inStock:true, image:"images/sportswear/19.jpeg" },
  { id:"S20", name:"Yellow Chevron Training Kit", price:25, category:"Match Set", inStock:true, image:"images/sportswear/20.jpeg" }
];

// All sportswear sets include jersey + shorts, sizes S–XXL on request.
const SPORTSWEAR_SIZES = ["S","M","L","XL","XXL"];

let CARS = (function() {
  try {
    const ver = localStorage.getItem("CWI_DATA_VERSION");
    if (ver !== "v6_travo") {
      localStorage.setItem("CWI_DATA_VERSION", "v6_travo");
      localStorage.setItem("CWI_CARS", JSON.stringify(DEFAULT_CARS));
      localStorage.setItem("CWI_SPORTSWEAR", JSON.stringify(DEFAULT_SPORTSWEAR));
      return DEFAULT_CARS;
    }
    const s = localStorage.getItem("CWI_CARS");
    if (s) return JSON.parse(s);
  } catch(e) {}
  return DEFAULT_CARS;
})();

let SPORTSWEAR = (function() {
  try {
    const ver = localStorage.getItem("CWI_DATA_VERSION");
    if (ver === "v6_travo") {
      const s = localStorage.getItem("CWI_SPORTSWEAR");
      if (s) return JSON.parse(s);
    }
  } catch(e) {}
  return DEFAULT_SPORTSWEAR;
})();

