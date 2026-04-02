require("dotenv").config();
const mongoose = require("mongoose");

const Recipe = require("../Schema/recipeSchema");
const User = require("../Schema/User");

const RECIPE_IMAGE_KEYWORDS = {
  "South Indian Idli Sambar": "idli,sambar,south-indian-food",
  "South Indian Coconut Dosa": "dosa,coconut-chutney,south-indian-food",
  "North Indian Butter Paneer": "paneer,butter-curry,north-indian-food",
  "North Indian Aloo Paratha": "aloo-paratha,north-indian-food",
  "Andhra Gongura Mutton": "mutton-curry,andhra-food",
  "Andhra Pesarattu": "pesarattu,green-gram-dosa,andhra-food",
  "Karnataka Bisi Bele Bath": "bisi-bele-bath,karnataka-food",
  "Karnataka Ragi Mudde": "ragi-mudde,karnataka-food",
  "Kerala Appam Stew": "appam,vegetable-stew,kerala-food",
  "Kerala Puttu Kadala": "puttu,kadala-curry,kerala-food",
  "Tamil Nadu Pongal": "ven-pongal,tamil-food",
  "Tamil Nadu Chettinad Chicken": "chettinad-chicken,tamil-food",
  "Street Food Pav Bhaji": "pav-bhaji,street-food",
  "Street Food Pani Puri": "pani-puri,street-food",
  "Breakfast Poha": "poha,breakfast-indian-food",
  "Breakfast Vegetable Upma": "vegetable-upma,breakfast-indian-food",
  "Snacks Masala Vada": "masala-vada,indian-snack",
  "Snacks Paneer Tikka": "paneer-tikka,indian-snack",
  "Desserts Gulab Jamun": "gulab-jamun,indian-dessert",
  "Desserts Rice Kheer": "rice-kheer,indian-dessert",
  "Beverages Masala Chai": "masala-chai,indian-tea",
  "Beverages Mango Lassi": "mango-lassi,indian-drink",
};

const getStableLock = (title) => {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 100;
};

const getRecipeImageUrl = (title) => {
  const keywordString = RECIPE_IMAGE_KEYWORDS[title];
  const keywords = keywordString || title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(",");
  const lock = getStableLock(title);
  return `https://loremflickr.com/900/600/${keywords},indian,food?lock=${lock}`;
};

