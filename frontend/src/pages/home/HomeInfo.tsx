function HomeInfo() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full max-w-[600px] flex-col justify-center gap-6 px-16">
      <span className="text-sm tracking-widest text-emerald-400">
        A STONE WITH A SOUL
      </span>
      <h1 className="text-5xl font-semibold uppercase leading-tight text-white">
        Stone Products
        <br />
        <span className="text-emerald-400">для вашего дома</span>
      </h1>
      <div className="pointer-events-auto flex gap-4">
        <button className="bg-emerald-600 px-6 py-3 text-sm uppercase text-white hover:bg-emerald-700">
          Calculate the cost
        </button>
        <button className="border border-white/40 px-6 py-3 text-sm uppercase text-white hover:bg-white/10">
          Contact Us
        </button>
      </div>
    </div>
  );
}

export default HomeInfo;
