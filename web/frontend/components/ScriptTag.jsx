import { useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ScriptTag() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();

  // const {
  //   data,
  //   // refetch: refetchProductCount,
  //   isLoading: isLoadingCount,
  //   isRefetching: isRefetchingCount,
  // } = useAppQuery({
  //   url: "/api/installScriptTag",
  //   reactQueryOptions: {
  //     onSuccess: () => {
  //       setIsLoading(false);
  //     },
  //   },
  // });

  const toastMarkup = toastProps.content && !isLoading && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  // const handlePopulate = async () => {
  //   setIsLoading(true);
  //   const response = await fetch("/api/products/create");

  //   if (response.ok) {
  //     await refetchProductCount();
  //     setToastProps({ content: "5 products created!" });
  //   } else {
  //     setIsLoading(false);
  //     setToastProps({
  //       content: "There was an error creating products",
  //       error: true,
  //     });
  //   }
  // };

  const handleFetch = async () => {
    setIsLoading(true);
    const response = await fetch("/api/installScriptTag");

    if (response.ok) {
      // await refetchProductCount();
      setIsLoading(false);
      setToastProps({ content: " script tag installed sucessful" });
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error install script tags",
        error: true,
      });
    }
  };

  return (
    <>
      {toastMarkup}
      {/* <Card
        title="Product Counter"
        sectioned
        primaryFooterAction={{
          content: "Populate 5 products",
          onAction: handlePopulate,
          loading: isLoading,
        }}
      > */}

      <Card
        title="Install script tags"
        sectioned
        primaryFooterAction={{
          content: "install",
          onAction: handleFetch,
          loading: false,
        }}
      >
        <TextContainer spacing="loose">
          <p>
            Before run this app, please install script tag.
          </p>
        
        </TextContainer>
      </Card>
    </>
  );
}
