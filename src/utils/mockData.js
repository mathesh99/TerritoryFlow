// Mock Data representing a realistic Navadhan Rural/Semi-Urban Lending Branch shifted to Mumbai, Maharashtra
// Scaled to 10 Sales Officers and 80 Customers to demonstrate routing solver efficiency at scale

const LAT_SHIFT = 1.3955; // Satara (17.6805) to Mumbai (19.0760)
const LNG_SHIFT = -1.1141; // Satara (73.9918) to Mumbai (72.8777)

const RAW_BRANCH_INFO = {
  name: "AceN Mumbai Branch",
  manager: "Vikram Salunkhe",
  state: "Maharashtra",
  district: "Mumbai Suburban",
  lat: 17.6805,
  lng: 73.9918,
  coverageRadiusKm: 12,
  address: "Linking Road, Bandra West, Mumbai 400050"
};

const RAW_SALES_OFFICERS = [
  {
    id: "so-1",
    name: "Rahul Shinde",
    initials: "RS",
    color: "#4f46e5", // Indigo
    phone: "+91 98231 44521",
    vehicle: "Hero Splendor (MH-02-CF-3042)",
    efficiency: "94%",
    active: true,
    initialLat: 17.6825,
    initialLng: 73.9930
  },
  {
    id: "so-2",
    name: "Priya Patil",
    initials: "PP",
    color: "#db2777", // Magenta
    phone: "+91 95452 77810",
    vehicle: "Honda Activa (MH-02-DJ-9871)",
    efficiency: "96%",
    active: true,
    initialLat: 17.6785,
    initialLng: 73.9900
  },
  {
    id: "so-3",
    name: "Amit Deshmukh",
    initials: "AD",
    color: "#854d0e", // Brown
    phone: "+91 91580 33425",
    vehicle: "Bajaj Pulsar 150 (MH-02-ES-1205)",
    efficiency: "88%",
    active: true,
    initialLat: 17.6815,
    initialLng: 73.9950
  },
  {
    id: "so-4",
    name: "Savita Kamble",
    initials: "SK",
    color: "#d97706", // Gold
    phone: "+91 88884 11209",
    vehicle: "TVS XL100 (MH-02-FL-5582)",
    efficiency: "91%",
    active: true,
    initialLat: 17.6765,
    initialLng: 73.9880
  },
  {
    id: "so-5",
    name: "Vikram Jadhav",
    initials: "VJ",
    color: "#0891b2", // Cyan
    phone: "+91 90901 22334",
    vehicle: "TVS Apache (MH-02-GP-1122)",
    efficiency: "92%",
    active: true,
    initialLat: 17.7005,
    initialLng: 74.0118
  },
  {
    id: "so-6",
    name: "Deepali Pawar",
    initials: "DP",
    color: "#a855f7", // Violet
    phone: "+91 81812 33445",
    vehicle: "Suzuki Access (MH-02-HR-4455)",
    efficiency: "95%",
    active: true,
    initialLat: 17.6605,
    initialLng: 73.9718
  },
  {
    id: "so-7",
    name: "Manoj Patil",
    initials: "MP",
    color: "#ea580c", // Orange
    phone: "+91 98901 88990",
    vehicle: "TVS Jupiter (MH-02-JK-9911)",
    efficiency: "93%",
    active: true,
    initialLat: 17.6950,
    initialLng: 74.0250
  },
  {
    id: "so-8",
    name: "Shweta Kadam",
    initials: "SK",
    color: "#0ea5e9", // Sky Blue
    phone: "+91 95450 11225",
    vehicle: "Honda Activa 6G (MH-02-LM-8822)",
    efficiency: "91%",
    active: true,
    initialLat: 17.6550,
    initialLng: 73.9550
  },
  {
    id: "so-9",
    name: "Sachin Sawant",
    initials: "SS",
    color: "#eab308", // Yellow
    phone: "+91 91580 33447",
    vehicle: "Bajaj Platina (MH-02-NO-7733)",
    efficiency: "89%",
    active: true,
    initialLat: 17.7150,
    initialLng: 74.0050
  },
  {
    id: "so-10",
    name: "Snehal Bhosale",
    initials: "SB",
    color: "#881337", // Burgundy
    phone: "+91 88884 11229",
    vehicle: "Yamaha Fascino (MH-02-PQ-6644)",
    efficiency: "94%",
    active: true,
    initialLat: 17.6450,
    initialLng: 74.0150
  }
];

