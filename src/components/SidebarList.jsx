import SidebarListItem from "./SidebarListItem";
import { CircularProgress } from "@mui/material";
import { CancelOutlined, SearchOutlined } from "@mui/icons-material";

function SidebarList({ title, data }) {
  if (!data) {
    return (
      <div className="loader__container sidebar__loader">
        <CircularProgress />
      </div>
    );
  }

  if (!data.length && title === "Search Results") {
    return (
      <div className="no-result">
        <div>
          <SearchOutlined />
          <div className="cancel-root">
            <CancelOutlined />
          </div>
        </div>
        <h2>No {title}</h2>
      </div>
    );
  }

  return (
    <div className="sidebar__chat--container">
      <h2>{title}</h2>
      {data.map((item) => (
        <SidebarListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default SidebarList;
