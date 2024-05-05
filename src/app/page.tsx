import { getProducts } from "@/actions/add.product";
import { Product } from "@/components/product";

export default async function Page() {
  const products = await getProducts()|| [];
  return (
    <main className="min-h-screen max-w-4xl mx-auto">
      <Product products={products} />
    </main>
  );
}
