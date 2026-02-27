import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/theme.css";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="container">{children}</div>
      <Footer />
    </>
  );
}

export default Layout;