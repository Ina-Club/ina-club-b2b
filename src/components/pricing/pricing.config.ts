export type PricingPlan = {
    id: string;
    title: string;
    price: number;
    duration: "monthly" | "yearly";
    freeMonths?: number;
    groupsPerMonth: number;
    itemsPerGroup: number;
    highlighted?: boolean;
  };
  
  export const PRICING_PLANS: PricingPlan[] = [
    {
      id: "starter",
      title: "Starter",
      price: 199,
      duration: "monthly",
      groupsPerMonth: 2,
      itemsPerGroup: 5,
    },
    {
      id: "pro",
      title: "Pro",
      price: 399,
      duration: "monthly",
      groupsPerMonth: 6,
      itemsPerGroup: 15,
      highlighted: true,
    },
    {
      id: "business",
      title: "Business",
      price: 3990,
      duration: "yearly",
      freeMonths: 2,
      groupsPerMonth: 15,
      itemsPerGroup: 50,
    },
  ];
  