// pages/subscriptions.tsx

import React from "react";

const subscriptions = [
  {
    name: "Starter",
    price: 3,
    features: [
      "Caractéristique 1",
      "Caractéristique 2",
      "Caractéristique 3",

      "Caractéristique 2",
      "Caractéristique 3",
    ],
  },
  {
    name: "Pro",
    price: 10,
    features: ["Caractéristique 1", "Caractéristique 3"],
  },
  {
    name: "Plus",
    price: 5,
    features: ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
  },
];

interface SubscriptionCardProps {
  name: string;
  price: number;
  features: string[];
  rank: number;
}

const SubscriptionCard = ({
  name,
  price,
  features,
  rank,
}: SubscriptionCardProps) => (
  <div
    className={`max-w-md rounded-lg overflow-hidden shadow-lg m-2 ${
      rank === 1
        ? "transform -translate-y-16"
        : rank === 1
        ? "transform -translate-y-8"
        : ""
    }`}
  >
    <div className="px-6 py-4 bg-white">
      <div className="flex justify-between">
        <div className="text-3xl font-semibold text-indigo-700">{name}</div>
        <div className="text-3xl font-semibold text-indigo-700">${price}</div>
      </div>
    </div>
    <div className="px-6 py-4 bg-indigo-100">
      <ul>
        {features.map((feature: string, index: number) => (
          <li key={index} className="mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div className="max-h-16 overflow-hidden">
              <span className="block text-gray-800 text-sm">{feature}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const SubscriptionsPage = () => (
  <div className="flex justify-center items-center h-screen bg-indigo-200">
    <div className="flex flex-wrap justify-center">
      {subscriptions.map((subscription, index) => (
        <SubscriptionCard key={index} {...subscription} rank={index} />
      ))}
    </div>
  </div>
);

export default SubscriptionsPage;
