import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import menuData from "./menuData";

const uploadMenu = async () => {
  try {
    for (const category of menuData) {
      for (const item of category.items) {
        const variants = item.variants.map(([variant, price]) => ({
          variant,
          price,
        }));

        await addDoc(collection(db, "menu"), {
          category: category.category,
          name: item.name,
          variants,
          active: true,
        });
      }
    }

    console.log("FULL MENU UPLOADED SUCCESSFULLY!");
    alert("Full menu Firebase मध्ये upload झाला!");
  } catch (error) {
    console.error("Menu upload error:", error);
    alert("Menu upload करताना error आला. Console check करा.");
  }
};

uploadMenu();