import React, { useState } from "react";
import {
  vegetarianProteins,
  highCalorieFoods,
  budgetMealIdeas,
} from "../data/nutritionData";
import { Search, DollarSign, Leaf, Flame, ChefHat } from "lucide-react";

const NutritionGuide = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("proteins");

  const filteredProteins = vegetarianProteins.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getCostColor = (cost) => {
    switch (cost) {
      case "Low":
        return "text-green-400 bg-green-400/10";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/10";
      case "High":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const tabs = [
    { id: "proteins", label: "Protein Sources", icon: Leaf },
    { id: "calories", label: "High Calorie Foods", icon: Flame },
    { id: "budget", label: "Budget Meals", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Nutrition Guide
          </h1>
          <p className="text-gray-400 mt-1">
            Affordable vegetarian nutrition for weight gain
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary-500 text-white"
                : "bg-dark-800 text-gray-400 hover:bg-dark-700"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "proteins" && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search protein sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProteins.map((item, index) => (
              <div
                key={index}
                className="card hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-white text-lg">{item.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getCostColor(item.cost)}`}
                  >
                    {item.cost}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Protein</span>
                    <span className="text-primary-400 font-bold">
                      {item.protein}g
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Calories</span>
                    <span className="text-white font-medium">
                      {item.calories}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Serving</span>
                    <span className="text-gray-300 text-sm">
                      {item.serving}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-700">
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500"
                      style={{
                        width: `${Math.min((item.protein / 30) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Protein density</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "calories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highCalorieFoods.map((food, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Flame className="text-orange-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {food.name}
                    </h3>
                    <p className="text-orange-400 font-bold">
                      {food.calories} kcal / 100g
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-dark-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Protein</p>
                    <p className="text-primary-400 font-bold">
                      {food.protein}g
                    </p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Carbs</p>
                    <p className="text-blue-400 font-bold">{food.carbs}g</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Fat</p>
                    <p className="text-yellow-400 font-bold">{food.fat}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-gradient-to-r from-orange-500/20 to-dark-800 border-orange-500/30">
            <h3 className="font-bold text-white mb-2">💡 Pro Tip</h3>
            <p className="text-gray-300 text-sm">
              Add healthy fats like peanut butter, avocado, and nuts to your
              meals to easily increase calorie intake without adding bulk.
            </p>
          </div>
        </div>
      )}

      {activeTab === "budget" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {budgetMealIdeas.map((meal, index) => (
              <div key={index} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <ChefHat className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {meal.name}
                      </h3>
                      <p className="text-green-400 font-bold">{meal.cost}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {meal.calories}
                    </p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Ingredients:</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map((ingredient, i) => (
                      <span
                        key={i}
                        className="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded-lg"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <span className="text-gray-400 text-sm">Protein content</span>
                  <span className="text-primary-400 font-bold">
                    {meal.protein}g
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-gradient-to-r from-green-500/20 to-dark-800 border-green-500/30">
            <h3 className="font-bold text-white mb-2">💰 Budget Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Buy lentils, chickpeas, and oats in bulk to save money
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Eggs are one of the cheapest protein sources available
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Make your own peanut butter at home to reduce costs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                Seasonal vegetables are cheaper and fresher
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionGuide;
