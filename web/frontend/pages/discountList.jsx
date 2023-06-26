import {
  IndexTable,
  Card,
  useIndexResourceState,
  Page,
  Layout,
  TextContainer, Heading, EmptySearchResult, Modal, TextField
} from '@shopify/polaris';
import React from 'react';
import { useState } from "react";
import { TitleBar, Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export default function DiscountList() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDiscount, setIsAddDiscount] = useState(false);
  const [payPeriod, setPayPeriod] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const {
    data,
    refetch: refetchDiscountList,
    isLoading: isLoadingDiscount,
    isRefetching: isRefetchingDiscount,
  } = useAppQuery({
    url: "/api/discount/List",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
        
      },
    },
  });

  
  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const handleModalClose = () => {
    setIsAddDiscount(false);
  };

 
  const handlePayPeriodChange = (value) => {
    setPayPeriod(value);
  };

  const handleDiscountCodeChange = (value) => {
    setDiscountCode(value);
  };

  const handleDiscountPercentageChange = (value) => {
    setDiscountPercentage(value);
  };

  const handleFormSubmit = () => {
    // Do something with the text input
    handleSave();
    setIsAddDiscount(false);
  };

  const handleSave = async () => {
    const response = await fetch("/api/discount/create");

    if (response.ok) {
      await refetchDiscountList();
      setToastProps({ content: "discount created!" });
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error creating discount",
        error: true,
      });
    }
  };


  const {selectedResources, allResourcesSelected, handleSelectionChange} = useIndexResourceState(new Array());
  const emptyStateMarkup = (
    <EmptySearchResult
      title={'No discount yet'}
      description={'Try changing the filters or search term'}
      withIllustration
    />
  );
  const rowMarkup = !isLoading ? data.price_rules.map(
    (
      {id, value, title, value_type},
      index,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{value_type}</IndexTable.Cell>
        <IndexTable.Cell>{value}</IndexTable.Cell>
      </IndexTable.Row>
    )
  )  : "";

  const table_content = !isLoading ? 
  <Card>
    <IndexTable
      resourceName={resourceName}
      itemCount={data.price_rules.length}
      selectedItemsCount={
        allResourcesSelected ? 'All' : selectedResources.length
      }
      onSelectionChange={handleSelectionChange}
      emptyState={emptyStateMarkup}
      headings={[
        {title: 'Discount Name'},
        {title: 'Discount Type'},
        {title: 'Discount Value'},
      
      ]}
    >
      {rowMarkup}
    </IndexTable>
  </Card>
  : '';
 

  return (
    <Page>
      <TitleBar
        title="Discount List"
        primaryAction={{
          content: "Primary action",
          onAction: () => {
            setIsAddDiscount(true);
          },
        }}
        // secondaryActions={[
        //   {
        //     content: "Secondary action",
        //     onAction: () => console.log("Secondary action"),
        //   },
        // ]}
      />
      <Layout>
        <Layout.Section>
      {table_content}
      </Layout.Section>
      </Layout>
      <Modal
        open={isAddDiscount}
        onClose={handleModalClose}
        title="Add Discount"
        primaryAction={{
          content: 'Add',
          onAction: handleFormSubmit,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalClose,
          },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Pay Perid"
            value={payPeriod}
            onChange={handlePayPeriodChange}
          />

          <TextField
            label="Discount Code"
            value={discountCode}
            onChange={handleDiscountCodeChange}
          />

          <TextField
            label="Discount Percentage"
            value={discountPercentage}
            onChange={handleDiscountPercentageChange}
          />

        </Modal.Section>
      </Modal>
    </Page>
  );
}