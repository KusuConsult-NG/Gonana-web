export const PRODUCT_CATEGORIES = [
    { id: "grains", label: "Grains & Cereals" },
    { id: "tubers", label: "Roots & Tubers" },
    { id: "vegetables", label: "Vegetables" },
    { id: "fruits", label: "Fruits" },
    { id: "oils", label: "Oils" },
    { id: "spices", label: "Spices & Herbs" },
    { id: "livestock", label: "Livestock & Poultry" },
    { id: "dairy", label: "Dairy & Eggs" },
    { id: "processed", label: "Processed Foods" },
];

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['id'];
