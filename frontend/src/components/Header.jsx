const Header = () => {
    return (
        <header className="relative overflow-hidden bg-slate-950 py-[47.5px]">
            <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative text-center">
                <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    AYATS
                </p>

                <h1 className="font-dm-serif text-4xl text-white md:text-5xl">
                    Task Management
                </h1>

                <div className="mx-auto mt-4 h-px w-16 bg-indigo-400" />
            </div>
        </header>
    );
};

export default Header;