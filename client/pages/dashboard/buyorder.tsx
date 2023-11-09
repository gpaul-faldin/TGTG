import React, { useState } from "react";

const BuyOrder = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const items = [
    // Les données des cartes peuvent être des objets avec des informations spécifiques
    {
      id: 1,
      shopName: "Nom du Shop 1",
      image: "url_de_l_image_1",
      basketType: "Type de Panier 1",
      address: "Adresse 1",
      price: "20€",
    },
    {
      id: 2,
      shopName: "Nom du Shop 2",
      image: "url_de_l_image_2",
      basketType: "Type de Panier 2",
      address: "Adresse 2",
      price: "20€",
    },
    {
        id: 3,
        shopName: "Nom du Shop 3",
        image: "url_de_l_image_3",
        basketType: "Type de Panier 3",
        address: "Adresse 3",
        price: "20€",
    },
    {
        id: 4,
        shopName: "Nom du Shop 4",
        image: "url_de_l_image_4",
        basketType: "Type de Panier 4",
        address: "Adresse 4",
        price: "25€",
    },
    {
      id: 4,
      shopName: "Nom du Shop 4",
      image: "url_de_l_image_4",
      basketType: "Type de Panier 4",
      address: "Adresse 4",
      price: "25€",
    },    {
      id: 5,
      shopName: "Nom du Shop 4",
      image: "url_de_l_image_4",
      basketType: "Type de Panier 4",
      address: "Adresse 4",
      price: "25€",
    },    {
      id: 6,
      shopName: "Nom du Shop 4",
      image: "url_de_l_image_4",
      basketType: "Type de Panier 4",
      address: "Adresse 4",
      price: "25€",
    }, {
      id: 6,
      shopName: "Nom du Shop 4",
      image: "url_de_l_image_4",
      basketType: "Type de Panier 4",
      address: "Adresse 4",
      price: "25€",
    }, {
      id: 6,
      shopName: "Nom du Shop 4",
      image: "url_de_l_image_4",
      basketType: "Type de Panier 4",
      address: "Adresse 4",
      price: "25€",
    }
  ];

  const toggleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((item) => item !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const saveSelectedItems = () => {
    console.log("Éléments sauvegardés :", selectedItems);
  };

  return (
<div className="flex flex-col h-screen border border-black">
  <div className="p-4">
  <h1 className="text-3xl text-left text-gray-800 font-semibold ">
  Bienvenue sur Too Good To Bot !
</h1>
<p className="text-lg text-left text-gray-600 mt-4">
  Découvrez ici tous vos favoris de TGTG. 
</p>
<p className="text-lg text-left text-gray-600">
  Sélectionnez-les et validez pour activer Too Good To Bot !
</p>
  </div>
  <div className="flex-1 overflow-y-auto border-b-2 border-grey">
    <div className="grid grid-cols-7 gap-4 p-1">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-4 border rounded-lg cursor-pointer shadow-md ${
            selectedItems.includes(item.id) ? "bg-green-200" : "bg-white"
          }`}
          onClick={() => toggleSelectItem(item.id)}
        >
          <h2 className="text-lg font-bold">{item.shopName}</h2>
          <img src={item.image} alt={item.shopName} className="w-full h-40 object-cover mb-2" />
          <p><strong>Type de Panier:</strong> {item.basketType}</p>
          <p><strong>Adresse:</strong> {item.address}</p>
          <p><strong>Prix:</strong> {item.price}</p>
        </div>
      ))}
    </div>
  </div>
  <div className="flex flex-row justify-end">
<button
   className="bg-red-500 text-white py-2 px-4 rounded-lg mt-4 self-end mr-4 mb-4" 
   >
    Tout déselectionner
  </button>
  <button
    onClick={saveSelectedItems}
    className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 self-end mr-4 mb-4"
  >
    Sauvegarder la sélection
  </button>
  </div>
  
</div>

  );
};

export default BuyOrder;
