import React, { ChangeEvent } from "react";
import List from "../components/List";
import { Link } from "react-router-dom";
import { P } from "../components/Text";
import { fetch_api } from "../utils/auth";

const Cart = () => {
  const [data, setData] = React.useState([]);
  const [count, setCount] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [form, setForm] = React.useState({
    customer_name: "",
    table_number: "",
  });

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
  });

  async function getCart() {
    const storage = localStorage.getItem("cart");

    const cart = storage ? JSON.parse(storage) : [];
    setCount(cart);
  }

  function syncData() {
    fetch_api("/food/")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setData(res.data.reverse());
        } else alert("Failed fetching data");
      });
  }

  function updatePrice() {
    const priceTotal = count.reduce(
      (a, b: any) =>
        a + (data.find((item: any) => b.id == item.id) as any)?.price * b.count,
      0
    );
    console.log(data);
    setTotal(priceTotal);
  }
  React.useEffect(() => {
    updatePrice();
  }, [count, data]);
  React.useEffect(() => {
    getCart();
    syncData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function checkout() {
    if (count.length == 0) return alert("Cart can't be empty");
    if (form.customer_name == "" || form.table_number == "")
      return alert("Please input customer information");

    const body = {
      customer_name: form.customer_name,
      table_number: form.table_number,
      order_date: new Date().toLocaleDateString().replace(/\//g, "-"),
      order_detail: count
        .filter((x: any) => x.count > 0)
        .map((item: any) => {
          const food = data.find((x: any) => x.id == item.id) as any;
          return {
            food_id: item.id,
            price: item.count * food.price,
            quantity: item.count,
          };
        }),
    };
    console.log(body);
    const res = await fetch_api("/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());

    if (res.status) {
      localStorage.setItem("cart", "[]");
      alert("Order success");
      window.location.href = "/";
    } else alert(res.message);
  }
  return (
    <React.Fragment>
      <Link to="/" className="font-semibold text-lg m-12 hover:text-gray-700">
        &lt; Choose Menu
      </Link>
      <div className="flex justify-center min-h-full px-8">
        <List count={count} setCount={setCount} data={data} />
        <div className="border border-separate border-gray-400 w-2/5 p-8">
          <P className="font-bold">Customer Information</P>
          <div className="mb-4 flex justify-between gap-2 mt-4">
            <label
              className="block text-gray-700 text-sm font-bold  whitespace-nowrap"
              htmlFor="customer_name"
            >
              Customer Name
            </label>
            <input
              className="max-w-[300px] shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="customer_name"
              type="text"
              placeholder="Ujang"
              name="customer_name"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4 flex justify-between gap-2 mt-4">
            <label
              className="block text-gray-700 text-sm font-bold whitespace-nowrap"
              htmlFor="table_number"
            >
              Table Number
            </label>
            <input
              className="max-w-[300px] shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="table_number"
              type="number"
              placeholder="0"
              name="table_number"
              onChange={handleChange}
            />
          </div>
          <div className="border-b border-separate border-black"></div>
          <P className="font-bold">Order Summary</P>
          <div className="w-full flex justify-between mt-8">
            <P>Items ({count.reduce((a, b: any) => a + b.count, 0)})</P>
            <P>{formatter.format(total)}</P>
          </div>
          <div className="w-full flex justify-between mt-4">
            <P>Tax Charge</P>
            <P>{formatter.format((total * 10) / 100)}</P>
          </div>
          <div className="w-full flex justify-between mt-8 font-bold">
            <P>Grand Price</P>
            <P>{formatter.format((total * 10) / 100 + total)}</P>
          </div>
          <button
            className="px-3 py-2 rounded-md bg-green-500 text-white mt-4 w-full"
            type="button"
            onClick={() => checkout()}
          >
            Process payment at casier
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Cart;
