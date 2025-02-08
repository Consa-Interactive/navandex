import React, { Suspense } from "react";
import OrdersPage from "./order-page";

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPage />
    </Suspense>
  );
}

export default Page;
