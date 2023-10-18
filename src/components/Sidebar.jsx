"use client";

import {
  Add,
  ExitToApp,
  Home,
  Message,
  PeopleAlt,
  SearchOffOutlined,
} from "@mui/icons-material";

import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "@/utils/firebase";

import SidebarTab from "./SidebarTab";
import SidebarList from "./SidebarList";
import { useRouter } from "next/navigation";
import { useState } from "react";

import useGroups from "@/hooks/useGroups";
import useUsers from "@/hooks/useUsers";
import useChats from "@/hooks/useChats";

const tabs = [
  {
    id: 1,
    icon: <Home />,
  },
  {
    id: 2,
    icon: <Message />,
  },
  {
    id: 3,
    icon: <PeopleAlt />,
  },
];

function Sidebar({ user }) {
  const [menu, setMenu] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const router = useRouter();
  const groups = useGroups();
  const users = useUsers(user);
  const chats = useChats(user);

  //create new group
  const createGroup = async () => {
    const randomNum = Math.floor(Math.random() * (999 - 100 + 1)) + 100;

    if (groupName?.trim()) {
      const colRef = collection(db, "groups");
      const newGroup = await addDoc(colRef, {
        name: groupName,
        timestamp: serverTimestamp(),
        photoURL: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomNum}`
      });
      
      setCreatingGroup(false);
      setGroupName("");
      setMenu(2);
      router.push(`/?chatId=${newGroup.id}`);
    }
  };

  //search for user or group
  const searchUsersAndGroups = async (e) => {
    e.preventDefault();
    const searchValue = e.target.elements.search.value;
    const userQuery = query(
      collection(db, "users"),
      where("name", "==", searchValue)
    );
    const groupQuery = query(
      collection(db, "groups"),
      where("name", "==", searchValue)
    );
    //
    const userSnapshot = await getDocs(userQuery);
    const groupSnapshot = await getDocs(groupQuery);
    //
    const userResults = userSnapshot?.docs.map((doc) => {
      const id =
        doc.id > user.uid ? `${doc.id}${user.uid}` : `${user.uid}${doc.id}`;
      return { id, ...doc.data() };
    });
    const groupResults = groupSnapshot?.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const searchResults = [...userResults, ...groupResults];
    setMenu(4);
    setSearchResults(searchResults);
  };

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__header--left">
          <Avatar src={user.photoURL} alt={user.displayName} />
          <h4>{user.displayName}</h4>
        </div>
        <div className="sidebar__header--right">
          <IconButton onClick={() => auth.signOut()}>
            <ExitToApp />
          </IconButton>
        </div>
      </div>

      {/*search  */}
      <div className="sidebar__search">
        <form
          onSubmit={searchUsersAndGroups}
          className="sidebar__search--container"
        >
          <SearchOffOutlined />
          <input
            type="text"
            id="search"
            placeholder="Search for users or rooms"
          />
        </form>
      </div>

      <div className="sidebar__menu">
        {tabs.map((tab) => (
          <SidebarTab
            key={tab.id}
            onClick={() => setMenu(tab.id)}
            isActive={tab.id === menu}
          >
            <div className="sidebar__menu--home">
              {tab.icon}
              <div className="sidebar__menu--line"></div>
            </div>
          </SidebarTab>
        ))}
      </div>

      {menu === 1 ? (
        <SidebarList title="Chats" data={chats} />
      ) : menu === 2 ? (
        <SidebarList title="Groups" data={groups} />
      ) : menu === 3 ? (
        <SidebarList title="Users" data={users} />
      ) : menu === 4 ? (
        <SidebarList title="Search Results" data={searchResults} />
      ) : null}

      {/* room button */}
      <div className="sidebar__chat--addRoom">
        <IconButton onClick={() => setCreatingGroup(true)}>
          <Add />
        </IconButton>
      </div>

      {/* dialog box */}
      <Dialog open={creatingGroup} onClose={() => setCreatingGroup(false)}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of your public group. Every user will be able to join
            this group
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Group name"
            type="text"
            fullWidth
            variant="filled"
            style={{ marginTop: 20 }}
            onChange={(e) => setGroupName(e.target.value)}
            value={groupName}
            id="groupName"
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setCreatingGroup(false)}>
            Cancel
          </Button>
          <Button color="success" onClick={createGroup}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Sidebar;
