import { Avatar } from "@mui/material";
import Link from "next/link";

function SidebarListItem({item}) {
    return ( 
        <Link className="link" href={`/?chatId=${item.id}`}>
            <div className="sidebar__chat">
                <div className="avatar__container">
                    <Avatar
                      src={item.image || `https://avatars.dicebear.com/api/jdenticon/${item.id}.svg`}
                      style={{width: 45, height: 45 }}
                    />
                </div>
                <div className="sidebar__chat--info">
                    <h2>{item.name}</h2>
                </div>
            </div>
        </Link>
     );
}

export default SidebarListItem;