interface PrintLabelData {
  orderNumber: string;
  userName: string;
  userPhone: string;
}

const PRINT_STYLES = `
  @page {
    size: 80mm 50mm;
    margin: 0;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 80mm;
    height: 50mm;
    background: white;
  }
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5mm;
    box-sizing: border-box;
  }
  .barcode-container {
    width: 100%;
    text-align: center;
    margin-bottom: 5mm;
  }
  #barcode {
    width: 100%;
    max-height: 15mm;
  }
  .customer-info {
    text-align: center;
    width: 100%;
  }
  .customer-name {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    color: black;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .customer-phone {
    font-size: 18px;
    margin: 5px 0 0 0;
    color: black;
    font-family: system-ui, -apple-system, sans-serif;
  }
`;

const getLabelTemplate = ({ orderNumber, userName, userPhone }: PrintLabelData) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Print Label - ${orderNumber}</title>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <style>${PRINT_STYLES}</style>
    </head>
    <body>
      <div class="container">
        <div class="barcode-container">
          <svg id="barcode"></svg>
        </div>
        <div class="customer-info">
          <p class="customer-name">${userName}</p>
          <p class="customer-phone">${userPhone}</p>
        </div>
      </div>
      <script>
        JsBarcode("#barcode", "${orderNumber}", {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 0,
          background: "#ffffff"
        });
        
        window.onload = () => {
          let hasPrinted = false;

          window.onbeforeprint = () => {
            hasPrinted = true;
          };

          window.onafterprint = () => {
            window.close();
          };

          setTimeout(() => {
            window.print();
            setTimeout(() => {
              if (!hasPrinted) {
                window.close();
              }
            }, 2000);
          }, 500);
        };
      </script>
    </body>
  </html>
`;

export const printLabel = (data: PrintLabelData): Window | null => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return null;

  printWindow.document.write(getLabelTemplate(data));
  printWindow.document.close();
  
  return printWindow;
}; 