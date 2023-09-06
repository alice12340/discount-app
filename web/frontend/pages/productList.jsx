import {
  IndexTable,
  Card,
  Page,
  Layout,
  EmptySearchResult,Loading, Frame, Pagination
} from '@shopify/polaris';
import React, { useRef } from 'react';
import { useState } from "react";
import { TitleBar, Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import ExportProduct from '../components/ExportProduct';

export default function ProductList() {
  const fetch = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  
  useAppQuery({
    url:  "/api/product/List",
    reactQueryOptions: {
      onSuccess: (res) => {
        setData(res);
        setIsLoading(false);
      },
    },
  });

  const getProduct = async (type, cursor) => {
    setIsLoading(true);
    var url = "/api/product/List?type="+type+"&cursor="+cursor;

    try {
      const response = await fetch(url, {
        method: "GET",
      });
      if (response) {
        setData(await response.json());
      } else {
        setIsLoading(false);
        throw Error(response.statusText);
      }
    } catch (error) {
      // setToastProps({
      //   content: "An error occurred while fetching the product list",
      //   error: true,
      // });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };


  const emptyStateMarkup = (
    <EmptySearchResult
      title={'No product yet'}
      description={'Try changing the filters or search term'}
      withIllustration
    />
  );
  const rowMarkup = !isLoading ? data.products.map(
    (
      {id, title, status, totalInventory, featuredImage},
      index,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        // selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell> <img src={featuredImage} alt="" width="50" /></IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
        <IndexTable.Cell>{totalInventory}</IndexTable.Cell>
      </IndexTable.Row>
    )
  )  : "";
  

  const pageInfo = !isLoading ? (
    <div style={{ height: '100px', float: 'right', marginTop: '10px' }}>
      <Pagination
      hasPrevious={ data.pageInfo.hasPreviousPage}
      onPrevious={() => {
        getProduct("pre", data.products[0]['cursor'] )
      }}
      hasNext = { data.pageInfo.hasNextPage}
      onNext={() => {
        getProduct("next", data.products[data.products.length - 1]['cursor'])
      }}
    />
    </div>
  ) : null;
  const [trigger, setTrigger] = useState(0);

  const table_content = !isLoading ? 
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              itemCount={data.products.length}
              emptyState={emptyStateMarkup}
              headings={[
                {title: 'Product'},
                {title: 'Image'},
                {title: 'Status'},
                {title: 'Inventory'},
              
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
          {pageInfo}
          <ExportProduct trigger={trigger}/>
        </Layout.Section>
      </Layout>

      :
      <Frame>
        <Loading />
      </Frame> ;
 
 const multiDataSet = [
  {
    columns: [
      { value: "Product", widthPx: 50 }, // width in pixels
      { value: "Status", widthCh: 20 }, // width in charachters
      // { value: "Image", widthCh: 20 }, // width in charachters
      { value: "Inventory", widthPx: 60, widthCh: 20 }, // will check for width in pixels first
    ],
    data: [
      ["Johnson", 30000, "Male"],
      ["Monika", 355000, "Female"],
      ["Konstantina", 20000, "Female"],
      ["John", 250000, "Male"],
      ["Josef", 450500, "Male"],
    ],
  }
];


  return (
    <Page>
      <TitleBar
        title="Product List"
        primaryAction={{
          content: "Export",
          onAction: () => {
            setTrigger((trigger) => trigger + 1);
          },
        }}
      />
      {table_content}
    </Page>
  );
}