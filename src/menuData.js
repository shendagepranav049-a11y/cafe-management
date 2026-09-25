const menuData = [
  {
    category: "COLD COFFEE / COLD CHOCOLATE",
    items: [
      {
        name: "Cold Coffee",
        variants: [
          ["Plain", 30],
          ["Crush", 40],
          ["Ice Cream", 50],
          ["Both", 60],
        ],
      },
      {
        name: "Cold Chocolate",
        variants: [
          ["Plain", 30],
          ["Crush", 40],
          ["Ice Cream", 50],
          ["Both", 60],
        ],
      },
      {
        name: "Thick Coffee",
        variants: [
          ["Plain", 45],
          ["Crush", 55],
          ["Ice Cream", 65],
          ["Both", 70],
        ],
      },
      {
        name: "Thick Chocolate",
        variants: [
          ["Plain", 45],
          ["Crush", 55],
          ["Ice Cream", 65],
          ["Both", 70],
        ],
      },
      {
        name: "White Coffee",
        variants: [
          ["Plain", 55],
          ["Crush", 65],
          ["Ice Cream", 75],
          ["Both", 70],
        ],
      },
      {
        name: "Mocha Coffee",
        variants: [
          ["Plain", 55],
          ["Crush", 65],
          ["Ice Cream", 75],
          ["Both", 90],
        ],
      },
      {
        name: "Irish Coffee",
        variants: [
          ["Plain", 55],
          ["Crush", 65],
          ["Ice Cream", 75],
          ["Both", 90],
        ],
      },
      {
        name: "Black Forest Coffee",
        variants: [
          ["Plain", 55],
          ["Crush", 65],
          ["Ice Cream", 75],
          ["Both", 90],
        ],
      },
      {
        name: "Oreo Coffee",
        variants: [
          ["Plain", 55],
          ["Crush", 65],
          ["Ice Cream", 75],
          ["Both", 90],
        ],
      },
      {
        name: "Kit-Kat Coffee",
        variants: [
          ["Plain", 55],
          ["Crush", 65],
          ["Ice Cream", 75],
          ["Both", 90],
        ],
      },
    ],
  },

  {
    category: "SHAKES",
    items: [
      { name: "Vanilla", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Chocolate", variants: [["Shake", 70], ["Mastani", 100]] },
      { name: "Mango", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Oreo Shake", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Butter Scotch", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Rose", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Black Current", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Strawberry", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Pista", variants: [["Shake", 60], ["Mastani", 90]] },
      { name: "Almonda", variants: [["Shake", 100], ["Mastani", 130]] },
      { name: "Dry Fruit", variants: [["Shake", 120], ["Mastani", 150]] },
    ],
  },

  {
    category: "SANDWITCH",
    items: [
      { name: "Bread Butter", variants: [["Regular", 40]] },
      { name: "Veg Sandwich", variants: [["Regular", 70]] },
      { name: "Cheese Sandwich", variants: [["Regular", 80]] },
      { name: "Chocolate Sandwich", variants: [["Regular", 70]] },
    ],
  },

  {
    category: "GRILL",
    items: [
      { name: "Grill Sandwich", variants: [["Regular", 90]] },
      { name: "Grill Cheese Sandwich", variants: [["Regular", 100]] },
      { name: "Grill Corn Sandwich", variants: [["Regular", 100]] },
      { name: "Grill Chocolate Sandwich", variants: [["Regular", 100]] },
    ],
  },

  {
    category: "MOMO'S",
    items: [
      { name: "Veg Momos", variants: [["Steam", 60], ["Fried", 80]] },
      { name: "Paneer Momos", variants: [["Steam", 80], ["Fried", 90]] },
      {
        name: "Peri Peri Veg Momos",
        variants: [["Steam", 70], ["Fried", 90]],
      },
      {
        name: "Peri Peri Paneer Momos",
        variants: [["Steam", 90], ["Fried", 100]],
      },
    ],
  },

  {
    category: "PIZZA",
    items: [
      { name: "Veg Cheese Pizza", variants: [["S", 90], ["M", 120]] },
      { name: "Margherita Pizza", variants: [["S", 90], ["M", 120]] },
      { name: "Jain Pizza", variants: [["S", 120], ["M", 150]] },
      { name: "Sweetcorn Pizza", variants: [["S", 120], ["M", 150]] },
      { name: "Chocolate Pizza", variants: [["S", 120], ["M", 150]] },
      { name: "Paneer Makhani Pizza", variants: [["S", 150], ["M", 170]] },
      { name: "Paneer Cheese Pizza", variants: [["S", 150], ["M", 170]] },
      { name: "Cheese Burst Pizza", variants: [["S", 160], ["M", 180]] },
      { name: "Tandoor Pizza", variants: [["S", 180], ["M", 200]] },
    ],
  },

  {
    category: "EXTRA",
    items: [
      { name: "Crush", variants: [["Regular", 10]] },
      { name: "Ice Cream", variants: [["Regular", 20]] },
    ],
  },

  {
    category: "MONSTER SHAKE",
    items: [
      { name: "Chocolate", variants: [["Regular", 100]] },
      { name: "Strawberry", variants: [["Regular", 100]] },
      { name: "Oreo / Kitkat", variants: [["Regular", 110]] },
      { name: "Brownie", variants: [["Regular", 120]] },
    ],
  },

  {
    category: "HOT",
    items: [
      { name: "Hot Coffee", variants: [["Regular", 30]] },
      { name: "Hot Chocolate", variants: [["Regular", 40]] },
      { name: "Hot Mocha", variants: [["Regular", 50]] },
      { name: "Hot Vanilla Coffee", variants: [["Regular", 40]] },
      { name: "Hot Black Coffee", variants: [["Regular", 30]] },
      { name: "Hot Tea", variants: [["Regular", 30]] },
    ],
  },

  {
    category: "BROWNIE",
    items: [
      { name: "Hot Brownie", variants: [["Regular", 80]] },
      { name: "Brownie Shake", variants: [["Regular", 100]] },
      { name: "Hot Brownie With Ice Cream", variants: [["Regular", 110]] },
      { name: "Sizzling Brownie", variants: [["Regular", 150]] },
    ],
  },

  {
    category: "MOCKTAILS",
    items: [
      { name: "Mango", variants: [["Regular", 80]] },
      { name: "Limo", variants: [["Regular", 80]] },
      { name: "Blue Curaco", variants: [["Regular", 80]] },
      { name: "Black Current", variants: [["Regular", 80]] },
      { name: "Mint Mojito", variants: [["Regular", 80]] },
      { name: "Green Apple", variants: [["Regular", 80]] },
      { name: "Virgin Mojito", variants: [["Regular", 80]] },
    ],
  },

  {
    category: "CAD SHAKE",
    items: [
      { name: "Cad-B", variants: [["Regular", 90]] },
      { name: "Cad-M", variants: [["Regular", 90]] },
      { name: "White-B", variants: [["Regular", 80]] },
      { name: "Cad Oreo", variants: [["Regular", 110]] },
      { name: "Dry Fruit-B", variants: [["Regular", 100]] },
      { name: "Ferrero-B", variants: [["Regular", 100]] },
    ],
  },

  {
    category: "ICE CREAM",
    items: [
      { name: "Vanilla", variants: [["Regular", 30]] },
      { name: "Butterscotch", variants: [["Regular", 40]] },
      { name: "Mango", variants: [["Regular", 40]] },
      { name: "Strawberry", variants: [["Regular", 40]] },
      { name: "Chocolate", variants: [["Regular", 50]] },
      { name: "Pista", variants: [["Regular", 50]] },
    ],
  },

  {
    category: "NATURAL JUICES",
    items: [
      { name: "Mango", variants: [["Regular", 70]] },
      { name: "Chikku", variants: [["Regular", 70]] },
      { name: "Mix", variants: [["Regular", 70]] },
      { name: "Apple", variants: [["Regular", 70]] },
      { name: "Watermelon", variants: [["Regular", 70]] },
      { name: "Pineapple", variants: [["Regular", 70]] },
    ],
  },

  {
    category: "NACHOS",
    items: [
      { name: "Nacho Cheese", variants: [["Plain", 70], ["Cheese", 100]] },
      { name: "Nacho Peri Peri", variants: [["Plain", 80], ["Cheese", 110]] },
    ],
  },

  {
    category: "MAGGI",
    items: [
      { name: "Plain Maggi", variants: [["Regular", 50]] },
      { name: "Veg Maggi", variants: [["Regular", 60]] },
      { name: "Schezwan Maggi", variants: [["Regular", 70]] },
      { name: "Butter Maggi", variants: [["Regular", 70]] },
      { name: "Cheese Maggi", variants: [["Regular", 70]] },
      { name: "Peri Peri", variants: [["Regular", 70]] },
      { name: "Tadka Maggi", variants: [["Regular", 70]] },
      { name: "Paneer Maggi", variants: [["Regular", 80]] },
      { name: "Spl. Maggi", variants: [["Regular", 90]] },
    ],
  },

  {
    category: "LASSI",
    items: [
      { name: "Sweet Lassi", variants: [["Regular", 40]] },
      { name: "Vanilla Lassi", variants: [["Regular", 50]] },
      { name: "Rose Lassi", variants: [["Regular", 50]] },
      { name: "Mango Lassi", variants: [["Regular", 50]] },
      { name: "Strawberry Lassi", variants: [["Regular", 50]] },
      { name: "Dryfruit Lassi", variants: [["Regular", 70]] },
      { name: "Gulkand Lassi", variants: [["Regular", 70]] },
      { name: "Spl. Lassi", variants: [["Regular", 80]] },
    ],
  },

  {
    category: "ROLL",
    items: [
      { name: "Veg Roll", variants: [["Regular", 70]] },
      { name: "Paneer Roll", variants: [["Regular", 90]] },
      { name: "Cheese Roll", variants: [["Regular", 80]] },
      { name: "Paneer Cheese Roll", variants: [["Regular", 100]] },
    ],
  },

  {
    category: "TOAST",
    items: [
      { name: "Masala Toast", variants: [["Regular", 50]] },
      { name: "Cheese Toast", variants: [["Regular", 50]] },
      { name: "Jeera Toast", variants: [["Regular", 40]] },
      { name: "Cheese Chilli Toast", variants: [["Regular", 60]] },
      { name: "Garlic Toast", variants: [["Regular", 60]] },
    ],
  },

  {
    category: "GARLIC BREAD",
    items: [
      { name: "Garlic Bread Cheese", variants: [["Regular", 90]] },
      { name: "Garlic Bread With Corn", variants: [["Regular", 100]] },
    ],
  },

  {
    category: "PASTA",
    items: [
      { name: "Cheese Pasta (WS)", variants: [["Regular", 150]] },
      { name: "Italian Pasta (RS)", variants: [["Regular", 160]] },
      { name: "Delight Pasta (MS)", variants: [["Regular", 180]] },
    ],
  },

  {
    category: "FRIES",
    items: [
      { name: "Fries Salted", variants: [["Regular", 60]] },
      { name: "Fries Peri Peri (Masala)", variants: [["Regular", 80]] },
      { name: "Cheese Peri Peri Fries", variants: [["Regular", 90]] },
      { name: "Cheese Corn Nugets", variants: [["Regular", 70]] },
    ],
  },

  {
    category: "BURGER",
    items: [
      { name: "Veg Burger", variants: [["Regular", 70]] },
      { name: "Veg Cheese Burger", variants: [["Regular", 80]] },
      { name: "Double Cheese Burger", variants: [["Regular", 90]] },
      { name: "Jumbo Burger", variants: [["Regular", 120]] },
    ],
  },
];

export default menuData;