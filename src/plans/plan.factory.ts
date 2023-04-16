// planFactory.ts
import { StoragePlans, StoragePlan, StoragePlanView } from './rate-plan.model';

export class PlanFactory {
  public static canBuy(
    currentUserPlan: StoragePlanView,
    targetPlan: StoragePlanView,
  ): boolean {
    const currentUserPlanIndex = this.getPlanIndex(currentUserPlan);
    const targetPlanIndex = this.getPlanIndex(targetPlan);

    return (
      currentUserPlanIndex < targetPlanIndex &&
      StoragePlans[targetPlanIndex].avaible &&
      targetPlan !== currentUserPlan
    );
  }
  public static getAvailablePlans(
    currentUserPlan: StoragePlanView,
  ): StoragePlan[] {
    const currentUserPlanIndex = this.getPlanIndex(currentUserPlan);

    return StoragePlans.filter((plan, index) => {
      return index > currentUserPlanIndex && plan.name !== currentUserPlan;
    });
  }

  private static getPlanIndex(planName: StoragePlanView): number {
    return StoragePlans.findIndex((plan) => plan.name === planName);
  }
}
