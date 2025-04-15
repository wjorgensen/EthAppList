import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="navbar container">
      <Link href="/" className="navbar__logo">
        EthAppList
      </Link>
      <ul className="navbar__links">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/categories">Categories</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/submit" className="button primary">
            + Submit Project
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 