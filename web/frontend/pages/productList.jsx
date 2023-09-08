import {
  IndexTable,
  Card,
  Page,
  Layout,
  EmptySearchResult,
  Loading,
  Frame,
  Pagination
} from '@shopify/polaris';

import {
  TextField,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  IndexFiltersMode,
  useIndexResourceState,
  Text,
  ChoiceList,
  RangeSlider,
  Badge,
} from '@shopify/polaris';
import React, { useEffect, useRef } from 'react';
import { useState } from "react";
import { TitleBar, Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import ExportProduct from '../components/ExportProduct';
import {useCallback} from 'react';

export default function ProductList() {
  const fetch = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [isExportLoading, setIsExportLoading] = useState(false);

  const updateLoading = (newLoading) => {
    setIsExportLoading(newLoading);
  };

  
  const [data, setData] = useState(null);
  const [queryValue, setQueryValue] = useState('');
  const [sortSelected, setSortSelected] = useState(['TITLE asc']);
  const [trigger, setTrigger] = useState(0);
  const [selected, setSelected] = useState(0);
  const [queryUrl, setQueryUrl] = useState('');
  const [itemStrings, setItemStrings] = useState([
    'All',
    'Active',
    'Draft',
    'Archived',
  ]);


  const [filterQueryStatus, setFilterQueryStatus] = useState('');
  const [filterQueryTag, setFilterQueryTag] = useState('');

  const [productStatus, setProductStatus] = useState(
    undefined
  );
 
  const [taggedWith, setTaggedWith] = useState('');

  useAppQuery({
    url: "/api/product/List?&queryValue="+queryValue+"&sortSelected="+sortSelected,
    reactQueryOptions: {
      onSuccess: (res) => {
        setData(res);
        setIsLoading(false);
      },
    },
  });

  const getProduct = (type, cursor) => {
    var url = "/api/product/List?&queryValue="+queryValue+"&sortSelected="+sortSelected+"&type="+type+"&cursor="+cursor;
    getProductList(url);
  };

  const getProductList = async(url) => {
    let queryUrlTem = url.indexOf("&type") !== -1 ? url.substring(0, url.indexOf("&type")) : url;
    setQueryUrl(queryUrlTem);
    setIsLoading(true);
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
  }

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
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell width={20}>{title}</IndexTable.Cell>
        <IndexTable.Cell> <img src={featuredImage} alt="" width="50" /></IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
        <IndexTable.Cell>{totalInventory}</IndexTable.Cell>
      </IndexTable.Row>
    )
  )  : "";

  const indexTable = !isLoading ? (
    <IndexTable
              itemCount={data.products.length}
              emptyState={emptyStateMarkup}
              headings={[
                {title: 'Product'},
                {title: 'Image'},
                {title: 'Status'},
                {title: 'Inventory'},
              
              ]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
            
  ): "";

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


  const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

  const deleteView = (index) => {
    const newItemStrings = [...itemStrings];
    newItemStrings.splice(index, 1);
    setItemStrings(newItemStrings);
    setSelected(0);
  };

  const duplicateView = async (name) => {
    setItemStrings([...itemStrings, name]);
    setSelected(itemStrings.length);
    await sleep(1);
    return true;
  };


  const onHandleSave = async () => {
    await sleep(1);
    
    filterProduct('filter', )
  };

 
  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              type: 'rename',
              onAction: () => {},
              onPrimaryAction: async (value) => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                await sleep(1);
                setItemStrings(newItemsStrings);
                return true;
              },
            },
            {
              type: 'duplicate',
              onPrimaryAction: async (value) => {
                await sleep(1);
                duplicateView(value);
                return true;
              },
            },
            {
              type: 'edit',
            },
            {
              type: 'delete',
              onPrimaryAction: async () => {
                await sleep(1);
                deleteView(index);
                return true;
              },
            },
          ],
  }));
  const onCreateNewView = async (value) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };

  const setSelectedChange = (index) => {
    setSelected(index)
    if (index === 0){
      setFilterQueryStatus("");
    }else{
      setFilterQueryStatus("status:" + itemStrings[index].toUpperCase());
    }
    
  };


  
  const handleFiltersQueryChange = useCallback(
    (value) => {
      setQueryValue(value)
    },
    [],
  );
  const sortOptions = [
    {label: 'Title', value: 'TITLE asc', directionLabel: 'A-Z'},
    {label: 'Title', value: 'TITLE desc', directionLabel: 'Z-A'},
    {label: 'Inventory', value: 'INVENTORY_TOTAL asc', directionLabel: 'Lowest to highest'},
    {label: 'Inventory', value: 'INVENTORY_TOTAL desc', directionLabel: 'Highest to lowest'},
  ];

  // const {mode, setMode} = useSetIndexFiltersMode();
  const {mode, setMode} = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const primaryAction =
    selected === 0
      ? {
          type: 'save-as',
          onAction: onCreateNewView,
          disabled: false,
          loading: false,
        }
      : {
          type: 'save',
          onAction: onHandleSave,
          disabled: false,
          loading: false,
        };

  const onHandleCancel = () => {
    setQueryValue('');
  };



  const handleProductStatusChange = useCallback(
    (value) => {
      setProductStatus(value);
      if (value){
        setFilterQueryStatus("status:" + value);
      }else{
        setFilterQueryStatus("");
      }
      
    },
    [],
  );
 
  const handleTaggedWithChange = useCallback(
    (value) => {
      setTaggedWith(value);
      if (taggedWith){
        setFilterQueryTag("tag:" + taggedWith);
      }else{
        setFilterQueryTag("");
      }
    },
    [],
  );

  const handleProductStatusRemove = useCallback(
    () => setProductStatus(undefined),
    [],
  );
  
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleFiltersClearAll = useCallback(() => {
    handleProductStatusRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleProductStatusRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  
  const filters = [
    {
      key: 'productStatus',
      label: 'Product status',
      filter: (
        <ChoiceList
          title="Product status"
          // titleHidden
          choices={[
            {label: 'Active', value: 'ACTIVE'},
            {label: 'Draft', value: 'DRAFT'},
            {label: 'Archived', value: 'ARCHIVED'},
          ]}
          selected={productStatus || []}
          onChange={handleProductStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'taggedWith',
      label: 'Tagged with',
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
   
  ];

  const appliedFilters = [];
  if (productStatus && !isEmpty(productStatus)) {
    const key = 'productStatus';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, productStatus),
      onRemove: handleProductStatusRemove,
    });
  }
  // if (moneySpent) {
  //   const key = 'moneySpent';
  //   appliedFilters.push({
  //     key,
  //     label: disambiguateLabel(key, moneySpent),
  //     onRemove: handleMoneySpentRemove,
  //   });
  // }
  if (!isEmpty(taggedWith)) {
    const key = 'taggedWith';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, taggedWith),
      onRemove: handleTaggedWithRemove,
    });
  }
  function disambiguateLabel(key, value) {
    switch (key) {
      // case 'moneySpent':
      //   return `Money spent is between $${value[0]} and $${value[1]}`;
      case 'taggedWith':
        return `Tagged with ${value}`;
      case 'productStatus':
        return (value).map((val) => `Product ${val}`).join(', ');
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }

  useEffect(() => {
    var url = "/api/product/List?type=next&filterQueryStatus="+filterQueryStatus+"&filterQueryTag="+filterQueryTag+"&queryValue="+queryValue+"&sortSelected="+sortSelected;
    getProductList(url);
  },[queryValue, sortSelected, filterQueryStatus, filterQueryTag]);
 

  const table_content =
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={sortSelected}
              queryValue={queryValue}
              queryPlaceholder="Searching in all"
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={() => {setQueryValue('')}}
              onSort={setSortSelected}
              primaryAction={primaryAction}
              cancelAction={{
                onAction: onHandleCancel,
                disabled: false,
                loading: false,
              }}
              tabs={tabs}
              selected={selected}
              onSelect={setSelectedChange}
              canCreateNewView={false}
              // onCreateNewView={onCreateNewView}
              filters={filters}
              appliedFilters={appliedFilters}
              hideFilters
              onClearAll={handleFiltersClearAll}
              mode={mode}
              setMode={setMode}
              loading={isLoading}
            />
            
             {indexTable}
           
          </LegacyCard>
          {pageInfo}
          <ExportProduct trigger={trigger} queryUrl={queryUrl} updateLoading={updateLoading}/>
        </Layout.Section>
      </Layout>

      // :
      // <Frame>
      //   <Loading />
      // </Frame> ;
 
 
  return (
    <Page>
      <TitleBar
        title="Product List"
        primaryAction={{
          content: "Export",
          onAction: () => {
            setIsExportLoading(true);
            setTrigger((trigger) => trigger + 1);

          },
          loading: isExportLoading,
        }}
      />
      {table_content}
    </Page>
  );
}