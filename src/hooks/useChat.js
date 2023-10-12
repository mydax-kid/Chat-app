import { db } from "@/utils/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

function useChat(chatId, userId) {
    const isUserChat = chatId.includes(userId)
    const collectionId = isUserChat ? "users" : "groups";
    //remove userId from user chat id string
    const docId = isUserChat ? chatId.replace(userId, "") : chatId;
    const [snapshot] = useDocument(docId ? doc(db, `${collectionId}/${docId}`) : null)
    
    if (!snapshot?.exists()) return null;

    return {
        id: snapshot.id,
        photoURL: snapshot.photoURL ||`https://avatars.dicebear.com/api/jdenticon/${snapshot.id}.svg`,
        ...snapshot.data()
    }
}

export default useChat;