// 80 Customers shifted geographically to Mumbai
const RAW_CUSTOMERS = [
  // --- North Sector: Bandra North / Khar ---
  {
    id: "cust-1",
    name: "Balasaheb Pawar",
    village: "Khar Danda",
    lat: 17.7085,
    lng: 73.9850,
    loanType: "Kisan Credit Card (KCC)",
    amount: "₹1,50,000",
    phone: "+91 98220 12345",
    status: "Pending"
  },
  {
    id: "cust-2",
    name: "Sunita Jadhav",
    village: "Khar Danda",
    lat: 17.7120,
    lng: 73.9890,
    loanType: "MSME Business Loan",
    amount: "₹2,00,000",
    phone: "+91 99600 54321",
    status: "Pending"
  },
  {
    id: "cust-3",
    name: "Tukaram Shinde",
    village: "Santacruz West",
    lat: 17.7210,
    lng: 74.0150,
    loanType: "Dairy Farming Loan",
    amount: "₹1,20,000",
    phone: "+91 94220 98765",
    status: "Pending"
  },
  {
    id: "cust-4",
    name: "Anjali Bhosale",
    village: "Santacruz West",
    lat: 17.7245,
    lng: 74.0110,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 98811 22334",
    status: "Pending"
  },
  {
    id: "cust-5",
    name: "Vitthal Jagtap",
    village: "Juhu Lane",
    lat: 17.7550,
    lng: 73.9780,
    loanType: "Tractor Finance",
    amount: "₹4,50,000",
    phone: "+91 95522 33445",
    status: "Pending"
  },
  {
    id: "cust-6",
    name: "Rukminibai Patil",
    village: "Juhu Lane",
    lat: 17.7590,
    lng: 73.9730,
    loanType: "Micro-finance Group Loan",
    amount: "₹60,000",
    phone: "+91 97633 44556",
    status: "Pending"
  },
  {
    id: "cust-7",
    name: "Dynaneshwar More",
    village: "Khar Danda",
    lat: 17.7030,
    lng: 73.9810,
    loanType: "Gold Loan",
    amount: "₹80,000",
    phone: "+91 91460 55667",
    status: "Pending"
  },

  // --- East Sector: Kurla / Mahim East ---
  {
    id: "cust-8",
    name: "Sanjay Mane",
    village: "Kurla West",
    lat: 17.6840,
    lng: 74.0310,
    loanType: "Poultry Farm Expansion",
    amount: "₹1,80,000",
    phone: "+91 98901 66778",
    status: "Pending"
  },
  {
    id: "cust-9",
    name: "Surekha Ghorpade",
    village: "Kurla West",
    lat: 17.6890,
    lng: 74.0370,
    loanType: "Micro-finance Group Loan",
    amount: "₹45,000",
    phone: "+91 98224 77889",
    status: "Pending"
  },
  {
    id: "cust-10",
    name: "Hanmant Sawant",
    village: "Chunabhatti",
    lat: 17.6795,
    lng: 74.0410,
    loanType: "Kisan Credit Card (KCC)",
    amount: "₹1,10,000",
    phone: "+91 90112 88990",
    status: "Pending"
  },
  {
    id: "cust-11",
    name: "Pooja Nalawade",
    village: "Chunabhatti",
    lat: 17.6750,
    lng: 74.0340,
    loanType: "Kirana Shop Loan",
    amount: "₹90,000",
    phone: "+91 91724 99001",
    status: "Pending"
  },

  // --- South Sector: Dadar / Mahim ---
  {
    id: "cust-12",
    name: "Ramchandra Kadam",
    village: "Dadar West",
    lat: 17.6530,
    lng: 73.9990,
    loanType: "Sugarcane Drip Irrigation",
    amount: "₹2,50,000",
    phone: "+91 95450 11223",
    status: "Pending"
  },
  {
    id: "cust-13",
    name: "Meena Nikam",
    village: "Dadar West",
    lat: 17.6490,
    lng: 74.0040,
    loanType: "Sartorial/Boutique Loan",
    amount: "₹75,000",
    phone: "+91 91300 22334",
    status: "Pending"
  },
  {
    id: "cust-14",
    name: "Arjun Pisal",
    village: "Prabhadevi",
    lat: 17.6410,
    lng: 73.9920,
    loanType: "Fertilizer Depot Loan",
    amount: "₹3,00,000",
    phone: "+91 98600 33445",
    status: "Pending"
  },
  {
    id: "cust-15",
    name: "Shobha Dhumal",
    village: "Prabhadevi",
    lat: 17.6575,
    lng: 73.9950,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 96044 44556",
    status: "Pending"
  },
  {
    id: "cust-16",
    name: "Nivruti Mohite",
    village: "Worli Koliwada",
    lat: 17.6320,
    lng: 74.0020,
    loanType: "Well Digging Loan",
    amount: "₹1,40,000",
    phone: "+91 97300 55667",
    status: "Pending"
  },

  // --- West Sector: Bandra West / Carter Road ---
  {
    id: "cust-17",
    name: "Dattatray Salunkhe",
    village: "Carter Road",
    lat: 17.6960,
    lng: 73.9570,
    loanType: "Milking Machine Finance",
    amount: "₹1,30,000",
    phone: "+91 98500 66778",
    status: "Pending"
  },
  {
    id: "cust-18",
    name: "Sangeeta Yadav",
    village: "Pali Hill",
    lat: 17.6910,
    lng: 73.9620,
    loanType: "Flour Mill Loan",
    amount: "₹85,000",
    phone: "+91 99230 77889",
    status: "Pending"
  },
  {
    id: "cust-19",
    name: "Kashinath Gole",
    village: "Carter Road",
    lat: 17.7010,
    lng: 73.9520,
    loanType: "Vegetable Retail Vendor",
    amount: "₹40,000",
    phone: "+91 90211 88990",
    status: "Pending"
  },
  {
    id: "cust-20",
    name: "Mandakini Kadam",
    village: "Pali Hill",
    lat: 17.6875,
    lng: 73.9590,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 91560 99001",
    status: "Pending"
  },

  // --- Central/Suburban: Bandra East / Kalanagar ---
  {
    id: "cust-21",
    name: "Prakash Deshmukh",
    village: "Bandra East",
    lat: 17.6770,
    lng: 73.9840,
    loanType: "Hardware Store Capital",
    amount: "₹2,50,000",
    phone: "+91 98810 11224",
    status: "Pending"
  },
  {
    id: "cust-22",
    name: "Latabai Shinde",
    village: "Bandra East",
    lat: 17.6740,
    lng: 73.9810, 
    loanType: "Tailoring Shop",
    amount: "₹60,000",
    phone: "+91 99700 22335",
    status: "Pending"
  },
  {
    id: "cust-23",
    name: "Rajesh Gaikwad",
    village: "Kala Nagar",
    lat: 17.6690,
    lng: 73.9870,
    loanType: "Auto Rickshaw Finance",
    amount: "₹2,20,000",
    phone: "+91 91580 33446",
    status: "Pending"
  },
  {
    id: "cust-24",
    name: "Asha Pawar",
    village: "Kala Nagar",
    lat: 17.6650,
    lng: 73.9920,
    loanType: "Micro-finance Group Loan",
    amount: "₹55,000",
    phone: "+91 94230 44557",
    status: "Pending"
  },

  // --- Outlying Villages: Uncovered / Low Coverage in Manual Mode ---
  {
    id: "cust-25",
    name: "Namdev Chavan",
    village: "Versova Village",
    lat: 17.7280,
    lng: 73.9480, 
    loanType: "Mango Orchard Farming",
    amount: "₹2,80,000",
    phone: "+91 98225 55668",
    status: "Pending"
  },
  {
    id: "cust-26",
    name: "Shalini Patil",
    village: "Versova Village",
    lat: 17.7310,
    lng: 73.9510,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 98903 66779",
    status: "Pending"
  },
  {
    id: "cust-27",
    name: "Pandurang Shelar",
    village: "Chembur Naka",
    lat: 17.6250,
    lng: 74.0320, 
    loanType: "Polyhouse Agriculture",
    amount: "₹3,50,000",
    phone: "+91 90114 77880",
    status: "Pending"
  },
  {
    id: "cust-28",
    name: "Kaushalyabai More",
    village: "Chembur Naka",
    lat: 17.6220,
    lng: 74.0360,
    loanType: "Micro-finance Group Loan",
    amount: "₹45,000",
    phone: "+91 91728 88991",
    status: "Pending"
  },
  {
    id: "cust-29",
    name: "Baburao Kalbhor",
    village: "Ghatkopar East",
    lat: 17.7510,
    lng: 74.0380, 
    loanType: "Fodder Cutter Machine",
    amount: "₹95,000",
    phone: "+91 98506 99002",
    status: "Pending"
  },
  {
    id: "cust-30",
    name: "Ranjana Deshmane",
    village: "Ghatkopar East",
    lat: 17.7540,
    lng: 74.0410,
    loanType: "Dairy Business Loan",
    amount: "₹1,50,000",
    phone: "+91 99238 11225",
    status: "Pending"
  },
  {
    id: "cust-31",
    name: "Sambhaji Koli",
    village: "Madh Island",
    lat: 17.6850,
    lng: 73.9450, 
    loanType: "Borewell Pump Installation",
    amount: "₹1,25,000",
    phone: "+91 99602 22336",
    status: "Pending"
  },
  {
    id: "cust-32",
    name: "Sindhutai Sapkal",
    village: "Madh Island",
    lat: 17.6890,
    lng: 73.9420,
    loanType: "Poultry Farming",
    amount: "₹80,000",
    phone: "+91 98814 33447",
    status: "Pending"
  },

  // --- CUSTOMERS (33 to 50) ---
  {
    id: "cust-33",
    name: "Ganesh Gaikwad",
    village: "Sion East",
    lat: 17.6710,
    lng: 74.0120,
    loanType: "Hardware Shop Expansion",
    amount: "₹2,20,000",
    phone: "+91 90291 11223",
    status: "Pending"
  },
  {
    id: "cust-34",
    name: "Shila Kadam",
    village: "Sion East",
    lat: 17.6680,
    lng: 74.0150,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 91672 22334",
    status: "Pending"
  },
  {
    id: "cust-35",
    name: "Nitin Kamble",
    village: "Vile Parle West",
    lat: 17.7120,
    lng: 73.9620,
    loanType: "Photoshop & Xerox Capital",
    amount: "₹80,000",
    phone: "+91 98193 33445",
    status: "Pending"
  },
  {
    id: "cust-36",
    name: "Komal Jagtap",
    village: "Vile Parle West",
    lat: 17.7090,
    lng: 73.9590,
    loanType: "Boutique Loan",
    amount: "₹1,20,000",
    phone: "+91 99304 44556",
    status: "Pending"
  },
  {
    id: "cust-37",
    name: "Vinayak Pawar",
    village: "Andheri East",
    lat: 17.7320,
    lng: 73.9850,
    loanType: "Vegetable Delivery Van",
    amount: "₹3,50,000",
    phone: "+91 98205 55667",
    status: "Pending"
  },
  {
    id: "cust-38",
    name: "Lalita More",
    village: "Andheri East",
    lat: 17.7350,
    lng: 73.9880,
    loanType: "Kirana Shop Stock",
    amount: "₹75,000",
    phone: "+91 97696 66778",
    status: "Pending"
  },
  {
    id: "cust-39",
    name: "Ramesh Patil",
    village: "Ghatkopar West",
    lat: 17.7150,
    lng: 74.0250,
    loanType: "MSME Machinery Finance",
    amount: "₹4,00,000",
    phone: "+91 99207 77889",
    status: "Pending"
  },
  {
    id: "cust-40",
    name: "Jyoti Bhosale",
    village: "Ghatkopar West",
    lat: 17.7180,
    lng: 74.0280,
    loanType: "Micro-finance Group Loan",
    amount: "₹60,000",
    phone: "+91 98678 88990",
    status: "Pending"
  },
  {
    id: "cust-41",
    name: "Vijay Shinde",
    village: "Chembur West",
    lat: 17.6350,
    lng: 74.0150,
    loanType: "Dairy Supply Bike",
    amount: "₹95,000",
    phone: "+91 91529 99001",
    status: "Pending"
  },
  {
    id: "cust-42",
    name: "Sarika Jadhav",
    village: "Chembur West",
    lat: 17.6320,
    lng: 74.0120,
    loanType: "Tailoring Capital",
    amount: "₹50,000",
    phone: "+91 91361 00112",
    status: "Pending"
  },
  {
    id: "cust-43",
    name: "Sandeep Mane",
    village: "Mahim West",
    lat: 17.6580,
    lng: 73.9820,
    loanType: "Auto Garage Capital",
    amount: "₹1,80,000",
    phone: "+91 98212 11223",
    status: "Pending"
  },
  {
    id: "cust-44",
    name: "Ujjwala Patil",
    village: "Mahim West",
    lat: 17.6550,
    lng: 73.9790,
    loanType: "Micro-finance Group Loan",
    amount: "₹45,000",
    phone: "+91 98334 22334",
    status: "Pending"
  },
  {
    id: "cust-45",
    name: "Abhijit Ghorpade",
    village: "Santacruz East",
    lat: 17.7010,
    lng: 74.0050,
    loanType: "Mobile Repair Shop",
    amount: "₹70,000",
    phone: "+91 90045 33445",
    status: "Pending"
  },
  {
    id: "cust-46",
    name: "Varsha Sawant",
    village: "Santacruz East",
    lat: 17.6980,
    lng: 74.0020,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 91676 44556",
    status: "Pending"
  },
  {
    id: "cust-47",
    name: "Ajit Nikam",
    village: "Dadar East",
    lat: 17.6480,
    lng: 74.0080,
    loanType: "KCC Agriculture Loan",
    amount: "₹1,50,000",
    phone: "+91 98927 55667",
    status: "Pending"
  },
  {
    id: "cust-48",
    name: "Vandana Pisal",
    village: "Dadar East",
    lat: 17.6450,
    lng: 74.0050,
    loanType: "Home Bakery Oven",
    amount: "₹65,000",
    phone: "+91 98198 66778",
    status: "Pending"
  },
  {
    id: "cust-49",
    name: "Yogesh Dhumal",
    village: "Bandra Reclamation",
    lat: 17.6890,
    lng: 73.9680,
    loanType: "Flower Retail Stall",
    amount: "₹40,000",
    phone: "+91 99209 77889",
    status: "Pending"
  },
  {
    id: "cust-50",
    name: "Pallavi Mohite",
    village: "Bandra Reclamation",
    lat: 17.6860,
    lng: 73.9650,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 98700 88990",
    status: "Pending"
  },

  // --- NEW CUSTOMERS (51 to 80) ---
  {
    id: "cust-51",
    name: "Madhuri Patil",
    village: "Khar West",
    lat: 17.7050,
    lng: 73.9820,
    loanType: "Beauty Parlor Capital",
    amount: "₹90,000",
    phone: "+91 99301 11223",
    status: "Pending"
  },
  {
    id: "cust-52",
    name: "Prashant Nikam",
    village: "Khar West",
    lat: 17.7020,
    lng: 73.9800,
    loanType: "Kirana Shop Stock",
    amount: "₹85,000",
    phone: "+91 98202 22334",
    status: "Pending"
  },
  {
    id: "cust-53",
    name: "Rupali Chavan",
    village: "Sion West",
    lat: 17.6650,
    lng: 74.0080,
    loanType: "Tailoring Shop Capital",
    amount: "₹55,000",
    phone: "+91 97693 33445",
    status: "Pending"
  },
  {
    id: "cust-54",
    name: "Siddharth Mane",
    village: "Sion West",
    lat: 17.6620,
    lng: 74.0050,
    loanType: "MSME Business Loan",
    amount: "₹2,50,000",
    phone: "+91 99204 44556",
    status: "Pending"
  },
  {
    id: "cust-55",
    name: "Kiran Jadhav",
    village: "Kurla East",
    lat: 17.6820,
    lng: 74.0250,
    loanType: "Dairy Supply Vehicles",
    amount: "₹3,00,000",
    phone: "+91 98675 55667",
    status: "Pending"
  },
  {
    id: "cust-56",
    name: "Sunil Patil",
    village: "Kurla East",
    lat: 17.6790,
    lng: 74.0220,
    loanType: "Poultry Farming Loan",
    amount: "₹1,20,000",
    phone: "+91 91526 66778",
    status: "Pending"
  },
  {
    id: "cust-57",
    name: "Nisha More",
    village: "Chembur East",
    lat: 17.6200,
    lng: 74.0280,
    loanType: "Gold Loan",
    amount: "₹75,000",
    phone: "+91 91367 77889",
    status: "Pending"
  },
  {
    id: "cust-58",
    name: "Prakash Kamble",
    village: "Chembur East",
    lat: 17.6180,
    lng: 74.0250,
    loanType: "Vegetable Retail Vendor",
    amount: "₹35,000",
    phone: "+91 98218 88990",
    status: "Pending"
  },
  {
    id: "cust-59",
    name: "Dipak Shinde",
    village: "Ghatkopar East",
    lat: 17.7480,
    lng: 74.0320,
    loanType: "Kirana Shop Setup",
    amount: "₹1,10,000",
    phone: "+91 98339 99001",
    status: "Pending"
  },
  {
    id: "cust-60",
    name: "Savita Bhosale",
    village: "Ghatkopar East",
    lat: 17.7450,
    lng: 74.0290,
    loanType: "Dairy Business Loan",
    amount: "₹1,40,000",
    phone: "+91 90041 00112",
    status: "Pending"
  },
  {
    id: "cust-61",
    name: "Mahesh Jagtap",
    village: "Santacruz East",
    lat: 17.7180,
    lng: 74.0080,
    loanType: "Auto Rickshaw Finance",
    amount: "₹2,00,000",
    phone: "+91 91672 11223",
    status: "Pending"
  },
  {
    id: "cust-62",
    name: "Deepa Pawar",
    village: "Santacruz East",
    lat: 17.7150,
    lng: 74.0050,
    loanType: "Tailoring Shop",
    amount: "₹65,000",
    phone: "+91 98923 22334",
    status: "Pending"
  },
  {
    id: "cust-63",
    name: "Sachin Gaikwad",
    village: "Dadar West",
    lat: 17.6510,
    lng: 73.9950,
    loanType: "Boutique Capital",
    amount: "₹95,000",
    phone: "+91 98194 33445",
    status: "Pending"
  },
  {
    id: "cust-64",
    name: "Swati Kadam",
    village: "Dadar West",
    lat: 17.6480,
    lng: 73.9920,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 99205 44556",
    status: "Pending"
  },
  {
    id: "cust-65",
    name: "Rajendra Sawant",
    village: "Prabhadevi",
    lat: 17.6390,
    lng: 73.9880,
    loanType: "Mango Farm Equipment",
    amount: "₹1,80,000",
    phone: "+91 98676 55667",
    status: "Pending"
  },
  {
    id: "cust-66",
    name: "Rani Deshmukh",
    village: "Prabhadevi",
    lat: 17.6360,
    lng: 73.9850,
    loanType: "Dairy Farm Expansion",
    amount: "₹1,50,000",
    phone: "+91 91527 66778",
    status: "Pending"
  },
  {
    id: "cust-67",
    name: "Vikas Mohite",
    village: "Worli",
    lat: 17.6280,
    lng: 73.9980,
    loanType: "Well Digging Capital",
    amount: "₹1,30,000",
    phone: "+91 91368 77889",
    status: "Pending"
  },
  {
    id: "cust-68",
    name: "Pragati Patil",
    village: "Worli",
    lat: 17.6250,
    lng: 73.9950,
    loanType: "Micro-finance Group Loan",
    amount: "₹45,000",
    phone: "+91 98219 88990",
    status: "Pending"
  },
  {
    id: "cust-69",
    name: "Aniket Salunkhe",
    village: "Bandra West",
    lat: 17.6920,
    lng: 73.9530,
    loanType: "Photoshop Xerox Capital",
    amount: "₹75,000",
    phone: "+91 98340 99001",
    status: "Pending"
  },
  {
    id: "cust-70",
    name: "Neha Gole",
    village: "Bandra West",
    lat: 17.6890,
    lng: 73.9500,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 90042 00112",
    status: "Pending"
  },
  {
    id: "cust-71",
    name: "Santosh Shinde",
    village: "Juhu West",
    lat: 17.7490,
    lng: 73.9680,
    loanType: "Flower Stall Capital",
    amount: "₹45,000",
    phone: "+91 91673 11223",
    status: "Pending"
  },
  {
    id: "cust-72",
    name: "Shital Patil",
    village: "Juhu West",
    lat: 17.7460,
    lng: 73.9650,
    loanType: "Milking Machine Finance",
    amount: "₹1,25,000",
    phone: "+91 98924 22334",
    status: "Pending"
  },
  {
    id: "cust-73",
    name: "Abhay Deshmukh",
    village: "Andheri West",
    lat: 17.7280,
    lng: 73.9920,
    loanType: "Dairy Business Loan",
    amount: "₹1,15,000",
    phone: "+91 98195 33445",
    status: "Pending"
  },
  {
    id: "cust-74",
    name: "Aparna Jadhav",
    village: "Andheri West",
    lat: 17.7250,
    lng: 73.9890,
    loanType: "Micro-finance Group Loan",
    amount: "₹50,000",
    phone: "+91 99206 44556",
    status: "Pending"
  },
  {
    id: "cust-75",
    name: "Sanjay Kamble",
    village: "Vile Parle West",
    lat: 17.7050,
    lng: 73.9550,
    loanType: "Garage Tool Purchase",
    amount: "₹85,000",
    phone: "+91 98677 55667",
    status: "Pending"
  },
  {
    id: "cust-76",
    name: "Seema Bhosale",
    village: "Vile Parle West",
    lat: 17.7020,
    lng: 73.9520,
    loanType: "MSME Business Loan",
    amount: "₹2,00,000",
    phone: "+91 91528 66778",
    status: "Pending"
  },
  {
    id: "cust-77",
    name: "Rajesh Patil",
    village: "Mahim West",
    lat: 17.6620,
    lng: 73.9750,
    loanType: "Hardware Shop Capital",
    amount: "₹1,60,000",
    phone: "+91 91369 77889",
    status: "Pending"
  },
  {
    id: "cust-78",
    name: "Anjali Mane",
    village: "Mahim West",
    lat: 17.6590,
    lng: 73.9720,
    loanType: "Micro-finance Group Loan",
    amount: "₹55,000",
    phone: "+91 98210 88990",
    status: "Pending"
  },
  {
    id: "cust-79",
    name: "Sudhir Pawar",
    village: "Bandra East",
    lat: 17.6720,
    lng: 73.9780,
    loanType: "Vegetable Stall Loan",
    amount: "₹40,000",
    phone: "+91 98341 99001",
    status: "Pending"
  },
  {
    id: "cust-80",
    name: "Urmila More",
    village: "Bandra East",
    lat: 17.6690,
    lng: 73.9750,
    loanType: "Kirana Shop Expansion",
    amount: "₹1,30,000",
    phone: "+91 90043 00112",
    status: "Pending"
  }
];

