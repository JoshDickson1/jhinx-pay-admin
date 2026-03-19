import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const isIndex = location.pathname === "/";

  return (
    <nav className="text-sm flex flex-row items-center gap-1 text-muted-foreground dark:text-gray-400">
      
      {/* Show "Overview /" only on the Index page */}
      {isIndex && (
        <div className="flex items-center gap-1">
          <span>Overview</span>
          <span className="text-xs text-muted-foreground">/</span>
        </div>
      )}

      {/* Dashboard Segment */}
      <div className="previouspage">
        {isIndex ? (
          <span className="text-yellow-500 dark:text-yellow-600 font-medium">
            Dashboard
          </span>
        ) : (
          <Link 
            to="/" 
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Dashboard
          </Link>
        )}
      </div>

      {/* Dynamic segments (only rendered if not on index) */}
      {!isIndex && pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const name = isUUID
  ? `${value.slice(0, 8)}…`
  : value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        return (
          <div key={to} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">/</span>
            {last ? (
              <span className="text-yellow-500 dark:text-yellow-600 font-medium">
                {name}
              </span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;