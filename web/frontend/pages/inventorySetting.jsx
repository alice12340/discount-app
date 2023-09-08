import { useForm, useField } from "@shopify/react-form";
import { Toast } from "@shopify/app-bridge/actions";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";


import {
    Banner,
    Card,
    Layout,
    Page,
    TextField,
    Stack,
    PageActions
} from "@shopify/polaris";
import { data } from "@shopify/app-bridge/actions/Modal";
import { useState } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";


export default function InventorySetting() {
    const app = useAppBridge();
    const authenticatedFetch = useAuthenticatedFetch();
    const [isLoading, setIsLoading] = useState(true);
    const [minInventory, setMinInventory] = useState(null);

    const showToast = () => {
        const toastOptions = {
            message: 'Update min inventory success',
            duration: 5000, // Duration in milliseconds (e.g., 5 seconds)
            isError: false, // Set it to true if it's an error message
        };
        
        const toastNotice = Toast.create(app, toastOptions);
        toastNotice.dispatch(Toast.Action.SHOW);
    };
    useAppQuery({
        url: "/api/inventorySetting/detail",
        reactQueryOptions: {
          onSuccess: (res) => {
            setMinInventory(res);
            setIsLoading(false);
          },
        },
      });

    // Define base discount form fields
    const {
        fields: {
            minInventorySetting,
        },
        submit,
        submitting,
        dirty,
        reset,
        submitErrors,
        makeClean,
    } = useForm({
        fields: {
            minInventorySetting: useField(isLoading ? "" : minInventory),
        },
        onSubmit: async (form) => {
            const inventorySetting = {
               minInventory: form.minInventorySetting
            };
            let response;
            try {
                response = await authenticatedFetch("/api/updateMinInventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inventorySetting,
                }),
                });

                if (response && response.ok) {
                    showToast();
                    makeClean();
                } else {
                    // Handle the error case
                    console.error("Error occurred during form submission:", response);
                }
            } catch (error) {
                // Handle any exceptions thrown during the fetch request
                console.error("Error occurred during form submission:", error);
            } 
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
            title="Min Inventory Setting"
            primaryAction={{
                content: "Save",
                onAction: submit,
                disabled: !dirty,
                loading: submitting,
            }}
        >
            <TitleBar
                title="Inventory Setting"
            
            />
            <Layout>
                {errorBanner}
                <Layout.Section>
                    <form onSubmit={submit}>
                        <Card title="Setting">
                            <Card.Section>
                                <Stack>
                                <TextField label="Min Inventory" {...minInventorySetting}/>
                                </Stack>
                            </Card.Section>
                        </Card>
                    </form>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