const CATEGORY_RECIPES = {
  "South Indian": [
    {
      title: "South Indian Idli Sambar",
      description: "Soft idlis served with flavorful sambar.",
      ingredients: ["idli rice", "urad dal", "toor dal", "tamarind", "vegetables"],
      instructions: "Prepare idli batter, steam idlis, cook sambar and serve hot.",
      prepTime: 45,
      price: 80,
    },
    {
      title: "South Indian Coconut Dosa",
      description: "Crispy dosa with coconut chutney.",
      ingredients: ["dosa batter", "coconut", "green chili", "curry leaves"],
      instructions: "Spread batter on tawa, cook dosa, grind chutney and serve.",
      prepTime: 30,
      price: 90,
    },
  ],
  "North Indian": [
    {
      title: "North Indian Butter Paneer",
      description: "Paneer cubes in rich butter tomato gravy.",
      ingredients: ["paneer", "tomato", "butter", "cream", "spices"],
      instructions: "Cook tomato gravy, add paneer and simmer with cream.",
      prepTime: 35,
      price: 180,
    },
    {
      title: "North Indian Aloo Paratha",
      description: "Stuffed whole wheat flatbread with spiced potato filling.",
      ingredients: ["wheat flour", "potato", "onion", "green chili", "ghee"],
      instructions: "Prepare filling, stuff dough, roll and roast with ghee.",
      prepTime: 40,
      price: 120,
    },
  ],
  Andhra: [
    {
      title: "Andhra Gongura Mutton",
      description: "Tangy mutton curry made with gongura leaves.",
      ingredients: ["mutton", "gongura leaves", "onion", "garlic", "spices"],
      instructions: "Cook mutton, add gongura paste and simmer with spices.",
      prepTime: 60,
      price: 260,
    },
    {
      title: "Andhra Pesarattu",
      description: "Green gram dosa served with ginger chutney.",
      ingredients: ["green gram", "rice", "ginger", "green chili", "onion"],
      instructions: "Soak, grind batter, spread on tawa and cook till crisp.",
      prepTime: 30,
      price: 95,
    },
  ],
  Karnataka: [
    {
      title: "Karnataka Bisi Bele Bath",
      description: "Rice-lentil dish cooked with vegetables and spice mix.",
      ingredients: ["rice", "toor dal", "mixed vegetables", "bisi bele powder"],
      instructions: "Cook rice and dal, mix with vegetables and masala.",
      prepTime: 45,
      price: 140,
    },
    {
      title: "Karnataka Ragi Mudde",
      description: "Healthy finger millet balls served with sambar.",
      ingredients: ["ragi flour", "water", "salt", "sambar"],
      instructions: "Boil water, mix ragi flour and shape into balls.",
      prepTime: 25,
      price: 85,
    },
  ],
  Kerala: [
    {
      title: "Kerala Appam Stew",
      description: "Soft appam with mild coconut vegetable stew.",
      ingredients: ["rice", "coconut milk", "potato", "carrot", "pepper"],
      instructions: "Make appam batter, cook appams and prepare coconut stew.",
      prepTime: 50,
      price: 170,
    },
    {
      title: "Kerala Puttu Kadala",
      description: "Steamed rice cake served with black chickpea curry.",
      ingredients: ["rice flour", "grated coconut", "black chickpeas", "onion"],
      instructions: "Steam puttu and cook kadala curry with roasted spices.",
      prepTime: 45,
      price: 150,
    },
  ],
  "Tamil Nadu": [
    {
      title: "Tamil Nadu Pongal",
      description: "Creamy rice-lentil breakfast tempered with ghee and pepper.",
      ingredients: ["rice", "moong dal", "ghee", "pepper", "cashew"],
      instructions: "Cook rice-dal soft and finish with tempering.",
      prepTime: 30,
      price: 110,
    },
    {
      title: "Tamil Nadu Chettinad Chicken",
      description: "Spicy chicken curry with roasted Chettinad masala.",
      ingredients: ["chicken", "onion", "tomato", "coconut", "spices"],
      instructions: "Roast spices, make masala and cook chicken till tender.",
      prepTime: 55,
      price: 230,
    },
  ],
  "Street Food": [
    {
      title: "Street Food Pav Bhaji",
      description: "Mashed spicy vegetable curry with buttered pav.",
      ingredients: ["potato", "peas", "capsicum", "tomato", "pav"],
      instructions: "Cook and mash vegetables with bhaji masala, toast pav.",
      prepTime: 35,
      price: 130,
    },
    {
      title: "Street Food Pani Puri",
      description: "Crisp puris filled with spicy water and stuffing.",
      ingredients: ["puris", "potato", "chickpeas", "mint", "tamarind"],
      instructions: "Prepare pani and stuffing, fill puris and serve immediately.",
      prepTime: 30,
      price: 90,
    },
  ],
  Breakfast: [
    {
      title: "Breakfast Poha",
      description: "Light and flavorful flattened rice breakfast.",
      ingredients: ["poha", "onion", "mustard", "peanuts", "turmeric"],
      instructions: "Temper spices, cook poha and garnish with lemon.",
      prepTime: 20,
      price: 70,
    },
    {
      title: "Breakfast Vegetable Upma",
      description: "Savory semolina breakfast with vegetables.",
      ingredients: ["rava", "onion", "carrot", "beans", "curry leaves"],
      instructions: "Roast rava, cook vegetables and combine with hot water.",
      prepTime: 25,
      price: 75,
    },
  ],
  Snacks: [
    {
      title: "Snacks Masala Vada",
      description: "Crispy chana dal fritters with spices.",
      ingredients: ["chana dal", "onion", "green chili", "fennel", "curry leaves"],
      instructions: "Grind soaked dal coarse, shape and deep fry.",
      prepTime: 35,
      price: 85,
    },
    {
      title: "Snacks Paneer Tikka",
      description: "Grilled paneer cubes in spicy yogurt marinade.",
      ingredients: ["paneer", "curd", "capsicum", "onion", "spices"],
      instructions: "Marinate paneer and grill until charred.",
      prepTime: 40,
      price: 190,
    },
  ],
  Desserts: [
    {
      title: "Desserts Gulab Jamun",
      description: "Soft milk-solid dumplings soaked in sugar syrup.",
      ingredients: ["khoya", "flour", "sugar", "cardamom", "ghee"],
      instructions: "Prepare dough, fry balls and soak in warm syrup.",
      prepTime: 45,
      price: 120,
    },
    {
      title: "Desserts Rice Kheer",
      description: "Creamy rice pudding flavored with cardamom and nuts.",
      ingredients: ["rice", "milk", "sugar", "cardamom", "nuts"],
      instructions: "Slow-cook rice in milk, add sugar and garnish.",
      prepTime: 50,
      price: 110,
    },
  ],
  Beverages: [
    {
      title: "Beverages Masala Chai",
      description: "Spiced Indian tea with milk.",
      ingredients: ["tea leaves", "milk", "ginger", "cardamom", "sugar"],
      instructions: "Boil water with spices, add tea and milk, strain.",
      prepTime: 10,
      price: 40,
    },
    {
      title: "Beverages Mango Lassi",
      description: "Refreshing yogurt mango drink.",
      ingredients: ["mango pulp", "curd", "milk", "sugar", "cardamom"],
      instructions: "Blend all ingredients until smooth and chill.",
      prepTime: 10,
      price: 60,
    },
  ],
};

async function seedCategoryRecipes() {
  const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/recipe-sharing";

  await mongoose.connect(mongoURI);

  const owner = await User.findOne().select("_id name");
  if (!owner) {
    throw new Error("No user found. Please register/login once before seeding recipes.");
  }

  let inserted = 0;
  let skipped = 0;

  for (const [category, recipes] of Object.entries(CATEGORY_RECIPES)) {
    for (const recipe of recipes) {
      const imageUrl = getRecipeImageUrl(recipe.title);
      const exists = await Recipe.findOne({ title: recipe.title, category });
      if (exists) {
        const current = String(exists.imageUrl || "");
        const shouldReplaceImage =
          !current ||
          current !== imageUrl ||
          current.includes("picsum.photos") ||
          current.includes("source.unsplash.com") ||
          !current.includes("loremflickr.com");
        if (shouldReplaceImage) {
          await Recipe.updateOne({ _id: exists._id }, { $set: { imageUrl } });
          inserted += 1;
          continue;
        }
        skipped += 1;
        continue;
      }

      await Recipe.create({
        ...recipe,
        imageUrl,
        category,
        userId: owner._id,
      });
      inserted += 1;
    }
  }

  console.log(`Seeding complete. Inserted: ${inserted}, Skipped(existing): ${skipped}`);
}

seedCategoryRecipes()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  });
