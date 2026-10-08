import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          ⟳ Physics 1 <span>Trainer</span>
        </NavLink>
        <nav>
          <NavLink to="/" end>
            Practice
          </NavLink>
          <NavLink to="/equations">Equations</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
