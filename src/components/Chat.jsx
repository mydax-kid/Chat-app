"use client";

import useChat from "@/hooks/useChat";
import { AddPhotoAlternate, MoreVert } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { nanoid } from "nanoid";
import MediaPreview from "./MediaPreview";
import ChatFooter from "./ChatFooter";
import { db, storage } from "@/utils/firebase";
import Compressor from "compressorjs";
import useChatMessages from "@/hooks/useChatMessages";
import ChatMessages from "./ChatMessages";
import {
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";


const Chat = ({ user }) => {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId") ?? "";
  const userId = user.uid;

  const [src, setSrc] = useState("");
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [audioId, setAudioId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [isDeleting, setDeleting] = useState(false);

  const chat = useChat(chatId, userId);
  const messages = useChatMessages(chatId);

  if (!chat) return null;

  function showImagePreview(e) {
    const file = e.target.files[0];
    //
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSrc(reader.result);
      };
    }
  }

  //////////////////////////
  function closePreview() {
    setSrc("");
    setImage(null);
  }

  /////////////////////////////
  async function sendMessage(e) {
    e.preventDefault();
    setInput("");

    if (image) closePreview();

    const imageName = nanoid();

    await setDoc(doc(db, `users/${userId}/chats/${chatId}`), {
      name: chat.name,
      photoURL: chat.photoURL || null,
      timestamp: serverTimestamp(),
    });

    const newDoc = await addDoc(collection(db, `groups/${chatId}/messages`), {
      name: user.displayName,
      message: input,
      uid: user.uid,
      timestamp: serverTimestamp(),
      time: new Date().toUTCString(),
      ...(image ? { imageUrl: "uploading", imageName } : {}),
    });

    if (image) {
      new Compressor(image, {
        quality: 0.8,
        maxWidth: 1920,
        async success(result) {
          setSrc("");
          setImage(null);
          await uploadBytes(ref(storage, `images/${imageName}`), result);
          const url = await getDownloadURL(ref(storage, `images/${imageName}`));
          await updateDoc(doc(db, `groups/${chatId}/messages/${newDoc.id}`), {
            imageUrl: url,
          });
        },
      });
    }
  }

  /////////////////////////////
  async function deleteChat() {
    setOpenMenu(null);
    setDeleting(true);

    try {
      const userChatsRef = doc(db, `users/${userId}/chats/${chatId}`);
      const groupRef = doc(db, `groups/${chatId}`);
      const groupMessagesRef = collection(db, `groups/${chatId}/messages`);

      const groupMessages = await getDocs(query(groupMessagesRef));
      const audioFiles = [];
      const imageFiles = [];

      groupMessages?.docs.forEach((doc) => {
        if (doc.data().audioName) {
          audioFiles.push(doc.data().audioName);
        } else if (doc.data().imageName) {
          imageFiles.push(docs.data().imageName);
        }
      });

      await Promise.all([
        deleteDoc(userChatsRef),
        deleteDoc(groupRef),
        ...groupMessages.docs.map((doc) => deleteDoc(doc.ref)),
        ...imageFiles.map((image) =>
          deleteObject(ref(storage, `images/${image}`))
        ),
        ...audioFiles.map((audio) =>
          deleteObject(ref(storage, `audio/${audio}`))
        ),
      ]);
    } catch (err) {
      console.error("Error deleting chat: ", err.message);
    } finally {
      setDeleting(false);
    }
  }

  ////////
  return (
    <div className="chat">
      <div className="chat__background" />
      <div className="chat__header">
        <div className="avatar__container">
          <Avatar src={chat.photoURL} alt={chat.name} />
        </div>
        
        <div className="chat__header--info">
          <h3>{chat.name}</h3>
        </div>

        <div className="chat__header--right">
          <input
            type="file"
            id="image"
            style={{ display: "none" }}
            accept="image/*"
            onChange={showImagePreview}
          />

          <IconButton>
            <label htmlFor="image" style={{ cursor: "pointer", height: 24 }}>
              <AddPhotoAlternate />
            </label>
          </IconButton>

          <IconButton onClick={(e) => setOpenMenu(e.currentTarget)}>
            <MoreVert />
          </IconButton>

          <Menu
            id="menu"
            anchorEl={openMenu}
            open={!!openMenu}
            onClose={() => setOpenMenu(null)}
            keepMounted
          >
            <MenuItem onClick={deleteChat}>Delete Chat</MenuItem>
          </Menu>
        </div>
      </div>

      <div className="chat__body--container">
        <div className="chat__body">
          <ChatMessages
            messages={messages}
            user={user}
            chatId={chatId}
            audioId={audioId}
            setAudioId={setAudioId}
          />
        </div>
      </div>

      <MediaPreview src={src} closePreview={closePreview} />

      <ChatFooter
        input={input}
        handleChange={(e) => setInput(e.target.value)}
        image={image}
        user={user}
        chat={chat}
        chatId={chatId}
        sendMessage={sendMessage}
        setAudioId={setAudioId}
      />

      {isDeleting && (
        <div className="chat__deleting">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default Chat;