// Apply the coordinate shift to center on Mumbai by default
export const BRANCH_INFO = {
  ...RAW_BRANCH_INFO,
  lat: RAW_BRANCH_INFO.lat + LAT_SHIFT,
  lng: RAW_BRANCH_INFO.lng + LNG_SHIFT
};

export const SALES_OFFICERS = RAW_SALES_OFFICERS.map(so => ({
  ...so,
  initialLat: RAW_BRANCH_INFO.lat + LAT_SHIFT,
  initialLng: RAW_BRANCH_INFO.lng + LNG_SHIFT
}));

export const CUSTOMERS = RAW_CUSTOMERS.map(c => ({
  ...c,
  lat: c.lat + LAT_SHIFT,
  lng: c.lng + LNG_SHIFT
}));

export const MANUAL_ALLOCATIONS = {
  // Rahul Shinde: Bandra, Santacruz, Andheri East
  "so-1": {
    customerIds: ["cust-1", "cust-2", "cust-8", "cust-12"],
    distanceKm: 28.6,
    timeMinutes: 120
  },
  // Priya Patil: overlaps + Sion
  "so-2": {
    customerIds: ["cust-2", "cust-7", "cust-13", "cust-15"],
    distanceKm: 24.2,
    timeMinutes: 105
  },
  // Amit Deshmukh: overlaps + Ghatkopar
  "so-3": {
    customerIds: ["cust-3", "cust-5", "cust-6", "cust-9"],
    distanceKm: 29.1,
    timeMinutes: 125
  },
  // Savita Kamble: Pali Hill, Prabhadevi + Bandra Reclamation
  "so-4": {
    customerIds: ["cust-17", "cust-18", "cust-19", "cust-20"],
    distanceKm: 21.4,
    timeMinutes: 100
  },
  // Vikram Jadhav: Vile Parle + Santacruz East
  "so-5": {
    customerIds: ["cust-35", "cust-36", "cust-45", "cust-46"],
    distanceKm: 22.5,
    timeMinutes: 100
  },
  // Deepali Pawar: Chembur + Dadar East
  "so-6": {
    customerIds: ["cust-41", "cust-42", "cust-43", "cust-44"],
    distanceKm: 23.8,
    timeMinutes: 105
  },
  // Manoj Patil: North-East outlying Sion/Chembur
  "so-7": {
    customerIds: ["cust-33", "cust-34", "cust-7", "cust-10", "cust-21"],
    distanceKm: 26.5,
    timeMinutes: 120
  },
  // Shweta Kadam: South-West Dadar/Worli
  "so-8": {
    customerIds: ["cust-47", "cust-48", "cust-12", "cust-14", "cust-15"],
    distanceKm: 24.8,
    timeMinutes: 115
  },
  // Sachin Sawant: North Andheri/Khar Danda
  "so-9": {
    customerIds: ["cust-37", "cust-38", "cust-1", "cust-22", "cust-24"],
    distanceKm: 27.2,
    timeMinutes: 125
  },
  // Snehal Bhosale: South Chembur/Ghatkopar
  "so-10": {
    customerIds: ["cust-39", "cust-40", "cust-11", "cust-13", "cust-23"],
    distanceKm: 25.4,
    timeMinutes: 120
  }
};
