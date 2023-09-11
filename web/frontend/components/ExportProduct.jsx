import React, { useEffect, useRef, useState } from 'react';
import ExcelJS from 'exceljs';
import { useAuthenticatedFetch } from '../hooks';

export default function ExportProduct({ trigger, queryUrl, updateLoading}) {
  const fetch = useAuthenticatedFetch();
  const myFunctionRef = useRef();
  const [isLoading, setIsLoading] = useState(null);

  const exportData = async () => {
    try {
      let currentPage = 1;
      let allData = [];
      let url = queryUrl;

      while (true) {
        setIsLoading(true);
        const response = await fetch(url, {
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          allData = allData.concat(data.products);
          url = url + `&type=next&cursor=${data.products[data.products.length - 1]['cursor']}`;
          currentPage++;
          if (!data.pageInfo.hasNextPage) {
            // No more records, exit the loop
            setIsLoading(false);
            break;
          }
        } else {
          throw Error(response.statusText);
        }
      }

      if (!isLoading) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        // worksheet.properties.defaultRowHeight = 100;
        worksheet.columns = [
          { header: 'Image', key: 'image', width: 10},
          { header: 'Title', key: 'title', width: 40 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Inventory', key: 'totalInventory', width: 15 },
        ];


        for (let i = 0; i < allData.length; i++) {
          const row = allData[i];
          const rowNumber = i + 1; // Adjust row number to skip the header row
      
          // Fetch image data
          const imageData = await fetchImage(row.featuredImage);

            // Create a new image object to get the width and height
          const image = new Image();
          image.src = `data:image/jpeg;base64,${imageData}`;

          // Wait for the image to load
          await new Promise((resolve) => {
            image.onload = resolve;
          });

      
          // Add data row
          const newRow = worksheet.addRow([
            '', // Placeholder for image
            row.title,
            row.status,
            row.totalInventory,
          ]);
      
          // Embed image
          const imageId = workbook.addImage({
            base64: imageData,
            extension: 'jpeg',
          });

          const cell = worksheet.getCell(`A${rowNumber + 1}`); // Get the cell containing the image
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }, // Set the background color of the cell to white
          };

          // Calculate the aspect ratio of the image
          const aspectRatio = image.width / image.height;

          // Set the desired width and height
          const desiredWidth = 50; // Adjust as needed
          const desiredHeight = desiredWidth / aspectRatio;

          // Set the image position and dimensions
          worksheet.addImage(imageId, {
            tl: { col: 0, row: rowNumber }, // Adjust the column number to match the image column
            // br: { col: 1, row: rowNumber + 1 },
            ext: { width: desiredWidth, height: desiredHeight }, // Set the desired width and height
            editAs: 'oneCell',
          });
        }
        //Record table's last row
        const firstTableRowNum = 1;
        let lastRowNum = worksheet.lastRow.number;
        const lastTableRowNum = lastRowNum;
                //Loop through all table's row
        for (let i=firstTableRowNum; i<= lastTableRowNum; i++) {
          const row = worksheet.getRow(i);

          //Now loop through every row's cell and finally set alignment
          row.eachCell({includeEmpty: true}, (cell => {
            if (cell._address.indexOf("B") !== -1 || cell._address.indexOf("A") !== -1) {
              cell.alignment = { vertical: 'middle', wrapText: true };
            }
          }));
        }
       

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        updateLoading(false);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'data.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log('Error exporting data:', error);
    }
  };

  useEffect(() => {
    if (trigger) {
      exportData();
    }
  }, [trigger]);
  const fetchImage = async (imageUrl) => {
    const response = await fetch(imageUrl);
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      throw Error(response.statusText);
    }
  };

  return (
    <div></div>
  );
}