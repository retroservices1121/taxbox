import { WORKSPACE_PRICE_CENTS, type ClientType } from "./domain";

export function activationPriceCents(clientType: ClientType): number {
  return WORKSPACE_PRICE_CENTS[clientType];
}

export function seasonalRevenue(input: { individuals: number; businesses: number }): number {
  return input.individuals * WORKSPACE_PRICE_CENTS.INDIVIDUAL + input.businesses * WORKSPACE_PRICE_CENTS.BUSINESS;
}
