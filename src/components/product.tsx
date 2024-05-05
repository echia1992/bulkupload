"use client"

import { ProductProps, createBulkProducts } from "@/actions/add.product";
import { useState } from "react";
import * as XLSX from "xlsx";
// interface Product {
//   id: string;
//   name: string;
//   color: string;
//   category: string;
//   price: number;
// }
export const Product = ({ products }: { products: any }) => {
    const [file, setFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [processingTime, setProcessingTime] = useState(0);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");


    const previewData = () => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (data) {
                const workbook = XLSX.read(data as string, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                setJsonData(JSON.stringify(json, null, 2));
            }
        };
        reader.readAsBinaryString(file as Blob);
    };

    const CreateBulkProduct = async () => {
        setLoading(true);
        const startTime = new Date().getTime();
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            if (data) {
                const workbook = XLSX.read(data as string, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: ProductProps[] = XLSX.utils.sheet_to_json(worksheet);
                try {
                    const response = await createBulkProducts(json);
                    setLoading(false);
                    const endTime = new Date().getTime();
                    const elapsedSeconds = Math.round((endTime - startTime) / 1000);
                    setProcessingTime(elapsedSeconds);

                    if (response && typeof response === "object" && response.hasOwnProperty("message")) {
                        setMessage((response as any).message);
                    }
                } catch (error) {
                    setLoading(false);
                    console.log(error);
                }
            }
        };
        reader.readAsBinaryString(file as Blob);
    };

    const renderLoadingMessage = () => {
        if (processingTime > 60) {
            return "Please take some cafe while we create your product to the database";
        } else if (processingTime > 30) {
            return "Please relax we are still creating the product";
        } else {
            return "Creating products, please wait...";
        }
    };
// Function to handle row click (selection)
 const handleRowClick = (product: any) => {
    const isSelected = selectedRows.some((row) => row.id === product.id);
    if (isSelected) {
        const updatedSelectedRows = selectedRows.filter((row) => row.id !== product.id);
        setSelectedRows(updatedSelectedRows);
    } else {
        setSelectedRows([...selectedRows, product]);
    }
};

const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    if (isChecked) {
        setSelectedRows([...products]);
    } else {
        setSelectedRows([]);
    }
};

    // // Function to handle row click (selection)
    // const handleRowClick = (product: any) => {
    //     const isSelected = selectedRows.some((row) => row.id === product.id);
    //     if (isSelected) {
    //         const updatedSelectedRows = selectedRows.filter((row) => row.id !== product.id);
    //         setSelectedRows(updatedSelectedRows);
    //     } else {
    //         setSelectedRows([...selectedRows, product]);
    //     }
    // };

    // Function to download selected data as XLSX
    const handleDownloadSelectedData = () => {
        if (selectedRows.length === 0) {
            alert("Please select data to download.");
            return;
        }

    
        
        const selectedData = selectedRows.map((row) => ({
            Name: row.name,
            Color: row.color,
            Category: row.category,
            Price: row.price,
        }));

        const worksheet = XLSX.utils.json_to_sheet(selectedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Products");
        XLSX.writeFile(workbook, "selected_products.xlsx");
    };
    // const handleSelectAllClick = () => {
    //             if (selectedRows.length === products.length) {
    //                 setSelectedRows([]);
    //             } else {
    //                 setSelectedRows([...products]);
    //             }
    //     };


    const filteredProducts = products.filter((product:any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="py-8 space-y-8">
            <div className="flex items-center py-8 gap-2 px-6">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">
                    Upload file
                </label>
                <input
                    className="block w-52 text-sm  border-gray-300 rounded-lg cursor-pointer bg-gray-50   focus:outline-none "
                    id="file_input"
                    type="file"
                    accept=".xlx,.xlsx,.csv"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
                <button onClick={previewData} className="bg-gray-500 text-white rounded py-1 px-4">
                    Preview Data
                </button>
                <button onClick={CreateBulkProduct} className="bg-blue-500 text-white rounded py-1 px-4">
                    Upload Bulk Data
                </button>
                <button className="bg-red-500 text-white rounded py-1 px-4">Clear Data</button>
                <button className="bg-green-500 text-white rounded py-1 px-4">Create Product</button>
                <button className="bg-blue-500 text-white rounded py-1 px-4" onClick={handleDownloadSelectedData}>
                    Download Selected Data
                </button>
            </div>
            <div>
                <pre>{jsonData}</pre>
                {loading ? (
                    <div className="w-full h-screen justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
                        <svg
                            aria-hidden="true"
                            role="status"
                            className="inline w-4 h-4 me-3 text-white animate-spin"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="#E5E7EB"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentColor"
                            />
                        </svg>
                        {renderLoadingMessage()}
                    </div>
                ) : (
                        <div className="relative overflow-x-auto">
                             <div className="pb-4 py-2 px-4 bg-white ">
                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="table-search"
                            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search for items"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    
                                </div>
                                 <p className="text-end ">You selected :{selectedRows.length}</p>
                </div>
                 <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="p-4">
                                            <div className="flex items-center ">
                                               
                                    <input
                                        id="checkbox-all-search"
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedRows.length === filteredProducts.length}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Product name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Color
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Price
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product: any) => {
                            const isSelected = selectedRows.some((row) => row.id === product.id);
                            return (
                                <tr
                                    key={product.id}
                                    className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isSelected ? "bg-blue-100" : ""}`}
                                    onClick={() => handleRowClick(product)}
                                >
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input
                                                id={`checkbox-table-search-${product.id}`}
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                checked={selectedRows.some((row) => row.id === product.id)}
                                                onChange={() =>handleRowClick(product)}
                                            />
                                            <label htmlFor={`checkbox-table-search-${product.id}`} className="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {product.name}
                                    </th>
                                    <td className="px-6 py-4">
                                        {product.color}
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.category}
                                    </td>
                                    <td className="px-6 py-4">
                                        ${product.price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                    </div>
                )}
            </div>
        </div>
    );
};





// "use client"
// import { ProductProps, createBulkProducts } from "@/actions/add.product";
// import { revalidatePath } from "next/cache";
// import { use, useState } from "react"
// import * as XLSX from "xlsx";


// interface Product {
//   id: string; // Assuming id is a string
//   name: string;
//   color: string;
//   category: string;
//   price: number;
// }

// export const Product = ({products}:{products:any}) => {
//     const [file, setFile] = useState<File | null>(null);
//     const [jsonData, setJsonData] = useState("");
//     const [loading, setLoading] = useState(false);
//     // console.log(product);

//     const previewData =() => {
//         const reader = new FileReader()
//         reader.onload = (e) => {
//             const data = e.target?.result
//             if (data) {
//                 const workbook = XLSX.read(data, { type: "binary" });
//                 const sheetName = workbook.SheetNames[0];

//                 const worksheet = workbook.Sheets[sheetName];

//                 //json
//                 const json = XLSX.utils.sheet_to_json(worksheet);
//                 setJsonData(JSON.stringify(json, null, 2));
//             }
//         }
//         reader.readAsBinaryString(file);
//     }
//     const CreateBulkProduct = () => {
//          setLoading(true)
//         const reader = new FileReader()
//         reader.onload = async(e) => {
//             const data = e.target?.result
//             if (data) {
//                 const workbook = XLSX.read(data, { type: "binary" });
//                 const sheetName = workbook.SheetNames[0];

//                 const worksheet = workbook.Sheets[sheetName];

//                 //json
//                 const json:ProductProps[] = XLSX.utils.sheet_to_json(worksheet);
//                 // setJsonData(JSON.stringify(json, null, 2));

//                 try {
//                     await createBulkProducts(json);
//                     setLoading(false)
//                     // revalidatePath();
//                 } catch (error) {
//                     setLoading(false)
//                     console.log(error)

//                 }
//             }
//         }
//         reader.readAsBinaryString(file as Blob);
//     }
//   return (
//       <div className='py-8 space-y-8'>
//           <div className="flex items-center py-8 gap-2 px-6">      
//               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
//                   htmlFor="file_input">Upload file</label>
//               <input className="block w-52 text-sm  border-gray-300 rounded-lg cursor-pointer bg-gray-50   focus:outline-none "
//                   id="file_input" type="file"
//                   accept=".xlx,.xlsx,.csv"
//                   onChange={(e)=>setFile(e.target.files?e.target.files[0]:null)}
                  
//               />
//             <button onClick={previewData} className="bg-gray-500 text-white rounded py-1 px-4">Preview Data</button>
//           <button onClick={CreateBulkProduct} className="bg-blue-500 text-white rounded py-1 px-4">upload Bulk Data</button>
//               <button className="bg-red-500 text-white rounded py-1 px-4">Clear Data</button>
//             <button className="bg-green-500 text-white rounded py-1 px-4">Create Product</button>

//           </div>
//           <div>
//               <pre>{jsonData}</pre>

//               {loading ? (
//               <div  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
//             <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
//             <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
//             </svg>
//                 create products please wait...
//             </div>
//               ) : (
                

//         <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
//     <div className="pb-4 py-2 px-4 bg-white dark:bg-gray-900">
//         <label htmlFor="table-search" className="sr-only">Search</label>
//         <div className="relative mt-1">
//             <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
//                 <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
//                     <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
//                 </svg>
//             </div>
//             <input type="text" id="table-search" className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for items"/>
//         </div>
//     </div>
//     <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//             <tr>
//                 <th scope="col" className="p-4">
//                     <div className="flex items-center">
//                         <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
//                         <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
//                     </div>
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                     Product name
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                     Color
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                     Category
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                     Price
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                     Action
//                 </th>
//             </tr>
//         </thead>
//         <tbody>
         
//                            {
//                                       products.map((product: any) => {
//                                        return (
//                  <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
//                 <td className="w-4 p-4">
//                     <div className="flex items-center">
//                         <input id="checkbox-table-search-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
//                         <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
//                     </div>
//                 </td>
//                 <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                     {product.name}
//                 </th>
//                 <td className="px-6 py-4">
//                     {product.color}
//                 </td>
//                 <td className="px-6 py-4">
//                     {product.category}
//                 </td>
//                 <td className="px-6 py-4">
//                     ${product.price}
//                 </td>
//                 <td className="px-6 py-4">
//                     <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
//                 </td>
//             </tr>
//                                           )
//                                       })
//         }
            
//         </tbody>
//     </table>
// </div>

//   )}


//           </div>
//     </div>
//   )
// }
