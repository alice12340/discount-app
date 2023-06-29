import {
  InputQuery,
  FunctionResult,
  DiscountApplicationStrategy,
  Percentage
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type Configuration = {
  payPeriod: string,
  percentage: number,
};

export default (input: InputQuery): FunctionResult => {
  const configuration: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );
  

  if (configuration.payPeriod == input.cart.attribute?.value){
    // const percentage : Percentage = {value: configuration.percentage}
    const percentage : Percentage = {value: configuration.percentage}
    return {
      discounts: [
        {
          targets: [{
            orderSubtotal: {
              excludedVariantIds: []
            }
          }],
          message: "Discount",
          value: {
            percentage: percentage
          }
        }
      ],
      discountApplicationStrategy: DiscountApplicationStrategy.First
    };
  }
  return EMPTY_DISCOUNT;
};