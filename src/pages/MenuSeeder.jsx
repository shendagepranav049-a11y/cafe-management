import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import menuData from "../menuData";

function MenuSeeder() {
  const [message, setMessage] = useState("");

  const uploadMenu = async () => {
  try {
    setMessage("Full menu upload सुरू...");

    for (const category of menuData) {
      for (const item of category.items) {
        const variants = item.variants.map(([variant, price]) => ({
          variant: variant,
          price: price,
        }));

        await addDoc(collection(db, "menu"), {
          category: category.category,
          name: item.name,
          variants: variants,
          active: true,
        });

        console.log("Uploaded:", item.name);
      }
    }

    setMessage("Full menu Firebase मध्ये upload झाला!");
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    setMessage("Error: " + error.message);
  }
};
  return (
    <div style={{ padding: "40px" }}>
      <h1>Firebase Menu Seeder</h1>

      <button onClick={uploadMenu}>
        Upload Full Menu to Firebase
      </button>

      <h3>{message}</h3>
    </div>
  );
}

export default MenuSeeder;