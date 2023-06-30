import { useParams, useSearchParams } from "react-router-dom";
import { useForm, useField } from "@shopify/react-form";
import { CurrencyCode } from "@shopify/react-i18n";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

import {
    ActiveDatesCard,
    CombinationCard,
    DiscountClass,
    DiscountMethod,
    MethodCard,
    DiscountStatus,
    RequirementType,
    SummaryCard,
    UsageLimitsCard,
    onBreadcrumbAction,
} from "@shopify/discount-app-components";
import {
    Banner,
    Card,
    Layout,
    Page,
    TextField,
    Stack,
    PageActions,
} from "@shopify/polaris";
import { data } from "@shopify/app-bridge/actions/Modal";
import { useAppQuery, useAuthenticatedFetch } from "../../../hooks";
import { useState } from "react";

const todaysDate = new Date();
// Metafield that will be used for storing function configuration
const METAFIELD_NAMESPACE = "$app:order-discount-ext";
const METAFIELD_CONFIGURATION_KEY = "function-configuration";


export default function DiscountDetail() {
    // Read the function ID from the URL
    // const { functionId } = useParams();
    const app = useAppBridge();
    const redirect = Redirect.create(app);
    const currencyCode = CurrencyCode.Cad;
    const authenticatedFetch = useAuthenticatedFetch();
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [discountData, setDiscountData] = useState(null);
    const id = searchParams.get("id");
    useAppQuery({
        url: "/api/discount/detail?id=" + id,
        reactQueryOptions: {
          onSuccess: (res) => {
            setDiscountData(res);
            setIsLoading(false);
          },
        },
      });

    // Define base discount form fields
    const {
        fields: {
            discountTitle,
            discountCode,
            discountMethod,
            requirementType,
            requirementSubtotal,
            requirementQuantity,
            usageTotalLimit,
            usageOncePerCustomer,
            startDate,
            endDate,
            configuration,
        },
        submit,
        submitting,
        dirty,
        reset,
        submitErrors,
        makeClean,
    } = useForm({
        fields: {
            discountTitle: useField(isLoading ? "" : discountData.data.automaticDiscountNode.automaticDiscount.title),
            discountMethod: useField(DiscountMethod.Automatic),
            discountCode: useField(""),
            requirementType: useField(RequirementType.None),
            requirementSubtotal: useField("0"),
            requirementQuantity: useField("0"),
            usageTotalLimit: useField(null),
            usageOncePerCustomer: useField(false),
            startDate: useField(isLoading ? todaysDate : discountData.data.automaticDiscountNode.automaticDiscount.startsAt),
            endDate: useField(isLoading ? null: discountData.data.automaticDiscountNode.automaticDiscount.endsAt),
            configuration: { // Add quantity and percentage configuration to form data
                payPeriod: useField(isLoading ? "": JSON.parse(discountData.data.automaticDiscountNode.metafield.value).payPeriod),
                percentage: useField(isLoading ? "": JSON.parse(discountData.data.automaticDiscountNode.metafield.value).percentage),
            }
        },
        onSubmit: async (form) => {
            // Create the discount using the added express endpoints
            const discount = {
                functionId: searchParams.get('functionId'),
                startsAt: form.startDate,
                endsAt: form.endDate,
                metafields: [
                    {
                        namespace: METAFIELD_NAMESPACE,
                        key: METAFIELD_CONFIGURATION_KEY,
                        type: "json",
                        value: JSON.stringify({ // Populate metafield from form data
                            payPeriod: parseInt(form.configuration.payPeriod),
                            percentage: parseFloat(form.configuration.percentage),
                          }),
                    },
                ],
            };

            let response;
            if (form.discountMethod === DiscountMethod.Automatic) {
                response = await authenticatedFetch("/api/discounts/automatic", {
                    method: "POST",
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify({
                        discount: {
                          ...discount,
                          title: form.discountTitle,
                        },
                      }),
                });
            } else {
                response = await authenticatedFetch("/api/discounts/code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        discount: {
                          ...discount,
                          title: form.discountCode,
                          code: form.discountCode,
                        },
                      }),
                });
            }

            const data = (await response.json()).data;
            const remoteErrors = data.discountCreate.userErrors;
            if (remoteErrors.length > 0) {
                return { status: "fail", errors: remoteErrors };
            }

            redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
                name: Redirect.ResourceType.Discount,
            });
            return { status: "success" };
        },
    });

    const errorBanner =
        submitErrors.length > 0 ? (
            <Layout.Section>
                <Banner status="critical">
                    <p>There were some issues with your form submission:</p>
                    <ul>
                        {submitErrors.map(({ message, field }, index) => {
                            return (
                                <li key={`${message}${index}`}>
                                    {field.join(".")} {message}
                                </li>
                            );
                        })}
                    </ul>
                </Banner>
            </Layout.Section>
        ) : null;

    return (
        // Render a discount form using Polaris components and the discount app components
        <Page
            title="Create Order discount"
            breadcrumbs={[
                {
                    content: "Discounts",
                    onAction: () => onBreadcrumbAction(redirect, true),
                },
            ]}
            primaryAction={{
                content: "Save",
                onAction: submit,
                disabled: !dirty,
                loading: submitting,
            }}
        >
            <Layout>
                {errorBanner}
                <Layout.Section>
                    <form onSubmit={submit}>
                        {/* <MethodCard
                            title="Pay Period"
                            discountTitle={discountTitle}
                            discountClass={DiscountClass.Order}
                            discountCode={discountCode}
                            discountMethod={discountMethod}
                        />
                        {discountMethod.value === DiscountMethod.Code && (
                            <UsageLimitsCard
                                totalUsageLimit={usageTotalLimit}
                                oncePerCustomer={usageOncePerCustomer}
                            />
                        )} */}

                        
                        <Card title="Setting">
                            <Card.Section>
                                <Stack>
                                <TextField label="Title" {...discountTitle}/>
                                <TextField label="Pay period" {...configuration.payPeriod} suffix="d" />
                                <TextField label="Discount percentage" {...configuration.percentage} suffix="%" />
                                </Stack>
                            </Card.Section>
                        </Card>
                        <ActiveDatesCard
                            startDate={startDate}
                            endDate={endDate}
                            timezoneAbbreviation="EST"
                        />
                    </form>
                </Layout.Section>
                <Layout.Section secondary>
                    <SummaryCard
                        header={{
                            discountMethod: discountMethod.value,
                            discountDescriptor:
                                discountMethod.value === DiscountMethod.Automatic
                                    ? discountTitle.value
                                    : discountCode.value,
                            appDiscountType: "Pay Period",
                            isEditing: false,
                        }}
                        performance={{
                            status: DiscountStatus.Scheduled,
                            usageCount: 0,
                        }}
                        minimumRequirements={{
                            requirementType: requirementType.value,
                            subtotal: requirementSubtotal.value,
                            quantity: requirementQuantity.value,
                            currencyCode: currencyCode,
                        }}
                        usageLimits={{
                            oncePerCustomer: usageOncePerCustomer.value,
                            totalUsageLimit: usageTotalLimit.value,
                        }}
                        activeDates={{
                            startDate: startDate.value,
                            endDate: endDate.value,
                        }}
                    />
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={{
                            content: "Save discount",
                            onAction: submit,
                            disabled: !dirty,
                            loading: submitting,
                        }}
                        secondaryActions={[
                            {
                                content: "Discard",
                                onAction: () => onBreadcrumbAction(redirect, true),
                            },
                        ]}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    );
}
