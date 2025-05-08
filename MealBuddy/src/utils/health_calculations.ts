// Types for health calculations
interface BMICategory {
  category: string;
  color: string;
  description: string;
  recommendation: string;
}

interface CalorieRecommendation {
  maintenance: number;
  weightLoss: number;
  weightGain: number;
}

// Constants for BMI categories
const BMI_CATEGORIES: Record<string, BMICategory> = {
  underweight: {
    category: "Underweight",
    color: "#3498db",
    description: "BMI less than 18.5",
    recommendation: "Consider increasing caloric intake with nutrient-dense foods"
  },
  normal: {
    category: "Normal",
    color: "#2ecc71",
    description: "BMI between 18.5 and 24.9",
    recommendation: "Maintain current healthy lifestyle"
  },
  overweight: {
    category: "Overweight",
    color: "#f39c12",
    description: "BMI between 25 and 29.9",
    recommendation: "Consider reducing caloric intake and increasing physical activity"
  },
  obese: {
    category: "Obese",
    color: "#e74c3c",
    description: "BMI of 30 or higher",
    recommendation: "Consult with a healthcare provider for personalized guidance"
  }
};

// Activity level multipliers for calorie calculations
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9     // Very hard exercise & physical job
};

// Helper function to convert feet to meters
export const feetToMeters = (feet: number): number => {
  return feet * 0.3048;
};

// Helper function to convert pounds to kilograms
export const poundsToKg = (pounds: number): number => {
  return pounds * 0.453592;
};

// Calculate BMI and return category information
export const calculateBMI = (heightFeet: number, weightPounds: number): { 
  value: number; 
  category: BMICategory;
} => {
  const heightMeters = feetToMeters(heightFeet);
  const weightKg = poundsToKg(weightPounds);
  
  if (heightMeters <= 0 || weightKg <= 0) {
    throw new Error("Invalid height or weight values");
  }
  
  const bmi = weightKg / (heightMeters * heightMeters);
  const roundedBMI = Math.round(bmi * 10) / 10;
  
  let category: BMICategory;
  if (bmi < 18.5) {
    category = BMI_CATEGORIES.underweight;
  } else if (bmi < 25) {
    category = BMI_CATEGORIES.normal;
  } else if (bmi < 30) {
    category = BMI_CATEGORIES.overweight;
  } else {
    category = BMI_CATEGORIES.obese;
  }
  
  return { value: roundedBMI, category };
};

// Calculate BMR using Mifflin-St Jeor Equation
export const calculateBMR = (
  weightPounds: number,
  heightFeet: number,
  age: number,
  gender: string
): number => {
  const weightKg = poundsToKg(weightPounds);
  const heightCm = feetToMeters(heightFeet) * 100;
  
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new Error("Invalid input values for BMR calculation");
  }
  
  let bmr: number;
  if (gender.toLowerCase() === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  return Math.round(bmr);
};

// Calculate daily calorie needs with weight goals
export const calculateCalorieNeeds = (
  weightPounds: number,
  heightFeet: number,
  age: number,
  gender: string,
  activityLevel: string
): CalorieRecommendation => {
  const bmr = calculateBMR(weightPounds, heightFeet, age, gender);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  
  const maintenance = Math.round(bmr * activityMultiplier);
  
  return {
    maintenance,
    weightLoss: Math.round(maintenance - 500), // 500 calorie deficit for weight loss
    weightGain: Math.round(maintenance + 500)  // 500 calorie surplus for weight gain
  };
};

// Get activity level description
export const getActivityLevelDescription = (level: string): string => {
  switch (level) {
    case "sedentary":
      return "Little or no exercise";
    case "light":
      return "Light exercise 1-3 days/week";
    case "moderate":
      return "Moderate exercise 3-5 days/week";
    case "active":
      return "Hard exercise 6-7 days/week";
    case "very_active":
      return "Very hard exercise & physical job";
    default:
      return "Moderate exercise 3-5 days/week";
  }
}; 